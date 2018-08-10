const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

let config = {
    target: "web",
    mode: "development",
    entry: {
        autosave: "./src/autosave.ts",
        settingsRenderer: "./src/settingsRenderer.ts"
    },
    output: {
        filename: "src/[name].js",
        libraryTarget: "amd"
    },
    externals: [
        /^VSS\/.*/, /^TFS\/.*/, /^q$/
    ],
    resolve: {
        extensions: [
            ".webpack.js",
            ".web.js",
            ".ts",
            ".tsx",
            ".js"
        ],
        moduleExtensions: ["-loader"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.s?css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.(otf|eot|svg|ttf|woff|woff2|gif)(\?.+)?$/,
                use: "url-loader?limit=4096&name=[name].[ext]"
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        new CopyWebpackPlugin([
            { from: "./node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js", to: "libs/VSS.SDK.min.js" },
            { from: "./src/*.html", to: "./" },
            { from: "./img", to: "img" },
            { from: "./vss-extension.json", to: "vss-extension.json" },
            { from: "./README.md", to: "README.md" }
        ])
    ]
};

module.exports = (env, argv) => {
    if (argv && argv.mode === "production") {
        config.devtool = "none";
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: "static"
        }));
        config.plugins.push(...[
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.optimize.ModuleConcatenationPlugin()
        ]);
    }

    return config;
};