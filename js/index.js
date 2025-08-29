document.addEventListener('DOMContentLoaded', () => {
  const romsContainer = document.querySelector('.roms-container');
  const kernelsContainer = document.querySelector('.kernels-container');
  const recoveriesContainer = document.querySelector('.recoveries-container');
  const filterControls = document.querySelector('.filter-controls');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  let allRomsData = [];
  let allKernelsData = [];
  let allRecoveriesData = [];

  // Global search items
  let allItems = [];

  // Utility: extract numeric version (e.g. "Android 16" -> "16", "16" -> "16")
  function versionNum(v) {
    if (v == null) return '';
    const m = String(v).match(/(\d{1,2})/);
    return m ? m[1] : '';
  }

  async function fetchAllData() {
    try {
      const [romsResp, kernelsResp, recoveriesResp] = await Promise.all([
        fetch('assets/roms.json'),
        fetch('assets/kernels.json'),
        fetch('assets/recoveries.json')
      ]);

      if (!romsResp.ok) throw new Error('Failed to fetch roms.json');
      if (!kernelsResp.ok) throw new Error('Failed to fetch kernels.json');
      if (!recoveriesResp.ok) throw new Error('Failed to fetch recoveries.json');

      allRomsData = await romsResp.json();
      allKernelsData = await kernelsResp.json();
      allRecoveriesData = await recoveriesResp.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      if (romsContainer) romsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load ROMs. Check console and ensure JSON files are available.</p></div>`;
      if (kernelsContainer) kernelsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load kernels.</p></div>`;
      if (recoveriesContainer) recoveriesContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load recoveries.</p></div>`;
    }
  }

  // Render ROM cards with flexible filter matching (supports "Android 16" or "16" or "all")
  function generateRomCards(filter = 'Android 16') {
    if (!romsContainer) return;
    romsContainer.innerHTML = '';

    const filterNum = versionNum(filter);

    let filtered;
    if (!filter || String(filter).toLowerCase() === 'all') {
      filtered = allRomsData.slice();
    } else if (filterNum) {
      filtered = allRomsData.filter(r => versionNum(r.android_version) === filterNum);
    } else {
      const lower = String(filter).toLowerCase();
      filtered = allRomsData.filter(r => String(r.android_version || '').toLowerCase() === lower || (r.status || '').toLowerCase() === lower || (r.build_type || '').toLowerCase() === lower);
    }

    if (!filtered.length) {
      romsContainer.innerHTML = `<div class="loading">No ROMs found for ${filter}.</div>`;
      collectAllItems();
      return;
    }

    filtered.forEach((rom, index) => {
      const romCard = document.createElement('div');
      romCard.className = 'rom-card';

      const buildType = rom.build_type || 'N/A';
      const statusClass = rom.status ? `status-${String(rom.status).toLowerCase()}` : 'status-unofficial';
      const imageSrc = rom.image || 'assets/images/placeholder.jpg';
      const maint = rom.maintainer || '';
      const displayedVersion = versionNum(rom.android_version) ? `Android ${versionNum(rom.android_version)}` : (rom.android_version || '');

      romCard.innerHTML = `
        <div class="rom-image">
          <img src="${imageSrc}" alt="${rom.name || ''}" loading="lazy">
          <div class="rom-tags">
            <span class="rom-tag ${statusClass}">${rom.status ? String(rom.status).charAt(0).toUpperCase() + String(rom.status).slice(1) : 'Unknown'}</span>
            <span class="rom-tag build-type-${String(buildType).replace(/\s+/g,'-').toLowerCase()}">${(rom.build_type || '').toUpperCase()}</span>
          </div>
        </div>
        <div class="rom-content">
          <h3 class="rom-name">${rom.name || 'Untitled'}</h3>
          <p class="rom-details">
            <span>${maint}</span>
            <span>${displayedVersion}</span>
          </p>
          <div class="rom-buttons">
            <a href="${rom.download || '#'}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${rom.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          </div>
        </div>
      `;

      romCard.dataset.name = (rom.name || '').toLowerCase();
      romCard.dataset.maintainer = (rom.maintainer || '').toLowerCase();
      romCard.dataset.version = (versionNum(rom.android_version) || '').toLowerCase();
      romCard.dataset.status = (rom.status || '').toLowerCase();
      romCard.dataset.build = (rom.build_type || '').toLowerCase();

      romsContainer.appendChild(romCard);
      setTimeout(() => romCard.classList.add('visible'), index * 60);
    });

    collectAllItems();
  }

  // Kernel / recovery card creators (kept simple & consistent)
  function renderKernels() {
    if (!kernelsContainer) return;
    kernelsContainer.innerHTML = '';
    if (!allKernelsData.length) {
      kernelsContainer.innerHTML = `<div class="loading">No kernels available.</div>`;
      collectAllItems();
      return;
    }
    allKernelsData.forEach((k, idx) => {
      const card = document.createElement('div');
      card.className = 'kr-card';
      const imageSrc = k.image || 'assets/images/placeholder.jpg';
      card.innerHTML = `
        <div class="kr-image"><img src="${imageSrc}" alt="${k.name||''}" loading="lazy"></div>
        <div class="kr-content">
          <h3 class="kr-name">${k.name || 'Untitled'}</h3>
          <p class="kr-details">${k.maintainer || ''} ${k.version ? '• v' + k.version : ''}</p>
          <div class="kr-buttons">
            <a href="${k.download || '#'}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${k.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          </div>
        </div>
      `;
      kernelsContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), idx * 60);
    });
    collectAllItems();
  }

  function renderRecoveries() {
    if (!recoveriesContainer) return;
    recoveriesContainer.innerHTML = '';
    if (!allRecoveriesData.length) {
      recoveriesContainer.innerHTML = `<div class="loading">No recoveries available.</div>`;
      collectAllItems();
      return;
    }
    allRecoveriesData.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'kr-card';
      const imageSrc = r.image || 'assets/images/placeholder.jpg';
      card.innerHTML = `
        <div class="kr-image"><img src="${imageSrc}" alt="${r.name||''}" loading="lazy"></div>
        <div class="kr-content">
          <h3 class="kr-name">${r.name || 'Untitled'}</h3>
          <p class="kr-details">${r.maintainer || ''} ${r.version ? '• v' + r.version : ''}</p>
          <div class="kr-buttons">
            <a href="${r.download || '#'}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${r.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          </div>
        </div>
      `;
      recoveriesContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), idx * 60);
    });
    collectAllItems();
  }

  // Collect items for search
  function collectAllItems() {
    allItems = [];
    document.querySelectorAll('.rom-card').forEach(card => {
      allItems.push({ element: card, type: 'rom', searchableText: getSearchableText(card) });
    });
    document.querySelectorAll('.kernels-container .kr-card, .recoveries-container .kr-card').forEach(card => {
      allItems.push({ element: card, type: 'kr', searchableText: getSearchableText(card) });
    });
  }

  function getSearchableText(card) {
    const title = card.querySelector('h3')?.textContent || '';
    const details = card.querySelector('.rom-details, .kr-details')?.textContent || '';
    return `${title} ${details}`.toLowerCase();
  }

  // perform search (disables filters when searching)
  function performSearch(searchTerm) {
    const q = String(searchTerm || '').toLowerCase().trim();
    const resultsCounter = document.getElementById('search-results-count');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!q) {
      allItems.forEach((item) => item.element.classList.remove('hidden', 'search-hidden'));
      if (resultsCounter) resultsCounter.textContent = '';
      filterBtns.forEach(btn => btn.style.opacity = '1');
      return;
    }

    collectAllItems();
    filterBtns.forEach(btn => btn.style.opacity = '0.5');

    let visible = 0;
    allItems.forEach(it => {
      const ok = it.searchableText.includes(q);
      if (ok) {
        it.element.classList.remove('hidden', 'search-hidden');
        visible++;
      } else {
        it.element.classList.add('search-hidden');
        it.element.classList.remove('hidden');
      }
    });

    if (resultsCounter) {
      if (visible === 0) {
        resultsCounter.textContent = 'No results found';
        resultsCounter.style.color = '#ff6700';
      } else {
        resultsCounter.textContent = `Found ${visible} result${visible>1?'s':''} (showing all categories)`;
        resultsCounter.style.color = '#666';
      }
    }
  }

  // debounce helper
  function debounce(fn, wait = 200) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  // Setup search input (id in your HTML: rom-search)
  function setupSearch() {
    const searchInput = document.getElementById('rom-search');
    const clearBtn = document.getElementById('clear-search');
    if (!searchInput) return;

    const deb = debounce((v) => performSearch(v), 180);

    searchInput.addEventListener('input', (e) => {
      const v = e.target.value || '';
      if (clearBtn) clearBtn.classList.toggle('show', !!v.trim());
      deb(v);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const first = document.querySelector('.rom-card:not(.hidden):not(.search-hidden), .kr-card:not(.hidden):not(.search-hidden)');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('show');
        document.querySelectorAll('.filter-btn').forEach(b => b.style.opacity = '1');
        performSearch('');
      });
    }
  }

  function setupFilters() {
    if (!filterControls) return;
    filterControls.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'BUTTON') {
        const activeSearch = document.getElementById('rom-search')?.value.trim();
        if (activeSearch) return; // do not change filter while search active
        const prev = filterControls.querySelector('.filter-btn.active');
        if (prev) prev.classList.remove('active');
        e.target.classList.add('active');
        generateRomCards(e.target.dataset.filter || e.target.textContent.trim());
      }
    });
  }

  // nav toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.addEventListener('click', (e) => { if (e.target.tagName === 'A') navLinks.classList.remove('open'); });
  }

  // init
  (async function init() {
    await fetchAllData();
    const activeBtn = document.querySelector('.filter-btn.active');
    const initial = activeBtn ? (activeBtn.dataset.filter || activeBtn.textContent.trim()) : 'Android 16';
    generateRomCards(initial);
    renderKernels();
    renderRecoveries();
    setupFilters();
    setupSearch();
  })();

});
