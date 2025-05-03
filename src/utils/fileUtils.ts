export const extractVolumeNumber = (fileName: string): string => {
  // Expression régulière pour détecter les numéros de volume
  const match = fileName.match(/(?:T|[-\s])(\d{1,2})(?=\D|$)/i);
  return match ? match[1].padStart(2, '0') : ''; // Retourne le numéro avec un zéro devant si nécessaire
};