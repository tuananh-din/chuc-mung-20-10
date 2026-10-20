// garden.js — vườn hoa "trăm hoa đua nở" vẽ bằng canvas: hoa mọc thân, nở cánh, đung đưa; cánh hoa rơi
(function () {
  'use strict';
  const canvas = document.getElementById('garden');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PETAL_COLORS = ['#ff6f91', '#ff8fab', '#ff5e78', '#ffb3c6', '#d65db1', '#b56cff', '#ffc75f', '#ff9671', '#fff0f3', '#f78fb3'];
  const CENTER_COLORS = ['#ffd166', '#ffb703', '#8a4b1e', '#fff3b0'];

  let W = 0, H = 0, dpr = 1, lastT = 0;
  const flowers = [];
  const petals = [];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Tạo một bông hoa tại x; depth 0 (xa, nhỏ, mờ) → 1 (gần, to, rõ); headY: ép đầu hoa tới toạ độ này
  function makeFlower(x, depth, delay, headY) {
    const scale = 0.45 + depth * 0.75;
    const baseY = H - (1 - depth) * H * 0.22; // hoa ở xa đứng cao hơn trên triền đồi
    const height = headY != null ? Math.max(40, baseY - headY) : rand(90, 220) * scale;
    return {
      x, baseY, depth, scale, height,
      r: rand(14, 24) * scale,
      petals: Math.floor(rand(5, 9)),
      color: pick(PETAL_COLORS), inner: pick(PETAL_COLORS), center: pick(CENTER_COLORS),
      rot: rand(0, Math.PI * 2), phase: rand(0, Math.PI * 2),
      born: performance.now() + delay,
      grow: 0, bloom: 0,
    };
  }

  // Gieo cả cánh đồng: khoảng 60–140 bông tuỳ bề rộng màn hình, nở so le nhau
  function plantField() {
    flowers.length = 0;
    const count = Math.max(60, Math.min(140, Math.round(W / 12)));
    for (let i = 0; i < count; i++) {
      flowers.push(makeFlower(rand(-10, W + 10), Math.random(), i * 45 + rand(0, 400)));
    }
    flowers.sort((a, b) => a.depth - b.depth); // vẽ hoa xa trước, hoa gần đè lên
  }

  function makePetal(fromTop) {
    return {
      x: rand(0, W), y: fromTop ? rand(-60, -10) : rand(0, H),
      size: rand(5, 11), color: pick(PETAL_COLORS),
      vy: rand(18, 42), drift: rand(0.6, 1.6), phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2), spin: rand(-1.5, 1.5),
    };
  }

  function update(dt, t) {
    for (const f of flowers) {
      const age = t - f.born;
      if (age < 0) continue;
      f.grow = reduceMotion ? 1 : clamp01(age / 1400);
      f.bloom = reduceMotion ? 1 : clamp01((age - 900) / 1000);
    }
    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += Math.sin(t * 0.001 * p.drift + p.phase) * 18 * dt;
      p.rot += p.spin * dt;
      if (p.y > H + 20) Object.assign(p, makePetal(true));
    }
  }

  function drawBackdrop() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#fff7f0'); sky.addColorStop(0.55, '#ffe4ec'); sky.addColorStop(1, '#ffd6e0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const sun = ctx.createRadialGradient(W * 0.8, H * 0.18, 0, W * 0.8, H * 0.18, H * 0.35);
    sun.addColorStop(0, 'rgba(255, 214, 165, 0.9)'); sun.addColorStop(1, 'rgba(255, 214, 165, 0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
    hill(H * 0.80, '#cfe8c3');
    hill(H * 0.88, '#b6dba6');
  }
  function hill(y, color) {
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, y + 20);
    ctx.quadraticCurveTo(W * 0.3, y - 30, W * 0.55, y + 10);
    ctx.quadraticCurveTo(W * 0.8, y + 40, W, y - 10);
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  }

  function drawFlower(f, t) {
    if (f.grow <= 0) return;
    const sway = reduceMotion ? 0 : Math.sin(t * 0.0011 + f.phase) * 5 * f.scale;
    const stemH = f.height * easeOutCubic(f.grow);
    const topX = f.x + sway, topY = f.baseY - stemH;
    ctx.globalAlpha = 0.55 + f.depth * 0.45;
    // Thân cong nhẹ theo gió
    ctx.beginPath(); ctx.moveTo(f.x, f.baseY);
    ctx.quadraticCurveTo(f.x + sway * 0.3, f.baseY - stemH * 0.55, topX, topY);
    ctx.strokeStyle = '#4e8d47'; ctx.lineWidth = 2.4 * f.scale; ctx.lineCap = 'round'; ctx.stroke();
    if (f.grow > 0.5) leaf(f.x + sway * 0.15, f.baseY - stemH * 0.45, f.scale, f.phase);
    // Nụ trước khi nở
    const b = f.bloom > 0 ? easeOutBack(f.bloom) : 0;
    if (b <= 0) {
      ctx.beginPath(); ctx.ellipse(topX, topY, 3 * f.scale, 5 * f.scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#7fb77e'; ctx.fill(); ctx.globalAlpha = 1; return;
    }
    // Hai lớp cánh hoa + nhuỵ
    ctx.save(); ctx.translate(topX, topY); ctx.rotate(f.rot + sway * 0.02); ctx.scale(b, b);
    petalRing(f.petals, f.r, f.color);
    ctx.rotate(Math.PI / f.petals); petalRing(f.petals, f.r * 0.62, f.inner);
    ctx.beginPath(); ctx.arc(0, 0, f.r * 0.28, 0, Math.PI * 2); ctx.fillStyle = f.center; ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function petalRing(n, r, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      ctx.rotate((Math.PI * 2) / n);
      ctx.beginPath(); ctx.ellipse(r * 0.58, 0, r * 0.62, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  function leaf(x, y, s, phase) {
    const dir = phase > Math.PI ? 1 : -1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(dir * -0.7);
    ctx.beginPath(); ctx.ellipse(dir * 9 * s, 0, 10 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#62a35a'; ctx.fill(); ctx.restore();
  }
  function drawPetals() {
    for (const p of petals) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = 0.8; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
    update(dt, t);
    drawBackdrop();
    for (const f of flowers) drawFlower(f, t);
    drawPetals();
    requestAnimationFrame(frame);
  }

  // API cho các script khác: trồng một bông tại điểm chạm, nở một loạt ngẫu nhiên, hoặc gieo lại cả vườn
  window.garden = {
    plant(x, y) { flowers.push(makeFlower(x, 0.9, 0, y)); },
    burst(n = 12) { for (let i = 0; i < n; i++) flowers.push(makeFlower(rand(0, W), rand(0.5, 1), i * 80)); },
    replant() { plantField(); },
  };

  // Chạm vào khoảng trống → trồng hoa; bỏ qua khi chạm vào nút, ô nhập, thẻ kính, màn mở thiệp
  window.addEventListener('pointerdown', e => {
    if (e.target.closest('button, input, a, textarea, .the-kinh, #mo-thiep')) return;
    window.garden.plant(e.clientX, e.clientY);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); plantField(); }, 200);
  });

  resize();
  plantField();
  if (!reduceMotion) for (let i = 0; i < 36; i++) petals.push(makePetal(false));
  requestAnimationFrame(frame);
})();
