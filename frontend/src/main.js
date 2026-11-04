import { authAPI, userAPI, statsAPI } from './api';
import { initSocket, getSocket, socketService } from './socket';
import { TypingEngine } from './engine';
import confetti from 'canvas-confetti';

// ==========================================
// ILOVA HOLATI (APP STATE)
// ==========================================
const savedLang = localStorage.getItem('snaketype_language') || 'uzbek_latin';
const savedMode = localStorage.getItem('snaketype_mode') || 'time';
const savedModeVal = parseInt(localStorage.getItem('snaketype_mode_val')) || 30;

const state = {
  currentUser: null,
  currentLanguage: savedLang,
  currentMode: savedMode,
  currentModeValue: savedModeVal,
  includePunctuation: localStorage.getItem('snaketype_punct') === 'true',
  includeNumbers: localStorage.getItem('snaketype_num') === 'true',
  mainEngine: null,
  multiEngine: null,
  activeRoom: null,
};

// ==========================================
// TOAST BILDIRISHNOMALARI
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass =
    type === 'success'
      ? 'bg-[#2ecc71] text-[#323437]'
      : type === 'error'
      ? 'bg-[#ca4754] text-white'
      : 'bg-[#e2b714] text-[#323437]';

  toast.className = `${bgClass} px-3.5 py-2 rounded-xl font-bold text-xs shadow-xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto select-none z-50`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${message}</span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// DOM ELEMENTLARI
// ==========================================
const DOM = {
  // Modallar
  authModal: document.getElementById('authModal'),
  profileModal: document.getElementById('profileModal'),
  friendsModal: document.getElementById('friendsModal'),
  roomsModal: document.getElementById('roomsModal'),
  leaderboardModal: document.getElementById('leaderboardModal'),
  resultModal: document.getElementById('resultModal'),

  // Header
  navBtnTest: document.getElementById('navBtnTest'),
  btnOpenLeaderboard: document.getElementById('btnOpenLeaderboard'),
  btnOpenRooms: document.getElementById('btnOpenRooms'),
  btnOpenFriends: document.getElementById('btnOpenFriends'),
  btnNotifications: document.getElementById('btnNotifications'),
  friendRequestBadge: document.getElementById('friendRequestBadge'),
  notifBadge: document.getElementById('notifBadge'),

  // User Dropdown
  btnOpenAuth: document.getElementById('btnOpenAuth'),
  userDropdownTrigger: document.getElementById('userDropdownTrigger'),
  userDropdownMenu: document.getElementById('userDropdownMenu'),
  headerUsername: document.getElementById('headerUsername'),
  headerUserLevel: document.getElementById('headerUserLevel'),
  dropdownFullName: document.getElementById('dropdownFullName'),
  dropdownId: document.getElementById('dropdownId'),
  dropdownAccountNum: document.getElementById('dropdownAccountNum'),
  menuItemProfile: document.getElementById('menuItemProfile'),
  menuItemFriends: document.getElementById('menuItemFriends'),
  menuItemRooms: document.getElementById('menuItemRooms'),
  menuItemLogout: document.getElementById('menuItemLogout'),

  // Language Dropdown
  btnLanguageSelector: document.getElementById('btnLanguageSelector'),
  languageDropdown: document.getElementById('languageDropdown'),
  currentLanguageLabel: document.getElementById('currentLanguageLabel'),
  langSearchInput: document.getElementById('langSearchInput'),
  langListContainer: document.getElementById('langListContainer'),

  // Config Bar
  togglePunctuation: document.getElementById('togglePunctuation'),
  toggleNumbers: document.getElementById('toggleNumbers'),
  btnModeTime: document.getElementById('btnModeTime'),
  btnModeWords: document.getElementById('btnModeWords'),
  btnModeRooms: document.getElementById('btnModeRooms'),
  footerRoomsBtn: document.getElementById('footerRoomsBtn'),
  modeValuesContainer: document.getElementById('modeValuesContainer'),

  // Typing Area
  liveTimer: document.getElementById('liveTimer'),
  liveStatsBox: document.getElementById('liveStatsBox'),
  liveWpm: document.getElementById('liveWpm'),
  liveAcc: document.getElementById('liveAcc'),
  typingAreaWrapper: document.getElementById('typingAreaWrapper'),
  caretCursor: document.getElementById('caretCursor'),
  wordsContainer: document.getElementById('wordsContainer'),
  btnRestart: document.getElementById('btnRestart'),

  // Auth Form
  authTabLogin: document.getElementById('authTabLogin'),
  authTabRegister: document.getElementById('authTabRegister'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  authErrorMsg: document.getElementById('authErrorMsg'),
  btnGoogleAuth: document.getElementById('btnGoogleAuth'),

  // Profil
  profAvatar: document.getElementById('profAvatar'),
  profFullName: document.getElementById('profFullName'),
  profUsername: document.getElementById('profUsername'),
  profLevelBadge: document.getElementById('profLevelBadge'),
  profId: document.getElementById('profId'),
  profAccountNum: document.getElementById('profAccountNum'),
  profCurrentXp: document.getElementById('profCurrentXp'),
  profXpBar: document.getElementById('profXpBar'),
  profNextLevelRemaining: document.getElementById('profNextLevelRemaining'),
  profBestWpm: document.getElementById('profBestWpm'),
  profAvgWpm: document.getElementById('profAvgWpm'),
  profAvgAcc: document.getElementById('profAvgAcc'),
  profTotalTests: document.getElementById('profTotalTests'),
  btnLogout: document.getElementById('btnLogout'),

  // Do'stlar
  friendSearchInput: document.getElementById('friendSearchInput'),
  btnSearchFriends: document.getElementById('btnSearchFriends'),
  searchResultsContainer: document.getElementById('searchResultsContainer'),
  friendRequestsSection: document.getElementById('friendRequestsSection'),
  friendRequestsList: document.getElementById('friendRequestsList'),
  requestsCount: document.getElementById('requestsCount'),
  friendsListContainer: document.getElementById('friendsListContainer'),

  // Dev Rooms Arena (Katta to'liq oyna)
  btnCloseRoomsArena: document.getElementById('btnCloseRoomsArena'),
  roomsLobbyView: document.getElementById('roomsLobbyView'),
  createRoomFormView: document.getElementById('createRoomFormView'),
  activeRoomView: document.getElementById('activeRoomView'),
  btnCreateRoomOpen: document.getElementById('btnCreateRoomOpen'),
  btnCancelCreateRoom: document.getElementById('btnCancelCreateRoom'),
  btnSubmitCreateRoom: document.getElementById('btnSubmitCreateRoom'),
  joinRoomCodeInput: document.getElementById('joinRoomCodeInput'),
  btnJoinByCode: document.getElementById('btnJoinByCode'),
  publicRoomsList: document.getElementById('publicRoomsList'),
  newRoomName: document.getElementById('newRoomName'),
  newRoomLang: document.getElementById('newRoomLang'),
  newRoomMode: document.getElementById('newRoomMode'),

  // Xona ichi
  activeRoomName: document.getElementById('activeRoomName'),
  activeRoomCode: document.getElementById('activeRoomCode'),
  activeRoomLangBadge: document.getElementById('activeRoomLangBadge'),
  btnCopyRoomLink: document.getElementById('btnCopyRoomLink'),
  btnStartRace: document.getElementById('btnStartRace'),
  btnLeaveRoom: document.getElementById('btnLeaveRoom'),
  raceTracksContainer: document.getElementById('raceTracksContainer'),
  multiplayerTypingWrapper: document.getElementById('multiplayerTypingWrapper'),
  multiCountdownOverlay: document.getElementById('multiCountdownOverlay'),
  multiCountdownNum: document.getElementById('multiCountdownNum'),
  multiCaret: document.getElementById('multiCaret'),
  multiWordsContainer: document.getElementById('multiWordsContainer'),
  roomChatMessages: document.getElementById('roomChatMessages'),
  roomChatForm: document.getElementById('roomChatForm'),
  roomChatInput: document.getElementById('roomChatInput'),

  // Leaderboard
  lbTabWpm: document.getElementById('lbTabWpm'),
  lbTabLevel: document.getElementById('lbTabLevel'),
  leaderboardList: document.getElementById('leaderboardList'),

  // Result
  resWpm: document.getElementById('resWpm'),
  resAcc: document.getElementById('resAcc'),
  resRawWpm: document.getElementById('resRawWpm'),
  resChars: document.getElementById('resChars'),
  resTime: document.getElementById('resTime'),
  resXpEarned: document.getElementById('resXpEarned'),
  resLevelUpBadge: document.getElementById('resLevelUpBadge'),
  resNewLevelNum: document.getElementById('resNewLevelNum'),
  btnResultRestart: document.getElementById('btnResultRestart'),
};

// ==========================================
// MODALLARNI KO'RSATISH / YOPISH
// ==========================================
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('hidden');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
}

