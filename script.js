const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let detectionInterval = 200; // 100 milliseconds

// HTML elements for facial features controls
const sliders = {
  leftEye: {
    height: document.getElementById('leftEyeHeight'),
    width: document.getElementById('leftEyeWidth'),
    x: document.getElementById('leftEyeX'),
    y: document.getElementById('leftEyeY'),
    rotation: document.getElementById('leftEyeRotation'),
    active: document.getElementById('leftEyeActive')
  },
  rightEye: {
    height: document.getElementById('rightEyeHeight'),
    width: document.getElementById('rightEyeWidth'),
    x: document.getElementById('rightEyeX'),
    y: document.getElementById('rightEyeY'),
    rotation: document.getElementById('rightEyeRotation'),
    active: document.getElementById('rightEyeActive')
  },
  nose: {
    height: document.getElementById('noseHeight'),
    width: document.getElementById('noseWidth'),
    x: document.getElementById('noseX'),
    y: document.getElementById('noseY'),
    rotation: document.getElementById('noseRotation'),
    active: document.getElementById('noseActive')
  },
  mouth: {
    height: document.getElementById('mouthHeight'),
    width: document.getElementById('mouthWidth'),
    x: document.getElementById('mouthX'),
    y: document.getElementById('mouthY'),
    rotation: document.getElementById('mouthRotation'),
    active: document.getElementById('mouthActive')
  },
  hat: {
    height: document.getElementById('hatHeight'),
    width: document.getElementById('hatWidth'),
    x: document.getElementById('hatX'),
    y: document.getElementById('hatY'),
    rotation: document.getElementById('hatRotation'),
    active: document.getElementById('hatActive'),
    upload: document.getElementById('hatUpload')
  }
};

// Image elements for each facial feature
let leftEyeImage = new Image();
let rightEyeImage = new Image();
let noseImage = new Image();
let mouthImage = new Image();
let hatImage = new Image();
let faceDetector;

// Default hat is a semi-transparent ellipse
let defaultHat = true;

// Start video capture
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video.play();

  video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (window.FaceDetector) {
      faceDetector = new window.FaceDetector();
      detectFaces();
    } else {
      console.error("FaceDetector API not supported in this browser.");
    }
  });
}).catch(err => {
  console.error("Error accessing camera: ", err);
});

// Face detection and feature rendering
async function detectFaces() {
  try {
    const faces = await faceDetector.detect(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let face of faces) {
      const { width, height, top, left } = face.boundingBox;
      let featureWidth = width * 0.2;
      let featureHeight = height * 0.2;

      // Left Eye
      if (sliders.leftEye.active.checked) {
        drawFeature(left + width * (0.3 + parseFloat(sliders.leftEye.x.value)), top + height * (0.3 + parseFloat(sliders.leftEye.y.value)), featureWidth * parseFloat(sliders.leftEye.width.value), featureHeight * parseFloat(sliders.leftEye.height.value), parseFloat(sliders.leftEye.rotation.value), leftEyeImage);
      }

      // Right Eye
      if (sliders.rightEye.active.checked) {
        drawFeature(left + width * (0.7 + parseFloat(sliders.rightEye.x.value)), top + height * (0.3 + parseFloat(sliders.rightEye.y.value)), featureWidth * parseFloat(sliders.rightEye.width.value), featureHeight * parseFloat(sliders.rightEye.height.value), parseFloat(sliders.rightEye.rotation.value), rightEyeImage);
      }

      // Nose
      if (sliders.nose.active.checked) {
        drawFeature(left + width * (0.5 + parseFloat(sliders.nose.x.value)), top + height * (0.5 + parseFloat(sliders.nose.y.value)), featureWidth * parseFloat(sliders.nose.width.value), featureHeight * parseFloat(sliders.nose.height.value), parseFloat(sliders.nose.rotation.value), noseImage);
      }

      // Mouth
      if (sliders.mouth.active.checked) {
        drawFeature(left + width * (0.5 + parseFloat(sliders.mouth.x.value)), top + height * (0.7 + parseFloat(sliders.mouth.y.value)), featureWidth * parseFloat(sliders.mouth.width.value), featureHeight * parseFloat(sliders.mouth.height.value), parseFloat(sliders.mouth.rotation.value), mouthImage);
      }

      // Hat
      if (sliders.hat.active.checked) {
        if (defaultHat) {
          drawHat(left + width * (0.5 + parseFloat(sliders.hat.x.value)), top + height * (0.1 + parseFloat(sliders.hat.y.value)), featureWidth * parseFloat(sliders.hat.width.value), featureHeight * parseFloat(sliders.hat.height.value), parseFloat(sliders.hat.rotation.value), null);
        } else {
          drawHat(left + width * (0.5 + parseFloat(sliders.hat.x.value)), top + height * (0.1 + parseFloat(sliders.hat.y.value)), featureWidth * parseFloat(sliders.hat.width.value), featureHeight * parseFloat(sliders.hat.height.value), parseFloat(sliders.hat.rotation.value), hatImage);
        }
      }
    }

    requestAnimationFrame(detectFaces);
  } catch (err) {
    console.error("Face detection failed: ", err);
  }
}

