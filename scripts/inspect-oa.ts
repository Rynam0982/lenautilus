import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const PUBLIC_KEY = process.env.OPENAGENDA_PUBLIC_KEY!;
  const AGENDA_UID = process.env.OPENAGENDA_AGENDA_UID!;

  const params = new URLSearchParams({ key: PUBLIC_KEY, size: "3" });
  const res = await fetch(`https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events?${params}`);
  const data = await res.json() as any;

  for (const ev of data.events) {
    console.log("\n=== EVENT", ev.uid, "===");
    console.log("status:", JSON.stringify(ev.status));
    console.log("state:", ev.state);
    console.log("firstTiming:", JSON.stringify(ev.firstTiming));
    console.log("lastTiming:", JSON.stringify(ev.lastTiming));
    console.log("nextTiming:", JSON.stringify(ev.nextTiming));
    console.log("image.variants[0]:", JSON.stringify(ev.image?.variants?.[0]));
    console.log("image.filename:", ev.image?.filename);
  }
}

main().catch(console.error);