document.querySelectorAll('.modal-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    const parent = btn.closest('.fixed');
    closeModal(parent);
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    closeModal(e.target);
  }

  if (DOM.userDropdownMenu && !DOM.userDropdownMenu.contains(e.target) && !DOM.userDropdownTrigger.contains(e.target)) {
    DOM.userDropdownMenu.classList.add('hidden');
  }

  if (DOM.languageDropdown && !DOM.languageDropdown.contains(e.target) && !DOM.btnLanguageSelector.contains(e.target)) {
    DOM.languageDropdown.classList.add('hidden');
  }
});

DOM.userDropdownTrigger?.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.userDropdownMenu.classList.toggle('hidden');
});

DOM.btnLanguageSelector?.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.languageDropdown.classList.toggle('hidden');
  if (!DOM.languageDropdown.classList.contains('hidden')) {
    DOM.langSearchInput.focus();
  }
});

// Til qidirish
DOM.langSearchInput?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const options = DOM.langListContainer.querySelectorAll('.lang-option');
  options.forEach((opt) => {
    const text = opt.textContent.toLowerCase();
    opt.style.display = text.includes(query) ? 'block' : 'none';
  });
});

// Til tanlash (Tanlangan til DOIM saqlanadi!)
DOM.langListContainer?.querySelectorAll('.lang-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    const lang = opt.dataset.lang;
    state.currentLanguage = lang;
    localStorage.setItem('snaketype_language', lang);

    updateLanguageUI(opt.textContent.trim());

    DOM.languageDropdown.classList.add('hidden');
    state.mainEngine.setLanguage(lang);
    showToast(`Til saqlandi: ${opt.textContent.trim()}`);
  });
});

function updateLanguageUI(displayName) {
  if (DOM.currentLanguageLabel) {
    DOM.currentLanguageLabel.textContent = displayName.toLowerCase();
  }
  DOM.langListContainer?.querySelectorAll('.lang-option').forEach((o) => {
    if (o.dataset.lang === state.currentLanguage) {
      o.className = 'lang-option w-full text-left px-3 py-1.5 rounded-lg text-[#e2b714] font-bold bg-[#323437] hover:bg-[#383a3d] transition cursor-pointer';
    } else {
      o.className = 'lang-option w-full text-left px-3 py-1.5 rounded-lg text-[#646669] hover:text-[#d1d0c5] hover:bg-[#323437] transition cursor-pointer';
    }
  });
}

// User dropdown elementlari
DOM.menuItemProfile?.addEventListener('click', () => {
  DOM.userDropdownMenu.classList.add('hidden');
  openProfileModal();
});

DOM.menuItemFriends?.addEventListener('click', () => {
  DOM.userDropdownMenu.classList.add('hidden');
  openModal(DOM.friendsModal);
  loadFriends();
});

DOM.menuItemRooms?.addEventListener('click', () => {
  DOM.userDropdownMenu.classList.add('hidden');
  openRoomsHandler();
});

DOM.menuItemLogout?.addEventListener('click', logoutUser);

// ==========================================
// CONFIG BAR (@ punctuation, # numbers, time, words, values)
// ==========================================
function updatePunctuationUI() {
  if (state.includePunctuation) {
    DOM.togglePunctuation?.classList.add('text-[#e2b714]', 'font-bold');
    DOM.togglePunctuation?.classList.remove('text-[#646669]');
  } else {
    DOM.togglePunctuation?.classList.remove('text-[#e2b714]', 'font-bold');
    DOM.togglePunctuation?.classList.add('text-[#646669]');
  }
}

