document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById('navbar-container');

  fetch('navbar.html') // Adjust path if it's in a subfolder like 'components/navbar.html'
    .then(response => response.text())
    .then(html => {
      navbarContainer.innerHTML = html;

      // Re-bind functionality after injecting HTML
      setupNavbarFunctions();
    });
});
