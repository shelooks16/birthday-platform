/**
 * Use Vite instead of tsc to correctly embed dependencies
 * imported from within monorepo into output.
 * This solves problem with firebase deployment.
 */
import { resolve } from 'path';
import { defineConfig } from 'vite';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pckJson from './package.json';

// dependencies which must NOT be packaged along with functions
const externalDepsList = ['node:path', /firebase-admin/, /@formatjs/];
// dependencies that functions use but they are not listed in package.json
const additionalDependencies = {
  '@formatjs/intl-datetimeformat': '^6.8.0',
  '@formatjs/intl-getcanonicallocales': '^2.2.0',
  '@formatjs/intl-locale': '^3.3.0',
  '@formatjs/intl-numberformat': '^8.5.0',
  '@formatjs/intl-pluralrules': '^5.2.2',
  '@formatjs/intl-relativetimeformat': '^11.2.2'
};

Object.keys(pckJson.dependencies).forEach((packageName) => {
  if (pckJson.dependencies[packageName] !== '*') {
    externalDepsList.push(packageName);
    additionalDependencies[packageName] = pckJson.dependencies[packageName];
  }
});

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isDev = !isProd;

  return {
    publicDir: 'env',
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'functions',
        fileName: 'index',
        formats: ['cjs']
      },
      outDir: 'build',
      copyPublicDir: isDev,

      rollupOptions: {
        external: externalDepsList,
        plugins: [
          generatePackageJson({
            baseContents: {
              name: pckJson.name,
              version: pckJson.version,
              engines: pckJson.engines,
              main: './index.js'
            },
            additionalDependencies
          })
        ],
        output: {
          preserveModules: isProd,
          inlineDynamicImports: isDev
        }
      }
    }
  };
});
