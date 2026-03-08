export default async function kernel(
  img,
  matrix,
  power = 1,
  multiplier = 1.0,
  rotate = 0,
  rotation = "clockwise",
  focal_point = "5"
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  let currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let processedMatrix = matrix.map((row) => [...row]);
  if (rotate > 0) {
    const ringIndices = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
      [2, 1],
      [2, 0],
      [1, 0],
    ];
    const len = ringIndices.length;
    const shift = rotate % len;
    const tempMatrix = processedMatrix.map((row) => [...row]);

    for (let i = 0; i < len; i++) {
      let targetIdx;
      if (rotation === "clockwise") {
        targetIdx = (i + shift) % len;
      } else {
        targetIdx = (i - shift + len) % len;
      }
      const [oldR, oldC] = ringIndices[i];
      const [newR, newC] = ringIndices[targetIdx];
      processedMatrix[newR][newC] = tempMatrix[oldR][oldC];
    }
  }

  const rows = processedMatrix.length;
  const cols = processedMatrix[0].length;
  let offsetR = Math.floor(rows / 2);
  let offsetC = Math.floor(cols / 2);

  const focalMap = {
    "top left": [0, 0], "1": [0, 0],
    "top": [0, 1], "2": [0, 1],
    "top right": [0, 2], "3": [0, 2],
    "left": [1, 0], "4": [1, 0],
    "center": [1, 1], "5": [1, 1],
    "right": [1, 2], "6": [1, 2],
    "bottom left": [2, 0], "7": [2, 0],
    "bottom": [2, 1], "8": [2, 1],
    "bottom right": [2, 2], "9": [2, 2]
  };

  if (focalMap[focal_point]) {
    [offsetR, offsetC] = focalMap[focal_point];
  }

  const iterations = Math.max(1, Math.floor(power));

  for (let p = 0; p < iterations; p++) {
    const srcData = currentImageData.data;
    const dst = ctx.createImageData(currentImageData);
    const dstData = dst.data;
    const sw = currentImageData.width;
    const sh = currentImageData.height;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4;

        if (srcData[i + 3] === 0) {
          dstData[i] = srcData[i];
          dstData[i + 1] = srcData[i + 1];
          dstData[i + 2] = srcData[i + 2];
          dstData[i + 3] = 0;
          continue;
        }

        let r = 0,
          g = 0,
          b = 0;

        for (let ky = 0; ky < rows; ky++) {
          for (let kx = 0; kx < cols; kx++) {
            const sc = Math.min(sw - 1, Math.max(0, x + kx - offsetC));
            const sr = Math.min(sh - 1, Math.max(0, y + ky - offsetR));
            const idx = (sr * sw + sc) * 4;

            const kVal = processedMatrix[ky][kx];
            r += srcData[idx] * kVal;
            g += srcData[idx + 1] * kVal;
            b += srcData[idx + 2] * kVal;
          }
        }

        dstData[i] = r * multiplier;
        dstData[i + 1] = g * multiplier;
        dstData[i + 2] = b * multiplier;
        dstData[i + 3] = srcData[i + 3];
      }
    }
    currentImageData = dst;
  }

  ctx.putImageData(currentImageData, 0, 0);
  return canvas.toDataURL();
}
