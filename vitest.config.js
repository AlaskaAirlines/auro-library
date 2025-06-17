import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.spec.{js,jsx,ts,tsx}'],
    exclude: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/node_modules/**',
      '**/dist/**'
    ]
  }
});
