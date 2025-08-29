document.addEventListener('DOMContentLoaded', () => {
  const romsContainer = document.querySelector('.roms-container');
  const kernelsContainer = document.querySelector('.kernels-container');
  const recoveriesContainer = document.querySelector('.recoveries-container');
  const filterControls = document.querySelector('.filter-controls');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const searchInput = document.getElementById('rom-search');
  const clearBtn = document.getElementById('clear-search');
  const allFilterButtons = document.querySelectorAll('.filter-btn');

  let allRomsData = [];
  let allKernelsData = [];
  let allRecoveriesData = [];
  let allItems = [];

  function getVersionNumber(v) {
    if (v == null) return '';
    const s = String(v);
    const m = s.match(/(\d{1,2})/);
    return m ? m[1] : '';
  }

  function formatAndroidVersion(v) {
    const num = getVersionNumber(v);
    return num ? `Android ${num}` : (v || '');
  }

  async function fetchAllData() {
    try {
      const [romsResp, kernelsResp, recoveriesResp] = await Promise.all([
        fetch('assets/roms.json'),
        fetch('assets/kernels.json'),
        fetch('assets/recoveries.json')
      ]);
      if (!romsResp.ok || !kernelsResp.ok || !recoveriesResp.ok) {
        throw new Error('One or more JSON files failed to load');
      }
      allRomsData = await romsResp.json();
      allKernelsData = await kernelsResp.json();
      allRecoveriesData = await recoveriesResp.json();
    } catch (err) {
      console.error('Error fetching data:', err);
      if (romsContainer) romsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load data. Ensure JSON files are present in assets/</p></div>`;
      if (kernelsContainer) kernelsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load kernels.</p></div>`;
      if (recoveriesContainer) recoveriesContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load recoveries.</p></div>`;
    }
  }

  function createRomCard(rom) {
    const card = document.createElement('div');
    card.className = 'rom-card';
    const buildType = (rom.build_type || 'N/A').toLowerCase();
    const statusClass = rom.status ? `status-${String(rom.status).toLowerCase()}` : 'status-unofficial';
    const displayedVersion = formatAndroidVersion(rom.android_version);

    card.innerHTML = `
      <div class="rom-image">
        <img src="${rom.image || 'assets/images/placeholder.jpg'}" alt="${rom.name || ''}" loading="lazy">
        <div class="rom-tags">
          <span class="rom-tag ${statusClass}">${rom.status ? String(rom.status).charAt(0).toUpperCase()+String(rom.status).slice(1) : 'Unknown'}</span>
          <span class="rom-tag build-type-${String(buildType).replace(/\s+/g,'-')}">${(rom.build_type || '').toUpperCase()}</span>
        </div>
      </div>
      <div class="rom-content">
        <h3 class="rom-name">${rom.name || 'Untitled'}</h3>
        <p class="rom-details">
          <span><i class="fas fa-user-check"></i> ${rom.maintainer || ''}</span>
          <span><i class="fab fa-android"></i> ${displayedVersion}</span>
        </p>
        <div class="rom-buttons">
          <a href="${rom.download || '#'}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
          <a href="${rom.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          <a href="${rom.post_link || '#'}" target="_blank" class="rom-btn"><i class="fab fa-telegram"></i> Post</a>
          <a href="${rom.support_group || '#'}" target="_blank" class="rom-btn"><i class="fas fa-users"></i> Support</a>
        </div>
      </div>
    `;

    card.dataset.name = (rom.name || '').toLowerCase();
    card.dataset.maintainer = (rom.maintainer || '').toLowerCase();
    card.dataset.version = (getVersionNumber(rom.android_version) || '').toLowerCase();
    card.dataset.status = (rom.status || '').toLowerCase();
    card.dataset.build = (rom.build_type || '').toLowerCase();
    return card;
  }

  function createKrCard(item) {
    const card = document.createElement('div');
    card.className = 'kr-card';
    card.innerHTML = `
      <div class="kr-image">
        <img src="${item.image || 'assets/images/placeholder.jpg'}" alt="${item.name || ''}" loading="lazy">
      </div>
      <div class="kr-content">
        <h3 class="kr-name">${item.name || 'Untitled'}</h3>
        <p class="kr-details"><span><i class="fas fa-user-check"></i> ${item.maintainer || ''}</span> <span>${item.version ? 'v'+item.version : ''}</span></p>
        <div class="kr-buttons">
          <a href="${item.download || '#'}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
          <a href="${item.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
        </div>
      </div>
    `;
    card.dataset.name = (item.name || '').toLowerCase();
    card.dataset.maintainer = (item.maintainer || '').toLowerCase();
    return card;
  }

  function renderRoms(filter = 'Android 16') {
    if (!romsContainer) return;
    romsContainer.innerHTML = '';

    const filterNum = getVersionNumber(filter);
    const normalizedFilter = filterNum || String(filter).toLowerCase();

    const filtered = allRomsData.filter(r => {
      const rv = getVersionNumber(r.android_version);
      if (filterNum) return rv === filterNum;
      // fallback to exact lower-case match (for tokens like 'official')
      return String(r.android_version || '').toLowerCase() === normalizedFilter;
    });

    if (!filtered.length) {
      romsContainer.innerHTML = `<div class="loading">No ROMs found for ${formatAndroidVersion(filter)}.</div>`;
      refreshSearch();
      return;
    }

    filtered.forEach((rom, idx) => {
      const card = createRomCard(rom);
      romsContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), idx * 70);
    });

    refreshSearch();
  }

  function renderKernels() {
    if (!kernelsContainer) return;
    kernelsContainer.innerHTML = '';
    if (!allKernelsData.length) {
      kernelsContainer.innerHTML = `<div class="loading">No kernels available.</div>`;
      refreshSearch();
      return;
    }
    allKernelsData.forEach((k, idx) => {
      const card = createKrCard(k);
      kernelsContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), idx * 70);
    });
    refreshSearch();
  }

  function renderRecoveries() {
    if (!recoveriesContainer) return;
    recoveriesContainer.innerHTML = '';
    if (!allRecoveriesData.length) {
      recoveriesContainer.innerHTML = `<div class="loading">No recoveries available.</div>`;
      refreshSearch();
      return;
    }
    allRecoveriesData.forEach((r, idx) => {
      const card = createKrCard(r);
      recoveriesContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), idx * 70);
    });
    refreshSearch();
  }

  function collectAllItems() {
    allItems = [];
    document.querySelectorAll('.rom-card').forEach(card => {
      allItems.push({ element: card, searchableText: (card.querySelector('h3')?.textContent + ' ' + (card.querySelector('.rom-details')?.textContent || '')).toLowerCase() });
    });
    document.querySelectorAll('.kernels-container .kr-card, .recoveries-container .kr-card').forEach(card => {
      allItems.push({ element: card, searchableText: (card.querySelector('h3')?.textContent + ' ' + (card.querySelector('.kr-details')?.textContent || '')).toLowerCase() });
    });
  }

  function performSearch(term) {
    const q = String(term || '').toLowerCase().trim();
    const resultsCounter = document.getElementById('search-results-count');

    if (!q) {
      allItems.forEach(it => { it.element.classList.remove('hidden', 'search-hidden'); });
      if (resultsCounter) resultsCounter.textContent = '';
      allFilterButtons.forEach(b => b.style.opacity = '1');
      const active = document.querySelector('.filter-btn.active');
      if (active) renderRoms(active.dataset.filter);
      return;
    }

    collectAllItems();
    allFilterButtons.forEach(b => b.style.opacity = '0.5');

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
      resultsCounter.textContent = visible ? `Found ${visible} result${visible > 1 ? 's' : ''} (showing all categories)` : 'No results found';
      resultsCounter.style.color = visible ? '#666' : 'var(--primary-color)';
    }
  }

  function debounce(fn, wait = 200) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  const debouncedSearch = debounce((v) => performSearch(v), 200);

  function setupSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
      const v = e.target.value;
      clearBtn?.classList.toggle('show', !!String(v).trim());
      debouncedSearch(v);
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const first = document.querySelector('.rom-card:not(.hidden):not(.search-hidden), .kr-card:not(.hidden):not(.search-hidden)');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    clearBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearBtn.classList.remove('show');
      allFilterButtons.forEach(b => b.style.opacity = '1');
      performSearch('');
    });
  }

  function setupFilters() {
    if (!filterControls) return;
    filterControls.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'BUTTON') {
        const activeSearch = searchInput && searchInput.value.trim();
        if (activeSearch) return;
        const prev = filterControls.querySelector('.filter-btn.active');
        if (prev) prev.classList.remove('active');
        e.target.classList.add('active');
        renderRoms(e.target.dataset.filter);
      }
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.addEventListener('click', (e) => { if (e.target.tagName === 'A') navLinks.classList.remove('open'); });
  }

  function refreshSearch() {
    setTimeout(() => {
      collectAllItems();
      const v = searchInput ? searchInput.value : '';
      if (v) performSearch(v);
    }, 160);
  }
  window.refreshSearch = refreshSearch;

  function setupDonationButtons() {
    const upiBtn = document.getElementById('upi-donate');
    const coffeeBtn = document.getElementById('coffee-donate');
    const paypalBtn = document.getElementById('paypal-donate');
    if (upiBtn) upiBtn.addEventListener('click', showUpiModal);
    if (coffeeBtn) coffeeBtn.addEventListener('click', () => window.open('https://coff.ee/Mufasa01', '_blank'));
    if (paypalBtn) paypalBtn.addEventListener('click', () => alert('PayPal donation functionality to be implemented'));
  }

  function showUpiModal() {
    let modal = document.getElementById('upi-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'upi-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" onclick="closeUpiModal()"><i class="fas fa-times"></i></button>
          <h3 class="modal-title">UPI Payment</h3>
          <img src="assets/images/upi-sample.jpg" alt="UPI QR" class="qr-image" style="width:240px;height:240px;border-radius:10px;object-fit:cover;margin:0 auto 12px;">
          <div class="upi-id">UPI ID: xxxxxxx</div>
          <button class="copy-btn" onclick="copyUpiId()">Copy UPI ID</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeUpiModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeUpiModal(); });
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  window.closeUpiModal = function() {
    const m = document.getElementById('upi-modal');
    if (m) { m.classList.remove('show'); document.body.style.overflow = 'auto'; }
  };

  window.copyUpiId = function() {
    const upiId = 'xxxxxxx';
    navigator.clipboard?.writeText(upiId).then(() => {
      const btn = document.querySelector('.copy-btn');
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = '#4CAF50';
      setTimeout(() => { btn.textContent = prev; btn.style.background = ''; }, 1700);
    }).catch(() => alert('UPI ID: ' + upiId));
  };

  async function init() {
    await fetchAllData();
    const activeBtn = document.querySelector('.filter-btn.active');
    const initial = activeBtn ? activeBtn.dataset.filter : 'Android 16';
    renderRoms(initial);
    renderKernels();
    renderRecoveries();
    setupFilters();
    setupSearch();
    setupDonationButtons();
    refreshSearch();
  }

  init();
});