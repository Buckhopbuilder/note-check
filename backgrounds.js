/* Decorative only: no scanner, serial, result or coin-check dependencies. */
(() => {
  'use strict';
  const scenes = ['trex', 'bathurst', 'shark', 'commando', 'cyborg', 'emperor'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const backdrop = document.createElement('div');
  backdrop.className = 'adventure-background';
  backdrop.setAttribute('aria-hidden', 'true');
  const layers = [document.createElement('img'), document.createElement('img')];
  layers.forEach(img => { img.alt = ''; img.decoding = 'async'; backdrop.append(img); });
  document.body.prepend(backdrop);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'background-toggle';
  document.querySelector('header').append(button);
  let paused = motion.matches, timer, current = 0, active = 0, busy = false;
  function label() {
    button.textContent = paused ? 'Play backgrounds' : 'Pause backgrounds';
    button.setAttribute('aria-label', paused ? 'Play background slideshow' : 'Pause background slideshow');
    button.setAttribute('aria-pressed', String(paused));
  }
  function source(index) { return `backgrounds/${scenes[index]}.webp`; }
  async function advance() {
    if (paused || document.hidden || busy) return;
    busy = true;
    const next = (current + 1) % scenes.length;
    const layer = layers[1 - active];
    layer.src = source(next);
    try {
      await layer.decode();
      if (!paused && !document.hidden) {
        layer.classList.add('visible');
        layers[active].classList.remove('visible');
        current = next; active = 1 - active;
      }
    } catch (_) { /* Keep the last usable picture if an image fails. */ }
    finally { busy = false; }
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !document.hidden) timer = setInterval(advance, 10000);
    label();
  }
  layers[0].src = source(0);
  layers[0].classList.add('visible');
  button.addEventListener('click', () => { paused = !paused; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  schedule();
})();
