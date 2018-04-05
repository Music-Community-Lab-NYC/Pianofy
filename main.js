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
  }

  getSound(index) {
    return this.buffer[index];
  }
}

let piano = null;

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

function keys(keys) {
  keys.forEach(key => {
    key.addEventListener('mouseenter', playPiano.bind(key));
    key.addEventListener('mouseleave', stopPiano);
  });
}

let context = new (window.AudioContext || window.webkitAudioContext)();
let sounds = [
  // urls of piano notes (C, D, E, F, G, A, B, Db, Eb, Gb, Ab, Bb)
  'https://play-piano.herokuapp.com/notes/C.mp3',
  'https://play-piano.herokuapp.com/notes/D.mp3',
  'https://play-piano.herokuapp.com/notes/E.mp3',
  'https://play-piano.herokuapp.com/notes/F.mp3',
  'https://play-piano.herokuapp.com/notes/G.mp3',
  'https://play-piano.herokuapp.com/notes/A.mp3',
  'https://play-piano.herokuapp.com/notes/B.mp3',
  'https://play-piano.herokuapp.com/notes/Db.mp3',
  'https://play-piano.herokuapp.com/notes/Eb.mp3',
  'https://play-piano.herokuapp.com/notes/Gb.mp3',
  'https://play-piano.herokuapp.com/notes/Ab.mp3',
  'https://play-piano.herokuapp.com/notes/Bb.mp3'
];
let buffer = new Buffer(context, sounds);

buffer.getBuffer();

let finger = document.querySelector('.finger');
let bottomKeys = document.querySelectorAll('#piano .bottom-note');
let upKeys = document.querySelectorAll('#piano .up-note');

document.addEventListener('mousemove', cursor);

keys(bottomKeys);
keys(upKeys);
