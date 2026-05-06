import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'FutbolBase',
        short_name: 'FutbolBase',
        description: 'La red social del fútbol base',
        theme_color: '#050D1A',
        background_color: '#050D1A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        screenshots: [
          { src: '/screenshots/1-landing.png',   sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Landing — IA + RAG + logros' },
          { src: '/screenshots/2-home.png',      sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Home — feed, stories y ticker en vivo' },
          { src: '/screenshots/3-profile.png',   sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Perfil — tarjeta FIFA y Coach AI' },
          { src: '/screenshots/4-league.png',    sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Liga — logros y leaderboard' },
          { src: '/screenshots/5-community.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Comunidad — equipos y duelos' },
        ],
      },
    }),
  ],
})
