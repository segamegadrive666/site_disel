/* ===== ФОН: живые шестиугольники (тёплая палитра) ===== */
(function () {
  const c = document.getElementById('hexbg');
  if (!c) return;
  const ctx = c.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let W = 0, H = 0;
  let hexes = [];
  let mouse = { x: -9999, y: -9999 };
  let t = 0;
  let rafId = null;

  const R = 34;
  const HSTEP = R * 1.5;
  const VSTEP = R * Math.sqrt(3);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    c.width = W * DPR;
    c.height = H * DPR;
    c.style.width = W + 'px';
    c.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    hexes = [];
    const cols = Math.ceil(W / HSTEP) + 2;
    const rows = Math.ceil(H / VSTEP) + 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * HSTEP;
        const y = row * VSTEP + (col % 2 ? VSTEP / 2 : 0);
        hexes.push({
          x, y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.5,
        });
      }
    }
  }

  function hexPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + r * Math.cos(a);
      const py = y + r * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.005;

    for (const h of hexes) {
      const dist = Math.hypot(h.x - mouse.x, h.y - mouse.y);
      const near = Math.max(0, 1 - dist / 280);

      const breath = 0.5 + 0.18 * Math.sin(t * h.speed + h.phase);

      /* ТЁПЛАЯ ПАЛИТРА: коричневый -> оранжевый -> янтарь */
      const mix = near * 0.75 + breath * 0.25;

      const hue   = 22 + mix * 16;   // 22 → 38
      const sat   = 50 + mix * 50;   // 50% → 100%
      const light = 30 + mix * 42;   // 30% → 72%

      const alpha = 0.08 + near * 0.30 + breath * 0.05;

      hexPath(h.x, h.y, R * 0.94);
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.lineWidth = 1 + near * 1.1;
      ctx.stroke();

      if (near > 0.15) {
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light + 6}%, ${near * 0.07})`;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener('touchmove', (e) => {
    const p = e.touches[0];
    if (!p) return;
    mouse.x = p.clientX;
    mouse.y = p.clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(draw);
    }
  });

  resize();
  draw();
})();
