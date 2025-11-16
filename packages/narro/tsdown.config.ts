import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: './src/index.ts',
    unbundle: true,
    dts: true,
    format: 'esm',
  },
  {
    entry: './src/inline.ts',
    unbundle: false,
    dts: true,
    format: 'esm',
    outputOptions: {
      inlineDynamicImports: true,
    },
  },
])
