// アプリケーション全体の状態管理・UI制御

class SutraApp {
  constructor() {
    // 状態管理
    this.currentMode = 'quiz'; // 'quiz' | 'flashcard' | 'overview' | 'history'
    this.selectedSectionId = 1; // 1〜5 または 'all'
    this.quizSubmode = this.loadSetting('sutra_quiz_submode', 'phrase'); // 'phrase' | 'char'
    
    // 表示設定（LocalStorage連携）
    this.showRuby = this.loadSetting('sutra_show_ruby', true);
    this.showMeaning = this.loadSetting('sutra_show_meaning', true);

    // 学習履歴・間違い記録・読経カウント
    this.studyHistory = this.loadJson('sutra_study_history', []);
    this.mistakes = this.loadJson('sutra_mistakes', { phrases: {}, chars: {} });
    this.readingStats = this.loadJson('sutra_reading_stats', { totalCount: 0, dailyCounts: {} });
    this.sessionMistakes = []; // 現在のクイズで間違えた問題の一時記録

    // 般若心経の全ユニーク漢字リスト（一文字モードのダミー選択肢用）
    this.allUniqueChars = Array.from(new Set(SUTRA_DATA.map(p => p.kanji).join('').split('')));

    // クイズ状態
    this.quizQueue = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.isAnswering = false;
    this.isMistakeReviewMode = false; // 弱点復習テスト中フラグ

    // 暗唱カード状態
    this.cardList = [];
    this.currentCardIndex = 0;

    // DOM要素のキャッシュ
    this.initDOMElements();
    this.bindEvents();

    // 初期表示設定
    this.updateSettingUI();
    this.updateSubmodeUI();
    this.renderSectionTabs();
    this.switchMode('quiz');
  }

  loadSetting(key, defaultValue) {
    const v = localStorage.getItem(key);
    return v !== null ? v === 'true' : defaultValue;
  }

  saveSetting(key, value) {
    localStorage.setItem(key, value);
  }

