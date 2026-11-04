# 🐍 Snaketype — Monkeytype Uslubidagi FullStack Startup Platformasi

**Snaketype** — tez yozish (typing speed), ko'p o'yinchili real-time poygalar (Dev Monkeytype Rooms), do'stlar tizimi, darajalar (Level & XP) va ko'p tilli rejimga ega bo'lgan zamonaviy FullStack startup loyihasi.

---

## 🚀 Texnologiyalar To'plami (Tech Stack)

### 🖥️ Frontend:
- **Vite** — zamonaviy va o'ta tezkor yig'uvchi (bundler)
- **Vanilla JavaScript (ES Modules)** — 120 FPS da ishlovchi optimallashgan Monkeytype dvigateli
- **TailwindCSS** — Monkeytype qora/sariq neon (`#e2b714`) dizayni va silliq kursor animatsiyalari
- **Axios** — avtomatik Bearer JWT tokenni biriktiruvchi REST API mijozi
- **Socket.io Client** — jonli poyga yo'lagi (Snake race tracks) va xona ichidagi real-time chat
- **Canvas-Confetti** — yangi darajaga (Level Up!) ko'tarilgandagi bayramona effektlar

### ⚙️ Backend:
- **Node.js & Express.js** — yuqori unumdorlikka ega server va REST API
- **MongoDB & Mongoose** — foydalanuvchilar, natijalar va xonalar ma'lumotlar bazasi
- **Bcrypt.js** — parollarni xavfsiz heshlash (hashing)
- **JsonWebToken (JWT)** — 30 kunlik sessiya va avtorizatsiya
- **Cors & Dotenv** — xavfsiz ulanish va muhit o'zgaruvchilari
- **Socket.io** — multiplayer xonalar, poyga kursorlari va jonli chat

---

## 🗄️ Foydalanuvchilar Jadvali (User Database Schema)

MongoDB `User` modelida talab qilingan barcha maydonlar mavjud:

| Maydon | Turi | Tavsif |
|---|---|---|
| `ism` | String | Foydalanuvchining ismi |
| `familya` | String | Foydalanuvchining familyasi |
| `id` | String | Unikal foydalanuvchi ID raqami (masalan: `USR-919475`) |
| `username` | String | Unikal foydalanuvchi nomi |
| `parol` | String | Bcrypt bilan heshlangan xavfsiz parol |
| `hisob_raqami`| String | Unikal hisob raqami (masalan: `ST-9988-7766` yoki avto-generatsiya) |
| `level` | Number | Monkeytype darajasi (Level 1, 2, 3...) |
| `xp` | Number | Tajriba ballari (har bir testdan so'ng to'planadi) |
| `googleId` | String | Google orqali tezkor kirish uchun ID |
| `friends` | Array | Qabul qilingan do'stlar ro'yxati |
| `friendRequests` | Array | Kelgan va yuborilgan do'stlik so'rovlari |
| `stats` | Object | `bestWpm`, `avgWpm`, `avgAccuracy`, `testsCompleted`, `timeSpentSeconds` |

---

## ✨ Asosiy Imkoniyatlar

1. **Monkeytype Tajribasi (Typing Arena)**:
   - Silliq kursor (Smooth Caret) va harflarning rang o'zgarishi
   - Jonli WPM, Aniqlik % va Qolgan vaqt / So'zlar hisoblagichi
   - Test yakunida batafsil natijalar: WPM, Raw WPM, Aniqlik, Xatolar tahlili, olingan XP
   - Qayta boshlash: `Tab` yoki `Esc` klavishlari

2. **Ko'p Tilli Tizim (Language Switcher)**:
   - 🇺🇿 **O'zbekcha (Lotin)**: 100+ saralangan o'zbek so'zlari
   - 🇺🇿 **Ўзбекча (Кирилл)**: Krill yozuvidagi so'zlar
   - 🇬🇧 **English**: Eng mashhur ingliz so'zlari
   - 🇷🇺 **Русский**: Rus tili so'z boyligi
   - 💻 **Code (Dasturlash)**: JavaScript / Python kalit so'zlari

3. **Google orqali Kirish (Google Sign-In)**:
   - Monkeytype uslubida 1 ta tugma orqali Google akkaunt bilan tezkor ro'yxatdan o'tish yoki kirish.
   - Yangi foydalanuvchiga bir zumda unikal ID, Hisob raqami va robotik Avatar beriladi!

4. **Do'stlar Tizimi (Friends System)**:
   - Foydalanuvchilarni **Username** yoki **Hisob raqami** (`ST-...`) orqali qidirish
   - Do'stlik so'rovi yuborish, qabul qilish yoki rad etish
   - Do'stlarning darajasi (Level), eng yuqori WPM va ular bilan poyga o'ynash

5. **Dev Monkeytype — Multiplayer Poyga Xonalari va Jonli Chat**:
   - Xona yaratish (Xona nomi, til va rejimni tanlash)
   - 6 xonali unikal **Xona kodi** orqali do'stlarni chaqirish
   - Real-time poyga: barcha o'yinchilarning ilonchalari/avtomobillari va jonli WPM ko'rsatkichi har bir harf bosilganda birga harakatlanadi!
   - Marraga birinchi yetib kelganga 1-o'rin beriladi va tabriklanadi
   - **Xona ichida jonli suhbat (Chat)**: poygachilar xona ichida bemalol bir-birlariga xabar yozishlari mumkin!

6. **Yetakchilar Jadvali (Leaderboard)**:
   - Eng yuqori tezlik (Top WPM)
   - Eng yuqori daraja (Top Level & XP)

---

## 🛠️ Loyihani Ishga Tushirish

### 1. MongoDB ni tekshirish
MongoDB kompyuteringizda xizmat sifatida ishlab turishi kerak (`mongodb://127.0.0.1:27017`).

### 2. Backend ni ishga tushirish:
```bash
cd backend
npm install
npm run dev
# Server http://localhost:5000 da ishga tushadi
```

### 3. Frontend ni ishga tushirish:
```bash
cd frontend
npm install
npm run dev
# Vayt server http://localhost:5173 da ishga tushadi
```

Brauzerda `http://localhost:5173` manziliga kiring va platformadan bahramand bo'ling!
