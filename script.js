/* ==========================================================
   NEOCLASSICAL · Slide navigation, candles, dust, interactions
   ========================================================== */
(function(){
  'use strict';

  const slides   = Array.from(document.querySelectorAll('.slide'));
  const dotsBox  = document.getElementById('dots');
  const progress = document.getElementById('progress');
  const counter  = document.getElementById('counter');
  const deck     = document.getElementById('deck');

  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

  let i = 0;
  let locked = false;

  /* ---------- dots ---------- */
  slides.forEach((_, k) => {
    const d = document.createElement('button');
    d.className = 'dot' + (k === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Slide ' + (k + 1));
    d.addEventListener('click', () => go(k));
    dotsBox.appendChild(d);
  });
  const dots = Array.from(dotsBox.children);

  /* ---------- navigation ---------- */
  function go(n){
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === i && slides[i].classList.contains('active')) return;

    const forward = n > i;

    slides.forEach((s, k) => {
      s.classList.remove('exit-up');
      if (k === i && k !== n && forward) s.classList.add('exit-up');
      s.classList.toggle('active', k === n);
    });

    dots.forEach((d, k) => d.classList.toggle('on', k === n));
    i = n;

    progress.style.width = ((i + 1) / slides.length * 100) + '%';
    counter.textContent = ROMAN[i] + ' / ' + ROMAN[slides.length - 1];
    slides[i].scrollTop = 0;

    locked = true;
    setTimeout(() => locked = false, 800);
  }

  document.getElementById('next').addEventListener('click', () => go(i + 1));
  document.getElementById('prev').addEventListener('click', () => go(i - 1));

  /* ---------- keyboard ---------- */
  window.addEventListener('keydown', e => {
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) {
      e.preventDefault(); go(i + 1);
    }
    if (['ArrowLeft','ArrowUp','PageUp'].includes(e.key)) {
      e.preventDefault(); go(i - 1);
    }
    if (e.key === 'Home') go(0);
    if (e.key === 'End')  go(slides.length - 1);
  });

  /* ---------- wheel ---------- */
  window.addEventListener('wheel', e => {
    if (locked) return;
    if (Math.abs(e.deltaY) < 24) return;
    const s = slides[i];
    const atTop    = s.scrollTop <= 0;
    const atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
    if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    go(i + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- swipe ---------- */
  let x0 = 0, y0 = 0, t0 = 0;
  deck.addEventListener('touchstart', e => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    t0 = Date.now();
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    const dt = Date.now() - t0;
    if (dt < 800 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(i + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ==========================================================
     BUILD CANDELABRAS
     ========================================================== */
  function buildCandelabra(container, side){
    const config = [
      { h: 140, w: 16, delay:  0.00 },
      { h: 210, w: 20, delay: -0.06 },
      { h: 165, w: 18, delay: -0.12 }
    ];

    const order = side === 'right' ? [...config].reverse() : config;

    order.forEach(c => {
      const cnd = document.createElement('div');
      cnd.className = 'candle';
      cnd.style.setProperty('--h', c.h + 'px');
      cnd.style.setProperty('--w', c.w + 'px');
      cnd.style.setProperty('--d', c.delay + 's');

      cnd.innerHTML = `
        <div class="wax"></div>
        <div class="flame-wrap">
          <div class="flame-glow"></div>
          <div class="flame"></div>
          <div class="flame-core"></div>
        </div>
      `;
      container.appendChild(cnd);
    });
  }

  document.querySelectorAll('.candelabra').forEach(el => {
    buildCandelabra(el, el.dataset.side || 'left');
  });

  /* ==========================================================
     DUST MOTES
     ========================================================== */
  const dustBox = document.getElementById('dust');
  const COUNT = window.innerWidth < 640 ? 18 : 40;
  for (let k = 0; k < COUNT; k++){
    const m = document.createElement('span');
    m.className = 'mote';
    const size = 1.5 + Math.random() * 3;
    m.style.width  = size + 'px';
    m.style.height = size + 'px';
    m.style.left   = Math.random() * 100 + '%';
    m.style.animationDuration = (18 + Math.random() * 22) + 's';
    m.style.animationDelay    = (-Math.random() * 30) + 's';
    m.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
    dustBox.appendChild(m);
  }

  /* ==========================================================
     PARALLAX CANDLELIGHT with mouse
     ========================================================== */
  const glows = document.querySelectorAll('.glow');
  const ornaments = document.querySelectorAll('.card .corner');

  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - .5);
    const cy = (e.clientY / window.innerHeight - .5);

    glows.forEach((g, idx) => {
      const dir = idx === 0 ? 1 : -1;
      g.style.transform = `translateY(-50%) translate(${cx * 20 * dir}px, ${cy * 12}px)`;
    });

    ornaments.forEach(o => {
      // subtle shine
    });
  }, { passive: true });

  /* ==========================================================
     RANDOM FLICKER ON FLAMES (organic feeling)
     ========================================================== */
  const flames = document.querySelectorAll('.flame');
  setInterval(() => {
    flames.forEach(f => {
      const s = 0.92 + Math.random() * 0.18;
      f.style.setProperty('--scale', s);
    });
  }, 380);

  /* ==========================================================
     START
     ========================================================== */
  go(0);
  requestAnimationFrame(() => slides[0].classList.add('active'));
  progress.style.width = (1 / slides.length * 100) + '%';
  counter.textContent = ROMAN[0] + ' / ' + ROMAN[slides.length - 1];
})();