  loadJson(key, defaultValue) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : defaultValue;
    } catch(e) {
      return defaultValue;
    }
  }

  saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {}
  }

  initDOMElements() {
    // ボタン
    this.btnSound = document.getElementById('btn-sound');
    this.btnRuby = document.getElementById('btn-ruby');
    this.btnMeaning = document.getElementById('btn-meaning');
    this.btnOverview = document.getElementById('btn-overview');

    // モード切替タブ
    this.tabQuiz = document.getElementById('tab-quiz');
    this.tabFlashcard = document.getElementById('tab-flashcard');
    this.tabOverview = document.getElementById('tab-overview');
    this.tabHistory = document.getElementById('tab-history');

    // セクション選択エリア
    this.sectionSelector = document.getElementById('section-selector');

    // 各画面コンテナ
    this.quizView = document.getElementById('quiz-view');
    this.cardView = document.getElementById('card-view');
    this.overviewView = document.getElementById('overview-view');
    this.historyView = document.getElementById('history-view');
    this.resultModal = document.getElementById('result-modal');

    // 記録画面UI要素
    this.statTodayCount = document.getElementById('stat-today-count');
    this.statTotalCount = document.getElementById('stat-total-count');
    this.mistakeCountBadge = document.getElementById('mistake-count-badge');
    this.btnQuizMistakes = document.getElementById('btn-quiz-mistakes');
    this.btnClearMistakes = document.getElementById('btn-clear-mistakes');
    this.mistakesList = document.getElementById('mistakes-list');
    this.historyLogList = document.getElementById('history-log-list');
    this.btnClearHistory = document.getElementById('btn-clear-history');
    this.modalRetryMistakesBtn = document.getElementById('modal-retry-mistakes-btn');

    // クイズ形式（サブモード）切り替えボタン
    this.btnModePhrase = document.getElementById('btn-mode-phrase');
    this.btnModeChar = document.getElementById('btn-mode-char');

    // クイズUI要素
    this.quizProgress = document.getElementById('quiz-progress');
    this.quizProgressText = document.getElementById('quiz-progress-text');
    this.quizPromptCard = document.getElementById('quiz-prompt-card');
    this.quizOptionsGrid = document.getElementById('quiz-options');
    this.quizFeedback = document.getElementById('quiz-feedback');
    this.quizNextBtn = document.getElementById('quiz-next-btn');

    // カードUI要素
    this.cardProgressText = document.getElementById('card-progress-text');
    this.cardContainer = document.getElementById('card-container');
    this.btnCardPrev = document.getElementById('btn-card-prev');
    this.btnCardNext = document.getElementById('btn-card-next');
    this.btnCardMokugyo = document.getElementById('btn-card-mokugyo');

    // 全文一覧
    this.overviewContent = document.getElementById('overview-content');
  }

  bindEvents() {
    // 音声ON/OFF
    this.btnSound.addEventListener('click', () => {
      const isEnabled = audioEngine.toggleSound();
      this.updateSettingUI();
      if (isEnabled) audioEngine.playMokugyo();
    });

    // ふりがなON/OFF
    this.btnRuby.addEventListener('click', () => {
      this.showRuby = !this.showRuby;
      this.saveSetting('sutra_show_ruby', this.showRuby);
      this.updateSettingUI();
      this.refreshCurrentView();
    });

    // 現代語訳ON/OFF
    this.btnMeaning.addEventListener('click', () => {
      this.showMeaning = !this.showMeaning;
      this.saveSetting('sutra_show_meaning', this.showMeaning);
      this.updateSettingUI();
      this.refreshCurrentView();
    });

    // モードタブ
    this.tabQuiz.addEventListener('click', () => this.switchMode('quiz'));
    this.tabFlashcard.addEventListener('click', () => this.switchMode('flashcard'));
    this.tabOverview.addEventListener('click', () => this.switchMode('overview'));
    this.tabHistory.addEventListener('click', () => this.switchMode('history'));

    // クイズ形式（フレーズ vs 一文字）切り替え
    if (this.btnModePhrase) {
      this.btnModePhrase.addEventListener('click', () => this.setQuizSubmode('phrase'));
    }
    if (this.btnModeChar) {
      this.btnModeChar.addEventListener('click', () => this.setQuizSubmode('char'));
    }

    // 弱点復習テストボタン
    if (this.btnQuizMistakes) {
      this.btnQuizMistakes.addEventListener('click', () => this.startMistakeQuiz());
    }
    if (this.btnClearMistakes) {
      this.btnClearMistakes.addEventListener('click', () => this.clearMistakes());
    }
    if (this.btnClearHistory) {
      this.btnClearHistory.addEventListener('click', () => this.clearHistory());
    }
    if (this.modalRetryMistakesBtn) {
      this.modalRetryMistakesBtn.addEventListener('click', () => {
        this.resultModal.classList.add('hidden');
        this.startMistakeQuiz();
      });
    }

    // クイズ：次へボタン（誤答時の復習用）
    this.quizNextBtn.addEventListener('click', () => {
      this.advanceQuiz();
    });

    // カードUI操作
    this.btnCardPrev.addEventListener('click', () => this.prevCard());
    this.btnCardNext.addEventListener('click', () => this.nextCard());
    this.btnCardMokugyo.addEventListener('click', () => {
      audioEngine.playMokugyo();
      this.triggerHaptic(30);
    });

    // キーボード操作対応（PCでも操作可能に）
    document.addEventListener('keydown', (e) => {
      if (this.currentMode === 'flashcard') {
        if (e.key === 'ArrowRight' || e.key === 'Space') this.nextCard();
        if (e.key === 'ArrowLeft') this.prevCard();
      }
    });

    // 結果モーダルのボタン
    document.getElementById('modal-restart-btn').addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
      this.startQuiz();
    });
    document.getElementById('modal-next-section-btn').addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
      this.advanceToNextSection();
    });
  }

  triggerHaptic(duration = 40) {
    if (navigator.vibrate) {
      try { navigator.vibrate(duration); } catch(e){}
    }
  }

  updateSettingUI() {
    // サウンドボタンの見た目更新
    if (audioEngine.isEnabled) {
      this.btnSound.classList.remove('opacity-50');
      this.btnSound.innerHTML = '🔔 <span class="btn-text">音:入</span>';
      this.btnSound.setAttribute('aria-label', '効果音をオフにする');
    } else {
      this.btnSound.classList.add('opacity-50');
      this.btnSound.innerHTML = '🔕 <span class="btn-text">音:切</span>';
      this.btnSound.setAttribute('aria-label', '効果音をオンにする');
    }

    // ふりがなボタンの見た目更新
    if (this.showRuby) {
      this.btnRuby.classList.remove('opacity-50');
      this.btnRuby.innerHTML = '🈐 <span class="btn-text">ルビ:入</span>';
    } else {
      this.btnRuby.classList.add('opacity-50');
      this.btnRuby.innerHTML = '🈐 <span class="btn-text">ルビ:切</span>';
    }

    // 現代語訳ボタンの見た目更新
    if (this.showMeaning) {
      this.btnMeaning.classList.remove('opacity-50');
      this.btnMeaning.innerHTML = '💬 <span class="btn-text">訳:入</span>';
    } else {
      this.btnMeaning.classList.add('opacity-50');
      this.btnMeaning.innerHTML = '💬 <span class="btn-text">訳:切</span>';
    }
  }

  setQuizSubmode(submode) {
    if (this.quizSubmode === submode) return;
    this.quizSubmode = submode;
    this.saveSetting('sutra_quiz_submode', submode);
    this.updateSubmodeUI();
    if (this.currentMode === 'quiz') {
      this.startQuiz();
    }
  }

  updateSubmodeUI() {
    if (this.btnModePhrase) {
      this.btnModePhrase.classList.toggle('active', this.quizSubmode === 'phrase');
    }
    if (this.btnModeChar) {
      this.btnModeChar.classList.toggle('active', this.quizSubmode === 'char');
    }
  }

  renderSectionTabs() {
    this.sectionSelector.innerHTML = '';

    // 「全編通し」ボタン
    const allBtn = document.createElement('button');
    allBtn.className = `section-chip ${this.selectedSectionId === 'all' ? 'active' : ''}`;
    allBtn.innerText = '全編通し';
    allBtn.addEventListener('click', () => this.selectSection('all'));
    this.sectionSelector.appendChild(allBtn);

    // 各章ボタン
    SUTRA_SECTIONS.forEach((sec) => {
      const btn = document.createElement('button');
      btn.className = `section-chip ${this.selectedSectionId === sec.id ? 'active' : ''}`;
      btn.innerText = sec.shortTitle;
      btn.addEventListener('click', () => this.selectSection(sec.id));
      this.sectionSelector.appendChild(btn);
    });
  }

  selectSection(sectionId) {
    this.selectedSectionId = sectionId;
    this.renderSectionTabs();
    this.refreshCurrentView();
  }

  advanceToNextSection() {
    if (this.selectedSectionId === 'all') {
      this.selectSection('all');
    } else {
      const nextId = this.selectedSectionId + 1;
      if (nextId <= SUTRA_SECTIONS.length) {
        this.selectSection(nextId);
      } else {
        this.selectSection('all');
      }
    }
  }

  getSectionPhrases() {
    if (this.selectedSectionId === 'all') {
      return [...SUTRA_DATA];
    }
    const filtered = SUTRA_DATA.filter(p => p.sectionId === this.selectedSectionId);
    if (filtered.length > 0) return filtered;
    const sec = SUTRA_SECTIONS.find(s => s.id === this.selectedSectionId);
    if (!sec) return [...SUTRA_DATA];
    return SUTRA_DATA.slice(sec.startIndex, sec.endIndex + 1);
  }

  switchMode(mode) {
    this.currentMode = mode;

    this.tabQuiz.classList.toggle('active', mode === 'quiz');
    this.tabFlashcard.classList.toggle('active', mode === 'flashcard');
    this.tabOverview.classList.toggle('active', mode === 'overview');
    if (this.tabHistory) this.tabHistory.classList.toggle('active', mode === 'history');

    this.quizView.classList.toggle('hidden', mode !== 'quiz');
    this.cardView.classList.toggle('hidden', mode !== 'flashcard');
    this.overviewView.classList.toggle('hidden', mode !== 'overview');
    if (this.historyView) this.historyView.classList.toggle('hidden', mode !== 'history');

    // セクションセレクターは記録画面では非表示に
    if (this.sectionSelector) {
      this.sectionSelector.style.display = (mode === 'history') ? 'none' : 'flex';
    }

    this.refreshCurrentView();
  }

  refreshCurrentView() {
    if (this.currentMode === 'quiz') {
      this.startQuiz();
    } else if (this.currentMode === 'flashcard') {
      this.startFlashcard();
    } else if (this.currentMode === 'overview') {
      this.renderOverview();
    } else if (this.currentMode === 'history') {
      this.renderHistoryView();
    }
  }

  // ==========================================
  // 📿 暗唱4択クイズロジック
  // ==========================================
  startQuiz() {
    if (this.quizSubmode === 'char') {
      this.startCharQuiz();
    } else {
      this.startPhraseQuiz();
    }
  }

  // ① フレーズごと出題モード（通常）
  startPhraseQuiz() {
    this.isMistakeReviewMode = false;
    this.sessionMistakes = [];
    const phrases = this.getSectionPhrases();
    if (phrases.length < 2) return;

    this.quizQueue = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.isAnswering = false;

    for (let i = 0; i < phrases.length; i++) {
      let promptPhrase = null;
      let targetPhrase = null;
      let questionTitle = "";

      if (i === 0) {
        targetPhrase = phrases[0];
        const sec = SUTRA_SECTIONS.find(s => s.id === this.selectedSectionId);
        questionTitle = sec ? `【${sec.shortTitle}】の最初の句は？` : "般若心経の始まりの句は？";
        promptPhrase = null;
      } else {
        promptPhrase = phrases[i - 1];
        targetPhrase = phrases[i];
        questionTitle = "次に来る句はどれ？";
      }

      // 4択選択肢の作成（正解1 + 漢字が重複しないダミー3）
      const options = [targetPhrase];
      const usedKanji = new Set([targetPhrase.kanji]);

      const dummyCandidates = SUTRA_DATA.filter(p => !usedKanji.has(p.kanji));
      this.shuffleArray(dummyCandidates);

      for (const cand of dummyCandidates) {
        if (!usedKanji.has(cand.kanji)) {
          options.push(cand);
          usedKanji.add(cand.kanji);
          if (options.length === 4) break;
        }
      }

      this.shuffleArray(options);

      this.quizQueue.push({
        isCharMode: false,
        questionTitle,
        promptPhrase,
        targetPhrase,
        options
      });
    }

    this.renderQuizQuestion();
  }

  // ② 漢字一文字ずつ出題モード（高難度・極暗唱）
  startCharQuiz() {
    this.isMistakeReviewMode = false;
    this.sessionMistakes = [];
    const phrases = this.getSectionPhrases();
    if (phrases.length === 0) return;

    this.quizQueue = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.isAnswering = false;

    // 選択章の文字を一文字ずつ展開
    const charList = [];
    phrases.forEach(phrase => {
      for (let i = 0; i < phrase.kanji.length; i++) {
        charList.push({
          char: phrase.kanji[i],
          phrase: phrase,
          charIndex: i
        });
      }
    });

    for (let i = 0; i < charList.length; i++) {
      const targetChar = charList[i].char;
      const startIdx = Math.max(0, i - 6);
      const prevSnippet = charList.slice(startIdx, i).map(c => c.char).join('');

      // ダミー文字3つ（般若心経の全漢字から重複なく選出）
      const dummyCandidates = this.allUniqueChars.filter(c => c !== targetChar);
      this.shuffleArray(dummyCandidates);
      const wrongChars = dummyCandidates.slice(0, 3);
      const options = [targetChar, ...wrongChars];
      this.shuffleArray(options);

      this.quizQueue.push({
        isCharMode: true,
        targetChar: targetChar,
        prevSnippet: prevSnippet,
        parentPhrase: charList[i].phrase,
        options: options
      });
    }

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    this.isAnswering = false;
    this.quizFeedback.classList.add('hidden');
    this.quizNextBtn.classList.add('hidden');

    const total = this.quizQueue.length;
    const currentNum = this.currentQuizIndex + 1;
    const currentQ = this.quizQueue[this.currentQuizIndex];

    // プログレスバー
    const pct = ((this.currentQuizIndex) / total) * 100;
    this.quizProgress.style.width = `${pct}%`;
    const unitLabel = currentQ.isCharMode ? '字' : '句';
    this.quizProgressText.innerText = `${currentNum} / ${total} ${unitLabel}`;

    // 提示カードと選択肢のレンダリング
    if (currentQ.isCharMode) {
      // 一文字高難度モードの表示
      this.quizPromptCard.innerHTML = `
        <div class="prompt-label">⚡ 次に来る漢字一文字は？</div>
        <div class="char-slot-wrap">
          ${currentQ.prevSnippet ? `<span class="char-slot-prev">${currentQ.prevSnippet}</span>` : '<span class="char-slot-prev">（読経の開始）</span>'}
          <span class="char-slot-target">？</span>
        </div>
        ${this.showMeaning ? `<div class="prompt-meaning">${currentQ.parentPhrase.kanji}（${currentQ.parentPhrase.ruby}）</div>` : ''}
      `;

      // 4択ボタン（2x2グリッド・大文字）
      this.quizOptionsGrid.className = 'quiz-options-grid char-grid';
      this.quizOptionsGrid.innerHTML = '';

      currentQ.options.forEach((optChar, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn char-btn';
        btn.dataset.char = optChar;
        btn.innerHTML = `
          <div class="opt-number">${['壱', '弐', '参', '四'][index]}</div>
          <div class="opt-kanji">${optChar}</div>
        `;
        btn.addEventListener('click', () => this.handleAnswer(btn, optChar, currentQ.targetChar, true, currentQ));
        this.quizOptionsGrid.appendChild(btn);
      });

    } else {
      // 通常フレーズモードの表示
      this.quizOptionsGrid.className = 'quiz-options-grid';
      let promptHtml = '';
      if (currentQ.promptPhrase) {
        promptHtml = `
          <div class="prompt-label">前の句（唱えた句）</div>
          <div class="prompt-kanji">${this.renderKanjiWithRuby(currentQ.promptPhrase)}</div>
          ${this.showMeaning ? `<div class="prompt-meaning">${currentQ.promptPhrase.meaning}</div>` : ''}
          <div class="prompt-arrow">▼ 次に来る句を選んでください ▼</div>
        `;
      } else {
        promptHtml = `
          <div class="prompt-label">${currentQ.questionTitle}</div>
          <div class="prompt-starter-note">ここから読経が始まります</div>
        `;
      }
      this.quizPromptCard.innerHTML = promptHtml;

      // 4択ボタンの生成
      this.quizOptionsGrid.innerHTML = '';
      currentQ.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.dataset.id = opt.id;
        btn.dataset.kanji = opt.kanji;

        let optContent = `
          <div class="opt-number">${['壱', '弐', '参', '四'][index]}</div>
          <div class="opt-body">
            <div class="opt-kanji">${this.renderKanjiWithRuby(opt)}</div>
            ${this.showMeaning ? `<div class="opt-meaning">${opt.meaning}</div>` : ''}
          </div>
        `;
        btn.innerHTML = optContent;

        btn.addEventListener('click', () => this.handleAnswer(btn, opt, currentQ.targetPhrase, false, currentQ));
        this.quizOptionsGrid.appendChild(btn);
      });
    }
  }

  renderKanjiWithRuby(phrase) {
    if (!this.showRuby) {
      return `<span>${phrase.kanji}</span>`;
    }
    return `<ruby>${phrase.kanji}<rt>${phrase.ruby}</rt></ruby>`;
  }

  handleAnswer(btnElement, chosen, correct, isCharMode, currentQ) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    let isCorrect = false;
    if (isCharMode) {
      isCorrect = (chosen === correct);
    } else {
      isCorrect = (chosen.id === correct.id || chosen.kanji === correct.kanji);
    }

    const allButtons = this.quizOptionsGrid.querySelectorAll('.quiz-opt-btn');

    if (isCorrect) {
      // 正解処理
      this.quizScore++;
      btnElement.classList.add('correct');
      audioEngine.playCorrect();
      this.triggerHaptic(40);

      // 一文字モードは超高速（約0.36秒）、フレーズモードは約0.65秒で自動進行
      const delay = isCharMode ? 360 : 650;
      setTimeout(() => {
        this.advanceQuiz();
      }, delay);

    } else {
      // 不正解処理
      btnElement.classList.add('wrong');
      audioEngine.playIncorrect();
      this.triggerHaptic([60, 40, 60]);

      // 間違いの記録
      this.recordMistake(currentQ);

      // 正しい句/文字を強調表示
      allButtons.forEach(b => {
        if (isCharMode) {
          if (b.dataset.char === correct) b.classList.add('show-correct');
        } else {
          const bId = parseInt(b.dataset.id);
          if (bId === correct.id || b.dataset.kanji === correct.kanji) {
            b.classList.add('show-correct');
          }
        }
      });

      // 解説フィードバック表示
      this.quizFeedback.classList.remove('hidden');
      if (isCharMode) {
        this.quizFeedback.innerHTML = `
          <div class="feedback-box">
            <div class="feedback-title">惜しい！正解の文字はこちらです</div>
            <div class="feedback-kanji" style="font-size: 1.8rem;">【 ${correct} 】</div>
            <div class="feedback-meaning">${currentQ.parentPhrase.kanji}（${currentQ.parentPhrase.ruby}）</div>
          </div>
        `;
      } else {
        this.quizFeedback.innerHTML = `
          <div class="feedback-box">
            <div class="feedback-title">惜しい！正解はこちらです</div>
            <div class="feedback-kanji">${this.renderKanjiWithRuby(correct)}</div>
            <div class="feedback-meaning">${correct.meaning}</div>
          </div>
        `;
      }
      this.quizNextBtn.classList.remove('hidden');
    }
  }

  advanceQuiz() {
    this.currentQuizIndex++;
    if (this.currentQuizIndex < this.quizQueue.length) {
      this.renderQuizQuestion();
    } else {
      this.showQuizResult();
    }
  }

  showQuizResult() {
    audioEngine.playBell();
    this.triggerHaptic([100, 50, 100]);

    const total = this.quizQueue.length;
    const score = this.quizScore;
    const pct = Math.round((score / total) * 100);

    let secName = "全編通し";
    if (this.selectedSectionId !== 'all') {
      const s = SUTRA_SECTIONS.find(item => item.id === this.selectedSectionId);
      if (s) secName = s.shortTitle;
    }
    if (this.isMistakeReviewMode) {
      secName = "弱点克服テスト";
    }

    const modeName = this.quizSubmode === 'char' ? '一文字' : 'フレーズ';
    const unit = this.quizSubmode === 'char' ? '字' : '問';

    // 学習履歴・読経回数の保存
    this.recordCompletion(secName, modeName, score, total, pct);

    document.getElementById('modal-score-title').innerText = `${secName} ${modeName} 完了！`;
    document.getElementById('modal-score-num').innerText = `${score} / ${total} ${unit}正解 (${pct}%)`;

    let comment = "素晴らしい！一文字の滞りもなく完璧に暗唱できました。南無観世音菩薩。";
    if (pct < 100) {
      comment = `間違えた箇所が ${this.sessionMistakes.length} 件ありました。弱点復習で確実に定着させましょう！`;
    }
    document.getElementById('modal-score-comment').innerText = comment;

    // 今回間違えた箇所があれば「復習」ボタンを表示
    if (this.modalRetryMistakesBtn) {
      if (this.sessionMistakes.length > 0) {
        this.modalRetryMistakesBtn.classList.remove('hidden');
        this.modalRetryMistakesBtn.innerText = `間違えた ${this.sessionMistakes.length} 箇所を復習 ➔`;
      } else {
        this.modalRetryMistakesBtn.classList.add('hidden');
      }
    }

    const nextBtn = document.getElementById('modal-next-section-btn');
    if (this.selectedSectionId === 'all' || this.selectedSectionId === SUTRA_SECTIONS.length) {
      nextBtn.innerText = '最初から通しで挑戦';
    } else {
      nextBtn.innerText = '次の章へ進む ➔';
    }

    this.resultModal.classList.remove('hidden');
  }

  // ==========================================
  // 📊 学習記録・間違い帳・弱点復習機能
  // ==========================================
  recordMistake(currentQ) {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (currentQ.isCharMode) {
      const char = currentQ.targetChar;
      if (!this.mistakes.chars) this.mistakes.chars = {};
      if (!this.mistakes.chars[char]) {
        this.mistakes.chars[char] = {
          char: char,
          parentKanji: currentQ.parentPhrase.kanji,
          parentRuby: currentQ.parentPhrase.ruby,
          count: 0,
          lastDate: dateStr
        };
      }
      this.mistakes.chars[char].count++;
      this.mistakes.chars[char].lastDate = dateStr;
    } else {
      const p = currentQ.targetPhrase;
      if (!this.mistakes.phrases) this.mistakes.phrases = {};
      if (!this.mistakes.phrases[p.id]) {
        this.mistakes.phrases[p.id] = {
          id: p.id,
          kanji: p.kanji,
          ruby: p.ruby,
          meaning: p.meaning,
          count: 0,
          lastDate: dateStr
        };
      }
      this.mistakes.phrases[p.id].count++;
      this.mistakes.phrases[p.id].lastDate = dateStr;
    }

    this.sessionMistakes.push(currentQ);
    this.saveJson('sutra_mistakes', this.mistakes);
  }

  recordCompletion(secName, modeName, score, total, pct) {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 読経カウンター更新
    if (!this.readingStats) this.readingStats = { totalCount: 0, dailyCounts: {} };
    if (!this.readingStats.dailyCounts) this.readingStats.dailyCounts = {};
    this.readingStats.totalCount = (this.readingStats.totalCount || 0) + 1;
    this.readingStats.dailyCounts[todayKey] = (this.readingStats.dailyCounts[todayKey] || 0) + 1;
    this.saveJson('sutra_reading_stats', this.readingStats);

    // 履歴ログ追加（先頭に挿入、最大50件保持）
    if (!Array.isArray(this.studyHistory)) this.studyHistory = [];
    this.studyHistory.unshift({
      id: Date.now(),
      date: dateStr,
      secName: secName,
      modeName: modeName,
      score: score,
      total: total,
      pct: pct
    });
    if (this.studyHistory.length > 50) {
      this.studyHistory.pop();
    }
    this.saveJson('sutra_study_history', this.studyHistory);
  }

  renderHistoryView() {
    // 1. 読経カウンターサマリー
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayCount = (this.readingStats && this.readingStats.dailyCounts && this.readingStats.dailyCounts[todayKey]) ? this.readingStats.dailyCounts[todayKey] : 0;
    const totalCount = (this.readingStats && this.readingStats.totalCount) ? this.readingStats.totalCount : 0;

    if (this.statTodayCount) this.statTodayCount.innerHTML = `${todayCount} <small>回</small>`;
    if (this.statTotalCount) this.statTotalCount.innerHTML = `${totalCount} <small>回</small>`;

    // 2. 間違いリスト
    const phraseMistakes = Object.values(this.mistakes?.phrases || {});
    const charMistakes = Object.values(this.mistakes?.chars || {});
    const totalMistakes = phraseMistakes.length + charMistakes.length;

    if (this.mistakeCountBadge) {
      this.mistakeCountBadge.innerText = `${totalMistakes} 件`;
    }
    if (this.btnQuizMistakes) {
      this.btnQuizMistakes.disabled = (totalMistakes === 0);
      this.btnQuizMistakes.innerText = totalMistakes > 0 
        ? `🔥 間違えた箇所だけ復習テスト（${totalMistakes}問）` 
        : `🔥 間違えた箇所だけ復習テスト`;
    }

    if (this.mistakesList) {
      if (totalMistakes === 0) {
        this.mistakesList.innerHTML = `
          <div class="empty-state">
            ✨ まだ間違えた箇所はありません！<br>
            4択テストに挑戦して、苦手な箇所を克服しましょう。
          </div>
        `;
      } else {
        // ミス回数の多い順にソート
        phraseMistakes.sort((a, b) => b.count - a.count);
        charMistakes.sort((a, b) => b.count - a.count);

        let html = '';
        phraseMistakes.forEach(m => {
          html += `
            <div class="mistake-item">
              <div class="mistake-main">
                <div class="mistake-kanji">${m.kanji}</div>
                <div class="mistake-meta">${m.ruby} ｜ 最終ミス: ${m.lastDate}</div>
              </div>
              <span class="mistake-count-tag">${m.count}回ミス</span>
              <button class="btn-remove-mistake" onclick="window.app.removeMistake('phrase', ${m.id})" title="覚えた（一覧から削除）">✕</button>
            </div>
          `;
        });

        charMistakes.forEach(m => {
          html += `
            <div class="mistake-item">
              <div class="mistake-main">
                <div class="mistake-kanji" style="font-size: 1.3rem; color: var(--gold-light);">【 ${m.char} 】</div>
                <div class="mistake-meta">${m.parentKanji}（${m.parentRuby}） ｜ ${m.lastDate}</div>
              </div>
              <span class="mistake-count-tag">${m.count}回ミス</span>
              <button class="btn-remove-mistake" onclick="window.app.removeMistake('char', '${m.char}')" title="覚えた（一覧から削除）">✕</button>
            </div>
          `;
        });

        this.mistakesList.innerHTML = html;
      }
    }

    // 3. 学習履歴タイムライン
    if (this.historyLogList) {
      if (!this.studyHistory || this.studyHistory.length === 0) {
        this.historyLogList.innerHTML = `
          <div class="empty-state">
            まだ学習履歴がありません。<br>
            4択テストを完了すると、ここに日時の履歴が記録されます。
          </div>
        `;
      } else {
        let html = '';
        this.studyHistory.forEach(item => {
          let scoreClass = 'log-score-badge';
          if (item.pct === 100) scoreClass += ' perfect';
          else if (item.pct >= 80) scoreClass += ' good';

          html += `
            <div class="history-log-item">
              <div class="log-info">
                <span class="log-date">${item.date}</span>
                <span class="log-title">${item.secName} <small style="color:var(--text-dim);font-weight:normal;">(${item.modeName})</small></span>
              </div>
              <span class="${scoreClass}">${item.score}/${item.total} (${item.pct}%)</span>
            </div>
          `;
        });
        this.historyLogList.innerHTML = html;
      }
    }
  }

  // 苦手リストから特定のアイテムを削除
  removeMistake(type, idOrChar) {
    if (type === 'phrase') {
      delete this.mistakes.phrases[idOrChar];
    } else {
      delete this.mistakes.chars[idOrChar];
    }
    this.saveJson('sutra_mistakes', this.mistakes);
    this.renderHistoryView();
  }

  clearMistakes() {
    if (!confirm('間違えた記録をすべてリセットしますか？')) return;
    this.mistakes = { phrases: {}, chars: {} };
    this.saveJson('sutra_mistakes', this.mistakes);
    this.renderHistoryView();
  }

  clearHistory() {
    if (!confirm('学習履歴ログをすべて消去しますか？')) return;
    this.studyHistory = [];
    this.saveJson('sutra_study_history', this.studyHistory);
    this.renderHistoryView();
  }

  // 間違えた箇所だけをテストする弱点克服モード
  startMistakeQuiz() {
    // セッション中に間違えた問題、または保存された苦手リストから生成
    const phraseMistakes = Object.values(this.mistakes?.phrases || {});
    const charMistakes = Object.values(this.mistakes?.chars || {});

    if (phraseMistakes.length === 0 && charMistakes.length === 0) {
      alert('現在、間違えた箇所はありません！');
      return;
    }

    this.isMistakeReviewMode = true;
    this.sessionMistakes = [];
    this.quizQueue = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.isAnswering = false;

    // フレーズの間違い問題を生成
    phraseMistakes.forEach(m => {
      const targetPhrase = SUTRA_DATA.find(p => p.id === m.id) || m;
      const prevPhrase = targetPhrase.id > 0 ? SUTRA_DATA[targetPhrase.id - 1] : null;

      // ダミー候補
      const dummyCandidates = SUTRA_DATA.filter(p => p.kanji !== targetPhrase.kanji);
      this.shuffleArray(dummyCandidates);
      const wrongOptions = dummyCandidates.slice(0, 3);
      const options = [targetPhrase, ...wrongOptions];
      this.shuffleArray(options);

      this.quizQueue.push({
        isCharMode: false,
        questionTitle: "【苦手克服】次に来る句はどれ？",
        promptPhrase: prevPhrase,
        targetPhrase: targetPhrase,
        options: options
      });
    });

    // 一文字の間違い問題を生成
    charMistakes.forEach(m => {
      const targetChar = m.char;
      const dummyCandidates = this.allUniqueChars.filter(c => c !== targetChar);
      this.shuffleArray(dummyCandidates);
      const wrongChars = dummyCandidates.slice(0, 3);
      const options = [targetChar, ...wrongChars];
      this.shuffleArray(options);

      const parentPhrase = SUTRA_DATA.find(p => p.kanji.includes(targetChar)) || { kanji: m.parentKanji, ruby: m.parentRuby };
      const charIdx = parentPhrase.kanji.indexOf(targetChar);
      const prevSnippet = charIdx > 0 ? parentPhrase.kanji.slice(Math.max(0, charIdx - 4), charIdx) : "";

      this.quizQueue.push({
        isCharMode: true,
        targetChar: targetChar,
        prevSnippet: prevSnippet,
        parentPhrase: parentPhrase,
        options: options
      });
    });

    this.shuffleArray(this.quizQueue);

    // クイズ画面へ切り替えて開始
    this.switchMode('quiz');
  }

  // ==========================================
  // 📖 暗唱カード（めくり・通読）ロジック
  // ==========================================
  startFlashcard() {
    this.cardList = this.getSectionPhrases();
    this.currentCardIndex = 0;
    this.renderFlashcard();
  }

  renderFlashcard() {
    if (this.cardList.length === 0) return;

    const phrase = this.cardList[this.currentCardIndex];
    const total = this.cardList.length;
    const currentNum = this.currentCardIndex + 1;

    this.cardProgressText.innerText = `${currentNum} / ${total} 句`;

    this.cardContainer.innerHTML = `
      <div class="flashcard">
        <div class="card-phrase-id">第 ${currentNum} 句</div>
        <div class="card-kanji">${this.renderKanjiWithRuby(phrase)}</div>
        ${this.showMeaning ? `<div class="card-meaning">${phrase.meaning}</div>` : ''}
      </div>
    `;

    // ボタンの有効・無効制御
    this.btnCardPrev.disabled = (this.currentCardIndex === 0);
    this.btnCardNext.disabled = (this.currentCardIndex === total - 1);
  }

  nextCard() {
    if (this.currentCardIndex < this.cardList.length - 1) {
      this.currentCardIndex++;
      audioEngine.playMokugyo();
      this.triggerHaptic(25);
      this.renderFlashcard();
    }
  }

  prevCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      audioEngine.playMokugyo();
      this.triggerHaptic(25);
      this.renderFlashcard();
    }
  }

  // ==========================================
  // 📜 全文一覧（辞書・復習）ロジック
  // ==========================================
  renderOverview() {
    let html = '';

    SUTRA_SECTIONS.forEach((sec) => {
      const phrases = SUTRA_DATA.slice(sec.startIndex, sec.endIndex + 1);

      html += `
        <div class="overview-section-card">
          <div class="sec-header">
            <h3>${sec.title}</h3>
            <p class="sec-desc">${sec.desc}</p>
          </div>
          <div class="sec-phrases-list">
      `;

      phrases.forEach((p) => {
        html += `
          <div class="overview-phrase-item">
            <div class="p-kanji">${this.renderKanjiWithRuby(p)}</div>
            ${this.showMeaning ? `<div class="p-meaning">${p.meaning}</div>` : ''}
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    this.overviewContent.innerHTML = html;
  }

  // 配列シャッフルユーティリティ
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// アプリケーション初期化
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SutraApp();

  // PWA インストールバナー制御
  let deferredPrompt = null;
  const pwaBanner = document.getElementById('pwa-install-banner');
  const btnInstall = document.getElementById('btn-pwa-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    // ブラウザ標準のバナーを一度抑止
    e.preventDefault();
    deferredPrompt = e;
    // カスタムバナーを表示
    if (pwaBanner) {
      pwaBanner.classList.remove('hidden');
    }
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA インストール結果: ${outcome}`);
      deferredPrompt = null;
      if (pwaBanner) {
        pwaBanner.classList.add('hidden');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('般若心経アプリが正常にインストールされました');
    if (pwaBanner) {
      pwaBanner.classList.add('hidden');
    }
  });
});
