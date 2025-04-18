function setupNavbarFunctions() {
  const body = document.body;
  const logoImg = document.getElementById('logo-img');
  const themeToggle = document.getElementById('theme-toggle');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  // Load and apply saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.add(savedTheme);
  updateLogo(savedTheme);

  // Theme toggle button click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light');
      body.classList.toggle('dark');

      const currentTheme = body.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);
      updateLogo(currentTheme);
    });
  }

  // Hamburger menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  function updateLogo(theme) {
    if (logoImg) {
      logoImg.src = theme === 'light'
        ? 'assets/images/logo-light.png'
        : 'assets/images/logo-dark.png';
    }
  }
}

// Formspree handler with custom success message
function setupFormHandler() {
  const form = document.querySelector("form");
  const popup = document.createElement("div");

  if (!form) return;

  popup.textContent = "Message sent!";
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 12px 20px;
    border-radius: 5px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 9999;
  `;
  document.body.appendChild(popup);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        form.reset();
        popup.style.opacity = "1";
        setTimeout(() => {
          popup.style.opacity = "0";
        }, 5000);
      } else {
        alert("Oops! Something went wrong.");
      }
    } catch (error) {
      alert("Oops! Submission failed.");
    }
  });
}

// When content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Only run form handler if a form exists
  setupFormHandler();

  // If navbar was included dynamically, setupNavbarFunctions is called from load-navbar.js
  // Otherwise, uncomment this line if navbar is static in HTML:
  // setupNavbarFunctions();
});

