import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    // 프로덕션 빌드에서만 console 제거
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
