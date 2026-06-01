import type { OpenAgendaEvent, OpenAgendaLocation } from "@/types";

const BASE_URL = "https://api.openagenda.com/v2";

class OpenAgendaClient {
  private publicKey: string;
  private secretKey: string;
  private agendaUid: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.publicKey = process.env.OPENAGENDA_PUBLIC_KEY ?? "";
    this.secretKey = process.env.OPENAGENDA_SECRET_KEY ?? "";
    this.agendaUid = process.env.OPENAGENDA_AGENDA_UID ?? "";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const res = await fetch(`${BASE_URL}/requestAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: this.secretKey }),
    });

    if (!res.ok) throw new Error(`OpenAgenda auth failed: ${res.status}`);

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  async fetchAllEvents(
    page = 1,
    size = 100
  ): Promise<{ events: OpenAgendaEvent[]; total: number }> {
    const params = new URLSearchParams({
      key: this.publicKey,
      size: String(size),
      from: String((page - 1) * size),
    });

    const res = await fetch(
      `${BASE_URL}/agendas/${this.agendaUid}/events?${params}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
    const data = (await res.json()) as {
      events: OpenAgendaEvent[];
      total: number;
    };
    return data;
  }

  async fetchAllEventsPaginated(): Promise<OpenAgendaEvent[]> {
    const all: OpenAgendaEvent[] = [];
    let page = 1;
    const size = 100;

    while (true) {
      const { events, total } = await this.fetchAllEvents(page, size);
      all.push(...events);
      if (all.length >= total) break;
      page++;
    }

    return all;
  }

  async createEvent(
    payload: Partial<OpenAgendaEvent>
  ): Promise<OpenAgendaEvent> {
    const token = await this.getAccessToken();
    const res = await fetch(
      `${BASE_URL}/agendas/${this.agendaUid}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": token,
        },
        body: JSON.stringify({ data: payload }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to create OA event: ${res.status} — ${error}`);
    }

    const data = (await res.json()) as { event: OpenAgendaEvent };
    return data.event;
  }

  async updateEvent(
    uid: number,
    payload: Partial<OpenAgendaEvent>
  ): Promise<OpenAgendaEvent> {
    const token = await this.getAccessToken();
    const res = await fetch(
      `${BASE_URL}/agendas/${this.agendaUid}/events/${uid}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "access-token": token,
        },
        body: JSON.stringify({ data: payload }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to update OA event: ${res.status} — ${error}`);
    }

    const data = (await res.json()) as { event: OpenAgendaEvent };
    return data.event;
  }

  async deleteEvent(uid: number): Promise<void> {
    const token = await this.getAccessToken();
    const res = await fetch(
      `${BASE_URL}/agendas/${this.agendaUid}/events/${uid}`,
      {
        method: "DELETE",
        headers: { "access-token": token },
      }
    );

    if (!res.ok) throw new Error(`Failed to delete OA event: ${res.status}`);
  }

  async fetchLocations(): Promise<OpenAgendaLocation[]> {
    const params = new URLSearchParams({ key: this.publicKey });
    const res = await fetch(
      `${BASE_URL}/agendas/${this.agendaUid}/locations?${params}`
    );
    if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`);
    const data = (await res.json()) as { locations: OpenAgendaLocation[] };
    return data.locations;
  }
}

export const openAgendaClient = new OpenAgendaClient();
