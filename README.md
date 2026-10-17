# Oila shajarasi

Next.js'da yozilgan shajara sayti. Ma'lumotlar `content/` papkasidagi JSON fayllarda turadi,
ularni `/admin` sahifasidagi forma orqali qo'shasiz (Decap CMS). WordPress ham, ma'lumotlar
bazasi ham kerak emas — hammasi GitHub va Vercel'da bepul ishlaydi.

```
content/azolar/*.json    har bir odam alohida fayl
content/sozlamalar.json  sayt sarlavhasi va tavsifi
public/rasmlar/          admin panelda yuklangan rasmlar
public/admin/            admin panel (config.yml — maydonlar ro'yxati)
src/app/api/auth|callback  GitHub orqali kirish (Vercel uchun)
```

## Ishga tushirish (bir marta, ~15 daqiqa)

### 1. Kodni GitHub'ga joylang

GitHub'da yangi repo oching (masalan `shajara`, private bo'lishi mumkin) va shu papkadan:

```bash
git remote add origin https://github.com/FOYDALANUVCHI/shajara.git
git push -u origin main
```

### 2. Vercel'ga ulang

vercel.com → **Add New → Project** → repo'ni tanlang → **Deploy**. Hech qanday sozlama
kerak emas. Tugagach sayt manzilini eslab qoling, masalan `https://shajara-xyz.vercel.app`.

### 3. GitHub OAuth App yarating (admin panelga kirish uchun)

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Maydon | Qiymat |
| --- | --- |
| Application name | Shajara admin |
| Homepage URL | `https://shajara-xyz.vercel.app` |
| Authorization callback URL | `https://shajara-xyz.vercel.app/api/callback` |

**Register** dan keyin **Client ID** ni nusxalang va **Generate a new client secret** ni bosib,
secret'ni ham nusxalang.

### 4. Kalitlarni Vercel'ga qo'shing

Vercel → loyiha → **Settings → Environment Variables**:

```
GITHUB_CLIENT_ID      = (Client ID)
GITHUB_CLIENT_SECRET  = (Client secret)
```

So'ng **Deployments → oxirgi deploy → ⋯ → Redeploy**.

### 5. Admin panelga kiring

`https://shajara-xyz.vercel.app/admin` → **Login with GitHub**. Repo'ga yozish huquqi faqat
sizda bo'lgani uchun boshqa odam kirsa ham hech narsani o'zgartira olmaydi.

## Odam qo'shish

1. **Oila a'zolari → New A'zo**.
2. Ism, jinsi, yillarni yozing, **Rasm** ga surat yuklang.
3. **Otasi / Onasi / Turmush o'rtog'i** — ro'yxatdan tanlang (yozishni boshlasangiz qidiradi).
   Shuning uchun avval kattalarni, keyin farzandlarni kiriting.
4. **Publish → Publish now**. Vercel saytni 1–2 daqiqada yangilaydi.

Maslahatlar:

- Turmush o'rtog'ini faqat bir tomonda belgilash kifoya.
- Kelin/kuyovning ota-onasini kiritmasangiz, u faqat turmush o'rtog'i yonida ko'rinadi.
  Kiritsangiz, o'z ota-onasi ostida ham chiqadi.
- Rasmni yuklashdan oldin kichraytiring (1 MB gacha) — sayt tezroq ochiladi.
- Sarlavhani **Sayt sozlamalari** bo'limida o'zgartirasiz.
- Namuna sifatida qo'yilgan Karimovlar oilasini admin paneldan yoki `content/azolar/`
  dagi fayllarni o'chirib olib tashlang.

## Kompyuterda ishlatish (ixtiyoriy)

```bash
npm install
npx decap-server      # 1-terminal: admin panel fayllarni to'g'ridan-to'g'ri yozadi
npm run dev           # 2-terminal
```

`http://localhost:3000/admin` — bu yerda GitHub'ga kirmasdan tahrirlaysiz, keyin
o'zgarishlarni `git commit` va `git push` qilasiz.
