const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { getRandomWords, wordsByLanguage } = require('./data/wordLists');

// Konfiguratsiya
dotenv.config();

// MongoDB ulanishi
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io sozlamasi
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Marshrutlar
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// So'zlar olish API
app.get('/api/words', (req, res) => {
  const { lang, count } = req.query;
  const wordCount = parseInt(count) || 30;
  const language = lang || 'uzbek_latin';
  const text = getRandomWords(language, wordCount);
  return res.json({ success: true, language, count: wordCount, text });
});

// Server sog'ligini tekshirish (Health check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Snaketype Backend API',
    time: new Date(),
    supportedLanguages: Object.keys(wordsByLanguage),
  });
});

// Real-time Multiplayer & Chat handler
require('./socket/roomHandler')(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Snaketype Backend Server http://localhost:${PORT} da ishga tushdi`);
});
