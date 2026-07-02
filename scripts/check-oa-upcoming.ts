import { config } from "dotenv";
config({ path: ".env.local", override: true });

async function main() {
  const key = process.env.OPENAGENDA_PUBLIC_KEY;
  const uid = process.env.OPENAGENDA_AGENDA_UID;
  const today = new Date().toISOString().slice(0, 10);
  let after = "";
  let total = 0;
  const titles: string[] = [];
  for (let page = 0; page < 5; page++) {
    const url = `https://api.openagenda.com/v2/agendas/${uid}/events?key=${key}&size=50&timings[gte]=${today}${after}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      events?: Array<{ uid: number; title?: { fr?: string }; nextTiming?: { begin?: string } }>;
      after?: string[];
    };
    if (!data.events?.length) break;
    for (const e of data.events) {
      total++;
      titles.push(`OA ${e.uid} | ${e.nextTiming?.begin?.slice(0, 10) ?? "?"} | ${e.title?.fr?.slice(0, 60) ?? "(sans titre)"}`);
    }
    if (!data.after) break;
    after = data.after.map((a) => `&after[]=${encodeURIComponent(a)}`).join("");
  }
  console.log("Événements à venir côté OpenAgenda :", total);
  titles.forEach((t) => console.log(t));
}

main();
