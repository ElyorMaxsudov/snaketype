const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Foydalanuvchi ma'lumotlari (Talab qilingan: ism, familya, id, username, parol, hisob raqami)
    ism: {
      type: String,
      required: [true, "Ismni kiritish shart"],
      trim: true,
    },
    familya: {
      type: String,
      required: [true, "Familyani kiritish shart"],
      trim: true,
    },
    id: {
      type: String,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "Username kiritish shart"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username kamida 3 belgidan iborat bo'lishi kerak"],
    },
    parol: {
      type: String,
      required: [true, "Parol kiritish shart"],
      minlength: [6, "Parol kamida 6 belgidan iborat bo'lishi kerak"],
    },
    hisob_raqami: {
      type: String,
      unique: true,
      index: true,
    },

    // Qo'shimcha Monkeytype & Google & Startup ma'lumotlari
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${this.username || 'snake'}`;
      },
    },

    // Level va Tajriba (Monkeytype XP & Level tizimi)
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },

    // Statistika (WPM, Accuracy, testlar soni)
    stats: {
      testsCompleted: { type: Number, default: 0 },
      bestWpm: { type: Number, default: 0 },
      avgWpm: { type: Number, default: 0 },
      avgAccuracy: { type: Number, default: 0 },
      timeSpentSeconds: { type: Number, default: 0 },
    },

    // Do'stlik tizimi
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Parolni saqlashdan oldin hash qilish va ID, Hisob raqamini generatsiya qilish
userSchema.pre('save', async function (next) {
  // Agar id bo'lmasa generatsiya qilish (masalan: USR-849204)
  if (!this.id) {
    const randomIdNum = Math.floor(100000 + Math.random() * 900000);
    this.id = `USR-${randomIdNum}`;
  }

  // Agar hisob_raqami bo'lmasa 12 xonali unikal bank/startup hisob raqami generatsiya qilish
  if (!this.hisob_raqami) {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    this.hisob_raqami = `ST-${part1}-${part2}-${part3}`;
  }

  // Parolni hash qilish
  if (this.isModified('parol')) {
    const salt = await bcrypt.genSalt(10);
    this.parol = await bcrypt.hash(this.parol, salt);
  }

  next();
});

// Parolni tekshirish metodi
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.parol);
};

// XP qo'shish va Level hisoblash metodi (Monkeytype formula: Har 500 XP = +1 Level)
userSchema.methods.addXp = function (amount) {
  this.xp += amount;
  // Level hisoblash: Har level uchun kerakli XP: level * 350
  // Level 1: 0 - 350 XP
  // Level 2: 350 - 1050 XP va h.k.
  const newLevel = Math.floor(1 + Math.sqrt(this.xp / 100));
  if (newLevel > this.level) {
    const leveledUp = newLevel - this.level;
    this.level = newLevel;
    return { leveledUp: true, newLevel: this.level };
  }
  return { leveledUp: false, newLevel: this.level };
};

module.exports = mongoose.model('User', userSchema);
