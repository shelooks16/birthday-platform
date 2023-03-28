/**
 * Use Vite instead of tsc to correctly embed dependencies
 * imported from within monorepo into output.
 * This solves problem with firebase deployment.
 */
import { resolve } from "path";
import { defineConfig } from "vite";
import generatePackageJson from "rollup-plugin-generate-package-json";
import pckJson from "./package.json";

const externalDepsList = [];
const externalDepsObj = {};

Object.keys(pckJson.dependencies).forEach((packageName) => {
  if (pckJson.dependencies[packageName] !== "*") {
    externalDepsList.push(packageName);
    externalDepsObj[packageName] = pckJson.dependencies[packageName];
  }
});

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "functions",
      fileName: "index",
      formats: ["es", "umd"],
    },
    outDir: "build",

    rollupOptions: {
      external: externalDepsList,
      plugins: [
        generatePackageJson({
          baseContents: {
            name: pckJson.name,
            version: pckJson.version,
            engines: pckJson.engines,
            main: "./index.umd.js",
            module: "./index.js",
            exports: {
              ".": {
                import: "./index.js",
                require: "./index.umd.js",
              },
            },
          },
          additionalDependencies: externalDepsObj,
        }),
      ],
    },
  },
});
