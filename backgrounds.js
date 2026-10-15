/* Decorative only: no scanner, serial, result or coin-check dependencies. */
(() => {
  'use strict';
  const scenes = ['trex', 'crocodiles', 'bathurst', 'space', 'shark', 'farm', 'commando', 'cage', 'cyborg', 'bears', 'emperor', 'kraken'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const backdrop = document.createElement('div');
  backdrop.className = 'adventure-background';
  backdrop.setAttribute('aria-hidden', 'true');
  const layers = [document.createElement('img'), document.createElement('img')];
  layers.forEach(img => { img.alt = ''; img.decoding = 'async'; backdrop.append(img); });
  document.querySelector('.intro').prepend(backdrop);
  let paused = motion.matches, timer, current = 0, active = 0, busy = false;
  let eggActive = false, eggTimer, eggToken = 0;
  function source(index) { return `backgrounds/${scenes[index]}.webp`; }
  async function advance() {
    if (paused || document.hidden || busy || eggActive) return;
    busy = true;
    const next = (current + 1) % scenes.length;
    const layer = layers[1 - active];
    layer.src = source(next);
    try {
      await layer.decode();
      if (!paused && !document.hidden && !eggActive) {
        layer.classList.add('visible');
        layers[active].classList.remove('visible');
        current = next; active = 1 - active;
      }
    } catch (_) { /* Keep the last usable picture if an image fails. */ }
    finally { busy = false; }
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !document.hidden && !eggActive) timer = setInterval(advance, 5000);
  }
  layers[0].src = source(0);
  layers[0].classList.add('visible');
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });

  // This image is intentionally absent from scenes and only loads on discovery.
  const secret = document.createElement('img');
  secret.alt = '';
  secret.className = 'secret-slide';
  secret.decoding = 'async';
  backdrop.append(secret);
  const trigger = document.querySelector('.brand-tagline');
  trigger.setAttribute('aria-label', "What's he searching for? Reveal the ultimate ride");
  trigger.setAttribute('aria-pressed', 'false');
  function finishRide() {
    eggToken++;
    clearTimeout(eggTimer);
    secret.classList.remove('visible');
    eggActive = false;
    trigger.setAttribute('aria-pressed', 'false');
    schedule();
  }
  async function showRide() {
    if (eggActive) { finishRide(); return; }
    eggActive = true;
    const token = ++eggToken;
    clearInterval(timer);
    secret.src = 'backgrounds/ultimate-ride.webp';
    try {
      await secret.decode();
      if (token !== eggToken || document.hidden) {
        if (token === eggToken) finishRide();
        return;
      }
      secret.classList.add('visible');
      trigger.setAttribute('aria-pressed', 'true');
      eggTimer = setTimeout(finishRide, 3000);
    } catch (_) {
      if (token === eggToken) finishRide();
    }
  }
  trigger.addEventListener('click', showRide);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && eggActive) finishRide();
  });

  const rain = document.createElement('div');
  rain.className = 'money-rain';
  rain.setAttribute('aria-hidden', 'true');
  const art = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="44" viewBox="0 0 96 44"><rect x="1" y="1" width="94" height="42" rx="4" fill="#ead263" stroke="#fff3a5" stroke-width="2"/><rect x="7" y="7" width="82" height="30" rx="3" fill="none" stroke="#967726"/><ellipse cx="48" cy="22" rx="14" ry="17" fill="#c8ac47"/><text x="48" y="28" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#67531b">$50</text></svg>';
  const url = 'data:image/svg+xml,' + encodeURIComponent(art);
  for (let i = 0; i < 18; i++) {
    const note = document.createElement('img');
    note.src = url; note.alt = '';
    note.style.cssText = '--x:' + ((i * 37) % 100) + '%;--duration:' + (15 + i % 7 * 2) + 's;--delay:-' + (i * 2.7) + 's;--tilt:' + ((i * 29) % 110 - 55) + 'deg';
    rain.append(note);
  }
  document.body.prepend(rain);
  document.addEventListener('visibilitychange', () => { rain.classList.toggle('resting', document.hidden); });
  schedule();
})();
