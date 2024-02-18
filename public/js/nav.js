const mainNavLinks = document.querySelector('.main-nav-links');
const mainNavActions = document.querySelector('.main-nav-actions');
const menuButton = document.querySelector('.resp-nav-btn-links');
const adminButton = document.querySelector('.resp-nav-btn-actions');
const hamburgerIcon = document.querySelector('.menu');
const crossIcon = document.querySelector('.close');

crossIcon.style.display = 'none';

function toggleMenuBtn() {
  hamburgerIcon.classList.toggle('active');
  mainNavLinks.classList.toggle('resp-active');
  if (hamburgerIcon.classList.contains('active')) {
    hamburgerIcon.style.display = 'none';
    crossIcon.style.display = 'block';
  } else {
    hamburgerIcon.style.display = 'block';
    crossIcon.style.display = 'none';
  }
}

function toggleAdminBtn() {
  if (adminButton) {
    adminButton.classList.toggle('active');
    mainNavActions.classList.toggle('resp-active');
  }
}

menuButton.addEventListener('click', () => {
  if (adminButton) {
    if (adminButton.classList.contains('active')) {
      toggleAdminBtn();
    }
  }
  toggleMenuBtn();
});

adminButton.addEventListener('click', () => {
  if (hamburgerIcon.classList.contains('active')) {
    toggleMenuBtn();
  }
  toggleAdminBtn();
});
