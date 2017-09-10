import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',

    plugins: [
      buble(),
    ],

    output: {
      file: pkg.main,
      format: 'umd',
      name: 'sar',
      sourcemap: true,
    }
  }, {
    input: 'src/index.js',

    output: {
      file: pkg.module,
      format: 'es',
    }
  }
];
