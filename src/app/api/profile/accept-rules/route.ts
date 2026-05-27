import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rulesAccepted: true },
    });
    return NextResponse.json({ success: true, rulesAccepted: updatedUser.rulesAccepted });
  } catch (error) {
    console.error('Error accepting rules:', error);
    return NextResponse.json({ success: false, error: 'Error al aceptar el reglamento' }, { status: 500 });
  }
}
