import { getRandomWords } from './words';

export class TypingEngine {
  constructor({
    containerEl,
    caretEl,
    timerEl,
    liveWpmEl,
    liveAccEl,
    onFinish,
    onProgress,
  }) {
    this.container = containerEl;
    this.caret = caretEl;
    this.timerEl = timerEl;
    this.liveWpmEl = liveWpmEl;
    this.liveAccEl = liveAccEl;
    this.onFinish = onFinish;
    this.onProgress = onProgress;

    // Tanlangan til (localStorage dan yuklanadi)
    this.language = localStorage.getItem('snaketype_language') || 'uzbek_latin';
    this.mode = localStorage.getItem('snaketype_mode') || 'time';
    this.modeValue = parseInt(localStorage.getItem('snaketype_mode_val')) || 30;
    this.includePunctuation = localStorage.getItem('snaketype_punct') === 'true';
    this.includeNumbers = localStorage.getItem('snaketype_num') === 'true';

    // Holat (State)
    this.words = [];
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.isRunning = false;
    this.isFinished = false;
    this.startTime = null;
    this.timerInterval = null;
    this.timeLeft = this.modeValue;

    // Kursor miltillashi va satr siljishi
    this.blinkTimeout = null;
    this.initialWordTop = null;

    // Statistika
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;
    this.missedChars = 0;
    this.totalTypedChars = 0;
    this.wpmHistory = [];

    // Klaviaturani tinglash
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.boundHandleKeyDown);

