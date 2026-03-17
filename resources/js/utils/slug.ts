export function slugifyKebab(input: string): string {
  if (!input) {
    return '';
  }

  // Normaliza acentos e remove marcas diacríticas
  const normalized = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais restantes
    .trim()
    .replace(/\s+/g, '-') // espaços -> hífen
    .replace(/-+/g, '-'); // hífens duplicados
}

