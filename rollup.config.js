import buble from 'rollup-plugin-buble';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',

    plugins: [
      typescript(),
      buble(),
    ],

    output: {
      file: pkg.main,
      format: 'umd',
      name: 'sar',
      sourcemap: true,
    }
  }, {
    input: 'src/index.ts',

    plugins: [
      typescript(),
    ],

    output: {
      file: pkg.module,
      format: 'es',
    }
  }
];
