export class AudioSource extends EventTarget {
    constructor(_audioContext, fftSize = 8192) {
        super();
        this._audioContext = _audioContext;
        this._volume = 100;
        this._smoothing = 50;
        let player = document.createElement('audio');
        player.id = 'audio-player';
        this._source = _audioContext.createMediaElementSource(player);
        this._analyser = _audioContext.createAnalyser();
        this._analyser.fftSize = fftSize;
        this._analyser.smoothingTimeConstant = this.Smoothing / 100;
        this._source.connect(this._analyser);
        this._analyser.connect(_audioContext.destination);
        player.addEventListener('ended', () => this.dispatchEvent(new Event('audioEnded')));
        player.addEventListener('timeupdate', () => this.dispatchEvent(new Event('playerProgress')));
    }
    get Volume() {
        return this._volume;
    }
    set Volume(volume) {
        this._volume = volume;
        this.dispatchEvent(new Event('volumeChanged'));
    }
    get Smoothing() {
        return this._smoothing;
    }
    set Smoothing(smoothing) {
        this._smoothing = smoothing;
        this.dispatchEvent(new Event('smoothingChanged'));
    }
    get IsPlaying() {
        return !(this._source.mediaElement.paused || this._source.mediaElement.ended);
    }
    SetSource(objectUrl) {
        if (this.IsPlaying)
            this.Pause();
        this._source.mediaElement.src = objectUrl;
        this._source.mediaElement.load();
        this.dispatchEvent(new Event('sourceChanged'));
    }
    GetCurrentTime() {
        return this._source.mediaElement.currentTime;
    }
    GetDuration() {
        return this._source.mediaElement.duration;
    }
    Pause() {
        this._source.mediaElement.pause();
        this.dispatchEvent(new Event('audioPaused'));
    }
    Play() {
        if (this._source.mediaElement.ended)
            this.Reset();
        this._source.mediaElement.play();
        this.dispatchEvent(new Event('audioStarted'));
    }
    Reset() {
        this.Pause();
        this._source.mediaElement.currentTime = 0;
    }
    PollData() {
        let data = new Float32Array(this._analyser.frequencyBinCount);
        this._analyser.getFloatFrequencyData(data);
        return data;
    }
}
