import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  // Fetch ALL fields including conditions, using the detailed format
  const res = await fetch(
    `https://api.openagenda.com/v2/agendas/${process.env.OPENAGENDA_AGENDA_UID}/events?key=${process.env.OPENAGENDA_PUBLIC_KEY}&size=5&detailed=1`
  );
  const data = await res.json() as any;

  console.log("Full event keys:", Object.keys(data.events[0] || {}).join(", "));
  console.log("\nAll fields of first event:");
  const ev = data.events[0];
  for (const [k, v] of Object.entries(ev)) {
    const val = typeof v === 'object' ? JSON.stringify(v)?.slice(0, 120) : v;
    console.log(`  ${k}: ${val}`);
  }

  // Also check an event we KNOW has a price (from the screenshot: 5€/6€)
  // Search for the specific event shown in screenshot
  const res2 = await fetch(
    `https://api.openagenda.com/v2/agendas/${process.env.OPENAGENDA_AGENDA_UID}/events?key=${process.env.OPENAGENDA_PUBLIC_KEY}&size=100`
  );
  const data2 = await res2.json() as any;

  console.log("\n\nSearching for events with price info...");
  for (const e of data2.events) {
    const cond = e.conditions;
    const regis = e.registration;
    if (cond || regis) {
      console.log(`UID: ${e.uid} | Title: ${(e.title?.fr||'').slice(0,40)}`);
      console.log(`  conditions: ${JSON.stringify(cond)}`);
      console.log(`  registration: ${JSON.stringify(regis)?.slice(0,100)}`);
    }
  }
}
main().catch(console.error);