// Draw facial feature or hat
function drawFeature(x, y, width, height, angle, image) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);

  if (image.src) {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
  }

  ctx.restore();
}

// Draw hat (either custom image or default ellipse)
function drawHat(x, y, width, height, angle, image) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);

  if (image && image.src) {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';  // Semi-transparent blue for the hat
    ctx.fill();
  }

  ctx.restore();
}

// Handle image uploads
function handleImageUpload(event, imageElement) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageElement.src = e.target.result;
      if (imageElement === hatImage) defaultHat = false; // Use custom hat image
    };
    reader.readAsDataURL(file);
  }
}

// Reset all sliders
function resetAllSliders() {
  const resetValue = (element, value) => {
    element.value = value;
  };

  // Reset all sliders to their default values
  resetValue(sliders.leftEye.height, 1);
  resetValue(sliders.leftEye.width, 1);
  resetValue(sliders.leftEye.x, 0);
  resetValue(sliders.leftEye.y, 0);
  resetValue(sliders.leftEye.rotation, 0);

  resetValue(sliders.rightEye.height, 1);
  resetValue(sliders.rightEye.width, 1);
  resetValue(sliders.rightEye.x, 0);
  resetValue(sliders.rightEye.y, 0);
  resetValue(sliders.rightEye.rotation, 0);

  resetValue(sliders.nose.height, 1);
  resetValue(sliders.nose.width, 1);
  resetValue(sliders.nose.x, 0);
  resetValue(sliders.nose.y, 0);
  resetValue(sliders.nose.rotation, 0);

  resetValue(sliders.mouth.height, 1);
  resetValue(sliders.mouth.width, 1);
  resetValue(sliders.mouth.x, 0);
  resetValue(sliders.mouth.y, 0);
  resetValue(sliders.mouth.rotation, 0);

  resetValue(sliders.hat.height, 1);
  resetValue(sliders.hat.width, 1);
  resetValue(sliders.hat.x, 0);
  resetValue(sliders.hat.y, 0);
  resetValue(sliders.hat.rotation, 0);
}

// Attach event listeners for image uploads
document.getElementById('leftEyeUpload').addEventListener('change', event => handleImageUpload(event, leftEyeImage));
document.getElementById('rightEyeUpload').addEventListener('change', event => handleImageUpload(event, rightEyeImage));
document.getElementById('noseUpload').addEventListener('change', event => handleImageUpload(event, noseImage));
document.getElementById('mouthUpload').addEventListener('change', event => handleImageUpload(event, mouthImage));
sliders.hat.upload.addEventListener('change', event => handleImageUpload(event, hatImage));

// Attach event listener for reset button
document.getElementById('resetAll').addEventListener('click', resetAllSliders);

document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll("input[type='range']");
  const resetButton = document.getElementById("resetAll");

  // Function to update the slider values dynamically
  const updateSliderValues = () => {
      sliders.forEach(slider => {
          const valueDisplay = document.getElementById(`${slider.id}Value`);
          if (valueDisplay) {
              valueDisplay.innerText = slider.value;
          }
      });
  };

  // Initialize the values on page load
  updateSliderValues();

  // Add event listeners to update the value whenever a slider is moved
  sliders.forEach(slider => {
      slider.addEventListener("input", updateSliderValues);
  });

  // Add event listener for the Reset All button
  resetButton.addEventListener("click", () => {
      sliders.forEach(slider => {
          slider.value = slider.defaultValue; // Reset to default value
      });
      updateSliderValues(); // Update displayed values next to sliders
  });
});

// Modify your face detection function to run at intervals
setInterval(() => {
  detectFaceAndDraw();  // Your face detection and drawing function
}, detectionInterval);

const movementThreshold = 0.01; // Ignore movements smaller than this

const applyMovementThreshold = (currentPos, prevPos) => {
    return {
        x: Math.abs(currentPos.x - prevPos.x) > movementThreshold ? currentPos.x : prevPos.x,
        y: Math.abs(currentPos.y - prevPos.y) > movementThreshold ? currentPos.y : prevPos.y
    };
};

// Use this function when applying updates to facial feature positions
let smoothedLeftEyePos = applyMovementThreshold(currentLeftEyePos, prevPositions.leftEye);