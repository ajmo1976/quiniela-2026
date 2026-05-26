import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const { code, password } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'El código de invitación es requerido' },
        { status: 400 }
      );
    }

    const league = await prisma.league.findUnique({
      where: { inviteCode: code.toUpperCase() },
      include: { members: true },
    });

    if (!league) {
      return NextResponse.json(
        { success: false, error: 'Liga no encontrada con ese código' },
        { status: 404 }
      );
    }

    const alreadyMember = league.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      return NextResponse.json(
        { success: false, error: 'Ya eres miembro de esta liga' },
        { status: 400 }
      );
    }

    if (league.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { success: false, error: 'Esta liga requiere contraseña' },
          { status: 401 }
        );
      }
      const valid = await bcrypt.compare(password, league.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'Contraseña incorrecta' },
          { status: 401 }
        );
      }
    }

    await prisma.leagueMember.create({
      data: { leagueId: league.id, userId },
    });

    return NextResponse.json({
      success: true,
      leagueId: league.id,
      leagueName: league.name,
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json(
      { success: false, error: 'Error al unirse a la liga' },
      { status: 500 }
    );
  }
}
