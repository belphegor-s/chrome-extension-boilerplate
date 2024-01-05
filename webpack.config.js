const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const getHtmlPlugins = (chunks) => {
	return chunks.map(
		(chunk) =>
			new HtmlPlugin({
				title: "LinkedGPT",
				filename: `${chunk}.html`,
				chunks: [chunk],
			})
	);
};

module.exports = {
	entry: {
		popup: path.resolve("src/popup/index.tsx"),
		options: path.resolve("src/options/index.tsx"),
		background: path.resolve("src/background/background.ts"),
		contentScript: path.resolve("src/contentScript/index.tsx"),
	},
	module: {
		rules: [
			{
				use: "ts-loader",
				test: /\.tsx?$/,
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: "postcss-loader", // postcss loader needed for tailwindcss
						options: {
							postcssOptions: {
								ident: "postcss",
								plugins: [tailwindcss, autoprefixer],
							},
						},
					},
				],
			},
			{
				type: "asset/resource",
				test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve("src/static"),
					to: path.resolve("build"),
				},
			],
		}),
		...getHtmlPlugins(["popup", "options"]),
	],
	resolve: {
		extensions: [".tsx", ".js", ".ts"],
	},
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "build"),
	},
	optimization: {
		splitChunks: {
			chunks(chunk) {
				return chunk.name !== "contentScript";
			},
		},
	},
};
