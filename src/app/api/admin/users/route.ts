import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET – return all users with profile and payment details (Admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        favoriteTeam: true,
        bankOwner: true,
        bankName: true,
        bankAccount: true,
        phoneNumber: true,
        paymentRef: true,
        paymentReceipt: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// PATCH – update a user's participation status (Approve / Reject) or system role (USER / ADMIN)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, status, role } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    const updateData: any = {};

    if (status !== undefined) {
      if (!['PENDIENTE', 'ACTIVO', 'RECHAZADO'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Estatus inválido' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (role !== undefined) {
      if (!['USER', 'ADMIN'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Rol inválido' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'Debe especificar status o role a actualizar' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user status or role:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar usuario' }, { status: 500 });
  }
}
