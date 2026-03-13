import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'music/*.mp3', 'HIGHSCORE.md', 'og-image.png'],
      manifest: {
        id: '/',
        name: 'Halma',
        short_name: 'Halma',
        description: 'Sternhalma gegen die KI — schnell, taktisch, offline spielbar.',
        theme_color: '#0f0f23',
        background_color: '#0f0f23',
        display: 'standalone',
        orientation: 'any',
        lang: 'de',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screenshots/screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Halma — Sternhalma gegen die KI' },
          { src: 'screenshots/screenshot-mobile.png', sizes: '390x844', type: 'image/png', label: 'Halma auf dem Smartphone' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,md}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (Musik!)
      },
    }),
  ],
})
