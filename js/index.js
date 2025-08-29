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

    // Global search functionality
    let allItems = []; // Will store all ROM, kernel, and recovery items
    let originalHTML = {}; // Store original HTML content for highlighting

    // Initialize search when page loads
    setTimeout(collectAllItems, 1000);

    // Fetch multiple JSON files
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
            if (romsContainer) romsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load data. Check console and ensure JSON files are available.</p></div>`;
            if (kernelsContainer) kernelsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load kernels.</p></div>`;
            if (recoveriesContainer) recoveriesContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>Failed to load recoveries.</p></div>`;
        }
    }

    // ROM card generator (filter: "Android 16" or "Android 15")
    function generateRomCards(filter = 'Android 16') {
        if (!romsContainer) return;
        romsContainer.innerHTML = '';

        const filtered = allRomsData.filter(r => r.android_version === filter);

        if (!filtered.length) {
            romsContainer.innerHTML = `<div class="loading">No ROMs found for ${filter}.</div>`;
            return;
        }

        filtered.forEach((rom, index) => {
            const romCard = document.createElement('div');
            romCard.className = 'rom-card';

            const buildType = rom.build_type || 'N/A';
            const statusClass = rom.status ? `status-${rom.status.toLowerCase()}` : 'status-unofficial';

            romCard.innerHTML = `
                <div class="rom-image">
                    <img src="${rom.image}" alt="${rom.name}" loading="lazy">
                    <div class="rom-tags">
                        <span class="rom-tag ${statusClass}">${rom.status ? rom.status.charAt(0).toUpperCase() + rom.status.slice(1) : 'Unknown'}</span>
                        <span class="rom-tag build-type-${buildType.toLowerCase()}">${buildType}</span>
                    </div>
                </div>
                <div class="rom-content">
                    <h3 class="rom-name">${rom.name}</h3>
                    <p class="rom-details">
                        <span><i class="fas fa-user-check"></i> ${rom.maintainer}</span>
                        <span><i class="fab fa-android"></i> ${rom.android_version}</span>
                    </p>
                    <div class="rom-buttons">
                        <a href="${rom.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
                        <a href="${rom.mirror}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
                        <a href="${rom.post_link}" target="_blank" class="rom-btn"><i class="fab fa-telegram"></i> Post</a>
                        <a href="${rom.support_group}" target="_blank" class="rom-btn"><i class="fas fa-users"></i> Support</a>
                    </div>
                </div>
            `;
            romsContainer.appendChild(romCard);
            setTimeout(() => romCard.classList.add('visible'), index * 80);
        });
        
        // Refresh search after loading
        refreshSearch();
    }

    // Kernel cards generator (no Android/gapps tags)
    function generateKernelCards() {
        if (!kernelsContainer) return;
        kernelsContainer.innerHTML = '';

        if (!allKernelsData.length) {
            kernelsContainer.innerHTML = `<div class="loading">No kernels available.</div>`;
            return;
        }

        allKernelsData.forEach((k, index) => {
            const card = document.createElement('div');
            card.className = 'kr-card';

            card.innerHTML = `
                <div class="kr-image"><img src="${k.image || 'assets/images/kernel-placeholder.jpg'}" alt="${k.name}" loading="lazy"></div>
                <div class="kr-content">
                    <h3 class="kr-name">${k.name}</h3>
                    <p class="kr-details"><span><i class="fas fa-user-check"></i> ${k.maintainer}</span> <span>${k.version ? 'v' + k.version : ''}</span></p>
                    <div class="kr-buttons">
                        <a href="${k.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
                        <a href="${k.mirror}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
                    </div>
                </div>
            `;
            kernelsContainer.appendChild(card);
            setTimeout(() => card.classList.add('visible'), index * 80);
        });
        
        // Refresh search after loading
        refreshSearch();
    }

    // Recovery cards generator
    function generateRecoveryCards() {
        if (!recoveriesContainer) return;
        recoveriesContainer.innerHTML = '';

        if (!allRecoveriesData.length) {
            recoveriesContainer.innerHTML = `<div class="loading">No recoveries available.</div>`;
            return;
        }

        allRecoveriesData.forEach((r, index) => {
            const card = document.createElement('div');
            card.className = 'kr-card';

            card.innerHTML = `
                <div class="kr-image"><img src="${r.image || 'assets/images/recovery-placeholder.jpg'}" alt="${r.name}" loading="lazy"></div>
                <div class="kr-content">
                    <h3 class="kr-name">${r.name}</h3>
                    <p class="kr-details"><span><i class="fas fa-user-check"></i> ${r.maintainer}</span> <span>${r.version ? r.version : ''}</span></p>
                    <div class="kr-buttons">
                        <a href="${r.download}" target="_blank" class="rom-btn download"><i class="fas fa-download"></i> Download</a>
                        <a href="${r.mirror}" target="_blank" class="rom-btn"><i class="fas fa-link"></i> Mirror</a>
                    </div>
                </div>
            `;
            recoveriesContainer.appendChild(card);
            setTimeout(() => card.classList.add('visible'), index * 80);
        });
        
        // Refresh search after loading
        refreshSearch();
    }

    // Setup filter button handlers
    function setupFilters() {
        if (!filterControls) return;
        filterControls.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            
            // If there's an active search, don't apply filter
            const searchInput = document.getElementById('rom-search');
            if (searchInput && searchInput.value.trim()) {
                e.preventDefault();
                return false;
            }
            
            const prev = filterControls.querySelector('.filter-btn.active');
            if (prev) prev.classList.remove('active');
            e.target.classList.add('active');
            const filterValue = e.target.dataset.filter;
            generateRomCards(filterValue);
        });
    }

    // Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        // Close mobile nav when a link is clicked
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('open');
            }
        });
    }

    // Search functionality
    function collectAllItems() {
        allItems = [];
        
        // Collect ROM cards
        const romCards = document.querySelectorAll('.rom-card');
        romCards.forEach(card => {
            allItems.push({
                element: card,
                type: 'rom',
                searchableText: getSearchableText(card)
            });
        });

        // Collect Kernel cards
        const kernelCards = document.querySelectorAll('.kernels-container .kr-card');
        kernelCards.forEach(card => {
            allItems.push({
                element: card,
                type: 'kernel',
                searchableText: getSearchableText(card)
            });
        });

        // Collect Recovery cards  
        const recoveryCards = document.querySelectorAll('.recoveries-container .kr-card');
        recoveryCards.forEach(card => {
            allItems.push({
                element: card,
                type: 'recovery',
                searchableText: getSearchableText(card)
            });
        });
    }

    function getSearchableText(card) {
        // Extract all text content for searching
        const title = card.querySelector('h3')?.textContent || '';
        const details = card.querySelector('.rom-details, .kr-details')?.textContent || '';
        
        return `${title} ${details}`.toLowerCase();
    }

    function performSearch(searchTerm) {
        let visibleCount = 0;
        const resultsCounter = document.getElementById('search-results-count');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        if (!searchTerm) {
            // Show all items and restore filter functionality
            allItems.forEach((item) => {
                item.element.classList.remove('hidden', 'search-hidden');
            });
            if (resultsCounter) resultsCounter.textContent = '';
            
            // Re-enable filter buttons
            filterBtns.forEach(btn => btn.style.opacity = '1');
            
            // Re-apply current filter if any
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) {
                const filterValue = activeFilter.getAttribute('data-filter');
                generateRomCards(filterValue);
            }
            return;
        }

        // Re-collect items in case new ones were loaded
        collectAllItems();

        // When searching, disable filter buttons and show all matching items regardless of filter
        filterBtns.forEach(btn => btn.style.opacity = '0.5');

        allItems.forEach((item) => {
            const matches = item.searchableText.includes(searchTerm);
            
            if (matches) {
                // Remove both hidden classes to show item regardless of current filter
                item.element.classList.remove('hidden', 'search-hidden');
                visibleCount++;
            } else {
                // Add search-hidden class to hide non-matching items
                item.element.classList.add('search-hidden');
                item.element.classList.remove('hidden'); // Remove filter hidden
            }
        });

        // Update results counter
        if (resultsCounter) {
            if (visibleCount === 0) {
                resultsCounter.textContent = 'No results found';
                resultsCounter.style.color = '#ff6700';
            } else {
                resultsCounter.textContent = `Found ${visibleCount} result${visibleCount > 1 ? 's' : ''} (showing all categories)`;
                resultsCounter.style.color = '#666';
            }
        }
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('rom-search');
        const clearBtn = document.getElementById('clear-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                // Show/hide clear button
                if (clearBtn) {
                    if (searchTerm) {
                        clearBtn.classList.add('show');
                    } else {
                        clearBtn.classList.remove('show');
                    }
                }
                
                performSearch(searchTerm);
            });

            // Enhanced search with Enter key support
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Focus on first visible result if any
                    const firstVisible = document.querySelector('.rom-card:not(.hidden):not(.search-hidden), .kr-card:not(.hidden):not(.search-hidden)');
                    if (firstVisible) {
                        firstVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                const filterBtns = document.querySelectorAll('.filter-btn');
                
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                this.classList.remove('show');
                
                // Re-enable filter buttons
                filterBtns.forEach(btn => btn.style.opacity = '1');
                
                performSearch('');
            });
        }
    }

    // Setup donation functionality
    function setupDonation() {
        const upiBtn = document.getElementById('upi-donate');
        const coffeeBtn = document.getElementById('coffee-donate');
        const paypalBtn = document.getElementById('paypal-donate');

        if (upiBtn) {
            upiBtn.addEventListener('click', function() {
                showUpiModal();
            });
        }

        if (coffeeBtn) {
            coffeeBtn.addEventListener('click', function() {
                // Redirect to Buy Me a Coffee page
                window.open('https://coff.ee/Mufasa01', '_blank');
            });
        }

        if (paypalBtn) {
            paypalBtn.addEventListener('click', function() {
                // Add PayPal logic
                alert('PayPal donation functionality to be implemented');
            });
        }
    }

    // UPI Modal functionality
    function showUpiModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('upi-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'upi-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" onclick="closeUpiModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3 class="modal-title">UPI Payment</h3>
                    <img src="https://raw.githubusercontent.com/gensis01/XiaomiPad6.github.io/refs/heads/master/assets/images/Screenshot_20250829_074047.jpg" 
                         alt="UPI QR Code" class="qr-image">
                    <div class="upi-id">UPI ID: xxxxxxx</div>
                    <button class="copy-btn" onclick="copyUpiId()">Copy UPI ID</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeUpiModal();
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('show')) {
                    closeUpiModal();
                }
            });
        }
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Make functions globally available
    window.closeUpiModal = function() {
        const modal = document.getElementById('upi-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    };

    window.copyUpiId = function() {
        const upiId = 'xxxxxxx'; // Replace with actual UPI ID
        navigator.clipboard.writeText(upiId).then(function() {
            // Show success message
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#4CAF50';
            
            setTimeout(function() {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'var(--primary-color)';
            }, 2000);
        }).catch(function() {
            // Fallback for older browsers
            alert('UPI ID: ' + upiId + '\n\nPlease copy manually.');
        });
    };

    // Refresh search when new content is loaded
    function refreshSearch() {
        setTimeout(() => {
            collectAllItems();
            
            // Re-run current search if there's a search term
            const searchInput = document.getElementById('rom-search');
            if (searchInput) {
                const currentSearch = searchInput.value;
                if (currentSearch) {
                    performSearch(currentSearch.toLowerCase().trim());
                }
            }
        }, 500);
    }

    // Make refreshSearch globally available
    window.refreshSearch = refreshSearch;

    // Initialize
    async function init() {
        await fetchAllData();
        // Start ROMs with whatever button is active in DOM; fallback to Android 16
        const activeBtn = document.querySelector('.filter-btn.active');
        const initialFilter = activeBtn ? activeBtn.dataset.filter : 'Android 16';
        generateRomCards(initialFilter);
        generateKernelCards();
        generateRecoveryCards();
        setupFilters();
        setupSearch();
        setupDonation();
    }

    init();
});
