const esbuild = require('esbuild');
const process = require('process');

const devOptions = {
  sourcemap: true,
  watch: true,
};

const prodOptions = {
  minify: true,
  treeShaking: true,
};

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'docs/bundle.js',
    bundle: true,
    sourcemap: true,
    watch: true,
  })
  .catch(() => {
    process.exit(1);
  });
