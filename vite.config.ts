import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Plugin to suppress HMR update logs
const suppressHmrLogs = (): Plugin => {
	return {
		name: "suppress-hmr-logs",
		configureServer(server: ViteDevServer) {
			server.ws.on("connection", (socket) => {
				socket.on("message", (payload: unknown) => {
					if (typeof payload === "string" && payload.includes("update")) {
						// Suppress HMR update messages
						return;
					}
				});
			});
		},
	};
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		suppressHmrLogs(),
		VitePWA({
			manifest: false,
			registerType: "autoUpdate",
			workbox: {
				// Pre-cache app shell files
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
				maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB
				runtimeCaching: [
					{
						// API: NetworkFirst (5 min expiry, 10s timeout)
						urlPattern: new RegExp("^/api/.*"),
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 5 * 60, // 5 minutes
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						// Navigation: NetworkFirst (24h expiry, 10s timeout)
						urlPattern: ({ request }) => request.mode === "navigate",
						handler: "NetworkFirst",
						options: {
							cacheName: "pages-cache",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 24 * 60 * 60, // 24 hours
							},
						},
					},
					{
						// Images: CacheFirst (30 day expiry)
						urlPattern: ({ request }) => request.destination === "image",
						handler: "CacheFirst",
						options: {
							cacheName: "image-cache",
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
							},
						},
					},
					{
						// CSS/JS: StaleWhileRevalidate (7 day expiry)
						urlPattern: ({ request }) =>
							request.destination === "style" || request.destination === "script",
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "static-resources",
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
							},
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			// Alias @/ to /src
			"@api/services": path.resolve(__dirname, "src/api/services/auth"),
			"@assets": path.resolve(__dirname, "src/assets"),
			"@enviroment": path.resolve(__dirname, "src/environment"),
			"@features": path.resolve(__dirname, "src/features"),
			"@layout": path.resolve(__dirname, "src/layout"),
			"@pages": path.resolve(__dirname, "src/pages"),
			"@shared": path.resolve(__dirname, "src/shared"),
			"@store": path.resolve(__dirname, "src/store"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: process.env.VITE_BASE_URL || "http://localhost:5001",
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path,
			},
		},
		hmr: {
			overlay: false,
		},
	},
	build: {
		rollupOptions: {
			output: {
				format: "es", // Ensures the build output format is ES module
			},
		},
	},
});