function updateNumbersUI() {
  if (state.includeNumbers) {
    DOM.toggleNumbers?.classList.add('text-[#e2b714]', 'font-bold');
    DOM.toggleNumbers?.classList.remove('text-[#646669]');
  } else {
    DOM.toggleNumbers?.classList.remove('text-[#e2b714]', 'font-bold');
    DOM.toggleNumbers?.classList.add('text-[#646669]');
  }
}

DOM.togglePunctuation?.addEventListener('click', () => {
  state.includePunctuation = !state.includePunctuation;
  localStorage.setItem('snaketype_punct', state.includePunctuation);
  updatePunctuationUI();
  state.mainEngine.setOptions({ includePunctuation: state.includePunctuation });
  showToast(state.includePunctuation ? 'Tinish belgilari yoqildi' : 'Tinish belgilari o\'chirildi');
});

DOM.toggleNumbers?.addEventListener('click', () => {
  state.includeNumbers = !state.includeNumbers;
  localStorage.setItem('snaketype_num', state.includeNumbers);
  updateNumbersUI();
  state.mainEngine.setOptions({ includeNumbers: state.includeNumbers });
  showToast(state.includeNumbers ? 'Raqamlar yoqildi' : 'Raqamlar o\'chirildi');
});

DOM.btnModeTime?.addEventListener('click', () => {
  state.currentMode = 'time';
  localStorage.setItem('snaketype_mode', 'time');
  DOM.btnModeTime.className = 'mode-type-btn text-[#e2b714] font-semibold flex items-center gap-1 transition cursor-pointer';
  DOM.btnModeWords.className = 'mode-type-btn hover:text-[#d1d0c5] flex items-center gap-1 transition cursor-pointer';
  state.currentModeValue = 30;
  localStorage.setItem('snaketype_mode_val', 30);
  renderModeValues();
});

DOM.btnModeWords?.addEventListener('click', () => {
  state.currentMode = 'words';
  localStorage.setItem('snaketype_mode', 'words');
  DOM.btnModeWords.className = 'mode-type-btn text-[#e2b714] font-semibold flex items-center gap-1 transition cursor-pointer';
  DOM.btnModeTime.className = 'mode-type-btn hover:text-[#d1d0c5] flex items-center gap-1 transition cursor-pointer';
  state.currentModeValue = 25;
  localStorage.setItem('snaketype_mode_val', 25);
  renderModeValues();
});

DOM.btnModeRooms?.addEventListener('click', openRoomsHandler);

function renderModeValues() {
  const container = DOM.modeValuesContainer;
  if (!container) return;

  if (state.currentMode === 'time') {
    container.innerHTML = `
      <button data-val="15" class="mode-val-btn ${state.currentModeValue === 15 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">15</button>
      <button data-val="30" class="mode-val-btn ${state.currentModeValue === 30 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">30</button>
      <button data-val="60" class="mode-val-btn ${state.currentModeValue === 60 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">60</button>
      <button data-val="120" class="mode-val-btn ${state.currentModeValue === 120 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">120</button>
    `;
  } else {
    container.innerHTML = `
      <button data-val="10" class="mode-val-btn ${state.currentModeValue === 10 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">10</button>
      <button data-val="25" class="mode-val-btn ${state.currentModeValue === 25 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">25</button>
      <button data-val="50" class="mode-val-btn ${state.currentModeValue === 50 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">50</button>
      <button data-val="100" class="mode-val-btn ${state.currentModeValue === 100 ? 'text-[#e2b714] font-bold' : 'hover:text-[#d1d0c5]'} transition cursor-pointer">100</button>
    `;
  }

  container.querySelectorAll('.mode-val-btn').forEach((b) => {
    b.addEventListener('click', () => {
      container.querySelectorAll('.mode-val-btn').forEach((item) => {
        item.className = 'mode-val-btn hover:text-[#d1d0c5] transition cursor-pointer';
      });
      b.className = 'mode-val-btn text-[#e2b714] font-bold transition cursor-pointer';

      state.currentModeValue = parseInt(b.dataset.val);
      localStorage.setItem('snaketype_mode_val', state.currentModeValue);
      state.mainEngine.setMode(state.currentMode, state.currentModeValue);
      showToast(`${state.currentMode === 'time' ? 'Vaqt' : 'So\'zlar'}: ${state.currentModeValue}`);
    });
  });

  state.mainEngine.setMode(state.currentMode, state.currentModeValue);
}

// ==========================================
// TYPING ENGINE INITIALIZATION
// ==========================================
function initMainTypingEngine() {
  state.mainEngine = new TypingEngine({
    containerEl: DOM.wordsContainer,
    caretEl: DOM.caretCursor,
    timerEl: DOM.liveTimer,
    liveWpmEl: DOM.liveWpm,
    liveAccEl: DOM.liveAcc,
    onProgress: () => {
      DOM.liveTimer.style.opacity = '1';
      DOM.liveStatsBox.style.opacity = '1';
    },
    onFinish: handleTestFinish,
  });

  state.mainEngine.setLanguage(state.currentLanguage);
  state.mainEngine.setOptions({
    includePunctuation: state.includePunctuation,
    includeNumbers: state.includeNumbers,
  });
  state.mainEngine.setMode(state.currentMode, state.currentModeValue);

  updatePunctuationUI();
  updateNumbersUI();

  // Tanlangan til nomini headerga chiqarish
  const activeOpt = DOM.langListContainer?.querySelector(`[data-lang="${state.currentLanguage}"]`);
  if (activeOpt) {
    updateLanguageUI(activeOpt.textContent.trim());
  }
}

