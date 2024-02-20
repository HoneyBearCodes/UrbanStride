document.addEventListener('DOMContentLoaded', () => {
  const popupContainer = document.querySelector('.popup-container');
  const acknowledgeButton = document.querySelector('.acknowledgePopup');

  // Check if popup and button elements exist
  if (popupContainer && acknowledgeButton) {
    // Add a click event listener to the "Got It" button
    acknowledgeButton.addEventListener('click', async function () {
      acknowledgeButton.disabled = true;

      const csrfToken = this.parentNode.querySelector('[name=_csrf]').value;

      // Send an acknowledgment request to the server
      try {
        const response = await fetch('/acknowledge-popup', {
          method: 'POST',
          headers: {
            'csrf-token': csrfToken,
          },
        });

        // Check if the acknowledgment was successful (status code 200)
        if (response.ok) {
          // Add the 'hide' class to trigger the animation
          popupContainer.classList.add('hide');

          // Listen for the end of the animation, then hide the popup
          popupContainer.addEventListener(
            'transitionend',
            () => {
              popupContainer.style.display = 'none';
            },
            { once: true },
          );
        } else {
          console.error('Failed to acknowledge popup:', response.status);
        }
      } catch (error) {
        console.error('Error acknowledging popup:', error);
      }
    });
  }
});
