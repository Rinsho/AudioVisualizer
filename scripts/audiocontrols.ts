import { Animator, ExponentialSampling, LinearSampling } from "./animator.js";
import { AudioSource } from "./audiosource.js";

function FormatTime(seconds: number) {
        seconds = Math.round(seconds);
        let minutes = Math.floor(seconds / 60);
        var seconds = Math.floor(seconds % 60);
        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

export function SetupAnimator(audioSource: AudioSource, animator: Animator) {
    let animatorSampling = () => animator.Start(ExponentialSampling);

    let samplingSelection = document.getElementById('sampling-function') as HTMLSelectElement;
    samplingSelection.addEventListener(
        'change',
        (event: Event) => {
            let selection = event.target as HTMLSelectElement;
            let option = selection.selectedOptions[0];
            audioSource.removeEventListener('audioStarted', animatorSampling);
            switch (option.value)
            {
                case 'linear':
                    animatorSampling = () => animator.Start(LinearSampling.bind(null, 1));
                    break;
                case 'downscaled-linear':
                    animatorSampling = () => animator.Start(LinearSampling.bind(null, 0.5));
                    break;
                default:
                    animatorSampling = () => animator.Start(ExponentialSampling);
                    break;
            }           
            audioSource.addEventListener('audioStarted', animatorSampling);
            audioSource.Play(); //triggers audioStarted event
        }
    );
    
    audioSource.addEventListener('audioStarted', animatorSampling);
    audioSource.addEventListener('audioPaused', () => animator.Stop());
    audioSource.addEventListener('audioEnded', () => animator.Stop());
}

export function SetupVolumeBar(audioSource: AudioSource) {
    let currentVolumeBar = document.querySelector('#volume-control > .progress-bar') as HTMLDivElement;
    let volumeBar = document.getElementById('volume-control') as HTMLDivElement;

    audioSource.addEventListener(
        'volumeChanged', 
        (event: Event) => {
            let volume = (event.target as AudioSource).Volume;
            currentVolumeBar.style.width = volume * 100 + '%';
        }
    );   
    volumeBar.addEventListener(
        'click', 
        (event: Event) => {
            let mouseEvent = event as MouseEvent;
            audioSource.Volume = (mouseEvent.clientX - volumeBar.offsetLeft) / volumeBar.offsetWidth;
        }
    );
}

export function SetupPlayButton(audioSource: AudioSource) {
    let playButton = document.getElementById('player-play') as HTMLButtonElement;

    audioSource.addEventListener('audioPaused', () => {
        playButton.value = '>';
    });
    audioSource.addEventListener('audioStarted', () => {
        playButton.value = 'l l';
    });
    playButton.addEventListener(
        'click', 
        (event: Event) => {           
            if (audioSource.IsPlaying)
                audioSource.Pause();
            else
                audioSource.Play();
            event.preventDefault();
        }
    );
}

export function SetupSampleSmoothing(audioSource: AudioSource) {
    let smoothingSlider = document.getElementById('smoothing-slider') as HTMLInputElement;
    let smoothingDisplay = document.querySelector('#smoothing-slider + .smoothing-display') as HTMLLabelElement;

    audioSource.addEventListener(
        'smoothingChanged',
        (event: Event) => {
            let val = (event.target as AudioSource).Smoothing;
            smoothingDisplay.textContent = val * 100 + '%';   
        }
    );
    smoothingSlider.addEventListener('change', (event: Event) => {
        let val = Number.parseInt((event.target as HTMLInputElement).value);
        audioSource.Smoothing =  val / 100;
    });
}

export function SetupRangeOffset(animator: Animator) {
    let rangeOffsetSlider = document.getElementById('range-offset-slider') as HTMLInputElement;
    let rangeOffsetDisplay = document.querySelector('#range-offset-slider + .range-offset-display') as HTMLLabelElement;

    animator.addEventListener(
        'rangeOffsetChanged',
        (event: Event) => {
            rangeOffsetDisplay.textContent = '' + (event.target as Animator).RangeOffset;
        }
    );
    rangeOffsetSlider.addEventListener(
        'change', 
        (event: Event) => {
            animator.RangeOffset = Number.parseInt((event.target as HTMLInputElement).value);
        }
    );
}

export function SetupProgressBar(audioSource: AudioSource) {
    let playerProgressBar = document.getElementById('playback-progress') as HTMLDivElement;
    let currentPlayerProgressBar = document.querySelector('#playback-progress > .progress-bar') as HTMLDivElement;
    let playerProgressDisplay = document.querySelector('#playback-progress + .player-total-time') as HTMLLabelElement;

    audioSource.addEventListener(
        'playerProgress',
        (event: Event) => {
            let audio = event.target as AudioSource;
            let currentTime = audio.GetCurrentTime();
            let totalDuration = audio.GetDuration();
            currentPlayerProgressBar.style.width = Math.floor((currentTime / totalDuration) * 100) + '%';
            playerProgressDisplay.textContent = FormatTime(currentTime);
        }
    );
    playerProgressBar.addEventListener(
        'click',
        (event: Event) => {
            let mouseEvent = event as MouseEvent;
            let targetPercent = (mouseEvent.clientX - playerProgressBar.offsetLeft) / playerProgressBar.offsetWidth;
            audioSource.Seek(audioSource.GetDuration() * targetPercent);
        }
    );
    audioSource.addEventListener(
        'audioEnded',
        (event: Event) => {
            audioSource.Reset();
        }
    )
}

export function SetupFileChooser(audioSource: AudioSource) {
    document.getElementById('audio-file')!.addEventListener(
        'change', 
        (event: Event) => {            
            audioSource.SetSource(
                URL.createObjectURL((event.target as HTMLInputElement).files![0])
            );
            (document.getElementById('player-play') as HTMLButtonElement).click();
            event.preventDefault();
        }
    );  
}