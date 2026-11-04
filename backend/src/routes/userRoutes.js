const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getLeaderboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.get('/search', protect, searchUsers);
router.get('/friends', protect, getFriends);
router.post('/friends/request/:targetUserId', protect, sendFriendRequest);
router.post('/friends/accept/:requestId', protect, acceptFriendRequest);
router.post('/friends/reject/:requestId', protect, rejectFriendRequest);
router.get('/profile/:username', protect, getUserProfile);

module.exports = router;
