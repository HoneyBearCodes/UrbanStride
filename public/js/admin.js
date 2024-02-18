document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.deleteButton');

  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener('click', async function (event) {
      const productId = this.parentNode.querySelector('[name=id]').value;
      const csrfToken = this.parentNode.querySelector('[name=_csrf]').value;
      const article = this.parentNode.closest('article');

      try {
        const response = await fetch(`/admin/product/${productId}`, {
          method: 'DELETE',
          headers: {
            'csrf-token': csrfToken,
          },
        });

        if (response) {
          article.remove();
          checkIfNoProducts(); // Check if there are no products and show message
        }
      } catch (err) {
        console.log(err);
      }
    });
  });

  // Function to check if there are no products and show the message
  function checkIfNoProducts() {
    const productCards = document.querySelectorAll('.product.card');
    const errorMessage = document.querySelector('.error-card');
    const productsGrid = document.querySelector('.products.grid');

    if (productCards.length === 0 && !errorMessage) {
      // Remove existing products grid
      if (productsGrid) {
        productsGrid.remove();
      }

      // Create and append error message dynamically
      const mainContent = document.querySelector('main .container.main');
      const newErrorMessage = document.createElement('div');
      newErrorMessage.classList.add(
        'error-card',
        'card',
        'card--linear',
        'margin-bottom-sm',
      );
      newErrorMessage.innerHTML = `
        <h1 class="error-code">Booo!!</h1>
        <p class="error-title">No Products Found!</p>
        <p class="error-subtitle margin-bottom-sm">
          But you can create new ones!
        </p>
        <p class="error-message">[🛍️ Products took a sabbatical 🛒]</p>
      `;
      mainContent.appendChild(newErrorMessage);
    }
  }
});
