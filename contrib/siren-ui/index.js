window.addEventListener('load', () => {
  const API_URL = 'https://router.nightbear.fi/legacy-api/entries';
  const AUDIO_URL = 'siren.mp3';
  const AUDIO_LENGTH = 30; // in sec
  const BG_LIMIT_LOW = 4;
  const BG_LIMIT_HIGH = 15;
  const STARTED_AT = Date.now();

  const audioCtx = new AudioContext();
  let audioBuffer;

  let latestBg;
  let latestTs;

  const $body = document.querySelector('body');
  const $latestBg = document.querySelector('#latest-bg');
  const $latestTs = document.querySelector('#latest-ts');
  const $uptimeTs = document.querySelector('#uptime-ts');
  const $lowLimit = document.querySelector('#low-limit');
  const $highLimit = document.querySelector('#high-limit');

  window
    .fetch(AUDIO_URL)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(audio => (audioBuffer = audio));

  refreshData(true);
  setInterval(refreshData, 1000 * 60 * 5);
  setInterval(refreshUi, 1000 * AUDIO_LENGTH);

  function playSound() {
    const audioSrc = audioCtx.createBufferSource();
    audioSrc.buffer = audioBuffer;
    audioSrc.connect(audioCtx.destination);
    audioSrc.start(); // "An AudioBufferSourceNode can only be played once; after each call to start(), you have to create a new node if you want to play the same sound again" in https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
  }

  function refreshUi() {
    $latestBg.textContent = latestBg.toFixed(1);
    $latestTs.textContent = (Math.max(Date.now() - latestTs, 0) / 1000 / 60).toFixed(1) + ' min ago';
    $uptimeTs.textContent = (Math.max(Date.now() - STARTED_AT, 0) / 1000 / 60 / 60).toFixed(1) + ' hours';
    $lowLimit.textContent = BG_LIMIT_LOW.toFixed(1);
    $highLimit.textContent = BG_LIMIT_HIGH.toFixed(1);
    if (latestBg < BG_LIMIT_LOW || latestBg > BG_LIMIT_HIGH) {
      playSound();
      $body.style.backgroundColor = 'rgb(200,0,0)';
    } else {
      $body.style.backgroundColor = 'initial';
    }
  }

  function refreshData(refreshUiWhenDone = false) {
    return window
      .fetch(API_URL)
      .then(res => res.json())
      .then(res => res.filter(x => x.sugar))
      .then(res => {
        const last = res[res.length - 1];
        latestBg = parseFloat(last.sugar);
        latestTs = last.time;
      })
      .then(() => (refreshUiWhenDone ? refreshUi() : null));
  }
});
