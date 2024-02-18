// Initialize FileReader and select DOM elements
const fileReader = new FileReader();
const imageInput = document.querySelector('.img-input');
const imageContainer = document.querySelector('.img-container');
const imageIcon = document.querySelector('.img-icon');
const imageText = document.querySelector('.img-icon+p');
const descriptionTextArea = document.querySelector(
  'textarea[name="description"]',
);
let selectedFileName;

// Ensure description text area has no leading/trailing spaces on page load
if (descriptionTextArea) {
  window.onload = () =>
    (descriptionTextArea.textContent = descriptionTextArea.textContent.trim());
}

// Event handler when FileReader finishes loading file
fileReader.onload = (event) => {
  // Set image background, style, and hide icon
  imageContainer.style.backgroundImage = `linear-gradient(rgba(34, 34, 34, 0.6), rgba(34, 34, 34, 0.6)), url(${event.target.result})`;
  imageContainer.style.backgroundSize = 'cover';
  imageContainer.style.backgroundPosition = 'center';
  imageIcon.style.display = 'none';

  // Set text color, content, and display file name
  imageText.style.color = '#fff';
  imageText.textContent = selectedFileName;
};

// Event listener for file input change
if (imageInput) {
  imageInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];
    selectedFileName = truncateFileName(selectedFile.name);
    fileReader.readAsDataURL(selectedFile);
  });
}

function truncateFileName(fileName) {
  const [name, extension] = fileName.split('.');
  if (fileName.length > 30) {
    return `${name.slice(0, 10)}...${name.slice(-10)}${
      extension ? '.' + extension : ''
    }`;
  }
  return fileName;
}
