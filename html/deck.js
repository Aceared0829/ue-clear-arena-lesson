(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const counter = document.getElementById('counter');
  const sectionLabel = document.getElementById('sectionLabel');
  const progressBar = document.getElementById('progressBar');
  const notesPanel = document.getElementById('notesPanel');
  const overview = document.getElementById('overview');
  const ovGrid = document.getElementById('ovGrid');
  let idx = 0;
  let notesOpen = false;
  let ovOpen = false;

  const pad = n => String(n).padStart(2, '0');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function renderNotes() {
    const note = slides[idx].querySelector('.notes');
    notesPanel.textContent = note ? note.textContent.trim() : '这一页没有备注。';
  }

  function show(n, updateHash = true) {
    idx = clamp(n, 0, total - 1);
    slides.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    counter.textContent = `${pad(idx + 1)} / ${pad(total)}`;
    sectionLabel.textContent = slides[idx].dataset.section || '';
    progressBar.style.width = `${((idx + 1) / total) * 100}%`;
    if (updateHash) history.replaceState(null, '', '#s' + (idx + 1));
    slides[idx].scrollTop = 0;
    renderNotes();
  }

  function toggleNotes(force) {
    notesOpen = typeof force === 'boolean' ? force : !notesOpen;
    notesPanel.classList.toggle('open', notesOpen);
    document.body.classList.toggle('notes-open', notesOpen);
    if (notesOpen) renderNotes();
  }

  function toggleOverview(force) {
    ovOpen = typeof force === 'boolean' ? force : !ovOpen;
    overview.classList.toggle('open', ovOpen);
  }

  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'ov-item';
    b.type = 'button';
    const title = s.dataset.title || (s.querySelector('h1,h2') || {}).textContent || '未命名';
    b.innerHTML = `<span class="ov-num">${pad(i + 1)}</span><span>${title}</span>`;
    b.addEventListener('click', () => { toggleOverview(false); show(i); });
    ovGrid.appendChild(b);
  });

  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      show(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      show(idx - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      show(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      show(total - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.();
    } else if (e.key === 'o' || e.key === 'O') {
      toggleOverview();
    } else if (e.key === 'n' || e.key === 'N') {
      toggleNotes();
    } else if (e.key === 'Escape') {
      if (ovOpen) toggleOverview(false);
      else if (notesOpen) toggleNotes(false);
    }
  });

  document.addEventListener('click', async e => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const text = target.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const old = btn.textContent;
    btn.textContent = '已复制';
    setTimeout(() => { btn.textContent = old; }, 1200);
  });

  document.getElementById('prevBtn').addEventListener('click', () => show(idx - 1));
  document.getElementById('nextBtn').addEventListener('click', () => show(idx + 1));

  let sx = 0;
  let sy = 0;
  document.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  const m = location.hash.match(/^#s(\d+)$/);
  show(m ? parseInt(m[1], 10) - 1 : 0, false);
})();
