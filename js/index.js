document.addEventListener("DOMContentLoaded", () => {
  // Nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

  // Load ROMs
  fetch("assets/roms.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("roms-container");
      data.forEach(r => {
        const card = document.createElement("div");
        card.className = "rom-card fade-in";
        card.innerHTML = `
          <div class="rom-image"><img src="assets/images/${r.image}" alt="${r.name}"></div>
          <div class="rom-content">
            <h3 class="rom-name">${r.name}</h3>
            <p class="rom-details">Android ${r.android_version}</p>
            <div class="rom-buttons">
              <a href="${r.download}" class="rom-btn download">Download</a>
              <a href="${r.source}" class="rom-btn">Source</a>
            </div>
          </div>`;
        container.appendChild(card);
        setTimeout(() => card.classList.add("visible"), 100);
      });
    });

  // Load Kernels
  fetch("assets/kernels.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("kernels-container");
      data.forEach(k => {
        const card = document.createElement("div");
        card.className = "kr-card fade-in";
        card.innerHTML = `
          <div class="kr-image"><img src="assets/images/${k.image}" alt="${k.name}"></div>
          <div class="kr-content">
            <h3 class="kr-name">${k.name}</h3>
            <p class="kr-details">Upto Android ${k.android_version}</p>
            <div class="kr-buttons">
              <a href="${k.download}" class="rom-btn download">Download</a>
              <a href="${k.source}" class="rom-btn">Source</a>
            </div>
          </div>`;
        container.appendChild(card);
        setTimeout(() => card.classList.add("visible"), 100);
      });
    });

  // Load Recoveries
  fetch("assets/recoveries.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("recoveries-container");
      data.forEach(r => {
        const card = document.createElement("div");
        card.className = "kr-card fade-in";
        card.innerHTML = `
          <div class="kr-image"><img src="assets/images/${r.image}" alt="${r.name}"></div>
          <div class="kr-content">
            <h3 class="kr-name">${r.name}</h3>
            <p class="kr-details">${r.type} • Android ${r.android_version}</p>
            <div class="kr-buttons">
              <a href="${r.download}" class="rom-btn download">Download</a>
              <a href="${r.source}" class="rom-btn">Source</a>
            </div>
          </div>`;
        container.appendChild(card);
        setTimeout(() => card.classList.add("visible"), 100);
      });
    });

  // Donations UPI Modal
  const upiBtn = document.getElementById("upiBtn");
  const upiModal = document.getElementById("upiModal");
  const upiClose = document.querySelector(".upi-close");

  if (upiBtn && upiModal) {
    upiBtn.addEventListener("click", () => {
      upiModal.style.display = "flex";
    });
    upiClose.addEventListener("click", () => {
      upiModal.style.display = "none";
    });
    window.addEventListener("click", e => {
      if (e.target === upiModal) upiModal.style.display = "none";
    });
  }
});