async function handleTestFinish(results) {
  DOM.liveTimer.style.opacity = '0';
  DOM.liveStatsBox.style.opacity = '0';

  DOM.resWpm.textContent = results.wpm;
  DOM.resAcc.textContent = `${results.accuracy}%`;
  DOM.resRawWpm.textContent = results.rawWpm;
  DOM.resChars.textContent = `${results.characters.correct}/${results.characters.incorrect}/${results.characters.extra}/${results.characters.missed}`;
  DOM.resTime.textContent = `${results.timeSeconds}s`;

  let xpEarned = Math.round(results.wpm * 1.5 + (results.accuracy > 95 ? 40 : 10) + results.timeSeconds);
  DOM.resXpEarned.textContent = `+${xpEarned} XP`;
  DOM.resLevelUpBadge.classList.add('hidden');

  if (state.currentUser) {
    try {
      const response = await statsAPI.saveResult(results);
      if (response.data.success && response.data.userUpdateInfo) {
        const update = response.data.userUpdateInfo;
        state.currentUser.level = update.level;
        state.currentUser.xp = update.xp;
        state.currentUser.stats = update.stats;
        updateHeaderUserUI();

        if (update.leveledUp) {
          DOM.resLevelUpBadge.classList.remove('hidden');
          DOM.resNewLevelNum.textContent = `Level ${update.newLevel}`;
          triggerConfetti();
          showToast(`Tabriklaymiz! Level ${update.newLevel} ga erishdingiz!`, 'success');
        }
      }
    } catch (err) {
      console.error('Stats saqlashda xato:', err);
    }
  }

  openModal(DOM.resultModal);
}

function triggerConfetti() {
  try {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  } catch (e) {}
}

DOM.btnRestart?.addEventListener('click', () => {
  DOM.liveTimer.style.opacity = '0';
  DOM.liveStatsBox.style.opacity = '0';
  state.mainEngine.restart();
});

DOM.btnResultRestart?.addEventListener('click', () => {
  closeModal(DOM.resultModal);
  DOM.liveTimer.style.opacity = '0';
  DOM.liveStatsBox.style.opacity = '0';
  state.mainEngine.restart();
});

// ==========================================
// AUTENTIFIKATSIYA
// ==========================================
DOM.btnOpenAuth?.addEventListener('click', () => openModal(DOM.authModal));

DOM.authTabLogin?.addEventListener('click', () => {
  DOM.authTabLogin.className = 'flex-1 py-2 text-center font-bold text-sm text-[#e2b714] border-b-2 border-[#e2b714] transition cursor-pointer';
  DOM.authTabRegister.className = 'flex-1 py-2 text-center font-bold text-sm text-[#646669] border-b-2 border-transparent hover:text-[#d1d0c5] transition cursor-pointer';
  DOM.loginForm.classList.remove('hidden');
  DOM.registerForm.classList.add('hidden');
  DOM.authErrorMsg.classList.add('hidden');
});

DOM.authTabRegister?.addEventListener('click', () => {
  DOM.authTabRegister.className = 'flex-1 py-2 text-center font-bold text-sm text-[#e2b714] border-b-2 border-[#e2b714] transition cursor-pointer';
  DOM.authTabLogin.className = 'flex-1 py-2 text-center font-bold text-sm text-[#646669] border-b-2 border-transparent hover:text-[#d1d0c5] transition cursor-pointer';
  DOM.registerForm.classList.remove('hidden');
  DOM.loginForm.classList.add('hidden');
  DOM.authErrorMsg.classList.add('hidden');
});

DOM.loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const parol = document.getElementById('loginPassword').value;

  try {
    const res = await authAPI.login({ username, parol });
    if (res.data.success) {
      localStorage.setItem('snaketype_token', res.data.token);
      state.currentUser = res.data.user;
      updateHeaderUserUI();
      closeModal(DOM.authModal);
      showToast(`Xush kelibsiz, ${state.currentUser.ism}!`, 'success');
      loadFriends();
    }
  } catch (err) {
    DOM.authErrorMsg.textContent = err.response?.data?.message || 'Kirishda xatolik';
    DOM.authErrorMsg.classList.remove('hidden');
  }
});

DOM.registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ism = document.getElementById('regIsm').value.trim();
  const familya = document.getElementById('regFamilya').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const parol = document.getElementById('regPassword').value;
  const hisob_raqami = document.getElementById('regHisobRaqami').value.trim();

  try {
    const res = await authAPI.register({
      ism,
      familya,
      username,
      parol,
      hisob_raqami: hisob_raqami || undefined,
    });

    if (res.data.success) {
      localStorage.setItem('snaketype_token', res.data.token);
      state.currentUser = res.data.user;
      updateHeaderUserUI();
      closeModal(DOM.authModal);
      showToast(`Hisob yaratildi! Hisob: ${state.currentUser.hisob_raqami}`, 'success');
      loadFriends();
    }
  } catch (err) {
    DOM.authErrorMsg.textContent = err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik';
    DOM.authErrorMsg.classList.remove('hidden');
  }
});

