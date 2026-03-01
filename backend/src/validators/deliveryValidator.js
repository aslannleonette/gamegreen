export const validateCreateDelivery = ({ material, weightKg }) => {
  if (!['PET', 'Aluminio', 'Papel', 'Vidro'].includes(material)) return 'Material inválido.';
  if (typeof weightKg !== 'number' || Number.isNaN(weightKg) || weightKg <= 0) return 'Peso inválido.';
  return null;
};

export const validateReviewDelivery = ({ status }) => {
  if (!['aprovado', 'rejeitado'].includes(status)) return 'Status inválido.';
  return null;
};
