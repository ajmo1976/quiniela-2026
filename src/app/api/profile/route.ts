import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { uploadBase64ToS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET – load the logged-in user's profile details
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    });

    console.log("[API/profile GET] Session userId:", userId);
    console.log("[API/profile GET] Session image:", session.user.image ? session.user.image.substring(0, 50) : "null");
    console.log("[API/profile GET] DB user image length:", user?.image ? user.image.length : 0);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener el perfil' }, { status: 500 });
  }
}

// PATCH – update user profile / submit payment proof
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  try {
    const body = await req.json();
    const {
      favoriteTeam,
      bankOwner,
      bankName,
      bankAccount,
      phoneNumber,
      paymentRef,
      paymentReceipt,
      image,
    } = body;

    // ---- VALIDACIÓN SERVER‑SIDE ----
    // Validate Base64 image strings (receipt and profile image) – they must be images and < 2 MB.
    const maxBase64Size = 2 * 1024 * 1024; // 2 MB in bytes
    const allowedPrefixes = [
      'data:image/jpeg',
      'data:image/png',
      'data:image/webp',
    ];
    const validateBase64Image = (data?: string | null) => {
      if (!data) return true; // nothing to validate
      if (data.startsWith('http://') || data.startsWith('https://')) return true; // already uploaded S3 URL
      // Rough size check: Base64 length ≈ 4/3 of binary size
      if (data.length * 3 / 4 > maxBase64Size) return false;
      return allowedPrefixes.some((p) => data.startsWith(p));
    };
    if (!validateBase64Image(paymentReceipt)) {
      return NextResponse.json({ success: false, error: 'Comprobante de pago no válido o demasiado grande' }, { status: 400 });
    }
    if (!validateBase64Image(image)) {
      return NextResponse.json({ success: false, error: 'Imagen de perfil no válida o demasiado grande' }, { status: 400 });
    }

    // ---- SUBIDA A AWS S3 ----
    let uploadedReceiptUrl = paymentReceipt;
    let uploadedImageUrl = image;

    const getExtensionFromMime = (base64?: string | null) => {
      if (!base64) return 'png';
      if (base64.startsWith('data:image/jpeg')) return 'jpg';
      if (base64.startsWith('data:image/webp')) return 'webp';
      return 'png';
    };

    try {
      // Subida a S3 de la foto de perfil (si es base64)
      if (image && image.startsWith('data:image/')) {
        const ext = getExtensionFromMime(image);
        const fileKey = `avatars/${userId}-${Date.now()}.${ext}`;
        uploadedImageUrl = await uploadBase64ToS3(image, fileKey);
      }

      // Subida a S3 del comprobante de pago (si es base64)
      if (paymentReceipt && paymentReceipt.startsWith('data:image/')) {
        const ext = getExtensionFromMime(paymentReceipt);
        const fileKey = `receipts/${userId}-${Date.now()}.${ext}`;
        uploadedReceiptUrl = await uploadBase64ToS3(paymentReceipt, fileKey);
      }
    } catch (s3Error: any) {
      console.error('Error uploading image to AWS S3:', s3Error);
      return NextResponse.json({
        success: false,
        error: `Error al almacenar el archivo en AWS S3: ${s3Error.message || s3Error}. Asegúrate de que el bucket de S3 esté creado con el nombre indicado en las variables de entorno.`
      }, { status: 500 });
    }

    // Load current user status
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Determine new status: if they submit a new payment reference or receipt,
    // we set it to "PENDIENTE" (so admin can review it again). If they are already "ACTIVO",
    // they can edit their profile without resetting unless they edit payment details.
    let newStatus = currentUser.status;
    const hasSubmittedPayment = paymentRef || uploadedReceiptUrl;
    if (hasSubmittedPayment && currentUser.status !== 'ACTIVO') {
      newStatus = 'PENDIENTE';
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteTeam: favoriteTeam !== undefined ? favoriteTeam : undefined,
        bankOwner: bankOwner !== undefined ? bankOwner : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        bankAccount: bankAccount !== undefined ? bankAccount : undefined,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
        paymentRef: paymentRef !== undefined ? paymentRef : undefined,
        paymentReceipt: uploadedReceiptUrl !== undefined ? uploadedReceiptUrl : undefined,
        image: uploadedImageUrl !== undefined ? uploadedImageUrl : undefined,
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}

