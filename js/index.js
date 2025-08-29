// Core UI + data rendering (clean, commented-free, resilient)
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // DOM refs
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const filterControls = document.getElementById('filterControls');
  const filterHint = document.getElementById('filterHint');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const romsGrid = document.getElementById('romsGrid');
  const krGrid = document.getElementById('krGrid');
  const recGrid = document.getElementById('recGrid');
  const romsEmpty = document.getElementById('romsEmpty');
  const krEmpty = document.getElementById('krEmpty');
  const recEmpty = document.getElementById('recEmpty');

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
  });

  // Utility: normalize android version value to a numeric string (e.g. "16")
  const normalizeVersion = (v) => {
    if (v == null) return '';
    const s = String(v).trim();
    const m = s.match(/(\d{1,2})/);
    return m ? m[1] : s;
  };

  // Render helpers
  const mkTag = (text, cls = '') => {
    const el = document.createElement('span');
    el.className = `tag-pill ${cls}`;
    el.textContent = text;
    return el;
  };

  const createCard = (item, type = 'rom') => {
    const card = document.createElement('article');
    card.className = type === 'rom' ? 'rom-card' : 'kr-card';
    card.tabIndex = 0;

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.src = item.image || 'assets/placeholder.jpg';
    img.alt = item.name || 'build image';
    img.loading = 'lazy';
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.innerHTML = item.name || 'Untitled';

    const sub = document.createElement('div');
    sub.className = 'card-sub';
    const androidVer = normalizeVersion(item.android_version);
    sub.textContent = androidVer ? `Android ${androidVer} • ${item.arch || 'arm'}` : (item.arch || '');

    const tagWrap = document.createElement('div');
    tagWrap.className = 'card-tags';
    if (item.status === 'official') tagWrap.appendChild(mkTag('Official','tag-official'));
    if (item.status === 'unofficial') tagWrap.appendChild(mkTag('Unofficial','tag-unofficial'));
    if (item.build_type === 'gapps') tagWrap.appendChild(mkTag('GApps','tag-gapps'));

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const btn1 = document.createElement('button');
    btn1.className = 'btn-ghost';
    btn1.innerHTML = 'Details';

    const btn2 = document.createElement('button');
    btn2.className = 'btn-primary';
    btn2.innerHTML = 'Download';

    actions.appendChild(btn1);
    actions.appendChild(btn2);

    body.appendChild(title);
    body.appendChild(sub);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(tagWrap);
    card.appendChild(body);

    card.dataset.name = (item.name || '').toLowerCase();
    card.dataset.desc = (item.description || '').toLowerCase();
    card.dataset.tags = `${item.status||''} ${item.build_type||''} ${androidVer}`.toLowerCase();

    return card;
  };

  // Intersection-backed reveal with gentle staggering
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      const el = e.target;
      if (e.isIntersecting) {
        setTimeout(() => el.classList.add('visible'), (el.dataset.delay || 0));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  // Data load (robust): try roms.json, kernels.json, recoveries.json
  const loadJson = async (url) => {
    try {
      const r = await fetch(url, {cache:'no-cache'});
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  };

  const renderList = (container, list, type='rom') => {
    container.innerHTML = '';
    if (!list || !list.length) return;
    list.forEach((it, idx) => {
      const card = createCard(it, type);
      card.dataset.delay = idx * 60;
      container.appendChild(card);
      observer.observe(card);
    });
  };

  // Global data state
  const state = {
    roms: [],
    kernels: [],
    recoveries: [],
    activeFilter: 'all',
    searchTerm: '',
  };

  // Apply filter + search
  const applyFilters = () => {
    const query = state.searchTerm.trim().toLowerCase();
    const qTokens = query.split(/\s+/).filter(Boolean);
    const filter = state.activeFilter;

    const applyTo = (list, container, emptyEl, type='rom') => {
      container.querySelectorAll('.rom-card, .kr-card').forEach(n => n.remove());
      const results = list.filter(item => {
        const android = normalizeVersion(item.android_version);
        const text = `${item.name||''} ${(item.description||'')} ${item.status||''} ${item.build_type||''} ${android}`.toLowerCase();
        // filter by filter token
        if (filter && filter !== 'all') {
          if (filter === 'official' || filter === 'unofficial') {
            if ((item.status || '') !== filter) return false;
          } else if (/^\d+$/.test(filter)) {
            if (normalizeVersion(item.android_version) !== filter) return false;
          } else {
            // other token: match in text
            if (!text.includes(filter)) return false;
          }
        }
        // search tokens
        if (qTokens.length) {
          return qTokens.every(t => text.indexOf(t) !== -1);
        }
        return true;
      });

      renderList(container, results, type);
      emptyEl.style.display = results.length ? 'none' : 'block';
    };

    applyTo(state.roms, romsGrid, romsEmpty, 'rom');
    applyTo(state.kernels, krGrid, krEmpty, 'kr');
    applyTo(state.recoveries, recGrid, recEmpty, 'kr');
  };

  // Filter UI events
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.searchTerm.trim()) return;
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      state.activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // Search (debounced)
  function debounce(fn, wait = 220){
    let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), wait); };
  }

  const onSearch = debounce((val) => {
    state.searchTerm = val;
    // when searching, disable filters visually and set hint
    if (state.searchTerm.trim()) {
      filterBtns.forEach(b => { b.setAttribute('aria-disabled','true'); b.classList.remove('active'); });
      filterHint.classList.add('show');
    } else {
      filterBtns.forEach(b => { b.removeAttribute('aria-disabled'); });
      filterHint.classList.remove('show');
      // restore All if nothing active
      if (!filterBtns.some(b => b.classList.contains('active'))) {
        const all = document.querySelector('.filter-btn[data-filter="all"]');
        if (all) { all.classList.add('active'); all.setAttribute('aria-pressed','true'); state.activeFilter = 'all'; }
      }
    }
    applyFilters();
    clearBtn.classList.toggle('show', !!state.searchTerm.trim());
  }, 200);

  searchInput.addEventListener('input', (e) => onSearch(e.target.value));
  clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); onSearch(''); });

  // Initial load
  (async function init(){
    const [romsData, kernelsData, recData] = await Promise.allSettled([
      loadJson('assets/roms.json'),
      loadJson('assets/kernels.json'),
      loadJson('assets/recoveries.json'),
    ]);

    state.roms = romsData.status === 'fulfilled' && romsData.value ? romsData.value : [];
    state.kernels = kernelsData.status === 'fulfilled' && kernelsData.value ? kernelsData.value : [];
    state.recoveries = recData.status === 'fulfilled' && recData.value ? recData.value : [];

    applyFilters();
  })();

  // Parallax hero small effect using rAF
  const heroImg = document.getElementById('heroImage');
  if (heroImg) {
    let last = 0;
    window.addEventListener('scroll', () => {
      last = window.scrollY;
      requestAnimationFrame(() => {
        const y = Math.min(Math.max(last * 0.08, -20), 20);
        heroImg.style.transform = `translateY(${y}px)`;
      });
    }, { passive: true });
  }

})();