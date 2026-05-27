import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const matchResults = await prisma.matchResult.findMany({
      where: { status: 'finished' },
    });
    const resultsMap = new Map(
      matchResults.map((r) => [r.matchId, { homeScore: r.homeScore, awayScore: r.awayScore, status: r.status }])
    );

    const league = await prisma.league.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              include: {
                predictions: true,
              },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!league) {
      return NextResponse.json({ success: false, error: 'Liga no encontrada' }, { status: 404 });
    }

    const membersWithPoints = league.members.map((m) => {
      const user = m.user;
      const points = user ? calcPoints(user.predictions, resultsMap, user.maxScorer) : 0;
      return {
        userId: m.userId,
        name: user?.name ?? 'Usuario',
        image: user?.image ?? null,
        email: user?.email ?? '',
        points,
      };
    });

    membersWithPoints.sort((a, b) => b.points - a.points);

    const rankedMembers = membersWithPoints.map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
        ownerId: league.ownerId,
        inviteCode: league.inviteCode,
        memberCount: league._count.members,
        memberIds: league.members.map((m) => m.userId),
        members: rankedMembers,
        createdAt: league.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener la liga' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const league = await prisma.league.findUnique({ where: { id: params.id } });

    if (!league) {
      return NextResponse.json({ success: false, error: 'Liga no encontrada' }, { status: 404 });
    }

    if (league.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Solo el creador puede eliminar la liga' },
        { status: 403 }
      );
    }

    // Check if there are other participants
    const memberCount = await prisma.leagueMember.count({
      where: { leagueId: params.id },
    });

    if (memberCount > 1) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar la liga porque hay otros participantes' },
        { status: 400 }
      );
    }

    await prisma.league.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar la liga' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { name } = await req.json();

  if (!name || name.trim() === '') {
    return NextResponse.json({ success: false, error: 'Nombre de liga inválido' }, { status: 400 });
  }

  try {
    const league = await prisma.league.findUnique({ where: { id: params.id } });

    if (!league) {
      return NextResponse.json({ success: false, error: 'Liga no encontrada' }, { status: 404 });
    }

    if (league.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Solo el creador puede renombrar la liga' },
        { status: 403 }
      );
    }

    await prisma.league.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar la liga' }, { status: 500 });
  }
}

