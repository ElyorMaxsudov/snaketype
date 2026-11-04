# 🐍 Snaketype

> **A minimalistic, customizable typing test and multiplayer race platform inspired by Monkeytype.**

![Snaketype Preview](frontend/src/assets/preview.png) <!-- Agar rasm bo'lsa -->

## ✨ Xususiyatlar (Features)

- ⌨️ **Monkeytype 1:1 tajribasi:** Yumshoq silliq kursor (`cubic-bezier`), dinamik satr siljishi, harflar holatlari (to'g'ri, xato, ortiqcha) va klaviatura tovushlari (audio feedback).
- 🌍 **Ko'p tilli qo'llab-quvvatlash:** O'zbek (lotin / kirill), Ingliz, Rus, Turk, Qozoq, Nemis, Fransuz, Ispan, Arab tillari hamda Dasturlash tillari (JavaScript, Python, C++, HTML/CSS, Java, Rust, Go, PHP).
- ⚙️ **Konfiguratsiya paneli:** `@ punctuation`, `# numbers`, vaqt rejimlari (15, 30, 60, 120s) yoki so'zlar soni bo'yicha test.
- 🏁 **Dev Monkeytype Multiplayer Rooms:** Do'stlar bilan jonli poyga qilish, real-vaqtda ilon/progress bari, jonli chat va g'oliblarni aniqlash.
- 👥 **Do'stlar tizimi:** Foydalanuvchilarni `username` yoki `hisob_raqami` (ST-XXXX-XXXX) orqali topish, do'stlik taklifi yuborish, qabul qilish va rad etish.
- 🏆 **Yetakchilar jadvali (Leaderboard):** WPM tezlik va Level bo'yicha global reyting.
- 📊 **Profil va statistika:** Batafsil hisobot, o'rtacha WPM, aniqlik, testlar soni va daraja (XP/Level tizimi).
- ☁️ **MongoDB Atlas integratsiyasi:** Barcha foydalanuvchilar, natijalar va do'stlik ma'lumotlari bulutli ma'lumotlar bazasida saqlanadi.

---

## 🛠 Texnologiyalar (Tech Stack)

### Frontend
- **Framework / Bundler:** [Vite](https://vitejs.dev/) + Vanilla JavaScript (ES Modules)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Tarmoq va Real-Time:** [Axios](https://axios-http.com/) & [Socket.io Client](https://socket.io/)
- **Effektlar:** Canvas Confetti

### Backend
- **Server:** Node.js & [Express.js](https://expressjs.com/)
- **Real-Time:** [Socket.io](https://socket.io/)
- **Ma'lumotlar bazasi:** [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/)
- **Xavfsizlik:** JWT (JSON Web Token), Bcrypt.js, CORS, Dotenv

---

## 🚀 O'rnatish va Ishga Tushirish (Quick Start)

### 1. Repozitoriyani yuklab oling:
```bash
git clone https://github.com/ElyorMaxsudov/snaketype.git
cd snaketype
```

### 2. Backend sozlash:
```bash
cd backend
npm install
# .env faylini yarating va MongoDB ulanish havolasini kiriting
node src/server.js
```

### 3. Frontend sozlash:
```bash
cd ../frontend
npm install
npm run dev
```

Brauzerda oching: `http://localhost:5173`

---

## 📄 Litsenziya
MIT License © 2026 Elyor Maxsudov
