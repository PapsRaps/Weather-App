import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",

  devtool: "source-map",

  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "single",
  },
});