DOM.btnGoogleAuth?.addEventListener('click', async () => {
  try {
    const demoGoogleUser = {
      googleId: `google_${Date.now()}`,
      email: `google.user.${Math.floor(100 + Math.random() * 900)}@gmail.com`,
      name: 'Google Typist',
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=google_${Date.now()}`,
    };

    const res = await authAPI.googleAuth(demoGoogleUser);
    if (res.data.success) {
      localStorage.setItem('snaketype_token', res.data.token);
      state.currentUser = res.data.user;
      updateHeaderUserUI();
      closeModal(DOM.authModal);
      showToast(`Google orqali kirdingiz: ${state.currentUser.ism}!`, 'success');
      loadFriends();
    }
  } catch (err) {
    DOM.authErrorMsg.textContent = err.response?.data?.message || 'Google orqali kirishda xato';
    DOM.authErrorMsg.classList.remove('hidden');
  }
});

async function checkAuthStatus() {
  const token = localStorage.getItem('snaketype_token');
  if (!token) return;

  try {
    const res = await authAPI.getMe();
    if (res.data.success) {
      state.currentUser = res.data.user;
      updateHeaderUserUI();
      loadFriends();
    }
  } catch (err) {
    localStorage.removeItem('snaketype_token');
    state.currentUser = null;
  }
}

function updateHeaderUserUI() {
  if (state.currentUser) {
    DOM.btnOpenAuth.classList.add('hidden');
    DOM.userDropdownTrigger.classList.remove('hidden');
    DOM.headerUsername.textContent = state.currentUser.username.toUpperCase();
    DOM.headerUserLevel.textContent = state.currentUser.level || 1;

    DOM.dropdownFullName.textContent = `${state.currentUser.ism} ${state.currentUser.familya}`;
    DOM.dropdownId.textContent = `ID: ${state.currentUser.id || 'USR-000000'}`;
    DOM.dropdownAccountNum.textContent = `Hisob: ${state.currentUser.hisob_raqami}`;
  } else {
    DOM.btnOpenAuth.classList.remove('hidden');
    DOM.userDropdownTrigger.classList.add('hidden');
    DOM.userDropdownMenu.classList.add('hidden');
  }
}

function openProfileModal() {
  if (!state.currentUser) return;
  const u = state.currentUser;

  DOM.profAvatar.src = u.avatar;
  DOM.profFullName.textContent = `${u.ism} ${u.familya}`;
  DOM.profUsername.textContent = u.username;
  DOM.profLevelBadge.textContent = `Level ${u.level || 1}`;
  DOM.profId.textContent = u.id || `USR-${u._id.slice(-6)}`;
  DOM.profAccountNum.textContent = u.hisob_raqami;

  DOM.profCurrentXp.textContent = u.xp || 0;
  const currentLevel = u.level || 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100;
  const prevLevelXp = Math.pow(currentLevel - 1, 2) * 100;
  const progressInLevel = Math.max(0, (u.xp || 0) - prevLevelXp);
  const totalInLevel = Math.max(1, nextLevelXp - prevLevelXp);
  const percent = Math.min(100, Math.round((progressInLevel / totalInLevel) * 100));

  DOM.profXpBar.style.width = `${percent}%`;
  DOM.profNextLevelRemaining.textContent = `Keyingi levelgacha: ${Math.max(0, nextLevelXp - (u.xp || 0))} XP`;

  DOM.profBestWpm.textContent = u.stats?.bestWpm || 0;
  DOM.profAvgWpm.textContent = u.stats?.avgWpm || 0;
  DOM.profAvgAcc.textContent = `${u.stats?.avgAccuracy || 0}%`;
  DOM.profTotalTests.textContent = u.stats?.testsCompleted || 0;

  openModal(DOM.profileModal);
}

function logoutUser() {
  localStorage.removeItem('snaketype_token');
  state.currentUser = null;
  updateHeaderUserUI();
  closeModal(DOM.profileModal);
  showToast('Tizimdan chiqdingiz');
}

DOM.btnLogout?.addEventListener('click', logoutUser);

// ==========================================
// DO'STLAR TIZIMI
// ==========================================
DOM.btnOpenFriends?.addEventListener('click', () => {
  if (!state.currentUser) {
    openModal(DOM.authModal);
    showToast('Avval tizimga kiring', 'info');
    return;
  }
  openModal(DOM.friendsModal);
  loadFriends();
});

DOM.btnSearchFriends?.addEventListener('click', searchUsersHandler);
DOM.friendSearchInput?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') searchUsersHandler();
});

async function searchUsersHandler() {
  const query = DOM.friendSearchInput.value.trim();
  if (query.length < 2) {
    showToast('Kamida 2 ta belgi kiriting', 'error');
    return;
  }

  try {
    const res = await userAPI.searchUsers(query);
    renderSearchResults(res.data.users || []);
  } catch (err) {
    showToast(err.response?.data?.message || 'Qidirishda xatolik', 'error');
  }
}

function renderSearchResults(users) {
  DOM.searchResultsContainer.innerHTML = '';
  DOM.searchResultsContainer.classList.remove('hidden');

  if (users.length === 0) {
    DOM.searchResultsContainer.innerHTML = `<div class="p-2 text-xs text-[#646669] text-center">Foydalanuvchi topilmadi</div>`;
    return;
  }

  users.forEach((u) => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-2 bg-[#323437] rounded-xl border border-[#3a3d40]';
    item.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${u.avatar}" class="w-6 h-6 rounded-full bg-[#2c2e31]" />
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#d1d0c5]">${u.ism} ${u.familya}</span>
          <span class="text-[10px] text-[#646669] font-mono">@${u.username} • Hisob: ${u.hisob_raqami}</span>
        </div>
      </div>
      <button data-id="${u._id}" class="btn-send-friend-req px-2.5 py-1 bg-[#e2b714] text-[#323437] rounded-lg text-xs font-bold hover:bg-[#d4a912] transition cursor-pointer">
        + Do'stlashish
      </button>
    `;
    DOM.searchResultsContainer.appendChild(item);
  });

  DOM.searchResultsContainer.querySelectorAll('.btn-send-friend-req').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const res = await userAPI.sendFriendRequest(btn.dataset.id);
        showToast(res.data.message || 'So\'rov yuborildi!', 'success');
        btn.textContent = 'Yuborildi';
        btn.disabled = true;
        btn.className = 'px-2.5 py-1 bg-[#323437] text-[#646669] rounded-lg text-xs font-bold';
      } catch (err) {
        showToast(err.response?.data?.message || 'Xatolik', 'error');
      }
    });
  });
}

async function loadFriends() {
  if (!state.currentUser) return;
  try {
    const res = await userAPI.getFriends();
    const { friends, friendRequests } = res.data;

    const pendingReqs = (friendRequests || []).filter((r) => r.status === 'pending');
    if (pendingReqs.length > 0) {
      DOM.friendRequestBadge.classList.remove('hidden');
      DOM.notifBadge.classList.remove('hidden');
      DOM.friendRequestsSection.classList.remove('hidden');
      DOM.requestsCount.textContent = pendingReqs.length;
      renderFriendRequests(pendingReqs);
    } else {
      DOM.friendRequestBadge.classList.add('hidden');
      DOM.notifBadge.classList.add('hidden');
      DOM.friendRequestsSection.classList.add('hidden');
    }

    renderFriendsList(friends || []);
  } catch (err) {
    console.error('Do\'stlarni yuklashda xatolik:', err);
  }
}

