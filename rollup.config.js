import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";
import resolve from "@rollup/plugin-node-resolve";

import pkg from "./package.json";

export default {
    input: "src/index.js",
    output: { file: pkg.main, format: "iife", name: "pdfTools" },
    plugins: [
        resolve({ preferBuiltins: false, browser: true }),
        commonjs(),
        babel({
            babelrc: false,
            presets: [["@babel/preset-env", { modules: false }]],
        }),
        nodePolyfills(),
    ],
};
