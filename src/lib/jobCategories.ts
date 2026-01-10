export interface CategoryGroup {
  name: string;
  icon: string;
  categories: string[];
}

export const JOB_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: 'BÂTIMENT & CONSTRUCTION',
    icon: '🏗️',
    categories: [
      'Maçon',
      'Maçon en banco / terre',
      'Couvreur',
      'Charpentier',
      'Menuisier bois',
      'Menuisier aluminium',
      'Menuisier métallique',
      'Plombier',
      'Chauffagiste',
      'Électricien bâtiment',
      'Électricien industriel',
      'Peintre en bâtiment',
      'Peintre décorateur',
      'Plâtrier',
      'Plaquiste',
      'Carreleur',
      'Faïencier',
      'Marbrier',
      'Vitrier / Miroitier',
      'Étancheur',
      'Façadier',
      'Poseur de faux plafonds',
    ],
  },
  {
    name: 'RÉPARATION & MAINTENANCE',
    icon: '🔧',
    categories: [
      'Réparateur téléphone',
      'Réparateur informatique',
      'Réparateur TV',
      'Réparateur électroménager',
      'Réparateur climatiseur',
      'Réparateur groupe électrogène',
      'Réparateur machines industrielles',
      'Installateur panneaux solaires',
      'Installateur systèmes de pompage',
      'Technicien fibre / internet',
    ],
  },
  {
    name: 'MÉCANIQUE & TRANSPORT',
    icon: '🚗',
    categories: [
      'Mécanicien automobile',
      'Mécanicien moto',
      'Mécanicien tricycle',
      'Mécanicien vélo',
      'Vulcanisateur',
      'Carrossier',
      'Peintre automobile',
      'Électricien auto',
      'Réparateur moteurs',
      'Chauffeur',
      'Livreur',
    ],
  },
  {
    name: 'BOIS, MÉTAL & FABRICATION',
    icon: '🪵',
    categories: [
      'Ébéniste',
      'Menuisier fabricant meubles',
      'Tourneur sur bois',
      'Sculpteur sur bois',
      'Forgeron',
      'Ferronnier',
      'Serrurier',
      'Soudeur',
      'Chaudronnier',
      'Fabricant de portails',
      'Fabricant d\'outils',
    ],
  },
  {
    name: 'COUTURE, CUIR & MODE',
    icon: '👞',
    categories: [
      'Couturier',
      'Styliste',
      'Tailleur traditionnel',
      'Brodeur',
      'Tisserand',
      'Cordonnier',
      'Maroquinier',
      'Fabricant chaussures',
      'Fabricant sacs',
    ],
  },
  {
    name: 'BEAUTÉ & BIEN-ÊTRE',
    icon: '💇',
    categories: [
      'Coiffeur',
      'Coiffeur dame',
      'Coiffeur homme / barbier',
      'Esthéticienne',
      'Maquilleur',
      'Fabricant savon',
      'Fabricant cosmétiques naturels',
      'Fabricant beurre de karité',
      'Fabricant huiles naturelles',
    ],
  },
  {
    name: 'ALIMENTATION ARTISANALE',
    icon: '🍞',
    categories: [
      'Boulanger',
      'Pâtissier',
      'Traiteur',
      'Restaurateur artisanal',
      'Boucher',
      'Charcutier',
      'Poissonnier',
      'Fromager',
      'Brasseur artisanal',
      'Fabricant jus naturels',
      'Torréfacteur café',
    ],
  },
  {
    name: 'ART, DÉCORATION & CRÉATION',
    icon: '🎨',
    categories: [
      'Peintre artistique',
      'Sculpteur',
      'Céramiste',
      'Potier',
      'Fabricant bijoux',
      'Bijoutier',
      'Orfèvre',
      'Graveur',
      'Fabricant objets décoratifs',
    ],
  },
  {
    name: 'ARTISANAT TRADITIONNEL',
    icon: '🧺',
    categories: [
      'Vannier',
      'Fabricant paniers',
      'Fabricant nattes',
      'Fabricant balais',
      'Fabricant calebasses',
      'Fabricant masques',
      'Fabricant instruments traditionnels',
      'Fabricant statues',
    ],
  },
  {
    name: 'ENVIRONNEMENT & AGRI-ARTISANAT',
    icon: '🌱',
    categories: [
      'Apiculteur',
      'Fabricant miel',
      'Fabricant charbon écologique',
      'Fabricant briquettes combustibles',
      'Recycleur artisanal',
      'Fabricant compost',
    ],
  },
  {
    name: 'SERVICES DIVERS',
    icon: '🧰',
    categories: [
      'Serrurier dépannage',
      'Déménageur artisanal',
      'Installateur antennes',
      'Installateur caméras CCTV',
      'Nettoyage professionnel',
      'Aide ménagère',
    ],
  },
  {
    name: 'SÉCURITÉ',
    icon: '🛡️',
    categories: [
      'Agent de sécurité',
      'Garde du corps',
      'Gardien',
    ],
  },
];

export const ALL_JOB_CATEGORIES: string[] = JOB_CATEGORY_GROUPS.flatMap(group => group.categories);

export function getCategoryGroup(category: string): CategoryGroup | undefined {
  return JOB_CATEGORY_GROUPS.find(group =>
    group.categories.includes(category)
  );
}

export function getCategoryIcon(category: string): string {
  const group = getCategoryGroup(category);
  return group?.icon || '🔧';
}
