import type { Azo } from "./data";

// Daraxtdagi bitta "tugun": bir kishi va uning turmush o'rtog'i (bo'lsa),
// pastida esa ularning farzandlari.
export type Oila = {
  odamlar: string[];
  farzandlar: Oila[];
};

export type Shajara = {
  ildizlar: Oila[];
  azolar: Record<string, Azo>;
  avlodlar: number;
};

const yil = (a: Azo) => Number(a.tugilgan_yil) || 9999;

export function shajaraQur(royxat: Azo[]): Shajara {
  const azolar: Record<string, Azo> = {};
  for (const a of royxat) azolar[a.id] = a;

  // Turmush o'rtoqlik ikki tomonlama: biri belgilasa ham yetadi
  const juftlar = new Map<string, Set<string>>();
  const juftQosh = (a: string, b: string) => {
    if (a === b || !azolar[a] || !azolar[b]) return;
    if (!juftlar.has(a)) juftlar.set(a, new Set());
    if (!juftlar.has(b)) juftlar.set(b, new Set());
    juftlar.get(a)!.add(b);
    juftlar.get(b)!.add(a);
  };
  for (const a of royxat) {
    const list = Array.isArray(a.turmush_ortogi)
      ? a.turmush_ortogi
      : a.turmush_ortogi
        ? [a.turmush_ortogi]
        : [];
    for (const j of list) juftQosh(a.id, j);
  }

  const otaOnasiBor = (id: string) => {
    const a = azolar[id];
    return Boolean((a.ota && azolar[a.ota]) || (a.ona && azolar[a.ona]));
  };

  const tartib = (x: string, y: string) =>
    yil(azolar[x]) - yil(azolar[y]) || azolar[x].ism.localeCompare(azolar[y].ism, "uz");

  const joylangan = new Set<string>();
  let avlodlar = 0;

  const oilaQur = (id: string, chuqurlik: number): Oila => {
    joylangan.add(id);
    avlodlar = Math.max(avlodlar, chuqurlik + 1);

    const juft = [...(juftlar.get(id) ?? [])].sort(tartib);
    // Ota-onasi shajarada yo'q kelin/kuyovlar faqat shu yerda ko'rinadi
    for (const j of juft) if (!otaOnasiBor(j)) joylangan.add(j);

    const odamlar = [id, ...juft].sort((x, y) => {
      const gx = azolar[x].jins === "ayol" ? 1 : 0;
      const gy = azolar[y].jins === "ayol" ? 1 : 0;
      return gx - gy;
    });

    const ota_ona = new Set(odamlar);
    const farzandIdlar = royxat
      .filter(
        (b) =>
          !joylangan.has(b.id) &&
          ((b.ota && ota_ona.has(b.ota)) || (b.ona && ota_ona.has(b.ona))),
      )
      .map((b) => b.id)
      .sort(tartib);

    for (const f of farzandIdlar) joylangan.add(f);
    const farzandlar = farzandIdlar.map((f) => {
      joylangan.delete(f);
      return oilaQur(f, chuqurlik + 1);
    });

    return { odamlar, farzandlar };
  };

  const ildizlar: Oila[] = [];
  const ildizNomzodlar = royxat
    .map((a) => a.id)
    .filter((id) => !otaOnasiBor(id))
    .sort((x, y) => {
      const ex = azolar[x].jins === "ayol" ? 1 : 0;
      const ey = azolar[y].jins === "ayol" ? 1 : 0;
      return tartib(x, y) || ex - ey;
    });

  for (const id of ildizNomzodlar) {
    if (joylangan.has(id)) continue;
    // Ota-onasi shajarada bor odamga turmushga chiqqan bo'lsa, o'sha yerda ko'rinadi
    const juft = [...(juftlar.get(id) ?? [])];
    if (juft.some(otaOnasiBor)) continue;
    ildizlar.push(oilaQur(id, 0));
  }

  // Nimadir chalkash kiritilgan bo'lsa ham hech kim yo'qolib qolmasin
  for (const a of royxat) {
    if (!joylangan.has(a.id)) ildizlar.push(oilaQur(a.id, 0));
  }

  return { ildizlar, azolar, avlodlar };
}
