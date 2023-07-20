import awaitPageLoad from "./awaitPageLoad.js";
async function init() {
  await awaitPageLoad();
  const volumeSlider = document.getElementById("volume");
  document.addEventListener("input", () => {
    GameAudio.volume = parseFloat(volumeSlider.value);
  });
}
init();
const _GameAudio = class {
  setPlaybackRate(rate) {
    if (rate < 0.0625) {
      this.audio.playbackRate = 0.0625;
      return;
    }
    if (rate > 16) {
      this.audio.playbackRate = 16;
      return;
    }
    this.audio.playbackRate = rate;
  }
  setVolume(vol) {
    if (vol > 1) {
      this.audio.volume = _GameAudio.volume;
      return;
    }
    this.audio.volume = vol * _GameAudio.volume;
  }
  getDuration() {
    return this.audio.duration;
  }
  constructor(url) {
    const audio = new Audio(url);
    this.audio = audio;
    this.audio.preservesPitch = false;
  }
  play() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = _GameAudio.volume;
    this.audio.play();
  }
  stop() {
    this.audio.pause();
  }
  loop() {
    this.audio.loop = true;
    this.audio.play();
    setInterval(() => {
      this.audio.volume = _GameAudio.volume;
    }, 500);
  }
};
let GameAudio = _GameAudio;
GameAudio.volume = 0.2;
export default GameAudio;