function renderFriendRequests(requests) {
  DOM.friendRequestsList.innerHTML = '';
  requests.forEach((r) => {
    const sender = r.from;
    if (!sender) return;

    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 bg-[#2c2e31] rounded-lg text-xs';
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${sender.avatar}" class="w-5 h-5 rounded-full" />
        <span class="font-bold text-[#d1d0c5]">${sender.username}</span>
      </div>
      <div class="flex gap-1">
        <button data-reqid="${r._id}" class="btn-accept-req px-2 py-0.5 bg-[#2ecc71] text-[#323437] font-bold rounded text-[11px] cursor-pointer">Qabul</button>
        <button data-reqid="${r._id}" class="btn-reject-req px-2 py-0.5 bg-[#ca4754]/20 text-[#ca4754] font-bold rounded text-[11px] cursor-pointer">Rad</button>
      </div>
    `;
    DOM.friendRequestsList.appendChild(div);
  });

  DOM.friendRequestsList.querySelectorAll('.btn-accept-req').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const res = await userAPI.acceptFriendRequest(btn.dataset.reqid);
        showToast(res.data.message || 'Do\'stlik qabul qilindi!', 'success');
        loadFriends();
      } catch (e) {
        showToast('Xatolik', 'error');
      }
    });
  });

  DOM.friendRequestsList.querySelectorAll('.btn-reject-req').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await userAPI.rejectFriendRequest(btn.dataset.reqid);
        showToast('So\'rov rad etildi');
        loadFriends();
      } catch (e) {
        showToast('Xatolik', 'error');
      }
    });
  });
}

function renderFriendsList(friends) {
  DOM.friendsListContainer.innerHTML = '';
  if (friends.length === 0) {
    DOM.friendsListContainer.innerHTML = `<div class="text-center py-6 text-xs text-[#646669]">Do'stlar ro'yxati hozircha bo'sh</div>`;
    return;
  }

  friends.forEach((f) => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 bg-[#323437] rounded-xl border border-[#3a3d40]';
    div.innerHTML = `
      <div class="flex items-center gap-2.5">
        <img src="${f.avatar}" class="w-7 h-7 rounded-full bg-[#2c2e31]" />
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <span class="text-xs font-bold text-[#d1d0c5]">${f.ism} ${f.familya}</span>
            <span class="text-[9px] text-[#e2b714] font-bold">Lvl ${f.level || 1}</span>
          </div>
          <span class="text-[10px] text-[#646669] font-mono">@${f.username} • Best: ${f.stats?.bestWpm || 0} WPM</span>
        </div>
      </div>
      <button data-username="${f.username}" class="btn-invite-room px-2 py-1 bg-[#2c2e31] hover:bg-[#383a3d] text-[#e2b714] text-[10px] font-bold rounded-lg transition cursor-pointer">
        Xonaga taklif
      </button>
    `;
    DOM.friendsListContainer.appendChild(div);
  });

  DOM.friendsListContainer.querySelectorAll('.btn-invite-room').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(DOM.friendsModal);
      openRoomsHandler();
      showToast(`${btn.dataset.username} ga poyga taklifi yuborildi!`, 'info');
    });
  });
}

// ==========================================
// KATTA DEV MONKEYTYPE ROOMS ARENA (FULL-SCREEN MULTIPLAYER)
// ==========================================
function getSafeUser() {
  if (state.currentUser) return state.currentUser;
  let guestName = localStorage.getItem('snaketype_guest_name');
  if (!guestName) {
    guestName = `Mehmon_${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('snaketype_guest_name', guestName);
  }
  return {
    _id: `guest_${guestName}`,
    username: guestName,
    ism: 'Mehmon',
    familya: 'Typist',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestName}`,
    level: 1,
  };
}

function openRoomsHandler() {
  openModal(DOM.roomsModal);
  initSocketConnection();
}

DOM.btnOpenRooms?.addEventListener('click', openRoomsHandler);
DOM.footerRoomsBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  openRoomsHandler();
});

DOM.btnCloseRoomsArena?.addEventListener('click', () => {
  if (state.activeRoom) {
    socketService.leaveRoom();
    state.activeRoom = null;
  }
  closeModal(DOM.roomsModal);
});

function initSocketConnection() {
  const socket = initSocket();

  socket.off('room:created');
  socket.off('room:joined');
  socket.off('room:updated');
  socket.off('room:countdown');
  socket.off('room:race_started');
  socket.off('room:player_progress');
  socket.off('room:player_finished_announcement');
  socket.off('room:race_finished');
  socket.off('room:new_message');
  socket.off('rooms:list_update');
  socket.off('room:error');

  socket.on('room:created', handleRoomEnter);
  socket.on('room:joined', handleRoomEnter);
  socket.on('room:updated', handleRoomUpdate);
  socket.on('room:countdown', handleRoomCountdown);
  socket.on('room:race_started', handleRaceStarted);
  socket.on('room:player_progress', handleRemotePlayerProgress);
  socket.on('room:player_finished_announcement', handlePlayerFinishAnnounce);
  socket.on('room:race_finished', handleRaceFinished);
  socket.on('room:new_message', handleNewChatMessage);
  socket.on('rooms:list_update', handleRoomsListUpdate);
  socket.on('room:error', (err) => showToast(err.message, 'error'));
}

DOM.btnCreateRoomOpen?.addEventListener('click', () => {
  DOM.roomsLobbyView.classList.add('hidden');
  DOM.createRoomFormView.classList.remove('hidden');
});

DOM.btnCancelCreateRoom?.addEventListener('click', () => {
  DOM.createRoomFormView.classList.add('hidden');
  DOM.roomsLobbyView.classList.remove('hidden');
});

DOM.btnSubmitCreateRoom?.addEventListener('click', () => {
  const roomName = DOM.newRoomName.value.trim();
  const language = DOM.newRoomLang.value;
  const mode = DOM.newRoomMode.value;
  const user = getSafeUser();

  socketService.createRoom({
    roomName: roomName || `${user.username} poygasi`,
    language,
    mode,
    user,
  });
});

DOM.btnJoinByCode?.addEventListener('click', () => {
  const code = DOM.joinRoomCodeInput.value.trim().toUpperCase();
  if (!code) {
    showToast('Xona kodini kiriting!', 'error');
    return;
  }
  const user = getSafeUser();
  socketService.joinRoom(code, user);
});

DOM.btnLeaveRoom?.addEventListener('click', () => {
  socketService.leaveRoom();
  state.activeRoom = null;
  DOM.activeRoomView.classList.add('hidden');
  DOM.roomsLobbyView.classList.remove('hidden');
  showToast('Xonadan chiqdingiz');
});

