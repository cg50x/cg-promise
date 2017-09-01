import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'index.ts',
  output: {
  	file: 'dist/cg-promise.js',
  	format: 'umd',
  	name: 'CGPromise'
  },
  plugins: [
    typescript()
  ]
};