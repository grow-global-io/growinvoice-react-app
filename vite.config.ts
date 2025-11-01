import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
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
				target: process.env.VITE_BASE_URL,
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path,
			},
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
