function FormatTime(seconds) {
    seconds = Math.round(seconds);
    let minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
export function SetupAnimator(audioSource, animator) {
    audioSource.addEventListener('audioStarted', () => animator.Start());
    audioSource.addEventListener('audioPaused', () => animator.Stop());
    audioSource.addEventListener('audioEnded', () => animator.Stop());
}
export function SetupVolumeBar(audioSource) {
    let volumeProgressBar = document.querySelector('.volume-control > .progress-bar');
    let volumeBar = document.getElementsByClassName('volume-control')[0];
    audioSource.addEventListener('volumeChanged', (event) => {
        let volume = event.target.Volume;
        volumeProgressBar.style.width = volume + '%';
    });
    volumeBar.addEventListener('click', (event) => {
        let mouseEvent = event;
        let volumeControl = event.target;
        audioSource.Volume = (mouseEvent.clientX - volumeControl.offsetLeft) / volumeControl.offsetWidth;
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
    let smoothingSlider = document.getElementsByClassName('smoothing-slider')[0];
    let smoothingDisplay = document.getElementsByClassName('smoothing-display')[0];
    audioSource.addEventListener('smoothingChanged', (event) => {
        let val = event.target.Smoothing;
        smoothingDisplay.textContent = val * 100 + '%';
    });
    smoothingSlider.addEventListener('change', (event) => {
        let val = Number.parseInt(event.target.value);
        audioSource.Smoothing = val / 100;
    });
}
export function SetupDomainSmoothing(audioSource) {
    let domainSlider = document.getElementsByClassName('domain-slider')[0];
    let domainDisplay = document.getElementsByClassName('domain-display')[0];
    domainSlider.addEventListener('change', (event) => {
        let val = Number.parseInt(event.target.value);
        //What should be responsible for the domain?
    });
}
export function SetupProgressBar(audioSource) {
    let playerProgressBar = document.querySelector('.playback-progress > .progress-bar');
    let playerProgressDisplay = document.getElementsByClassName('player-total-time')[0];
    audioSource.addEventListener('playerProgress', (event) => {
        let audio = event.target;
        let currentTime = audio.GetCurrentTime();
        let totalDuration = audio.GetDuration();
        playerProgressBar.style.width = Math.floor((currentTime / totalDuration) * 100) + '%';
        playerProgressDisplay.textContent = FormatTime(currentTime);
    });
}
export function SetupFileChooser(audioSource) {
    document.getElementById('audio-file').addEventListener('change', (event) => {
        audioSource.SetSource(URL.createObjectURL(event.target.files[0]));
        document.getElementById('player-play').click();
        event.preventDefault();
    });
}