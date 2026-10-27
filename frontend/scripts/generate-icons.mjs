import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * The desktop and Android app icons, drawn from the scales in
 * src/assets/nemesis.svg (<Logo />) without the rules above and below them,
 * which a launcher's mask would cut through. Laid out on Android's 108dp
 * adaptive icon grid, where launchers show the central 72dp and, whatever
 * shape they mask it to, keep the central 66dp circle.
 * - The desktop icon is the scales on a dark tile, with a margin.
 * - Android 8+ gets the scales as a layer over the dark background, plus a
 *   one-tone layer for themed icons (Android 13+).
 * The web favicons in public/ are left as they are.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logoPath = join(__dirname, '..', 'src', 'assets', 'nemesis.svg');
const srcTauriDir = join(__dirname, '..', 'src-tauri');

// The logo's green, and the dark theme's --color-background (src/index.css).
const GREEN = '#8be75f';
const BACKGROUND = '#1a1a1a';

// The logo is traced in a 192-unit box, its paths flipped into it by this
// transform. The rules above and below the scales start at its left edge.
const LOGO_SIZE = 192;
const LOGO_TRANSFORM = `translate(0,${LOGO_SIZE}) scale(0.1,-0.1)`;
const scalesPaths = (readFileSync(logoPath, 'utf8').match(/<path d="[^"]*"\/>/g) ?? [])
  .filter((path) => !path.startsWith('<path d="M0 '))
  .join('');
if (!scalesPaths) {
  throw new Error(`Found no paths in ${logoPath}`);
}

// Sized in the SVG itself: sharp rasterizes at the SVG's own size, so
// resizing afterwards would blur it.
const svg = (viewBox, size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">` +
  `${body}</svg>\n`;
const render = (viewBox, size, body, file) => sharp(Buffer.from(svg(viewBox, size, body))).png().toFile(file);

/** Where the scales sit in the logo's box, found by trimming a render of them. */
const scalesBounds = async () => {
  const pixelsPerUnit = 10;
  const { info } = await sharp(
    Buffer.from(
      svg(`0 0 ${LOGO_SIZE} ${LOGO_SIZE}`, LOGO_SIZE * pixelsPerUnit, `<g transform="${LOGO_TRANSFORM}">${scalesPaths}</g>`)
    )
  )
    .trim()
    .toBuffer({ resolveWithObject: true });
  return {
    x: -info.trimOffsetLeft / pixelsPerUnit,
    y: -info.trimOffsetTop / pixelsPerUnit,
    width: info.width / pixelsPerUnit,
    height: info.height / pixelsPerUnit,
  };
};

// Across their wider side. Their corners then stay inside the 66dp circle.
const SCALES_SPAN = 48;

const bounds = await scalesBounds();
const scale = SCALES_SPAN / Math.max(bounds.width, bounds.height);
const centre = `translate(${54 - scale * (bounds.x + bounds.width / 2)} ${54 - scale * (bounds.y + bounds.height / 2)})`;
const scales = (fill) =>
  `<g transform="${centre} scale(${scale})"><g transform="${LOGO_TRANSFORM}" fill="${fill}">${scalesPaths}</g></g>`;

// macOS's icon grid, the tile 824 of 1024 across, which sits well among
// Linux launcher icons too.
const desktopSpan = (72 * 1024) / 824;
const desktopOrigin = 54 - desktopSpan / 2;
const desktopViewBox = `${desktopOrigin} ${desktopOrigin} ${desktopSpan} ${desktopSpan}`;

/**
 * Sources for the Tauri desktop and Android app icons. `npm run icons` hands
 * app-icon.json to `tauri icon`, which cuts every size and density from the
 * images, writes the adaptive icon with its background colour, foreground
 * and monochrome layers, and uses app-icon.png for the desktop app (and
 * pre-8.0 Android). It writes iOS icons too, which the npm script deletes:
 * Nemesis has no iOS app.
 */
const tauriIconSize = 1024;
await render(
  desktopViewBox,
  tauriIconSize,
  `<rect x="18" y="18" width="72" height="72" rx="16" fill="${BACKGROUND}"/>${scales(GREEN)}`,
  join(srcTauriDir, 'app-icon.png')
);
await render('0 0 108 108', tauriIconSize, scales(GREEN), join(srcTauriDir, 'app-icon-foreground.png'));
// Android draws only the alpha of themed icons, so this is white on transparent.
await render('0 0 108 108', tauriIconSize, scales('#ffffff'), join(srcTauriDir, 'app-icon-monochrome.png'));
writeFileSync(
  join(srcTauriDir, 'app-icon.json'),
  JSON.stringify(
    {
      default: 'app-icon.png',
      bg_color: BACKGROUND,
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
