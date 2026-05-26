import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.APP_AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Sube una imagen en formato Base64 a un bucket de AWS S3.
 * Devuelve la URL pública del archivo subido.
 * 
 * @param base64Data Cadena en formato "data:image/jpeg;base64,..."
 * @param fileKey Nombre único del archivo en S3 (ej. "receipts/userId-timestamp.jpg")
 */
export async function uploadBase64ToS3(base64Data: string, fileKey: string): Promise<string> {
  if (!bucketName) {
    throw new Error('La variable de entorno AWS_S3_BUCKET_NAME no está configurada.');
  }

  // Parsear el prefijo Data URL
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Formato Base64 inválido. Debe ser una URI de datos (Data URL).');
  }

  const contentType = match[1];
  const base64Str = match[2];
  const buffer = Buffer.from(base64Str, 'base64');

  // Configurar los parámetros de subida
  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generar la URL pública del objeto en S3
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    return publicUrl;
  } catch (error) {
    console.error('Error al subir archivo a AWS S3:', error);
    throw new Error('No se pudo subir la imagen al almacenamiento de AWS S3.');
  }
}
