import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
// import livereload from "rollup-plugin-livereload";
// import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
// import css from "rollup-plugin-css-only";
// import { injectManifest } from "rollup-plugin-workbox";

const production = !process.env.ROLLUP_WATCH;

// function serve() {
//   let server;
//
//   function toExit() {
//     if (server) server.kill(0);
//   }
//
//   return {
//     writeBundle() {
//       if (server) return;
//       server = require("child_process").spawn(
//         "npm",
//         ["run", "start", "--", "--dev"],
//         {
//           stdio: ["ignore", "inherit", "inherit"],
//           shell: true,
//         }
//       );
//
//       process.on("SIGTERM", toExit);
//       process.on("exit", toExit);
//     },
//   };
// }

export default {
  input: "src/main.ts",
  output: {
    sourcemap: 'inline',
    sourcemapExcludeSources: production,
    format: "cjs",
    exports: 'default',
    dir: "."
  },
  external: ['obsidian'], // so it's not included
  plugins: [
    typescript(),
    svelte({
      emitCss: false,
      preprocess: sveltePreprocess(),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      // dedupe: ["svelte"],
    }),
    commonjs(),

    // injectManifest({
    //   swSrc: "src/sw.js",
    //   swDest: "public/build/sw.js",
    //   globDirectory: "/asdf",
    // }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    // !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    // !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    // production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
