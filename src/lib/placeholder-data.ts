export type Event = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  description: string;
  image: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  purchasedTickets: Ticket[];
}

export type Ticket = {
  ticketId: string;
  eventId: string;
  eventName: string;
  purchaseDate: string;
  qrCodeValue: string;
}

export const events: Event[] = [
  {
    id: '1',
    name: 'Festival de Musique de Sousse',
    date: '2026-10-26',
    time: '19:00',
    location: 'Sousse, Tunisie',
    category: 'Musique',
    price: 75,
    description: 'Vivez le rythme du Sahel avec les meilleurs artistes de la région. Une célébration de trois jours de musique, de culture et d\'unité sous les étoiles.',
    image: 'event-1'
  },
  {
    id: '2',
    name: 'Journées Théâtrales de Sousse',
    date: '2026-11-12',
    time: '20:30',
    location: 'Sousse, Tunisie',
    category: 'Culture',
    price: 40,
    description: 'Un rassemblement historique de troupes de théâtre, présentant des pièces traditionnelles et contemporaines. Plongez dans le riche patrimoine culturel.',
    image: 'event-2'
  },
  {
    id: '3',
    name: 'Biennale d\'Art de Sousse',
    date: '2026-09-05',
    time: '10:00',
    location: 'Sousse, Tunisie',
    category: 'Art',
    price: 30,
    description: "La plus grande exposition d'art contemporain de la région. Découvrez des œuvres novatrices d'artistes de tout le pays et d'ailleurs.",
    image: 'event-3'
  },
  {
    id: '4',
    name: 'Sommet de l\'Innovation du Sahel',
    date: '2026-12-01',
    time: '09:00',
    location: 'Sousse, Tunisie',
    category: 'Conférence',
    price: 250,
    description: 'La première conférence technologique à Sousse. Connectez-vous avec des innovateurs, des investisseurs et des entrepreneurs qui façonnent l\'avenir de la technologie.',
    image: 'event-4'
  },
  {
    id: '5',
    name: 'Goût de Sousse',
    date: '2026-10-19',
    time: '18:00',
    location: 'Sousse, Tunisie',
    category: 'Gastronomie',
    price: 50,
    description: 'Un voyage culinaire à travers les saveurs de la Tunisie. Dégustez des plats traditionnels et une cuisine moderne des meilleurs chefs de la ville.',
    image: 'event-5'
  },
  {
    id: '9',
    name: 'Ligue 1 : Étoile Sportive du Sahel vs Club Africain',
    date: '2026-11-30',
    time: '14:30',
    location: 'Sousse, Tunisie',
    category: 'Football',
    price: 25,
    description: 'Assistez au match de football très attendu de la Ligue Professionnelle 1 tunisienne entre l\'Étoile Sportive du Sahel et le Club Africain au Stade Olympique de Sousse.',
    image: 'event-9'
  },
  {
    id: '7',
    name: 'Semaine de la Mode de Sousse',
    date: '2026-11-25',
    time: '21:00',
    location: 'Sousse, Tunisie',
    category: 'Mode',
    price: 120,
    description: 'Le summum de la mode tunisienne. Découvrez des collections époustouflantes de designers émergents et établis qui allient tradition et style avant-gardiste.',
    image: 'event-7'
  },
  {
    id: '10',
    name: 'Ligue 1 : Étoile Sportive du Sahel vs Espérance de Tunis',
    date: '2026-12-22',
    time: '16:00',
    location: 'Sousse, Tunisie',
    category: 'Football',
    price: 30,
    description: 'Un affrontement classique du football tunisien ! Ne manquez pas l\'action alors que l\'Étoile Sportive du Sahel affronte l\'Espérance Sportive de Tunis.',
    image: 'event-9'
  },
  {
    id: '11',
    name: 'Volleyball Pro A : ESS vs CS Sfaxien',
    date: '2026-11-05',
    time: '17:00',
    location: 'Salle Olympique de Sousse',
    category: 'Volleyball',
    price: 15,
    description: 'Un match au sommet entre deux géants du volleyball tunisien. L\'Étoile reçoit le CSS dans une ambiance électrique.',
    image: 'event-10' 
  },
  {
    id: '12',
    name: 'Volleyball Pro A : ESS vs Espérance de Tunis',
    date: '2026-11-19',
    time: '18:00',
    location: 'Salle Olympique de Sousse',
    category: 'Volleyball',
    price: 20,
    description: 'Le grand classique du volleyball. Venez soutenir l\'ESS dans ce choc des titans.',
    image: 'event-9'
  },
  {
    id: '13',
    name: 'Basketball Pro A : ESS vs US Monastir',
    date: '2026-12-05',
    time: '18:00',
    location: 'Salle Olympique de Sousse',
    category: 'Basketball',
    price: 20,
    description: 'Le derby du Sahel ! L\'Étoile Sportive du Sahel affronte son voisin l\'US Monastirienne pour la suprématie régionale.',
    image: 'event-10'
  },
  {
    id: '14',
    name: 'Basketball Pro A : ESS vs Club Africain',
    date: '2026-12-15',
    time: '17:00',
    location: 'Salle Olympique de Sousse',
    category: 'Basketball',
    price: 15,
    description: 'Un duel passionnant sur le parquet. L\'ESS vise la victoire face au Club Africain.',
    image: 'event-10'
  },
];

export const categories = [
  'Musique',
  'Culture',
  'Art',
  'Conférence',
  'Gastronomie',
  'Film',
  'Mode',
  'Football',
  'Volleyball',
  'Basketball',
];

export const users: User[] = [
  {
    id: 'usr_user',
    name: 'Utilisateur de Démo',
    email: 'user@evanti.com',
    photoURL: 'https://i.pravatar.cc/150?u=user@evanti.com',
    purchasedTickets: [
      { ticketId: 'TKT_1001', eventId: '1', eventName: 'Festival de Musique de Sousse', purchaseDate: '2026-07-15', qrCodeValue: 'EVENTI-1-TKT_1001-USR_USER'},
      { ticketId: 'TKT_1003', eventId: '9', eventName: 'Ligue 1 : Étoile Sportive du Sahel vs Club Africain', purchaseDate: '2026-10-20', qrCodeValue: 'EVENTI-9-TKT_1003-USR_USER' },
    ]
  },
  {
    id: 'usr_admin',
    name: 'Admin Evanti',
    email: 'admin@evanti.com',
    photoURL: 'https://i.pravatar.cc/150?u=admin@evanti.com',
    purchasedTickets: [
       { ticketId: 'TKT_2001', eventId: '2', eventName: 'Journées Théâtrales de Sousse', purchaseDate: '2026-08-01', qrCodeValue: 'EVENTI-2-TKT_2001-USR_ADMIN'}
    ]
  },
  {
    id: 'usr_superadmin',
    name: 'Super Admin Evanti',
    email: 'superadmin@evanti.com',
    photoURL: 'https://i.pravatar.cc/150?u=superadmin@evanti.com',
    purchasedTickets: []
  },
  {
    id: 'usr_gate',
    name: 'Contrôleur Porte',
    email: 'gate@evanti.com',
    photoURL: 'https://i.pravatar.cc/150?u=gate@evanti.com',
    purchasedTickets: []
  }
];
