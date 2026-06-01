import type {
  User,
  ArtistProfile,
  Venue,
  Event,
  TicketType,
  Ticket,
  VenueReservation,
  AuditLog,
  Role,
  EventStatus,
  ReservationStatus,
  TicketStatus,
} from "@prisma/client";

// Re-export prisma types
export type {
  User,
  ArtistProfile,
  Venue,
  Event,
  TicketType,
  Ticket,
  VenueReservation,
  AuditLog,
  Role,
  EventStatus,
  ReservationStatus,
  TicketStatus,
};

// Composite types for API responses
export type EventWithDetails = Event & {
  venue: Venue;
  ticketTypes: TicketType[];
  _count?: { tickets: number };
};

export type EventCardData = Pick<
  Event,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "coverImage"
  | "startDate"
  | "endDate"
  | "categories"
  | "isPublic"
  | "status"
> & {
  venue: Pick<Venue, "id" | "name" | "slug">;
  ticketTypes: Pick<TicketType, "id" | "price" | "currency" | "quantity" | "sold">[];
};

export type VenueWithEvents = Venue & {
  events: EventCardData[];
  _count?: { events: number; reservations: number };
};

export type ReservationWithDetails = VenueReservation & {
  venue: Venue;
  artist: ArtistProfile & { user: Pick<User, "id" | "name" | "email" | "image"> };
  event?: Event | null;
};

export type TicketWithEvent = Ticket & {
  event: Event & { venue: Venue };
  ticketType: TicketType;
};

export type UserWithProfile = User & {
  artistProfile?: ArtistProfile | null;
};

// API response shapes
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Pagination
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

// OpenAgenda types
export type OpenAgendaEvent = {
  uid: number;
  slug: string;
  title: { fr?: string; en?: string };
  description: { fr?: string; en?: string };
  longDescription?: { fr?: string; en?: string };
  conditions?: { fr?: string; en?: string };
  keywords?: { fr?: string; en?: string };
  image?: {
    base: string;
    full: string;
    thumbnail: string;
  };
  timings: Array<{ begin: string; end: string }>;
  location?: {
    uid: number;
    name: string;
    address: string;
    city: string;
  };
  status: number;
  state: number;
  categories?: string[];
  createdAt: string;
  updatedAt: string;
};

export type OpenAgendaLocation = {
  uid: number;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};
