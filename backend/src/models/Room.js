const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: 'Poyga Xonasi',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mode: {
      type: String,
      default: 'time 30',
    },
    language: {
      type: String,
      default: 'uzbek_latin',
    },
    text: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting', 'starting', 'racing', 'finished'],
      default: 'waiting',
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        ism: String,
        familya: String,
        avatar: String,
        level: Number,
        wpm: { type: Number, default: 0 },
        accuracy: { type: Number, default: 100 },
        progress: { type: Number, default: 0 }, // 0 to 100%
        finished: { type: Boolean, default: false },
        finishTime: { type: Number, default: null },
        rank: { type: Number, default: null },
      },
    ],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        avatar: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
