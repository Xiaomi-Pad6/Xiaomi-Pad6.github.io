document.addEventListener('DOMContentLoaded', () => {
  const romsContainer = document.querySelector('.roms-container');
  const kernelsContainer = document.querySelector('.kernels-container');
  const recoveriesContainer = document.querySelector('.recoveries-container');
  const filterControls = document.querySelector('.filter-controls');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  const parallaxSections = Array.from(document.querySelectorAll('.parallax-section'));

  let allRomsData = [];
  let allKernelsData = [];
  let allRecoveriesData = [];

  // -------- fetch JSONs ----------
  async function fetchAllData() {
    try {
      const [romsResp, kernelsResp, recoveriesResp] = await Promise.all([
        fetch('../assets/roms.json'),
        fetch('../assets/kernels.json'),
        fetch('../assets/recoveries.json')
      ]);

      if (!romsResp.ok) throw new Error('Failed to fetch roms.json');
      if (!kernelsResp.ok) throw new Error('Failed to fetch kernels.json');
      if (!recoveriesResp.ok) throw new Error('Failed to fetch recoveries.json');

      allRomsData = await romsResp.json();
      allKernelsData = await kernelsResp.json();
      allRecoveriesData = await recoveriesResp.json();
    } catch (err) {
      console.error(err);
      if (romsContainer) romsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load data.</div>`;
      if (kernelsContainer) kernelsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load kernels.</div>`;
      if (recoveriesContainer) recoveriesContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load recoveries.</div>`;
    }
  }

  // -------- ROM cards (unchanged behaviour) ----------
  function generateRomCards(filter = 'Android 16') {
    if (!romsContainer) return;
    romsContainer.innerHTML = '';

    const filtered = allRomsData.filter(r => r.android_version === filter);

    if (!filtered.length) {
      romsContainer.innerHTML = `<div class="loading">No ROMs found for ${filter}.</div>`;
      return;
    }

    filtered.forEach((rom, i) => {
      const romCard = document.createElement('div');
      romCard.className = 'rom-card';
      const buildType = rom.build_type || 'N/A';
      const statusClass = rom.status ? `status-${rom.status.toLowerCase()}` : 'status-unofficial';

      romCard.innerHTML = `
        <div class="rom-image">
          <img src="${rom.image}" alt="${rom.name}" loading="lazy">
          <div class="rom-tags">
            <span class="rom-tag ${statusClass}">${rom.status ? rom.status.charAt(0).toUpperCase()+rom.status.slice(1) : 'Unknown'}</span>
            <span class="rom-tag build-type-${buildType.toLowerCase()}">${buildType}</span>
          </div>
        </div>
        <div class="rom-content">
          <h3 class="rom-name">${rom.name}</h3>
          <p class="rom-details"><span><i class="fas fa-user-check"></i> ${rom.maintainer}</span> <span><i class="fab fa-android"></i> ${rom.android_version}</span></p>
          <div class="rom-buttons">
            <a href="${rom.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${rom.mirror}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
            <a href="${rom.post_link || '#'}" target="_blank" class="rom-btn"><i class="fab fa-telegram"></i> Post</a>
            <a href="${rom.support_group || '#'}" target="_blank" class="rom-btn"><i class="fas fa-users"></i> Support</a>
          </div>
        </div>
      `;
      romsContainer.appendChild(romCard);
      setTimeout(() => romCard.classList.add('visible'), i * 70);
    });
  }

  // -------- Kernel cards (added compatibility tag) ----------
  function generateKernelCards() {
    if (!kernelsContainer) return;
    kernelsContainer.innerHTML = '';

    if (!allKernelsData.length) {
      kernelsContainer.innerHTML = `<div class="loading">No kernels available.</div>`;
      return;
    }

    allKernelsData.forEach((k, i) => {
      const card = document.createElement('div');
      card.className = 'kr-card';
      const compatibility = k.compatibility || 'Upto A16'; // fallback

      card.innerHTML = `
        <div class="kr-image">
          <img src="${k.image || 'assets/images/kernel-placeholder.jpg'}" alt="${k.name}" loading="lazy">
          <div class="kr-tags">
            <span class="kr-tag compatibility">${compatibility}</span>
          </div>
        </div>
        <div class="kr-content">
          <h3 class="kr-name">${k.name}</h3>
          <p class="kr-details"><span><i class="fas fa-user-check"></i> ${k.maintainer}</span> <span>${k.version ? 'v' + k.version : ''}</span></p>
          <div class="kr-buttons">
            <a href="${k.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${k.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          </div>
        </div>
      `;
      kernelsContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), i * 70);
    });
  }

  // -------- Recovery cards (status tag: official/unofficial) ----------
  function generateRecoveryCards() {
    if (!recoveriesContainer) return;
    recoveriesContainer.innerHTML = '';

    if (!allRecoveriesData.length) {
      recoveriesContainer.innerHTML = `<div class="loading">No recoveries available.</div>`;
      return;
    }

    allRecoveriesData.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'kr-card';
      const status = r.status ? r.status.toLowerCase() : 'unofficial';
      const statusClass = `status-${status}`;

      card.innerHTML = `
        <div class="kr-image">
          <img src="${r.image || 'assets/images/recovery-placeholder.jpg'}" alt="${r.name}" loading="lazy">
          <div class="kr-tags">
            <span class="rom-tag ${statusClass}">${r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Unofficial'}</span>
          </div>
        </div>
        <div class="kr-content">
          <h3 class="kr-name">${r.name}</h3>
          <p class="kr-details"><span><i class="fas fa-user-check"></i> ${r.maintainer}</span> <span>${r.version || ''}</span></p>
          <div class="kr-buttons">
            <a href="${r.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
            <a href="${r.mirror || '#'}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
          </div>
        </div>
      `;
      recoveriesContainer.appendChild(card);
      setTimeout(() => card.classList.add('visible'), i * 70);
    });
  }

  // -------- filters ----------
  function setupFilters() {
    if (!filterControls) return;
    filterControls.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const prev = filterControls.querySelector('.filter-btn.active');
      if (prev) prev.classList.remove('active');
      e.target.classList.add('active');
      const filterValue = e.target.dataset.filter;
      generateRomCards(filterValue);
    });
  }

  // -------- mobile nav toggle ----------
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.addEventListener('click', (e) => { if (e.target.tagName === 'A') navLinks.classList.remove('open'); });
  }

  // -------- parallax: intersection observer for entrance + scroll reposition for subtle parallax ----------
  function setupParallax() {
    // Intersection observer to add class .parallax-in-view for entrance animations
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('parallax-in-view');
        // don't remove class on exit to keep animation visible
      });
    }, { threshold: 0.15 });

    parallaxSections.forEach(s => io.observe(s));

    // scroll-based subtle translate for each parallax-inner element
    let rafId = null;
    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        parallaxSections.forEach(section => {
          const inner = section.querySelector('.parallax-inner');
          if (!inner) return;
          const rect = section.getBoundingClientRect();
          // speed from data-speed attribute, fallback to 0.06
          const speed = parseFloat(section.dataset.speed) || 0.06;
          // use rect.top, we want a small opposite movement
          const offset = -rect.top * speed;
          // clamp offset to avoid huge translate
          const clamped = Math.max(Math.min(offset, 40), -40);
          inner.style.transform = `translateY(${clamped}px)`;
        });
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
  }

  // init
  async function init() {
    await fetchAllData();
    // initial render
    const activeBtn = document.querySelector('.filter-btn.active');
    const initialFilter = activeBtn ? activeBtn.dataset.filter : 'Android 16';
    generateRomCards(initialFilter);
    generateKernelCards();
    generateRecoveryCards();
    setupFilters();
    setupParallax();
  }

  init();
});