DOM.btnCopyRoomLink?.addEventListener('click', () => {
  if (state.activeRoom) {
    const textToCopy = state.activeRoom.roomCode;
    navigator.clipboard.writeText(textToCopy);
    showToast(`Xona kodi (${textToCopy}) nusxalandi! Do'stlaringizga yuboring!`, 'success');
  }
});

function handleRoomEnter(room) {
  state.activeRoom = room;
  DOM.createRoomFormView.classList.add('hidden');
  DOM.roomsLobbyView.classList.add('hidden');
  DOM.activeRoomView.classList.remove('hidden');

  DOM.activeRoomName.textContent = room.name;
  DOM.activeRoomCode.textContent = room.roomCode;
  if (DOM.activeRoomLangBadge) DOM.activeRoomLangBadge.textContent = room.language;

  const currentU = getSafeUser();
  const isHost = room.hostId === currentU._id || room.hostUsername === currentU.username;
  DOM.btnStartRace.style.display = isHost ? 'block' : 'none';

  renderRaceTracks(room.players);
  renderChatMessages(room.messages || []);
  setupMultiplayerTyping(room.text);
}

function handleRoomUpdate(room) {
  state.activeRoom = room;
  DOM.activeRoomName.textContent = room.name;
  DOM.activeRoomCode.textContent = room.roomCode;

  const currentU = getSafeUser();
  const isHost = room.hostId === currentU._id || room.hostUsername === currentU.username;
  DOM.btnStartRace.style.display = isHost ? 'block' : 'none';

  renderRaceTracks(room.players);
}

function renderRoomsList(rooms) {
  DOM.publicRoomsList.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    DOM.publicRoomsList.innerHTML = `<div class="text-center col-span-full py-12 text-xs text-[#646669]">Ochiq xonalar hozircha yo'q. Birinchi bo'lib yangi xona yarating va do'stlaringizni taklif qiling!</div>`;
    return;
  }

  rooms.forEach((r) => {
    const card = document.createElement('div');
    card.className = 'p-3.5 bg-[#2c2e31] rounded-2xl border border-[#252729] hover:border-[#e2b714] transition cursor-pointer flex justify-between items-center';
    card.innerHTML = `
      <div>
        <h4 class="font-bold text-xs text-[#d1d0c5]">${r.name}</h4>
        <span class="text-[10px] text-[#646669] font-mono">Kod: <strong class="text-[#e2b714]">${r.roomCode}</strong> • ${r.playerCount} o'yinchi</span>
      </div>
      <button data-code="${r.roomCode}" class="btn-join-card px-3.5 py-1.5 bg-[#323437] hover:bg-[#e2b714] hover:text-[#323437] text-xs font-bold rounded-lg text-[#e2b714] transition cursor-pointer">
        Kirish
      </button>
    `;
    DOM.publicRoomsList.appendChild(card);
  });

  DOM.publicRoomsList.querySelectorAll('.btn-join-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const user = getSafeUser();
      socketService.joinRoom(btn.dataset.code, user);
    });
  });
}

function handleRoomsListUpdate(rooms) {
  renderRoomsList(rooms);
}

function renderRaceTracks(players) {
  DOM.raceTracksContainer.innerHTML = '';
  const currentU = getSafeUser();

  players.forEach((p) => {
    const isMe = p.username === currentU?.username;
    const track = document.createElement('div');
    track.className = `p-3 rounded-xl bg-[#323437] relative overflow-hidden border ${isMe ? 'border-[#e2b714] shadow-md' : 'border-[#252729]'}`;

    track.innerHTML = `
      <div class="flex items-center justify-between text-xs mb-1.5">
        <div class="flex items-center gap-2">
          <img src="${p.avatar}" class="w-5 h-5 rounded-full bg-[#2c2e31]" />
          <span class="font-bold ${isMe ? 'text-[#e2b714]' : 'text-[#d1d0c5]'}">${p.username} ${isMe ? '(Siz)' : ''}</span>
          <span class="text-[10px] text-[#2ecc71] font-bold">Lvl ${p.level || 1}</span>
          ${p.rank ? `<span class="px-2 py-0.5 bg-[#e2b714] text-[#323437] font-extrabold rounded text-[10px]">${p.rank}-O'RIN! 🏆</span>` : ''}
        </div>
        <div class="font-mono text-xs text-[#646669]">
          <span class="player-wpm-${p.username} text-[#d1d0c5] font-bold text-sm">${p.wpm || 0}</span> WPM
        </div>
      </div>
      <div class="w-full bg-[#2c2e31] h-3.5 rounded-full overflow-hidden relative">
        <div id="playerBar-${p.username}" class="bg-gradient-to-r from-[#2ecc71] to-[#e2b714] h-full rounded-full transition-all duration-200" style="width: ${p.progress || 0}%"></div>
      </div>
    `;
    DOM.raceTracksContainer.appendChild(track);
  });
}

function setupMultiplayerTyping(text) {
  const words = text ? text.split(' ') : ['salom', 'snaketype', 'multiplayer', 'poyga'];
  if (state.multiEngine) {
    state.multiEngine.destroy();
  }

  const currentU = getSafeUser();

  state.multiEngine = new TypingEngine({
    containerEl: DOM.multiWordsContainer,
    caretEl: DOM.multiCaret,
    timerEl: null,
    liveWpmEl: null,
    liveAccEl: null,
    onProgress: (p) => {
      if (state.activeRoom) {
        socketService.sendProgress({
          roomCode: state.activeRoom.roomCode,
          progress: p.progress,
          wpm: p.wpm,
          accuracy: p.accuracy,
        });

        const myBar = document.getElementById(`playerBar-${currentU.username}`);
        if (myBar) myBar.style.width = `${p.progress}%`;
      }
    },
    onFinish: (res) => {
      if (state.activeRoom) {
        socketService.finishRace({
          roomCode: state.activeRoom.roomCode,
          wpm: res.wpm,
          accuracy: res.accuracy,
          timeTaken: res.timeSeconds,
        });
      }
    },
  });

  state.multiEngine.setText(words);
}

DOM.btnStartRace?.addEventListener('click', () => {
  if (state.activeRoom) {
    socketService.startRace(state.activeRoom.roomCode);
  }
});

function handleRoomCountdown({ seconds, room }) {
  DOM.multiCountdownOverlay.classList.remove('hidden');
  let count = seconds;
  DOM.multiCountdownNum.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      DOM.multiCountdownNum.textContent = count;
    } else {
      clearInterval(interval);
      DOM.multiCountdownNum.textContent = 'START! 🏁';
      setTimeout(() => {
        DOM.multiCountdownOverlay.classList.add('hidden');
      }, 500);
    }
  }, 1000);
}

function handleRaceStarted(room) {
  state.activeRoom = room;
  setupMultiplayerTyping(room.text);
  showToast('Poyga boshlandi! Tezroq yozing!', 'success');
}

function handleRemotePlayerProgress({ username, progress, wpm }) {
  const bar = document.getElementById(`playerBar-${username}`);
  if (bar) bar.style.width = `${progress}%`;

  const wpmEl = document.querySelector(`.player-wpm-${username}`);
  if (wpmEl) wpmEl.textContent = wpm;
}

function handlePlayerFinishAnnounce({ player, rank }) {
  showToast(`${player.username} marraga yetdi! O'rni: ${rank}`, 'success');
  const currentU = getSafeUser();
  if (player.username === currentU?.username) {
    triggerConfetti();
  }
}

function handleRaceFinished(room) {
  state.activeRoom = room;
  renderRaceTracks(room.players);
  showToast('Barcha o\'yinchilar poygani yakunladi!', 'success');
}

// Xona Chati
DOM.roomChatForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = DOM.roomChatInput.value.trim();
  if (!text || !state.activeRoom) return;

  socketService.sendMessage({
    roomCode: state.activeRoom.roomCode,
    text,
  });

  DOM.roomChatInput.value = '';
});

