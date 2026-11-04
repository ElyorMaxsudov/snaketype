const User = require('../models/User');

// @desc    Foydalanuvchilarni username yoki hisob raqami orqali qidirish
// @route   GET /api/users/search?q=query
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Qidiruv uchun kamida 2 ta belgi kiriting' });
    }

    const searchQuery = q.trim();

    // Username, hisob_raqami, ism, familya yoki ID bo'yicha qidirish
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // O'zini qidirmaslik
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { hisob_raqami: { $regex: searchQuery, $options: 'i' } },
            { ism: { $regex: searchQuery, $options: 'i' } },
            { familya: { $regex: searchQuery, $options: 'i' } },
            { id: { $regex: searchQuery, $options: 'i' } },
          ],
        },
      ],
    })
      .select('id ism familya username hisob_raqami avatar level xp stats')
      .limit(15);

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Qidirishda xatolik' });
  }
};

// @desc    Foydalanuvchi profili
// @route   GET /api/users/profile/:username
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { hisob_raqami: username }, { id: username }],
    })
      .select('-parol')
      .populate('friends', 'id ism familya username hisob_raqami avatar level');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Profilni yuklashda xatolik' });
  }
};

// @desc    Do'stlik so'rovi yuborish
// @route   POST /api/users/friends/request/:targetUserId
exports.sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'O\'zingizga so\'rov yubora olmaysiz' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    // Allaqachon do'stmi?
    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ success: false, message: 'Bu foydalanuvchi allaqachon do\'stlaringiz safida' });
    }

    // Allaqachon so'rov yuborilganmi?
    const alreadyRequested = targetUser.friendRequests.some(
      (r) => r.from.toString() === currentUserId.toString() && r.status === 'pending'
    );

    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'Do\'stlik so\'rovi allaqachon yuborilgan' });
    }

    // So'rov qo'shish
    targetUser.friendRequests.push({
      from: currentUserId,
      status: 'pending',
    });

    await targetUser.save();

    return res.json({
      success: true,
      message: `${targetUser.username} ga do'stlik so'rovi yuborildi!`,
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};

// @desc    Do'stlik so'rovini qabul qilish
// @route   POST /api/users/friends/accept/:requestId
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = await User.findById(req.user._id);

    const request = currentUser.friendRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'So\'rov topilmadi' });
    }

    const senderId = request.from;
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ success: false, message: 'Yuboruvchi topilmadi' });
    }

    // Har ikki tomonga bir-birini qo'shish
    if (!currentUser.friends.includes(senderId)) {
      currentUser.friends.push(senderId);
    }
    if (!sender.friends.includes(currentUser._id)) {
      sender.friends.push(currentUser._id);
    }

    // So'rovni o'chirish yoki qabul qilindi qilish
    currentUser.friendRequests.pull({ _id: requestId });

    await currentUser.save();
    await sender.save();

    return res.json({
      success: true,
      message: `${sender.username} bilan do'st bo'ldingiz!`,
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};

// @desc    Do'stlik so'rovini rad etish
// @route   POST /api/users/friends/reject/:requestId
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = await User.findById(req.user._id);

    currentUser.friendRequests.pull({ _id: requestId });
    await currentUser.save();

    return res.json({
      success: true,
      message: 'So\'rov rad etildi',
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};

// @desc    Do'stlar ro'yxatini olish
// @route   GET /api/users/friends
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'id ism familya username hisob_raqami avatar level stats')
      .populate('friendRequests.from', 'id ism familya username hisob_raqami avatar level stats');

    return res.json({
      success: true,
      friends: user.friends,
      friendRequests: user.friendRequests,
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};

// @desc    Yetakchilar jadvali (Leaderboard)
// @route   GET /api/users/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    // Eng yuqori WPM va Level bo'yicha saralash
    const topWpm = await User.find({ 'stats.bestWpm': { $gt: 0 } })
      .select('id ism familya username hisob_raqami avatar level xp stats')
      .sort({ 'stats.bestWpm': -1 })
      .limit(10);

    const topLevel = await User.find()
      .select('id ism familya username hisob_raqami avatar level xp stats')
      .sort({ level: -1, xp: -1 })
      .limit(10);

    return res.json({
      success: true,
      leaderboards: {
        byWpm: topWpm,
        byLevel: topLevel,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server xatosi' });
  }
};
