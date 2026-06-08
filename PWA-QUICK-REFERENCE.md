# 🚀 PWA Quick Reference

## Build & Deploy

```bash
# Build the PWA (use --webpack flag)
npm run build -- --webpack

# Test locally
npm run start

# Deploy to Vercel
git push origin main  # Auto-deploys on Vercel
```

## Icon Creation Quick Guide

1. **Create 512x512 logo** in Figma/Canva/Photoshop
2. **Export to all sizes** or use online tools:
   - https://favicon.io/
   - https://www.pwabuilder.com/imageGenerator
3. **Replace SVG files** in `/public/icons/`
4. **Update manifest.json** to use PNG instead of SVG

## Testing Checklist

- [ ] Build succeeds: `npm run build -- --webpack`
- [ ] Manifest loads: Check Application tab in DevTools
- [ ] Service worker active: Should see "sw.js" active
- [ ] Install prompt appears: In address bar
- [ ] Lighthouse PWA score: 90+ recommended
- [ ] Test offline: Disconnect wifi, app should work
- [ ] Test on device: Android Chrome + iOS Safari

## Key Files

- `next.config.ts` - PWA configuration
- `public/manifest.json` - App manifest
- `public/sw.js` - Service worker (auto-generated)
- `app/layout.tsx` - Metadata and iOS meta tags
- `app/offline/page.tsx` - Offline fallback page

## Platform Testing

**Desktop Chrome**: Look for install icon in address bar  
**Android Chrome**: Menu > "Add to Home Screen"  
**iPhone Safari**: Share > "Add to Home Screen"

## Troubleshooting

**Build fails**: Always use `--webpack` flag  
**No install prompt**: Check HTTPS, run Lighthouse audit  
**Icons not showing**: Clear cache, reinstall PWA  
**SW not updating**: Unregister SW in DevTools, reload

## Need Help?

- Full guide: `PWA-IMPLEMENTATION-GUIDE.md`
- Icon help: `/public/icons/README.md`
- Web.dev PWA: https://web.dev/pwa/