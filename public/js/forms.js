document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('submitForm');
  const logoutForm = document.getElementById('logoutForm');

  const logoutBtn = document.querySelector('#logoutForm .main-nav-action');
  const submitBtn = document.querySelector('#submitForm .submit-btn');
  const deleteButton = document.getElementById('deleteButton');
  const addToCart = document.querySelector('#submitForm .add-to-cart');

  if (signupForm) {
    signupForm.addEventListener('submit', () => {
      if (submitBtn) submitBtn.disabled = true;
      if (deleteButton) deleteButton.disabled = true;
      if (addToCart) addToCart.disabled = true;
    });
  }

  if (logoutForm) {
    logoutForm.addEventListener('submit', () => {
      if (logoutBtn) logoutBtn.disabled = true;
    });
  }
});
