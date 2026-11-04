const User = require('../models/User');
const TestResult = require('../models/TestResult');

// @desc    Test natijasini saqlash, XP berish va Levelni hisoblash
// @route   POST /api/stats/save
exports.saveResult = async (req, res) => {
  try {
    const { wpm, rawWpm, accuracy, characters, mode, language, timeSeconds } = req.body;
    const userId = req.user ? req.user._id : null;

    if (wpm === undefined || accuracy === undefined || !timeSeconds) {
      return res.status(400).json({ success: false, message: 'Natija ma\'lumotlari yetarli emas' });
    }

    // XP hisoblash formulasi (Monkeytype uslubi):
    // Asosiy XP = WPM * 1.5
    // Aniqlik bonusi = Accuracy > 95% bo'lsa + 40 XP, > 98% bo'lsa + 80 XP
    // Vaqt bonusi = timeSeconds * 1.2
    let xpEarned = Math.round(
      Number(wpm) * 1.5 +
        (accuracy >= 98 ? 80 : accuracy >= 95 ? 40 : 10) +
        Number(timeSeconds) * 1.2
    );

    if (xpEarned < 10) xpEarned = 10;

    let userUpdateInfo = null;
    let newResult = null;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // Yangi natija hujjatini saqlash
        newResult = await TestResult.create({
          user: user._id,
          wpm: Number(wpm),
          rawWpm: Number(rawWpm || wpm),
          accuracy: Number(accuracy),
          characters: characters || {},
          mode: mode || 'time 30',
          language: language || 'uzbek_latin',
          timeSeconds: Number(timeSeconds),
          xpEarned,
        });

        // Foydalanuvchi statistikalarini yangilash
        const oldTests = user.stats.testsCompleted || 0;
        const oldAvgWpm = user.stats.avgWpm || 0;
        const oldAvgAcc = user.stats.avgAccuracy || 0;

        user.stats.testsCompleted = oldTests + 1;
        user.stats.bestWpm = Math.max(user.stats.bestWpm || 0, Number(wpm));
        user.stats.avgWpm = Math.round((oldAvgWpm * oldTests + Number(wpm)) / (oldTests + 1));
        user.stats.avgAccuracy = Math.round((oldAvgAcc * oldTests + Number(accuracy)) / (oldTests + 1));
        user.stats.timeSpentSeconds = (user.stats.timeSpentSeconds || 0) + Number(timeSeconds);

        // XP qo'shish va Level ko'tarilishini tekshirish
        const levelStatus = user.addXp(xpEarned);
        await user.save();

        userUpdateInfo = {
          level: user.level,
          xp: user.xp,
          stats: user.stats,
          leveledUp: levelStatus.leveledUp,
          newLevel: levelStatus.newLevel,
        };
      }
    }

    return res.json({
      success: true,
      xpEarned,
      userUpdateInfo,
      result: newResult,
    });
  } catch (error) {
    console.error('Save result error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};

// @desc    Foydalanuvchining oxirgi testlari tarixi
// @route   GET /api/stats/history
exports.getHistory = async (req, res) => {
  try {
    const history = await TestResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};
