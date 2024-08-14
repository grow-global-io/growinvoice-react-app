const {
	override,
	addDecoratorsLegacy,
	disableEsLint,
	addBundleVisualizer,
	addWebpackAlias,
	adjustWorkbox,
} = require("customize-cra");
const path = require("path");

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

	// adjust the underlying workbox
	adjustWorkbox((wb) =>
		Object.assign(wb, {
			skipWaiting: true,
			exclude: (wb.exclude || []).concat("index.html"),
		}),
	),
);
