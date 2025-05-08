// @todo : ce n'est pas impossible que les tomes soient aussi en centaines. Il faudrait alors avoir une logique pour déterminer le nombre de 0 à mettre.
export const extractVolumeNumber = (fileName: string): string => {
  const match = fileName.match(/(?:^|\D)(?:v(?:ol(?:ume)?)?\.?|t(?:ome)?\.?)\s*0*(\d{1,3})(?!\d)/i);
  return match ? match[1].padStart(2, '0') : '';
};