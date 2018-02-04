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
    // do something when sound is loaded
  }

  getSound(index) {
    return this.buffer[index];
  }
}
