import sharp from 'sharp';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Every Nemesis icon is drawn from the artwork below: a balance, the scales
 * Nemesis holds, in the logo's green on a near-black tile (the dark theme's
 * background, src/index.css). It's laid out on Android's 108dp adaptive icon
 * grid, where launchers show the central 72dp and, whatever shape they mask
 * it to, keep the central 66dp circle.
 * - The tile is src/assets/nemesis-mark.svg (<Logo />), the favicons and the
 *   PWA icons, and with a margin the desktop app's icon.
 * - Android 8+ gets the scales as a layer over the tile's gradient, plus a
 *   one-tone layer for themed icons (Android 13+).
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const assetsDir = join(__dirname, '..', 'src', 'assets');
const publicDir = join(__dirname, '..', 'public');
const srcTauriDir = join(__dirname, '..', 'src-tauri');

const TILE_STOPS = [
  [0, '#262626'],
  [1, '#121212'],
];
const GREEN_STOPS = [
  [0, '#b2f58c'],
  [1, '#5fcf34'],
];

const stops = (list) =>
  list.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('');

/** Corner to corner of the visible 72dp, lighter at the top left. */
const tileGradient = `
  <linearGradient id="tile" gradientUnits="userSpaceOnUse" x1="18" y1="18" x2="90" y2="90">
    ${stops(TILE_STOPS)}
  </linearGradient>`;
/** Top to bottom of the scales. */
const greenGradient = `
  <linearGradient id="green" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="80">
    ${stops(GREEN_STOPS)}
  </linearGradient>`;

/** A pan hanging at `y`: a shallow bowl `depth` deep, `half` either side of `cx`. */
const pan = (cx, y, half, depth) => {
  const r = (half * half + depth * depth) / (2 * depth);
  return `<path d="M${cx - half} ${y}A${r} ${r} 0 0 0 ${cx + half} ${y}Z"/>`;
};

/**
 * The finial, post and beam, the base, and a pan on three chains at each end
 * of the beam. Drawn about x = 54 and moved to the middle of the grid, at
 * nine tenths of its size so the pans stay clear of a round mask's edge.
 */
const scales = (color) => `
  <g transform="translate(54 54) scale(0.9) translate(-54 -50.8)">
    <g fill="${color}">
      <circle cx="54" cy="30.5" r="3.4"/>
      <rect x="52.3" y="32" width="3.4" height="38" rx="1.7"/>
      <rect x="28.5" y="36.6" width="51" height="3.4" rx="1.7"/>
      <path d="M41 74.5Q54 65 67 74.5Z"/>
      ${pan(32, 55, 9.5, 6)}
      ${pan(76, 55, 9.5, 6)}
    </g>
    <path d="M32 39.5L23.3 55M32 39.5L40.7 55M76 39.5L67.3 55M76 39.5L84.7 55"
      fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round"/>
  </g>`;

/**
 * The scales on the tile. A faint edge keeps the dark tile from melting
 * into a dark desktop or browser tab; icons the platform shapes itself
 * (`radius` 0) go without.
 */
const tile = (radius) =>
  `<defs>${tileGradient}${greenGradient}</defs>` +
  `<rect x="18" y="18" width="72" height="72" rx="${radius}" fill="url(#tile)"/>` +
  (radius
    ? `<rect x="18.4" y="18.4" width="71.2" height="71.2" rx="${radius - 0.4}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="0.8"/>`
    : '') +
  scales('url(#green)');

/** The tile's gradient, full bleed. */
const background = `<defs>${tileGradient}</defs><rect width="108" height="108" fill="url(#tile)"/>`;

// macOS's icon grid, the tile 824 of 1024 across, which sits well among
// Linux launcher icons too.
const desktopSpan = (72 * 1024) / 824;
const desktopOrigin = 54 - desktopSpan / 2;
const desktopViewBox = `${desktopOrigin} ${desktopOrigin} ${desktopSpan} ${desktopSpan}`;

// A maskable PWA icon keeps only the central circle of 40% radius; the
// scales reach 29 from the centre, so show 84 of the grid.
const maskableViewBox = '12 12 84 84';

