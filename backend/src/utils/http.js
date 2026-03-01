export const badRequest = (res, message) => res.status(400).json({ message });
export const forbidden = (res, message = 'Acesso negado.') => res.status(403).json({ message });
export const unauthorized = (res, message = 'Não autenticado.') => res.status(401).json({ message });
