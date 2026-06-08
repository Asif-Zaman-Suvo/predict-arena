# PWA Icons

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
