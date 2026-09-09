/* ===================== Abhijeet Tiwari — Portfolio ===================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- theme ---------- */
  const saved = localStorage.getItem('theme');
  const qTheme = new URLSearchParams(location.search).get('theme');
  root.dataset.theme = qTheme || saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const setTheme = t => { root.dataset.theme = t; localStorage.setItem('theme', t); };
  $('#themeBtn').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav scrolled state + scroll progress ---------- */
  const nav = $('#nav'), prog = $('#progress');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 8);
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- scrollspy ---------- */
  const spyLinks = $$('.nav__links a[data-spy]');
  const spySections = spyLinks.map(a => document.getElementById(a.dataset.spy)).filter(Boolean);
  const spyIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    spyLinks.forEach(a => a.classList.toggle('is-active', a.dataset.spy === id));
  }), { rootMargin: '-40% 0px -50% 0px' });
  spySections.forEach(s => spyIO.observe(s));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .1 });
  $$('.reveal').forEach(el => io.observe(el));
  const revealVisible = () => $$('.reveal:not(.is-in)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  setTimeout(revealVisible, 200); addEventListener('load', () => setTimeout(revealVisible, 350));

  /* ---------- count-up ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now(), dur = reduce ? 0 : 1300;
    const fmt = n => pre + n.toLocaleString() + suf;
    (function tick(t) { const k = Math.min(1, (t - t0) / (dur || 1)), ease = 1 - Math.pow(1 - k, 4); el.textContent = fmt(Math.round(to * ease)); if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to); })(t0);
  }), { threshold: .6 });
  $$('.count').forEach(el => cio.observe(el));

  /* ---------- project filters ---------- */
  const filtersEl = $('#filters');
  if (filtersEl) filtersEl.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', filtersEl).forEach(c => c.classList.toggle('is-active', c === b));
    const f = b.dataset.filter;
    $$('.work-card').forEach(card => { const show = f === 'all' || card.dataset.tags.split(' ').includes(f); card.classList.toggle('is-hidden', !show); });
  });

  /* ---------- aurora backdrop (soft moving gradient blobs, hero only) ---------- */
  const auroraCanvas = $('#aurora');
  if (auroraCanvas) {
    const ctx = auroraCanvas.getContext('2d');
    let w, h, blobs, raf;
    const css = v => getComputedStyle(root).getPropertyValue(v).trim();
    const resize = () => {
      w = auroraCanvas.width = auroraCanvas.parentElement.clientWidth * Math.min(devicePixelRatio, 2);
      h = auroraCanvas.height = auroraCanvas.parentElement.clientHeight * Math.min(devicePixelRatio, 2);
      const cx = w / 2, cy = h * .4;
      blobs = [
        { x: cx - w * .18, y: cy, r: Math.max(w, h) * .32, c: css('--accent'), a: .55, sx: 0.00018, sy: 0.00013, p: 0 },
        { x: cx + w * .2, y: cy * .7, r: Math.max(w, h) * .26, c: css('--accent-2'), a: .4, sx: 0.00014, sy: 0.0002, p: 2 },
        { x: cx, y: cy * 1.3, r: Math.max(w, h) * .22, c: css('--accent'), a: .3, sx: 0.0002, sy: 0.00016, p: 4 },
      ];
    };
    const draw = t => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs) {
        const x = b.x + Math.sin(t * b.sx + b.p) * w * .06;
        const y = b.y + Math.cos(t * b.sy + b.p) * h * .06;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, hexA(b.c, b.a)); g.addColorStop(1, hexA(b.c, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    function hexA(hex, a) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const n = parseInt(hex, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    addEventListener('resize', resize);
    resize();
    if (!reduce) raf = requestAnimationFrame(draw); else draw(0);
    new MutationObserver(resize).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---------- command palette ---------- */
  const palette = $('#palette'), paletteInput = $('#paletteInput'), paletteList = $('#paletteList');
  const commands = [
    { label: 'View selected work', tag: 'section', action: () => go('#work') },
    { label: 'Stack & tools', tag: 'section', action: () => go('#stack') },
    { label: 'Experience timeline', tag: 'section', action: () => go('#experience') },
    { label: 'Credentials', tag: 'section', action: () => go('#credentials') },
    { label: 'Contact', tag: 'section', action: () => go('#contact') },
    { label: 'Simplifi — AI-Native Legacy Modernization', tag: 'project', action: () => go('#work') },
    { label: 'Waymo — SAP Supply Chain Multi-Agent POC', tag: 'project', action: () => go('#work') },
    { label: 'Measurabl — BillAI', tag: 'project', action: () => go('#work') },
    { label: 'OptimaAI — Agentic SDLC Platform', tag: 'project', action: () => go('#work') },
    { label: 'G&A Partners — Agentic Sales Assistant', tag: 'project', action: () => go('#work') },
    { label: 'TAL — Agentic FSD & Document Intelligence', tag: 'project', action: () => go('#work') },
    { label: 'Download résumé (PDF)', tag: 'action', action: () => window.open('Abhijeet_Tiwari_Senior_Agentic_AI_FDE.pdf', '_blank') },
    { label: 'Copy email address', tag: 'action', action: () => { navigator.clipboard?.writeText('hello@example.com'); } },
    { label: 'Toggle theme', tag: 'action', action: () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark') },
    { label: 'Open LinkedIn', tag: 'link', action: () => window.open('https://www.linkedin.com/', '_blank') },
    { label: 'Open GitHub', tag: 'link', action: () => window.open('https://github.com/', '_blank') },
  ];
  function go(hash) { $(hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  let activeIdx = 0, filtered = commands;
  function renderPalette(q = '') {
    filtered = commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
    activeIdx = 0;
    paletteList.innerHTML = filtered.length ? filtered.map((c, i) =>
      `<li class="palette__item${i === 0 ? ' is-active' : ''}" data-i="${i}"><span>${c.label}</span><span class="tag">${c.tag}</span></li>`
    ).join('') : `<li class="palette__empty">No results</li>`;
  }
  function openPalette() { palette.classList.add('is-open'); palette.setAttribute('aria-hidden', 'false'); paletteInput.value = ''; renderPalette(); setTimeout(() => paletteInput.focus(), 10); }
  function closePalette() { palette.classList.remove('is-open'); palette.setAttribute('aria-hidden', 'true'); }
  function runActive() { const c = filtered[activeIdx]; if (c) { c.action(); closePalette(); } }
  $('#paletteBtn').addEventListener('click', openPalette);
  $('#paletteBackdrop').addEventListener('click', closePalette);
  paletteInput.addEventListener('input', e => renderPalette(e.target.value));
  paletteList.addEventListener('click', e => { const li = e.target.closest('.palette__item'); if (!li) return; activeIdx = +li.dataset.i; runActive(); });
  paletteList.addEventListener('mousemove', e => { const li = e.target.closest('.palette__item'); if (!li) return; $$('.palette__item', paletteList).forEach(x => x.classList.remove('is-active')); li.classList.add('is-active'); activeIdx = +li.dataset.i; });

  addEventListener('keydown', e => {
    const inField = e.target.matches('input,textarea');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('is-open') ? closePalette() : openPalette(); return; }
    if (palette.classList.contains('is-open')) {
      if (e.key === 'Escape') closePalette();
      else if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(filtered.length - 1, activeIdx + 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
      return;
    }
    if (inField) return;
    if (e.key.toLowerCase() === 't') setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  function highlight() { $$('.palette__item', paletteList).forEach((el, i) => el.classList.toggle('is-active', i === activeIdx)); $$('.palette__item', paletteList)[activeIdx]?.scrollIntoView({ block: 'nearest' }); }

  /* ---------- smooth anchor links ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); go(a.getAttribute('href')); } }));
})();
