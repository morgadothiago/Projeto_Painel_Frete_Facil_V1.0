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
        'src/lib/rate-limit.ts',
        'src/lib/utils.ts',
        'src/lib/db.ts',
        'src/services/mock/**/*.ts', 
        'src/config/**/*.ts',
        'src/hooks/use-mobile.ts',
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
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
