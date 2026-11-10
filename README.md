# JAS — Jai Ambe Sarees

Premium saree storefront built with Next.js, React, TypeScript, Tailwind CSS v4, and GSAP.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Other scripts: `npm run lint`, `npm run build`, and `npm start`.

## Brand assets

- `public/assets/logo/` contains the separated artwork used by the animated intro.
- `public/logo-mark.png` is used in the header and footer.
- `public/logo-paper.png` is the textured full logo artwork used on the story panel.
- `public/textures/handmade-paper.svg` provides the khaki paper grain.

The intro opens both eyes together, reveals J, A, and S from left to right, and animates the saree pallu independently. It respects reduced-motion preferences and includes a skip control.

## Store data

`app/data/products.ts` intentionally has no demo product records. Connect the catalogue and checkout UI to the store backend before launch.
