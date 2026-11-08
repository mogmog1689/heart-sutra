// Web Audio API による和楽器風効果音エンジン
// 外部音声ファイル不要で完全オフライン・軽量動作

class SutraAudioEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = true;
    
    // 設定の読み込み
    const saved = localStorage.getItem('sutra_sound_enabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('sutra_sound_enabled', this.isEnabled);
    return this.isEnabled;
  }

  setSound(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('sutra_sound_enabled', this.isEnabled);
  }

  // 木魚の音（ポクッ）
  playMokugyo() {
    if (!this.isEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // オシレータ（メイン音源）
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // 周波数エンベロープ（ポクッという木の打音特有のピッチ降下）
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.12);

    // バンドパスフィルターで木の胴鳴りを再現
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.Q.setValueAtTime(4.0, t);

    // 音量エンベロープ（瞬間アタックと早い減衰）
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);

    // クリック音（アタック成分）を重ねて木の打感を強調
    this._playClick(t);
  }

  _playClick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.03);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // おりん・鈴の音（チーーーン…）
  playBell() {
    if (!this.isEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // 澄んだ和の倍音構成
    const freqs = [587.33, 1174.66, 1760.0, 2637.0]; // D5系の倍音
    const decay = 2.8;

    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (index * 1.5), t); // わずかなコーラス感

      const amp = 0.3 / (index + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // 正解時の音（軽快な木魚連打）
  playCorrect() {
    if (!this.isEnabled) return;
    this.playMokugyo();
    setTimeout(() => this.playMokugyo(), 120);
  }

  // 不正解時の音（低めの落ち着いた木魚音）
  playIncorrect() {
    if (!this.isEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

const audioEngine = new SutraAudioEngine();