const art = {
  /** The visible 72dp, rounded like a launcher would. */
  tile: { viewBox: '18 18 72 72', body: tile(16) },
  /** Full bleed, for icons the platform shapes itself (iOS, maskable PWA). */
  squareTile: { viewBox: '18 18 72 72', body: tile(0) },
  maskable: { viewBox: maskableViewBox, body: background + `<defs>${greenGradient}</defs>` + scales('url(#green)') },
  /** With a margin, as desktop icons have. */
  desktop: { viewBox: desktopViewBox, body: tile(16) },
  foreground: { viewBox: '0 0 108 108', body: `<defs>${greenGradient}</defs>` + scales('url(#green)') },
  background: { viewBox: '0 0 108 108', body: background },
  /** Android draws only the alpha of themed icons, so white on transparent. */
  monochrome: { viewBox: '0 0 108 108', body: scales('#ffffff') },
};

// Sized in the SVG itself: sharp rasterizes at the SVG's own size, so
// resizing afterwards would blur it.
const svg = ({ viewBox, body }, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">` +
  `${body}</svg>\n`;
const rasterize = (artwork, size) => sharp(Buffer.from(svg(artwork, size))).png().toBuffer();
const render = (artwork, size, file) => sharp(Buffer.from(svg(artwork, size))).png().toFile(file);

/** An .ico holding each size as a PNG, which every current browser reads. */
const ico = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // an icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
};

const generatedNote = '<!-- Generated by scripts/generate-icons.mjs (npm run icons); edit the artwork there. -->\n';
writeFileSync(join(assetsDir, 'nemesis-mark.svg'), generatedNote + svg(art.tile, 72));
writeFileSync(join(publicDir, 'favicon.svg'), generatedNote + svg(art.tile, 72));
console.log('Generated src/assets/nemesis-mark.svg, public/favicon.svg');

const outputs = [
  { name: 'favicon-96x96.png', size: 96, artwork: art.tile },
  { name: 'favicon-192x192.png', size: 192, artwork: art.tile },
  { name: 'favicon-512x512.png', size: 512, artwork: art.tile },
  { name: 'favicon-maskable-512x512.png', size: 512, artwork: art.maskable },
  // iOS rounds the icon itself, and shows transparency as black.
  { name: 'apple-touch-icon.png', size: 180, artwork: art.squareTile },
];
for (const { name, size, artwork } of outputs) {
  await render(artwork, size, join(publicDir, name));
  console.log(`Generated public/${name} (${size}x${size})`);
}

const icoSizes = [16, 32, 48];
writeFileSync(
  join(publicDir, 'favicon.ico'),
  ico(await Promise.all(icoSizes.map(async (size) => ({ size, png: await rasterize(art.tile, size) }))))
);
console.log(`Generated public/favicon.ico (${icoSizes.join(', ')})`);

/**
 * Sources for the Tauri desktop and Android app icons. `npm run icons` hands
 * app-icon.json to `tauri icon`, which cuts every size and density from the
 * images, writes the adaptive icon with its background, foreground and
 * monochrome layers, and uses app-icon.png for the desktop app (and pre-8.0
 * Android). It writes iOS icons too, which the npm script deletes: Nemesis
 * has no iOS app.
 */
const tauriIconSize = 1024;
await render(art.desktop, tauriIconSize, join(srcTauriDir, 'app-icon.png'));
await render(art.background, tauriIconSize, join(srcTauriDir, 'app-icon-background.png'));
await render(art.foreground, tauriIconSize, join(srcTauriDir, 'app-icon-foreground.png'));
await render(art.monochrome, tauriIconSize, join(srcTauriDir, 'app-icon-monochrome.png'));
writeFileSync(
  join(srcTauriDir, 'app-icon.json'),
  JSON.stringify(
    {
      default: 'app-icon.png',
      android_bg: 'app-icon-background.png',
      android_fg: 'app-icon-foreground.png',
      // The layers are drawn on the full 108dp grid already.
      android_fg_scale: 100,
      android_monochrome: 'app-icon-monochrome.png',
    },
    null,
    2
  ) + '\n'
);
console.log(`Generated src-tauri/app-icon*.png (${tauriIconSize}x${tauriIconSize}), app-icon.json`);

// The traced logo these replace, and the plain background colour the
// adaptive icon had before it took the tile's gradient.
const legacy = [
  join(assetsDir, 'nemesis.svg'),
  join(srcTauriDir, 'gen', 'android', 'app', 'src', 'main', 'res', 'values', 'ic_launcher_background.xml'),
];
for (const file of legacy) {
  if (existsSync(file)) {
    unlinkSync(file);
    console.log(`Removed legacy ${file.slice(join(__dirname, '..').length + 1)}`);
  }
}

console.log('All icons generated successfully!');
