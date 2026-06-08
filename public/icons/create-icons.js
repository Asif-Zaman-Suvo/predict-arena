#!/usr/bin/env node

/**
 * Temporary PWA Icon Generator
 * Creates basic soccer-themed icons as placeholders
 * Replace these with your official app icons later
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = __dirname;

// Simple soccer ball SVG template
function createSVG(size) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0a1628" rx="${size * 0.15}"/>

  <!-- Soccer ball pattern -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Outer circle -->
    <circle cx="0" cy="0" r="${size * 0.35}" fill="none" stroke="white" stroke-width="${size * 0.03}"/>

    <!-- Pentagon pattern (simplified) -->
    <path d="M0,${-size * 0.25} L${size * 0.24},${-size * 0.08} L${size * 0.15},${size * 0.2} L${-size * 0.15},${size * 0.2} L${-size * 0.24},${-size * 0.08} Z"
          fill="white" stroke="#0a1628" stroke-width="${size * 0.02}"/>

    <!-- Inner pentagon -->
    <path d="M0,${-size * 0.15} L${size * 0.14},${-size * 0.05} L${size * 0.09},${size * 0.12} L${-size * 0.09},${size * 0.12} L${-size * 0.14},${-size * 0.05} Z"
          fill="#0a1628" stroke="white" stroke-width="${size * 0.015}"/>
  </g>

  <!-- Trophy/winner indication -->
  <g transform="translate(${size * 0.75}, ${size * 0.75})">
    <circle cx="0" cy="0" r="${size * 0.08}" fill="#FFD700"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
          font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.1}" fill="#0a1628">
      ⚡
    </text>
  </g>
</svg>
`;
  return svg;
}

console.log('🎨 Creating placeholder PWA icons...\n');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg.trim());
  console.log(`✅ Created ${filename}`);
});

console.log('\n⚠️  These are SVG placeholders. For production:');
console.log('   1. Convert SVGs to PNGs or create custom PNG icons');
console.log('   2. Use online tools like favicon.io or pwabuilder.com');
console.log('   3. Replace these files with your official app icons\n');

console.log('📝 For now, the icons will work but show as SVG format.');
console.log('   Update manifest.json to use .png files when ready.\n');