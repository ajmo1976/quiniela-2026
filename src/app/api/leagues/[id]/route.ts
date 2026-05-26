import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const league = await prisma.league.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
        _count: { select: { members: true } },
      },
    });

    if (!league) {
      return NextResponse.json({ success: false, error: 'Liga no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
        ownerId: league.ownerId,
        inviteCode: league.inviteCode,
        memberCount: league._count.members,
        memberIds: league.members.map((m) => m.userId),
        members: league.members.map((m) => ({
          userId: m.userId,
          name: m.user?.name ?? 'Usuario',
          image: m.user?.image ?? null,
          email: m.user?.email ?? '',
        })),
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

