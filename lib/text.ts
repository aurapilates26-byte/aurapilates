type HomeText = {
  hero: {
    title: string;
    subtitle: string;
    centerTitle: string;
    centerSubtitle: string;
    centerDescription: string;
    image: string;
    imageAlt: string;
  };
  sections: {
    cours: { title: string; subtitle: string };
    tarif: { title: string; subtitle: string };
    coach: { title: string; subtitle: string };
    inscription: { title: string; subtitle: string };
    faq: { title: string; subtitle: string };
    contact: { title: string; subtitle: string };
  };
};

export const homeText: HomeText = {
  hero: {
    title: "100% femmes",
    subtitle: "Bien-etre, force et progression continue.",
    centerTitle: "Aura Studio Pilates",
    centerSubtitle: "Respirez, alignez, rayonnez avec Aura Pilates.",
    centerDescription:
      "Retrouvez l'equilibre entre force et serenite dans un espace lumineux, elegant et dedie a votre bien-etre.",
    image: "/images/Amelioration continue garantie.png",
    imageAlt: "Amelioration continue garantie",
  },
  sections: {
    cours: {
      title: "Nos cours",
      subtitle: "Choisissez le cours adapte a votre objectif.",
    },
    tarif: {
      title: "Tarif",
      subtitle: "Section tarif prete pour ajouter vos formules et prix.",
    },
    coach: {
      title: "Coach",
      subtitle: "Section coach prete pour ajouter les profils.",
    },
    inscription: {
      title: "Inscription",
      subtitle: "Section inscription prete pour votre formulaire.",
    },
    faq: {
      title: "FAQ",
      subtitle: "Section FAQ prete pour ajouter les questions frequentes.",
    },
    contact: {
      title: "Contact",
      subtitle: "Section contact prete pour les informations du studio.",
    },
  },
};

export const courseContent = [
  {
    slug: "pilates-reformer",
    title: "Pilates reformer",
    cardDescription:
      "Renforcement global et precision du mouvement grace au travail sur machine.",
    cardImage: "/images/Pilates_reformer.png",
    heroImage: "/images/Pilates_reformer.png",
    galleryImage: "/images/Calme interieur et mobilite.png",
    intro:
      "Le cours Pilates Reformer est ideal pour developper la force profonde, la posture et la stabilite articulaire avec un accompagnement personnalise.",
    paragraphOne:
      "Chaque seance combine des exercices de controle, de respiration et d'alignement. La resistance du Reformer permet d'adapter le travail a chaque niveau, du debutant au pratiquant avance.",
    paragraphTwo:
      "Ce format est tres efficace pour tonifier le corps, corriger les desequilibres musculaires et progresser en securite. Vous gagnez en fluidite, en mobilite et en confiance dans vos mouvements.",
  },
  {
    slug: "mat-pilates",
    title: "Mat pilates",
    cardDescription:
      "Cours sur tapis pour renforcer le centre du corps et ameliorer la posture.",
    cardImage: "/images/Mat_pilates.png",
    heroImage: "/images/Mat_pilates.png",
    galleryImage: "/images/Fondations solides sur tapis.png",
    intro:
      "Le Mat Pilates est la base de la methode. Il se pratique au sol et met l'accent sur la respiration, le placement et le controle du centre.",
    paragraphOne:
      "Les sequences sont progressives et accessibles. Elles renforcent les abdominaux profonds, le dos et la chaine posterieure tout en respectant le rythme de chacun.",
    paragraphTwo:
      "Ce cours convient parfaitement a celles et ceux qui souhaitent construire une base solide, prevenir les douleurs de dos et retrouver un meilleur equilibre corporel au quotidien.",
  },
  {
    slug: "cours-de-yoga",
    title: "Cours de yoga",
    cardDescription:
      "Mobilite, souplesse et respiration pour equilibrer corps et esprit.",
    cardImage: "/images/Cours_de_yoga.png",
    heroImage: "/images/Cours_de_yoga.png",
    galleryImage: "/images/Calme interieur et mobilite.png",
    intro:
      "Le cours de yoga apporte une approche complementaire pour assouplir le corps, calmer le mental et mieux gerer le stress.",
    paragraphOne:
      "La pratique alterne postures, respiration consciente et moments de recentrage. Cette combinaison aide a relacher les tensions et a ameliorer la qualite du mouvement.",
    paragraphTwo:
      "En complement du Pilates, le yoga favorise la recuperation, la concentration et une meilleure conscience corporelle. C'est un excellent choix pour retrouver energie et serenite.",
  },
  {
    slug: "cours-de-dance",
    title: "Cours de dance",
    cardDescription:
      "Expression, coordination et cardio dans une ambiance dynamique.",
    cardImage: "/images/Cours_de_dance.png",
    heroImage: "/images/Cours_de_dance.png",
    galleryImage: "/images/Energie et expression en mouvement.png",
    intro:
      "Le cours de dance combine plaisir du mouvement, rythme et travail cardio pour une experience motivante et energisante.",
    paragraphOne:
      "Les choregraphies sont progressives et accessibles, avec un focus sur la coordination, la musicalite et l'expression corporelle.",
    paragraphTwo:
      "Ce cours est ideal pour se depenser, gagner en confiance et travailler l'endurance dans un cadre convivial. Il complete parfaitement les pratiques Pilates et yoga.",
  },
] as const;
