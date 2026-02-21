import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
  const base = '/'

  return {
    base,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          name: 'Pausas Activas - SST Colombia',
          short_name: 'Pausas Activas',
          description:
            'Pausas activas laborales para reducir fatiga, mejorar bienestar y apoyar cumplimiento SST en Colombia.',
          theme_color: '#1e293b',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'any',
          scope: base,
          start_url: base,
          lang: 'es-CO',
          categories: ['health', 'productivity'],
          icons: [
            { src: `${base}icons/icon-72x72.png`, sizes: '72x72', type: 'image/png' },
            { src: `${base}icons/icon-96x96.png`, sizes: '96x96', type: 'image/png' },
            { src: `${base}icons/icon-128x128.png`, sizes: '128x128', type: 'image/png' },
            { src: `${base}icons/icon-144x144.png`, sizes: '144x144', type: 'image/png' },
            { src: `${base}icons/icon-152x152.png`, sizes: '152x152', type: 'image/png' },
            { src: `${base}icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${base}icons/icon-384x384.png`, sizes: '384x384', type: 'image/png' },
            { src: `${base}icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
            {
              src: `${base}icons/maskable-icon-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
