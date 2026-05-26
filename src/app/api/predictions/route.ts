import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

import { generatePredictionHash } from '@/lib/audit';
import { ALL_MATCHES } from '@/app/matches/matchesData';

export const dynamic = 'force-dynamic';

// GET – load all predictions and maxScorer for a user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const currentUserId = (session.user as any).id as string;

  const url = new URL(req.url);
  const targetUserId = url.searchParams.get("userId") || currentUserId;
  const isSelf = targetUserId === currentUserId;

  try {
    const [predictions, user] = await Promise.all([
      prisma.prediction.findMany({ where: { userId: targetUserId } }),
      prisma.user.findUnique({ where: { id: targetUserId }, select: { maxScorer: true } }),
    ]);

    // Fetch live match results to check status
    const matchResults = await prisma.matchResult.findMany();
    const resultsMap: Record<number, string> = {};
    matchResults.forEach((r) => {
      resultsMap[r.matchId] = r.status;
    });

    const record: Record<number, { homeScore: string | null; awayScore: string | null; isDouble: boolean; updatedAt: string; isHidden: boolean; auditHash: string | null }> = {};
    predictions.forEach((p) => {
      const status = resultsMap[p.matchId] || "scheduled";
      const isLocked = status === "live" || status === "finished";
      const hideScore = !isSelf && !isLocked;

      record[p.matchId] = {
        homeScore: hideScore ? null : String(p.homeScore),
        awayScore: hideScore ? null : String(p.awayScore),
        isDouble: p.isDouble,
        updatedAt: p.updatedAt.toISOString(),
        isHidden: hideScore,
        auditHash: p.auditHash,
      };
    });

    const isTournamentStarted = Object.values(resultsMap).some(s => s !== "scheduled");
    const showScorer = isSelf || isTournamentStarted;

    return NextResponse.json({ 
      success: true, 
      predictions: record, 
      maxScorer: showScorer ? (user?.maxScorer || null) : null,
      isSelf 
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}

// POST – save/update a single prediction or maxScorer
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { matchId, homeScore, awayScore, isDouble, maxScorer } = body;

  // Handle maxScorer update
  if (maxScorer !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { maxScorer },
    });
    return NextResponse.json({ success: true });
  }

  if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
  }

  // Validate match kickoff time lock
  const match = ALL_MATCHES.find(m => m.id === Number(matchId));
  if (!match) {
    return NextResponse.json({ success: false, error: 'Partido no encontrado' }, { status: 404 });
  }

  const now = new Date();
  const kickoffDate = new Date(match.kickoff);
  if (now >= kickoffDate) {
    return NextResponse.json({ success: false, error: 'El partido ya ha comenzado y está cerrado para pronósticos.' }, { status: 400 });
  }
  
  // Calcular el hash de auditoría inalterable
  const hash = generatePredictionHash(
    userId,
    Number(matchId),
    Number(homeScore),
    Number(awayScore),
    Boolean(isDouble),
    now
  );

  const savedPrediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId: Number(matchId) } },
    update: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      isDouble: Boolean(isDouble),
      auditHash: hash,
      updatedAt: now,
    },
    create: {
      userId,
      matchId: Number(matchId),
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      isDouble: Boolean(isDouble),
      auditHash: hash,
      createdAt: now,
      updatedAt: now,
    },
  });

  return NextResponse.json({ success: true, updatedAt: savedPrediction.updatedAt.toISOString() });
}

// DELETE – clear all predictions and maxScorer for the authenticated user
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  await prisma.$transaction([
    prisma.prediction.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { maxScorer: null }
    })
  ]);

  return NextResponse.json({ success: true });
}


