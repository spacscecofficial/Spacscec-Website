// ==========================================================================
// GOOGLE SHEETS INTEGRATION CONFIGURATION
// Paste your Google Apps Script Web App URL below:
// ==========================================================================
const GOOGLE_SHEETS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypAlZfqAAAt3SwjdyrIN5Oz2CGK4SFdg93zi2Iwfe4b9rxfMpJEMfd34BctV-sEQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Smooth Navigation & Active Link Highlighting
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main, section, footer");

  function changeActiveNav() {
    let currentSectionId = "home";
    const scrollPosition = window.scrollY + 200;

    sections.forEach((section) => {
      if (section.id) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.id;
        }
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", changeActiveNav);

  // Smooth scroll click handler
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // 2. Membership Registration Form Validation & Submission
  const form = document.getElementById("membershipForm");
  const successModal = document.getElementById("successModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalDoneBtn = document.getElementById("modalDoneBtn");

  // Output elements in Modal
  const registeredName = document.getElementById("registeredName");
  const registeredId = document.getElementById("registeredId");
  const registeredRoll = document.getElementById("registeredRoll");
  const registeredBranch = document.getElementById("registeredBranch");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      // Inputs to validate
      const fullName = document.getElementById("fullName");
      const rollNo = document.getElementById("rollNo");
      const department = document.getElementById("department");
      const semester = document.getElementById("semester");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const domainCheckboxes = document.querySelectorAll('input[name="domains"]:checked');

      // Reset invalid states
      document.querySelectorAll(".form-group").forEach((group) => {
        group.classList.remove("invalid");
      });

      // Validate Full Name
      if (!fullName.value.trim()) {
        fullName.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Roll Number
      if (!rollNo.value.trim()) {
        rollNo.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Department
      if (!department.value) {
        department.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Semester
      if (!semester.value) {
        semester.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Phone (10 or more digits)
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phone.value.trim() || !phoneRegex.test(phone.value.trim().replace(/\s+/g, ''))) {
        phone.closest(".form-group").classList.add("invalid");
        isValid = false;
      }

      // Validate Domain Checkboxes
      const domainError = document.querySelector(".domain-error");
      if (domainCheckboxes.length === 0) {
        if (domainError) domainError.style.display = "block";
        isValid = false;
      } else {
        if (domainError) domainError.style.display = "none";
      }

      if (isValid) {
        // Generate random registration ID: e.g. SPACS-CEC-2026-8921
        const randomId = "SPACS-CEC-2026-" + Math.floor(1000 + Math.random() * 9000);

        // Populate Modal Details
        registeredName.textContent = fullName.value.trim();
        registeredId.textContent = randomId;
        registeredRoll.textContent = rollNo.value.trim().toUpperCase();
        registeredBranch.textContent = `${department.value} - ${semester.value}`;

        // Show Modal
        successModal.classList.remove("hidden");

        // Save registration to LocalStorage
        const registrationData = {
          id: randomId,
          fullName: fullName.value.trim(),
          rollNo: rollNo.value.trim(),
          department: department.value,
          semester: semester.value,
          email: email.value.trim(),
          phone: phone.value.trim(),
          linkedin: document.getElementById("linkedin").value.trim(),
          domains: Array.from(domainCheckboxes).map((cb) => cb.value),
          timestamp: new Date().toISOString(),
        };

        try {
          const existing = JSON.parse(localStorage.getItem("spacs_registrations") || "[]");
          existing.push(registrationData);
          localStorage.setItem("spacs_registrations", JSON.stringify(existing));
        } catch (err) {
          console.warn("LocalStorage access failed:", err);
        }

        // Send registration to Google Sheet via Apps Script Webhook
        if (GOOGLE_SHEETS_SCRIPT_URL && GOOGLE_SHEETS_SCRIPT_URL.trim() !== "") {
          fetch(GOOGLE_SHEETS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData),
          }).catch((err) => console.error("Google Sheets Submission Error:", err));
        }

        // Reset form
        form.reset();
      }
    });

    // Remove invalid style on input
    form.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("input", () => {
        const parent = input.closest(".form-group");
        if (parent) parent.classList.remove("invalid");
      });
    });
  }

  // Close Modal Handler
  function hideModal() {
    if (successModal) {
      successModal.classList.add("hidden");
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener("click", hideModal);
  if (successModal) {
    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) hideModal();
    });
  }

  // 3. ExCom Side-Scrolling Slider Logic
  const excomTrack = document.getElementById("excomSliderTrack");
  const excomPrevBtn = document.getElementById("excomPrevBtn");
  const excomNextBtn = document.getElementById("excomNextBtn");
  const excomProgressFill = document.getElementById("excomProgressFill");
  const excomDotsContainer = document.getElementById("excomDots");

  if (excomTrack) {
    const cards = excomTrack.querySelectorAll(".excom-card");
    const totalCards = cards.length;

    // Build pagination dots dynamically for all 16 members
    if (excomDotsContainer && totalCards > 0) {
      excomDotsContainer.innerHTML = "";
      cards.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.className = `excom-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Go to ExCom member ${idx + 1}`);
        dot.setAttribute("title", `ExCom Member ${idx + 1} of ${totalCards}`);
        dot.addEventListener("click", () => {
          cards[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        });
        excomDotsContainer.appendChild(dot);
      });
    }

    // Update buttons, progress track fill, and active dot on scroll
    function updateExComSliderState() {
      const scrollLeft = excomTrack.scrollLeft;
      const maxScrollLeft = excomTrack.scrollWidth - excomTrack.clientWidth;

      // Calculate progress fill percentage
      const minPercent = (1 / totalCards) * 100;
      const progressPercent = maxScrollLeft > 0 ? Math.min(100, Math.max(minPercent, ((scrollLeft + 10) / (maxScrollLeft + 10)) * 100)) : 100;
      if (excomProgressFill) {
        excomProgressFill.style.width = `${progressPercent}%`;
      }

      // Calculate active member card index based on scroll position
      const cardWidth = cards[0] ? cards[0].offsetWidth + 18 : 280;
      const activeIdx = Math.min(totalCards - 1, Math.max(0, Math.round(scrollLeft / cardWidth)));

      if (excomDotsContainer) {
        const dots = excomDotsContainer.querySelectorAll(".excom-dot");
        dots.forEach((dot, index) => {
          dot.classList.toggle("active", index === activeIdx);
        });
      }

      // Update button state (disabled at ends)
      if (excomPrevBtn) excomPrevBtn.disabled = scrollLeft <= 5;
      if (excomNextBtn) excomNextBtn.disabled = scrollLeft >= maxScrollLeft - 5;
    }

    excomTrack.addEventListener("scroll", updateExComSliderState, { passive: true });
    window.addEventListener("resize", updateExComSliderState);
    updateExComSliderState();

    // Button Navigation Controls (Scroll adaptively: 1-2 cards on mobile, 1 full page on desktop)
    if (excomPrevBtn) {
      excomPrevBtn.addEventListener("click", () => {
        const scrollAmount = excomTrack.clientWidth > 768 ? excomTrack.clientWidth : Math.max(cards[0]?.offsetWidth || 260, excomTrack.clientWidth * 0.75);
        excomTrack.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });
    }

    if (excomNextBtn) {
      excomNextBtn.addEventListener("click", () => {
        const scrollAmount = excomTrack.clientWidth > 768 ? excomTrack.clientWidth : Math.max(cards[0]?.offsetWidth || 260, excomTrack.clientWidth * 0.75);
        excomTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    }

    // Interactive Drag-to-Scroll for Mouse/Desktop Users
    let isDragging = false;
    let startX;
    let startScrollLeft;

    excomTrack.addEventListener("mousedown", (e) => {
      isDragging = true;
      excomTrack.classList.add("active-grab");
      startX = e.pageX - excomTrack.offsetLeft;
      startScrollLeft = excomTrack.scrollLeft;
    });

    excomTrack.addEventListener("mouseleave", () => {
      isDragging = false;
      excomTrack.classList.remove("active-grab");
    });

    excomTrack.addEventListener("mouseup", () => {
      isDragging = false;
      excomTrack.classList.remove("active-grab");
    });

    excomTrack.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - excomTrack.offsetLeft;
      const walk = (x - startX) * 2.2;
      excomTrack.scrollLeft = startScrollLeft - walk;
    });
  }

  // 4. Annual Tenure Report Print & Image Lightbox Modal
  const printReportBtn = document.getElementById("printReportBtn");
  if (printReportBtn) {
    printReportBtn.addEventListener("click", () => {
      window.print();
    });
  }

  const reportModal = document.getElementById("reportImageModal");
  const closeReportModalBtn = document.getElementById("closeReportModalBtn");
  const reportModalImg = document.getElementById("reportModalImg");
  const reportModalTitle = document.getElementById("reportModalTitle");
  const reportModalTag = document.getElementById("reportModalTag");
  const reportModalDesc = document.getElementById("reportModalDesc");
  const reportMediaWraps = document.querySelectorAll(".report-media-wrap");

  if (reportModal && reportModalImg) {
    reportMediaWraps.forEach((wrap) => {
      wrap.addEventListener("click", () => {
        const imgSrc = wrap.getAttribute("data-report-img");
        const title = wrap.getAttribute("data-report-title") || "Event Photo";
        const tag = wrap.getAttribute("data-report-tag") || "SPACS ARCHIVE";
        const desc = wrap.getAttribute("data-report-desc") || "";

        reportModalImg.src = imgSrc;
        if (reportModalTitle) reportModalTitle.textContent = title;
        if (reportModalTag) reportModalTag.textContent = tag;
        if (reportModalDesc) reportModalDesc.textContent = desc;

        reportModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      });
    });

    const closeReportModal = () => {
      reportModal.classList.add("hidden");
      document.body.style.overflow = "";
      reportModalImg.src = "";
    };

    if (closeReportModalBtn) {
      closeReportModalBtn.addEventListener("click", closeReportModal);
    }

    reportModal.addEventListener("click", (e) => {
      if (e.target === reportModal) {
        closeReportModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !reportModal.classList.contains("hidden")) {
        closeReportModal();
      }
    });
  }

  // ==========================================================================
  // 5. TOP NEON SCROLL PROGRESS INDICATOR
  // ==========================================================================
  const scrollProgressBar = document.getElementById("scrollProgressBar");
  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ==========================================================================
  // 6. AMBIENT MOUSE SPOTLIGHT GLOW (DESKTOP)
  // ==========================================================================
  const mouseGlow = document.getElementById("mouseGlow");
  if (mouseGlow && window.innerWidth >= 768) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isMouseActive = false;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMouseActive) {
        isMouseActive = true;
        mouseGlow.style.opacity = "1";
      }
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      isMouseActive = false;
      mouseGlow.style.opacity = "0";
    });

    function renderGlow() {
      if (isMouseActive) {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        mouseGlow.style.left = `${currentX}px`;
        mouseGlow.style.top = `${currentY}px`;
      }
      requestAnimationFrame(renderGlow);
    }
    renderGlow();
  }

  // ==========================================================================
  // 7. INTERACTIVE 3D CYBER STAGE CANVAS (HERO CENTERPIECE)
  // ==========================================================================
  const canvas3D = document.getElementById("spacs3DCanvas");
  const heroStage = document.getElementById("home");
  if (canvas3D && heroStage) {
    const ctx = canvas3D.getContext("2d");
    let width = 0;
    let height = 0;
    let isHeroVisible = true;

    // Mathematical Golden Ratio Vertices for 3D Icosahedron
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawIcoVerts = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    // Normalize to unit sphere
    const icoVerts = rawIcoVerts.map(v => {
      const len = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / len, v[1] / len, v[2] / len];
    });

    // 30 Icosahedron Edges
    const icoEdges = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const dx = icoVerts[i][0] - icoVerts[j][0];
        const dy = icoVerts[i][1] - icoVerts[j][1];
        const dz = icoVerts[i][2] - icoVerts[j][2];
        const dist = Math.hypot(dx, dy, dz);
        if (Math.abs(dist - 1.05146) < 0.08) {
          icoEdges.push([i, j]);
        }
      }
    }

    // Inner Concentric 3D Wireframe Cube (Scale 0.52)
    const rawCubeVerts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const cubeVerts = rawCubeVerts.map(v => [v[0] * 0.42, v[1] * 0.42, v[2] * 0.42]);
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    // Orbiting Torus Ring (32 Points)
    const ringPoints = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      ringPoints.push([Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0]);
    }

    // Ambient 3D Particle Constellation (40 Floating Code Stars)
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const r = 0.8 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const psi = (Math.random() - 0.5) * Math.PI;
      particles.push({
        x: r * Math.cos(theta) * Math.cos(psi),
        y: r * Math.sin(theta) * Math.cos(psi),
        z: r * Math.sin(psi),
        size: Math.random() * 2.2 + 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.008 + 0.004) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    // Dynamic Orientation & Physics state
    let rotX = 0.25;
    let rotY = 0.35;
    let rotZ = 0;
    let targetRotX = 0.25;
    let targetRotY = 0.35;

    function resizeCanvas() {
      const rect = canvas3D.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas3D.width = width * dpr;
      canvas3D.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Mouse Tracking for 3D Camera Tilt
    window.addEventListener("mousemove", (e) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = normX * 1.4;
      targetRotX = -normY * 1.2;
    }, { passive: true });

    // Scroll Physics: Rotate and scale with scroll
    window.addEventListener("scroll", () => {
      rotZ = window.scrollY * 0.0016;
    }, { passive: true });

    // Pause rendering when hero is scrolled out of viewport
    const heroObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    heroObserver.observe(heroStage);

    // 3D Point Projection Function
    function project3D(point, radius, cosX, sinX, cosY, sinY, cosZ, sinZ) {
      let x = point[0];
      let y = point[1];
      let z = point[2];

      // Rotate around X
      let y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;

      // Rotate around Y
      let x2 = x * cosY + z1 * sinY;
      let z2 = -x * sinY + z1 * cosY;

      // Rotate around Z (Scroll linked)
      let x3 = x2 * cosZ - y1 * sinZ;
      let y3 = x2 * sinZ + y1 * cosZ;

      // Perspective scale
      const cameraDist = 3.6;
      const fov = 340;
      const scale = fov / (cameraDist + z2);

      return {
        x: (width / 2) + x3 * radius * (scale / fov),
        y: (height / 2) + y3 * radius * (scale / fov),
        z: z2,
        scale: scale / fov
      };
    }

    // Main 3D Animation Loop
    function render3D() {
      if (isHeroVisible && width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        // Physics interpolation & auto spin
        rotX += (targetRotX - rotX) * 0.05 + 0.0025;
        rotY += (targetRotY - rotY) * 0.05 + 0.0035;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosZ = Math.cos(rotZ);
        const sinZ = Math.sin(rotZ);

        const baseRadius = Math.min(width, height) * 0.42;

        // 1. Render Floating Ambient Particles
        particles.forEach(p => {
          p.phase += p.speed;
          const px = p.x * Math.cos(p.phase) - p.z * Math.sin(p.phase);
          const pz = p.x * Math.sin(p.phase) + p.z * Math.cos(p.phase);
          const proj = project3D([px, p.y, pz], baseRadius, cosX, sinX, cosY, sinY, cosZ, sinZ);

          const alpha = Math.min(1, Math.max(0.2, (proj.z + 1.5) / 3));
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, Math.max(0.8, p.size * proj.scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 229, 163, ${alpha * 0.85})`;
          ctx.fill();
        });

        // 2. Render Outer 3D Icosahedron
        const projIco = icoVerts.map(v => project3D(v, baseRadius, cosX, sinX, cosY, sinY, cosZ, sinZ));

        ctx.lineWidth = 1.6;
        icoEdges.forEach(([i, j]) => {
          const p1 = projIco[i];
          const p2 = projIco[j];
          const avgZ = (p1.z + p2.z) / 2;
          const alpha = Math.min(0.9, Math.max(0.18, (avgZ + 1.2) / 2.4));

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 229, 163, ${alpha})`;
          ctx.stroke();
        });

        // Glowing Nodes on Icosahedron Vertices
        projIco.forEach(p => {
          const alpha = Math.min(1, Math.max(0.3, (p.z + 1.2) / 2.4));
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.8 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.shadowColor = "#00e5a3";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // 3. Render Inner Concentric 3D Cube (Neon Cyan)
        const cosCubeX = Math.cos(-rotX * 1.2);
        const sinCubeX = Math.sin(-rotX * 1.2);
        const cosCubeY = Math.cos(rotY * 1.5);
        const sinCubeY = Math.sin(rotY * 1.5);
        const projCube = cubeVerts.map(v => project3D(v, baseRadius, cosCubeX, sinCubeX, cosCubeY, sinCubeY, cosZ, sinZ));

        ctx.lineWidth = 1.2;
        cubeEdges.forEach(([i, j]) => {
          const p1 = projCube[i];
          const p2 = projCube[j];
          const avgZ = (p1.z + p2.z) / 2;
          const alpha = Math.min(0.85, Math.max(0.2, (avgZ + 1.2) / 2.4));

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.stroke();
        });

        // 4. Render Orbiting Ring
        const ringCosX = Math.cos(rotX * 0.8 + 0.5);
        const ringSinX = Math.sin(rotX * 0.8 + 0.5);
        const ringCosY = Math.cos(rotY * 0.8);
        const ringSinY = Math.sin(rotY * 0.8);
        const projRing = ringPoints.map(v => project3D(v, baseRadius, ringCosX, ringSinX, ringCosY, ringSinY, cosZ, sinZ));

        ctx.beginPath();
        for (let i = 0; i < projRing.length; i++) {
          const next = projRing[(i + 1) % projRing.length];
          ctx.moveTo(projRing[i].x, projRing[i].y);
          ctx.lineTo(next.x, next.y);
        }
        ctx.strokeStyle = "rgba(192, 132, 252, 0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(render3D);
    }
    render3D();
  }

  // ==========================================================================
  // 8. INTERACTIVE 3D PERSPECTIVE CARD TILT & DYNAMIC GLARE
  // ==========================================================================
  const tiltSelectors = [
    ".glass-card",
    ".do-card",
    ".track-card",
    ".partner-card",
    ".excom-card",
    ".nodal-card",
    ".report-event-card",
    ".tenure-stat-box",
    ".glass-form-card",
    ".community-impact-box",
    ".story-card"
  ];
  const tiltCards = document.querySelectorAll(tiltSelectors.join(", "));

  if (window.innerWidth >= 768) {
    tiltCards.forEach((card) => {
      // Create Specular Light Glare layer
      let glare = card.querySelector(".card-specular-glare");
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "card-specular-glare";
        card.appendChild(glare);
      }

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxTilt = 8.5; // Max 3D degrees
        const rotateX = -((y - centerY) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

        // Specular glare positioning
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.24) 0%, rgba(0, 229, 163, 0.12) 32%, transparent 70%)`;
        glare.style.opacity = "1";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        if (glare) {
          glare.style.opacity = "0";
        }
      });
    });
  }

  // ==========================================================================
  // 9. SCROLL-TRIGGERED REVEAL TRANSITIONS (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealTargets = document.querySelectorAll(
    ".section-header, .community-impact-box, .story-card, .do-card, .track-card, .partner-card, .nodal-card, .tenure-hero-card, .report-event-card, .tenure-conclusion-card, .glass-form-card, .excom-slider-wrapper"
  );

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal-on-scroll");
    // Assign staggered cascade to siblings in grids
    const staggerMod = (index % 4) + 1;
    el.classList.add(`stagger-${staggerMod}`);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  });

  revealTargets.forEach((el) => revealObserver.observe(el));

  // ==========================================================================
  // 10. SCROLL PARALLAX ON DOODLES & 3D FLOATING BADGES
  // ==========================================================================
  const doodleHashtag = document.querySelector(".doodle-hashtag");
  const doodleLoop = document.querySelector(".doodle-loop");
  const doodleArrow = document.querySelector(".doodle-arrow");
  const floatBadges = document.querySelectorAll(".float-3d-badge");

  function handleParallax() {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight * 1.5) return; // Stop calculating when far past hero

    if (doodleHashtag) {
      doodleHashtag.style.transform = `translate3d(0, ${scrollY * -0.16}px, 0)`;
    }
    if (doodleLoop) {
      doodleLoop.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
    }
    if (doodleArrow) {
      doodleArrow.style.transform = `translate3d(0, ${scrollY * -0.12}px, 0)`;
    }

    floatBadges.forEach((badge) => {
      const speed = parseFloat(badge.getAttribute("data-parallax")) || 0.2;
      badge.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
  }

  window.addEventListener("scroll", handleParallax, { passive: true });

  // ==========================================================================
  // 11. SCROLL-LINKED ANIMATED NUMBER COUNTERS
  // ==========================================================================
  const counterElements = document.querySelectorAll(".stat-value, .stat-number");
  const animatedSet = new Set();

  function animateCounter(el) {
    if (animatedSet.has(el)) return;
    const text = el.textContent.trim();
    // Match numeric digits e.g. "500", "126", "25", "10", "4"
    const match = text.match(/^(\d+)(.*)$/);
    if (!match) return;

    animatedSet.add(el);
    const targetNum = parseInt(match[1], 10);
    const suffix = match[2] || "";
    const duration = 1400; // ms
    const startTime = performance.now();

    function updateNum(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * targetNum);
      el.textContent = `${currentVal}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateNum);
      } else {
        el.textContent = `${targetNum}${suffix}`;
      }
    }
    requestAnimationFrame(updateNum);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.35 });

  counterElements.forEach((el) => counterObserver.observe(el));
});
