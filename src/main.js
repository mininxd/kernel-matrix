import "./app.css";
import kernel from "./lib/blur.js";
import { saveState, loadState } from "./lib/state.js";

const fileInput = document.getElementById("file-input");
const multiplierInput = document.getElementById("multiplier");
const powerInput = document.getElementById("power");
const matrixGrid = document.getElementById("matrix-grid");
const applyBtn = document.getElementById("apply-btn");

// New inputs added by user
const rotateInput = document.getElementById("rotate");
const rotationInput = document.getElementById("rotation");

const previewImg = document.getElementById("preview-img");
const previewPlaceholder = document.getElementById("preview-placeholder");
const resultImg = document.getElementById("result-img");
const resultPlaceholder = document.getElementById("result-placeholder");

resultImg.addEventListener("click", () => {
  if (!resultImg.src || resultImg.src.endsWith("-")) return;
  
  const link = document.createElement("a");
  const randomName = "blur-" + Math.random().toString(36).substring(2, 9) + ".png";
  link.download = randomName;
  link.href = resultImg.src;
  link.click();
});

let originalImage = null;

// Initialize state
loadState();

// Add event listeners to save state on change
[multiplierInput, powerInput, rotateInput, rotationInput].forEach(el => {
  el?.addEventListener("change", saveState);
  el?.addEventListener("input", saveState);
});

matrixGrid.querySelectorAll("input").forEach(el => {
  el.addEventListener("change", saveState);
  el.addEventListener("input", saveState);
  el.addEventListener("blur", (e) => {
    let val = e.target.value;
    if (val === "" || val === ".") {
      e.target.value = "0";
    } else if (val.startsWith(".")) {
      e.target.value = "0" + val;
    }
    saveState();
  });
});

[multiplierInput, powerInput, rotateInput].forEach(el => {
  el?.addEventListener("blur", (e) => {
    let val = e.target.value;
    if (val === "" || val === ".") {
      e.target.value = "0";
    } else if (val.startsWith(".")) {
      e.target.value = "0" + val;
    }
    saveState();
  });
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        previewImg.src = event.target.result;
        previewImg.classList.remove("hidden");
        previewPlaceholder.classList.add("hidden");
        
        // Reset result
        resultImg.classList.add("hidden");
        resultPlaceholder.classList.remove("hidden");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

applyBtn.addEventListener("click", async () => {
  if (!originalImage) {
    fileInput.click();
    return;
  }

  const inputs = matrixGrid.querySelectorAll("input");
  let matrix = [];
  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 3; j++) {
      row.push(parseFloat(inputs[i * 3 + j].value) || 0);
    }
    matrix.push(row);
  }

  const rotateSteps = parseInt(rotateInput?.value) || 0;
  let rotationDirection = rotationInput?.value || "clockwise";
  if (rotationDirection === "counter clockwise") {
    rotationDirection = "counter-clockwise";
  }
  const multiplier = parseFloat(multiplierInput.value) || 1;
  const power = parseFloat(powerInput.value) || 1;

  applyBtn.disabled = true;
  applyBtn.textContent = "Processing...";

  try {
    const resultDataUrl = await kernel(originalImage, matrix, power, multiplier, rotateSteps, rotationDirection);
    resultImg.src = resultDataUrl;
    resultImg.classList.remove("hidden");
    resultPlaceholder.classList.add("hidden");
  } catch (error) {
    console.error("Error processing image:", error);
    alert("An error occurred during processing.");
  } finally {
    applyBtn.disabled = false;
    applyBtn.textContent = "Apply Kernel";
  }
});
