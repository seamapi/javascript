import { defineConfig } from 'tsup'

export default defineConfig({
  tsconfig: 'tsconfig.build.json',
  entry: ['src/index.ts'],
  format: ['cjs'],
  treeshake: true,
  dts: true,
  sourcemap: true,
  clean: true,
})
