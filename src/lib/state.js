export function saveState() {
  const state = {
    multiplier: document.getElementById("multiplier").value,
    power: document.getElementById("power").value,
    rotate: document.getElementById("rotate").value,
    rotation: document.getElementById("rotation").value,
    focal_point: document.getElementById("focal_point").value,
    matrix: Array.from(document.querySelectorAll("#matrix-grid input")).map(
      (input) => input.value,
    ),
  };
  localStorage.setItem("image-kernel-state", JSON.stringify(state));
}

export function loadState() {
  const saved = localStorage.getItem("image-kernel-state");
  if (!saved) return;

  try {
    const state = JSON.parse(saved);
    if (state.multiplier)
      document.getElementById("multiplier").value = state.multiplier;
    if (state.power) document.getElementById("power").value = state.power;
    if (state.rotate) document.getElementById("rotate").value = state.rotate;
    if (state.rotation)
      document.getElementById("rotation").value = state.rotation;
    if (state.focal_point)
      document.getElementById("focal_point").value = state.focal_point;

    if (state.matrix) {
      const inputs = document.querySelectorAll("#matrix-grid input");
      state.matrix.forEach((val, i) => {
        if (inputs[i]) inputs[i].value = val;
      });
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
}
