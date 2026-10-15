import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'Public',
  server: { port: 3000 },
  plugins: [tailwindcss(), tanstackStart({ srcDirectory: 'src' }), nitro({ preset: 'node-server' }), react()],
})
