import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'functions/node_modules/**', 'functions/lib/**', 'functions/coverage/**', 'functions/tests/**', 'dist/**', 'coverage/**', '.firebase/**', 'Archive/**', 'legacy/**'],
  },
})
