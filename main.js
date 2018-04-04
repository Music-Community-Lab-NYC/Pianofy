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

function playPiano() {
  let index = parseInt(this.dataset.note);

  piano = new Piano(context, buffer.getSound(index));
  piano.play();
}

function stopPiano() {
  piano.stop();
}

let context = new (window.AudioContext || window.webkitAudioContext)();
let sounds = [
  // piano notes url (G4, A4, C5, D5, E5, G5, A5, C6, D6, D#6, E6, G6, A6, C7, D7)
];
let buffer = new Buffer(context, sounds);

buffer.getBuffer();

let keys = document.querySelectorAll('#piano .bottom-note');

keys.forEach(key => {
  key.addEventListener('mouseenter', playPiano.bind(key));
  key.addEventListener('mouseleave', stopPiano);
});

// set all the custom data attributes on each key to represent each note
// let index = parseInt(dataset.note, 10);
// let piano = new Piano(context, buffer.getSound(index));
// piano.play();
