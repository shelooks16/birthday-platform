/**
 * Use Vite instead of tsc to correctly embed dependencies
 * imported from within monorepo into output.
 * This solves problem with firebase deployment.
 */
import { resolve } from 'path';
import { defineConfig } from 'vite';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pckJson from './package.json';

const externalDepsList = [
  'node:path',
  'firebase-admin/app',
  'firebase-admin/firestore'
];
const externalDepsObj = {};

Object.keys(pckJson.dependencies).forEach((packageName) => {
  if (pckJson.dependencies[packageName] !== '*') {
    externalDepsList.push(packageName);
    externalDepsObj[packageName] = pckJson.dependencies[packageName];
  }
});

const isProd = process.env.FUNCTIONS_BUILD_MODE === 'production';
const isDev = !isProd;

export default defineConfig({
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
          additionalDependencies: externalDepsObj
        })
      ],
      output: {
        preserveModules: isProd,
        inlineDynamicImports: isDev
      }
    }
  }
});
