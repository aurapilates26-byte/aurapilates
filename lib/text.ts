type HeroHeadingLine = {
  text: string;
  weight: "bold" | "normal";
};

type HeroFeature = {
  title: string;
  subtitle: string;
};

type HomeText = {
  hero: {
    headingLines: HeroHeadingLine[];
    description: string;
    primaryCta: string;
    secondaryCta: string;
    feminineTagline: string;
    image: string;
    imageAlt: string;
    features: HeroFeature[];
  };
  sections: {
    about: {
      kicker: string;
      title: string;
      paragraphs: string[];
      cta: string;
      image: string;
      imageAlt: string;
    };
    cours: { kicker: string; title: string; subtitle: string };
    tarif: { kicker: string; title: string; subtitle: string };
    coach: { kicker: string; title: string; subtitle: string };
    planning: { kicker: string; title: string; subtitle: string };
    inscription: { title: string; subtitle: string };
    temoignages: { kicker: string; title: string; subtitle: string };
    ready: {
      title: string;
      subtitle: string;
      cta: string;
      image: string;
      imageAlt: string;
    };
    faq: { kicker: string; title: string; subtitle: string };
  };
};

export const homeText: HomeText = {
  hero: {
    headingLines: [
      { text: "Votre moment.", weight: "bold" },
      { text: "Votre équilibre.", weight: "normal" },
      { text: "Votre Aura.", weight: "bold" },
    ],
    description:
      "Pilates Reformer, Mat Pilates et Yoga. Des cours pensés pour renforcer votre corps, apaiser votre esprit et révéler votre énergie.",
    primaryCta: "Réserver une séance",
    secondaryCta: "Découvrir nos cours",
    feminineTagline: "Un studio 100% féminin",
    image: "/images/hero.png",
    imageAlt: "Studio Aura Pilates",
    features: [
      {
        title: "Exclusivement féminin",
        subtitle: "Un espace bienveillant rien que pour vous.",
      },
      {
        title: "Encadrement personnalisé",
        subtitle: "Des coachs à votre écoute et attentifs à vos besoins.",
      },
      {
        title: "Équipements premium",
        subtitle: "Des équipements haut de gamme pour une pratique sûre et efficace.",
      },
      {
        title: "Bien-être global",
        subtitle: "Un équilibre entre force, mobilité et sérénité.",
      },
    ],
  },
  sections: {
    about: {
      kicker: "À propos d'Aura",
      title: "Plus qu'un studio",
      paragraphs: [
        "Aura Pilates est un espace entièrement dédié au bien-être des femmes, où mouvement, respiration et harmonie se rencontrent.",
        "Au cœur d'un cadre chaleureux et élégant, notre équipe vous accueille pour une pratique exigeante et bienveillante, adaptée à votre rythme et à vos besoins.",
      ],
      cta: "Découvrir notre histoire",
      image: "/images/aprops.png",
      imageAlt: "Intérieur du studio Aura Pilates",
    },
    cours: {
      kicker: "Nos cours",
      title: "Des cours pensés pour votre progression",
      subtitle: "Pilates, yoga et danse pour progresser chaque semaine en confiance",
    },
    tarif: {
      kicker: "Tarifs",
      title: "Des formules simples pour avancer sans stress",
      subtitle: "Au mois ou à la séance, choisissez votre pack sans mauvaise surprise",
    },
    coach: {
      kicker: "Coach",
      title: "Une équipe à votre écoute",
      subtitle: "Une approche experte et bienveillante pour chaque pratiquante",
    },
    planning: {
      kicker: "Planning",
      title: "Tous vos créneaux en un coup d'œil",
      subtitle: "Parcourez les séances de la période : horaire, coach et niveau, puis réservez en ligne.",
    },
    inscription: {
      title: "Prête à commencer votre pratique ?",
      subtitle: "Rejoignez le studio avec un accueil personnalisé dès votre premier cours",
    },
    temoignages: {
      kicker: "Elles parlent d'Aura",
      title: "Vos mots, notre plus belle récompense",
      subtitle: "",
    },
    ready: {
      title: "Prête à prendre du temps pour vous ?",
      subtitle: "Réservez votre première séance et découvrez l'expérience Aura.",
      cta: "Réserver une séance",
      image: "/images/pretes.png",
      imageAlt: "Moment de bien-être au studio Aura Pilates",
    },
    faq: {
      kicker: "FAQ",
      title: "Questions fréquentes",
      subtitle: "Les infos essentielles avant votre première venue au studio",
    },
  },
};

export type HomeTestimonial = {
  initials: string;
  name: string;
  quote: string;
};

/** Aperçus pour la section publique (prénoms tunisiens, texte factice). */
export const homeTestimonials: HomeTestimonial[] = [
  {
    initials: "AR",
    name: "Amira R.",
    quote:
      "Studio accueillant et coaching à l'écoute. En quelques semaines, j'ai senti mon dos plus détendu et ma posture plus solide au quotidien.",
  },
  {
    initials: "YM",
    name: "Yosra M.",
    quote:
      "Les séances sont progressives et bien expliquées. Je me sens plus confiante dans les mouvements, même en débutant.",
  },
  {
    initials: "SB",
    name: "Selma B.",
    quote:
      "Un cadre calme et féminin comme je le cherchais. Les cours au Reformer m'ont aidée à mieux tenir ma posture au travail.",
  },
  {
    initials: "LK",
    name: "Lina K.",
    quote:
      "Une ambiance douce et professionnelle. Chaque séance est un vrai moment pour moi, entre renforcement et détente.",
  },
];

