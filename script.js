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
      const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 314;
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

    // Button Navigation Controls (Scroll 1 full page of 4 cards at a time)
    if (excomPrevBtn) {
      excomPrevBtn.addEventListener("click", () => {
        excomTrack.scrollBy({ left: -excomTrack.clientWidth, behavior: "smooth" });
      });
    }

    if (excomNextBtn) {
      excomNextBtn.addEventListener("click", () => {
        excomTrack.scrollBy({ left: excomTrack.clientWidth, behavior: "smooth" });
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
});
