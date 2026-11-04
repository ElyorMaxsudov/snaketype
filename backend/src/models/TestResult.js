const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wpm: {
      type: Number,
      required: true,
    },
    rawWpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    characters: {
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      extra: { type: Number, default: 0 },
      missed: { type: Number, default: 0 },
    },
    mode: {
      type: String, // 'time 15', 'time 30', 'time 60', 'words 25', 'multiplayer'
      default: 'time 30',
    },
    language: {
      type: String, // 'uzbek_latin', 'uzbek_cyrillic', 'english', 'russian', 'code'
      default: 'uzbek_latin',
    },
    timeSeconds: {
      type: Number,
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestResult', testResultSchema);
