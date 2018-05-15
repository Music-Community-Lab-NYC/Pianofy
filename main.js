(function(func) {
  func(window.jQuery, window, document)
}(function($, window, document) {
    $(function() {
      $('h1').animate({
        top: '+=32%'
      }, 600, 'easeOutBounce', () => {
        $('#piano').animate({
          bottom: '+=60px'
        }, 600);
      });
    });

    class Piano {
      constructor(context, buffer) {
        this.context = context;
        this.buffer = buffer;
      }

      setup() {
        this.source = this.context.createBufferSource();
        this.gainNode = this.context.createGain();

        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.source.buffer = this.buffer;

        this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
      }

      play() {
        this.setup();
        this.source.start(this.context.currentTime);
      }

      stop() {
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
        this.source.stop(this.context.currentTime + 0.5);
      }
    }

    class Buffer {
      constructor(context, urls) {
        this.context = context;
        this.urls = urls;
        this.buffer = [];
      }

      loadSound(url, index) {
        let request = new XMLHttpRequest();
        let thisBuffer = this;

        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
          thisBuffer.context.decodeAudioData(request.response, buffer => {
            thisBuffer.buffer[index] = buffer;

            updateProgress(thisBuffer.urls.length);

            if (index === thisBuffer.urls.length - 1) {
              this.loaded();
            }
          });
        };
        request.send();
      }

      getBuffer() {
        this.urls.forEach((url, index) => {
          this.loadSound(url, index);
        });
      }

      loaded() {
        // Do something when all sounds are loaded
        document.querySelector('.progress').style.opacity = 0;
        document.querySelector('#piano').style.opacity = 1;
      }

      getSound(index) {
        return this.buffer[index];
      }
    }

    let progress = document.querySelector('.progress');
    let bar = document.querySelector('.bar');
    let counter = 0;
    let piano = null;

    function updateProgress(size) {
      let value = `${++counter / size * 100}%`;

      progress.setAttribute('value', value);

      bar.style.width = value;
    }

    function cursor(event) {
      finger.style.left = `${event.clientX}px`;
      finger.style.top = `${event.clientY}px`;
    }

    function playPiano() {
      // set all the custom data attributes on each key to represent each note
      let index = parseInt(this.dataset.note, 10);

      piano = new Piano(context, buffer.getSound(index));
      piano.play();
    }

    function stopPiano() {
      piano.stop();
    }

    function showRipple() {
      rippleLarge.style.animationPlayState = 'running';
      rippleSmall.style.animationPlayState = 'running';
      rippleLarge.classList.remove('hidden');
      rippleSmall.classList.remove('hidden');
    }

    function hideRipple() {
      rippleLarge.style.animationPlayState = 'paused';
      rippleSmall.style.animationPlayState = 'paused';
      rippleLarge.classList.add('hidden');
      rippleSmall.classList.add('hidden');
    }

    function keys(keys) {
      keys.forEach(key => {
        key.addEventListener('mouseenter', () => {
          context.resume().then(() => {
            playPiano.bind(key)();
            showRipple();
            setTimeout(hideRipple, 300);
          });
        });
        key.addEventListener('mouseleave', () => {
          stopPiano();
          hideRipple();
        });
      });
    }

    let context = new (window.AudioContext || window.webkitAudioContext)();
    let sounds = [
      // urls of piano notes (C, D, E, F, G, A, B, Db, Eb, Gb, Ab, Bb)
      'https://play-pianofy.herokuapp.com/notes/C.mp3',
      'https://play-pianofy.herokuapp.com/notes/D.mp3',
      'https://play-pianofy.herokuapp.com/notes/E.mp3',
      'https://play-pianofy.herokuapp.com/notes/F.mp3',
      'https://play-pianofy.herokuapp.com/notes/G.mp3',
      'https://play-pianofy.herokuapp.com/notes/A.mp3',
      'https://play-pianofy.herokuapp.com/notes/B.mp3',
      'https://play-pianofy.herokuapp.com/notes/Db.mp3',
      'https://play-pianofy.herokuapp.com/notes/Eb.mp3',
      'https://play-pianofy.herokuapp.com/notes/Gb.mp3',
      'https://play-pianofy.herokuapp.com/notes/Ab.mp3',
      'https://play-pianofy.herokuapp.com/notes/Bb.mp3'
    ];
    let buffer = new Buffer(context, sounds);

    buffer.getBuffer();

    let finger = document.querySelector('.finger');
    let rippleLarge = document.querySelector('.ripple-large');
    let rippleSmall = document.querySelector('.ripple-small');
    let bottomKeys = document.querySelectorAll('#piano .bottom-note');
    let upKeys = document.querySelectorAll('#piano .up-note');
    let audio = document.querySelector('audio');
    let play = document.querySelector('.play');
    let rewind = document.querySelector('.rewind');

    document.addEventListener('mousemove', cursor);

    keys(bottomKeys);
    keys(upKeys);

    audio.addEventListener('ended', pauseTrack);
    play.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playTrack();
      } else {
        audio.pause();
        pauseTrack();
      }
    });
    rewind.addEventListener('click', () => {
      audio.currentTime = 0;
    });

    function playTrack() {
      play.querySelector('.pause-icon').style.display = 'block';
      play.querySelector('.play-icon').style.display = 'none';
    }

    function pauseTrack() {
      play.querySelector('.pause-icon').style.display = 'none';
      play.querySelector('.play-icon').style.display = 'block';
    }
  }
));
