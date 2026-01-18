class CategoryGroup {
  final String name;
  final String icon;
  final List<String> categories;

  CategoryGroup({
    required this.name,
    required this.icon,
    required this.categories,
  });
}

final List<CategoryGroup> jobCategoryGroups = [
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
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
  ),
  CategoryGroup(
    name: 'SÉCURITÉ',
    icon: '🛡️',
    categories: [
      'Agent de sécurité',
      'Garde du corps',
      'Gardien',
    ],
  ),
];

List<String> getAllJobCategories() {
  return jobCategoryGroups.expand((group) => group.categories).toList();
}

CategoryGroup? getCategoryGroup(String category) {
  for (var group in jobCategoryGroups) {
    if (group.categories.contains(category)) {
      return group;
    }
  }
  return null;
}

String getCategoryIcon(String category) {
  final group = getCategoryGroup(category);
  return group?.icon ?? '🔧';
}
