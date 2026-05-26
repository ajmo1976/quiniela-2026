import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const ownerId = (session.user as any).id as string;

  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'memberId es requerido' },
        { status: 400 }
      );
    }

    const league = await prisma.league.findUnique({ where: { id: params.id } });

    if (!league) {
      return NextResponse.json({ success: false, error: 'Liga no encontrada' }, { status: 404 });
    }

    if (league.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, error: 'Solo el creador puede remover miembros' },
        { status: 403 }
      );
    }

    if (league.ownerId === memberId) {
      return NextResponse.json(
        { success: false, error: 'El creador no puede ser removido de la liga' },
        { status: 400 }
      );
    }

    await prisma.leagueMember.delete({
      where: {
        leagueId_userId: { leagueId: params.id, userId: memberId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ success: false, error: 'Error al remover el miembro' }, { status: 500 });
  }
}
