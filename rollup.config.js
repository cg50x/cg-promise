import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default [{
  input: 'src/cg-promise.ts',
  output: {
    file: 'dist/cg-promise.js',
    format: 'umd',
    name: 'CGPromise'
  },
  sourcemap: true,
  plugins: [
    sourcemaps(),
    typescript()
  ]
}, {
  input: 'src/cg-promise.ts',
  output: {
    file: 'dist/cg-promise.min.js',
    format: 'umd',
    name: 'CGPromise'
  },
  sourcemap: true,
  plugins: [
    sourcemaps(),
    typescript(),
    uglify()
  ]
}];