import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImage() {
  const inputPath = 'C:\\Users\\Pro\\.gemini\\antigravity-ide\\brain\\e78bee60-6ada-4665-b23b-9bcb3dcf47c5\\.user_uploaded\\media_1790870544756.png';
  const outputPath = path.resolve('public/assets/images/hero-student-beanbag-transparent.png');

  console.log('Reading input image from:', inputPath);
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log('Metadata:', metadata.width, 'x', metadata.height);

  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Use flood fill BFS from the top corners and edges to only make the true exterior background transparent
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function isBackground(idx: number): boolean {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    // Background is near white/light grey (r > 230, g > 230, b > 230 and color delta is small)
    const isBright = r > 225 && g > 225 && b > 225;
    const isNeutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
    return isBright && isNeutral;
  }

  // Enqueue all edge pixels
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const botIdx = (height - 1) * width + x;
    if (isBackground(topIdx) && !visited[topIdx]) {
      visited[topIdx] = 1;
      queue.push(topIdx);
    }
    if (isBackground(botIdx) && !visited[botIdx]) {
      visited[botIdx] = 1;
      queue.push(botIdx);
    }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isBackground(leftIdx) && !visited[leftIdx]) {
      visited[leftIdx] = 1;
      queue.push(leftIdx);
    }
    if (isBackground(rightIdx) && !visited[rightIdx]) {
      visited[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  // BFS
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // Make transparent
    data[curr * 4 + 3] = 0;

    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isBackground(nIdx)) {
          visited[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  // Soft edge anti-aliasing: find boundary between transparent and opaque
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue; // already fully transparent

      // Check if neighboring transparent pixel
      const hasTransparentNeighbor =
        visited[(y - 1) * width + x] ||
        visited[(y + 1) * width + x] ||
        visited[y * width + (x - 1)] ||
        visited[y * width + (x + 1)];

      if (hasTransparentNeighbor) {
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 210) {
          // Feather the alpha for smooth edges
          const alphaFactor = Math.max(0, (255 - brightness) / 45);
          data[idx * 4 + 3] = Math.min(255, Math.floor(255 * alphaFactor));
        }
      }
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .trim() // Trim transparent bounding edges
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

  console.log('Successfully saved transparent image to:', outputPath);
}

processImage().catch(console.error);
