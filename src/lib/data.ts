import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

export type Azo = {
  id: string; // fayl nomi (admin panel shunday bog'laydi)
  ism: string;
  familiya?: string;
  jins?: "erkak" | "ayol";
  rasm?: string;
  tugilgan_yil?: string;
  vafot_yil?: string;
  ota?: string;
  ona?: string;
  turmush_ortogi?: string[] | string;
  haqida?: string;
};

export type Sozlamalar = { sarlavha: string; tavsif?: string };

const CONTENT = path.join(process.cwd(), "content");

// Ma'lumot GitHub'dagi fayllardan olinadi. Admin panelda saqlash yangi commit qiladi,
// Vercel saytni qayta yig'adi, shuning uchun bu yerda keshni build bilan bog'lash yetarli.
export async function getAzolar(): Promise<Azo[]> {
  "use cache";
  cacheLife("max");

  const dir = path.join(CONTENT, "azolar");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }

  const azolar = await Promise.all(
    files.map(async (file) => {
      try {
        const raw = JSON.parse(await readFile(path.join(dir, file), "utf8"));
        if (!raw?.ism) return null;
        return { ...raw, id: file.replace(/\.json$/, "") } as Azo;
      } catch {
        return null;
      }
    }),
  );
  return azolar.filter((a): a is Azo => a !== null);
}

export async function getSozlamalar(): Promise<Sozlamalar> {
  "use cache";
  cacheLife("max");

  try {
    const raw = JSON.parse(await readFile(path.join(CONTENT, "sozlamalar.json"), "utf8"));
    return { sarlavha: raw.sarlavha || "Oila shajarasi", tavsif: raw.tavsif || "" };
  } catch {
    return { sarlavha: "Oila shajarasi", tavsif: "" };
  }
}
