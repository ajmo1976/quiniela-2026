import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET – all match results
export async function GET() {
  const results = await prisma.matchResult.findMany();
  const record: Record<number, { homeScore: number | null; awayScore: number | null; status: string }> = {};
  results.forEach((r) => {
    record[r.matchId] = {
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      status: r.status,
    };
  });
  return NextResponse.json({ success: true, results: record });
}

// POST – upsert a match result (used by admin simulator)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  const { matchId, homeScore, awayScore, status } = await req.json();

  if (matchId === undefined) {
    return NextResponse.json({ success: false, error: 'matchId requerido' }, { status: 400 });
  }

  const result = await prisma.matchResult.upsert({
    where: { matchId: Number(matchId) },
    update: {
      homeScore: homeScore !== null ? Number(homeScore) : 0,
      awayScore: awayScore !== null ? Number(awayScore) : 0,
      status: status ?? 'scheduled',
    },
    create: {
      matchId: Number(matchId),
      homeScore: homeScore !== null ? Number(homeScore) : 0,
      awayScore: awayScore !== null ? Number(awayScore) : 0,
      status: status ?? 'scheduled',
    },
  });

  return NextResponse.json({ success: true, result });
}

// DELETE – delete all match results (reset simulation)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  await prisma.matchResult.deleteMany({});
  return NextResponse.json({ success: true });
}

