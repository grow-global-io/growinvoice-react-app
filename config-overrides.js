const {
	override,
	addDecoratorsLegacy,
	disableEsLint,
	addBundleVisualizer,
	addWebpackAlias,
	useEslintRc,
} = require("customize-cra");
const { InjectManifest } = require("workbox-webpack-plugin");
const path = require("path");

const addWorkboxInjectManifest = () => (config, env) => {
	// env might be undefined, so check NODE_ENV directly
	const isProduction = process.env.NODE_ENV === "production";

	if (isProduction) {
		// Remove any existing workbox plugins
		config.plugins = config.plugins.filter(
			(plugin) =>
				plugin.constructor.name !== "GenerateSW" && plugin.constructor.name !== "InjectManifest",
		);

		const swSrcPath = path.resolve(__dirname, "src/src-sw.js");

		// Check if file exists
		const fs = require("fs");
		if (!fs.existsSync(swSrcPath)) {
			return config;
		} else {
			console.log("Found src-sw.js");
		}

		// Add InjectManifest plugin
		const workboxPlugin = new InjectManifest({
			swSrc: swSrcPath,
			swDest: "service-worker.js",
			exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
			maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
		});

		config.plugins.push(workboxPlugin);
	} else {
		console.log("Not in production mode, skipping Workbox");
	}

	return config;
};

module.exports = override(
	// enable legacy decorators babel plugin
	addDecoratorsLegacy(),

	// disable eslint in webpack
	disableEsLint(),

	// add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
	process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer(),

	// add an alias for "ag-grid-react" imports
	addWebpackAlias({
		["@api/services"]: path.resolve(__dirname, "src/api/services/auth"),
		["@assets"]: path.resolve(__dirname, "src/assets"),
		["@enviroment"]: path.resolve(__dirname, "src/environment"),
		["@features"]: path.resolve(__dirname, "src/features"),
		["@layout"]: path.resolve(__dirname, "src/layout"),
		["@pages"]: path.resolve(__dirname, "src/pages"),
		["@shared"]: path.resolve(__dirname, "src/shared"),
		["@store"]: path.resolve(__dirname, "src/store"),
	}),

	addWorkboxInjectManifest(),
);
