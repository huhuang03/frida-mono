import typescript from '@rollup/plugin-typescript'
import eslint from '@rbnlffl/rollup-plugin-eslint'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'umd',
    name: 'FridaMono'
  },
  plugins: [
    eslint({
      throwOnError: true
    }),
    typescript()
  ]
}
