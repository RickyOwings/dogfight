import awaitPageLoad from "./awaitPageLoad";


async function init() {
    await awaitPageLoad();
    const volumeSlider = document.getElementById("volume") as HTMLInputElement;
    document.addEventListener('input', () => {
        GameAudio.volume = parseFloat(volumeSlider.value);
    });

}
init();


class GameAudio {
    static volume: number = 0.2;
    private audio: HTMLAudioElement;

    setPlaybackRate(rate: number){
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

    setVolume(vol: number){
        if (vol > 1) {
            this.audio.volume = GameAudio.volume
            return;
        }
        this.audio.volume = vol * GameAudio.volume;
    }

    getDuration(): number {
        return this.audio.duration;
    }

    constructor(url: string) {
        const audio = new Audio(url)
        this.audio = audio;
        this.audio.preservesPitch = false;
    }


    play(){
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.volume = GameAudio.volume;
        this.audio.play();
    }


    stop(){
        this.audio.pause();
    }


    loop(){
        this.audio.loop = true;
        this.audio.play();
        setInterval(()=>{
            this.audio.volume = GameAudio.volume;
        }, 500);
    }
}

export default GameAudio;
