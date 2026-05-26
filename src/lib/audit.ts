import crypto from "crypto";

/**
 * Genera una firma criptográfica (HMAC-SHA256) para certificar la integridad de un pronóstico.
 * 
 * @param userId ID del usuario que realiza la predicción.
 * @param matchId ID del partido pronosticado.
 * @param homeScore Marcador del equipo local.
 * @param awayScore Marcador del equipo visitante.
 * @param isDouble Si se usó comodín doble.
 * @param updatedAt Fecha de última actualización de la predicción.
 * @returns Hash hexadecimal de 64 caracteres.
 */
export function generatePredictionHash(
  userId: string,
  matchId: number,
  homeScore: number,
  awayScore: number,
  isDouble: boolean,
  updatedAt: Date
): string {
  const secret = process.env.AUDIT_SECRET_SALT || "quiniela-2026-audit-default-secret-salt";
  
  // Convertir fecha a cadena ISO estricta para garantizar coincidencia exacta de caracteres
  const dateStr = updatedAt instanceof Date ? updatedAt.toISOString() : new Date(updatedAt).toISOString();
  
  // Concatenación ordenada de los valores del registro
  const data = `${userId}-${matchId}-${homeScore}-${awayScore}-${isDouble}-${dateStr}`;
  
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}