    // Audio click tovushi
    this.audioCtx = null;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }

  playKeySound(isError = false) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (isError) {
        osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(520 + Math.random() * 120, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      }
    } catch (e) {}
  }

  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem('snaketype_language', lang);
    this.restart();
  }

  setMode(mode, value) {
    this.mode = mode;
    this.modeValue = value;
    localStorage.setItem('snaketype_mode', mode);
    localStorage.setItem('snaketype_mode_val', value);
    this.restart();
  }

  setOptions({ includePunctuation, includeNumbers }) {
    if (includePunctuation !== undefined) {
      this.includePunctuation = includePunctuation;
      localStorage.setItem('snaketype_punct', includePunctuation);
    }
    if (includeNumbers !== undefined) {
      this.includeNumbers = includeNumbers;
      localStorage.setItem('snaketype_num', includeNumbers);
    }
    this.restart();
  }

  setText(customWordsArray) {
    this.words = customWordsArray;
    this.renderWords();
    this.resetState();
  }

  restart() {
    this.resetState();
    const count = this.mode === 'words' ? this.modeValue : 75;
    this.words = getRandomWords(this.language, count, {
      includePunctuation: this.includePunctuation,
      includeNumbers: this.includeNumbers,
    });
    this.renderWords();
    this.updateCaretPosition();
  }

  resetState() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.isFinished = false;
    this.startTime = null;
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;
    this.missedChars = 0;
    this.totalTypedChars = 0;
    this.wpmHistory = [];
    this.initialWordTop = null;

    if (this.container) {
      this.container.style.transform = 'translateY(0px)';
    }

    if (this.mode === 'time') {
      this.timeLeft = this.modeValue;
      if (this.timerEl) this.timerEl.textContent = this.timeLeft;
    } else {
      if (this.timerEl) this.timerEl.textContent = `0/${this.modeValue}`;
    }

    if (this.liveWpmEl) this.liveWpmEl.textContent = '0';
    if (this.liveAccEl) this.liveAccEl.textContent = '100%';

    this.startCaretBlink();
  }

  renderWords() {
    if (!this.container) return;
    this.container.innerHTML = '';
    
    // Caretni container ichiga solamiz (offsetLeft/Top aniq ishlashi uchun)
    if (this.caret) {
      this.caret.style.transition = 'none';
      this.container.appendChild(this.caret);
    }
    this.container.style.transform = 'translateY(0px)';

    this.words.forEach((word, wIdx) => {
      const wordSpan = document.createElement('div');
      wordSpan.className = `word ${wIdx === 0 ? 'active-word' : ''}`;
      wordSpan.dataset.wordIndex = wIdx;

      for (let i = 0; i < word.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = word[i];
        letterSpan.dataset.letterIndex = i;
        wordSpan.appendChild(letterSpan);
      }

      this.container.appendChild(wordSpan);
    });

    requestAnimationFrame(() => {
      const firstWord = this.container.querySelector('.word');
      if (firstWord) {
        const offset = this.getElementOffset(firstWord, this.container);
        this.initialWordTop = offset.top;
      }
      this.updateCaretPosition();
      setTimeout(() => {
        if (this.caret) {
          this.caret.style.transition = '';
        }
      }, 50);
    });
  }

  startCaretBlink() {
    if (!this.caret) return;
    clearTimeout(this.blinkTimeout);
    this.caret.classList.add('blinking');
  }

  stopCaretBlink() {
    if (!this.caret) return;
    this.caret.classList.remove('blinking');
    clearTimeout(this.blinkTimeout);
    this.blinkTimeout = setTimeout(() => {
      this.startCaretBlink();
    }, 500);
  }

  startTest() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();

    this.timerInterval = setInterval(() => {
      if (this.mode === 'time') {
        this.timeLeft--;
        if (this.timerEl) this.timerEl.textContent = this.timeLeft;

        this.recordLiveStats();

        if (this.timeLeft <= 0) {
          this.finishTest();
        }
      } else {
        this.recordLiveStats();
      }
    }, 1000);
  }

  recordLiveStats() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return;

    const currentWpm = Math.max(0, Math.round((this.correctChars / 5) / elapsedMinutes));
    const accuracy = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;

    this.wpmHistory.push({
      time: Math.round(elapsedMinutes * 60),
      wpm: currentWpm,
      accuracy,
    });

    if (this.liveWpmEl) this.liveWpmEl.textContent = currentWpm;
    if (this.liveAccEl) this.liveAccEl.textContent = `${accuracy}%`;

    if (this.onProgress) {
      const totalWords = this.words.length;
      const progressPercent = Math.min(100, Math.round((this.currentWordIndex / totalWords) * 100));
      this.onProgress({
        progress: progressPercent,
        wpm: currentWpm,
        accuracy,
      });
    }
  }

  handleKeyDown(e) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      this.restart();
      return;
    }

    if (this.isFinished) return;

    this.stopCaretBlink();

    if (!this.isRunning && e.key.length === 1) {
      this.startTest();
    }

    const words = this.container.querySelectorAll('.word');
    const currentWordEl = words[this.currentWordIndex];
    if (!currentWordEl) return;

    const currentWord = this.words[this.currentWordIndex] || '';
    const letters = currentWordEl.querySelectorAll('.letter');

    // BACKSPACE
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.playKeySound(false);

      if (this.currentLetterIndex > 0) {
        this.currentLetterIndex--;
        const letterEl = letters[this.currentLetterIndex];
        if (letterEl) {
          if (letterEl.classList.contains('extra')) {
            letterEl.remove();
          } else {
            letterEl.className = 'letter';
          }
        }
      } else if (this.currentWordIndex > 0) {
        // Oldingi xatoli so'zga qaytish
        const prevWordEl = words[this.currentWordIndex - 1];
        if (prevWordEl && prevWordEl.classList.contains('has-error')) {
          currentWordEl.classList.remove('active-word');
          this.currentWordIndex--;
          prevWordEl.classList.add('active-word');
          this.currentLetterIndex = prevWordEl.querySelectorAll('.letter').length;
          this.checkLineScroll(prevWordEl);
        }
      }
      this.updateCaretPosition();
      return;
    }

    // BO'SH JOY (SPACE) - KEYINGI SO'ZGA O'TISH
    if (e.key === ' ') {
      e.preventDefault();
      if (this.currentLetterIndex === 0) return;
      this.playKeySound(false);

      // Yozilmagan harflarni xato deb belgilash
      for (let i = this.currentLetterIndex; i < letters.length; i++) {
        letters[i].classList.add('incorrect');
        this.missedChars++;
      }

      const hasErrors = currentWordEl.querySelectorAll('.incorrect, .extra').length > 0;
      if (hasErrors) {
        currentWordEl.classList.add('has-error');
      }

      currentWordEl.classList.remove('active-word');
      this.currentWordIndex++;
      this.currentLetterIndex = 0;

      if (this.mode === 'words') {
        if (this.timerEl) this.timerEl.textContent = `${this.currentWordIndex}/${this.modeValue}`;
        if (this.currentWordIndex >= this.modeValue) {
          this.finishTest();
          return;
        }
      }

      // So'zlar tugashiga yaqinlashganda qo'shish
      if (this.currentWordIndex >= this.words.length - 15 && this.mode === 'time') {
        const moreWords = getRandomWords(this.language, 30, {
          includePunctuation: this.includePunctuation,
          includeNumbers: this.includeNumbers,
        });
        this.words.push(...moreWords);
        moreWords.forEach((word) => {
          const wSpan = document.createElement('div');
          wSpan.className = 'word';
          for (let c of word) {
            const lSpan = document.createElement('span');
            lSpan.className = 'letter';
            lSpan.textContent = c;
            wSpan.appendChild(lSpan);
          }
          this.container.appendChild(wSpan);
        });
      }

      const updatedWords = this.container.querySelectorAll('.word');
      const nextWordEl = updatedWords[this.currentWordIndex];
      if (nextWordEl) {
        nextWordEl.classList.add('active-word');
        this.checkLineScroll(nextWordEl);
      } else {
        this.finishTest();
        return;
      }

      this.updateCaretPosition();
      return;
    }

    // HARF BOSILGANDA
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      this.totalTypedChars++;

      if (this.currentLetterIndex < currentWord.length) {
        const expectedLetter = currentWord[this.currentLetterIndex];
        const letterEl = letters[this.currentLetterIndex];

        if (e.key === expectedLetter) {
          letterEl.classList.add('correct');
          this.correctChars++;
          this.playKeySound(false);
        } else {
          letterEl.classList.add('incorrect');
          this.incorrectChars++;
          this.playKeySound(true);
        }
        this.currentLetterIndex++;
      } else {
        // Qo'shimcha (extra) harf
        if (letters.length < currentWord.length + 8) {
          const extraEl = document.createElement('span');
          extraEl.className = 'letter extra';
          extraEl.textContent = e.key;
          currentWordEl.appendChild(extraEl);
          this.extraChars++;
          this.currentLetterIndex++;
          this.playKeySound(true);
        }
      }

      this.updateCaretPosition();
    }
  }

  // Har qanday elementning containerga nisbatan aniq koordinatalarini hisoblash
  getElementOffset(el, ancestor) {
    if (!el || !ancestor) return { left: 0, top: 0 };

    let left = 0;
    let top = 0;
    let curr = el;
    let reachedAncestor = false;

    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr === ancestor) {
        reachedAncestor = true;
        break;
      }
      left += curr.offsetLeft;
      top += curr.offsetTop;
      curr = curr.offsetParent;
    }

    if (reachedAncestor) {
      return { left, top };
    }

    // Fallback: Agar offsetParent zanjiri uzilgan bo'lsa, getBoundingClientRect dan foydalanamiz
    const elRect = el.getBoundingClientRect();
    const ancestorRect = ancestor.getBoundingClientRect();
    return {
      left: Math.round(elRect.left - ancestorRect.left),
      top: Math.round(elRect.top - ancestorRect.top),
    };
  }

  // Monkeytype 3-qatorli siljish (Scroll/Line jump)
  checkLineScroll(wordEl) {
    if (!wordEl || !this.container) return;
    if (this.initialWordTop === null) {
      const firstWord = this.container.querySelector('.word');
      if (firstWord) {
        const offset = this.getElementOffset(firstWord, this.container);
        this.initialWordTop = offset.top;
      }
    }

    const offset = this.getElementOffset(wordEl, this.container);
    const currentWordTop = offset.top;
    const diff = currentWordTop - (this.initialWordTop || 0);

    // Satr balandligi taxminan 44px
    const lineIndex = Math.max(0, Math.round(diff / 44));

    if (lineIndex >= 2) {
      const scrollOffset = (lineIndex - 1) * 44;
      this.container.style.transform = `translateY(-${scrollOffset}px)`;
    } else {
      this.container.style.transform = 'translateY(0px)';
    }
  }

  // KURSORNI PIKSELMA-PIKSEL 100% ANIQ O'RNATISH (Monkeytype 1:1 original)
  updateCaretPosition() {
    if (!this.caret || !this.container) return;

    const words = this.container.querySelectorAll('.word');
    const currentWordEl = words[this.currentWordIndex];
    if (!currentWordEl) return;

    const letters = currentWordEl.querySelectorAll('.letter');
    const caretHeight = 26; // Monkeytype standart kursor balandligi

    if (this.currentLetterIndex < letters.length) {
      const targetLetter = letters[this.currentLetterIndex];
      const offset = this.getElementOffset(targetLetter, this.container);
      const letterHeight = targetLetter.offsetHeight || 34;
      const topOffset = offset.top + Math.round((letterHeight - caretHeight) / 2);

      this.caret.style.left = `${offset.left}px`;
      this.caret.style.top = `${topOffset}px`;
      this.caret.style.height = `${caretHeight}px`;
    } else if (letters.length > 0) {
      const lastLetter = letters[letters.length - 1];
      const offset = this.getElementOffset(lastLetter, this.container);
      const letterHeight = lastLetter.offsetHeight || 34;
      const topOffset = offset.top + Math.round((letterHeight - caretHeight) / 2);

      this.caret.style.left = `${offset.left + lastLetter.offsetWidth}px`;
      this.caret.style.top = `${topOffset}px`;
      this.caret.style.height = `${caretHeight}px`;
    } else {
      const offset = this.getElementOffset(currentWordEl, this.container);
      const wordHeight = currentWordEl.offsetHeight || 34;
      const topOffset = offset.top + Math.round((wordHeight - caretHeight) / 2);

      this.caret.style.left = `${offset.left}px`;
      this.caret.style.top = `${topOffset}px`;
      this.caret.style.height = `${caretHeight}px`;
    }
  }

  finishTest() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.startCaretBlink();

    const timeTaken = Math.max(1, Math.round((Date.now() - (this.startTime || Date.now())) / 1000));
    const elapsedMinutes = timeTaken / 60;

    const wpm = Math.max(0, Math.round((this.correctChars / 5) / elapsedMinutes));
    const rawWpm = Math.max(0, Math.round((this.totalTypedChars / 5) / elapsedMinutes));
    const accuracy = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;

    const results = {
      wpm,
      rawWpm,
      accuracy,
      characters: {
        correct: this.correctChars,
        incorrect: this.incorrectChars,
        extra: this.extraChars,
        missed: this.missedChars,
        total: this.totalTypedChars,
      },
      timeSeconds: timeTaken,
      mode: `${this.mode} ${this.modeValue}`,
      language: this.language,
      wpmHistory: this.wpmHistory,
    };

    if (this.onFinish) {
      this.onFinish(results);
    }
  }

  destroy() {
    clearInterval(this.timerInterval);
    window.removeEventListener('keydown', this.boundHandleKeyDown);
  }
}
