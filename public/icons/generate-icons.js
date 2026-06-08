#!/usr/bin/env node

/**
 * PWA Icon Generation Helper
 *
 * This script helps you understand what icons you need to create.
 * Since we can't generate actual image files programmatically,
 * you'll need to create them using your favorite design tool.
 */

const fs = require('fs');
const path = require('path');

const iconSizes = [
  72, 96, 128, 144, 152, 192, 384, 512
];

const iconsDir = path.join(__dirname);

console.log('🎨 PWA Icon Generation Guide\n');
console.log('You need to create icons with these sizes:');
iconSizes.forEach(size => {
  console.log(`  - ${size}x${size}px: icon-${size}x${size}.png`);
});

console.log('\n📋 Icon Requirements:');
console.log('  • Format: PNG with transparency');
console.log('  • Style: Your app logo/branding');
console.log('  • Background: Transparent or your brand color');
console.log('  • Safe zone: Keep logo within 60% of the image');
console.log('  • Contrast: Ensure visibility on both light and dark backgrounds');

console.log('\n🛠️ Recommended Tools:');
console.log('  • Figma: https://www.figma.com/');
console.log('  • Canva: https://www.canva.com/');
console.log('  • Sketch: https://www.sketch.com/');
console.log('  • Photoshop/GIMP');

console.log('\n📱 Icon Purpose:');
console.log('  • "any": Regular app icon usage');
console.log('  • "maskable": Icon that can be safely masked/rounded');

console.log('\n⚡ Quick Start:');
console.log('  1. Create a 512x512 base icon');
console.log('  2. Export it in all required sizes');
console.log('  3. Place them in: public/icons/');
console.log('  4. Run: npm run build');

console.log('\n🎯 Pro Tips:');
console.log('  • Use SVG for scaling, then export to PNG');
console.log('  • Test on real devices');
console.log('  • Ensure good contrast ratio');
console.log('  • Keep it simple - complex logos don\'t scale well');

// Create a README in the icons directory
const readme = `# PWA Icons

Place your app icons in this directory with the following naming convention:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Icon Specifications

- **Format**: PNG with transparency
- **Style**: Your app logo/branding
- **Background**: Transparent or brand color (#0a1628)
- **Safe Zone**: Keep logo within 60% of the image
- **Purpose**: "any" for regular use, "maskable" for adaptive icons

## Quick Generation

If you have a single 512x512 icon, you can use online tools to generate all sizes:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Testing

After adding icons, test with:
1. Build the app: npm run build
2. Run locally: npm run start
3. Open Chrome DevTools > Lighthouse > Progressive Web App
4. Check all PWA requirements are met
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme);
console.log('\n✅ Created README.md in public/icons/');
console.log('\n🚀 Next steps:');
console.log('  1. Create your icons using the guidelines above');
console.log('  2. Place them in: public/icons/');
console.log('  3. Build and test your PWA\n');