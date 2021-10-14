import { AudioSource } from "./audiosource";
import { Animator } from "./animator";
import * as Controls from "./audiocontrols";

(function () {
    let audioSource = new AudioSource(new window.AudioContext());
    let animator = new Animator(
        document.getElementById('visualizer-canvas') as HTMLCanvasElement, 
        audioSource.PollData
    );

    Controls.SetupAnimator(audioSource, animator);
    Controls.SetupSampleSmoothing(audioSource);
    Controls.SetupVolumeBar(audioSource);
    Controls.SetupProgressBar(audioSource);
    Controls.SetupPlayButton(audioSource);
    Controls.SetupFileChooser(audioSource);

    //Default values
    audioSource.Volume = 0.25;
    audioSource.Smoothing = 0.7;
     
})();