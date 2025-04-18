document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const logoImg = document.getElementById('logo-img');

  // Get saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.add(savedTheme);
  updateLogo(savedTheme);

  // Theme toggle button click
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light');
    body.classList.toggle('dark');

    const currentTheme = body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    updateLogo(currentTheme);
  });

  // Swap logo image based on theme
  function updateLogo(theme) {
    if (logoImg) {
      logoImg.src = theme === 'light'
        ? 'assets/images/logo-light.png'
        : 'assets/images/logo-dark.png';
    }
  }
});
