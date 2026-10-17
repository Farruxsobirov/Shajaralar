"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Azo } from "@/lib/data";
import type { Oila, Shajara } from "@/lib/tree";

const toliqIsm = (a: Azo) => [a.ism, a.familiya].filter(Boolean).join(" ");

const yillar = (a: Azo) => {
  if (a.tugilgan_yil && a.vafot_yil) return `${a.tugilgan_yil}–${a.vafot_yil}`;
  if (a.tugilgan_yil) return `${a.tugilgan_yil}`;
  if (a.vafot_yil) return `?–${a.vafot_yil}`;
  return "";
};

const bosh = (a: Azo) =>
  [a.ism, a.familiya]
    .filter(Boolean)
    .map((s) => s!.trim()[0])
    .join("")
    .toUpperCase();

function Medalyon({ azo, size }: { azo: Azo; size: number }) {
  const [xato, setXato] = useState(false);
  return (
    <span
      className="medalyon"
      data-vafot={azo.vafot_yil ? "" : undefined}
      style={{ width: size, height: size }}
    >
      {azo.rasm && !xato ? (
        <Image
          src={azo.rasm}
          alt=""
          width={size * 2}
          height={size * 2}
          onError={() => setXato(true)}
        />
      ) : (
        <span className="bosh-harf" style={{ fontSize: size * 0.34 }}>
          {bosh(azo)}
        </span>
      )}
    </span>
  );
}

