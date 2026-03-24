import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules',
        'src/test/**',
        '**/*.d.ts',
        'src/lib/mailer.ts',
        'src/auth.ts',
        'src/auth.config.ts',
        'src/hooks/useAuth.ts',
        'src/hooks/useDriverLocation.ts',
        '**/*.config.*',
        '**/index.ts',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/providers.tsx',
        'src/app/globals.css',
        'src/app/page.module.css',
        'src/services/authService.test.ts',
        'src/components/dashboard/page-header.test.tsx',
        'src/components/dashboard/stat-card.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
