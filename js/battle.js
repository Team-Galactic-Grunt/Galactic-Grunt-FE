const escMenu = document.getElementById("esc-menu");

let isMenuOpen = false;

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();

    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      escMenu.classList.add("show");
    } else {
      escMenu.classList.remove("show");
    }
  }
});
