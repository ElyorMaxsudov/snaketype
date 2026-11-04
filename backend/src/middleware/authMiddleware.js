const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'snaketype_secret');
      req.user = await User.findById(decoded.id).select('-parol');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Ruxsat berilmadi, yaroqsiz token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Ruxsat berilmadi, token mavjud emas' });
  }
};

module.exports = { protect };
