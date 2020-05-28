/**
 * This Webpack config is used for bundling files.
 */

const webpack = require("webpack");
const path = require("path");
const NODE_ENV = JSON.stringify(
    process.env.NODE_ENV ? process.env.NODE_ENV : "development"
);
const devtool = NODE_ENV == '"development"' ? "source-map" : undefined;

console.info("process.env.NODE_ENV", JSON.stringify(process.env.NODE_ENV));

module.exports = {
    devtool,
    entry: {
        app: ["./src/app.ts"],
        app2: ["./src/app2.ts"],
    },
    optimization: {
        minimize: true,
    },
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    externals: {},
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        }),
    ],
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by a TypeScript loader
            {
                test: /\.tsx?$/,
                use: ["awesome-typescript-loader"],
            },
        ],
    },
};