function handleNewChatMessage(msg) {
  appendChatMessage(msg);
}

function renderChatMessages(messages) {
  DOM.roomChatMessages.innerHTML = '';
  messages.forEach(appendChatMessage);
}

function appendChatMessage(msg) {
  const currentU = getSafeUser();
  const div = document.createElement('div');
  if (msg.isSystem) {
    div.className = 'text-[11px] text-[#e2b714] italic py-1 text-center';
    div.textContent = msg.text;
  } else {
    const isMe = msg.sender === currentU?.username;
    div.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} py-1`;
    div.innerHTML = `
      <span class="text-[9px] text-[#646669] mb-0.5">${msg.sender} • ${msg.createdAt}</span>
      <div class="px-3 py-1.5 rounded-xl text-xs max-w-[85%] ${isMe ? 'bg-[#e2b714] text-[#323437] font-semibold' : 'bg-[#323437] text-[#d1d0c5]'}">
        ${msg.text}
      </div>
    `;
  }
  DOM.roomChatMessages.appendChild(div);
  DOM.roomChatMessages.scrollTop = DOM.roomChatMessages.scrollHeight;
}

// ==========================================
// LEADERBOARD (YETAKCHILAR)
// ==========================================
DOM.btnOpenLeaderboard?.addEventListener('click', async () => {
  openModal(DOM.leaderboardModal);
  loadLeaderboard('wpm');
});

DOM.lbTabWpm?.addEventListener('click', () => {
  DOM.lbTabWpm.className = 'flex-1 py-1.5 text-center font-bold text-xs text-[#e2b714] border-b-2 border-[#e2b714] cursor-pointer';
  DOM.lbTabLevel.className = 'flex-1 py-1.5 text-center font-bold text-xs text-[#646669] border-b-2 border-transparent hover:text-[#d1d0c5] cursor-pointer';
  loadLeaderboard('wpm');
});

DOM.lbTabLevel?.addEventListener('click', () => {
  DOM.lbTabLevel.className = 'flex-1 py-1.5 text-center font-bold text-xs text-[#e2b714] border-b-2 border-[#e2b714] cursor-pointer';
  DOM.lbTabWpm.className = 'flex-1 py-1.5 text-center font-bold text-xs text-[#646669] border-b-2 border-transparent hover:text-[#d1d0c5] cursor-pointer';
  loadLeaderboard('level');
});

async function loadLeaderboard(type = 'wpm') {
  try {
    const res = await userAPI.getLeaderboard();
    const list = type === 'wpm' ? res.data.leaderboards.byWpm : res.data.leaderboards.byLevel;
    renderLeaderboardList(list || [], type);
  } catch (err) {
    showToast('Reytingni yuklashda xatolik', 'error');
  }
}

function renderLeaderboardList(users, type) {
  DOM.leaderboardList.innerHTML = '';
  if (users.length === 0) {
    DOM.leaderboardList.innerHTML = `<div class="text-center py-6 text-xs text-[#646669]">Ma'lumotlar yo'q</div>`;
    return;
  }

  users.forEach((u, idx) => {
    const item = document.createElement('div');
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
    item.className = 'flex items-center justify-between p-2.5 bg-[#323437] rounded-xl border border-[#3a3d40]';

    item.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="w-5 font-mono font-bold text-xs ${idx < 3 ? 'text-[#e2b714]' : 'text-[#646669]'}">${medal}</span>
        <img src="${u.avatar}" class="w-7 h-7 rounded-full bg-[#2c2e31]" />
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#d1d0c5]">${u.ism} ${u.familya}</span>
          <span class="text-[9px] text-[#646669] font-mono">@${u.username} • Hisob: ${u.hisob_raqami}</span>
        </div>
      </div>
      <div class="text-right font-mono">
        ${
          type === 'wpm'
            ? `<div class="text-xs font-bold text-[#e2b714]">${u.stats?.bestWpm || 0} WPM</div><div class="text-[9px] text-[#646669]">${u.stats?.avgAccuracy || 0}% acc</div>`
            : `<div class="text-xs font-bold text-[#e2b714]">Level ${u.level || 1}</div><div class="text-[9px] text-[#646669]">${u.xp || 0} XP</div>`
        }
      </div>
    `;
    DOM.leaderboardList.appendChild(item);
  });
}

// Boshlang'ich yuklash
document.addEventListener('DOMContentLoaded', () => {
  initMainTypingEngine();
  checkAuthStatus();
  initSocket(); // Socket darhol ulanadi
});
