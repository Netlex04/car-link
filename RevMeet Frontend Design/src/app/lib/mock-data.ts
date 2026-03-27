// Mock data for CarLink application

export interface Venue {
  venueId: string;
  name: string;
  street?: string;
  zip?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
}

export interface Meet {
  meetId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  status: 'PLANNED' | 'CANCELLED' | 'DONE';
  venueId: string;
  organizerUserId: string;
  maxParticipants?: number;
  maxVisitors?: number;
  createdAt: string;
  venue: {
    name: string;
    city: string;
    country: string;
  };
}

export interface User {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface Vehicle {
  vehicleId: string;
  userId: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  powerHp?: number;
  plateOptional?: string;
  notes?: string;
}

export interface Registration {
  registrationId: string;
  meetId: string;
  userId: string;
  vehicleId?: string | null;
  role: 'PARTICIPANT' | 'VISITOR';
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  checkInAt?: string | null;
}

// Current logged-in user ID (mock)
export const CURRENT_USER_ID = 'user-123';

// Mock venues
export const mockVenues: Venue[] = [
  {
    venueId: 'venue-1',
    name: 'Nürburgring Parkplatz Nord',
    street: 'Nürburgring 1',
    zip: '53520',
    city: 'Nürburg',
    country: 'Deutschland',
    latitude: 50.3356,
    longitude: 6.9475,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    venueId: 'venue-2',
    name: 'Stuttgart Arena Parkdeck',
    street: 'Mercedesstraße 73',
    zip: '70372',
    city: 'Stuttgart',
    country: 'Deutschland',
    latitude: 48.7925,
    longitude: 9.2318,
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    venueId: 'venue-3',
    name: 'München Olympiapark',
    street: 'Spiridon-Louis-Ring 21',
    zip: '80809',
    city: 'München',
    country: 'Deutschland',
    latitude: 48.1738,
    longitude: 11.5461,
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    venueId: 'venue-4',
    name: 'Hamburg Hafencity',
    street: 'Am Sandtorkai',
    zip: '20457',
    city: 'Hamburg',
    country: 'Deutschland',
    latitude: 53.5415,
    longitude: 9.9983,
    createdAt: '2026-03-12T10:00:00Z',
  },
];

// Mock users
export const mockUsers: User[] = [
  {
    userId: CURRENT_USER_ID,
    displayName: 'Max Power',
    email: 'max@carlink.de',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    userId: 'user-456',
    displayName: 'Julia Speed',
    email: 'julia@carlink.de',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    userId: 'user-789',
    displayName: 'Tom Racer',
    email: 'tom@carlink.de',
    createdAt: '2026-02-10T10:00:00Z',
  },
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    vehicleId: 'vehicle-1',
    userId: CURRENT_USER_ID,
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2023,
    color: 'Lava Orange',
    powerHp: 525,
    plateOptional: 'S-GT 3911',
  },
  {
    vehicleId: 'vehicle-2',
    userId: CURRENT_USER_ID,
    make: 'BMW',
    model: 'M3 Competition',
    year: 2024,
    color: 'Isle of Man Green',
    powerHp: 510,
    plateOptional: 'M-PW 333',
  },
  {
    vehicleId: 'vehicle-3',
    userId: 'user-456',
    make: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    color: 'Nardo Grey',
    powerHp: 600,
    plateOptional: 'B-JS 456',
  },
  {
    vehicleId: 'vehicle-4',
    userId: 'user-789',
    make: 'Mercedes-AMG',
    model: 'GT Black Series',
    year: 2022,
    color: 'Magno Black',
    powerHp: 730,
    plateOptional: 'HH-TR 789',
  },
];

