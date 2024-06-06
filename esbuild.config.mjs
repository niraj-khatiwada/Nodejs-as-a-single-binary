/* eslint-disable import/no-extraneous-dependencies */
/** @type{import("esbuild").BuildOptions} */

import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: 'bundle/bundle.js',
    platform: 'node',
    target: ['node20.0'],
    logLevel: 'info',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    external: ['better-sqlite3'],
  })
  .catch(() => process.exit(1))
