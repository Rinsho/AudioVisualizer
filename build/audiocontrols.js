import { ExponentialSampling, LinearSampling } from "./animator.js";
function FormatTime(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
export function SetupAnimator(audioSource, animator) {
    let animatorSampling = () => animator.Start(ExponentialSampling);
    let samplingSelection = document.getElementById('sampling-function');
    samplingSelection.addEventListener('change', (event) => {
        let selection = event.target;
        let option = selection.selectedOptions[0];
        audioSource.removeEventListener('audioStarted', animatorSampling);
        switch (option.value) {
            case 'linear':
                animatorSampling = () => animator.Start(LinearSampling);
                break;
            default:
                animatorSampling = () => animator.Start(ExponentialSampling);
                break;
        }
        audioSource.addEventListener('audioStarted', animatorSampling);
        audioSource.Play(); //triggers audioStarted event
    });
    audioSource.addEventListener('audioStarted', animatorSampling);
    audioSource.addEventListener('audioPaused', () => animator.Stop());
    audioSource.addEventListener('audioEnded', () => animator.Stop());
}
export function SetupVolumeBar(audioSource) {
    let currentVolumeBar = document.querySelector('#volume-control > .progress-bar');
    let volumeBar = document.getElementById('volume-control');
    audioSource.addEventListener('volumeChanged', (event) => {
        let volume = event.target.Volume;
        currentVolumeBar.style.width = volume * 100 + '%';
    });
    volumeBar.addEventListener('click', (event) => {
        let mouseEvent = event;
        audioSource.Volume = (mouseEvent.clientX - volumeBar.offsetLeft) / volumeBar.offsetWidth;
    });
}
export function SetupPlayButton(audioSource) {
    let playButton = document.getElementById('player-play');
    audioSource.addEventListener('audioPaused', () => {
        playButton.value = '>';
    });
    audioSource.addEventListener('audioStarted', () => {
        playButton.value = 'l l';
    });
    playButton.addEventListener('click', (event) => {
        if (audioSource.IsPlaying)
            audioSource.Pause();
        else
            audioSource.Play();
        event.preventDefault();
    });
}
export function SetupSampleSmoothing(audioSource) {
    let smoothingSlider = document.getElementById('smoothing-slider');
    let smoothingDisplay = document.querySelector('#smoothing-slider + .smoothing-display');
    audioSource.addEventListener('smoothingChanged', (event) => {
        let val = event.target.Smoothing;
        smoothingDisplay.textContent = val * 100 + '%';
    });
    smoothingSlider.addEventListener('change', (event) => {
        let val = Number.parseInt(event.target.value);
        audioSource.Smoothing = val / 100;
    });
}
export function SetupDomainSmoothing(animator) {
    let domainSlider = document.getElementById('domain-slider');
    let domainDisplay = document.querySelector('#domain-slider + .domain-display');
    animator.addEventListener('domainChanged', (event) => {
        domainDisplay.textContent = '' + event.target.DomainSmoothing;
    });
    domainSlider.addEventListener('change', (event) => {
        animator.DomainSmoothing = Number.parseInt(event.target.value);
    });
}
export function SetupProgressBar(audioSource) {
    let playerProgressBar = document.getElementById('playback-progress');
    let currentPlayerProgressBar = document.querySelector('#playback-progress > .progress-bar');
    let playerProgressDisplay = document.querySelector('#playback-progress + .player-total-time');
    audioSource.addEventListener('playerProgress', (event) => {
        let audio = event.target;
        let currentTime = audio.GetCurrentTime();
        let totalDuration = audio.GetDuration();
        currentPlayerProgressBar.style.width = Math.floor((currentTime / totalDuration) * 100) + '%';
        playerProgressDisplay.textContent = FormatTime(currentTime);
    });
    playerProgressBar.addEventListener('click', (event) => {
        let mouseEvent = event;
        let targetPercent = (mouseEvent.clientX - playerProgressBar.offsetLeft) / playerProgressBar.offsetWidth;
        audioSource.Seek(audioSource.GetDuration() * targetPercent);
    });
    audioSource.addEventListener('audioEnded', (event) => {
        audioSource.Reset();
    });
}
export function SetupFileChooser(audioSource) {
    document.getElementById('audio-file').addEventListener('change', (event) => {
        audioSource.SetSource(URL.createObjectURL(event.target.files[0]));
        document.getElementById('player-play').click();
        event.preventDefault();
    });
}
