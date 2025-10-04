document.addEventListener('DOMContentLoaded', () => {
  const romsContainer = document.querySelector('.roms-container');
  const kernelsContainer = document.querySelector('.kernels-container');
  const recoveriesContainer = document.querySelector('.recoveries-container');
  const filterControls = document.querySelector('.filter-controls');
  const searchInput = document.getElementById('rom-search');
  const clearBtn = document.getElementById('clear-search');
  const resultsCounter = document.getElementById('search-results-count');

  let allRomsData = [];
  let allKernelsData = [];
  let allRecoveriesData = [];
  let allItems = [];
  let currentFilter = 'Android 16';

  const versionNum = v => {
    if (!v) return '';
    const match = String(v).match(/(\d{1,2})/);
    return match ? match[1] : '';
  };

  const debounce = (fn, delay = 200) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return [];
    }
  }

  async function loadAllData() {
    const [roms, kernels, recoveries] = await Promise.all([
      fetchData('assets/roms.json'),
      fetchData('assets/kernels.json'),
      fetchData('assets/recoveries.json')
    ]);
    
    allRomsData = roms;
    allKernelsData = kernels;
    allRecoveriesData = recoveries;
  }

  function createCardHTML(item, type = 'rom') {
    const imageSrc = item.image || 'assets/images/placeholder.jpg';
    const maintainer = item.maintainer || 'Unknown';
    const buildDate = item.build_date ? `<span><i class="fas fa-calendar-alt"></i> ${item.build_date}</span>` : '';
    
    let tagsHTML = '';
    let buttonsHTML = `
      <a href="${item.download || '#'}" target="_blank" rel="noopener" class="rom-btn download">
        <i class="fas fa-download"></i> Download
      </a>
      <a href="${item.mirror || '#'}" target="_blank" rel="noopener" class="rom-btn">
        <i class="fas fa-link"></i> Mirror
      </a>
    `;

    if (type === 'rom') {
      const statusClass = item.status ? `status-${String(item.status).toLowerCase()}` : 'status-unofficial';
      const buildType = item.build_type || 'vanilla';
      const androidVer = versionNum(item.android) ? `Android ${versionNum(item.android)}` : '';
      
      tagsHTML = `
        <span class="rom-tag ${statusClass}">${item.status || 'Unofficial'}</span>
        <span class="rom-tag build-type-${buildType.toLowerCase()}">${buildType.toUpperCase()}</span>
      `;
      
      if (item.post) {
        buttonsHTML += `<a href="${item.post}" target="_blank" rel="noopener" class="rom-btn"><i class="fas fa-file-lines"></i> Post</a>`;
      }
      if (item.support) {
        buttonsHTML += `<a href="${item.support}" target="_blank" rel="noopener" class="rom-btn"><i class="fas fa-hands-helping"></i> Support</a>`;
      }
      
      return `
        <div class="${type === 'rom' ? 'rom' : 'kr'}-image">
          <img src="${imageSrc}" alt="${item.name}" loading="lazy">
          <div class="rom-tags">${tagsHTML}</div>
        </div>
        <div class="${type === 'rom' ? 'rom' : 'kr'}-content">
          <h3 class="${type === 'rom' ? 'rom' : 'kr'}-name">${item.name || 'Untitled'}</h3>
          <p class="${type === 'rom' ? 'rom' : 'kr'}-details">
            <span><i class="fas fa-user"></i> ${maintainer}</span>
            ${androidVer ? `<span>${androidVer}</span>` : ''}
            ${buildDate}
          </p>
          <div class="${type === 'rom' ? 'rom' : 'kr'}-buttons">${buttonsHTML}</div>
        </div>
      `;
    } else {
      if (type === 'kernel') {
        const compatibility = item.compatibility ? `<span class="rom-tag build-type-vanilla">${item.compatibility}</span>` : '';
        const variant = item.variant ? `<span class="rom-tag status-official">${item.variant}</span>` : '';
        tagsHTML = `${variant} ${compatibility}`;
        
        if (item.support) {
          buttonsHTML += `<a href="${item.support}" target="_blank" rel="noopener" class="rom-btn"><i class="fas fa-hands-helping"></i> Support</a>`;
        }
      } else if (type === 'recovery' && item.post) {
        buttonsHTML += `<a href="${item.post}" target="_blank" rel="noopener" class="rom-btn" style="grid-column: span 2;"><i class="fas fa-file-lines"></i> Post</a>`;
      }
      
      return `
        <div class="kr-image">
          <img src="${imageSrc}" alt="${item.name}" loading="lazy">
          <div class="rom-tags">${tagsHTML}</div>
        </div>
        <div class="kr-content">
          <h3 class="kr-name">${item.name || 'Untitled'}</h3>
          <p class="kr-details">
            <span><i class="fas fa-user"></i> ${maintainer}</span>
            ${buildDate}
          </p>
          <div class="kr-buttons">${buttonsHTML}</div>
        </div>
      `;
    }
  }

  function renderCards(container, data, type = 'rom', filter = null) {
    if (!container) return;
    
    container.innerHTML = '';
    
    let filtered = data;
    if (type === 'rom' && filter) {
      const filterNum = versionNum(filter);
      if (filterNum) {
        filtered = data.filter(r => versionNum(r.android) === filterNum);
      }
    }
    
    if (!filtered.length) {
      container.innerHTML = `<div class="loading">No ${type}s available.</div>`;
      return;
    }
    
    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = type === 'rom' ? 'rom-card' : 'kr-card';
      card.innerHTML = createCardHTML(item, type);
      
      card.dataset.name = (item.name || '').toLowerCase();
      card.dataset.maintainer = (item.maintainer || '').toLowerCase();
      if (type === 'rom') {
        card.dataset.version = versionNum(item.android).toLowerCase();
        card.dataset.status = (item.status || '').toLowerCase();
        card.dataset.build = (item.build_type || '').toLowerCase();
      }
      
      container.appendChild(card);
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add('visible'), index * 50);
      });
    });
    
    collectAllItems();
  }

  function collectAllItems() {
    allItems = [];
    document.querySelectorAll('.rom-card, .kr-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const details = card.querySelector('.rom-details, .kr-details')?.textContent || '';
      allItems.push({
        element: card,
        searchableText: `${title} ${details}`.toLowerCase()
      });
    });
  }

  function performSearch(searchTerm) {
    const query = searchTerm.toLowerCase().trim();
    
    if (!query) {
      allItems.forEach(item => item.element.classList.remove('search-hidden'));
      if (resultsCounter) resultsCounter.textContent = '';
      document.querySelectorAll('.filter-btn').forEach(btn => btn.style.opacity = '');
      return;
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.style.opacity = '0.5');
    
    let visibleCount = 0;
    allItems.forEach(item => {
      if (item.searchableText.includes(query)) {
        item.element.classList.remove('search-hidden');
        visibleCount++;
      } else {
        item.element.classList.add('search-hidden');
      }
    });
    
    if (resultsCounter) {
      if (visibleCount === 0) {
        resultsCounter.textContent = 'No results found';
        resultsCounter.style.color = 'var(--warning-color)';
      } else {
        resultsCounter.textContent = `Found ${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
        resultsCounter.style.color = 'var(--text-muted)';
      }
    }
  }

  function setupSearch() {
    if (!searchInput) return;
    
    const debouncedSearch = debounce(performSearch, 150);
    
    searchInput.addEventListener('input', e => {
      const value = e.target.value;
      if (clearBtn) clearBtn.classList.toggle('show', !!value.trim());
      debouncedSearch(value);
    });
    
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstVisible = document.querySelector('.rom-card:not(.search-hidden), .kr-card:not(.search-hidden)');
        if (firstVisible) {
          firstVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('show');
        performSearch('');
        document.querySelectorAll('.filter-btn').forEach(btn => btn.style.opacity = '');
      });
    }
  }

  function setupFilters() {
    if (!filterControls) return;
    
    filterControls.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      if (searchInput?.value.trim()) return;
      
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter || btn.textContent.trim();
      renderCards(romsContainer, allRomsData, 'rom', currentFilter);
    });
  }

  function setupDonateButtons() {
    const donateHandlers = {
      'upi-donate': () => window.open('upi://pay?pa=your-upi-id@paytm', '_blank'),
      'coffee-donate': () => window.open('https://www.buymeacoffee.com/yourprofile', '_blank'),
      'paypal-donate': () => window.open('https://www.paypal.com/paypalme/yourprofile', '_blank')
    };
    
    Object.entries(donateHandlers).forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handler);
    });
  }

  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const elements = document.querySelectorAll(`
      .section-title,
      .spec-item,
      .search-container,
      .filter-controls,
      .donate-section,
      .community-card,
      .nav-buttons,
      .guide-section,
      .prereq-item,
      .step-list li,
      .error-section
    `);
    
    elements.forEach(el => observer.observe(el));
  }

  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  async function initialize() {
    await loadAllData();
    
    if (romsContainer) {
      renderCards(romsContainer, allRomsData, 'rom', currentFilter);
    }
    if (kernelsContainer) {
      renderCards(kernelsContainer, allKernelsData, 'kernel');
    }
    if (recoveriesContainer) {
      renderCards(recoveriesContainer, allRecoveriesData, 'recovery');
    }
    
    setupFilters();
    setupSearch();
    setupDonateButtons();
    setupScrollAnimations();
    setupSmoothScrolling();
    
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  initialize();
});
