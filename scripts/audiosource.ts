
export class AudioSource extends EventTarget {
    //Events: audioEnded, audioPaused, audioStarted, 
    //        volumeChanged, smoothingChanged
    //        sourceChanged, playerProgress
    protected _source: MediaElementAudioSourceNode;
    protected _analyser: AnalyserNode;

    public get Volume() {
        return this._source.mediaElement.volume;
    }
    public set Volume(volume: number) {
        this._source.mediaElement.volume = volume;
        this.dispatchEvent(new Event('volumeChanged'));
    }

    public get Smoothing() {
        return this._analyser.smoothingTimeConstant;
    }
    public set Smoothing(smoothing: number) {
        this._analyser.smoothingTimeConstant = smoothing;
        this.dispatchEvent(new Event('smoothingChanged'));
    }

    public get IsPlaying() {
        return !(this._source.mediaElement.paused || this._source.mediaElement.ended);
    }

    constructor(private _audioContext: AudioContext, fftSize: number = 8192) {
        super();
        let player = document.createElement('audio');
        player.id = 'audio-player';
        this._source = _audioContext.createMediaElementSource(player);
        this._analyser = _audioContext.createAnalyser();
        this._analyser.fftSize = fftSize;
        this._source.connect(this._analyser);
        this._analyser.connect(_audioContext.destination);

        player.addEventListener('ended', () => this.dispatchEvent(new Event('audioEnded')));

        player.addEventListener('timeupdate', () => this.dispatchEvent(new Event('playerProgress')));
    }

    public SetSource(objectUrl: string): void {
        if (this.IsPlaying)
            this.Pause();
        this._source.mediaElement.src = objectUrl;
        this._source.mediaElement.load();
        this.dispatchEvent(new Event('sourceChanged'));
    }

    public GetCurrentTime(): number {
        return this._source.mediaElement.currentTime;
    }

    public GetDuration(): number {
        return this._source.mediaElement.duration;
    }

    public Pause(): void {
        this._source.mediaElement.pause();
        this.dispatchEvent(new Event('audioPaused'));
    }

    public Play(): void {
        if (this._source.mediaElement.ended)
            this.Reset();
        this._source.mediaElement.play();
        this.dispatchEvent(new Event('audioStarted'));
    }

    public Reset(): void {
        this.Pause();
        this._source.mediaElement.currentTime = 0;
    }

    public PollData(): Float32Array {   
        let data = new Float32Array(this._analyser.frequencyBinCount);
        this._analyser.getFloatFrequencyData(data);
        return data;
    }

    public Seek(seconds: number): void {
        if (seconds >= 0 && seconds < this.GetDuration())
            this._source.mediaElement.currentTime = seconds;
    }
}