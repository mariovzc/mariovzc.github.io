// Generates favicons and app icons in public/ from src/assets/brand/avatar.png.
// Run via `make favicons` (inside the app container).
import sharp from 'sharp';

const SRC = 'src/assets/brand/avatar.png';
const OUT = 'public';

// Tight square around the illustrated face so it still reads at tab size.
const FACE = { left: 105, top: 65, width: 250, height: 250 };

const circleMask = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

async function faceIcon(size) {
  const file = `${OUT}/favicon-${size}.png`;
  await sharp(SRC)
    .extract(FACE)
    .resize(size, size, { kernel: 'lanczos3' })
    .ensureAlpha()
    .composite([{ input: circleMask(size), blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function fullIcon(size, name) {
  const file = `${OUT}/${name}`;
  await sharp(SRC)
    .resize(size, size, { kernel: 'lanczos3' })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(file);
  return file;
}

const files = await Promise.all([
  faceIcon(32),
  faceIcon(48),
  fullIcon(180, 'apple-touch-icon.png'),
  fullIcon(192, 'icon-192.png'),
  fullIcon(512, 'icon-512.png'),
]);
console.log(files.join('\n'));
