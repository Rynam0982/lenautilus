import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/utils";
import type {
  CreateEventInput,
  AdminUpdateEventInput,
} from "@/lib/validators/event";
import type { EventCardData, EventWithDetails, PaginatedResponse } from "@/types";
import type { EventStatus } from "@prisma/client";

type EventFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: string[];
  venueId?: string;
  upcoming?: boolean;
  status?: EventStatus;
  isPublic?: boolean;
};

export async function getPublicEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<EventCardData>> {
  const { page = 1, perPage = 12, search, categories, venueId, upcoming } =
    filters;
  const skip = (page - 1) * perPage;

  const where = {
    isPublic: true,
    status: "PUBLISHED" as EventStatus,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(categories?.length && {
      categories: { hasSome: categories },
    }),
    ...(venueId && { venueId }),
    ...(upcoming && { startDate: { gte: new Date() } }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        categories: true,
        isPublic: true,
        status: true,
        venue: { select: { id: true, name: true, slug: true } },
        ticketTypes: {
          select: { id: true, price: true, currency: true, quantity: true, sold: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data: events as EventCardData[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getPublicEventBySlug(
  slug: string
): Promise<EventWithDetails | null> {
  return prisma.event.findFirst({
    where: { slug, isPublic: true, status: "PUBLISHED" },
    include: {
      venue: true,
      ticketTypes: true,
      _count: { select: { tickets: true } },
    },
  }) as Promise<EventWithDetails | null>;
}

export async function getAllEventsAdmin(
  filters: EventFilters = {}
): Promise<PaginatedResponse<EventWithDetails>> {
  const { page = 1, perPage = 20, search, status } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        venue: true,
        ticketTypes: true,
        _count: { select: { tickets: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    data: events as EventWithDetails[],
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getEventByIdAdmin(
  id: string
): Promise<EventWithDetails | null> {
  return prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      ticketTypes: true,
      _count: { select: { tickets: true } },
    },
  }) as Promise<EventWithDetails | null>;
}

export async function createEvent(
  data: CreateEventInput & { adminId?: string },
  status: EventStatus = "DRAFT"
) {
  const slug = await generateUniqueSlug(data.title);
  return prisma.event.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      longDescription: data.longDescription,
      coverImage: data.coverImage,
      gallery: data.gallery,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      venueId: data.venueId,
      categories: data.categories,
      keywords: data.keywords,
      conditions: data.conditions,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      status,
      ticketTypes: {
        create: (data.ticketTypes ?? []).map((tt) => ({
          name: tt.name,
          description: tt.description,
          price: tt.price,
          quantity: tt.quantity,
          saleStartAt: tt.saleStartAt ? new Date(tt.saleStartAt) : null,
          saleEndAt: tt.saleEndAt ? new Date(tt.saleEndAt) : null,
        })),
      },
    },
    include: { venue: true, ticketTypes: true },
  });
}

export async function updateEventAdmin(data: AdminUpdateEventInput) {
  const { id, ticketTypes: _ticketTypes, ...rest } = data;
  return prisma.event.update({
    where: { id },
    data: {
      ...rest,
      ...(rest.startDate && { startDate: new Date(rest.startDate) }),
      ...(rest.endDate && { endDate: new Date(rest.endDate) }),
    },
    include: { venue: true, ticketTypes: true },
  });
}

export async function getFeaturedEvents(limit = 6): Promise<EventCardData[]> {
  const events = await prisma.event.findMany({
    where: { isPublic: true, status: "PUBLISHED", startDate: { gte: new Date() } },
    take: limit,
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      categories: true,
      isPublic: true,
      status: true,
      venue: { select: { id: true, name: true, slug: true } },
      ticketTypes: {
        select: { id: true, price: true, currency: true, quantity: true, sold: true },
      },
    },
  });
  return events as EventCardData[];
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let counter = 1;

  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
