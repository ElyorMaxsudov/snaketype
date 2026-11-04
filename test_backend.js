const API = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[${res.status}] ${JSON.stringify(data)}`);
  }
  return data;
}

async function testBackend() {
  console.log('--- 1. HEALTH CHECK ---');
  const health = await req('/health');
  console.log('Health:', health);

  console.log('\n--- 2. REGISTER USER 1 ---');
  const user1 = await req('/auth/register', {
    method: 'POST',
    body: {
      ism: 'Sardor',
      familya: 'Karimov',
      username: 'sardor_dev',
      parol: 'parol123',
      hisob_raqami: 'ST-9988-7766',
    },
  });
  console.log('User 1 Registered:', user1.user);
  const token1 = user1.token;

  console.log('\n--- 3. REGISTER USER 2 ---');
  const user2 = await req('/auth/register', {
    method: 'POST',
    body: {
      ism: 'Jasur',
      familya: 'Aliyev',
      username: 'jasur_speed',
      parol: 'parol123',
    },
  });
  console.log('User 2 Registered (Auto Hisob Raqami):', user2.user);
  const token2 = user2.token;

  console.log('\n--- 4. GOOGLE AUTH TEST ---');
  const googleUser = await req('/auth/google', {
    method: 'POST',
    body: {
      googleId: 'g_123456789',
      email: 'test.google@snaketype.dev',
      name: 'Bekzod Rahimov',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=bekzod',
    },
  });
  console.log('Google User Created/Logged in:', googleUser.user);

  console.log('\n--- 5. SAVE TYPING STATS & LEVEL UP TEST ---');
  const statsRes = await req('/stats/save', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: {
      wpm: 85,
      rawWpm: 92,
      accuracy: 97,
      characters: { correct: 425, incorrect: 8, extra: 0, missed: 2 },
      mode: 'time 30',
      language: 'uzbek_latin',
      timeSeconds: 30,
    },
  });
  console.log('Stats Result & XP/Level:', statsRes);

  console.log('\n--- 6. SEARCH USER ---');
  const searchRes = await req('/users/search?q=jasur', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  console.log('Search Results:', searchRes.users);

  console.log('\n--- 7. SEND FRIEND REQUEST ---');
  const friendReq = await req(`/users/friends/request/${user2.user._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
  });
  console.log('Friend Request:', friendReq);

  console.log('\n--- 8. GET FRIEND REQUESTS & ACCEPT ---');
  const me2 = await req('/users/friends', {
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log('User 2 Received Requests:', me2.friendRequests);
  const reqId = me2.friendRequests[0]._id;

  const acceptRes = await req(`/users/friends/accept/${reqId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
  });
  console.log('Accept Friend Request:', acceptRes);

  console.log('\n--- 9. LEADERBOARD ---');
  const lb = await req('/users/leaderboard');
  console.log('Leaderboard Top WPM Count:', lb.leaderboards.byWpm.length);
  console.log('Leaderboard Top Level Count:', lb.leaderboards.byLevel.length);

  console.log('\n BARCHA BACKEND TESTLARI 100% MUVAFFAQIYATLI O\'TDI!');
}

testBackend().catch((err) => {
  console.error('Test error:', err.message);
});
