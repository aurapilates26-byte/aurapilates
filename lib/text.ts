type HomeText = {
  hero: {
    title: string;
    subtitle: string;
    centerTitle: string;
    centerSubtitle: string;
    image: string;
    imageAlt: string;
  };
  sections: {
    cours: { kicker: string; title: string; subtitle: string };
    tarif: { kicker: string; title: string; subtitle: string };
    coach: { kicker: string; title: string; subtitle: string };
    planning: { kicker: string; title: string; subtitle: string };
    inscription: { title: string; subtitle: string };
    temoignages: { kicker: string; title: string; subtitle: string };
    faq: { kicker: string; title: string; subtitle: string };
  };
};

export const homeText: HomeText = {
  hero: {
    title: "100% femmes",
    subtitle: "Bien-être, force et progression continue.",
    centerTitle: "Aura Studio Pilates",
    centerSubtitle: "Respirez, alignez, rayonnez avec Aura Pilates.",
    image: "/images/Amelioration continue garantie.png",
    imageAlt: "Amélioration continue garantie",
  },
  sections: {
    cours: {
      kicker: "Cours",
      title: "Des cours pensés pour votre progression",
      subtitle: "Pilates yoga et danse pour progresser chaque semaine en confiance",
    },
    tarif: {
      kicker: "Tarifs",
      title: "Des formules simples pour avancer sans stress",
      subtitle: "Au mois ou à la séance choisissez votre pack sans mauvaise surprise",
    },
    coach: {
      kicker: "Coach",
      title: "Une équipe à votre écoute",
      subtitle: "Une approche experte et bienveillante pour chaque pratiquante",
    },
    planning: {
      kicker: "Planning",
      title: "Tous vos créneaux en un coup d'œil",
      subtitle: "Jour heure et niveau puis réservation depuis votre espace membre",
    },
    inscription: {
      title: "Prête à commencer votre pratique ?",
      subtitle: "Rejoignez le studio avec un accueil personnalisé dès votre premier cours",
    },
    temoignages: {
      kicker: "Témoignages",
      title: "Ce que nos clientes disent",
      subtitle: "Des avis authentiques pour imaginer votre place au studio",
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
];

export const courseContent = [
  {
    slug: "pilates-reformer",
    title: "Pilates reformer",
    cardDescription:
      "Renforcement global et précision du mouvement grâce au travail sur machine.",
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
    title: "Mat pilates",
    cardDescription:
      "Cours sur tapis pour renforcer le centre du corps et améliorer la posture.",
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
      "Mobilité, souplesse et respiration pour équilibrer corps et esprit.",
    cardImage: "/images/Cours_de_yoga.png",
    heroImage: "/images/Cours_de_yoga.png",
    galleryImage: "/images/Calme interieur et mobilite.png",
    intro:
      "Le cours de yoga apporte une approche complémentaire pour assouplir le corps, calmer le mental et mieux gérer le stress.",
    paragraphOne:
      "La pratique alterne postures, respiration consciente et moments de recentrage. Cette combinaison aide à relâcher les tensions et à améliorer la qualité du mouvement.",
    paragraphTwo:
      "En complément du Pilates, le yoga favorise la récupération, la concentration et une meilleure conscience corporelle. C'est un excellent choix pour retrouver énergie et sérénité.",
  },
  {
    slug: "cours-de-dance",
    title: "Danse",
    cardDescription:
      "Expression, coordination et cardio dans une ambiance dynamique.",
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
] as const;
