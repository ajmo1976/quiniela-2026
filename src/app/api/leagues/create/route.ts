import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const { name, password } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la liga es requerido' },
        { status: 400 }
      );
    }

    const inviteCode = generateInviteCode();

    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const league = await prisma.league.create({
      data: {
        name,
        inviteCode,
        passwordHash,
        ownerId: userId,
        members: {
          create: { userId },
        },
      },
    });

    return NextResponse.json({
      success: true,
      leagueId: league.id,
      inviteCode: league.inviteCode,
    });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la liga' },
      { status: 500 }
    );
  }
}
