// @ts-nocheck
var JMVisualizer = function () {
    function FrequencyAnimation(stream) {
        var cancellationToken;
        var canvasElement = document.getElementById('visualizer-canvas');
        var context = canvasElement.getContext("2d");       
        var barWidth = 3.5;
        var barCount = Math.floor(1024 / barWidth);
        var buffer = 2;
        var draw = function () {
            //let domain = buffer + 1;
            context.clearRect(0, 0, 1024, 275);
            for (let bin = 0; bin < barCount; bin++) {
                //let average = 0;
               // for (let i = bin; i < domain; i++) {
                   // average += stream[bin + i];
                //}
                //average /= domain;
                context.fillStyle = '#F90';
                context.fillRect(bin * barWidth, 275 - stream[bin], barWidth, 275);
            }
            cancellationToken = requestAnimationFrame(draw);
        };

        this.start = function () {
            draw();
        };
        this.stop = function () {
            if (cancellationToken != 0) {
                cancelAnimationFrame(cancellationToken);
            }
        };

        this.setBuffer = function (newBuffer) {
            buffer = newBuffer;
        }
    }

    function LocalAudioSource() {
        var self = this;
        var player = createPlayer();
        var audioContext = new (window.AudioContext || window.webkitAudioContext);
        var analyser = audioContext.createAnalyser();
        analyser.fftSize = 16384;
        analyser.smoothingTimeConstant = 0.7;
        var source = audioContext.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        this.streamData = new Uint8Array(analyser.frequencyBinCount);
        var sampleAudioStream = function () {
            analyser.getByteFrequencyData(self.streamData);
        };
        setInterval(sampleAudioStream, 25);

        this.setStream = function (streamUrl) {
            self.pause();
            audioControls.reset();
            source.disconnect();
            var volume = player.volume;
            player.remove();
            player = createPlayer();
            player.volume = volume;
            source = audioContext.createMediaElementSource(player);
            player.src = streamUrl;
            source.connect(analyser);
        };

        this.setSmoothing = function (smoothing) {
            analyser.smoothingTimeConstant = smoothing;
        }

        var trackProgressInterval;
        this.play = function () {
            if (player.paused) {
                player.play();
                trackProgressInterval = setInterval(trackProgress, 233);
            }
        }
        this.pause = function () {
            player.pause();
            clearInterval(trackProgressInterval);
        }

        Object.defineProperty(self, 'volume', {
            get: function () {
                return player.volume;
            },
            set: function (value) {
                player.volume = value;
            }
        });

        function createPlayer() {
            var player = document.createElement('audio');
            player.id = 'audio-player';
            document.getElementsByClassName('canvas-border')[0].appendChild(player);
            player.addEventListener('ended', function () {
                audioControls.reset();
                clearInterval(trackProgressInterval);
            });
            return player;
        }

        function trackProgress() {
            audioControls.setProgressBar((player.currentTime / player.duration), player.currentTime);
        }
    }

    function AudioControls() {
        document.getElementsByClassName('volume-control')[0].addEventListener('click', function (e) {
            var volume = (e.clientX - this.offsetLeft) / this.offsetWidth;;
            audioControls.setVolume(volume);
        });
        document.getElementById('player-play').addEventListener('click', function (e) {
            e.preventDefault();
            if (this.value === '>') {
                this.value = 'l l';
                audioSource.play();
                animation.start();
            }
            else {
                this.value = '>';
                audioSource.pause();
                animation.stop();
            }
        });
        document.getElementsByClassName('domain-slider')[0].addEventListener('change', function () {
            audioControls.setDomain(this.value);           
        });
        document.getElementsByClassName('smoothing-slider')[0].addEventListener('change', function () {
            audioControls.setSmoothing(this.value / 100);          
        });

        var volumeBar = document.querySelector('.volume-control > .progress-bar');
        this.setVolume = function (volume) {
            audioSource.volume = volume;
            volumeBar.style.width = volume * 100 + '%';
        };

        var progressBar = document.querySelector('.playback-progress > .progress-bar');
        this.setProgressBar = function (progress, time) {
            progressBar.style.width = progress * 100 + '%';
            $('.player-total-time').text(formatTime(time));
        };

        this.reset = function () {
            document.getElementById('player-play').value = '>';
            animation.stop();
            document.querySelector('.playback-progress > .progress-bar').style.width = 0;
        };

        function formatTime(seconds) {
            seconds = Math.round(seconds);
            var minutes = Math.floor(seconds / 60);
            minutes = (minutes < 10) ? '0' + minutes : minutes;
            var seconds = Math.floor(seconds % 60);
            seconds = (seconds < 10) ? '0' + seconds : seconds;
            return minutes + ':' + seconds;
        }

        this.setSmoothing = function (smoothing) {
            audioSource.setSmoothing(smoothing);
            $('.smoothing-display').text(smoothing * 100 + ' %');
        }

        this.setDomain = function (domain) {
            animation.setBuffer(domain);
            $('.domain-display').text(domain);
        }
    }

    var audioSource = new LocalAudioSource('audio-player');
    var animation = new FrequencyAnimation(audioSource.streamData);
    var audioControls = new AudioControls();

    return {
        setStream: audioSource.setStream,
        setVolume: audioControls.setVolume,
        setSmoothing: audioControls.setSmoothing,
        setDomain: audioControls.setDomain
    };
}();

$(function () {
    JMVisualizer.setVolume(0.25);
    JMVisualizer.setSmoothing(0.7);
    $('.smoothing-slider').val(70);
    JMVisualizer.setDomain(2);
    $('.domain-slider').val(2);

    document.getElementById('audio-file').addEventListener('change', function (e) {
        e.preventDefault();
        JMVisualizer.setStream(URL.createObjectURL(e.target.files[0]));
        document.getElementById('player-play').click();
    });   
});