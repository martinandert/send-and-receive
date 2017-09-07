import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',

    plugins: [
      buble(),
    ],

    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'sar',
      sourcemap: true,
    }
  }, {
    input: 'src/index.js',

    output: {
      file: pkg.main,
      format: 'cjs',
    }
  }, {
    input: 'src/index.js',

    output: {
      file: pkg.module,
      format: 'es',
    }
  }
]

//   // browser-friendly UMD build
//   {
//     entry: 'src/main.js',
//     dest: pkg.browser,
//     format: 'umd',
//     moduleName: 'howLongUntilLunch',
//     plugins: [
//       resolve(), // so Rollup can find `ms`
//       commonjs() // so Rollup can convert `ms` to an ES module
//     ]
//   },

//   // CommonJS (for Node) and ES module (for bundlers) build.
//   // (We could have three entries in the configuration array
//   // instead of two, but it's quicker to generate multiple
//   // builds from a single configuration where possible, using
//   // the `targets` option which can specify `dest` and `format`)
//   {
//     entry: 'src/main.js',
//     external: ['ms'],
//     targets: [
//       { dest: pkg.main, format: 'cjs' },
//       { dest: pkg.module, format: 'es' }
//     ]
//   }
// ];
