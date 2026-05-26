import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { ALL_MATCHES } from '@/app/matches/matchesData';
import { generatePredictionHash } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Helper to determine if a match has started based on simulated DB status and real kickoff time
function isMatchStarted(matchDateStr: string, matchTimeStr: string, matchStatusFromDb?: string): boolean {
  if (matchStatusFromDb === 'live' || matchStatusFromDb === 'finished') {
    return true;
  }

  try {
    const months: Record<string, number> = {
      "ENE": 0, "FEB": 1, "MAR": 2, "ABR": 3, "MAY": 4, "JUN": 5,
      "JUL": 6, "AGO": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DIC": 11
    };
    
    // Parse date: "11 JUN"
    const dateParts = matchDateStr.trim().split(/\s+/);
    const day = parseInt(dateParts[0]);
    const monthStr = dateParts[1].toUpperCase();
    const month = months[monthStr] !== undefined ? months[monthStr] : 5; // Default to June

    // Parse time: "3:00 PM"
    const timeParts = matchTimeStr.trim().split(/\s+/);
    const hm = timeParts[0].split(':');
    let hours = parseInt(hm[0]);
    const minutes = parseInt(hm[1]);
    const ampm = timeParts[1].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    // We assume the kickoff dates are in the year 2026
    const kickoff = new Date(2026, month, day, hours, minutes);
    return Date.now() >= kickoff.getTime();
  } catch (err) {
    console.error("Error parsing match kickoff date:", err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Public audit allows unauthenticated users to browse?
  // It's safer to require being logged in to prevent scraping and restrict access to players
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const currentUserId = (session.user as any).id as string;

  const url = new URL(req.url);
  const targetUserId = url.searchParams.get("userId");

  try {
    // Scenario 1: No userId provided -> return all active users list
    if (!targetUserId) {
      const users = await prisma.user.findMany({
        where: {
          status: 'ACTIVO' // Only active participants are part of the public audit
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          status: true,
          role: true,
          _count: {
            select: { predictions: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return NextResponse.json({ success: true, users });
    }

    // Scenario 2: targetUserId provided -> return all predictions with audit details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        maxScorer: true,
        status: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Load predictions
    const predictions = await prisma.prediction.findMany({
      where: { userId: targetUserId }
    });

    // Load simulated match results
    const matchResults = await prisma.matchResult.findMany();
    const resultsMap: Record<number, string> = {};
    matchResults.forEach((r) => {
      resultsMap[r.matchId] = r.status;
    });

    const isSelf = targetUserId === currentUserId;

    // Determine if tournament started for maxScorer visibility
    const isTournamentStarted = Object.values(resultsMap).some(s => s !== "scheduled");
    const showScorer = isSelf || isTournamentStarted;

    const auditedPredictions = ALL_MATCHES.map((match) => {
      const pred = predictions.find(p => p.matchId === match.id);
      const dbStatus = resultsMap[match.id] || "scheduled";
      const started = isMatchStarted(match.date, match.time, dbStatus);
      const isLocked = dbStatus === 'live' || dbStatus === 'finished' || started;

      // Hiding mechanism: hide if it's not self and the match hasn't started yet
      const hideScores = !isSelf && !isLocked;

      if (!pred) {
        return {
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          time: match.time,
          group: match.group,
          status: dbStatus,
          isLocked,
          hasPredicted: false,
          homeScore: null,
          awayScore: null,
          isDouble: false,
          updatedAt: null,
          auditHash: null,
          isHashValid: null
        };
      }

      // Cryptographic verification check
      const computedHash = generatePredictionHash(
        pred.userId,
        pred.matchId,
        pred.homeScore,
        pred.awayScore,
        pred.isDouble,
        pred.updatedAt
      );

      const isHashValid = pred.auditHash ? (computedHash === pred.auditHash) : false;

      return {
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        date: match.date,
        time: match.time,
        group: match.group,
        status: dbStatus,
        isLocked,
        hasPredicted: true,
        homeScore: hideScores ? null : pred.homeScore,
        awayScore: hideScores ? null : pred.awayScore,
        isDouble: hideScores ? false : pred.isDouble,
        updatedAt: pred.updatedAt.toISOString(),
        auditHash: pred.auditHash,
        isHashValid: pred.auditHash ? isHashValid : false
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        ...targetUser,
        maxScorer: showScorer ? targetUser.maxScorer : null,
        isMaxScorerHidden: !showScorer && !!targetUser.maxScorer
      },
      predictions: auditedPredictions,
      isSelf
    });
  } catch (error) {
    console.error("Error fetching audit data:", error);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
