import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      recharts: path.resolve('./node_modules/recharts'),
      'lucide-react': path.resolve('./node_modules/lucide-react'),
      clsx: path.resolve('./node_modules/clsx'),
      'tailwind-merge': path.resolve('./node_modules/tailwind-merge'),
    },
  },
})