export const METIER_TO_CATEGORY_MAP: Record<string, string[]> = {
  'Électricien': ['Électricité'],
  'Plombier': ['Plomberie'],
  'Maçon': ['Maçonnerie'],
  'Menuisier': ['Menuiserie'],
  'Menuisier métallique': ['Menuiserie'],
  'Peintre': ['Peinture'],
  'Carreleur': ['Carrelage'],
  'Couvreur': ['Toiture'],
  'Chauffagiste': ['Chauffage'],
  'Soudeur': ['Soudure'],
  'Mécanicien': ['Mécanique'],
  'Électromécanicien': ['Électricité', 'Mécanique'],
  'Couturier': ['Couture'],
  'Couturière': ['Couture'],
  'couturiere': ['Couture'],
  'Vitrier': ['Vitrage'],
  'Jardinier': ['Jardinage'],
};

export function getJobCategoriesForMetiers(metiers: string[]): string[] {
  const categories = new Set<string>();

  metiers.forEach(metier => {
    const mappedCategories = METIER_TO_CATEGORY_MAP[metier];
    if (mappedCategories) {
      mappedCategories.forEach(cat => categories.add(cat));
    } else {
      categories.add(metier);
    }
  });

  return Array.from(categories);
}