export default function ShajaraView({
  shajara,
  sarlavha,
  tavsif,
}: {
  shajara: Shajara;
  sarlavha: string;
  tavsif?: string;
}) {
  const { azolar, ildizlar, avlodlar } = shajara;
  const soni = Object.keys(azolar).length;

  const [masshtab, setMasshtab] = useState(1);
  const [qidiruv, setQidiruv] = useState("");
  const [tanlangan, setTanlangan] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const maydonRef = useRef<HTMLDivElement>(null);

  const topilganlar = useMemo(() => {
    const q = qidiruv.trim().toLocaleLowerCase("uz");
    if (q.length < 2) return new Set<string>();
    return new Set(
      Object.values(azolar)
        .filter((a) => toliqIsm(a).toLocaleLowerCase("uz").includes(q))
        .map((a) => a.id),
    );
  }, [qidiruv, azolar]);

  useEffect(() => {
    const birinchi = [...topilganlar][0];
    if (!birinchi) return;
    maydonRef.current
      ?.querySelector(`[data-id="${CSS.escape(birinchi)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [topilganlar]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (tanlangan && !d.open) d.showModal();
    if (!tanlangan && d.open) d.close();
  }, [tanlangan]);

  // Daraxtni gorizontal o'rtaga keltiramiz
  useEffect(() => {
    const m = maydonRef.current;
    if (m) m.scrollLeft = (m.scrollWidth - m.clientWidth) / 2;
  }, [masshtab]);

  const farzandlari = (id: string) =>
    Object.values(azolar)
      .filter((a) => a.ota === id || a.ona === id)
      .sort((x, y) => (Number(x.tugilgan_yil) || 0) - (Number(y.tugilgan_yil) || 0));

  const juftlari = (id: string) => {
    const a = azolar[id];
    const ozi = Array.isArray(a.turmush_ortogi)
      ? a.turmush_ortogi
      : a.turmush_ortogi
        ? [a.turmush_ortogi]
        : [];
    const boshqalar = Object.values(azolar)
      .filter((b) => {
        const l = Array.isArray(b.turmush_ortogi) ? b.turmush_ortogi : [b.turmush_ortogi];
        return l.includes(id);
      })
      .map((b) => b.id);
    return [...new Set([...ozi, ...boshqalar])].filter((j) => azolar[j]);
  };

  const odam = (id: string) => {
    const a = azolar[id];
    return (
      <button
        key={id}
        type="button"
        className="odam"
        data-id={id}
        data-topildi={topilganlar.has(id) ? "" : undefined}
        onClick={() => setTanlangan(id)}
      >
        <Medalyon azo={a} size={76} />
        <span className="odam-ism">{a.ism}</span>
        {a.familiya && <span className="odam-familiya">{a.familiya}</span>}
        {yillar(a) && <span className="odam-yil">{yillar(a)}</span>}
      </button>
    );
  };

  const tugun = (oila: Oila) => (
    <li key={oila.odamlar[0]}>
      <div className="juftlik" data-juft={oila.odamlar.length > 1 ? "" : undefined}>
        {oila.odamlar.map(odam)}
      </div>
      {oila.farzandlar.length > 0 && (
        <ul>
          {oila.farzandlar.map(tugun)}
        </ul>
      )}
    </li>
  );

  const havola = (id: string) => (
    <button key={id} type="button" className="havola" onClick={() => setTanlangan(id)}>
      <Medalyon azo={azolar[id]} size={32} />
      <span>{toliqIsm(azolar[id])}</span>
    </button>
  );

  const t = tanlangan ? azolar[tanlangan] : null;

  return (
    <div className="sahifa">
      <header className="bosh">
        <div className="bosh-matn">
          <h1>{sarlavha}</h1>
          {tavsif && <p className="tavsif">{tavsif}</p>}
          {soni > 0 && (
            <p className="hisob">
              {soni} kishi, {avlodlar} avlod
            </p>
          )}
        </div>
        {soni > 0 && (
          <div className="boshqaruv">
            <label className="qidiruv">
              <span className="sr">Ism bo&apos;yicha qidirish</span>
              <input
                type="search"
                placeholder="Ismni qidiring"
                value={qidiruv}
                onChange={(e) => setQidiruv(e.target.value)}
              />
            </label>
            <div className="zoom" role="group" aria-label="Kattalashtirish">
              <button
                type="button"
                aria-label="Kichraytirish"
                onClick={() => setMasshtab((m) => Math.max(0.4, +(m - 0.15).toFixed(2)))}
              >
                −
              </button>
              <button type="button" className="zoom-qiymat" onClick={() => setMasshtab(1)}>
                {Math.round(masshtab * 100)}%
              </button>
              <button
                type="button"
                aria-label="Kattalashtirish"
                onClick={() => setMasshtab((m) => Math.min(1.6, +(m + 0.15).toFixed(2)))}
              >
                +
              </button>
            </div>
          </div>
        )}
      </header>

      {soni === 0 ? (
        <div className="bosh-holat">
          <p>Shajarada hali hech kim yo&apos;q.</p>
          <a href="/admin">Birinchi a&apos;zoni qo&apos;shish</a>
        </div>
      ) : (
        <div className="maydon" ref={maydonRef}>
          <div className="daraxt" style={{ "--m": masshtab } as React.CSSProperties}>
            <ul>
              {ildizlar.map(tugun)}
            </ul>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="karta"
        onClose={() => setTanlangan(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setTanlangan(null);
        }}
      >
        {t && (
          <div className="karta-ichi">
            <button
              type="button"
              className="yopish"
              aria-label="Yopish"
              onClick={() => setTanlangan(null)}
            >
              ×
            </button>
            <Medalyon azo={t} size={132} />
            <h2>{toliqIsm(t)}</h2>
            {yillar(t) && <p className="karta-yil">{yillar(t)}</p>}
            {t.haqida && <p className="karta-haqida">{t.haqida}</p>}

            <dl>
              {(t.ota && azolar[t.ota]) || (t.ona && azolar[t.ona]) ? (
                <div>
                  <dt>Ota-onasi</dt>
                  <dd>
                    {t.ota && azolar[t.ota] && havola(t.ota)}
                    {t.ona && azolar[t.ona] && havola(t.ona)}
                  </dd>
                </div>
              ) : null}
              {juftlari(t.id).length > 0 && (
                <div>
                  <dt>Turmush o&apos;rtog&apos;i</dt>
                  <dd>
                    {juftlari(t.id).map(havola)}
                  </dd>
                </div>
              )}
              {farzandlari(t.id).length > 0 && (
                <div>
                  <dt>Farzandlari</dt>
                  <dd>
                    {farzandlari(t.id).map((f) => havola(f.id))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </dialog>
    </div>
  );
}
