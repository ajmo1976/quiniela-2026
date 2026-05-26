import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ACTUAL_TOP_SCORER = 'Lionel Messi';

function calcPoints(
  predictions: { matchId: number; homeScore: number; awayScore: number; isDouble: boolean }[],
  results: Map<number, { homeScore: number; awayScore: number; status: string }>,
  maxScorer: string | null
): number {
  let pts = 0;

  for (const pred of predictions) {
    const result = results.get(pred.matchId);
    if (!result || result.status !== 'finished') continue;

    const isExact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore;
    const predOutcome = pred.homeScore > pred.awayScore ? 'home' : pred.homeScore < pred.awayScore ? 'away' : 'draw';
    const realOutcome = result.homeScore > result.awayScore ? 'home' : result.homeScore < result.awayScore ? 'away' : 'draw';
    const isOutcomeCorrect = predOutcome === realOutcome;

    if (isOutcomeCorrect) {
      if (pred.isDouble) {
        pts += isExact ? 6 : 2;
      } else {
        pts += isExact ? 3 : 1;
      }
    }
  }

  if (maxScorer && maxScorer === ACTUAL_TOP_SCORER) pts += 15;

  return pts;
}

export async function GET() {
  try {
    // 1. Get all finished match results
    const matchResults = await prisma.matchResult.findMany({
      where: { status: 'finished' },
    });
    const resultsMap = new Map(
      matchResults.map((r) => [r.matchId, { homeScore: r.homeScore, awayScore: r.awayScore, status: r.status }])
    );

    // 2. Get all users with their predictions
    const users = await prisma.user.findMany({
      include: { predictions: true },
    });

    // 3. Calculate points for each user
    const leaderboard = users
      .map((user) => ({
        id: user.id,
        name: user.name ?? 'Usuario',
        image: user.image ?? null,
        email: user.email,
        points: calcPoints(user.predictions, resultsMap, user.maxScorer),
        predictionCount: user.predictions.length,
      }))
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener el ranking' }, { status: 500 });
  }
}
