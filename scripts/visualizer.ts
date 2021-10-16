import { AudioSource } from "./audiosource.js";
import { Animator } from "./animator.js";
import * as Controls from "./audiocontrols.js";

(function () {
    let audioSource = new AudioSource(new window.AudioContext);
    let animator = new Animator(
        document.getElementById('visualizer-canvas') as HTMLCanvasElement, 
        audioSource.PollData.bind(audioSource)
    );

    Controls.SetupAnimator(audioSource, animator);
    Controls.SetupSampleSmoothing(audioSource);
    Controls.SetupDomainSmoothing(animator);
    Controls.SetupVolumeBar(audioSource);
    Controls.SetupProgressBar(audioSource);
    Controls.SetupPlayButton(audioSource);
    Controls.SetupFileChooser(audioSource);

    //Default values
    audioSource.Volume = 0.25;

    let smoothingSlider = document.getElementById('smoothing-slider') as HTMLInputElement;
    let domainSlider = document.getElementById('domain-slider') as HTMLInputElement;
    smoothingSlider.value = '60';
    domainSlider.value = '0';
    //API sucks and won't dispatch a change event for programmatic changes.
    //If you want something done right, gotta do it yourself :P
    smoothingSlider.dispatchEvent(new Event('change'));
    domainSlider.dispatchEvent(new Event('change'));
})();