const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
  entry: "./src/index.ts",
  output: { publicPath: "auto", clean: true },
  mode: "development",
  devServer: { port: 3003, historyApiFallback: true, hot: true },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
  resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
  plugins: [
    new ModuleFederationPlugin({
      name: "checkout",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/CheckoutApp.tsx" },
      remotes: {
        host: `host@${
          process.env.HOST_URL ?? "http://localhost:3000"
        }/remoteEntry.js`,
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
        "react-router-dom": {
          singleton: true,
          requiredVersion: deps["react-router-dom"],
        },
        zustand: { singleton: true, requiredVersion: deps["zustand"] },
        "@mfe/contracts": {
          singleton: true,
          requiredVersion: deps["@mfe/contracts"],
        },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],
};