// Mock meets
export const mockMeets: Meet[] = [
  {
    meetId: 'meet-1',
    title: 'Nürburgring Nordschleife Cruise',
    description: 'Gemeinsame Ausfahrt auf der Nordschleife. Für alle GT3 und Supersportwagen. Trackday mit anschließendem BBQ.',
    startAt: '2026-04-15T09:00:00Z',
    endAt: '2026-04-15T18:00:00Z',
    status: 'PLANNED',
    venueId: 'venue-1',
    organizerUserId: 'user-456',
    maxParticipants: 30,
    maxVisitors: 50,
    createdAt: '2026-03-15T10:00:00Z',
    venue: {
      name: 'Nürburgring Parkplatz Nord',
      city: 'Nürburg',
      country: 'Deutschland',
    },
  },
  {
    meetId: 'meet-2',
    title: 'Stuttgart AMG Night',
    description: 'Exklusives AMG Treffen in Stuttgart. Nur für Mercedes-AMG Modelle. Night Cruise durch die Innenstadt.',
    startAt: '2026-04-08T19:00:00Z',
    endAt: '2026-04-08T23:59:00Z',
    status: 'PLANNED',
    venueId: 'venue-2',
    organizerUserId: CURRENT_USER_ID,
    maxParticipants: 20,
    maxVisitors: 30,
    createdAt: '2026-03-20T10:00:00Z',
    venue: {
      name: 'Stuttgart Arena Parkdeck',
      city: 'Stuttgart',
      country: 'Deutschland',
    },
  },
  {
    meetId: 'meet-3',
    title: 'München JDM Classics',
    description: 'Treffen für alle JDM Fans. Skyline, Supra, NSX, RX-7 und mehr. Foodtrucks und Chill Vibes.',
    startAt: '2026-04-22T14:00:00Z',
    endAt: '2026-04-22T22:00:00Z',
    status: 'PLANNED',
    venueId: 'venue-3',
    organizerUserId: 'user-789',
    maxParticipants: 50,
    maxVisitors: 100,
    createdAt: '2026-03-22T10:00:00Z',
    venue: {
      name: 'München Olympiapark',
      city: 'München',
      country: 'Deutschland',
    },
  },
  {
    meetId: 'meet-4',
    title: 'Hamburg Supercar Sunday',
    description: 'Supercars, Hypercars und Exoten. Offenes Treffen am Hafen mit Fotoshoot-Spots.',
    startAt: '2026-04-05T11:00:00Z',
    endAt: '2026-04-05T17:00:00Z',
    status: 'PLANNED',
    venueId: 'venue-4',
    organizerUserId: 'user-456',
    maxParticipants: 40,
    maxVisitors: 80,
    createdAt: '2026-03-18T10:00:00Z',
    venue: {
      name: 'Hamburg Hafencity',
      city: 'Hamburg',
      country: 'Deutschland',
    },
  },
  {
    meetId: 'meet-5',
    title: 'Stuttgart Spring Meet 2026',
    description: 'Großes Frühjahrs-Carmeet. Alle Marken willkommen. Live DJ, Foodtrucks, Gewinnspiele.',
    startAt: '2026-03-29T10:00:00Z',
    endAt: '2026-03-29T20:00:00Z',
    status: 'PLANNED',
    venueId: 'venue-2',
    organizerUserId: CURRENT_USER_ID,
    maxParticipants: 100,
    maxVisitors: 200,
    createdAt: '2026-03-01T10:00:00Z',
    venue: {
      name: 'Stuttgart Arena Parkdeck',
      city: 'Stuttgart',
      country: 'Deutschland',
    },
  },
];

// Mock registrations
export const mockRegistrations: Registration[] = [
  {
    registrationId: 'reg-1',
    meetId: 'meet-2',
    userId: CURRENT_USER_ID,
    vehicleId: 'vehicle-1',
    role: 'PARTICIPANT',
    status: 'CONFIRMED',
    createdAt: '2026-03-21T10:00:00Z',
  },
  {
    registrationId: 'reg-2',
    meetId: 'meet-5',
    userId: CURRENT_USER_ID,
    vehicleId: 'vehicle-2',
    role: 'PARTICIPANT',
    status: 'CONFIRMED',
    createdAt: '2026-03-02T10:00:00Z',
  },
  {
    registrationId: 'reg-3',
    meetId: 'meet-1',
    userId: 'user-456',
    vehicleId: 'vehicle-3',
    role: 'PARTICIPANT',
    status: 'CONFIRMED',
    createdAt: '2026-03-16T10:00:00Z',
  },
  {
    registrationId: 'reg-4',
    meetId: 'meet-4',
    userId: 'user-789',
    vehicleId: 'vehicle-4',
    role: 'PARTICIPANT',
    status: 'CONFIRMED',
    createdAt: '2026-03-19T10:00:00Z',
  },
  {
    registrationId: 'reg-5',
    meetId: 'meet-1',
    userId: CURRENT_USER_ID,
    vehicleId: null,
    role: 'VISITOR',
    status: 'CONFIRMED',
    createdAt: '2026-03-25T10:00:00Z',
  },
];

// Get registration count for a meet
export function getRegistrationCount(meetId: string): {
  total: number;
  participants: number;
  visitors: number;
} {
  const regs = mockRegistrations.filter(
    (r) => r.meetId === meetId && r.status === 'CONFIRMED'
  );
  
  return {
    total: regs.length,
    participants: regs.filter((r) => r.role === 'PARTICIPANT').length,
    visitors: regs.filter((r) => r.role === 'VISITOR').length,
  };
}

// Get user's registrations
export function getUserRegistrations(userId: string): Registration[] {
  return mockRegistrations.filter((r) => r.userId === userId);
}

// Get user's vehicles
export function getUserVehicles(userId: string): Vehicle[] {
  return mockVehicles.filter((v) => v.userId === userId);
}

// Get current user
export function getCurrentUser(): User {
  return mockUsers.find((u) => u.userId === CURRENT_USER_ID)!;
}
