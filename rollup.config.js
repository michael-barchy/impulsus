// @ts-nocheck
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/impulsus.ts',
  output: {
    file: 'impulsus.js',
    format: 'iife',
    sourcemap: false,
    strict: false
  },
  plugins: [
    typescript({
      target: 'es5'
    })
  ]
};