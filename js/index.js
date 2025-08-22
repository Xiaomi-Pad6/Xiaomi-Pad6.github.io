document.addEventListener('DOMContentLoaded', () => {
    const romsContainer = document.querySelector('.roms-container');
    const filterControls = document.querySelector('.filter-controls');
    let allRomsData = []; // Cache for all ROM data

    // Fetch ROM data from JSON file
    async function fetchROMData() {
        try {
            const response = await fetch('../assets/details.json');
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            allRomsData = data;
            return data;
        } catch (error) {
            console.error('Error fetching ROM data:', error);
            romsContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load ROM data. Please check the console and ensure details.json is accessible.</p>
                </div>
            `;
            return [];
        }
    }

    // Generate and display ROM cards based on a filter
    function generateRomCards(filter = 'All') {
        romsContainer.innerHTML = ''; // Clear previous cards

        const filteredRoms = allRomsData.filter(rom => {
            if (filter === 'All') return true;
            return rom.android_version === filter;
        });
        
        if (filteredRoms.length === 0) {
            romsContainer.innerHTML = `<div class="loading">No ROMs found for this category.</div>`;
            return;
        }

        filteredRoms.forEach((rom, index) => {
            const romCard = document.createElement('div');
            romCard.className = 'rom-card';

            const buildType = rom.build_type || 'N/A'; // Default value if not specified

            romCard.innerHTML = `
                <div class="rom-image">
                    <img src="${rom.image}" alt="${rom.name}" loading="lazy">
                    <div class="rom-tags">
                        <span class="rom-tag status-${rom.status}">${rom.status.charAt(0).toUpperCase() + rom.status.slice(1)}</span>
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
            
            // Staggered animation effect
            setTimeout(() => {
                romCard.classList.add('visible');
            }, index * 100);
        });
    }

    // Setup filter button event listeners
    function setupFilters() {
        filterControls.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                const filterValue = e.target.dataset.filter;
                generateRomCards(filterValue);
            }
        });
    }

    // Initialize the page
    async function init() {
        await fetchROMData();
        generateRomCards(); // Initial load with "All"
        setupFilters();
    }

    init();
});