const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'snaketype_secret', {
    expiresIn: '30d',
  });
};

// @desc    Yangi foydalanuvchi ro'yxatdan o'tishi
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { ism, familya, username, parol, email, hisob_raqami } = req.body;

    if (!ism || !familya || !username || !parol) {
      return res.status(400).json({
        success: false,
        message: 'Iltimos, barcha majburiy maydonlarni to\'ldiring (ism, familya, username, parol)',
      });
    }

    // Username mavjudligini tekshirish
    const userExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu username allaqachon band. Iltimos, boshqa username tanlang.',
      });
    }

    // Yangi foydalanuvchi yaratish
    const user = await User.create({
      ism: ism.trim(),
      familya: familya.trim(),
      username: username.toLowerCase().trim(),
      parol,
      email: email ? email.toLowerCase().trim() : `${username.toLowerCase().trim()}@snaketype.dev`,
      hisob_raqami: hisob_raqami ? hisob_raqami.trim() : undefined,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
      token,
      user: {
        _id: user._id,
        id: user.id,
        ism: user.ism,
        familya: user.familya,
        username: user.username,
        hisob_raqami: user.hisob_raqami,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server xatosi',
    });
  }
};

// @desc    Foydalanuvchi tizimga kirishi
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, parol } = req.body;

    if (!username || !parol) {
      return res.status(400).json({
        success: false,
        message: 'Username va parolni kiriting',
      });
    }

    // Foydalanuvchini topish (username yoki hisob raqami orqali)
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase().trim() },
        { hisob_raqami: username.trim() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username yoki hisob raqami noto\'g\'ri',
      });
    }

    const isMatch = await user.matchPassword(parol);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Parol noto\'g\'ri',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Xush kelibsiz!',
      token,
      user: {
        _id: user._id,
        id: user.id,
        ism: user.ism,
        familya: user.familya,
        username: user.username,
        hisob_raqami: user.hisob_raqami,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server xatosi',
    });
  }
};

// @desc    Google orqali autentifikatsiya (Monkeytype uslubida 1-bosqichli tezkor kirish)
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google orqali ma\'lumot olinmadi',
      });
    }

    // Avval email yoki googleId orqali tekshirish
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (!user) {
      // Ism va familyani ajratish
      const nameParts = (name || 'Snaketype User').split(' ');
      const ism = nameParts[0] || 'User';
      const familya = nameParts.slice(1).join(' ') || 'Typist';
      
      // Yangi unikal username yaratish
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'typist';
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }

      // Xavfsiz random parol yaratish
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

      user = await User.create({
        ism,
        familya,
        username: uniqueUsername,
        parol: randomPassword,
        email: email.toLowerCase(),
        googleId: googleId || `google_${Date.now()}`,
        avatar: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`,
      });
    } else {
      // Mavjud foydalanuvchi ma'lumotlarini yangilash
      if (googleId && !user.googleId) user.googleId = googleId;
      if (picture && (!user.avatar || user.avatar.includes('dicebear'))) user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Google orqali muvaffaqiyatli tizimga kirdingiz!',
      token,
      user: {
        _id: user._id,
        id: user.id,
        ism: user.ism,
        familya: user.familya,
        username: user.username,
        hisob_raqami: user.hisob_raqami,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Google orqali kirishda xatolik',
    });
  }
};

// @desc    Joriy foydalanuvchi ma'lumotlarini olish
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-parol')
      .populate('friends', 'id ism familya username hisob_raqami avatar level stats')
      .populate('friendRequests.from', 'id ism familya username hisob_raqami avatar level');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server xatosi',
    });
  }
};
