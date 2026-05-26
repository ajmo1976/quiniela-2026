import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const memberships = await prisma.leagueMember.findMany({
      where: { userId },
      include: {
        league: {
          include: {
            members: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    const leagues = memberships.map((m) => ({
      id: m.league.id,
      name: m.league.name,
      ownerId: m.league.ownerId,
      inviteCode: m.league.inviteCode,
      memberCount: m.league._count.members,
      memberIds: m.league.members.map((mem) => mem.userId),
      createdAt: m.league.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, leagues });
  } catch (error) {
    console.error('Error listing leagues:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar ligas' },
      { status: 500 }
    );
  }
}