export const courseContent = [
  {
    slug: "pilates-reformer",
    title: "Pilates Reformer",
    cardDescription:
      "Renforcez votre corps en profondeur, améliorez votre posture et gagnez en stabilité grâce au travail sur machine.",
    cardImage: "/images/Pilates_reformer.png",
    heroImage: "/images/Pilates_reformer.png",
    galleryImage: "/images/Calme interieur et mobilite.png",
    intro:
      "Le cours Pilates Reformer est idéal pour développer la force profonde, la posture et la stabilité articulaire avec un accompagnement personnalisé.",
    paragraphOne:
      "Chaque séance combine des exercices de contrôle, de respiration et d'alignement. La résistance du Reformer permet d'adapter le travail à chaque niveau, du débutant à la pratiquante avancée.",
    paragraphTwo:
      "Ce format est très efficace pour tonifier le corps, corriger les déséquilibres musculaires et progresser en sécurité. Vous gagnez en fluidité, en mobilité et en confiance dans vos mouvements.",
  },
  {
    slug: "mat-pilates",
    title: "Mat Pilates",
    cardDescription:
      "Renforcez votre centre, améliorez votre posture et gagnez en mobilité avec des exercices au sol accessibles à tous les niveaux.",
    cardImage: "/images/Mat_pilates.png",
    heroImage: "/images/Mat_pilates.png",
    galleryImage: "/images/Fondations solides sur tapis.png",
    intro:
      "Le Mat Pilates est la base de la méthode. Il se pratique au sol et met l'accent sur la respiration, le placement et le contrôle du centre.",
    paragraphOne:
      "Les séquences sont progressives et accessibles. Elles renforcent les abdominaux profonds, le dos et la chaîne postérieure tout en respectant le rythme de chacune.",
    paragraphTwo:
      "Ce cours convient parfaitement à celles qui souhaitent construire une base solide, prévenir les douleurs de dos et retrouver un meilleur équilibre corporel au quotidien.",
  },
  {
    slug: "cours-de-yoga",
    title: "Yoga",
    cardDescription:
      "Détendez votre corps, améliorez votre souplesse et retrouvez un équilibre intérieur grâce à la respiration et au mouvement.",
    cardImage: "/images/Cours_de_yoga.png",
    heroImage: "/images/Cours_de_yoga.png",
    galleryImage: "/images/Calme interieur et mobilite.png",
    intro:
      "Le cours de yoga apporte une approche complémentaire pour assouplir le corps, calmer le mental et mieux gérer le stress.",
    paragraphOne:
      "La pratique alterne postures, respiration consciente et moments de recentrage. Cette combinaison aide à relâcher les tensions et à améliorer la qualité du mouvement.",
    paragraphTwo:
      "En complément du Pilates, le yoga favorise la récupération, la concentration et une meilleure conscience corporelle. C'est un excellent choix pour retrouver de l'énergie et de la sérénité.",
  },
  {
    slug: "cours-de-dance",
    title: "Danse",
    cardDescription:
      "Exprimez-vous en mouvement, travaillez votre coordination et libérez votre énergie dans une ambiance dynamique et motivante.",
    cardImage: "/images/Cours_de_dance.png",
    heroImage: "/images/Cours_de_dance.png",
    galleryImage: "/images/Energie et expression en mouvement.png",
    intro:
      "Le cours de danse combine plaisir du mouvement, rythme et travail cardio pour une expérience motivante et énergisante.",
    paragraphOne:
      "Les chorégraphies sont progressives et accessibles, avec une attention particulière portée à la coordination, à la musicalité et à l'expression corporelle.",
    paragraphTwo:
      "Ce cours est idéal pour se dépenser, gagner en confiance et travailler l'endurance dans un cadre convivial. Il complète parfaitement les pratiques Pilates et yoga.",
  },
  {
    slug: "coaching-prive",
    title: "Coaching privé",
    cardDescription:
      "Un accompagnement sur mesure, en solo ou en duo, pour cibler vos objectifs avec un suivi attentif et des progrès visibles.",
    cardImage: "/images/coachinPrivé.png",
    heroImage: "/images/coachinPrivé.png",
    galleryImage: "/images/coachinPrivé.png",
    intro:
      "Le coaching privé vous offre une séance entièrement personnalisée, adaptée à votre niveau, vos besoins et vos objectifs.",
    paragraphOne:
      "En solo ou en duo, vous bénéficiez d'un suivi individualisé : correction des mouvements, progression à votre rythme et programme ajusté séance après séance.",
    paragraphTwo:
      "Ce format est idéal pour débuter en confiance, retrouver la forme après une pause, travailler un objectif précis ou simplement profiter d'un moment rien que pour vous.",
  },
] as const;

export const planningPageText = {
  title: "Planning",
  subtitle: "Trouvez votre moment.",
  description:
    "Découvrez nos cours et réservez votre séance en quelques clics. Nous avons hâte de vous accueillir au studio.",
  features: [
    {
      title: "Cours en petits groupes",
      subtitle: "Pour un accompagnement personnalisé",
    },
    {
      title: "Réservation simple et rapide",
      subtitle: "En ligne, 24h/24 et 7j/7",
    },
  ] as const,
  tips: [
    {
      title: "Arrivez 10 minutes avant",
      subtitle: "votre cours pour profiter pleinement de votre séance.",
    },
    {
      title: "Tenue confortable",
      subtitle: "et chaussettes antidérapantes recommandées.",
    },
    {
      title: "Annulation possible",
      subtitle: "jusqu'à 12h avant le cours depuis votre espace.",
    },
    {
      title: "Des questions ?",
      subtitle: "Notre équipe est là pour vous aider.",
    },
  ] as const,
};
