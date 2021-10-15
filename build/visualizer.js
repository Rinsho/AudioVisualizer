import { AudioSource } from "./audiosource.js";
import { Animator } from "./animator.js";
import * as Controls from "./audiocontrols.js";
(function () {
    let audioSource = new AudioSource(new window.AudioContext);
    let animator = new Animator(document.getElementById('visualizer-canvas'), audioSource.PollData.bind(audioSource));
    Controls.SetupAnimator(audioSource, animator);
    Controls.SetupSampleSmoothing(audioSource);
    Controls.SetupVolumeBar(audioSource);
    Controls.SetupProgressBar(audioSource);
    Controls.SetupPlayButton(audioSource);
    Controls.SetupFileChooser(audioSource);
    //Default values
    audioSource.Volume = 0.25;
    let smoothingSlider = document.getElementById('smoothing-slider');
    smoothingSlider.value = '60';
    //API sucks and won't dispatch a change event for programmatic changes.
    //If you want something done right, gotta do it yourself :P
    smoothingSlider.dispatchEvent(new Event('change'));
})();
