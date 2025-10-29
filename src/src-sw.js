/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// Import Workbox from CDN
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

// Log to confirm custom SW is loaded
console.log("Custom service worker loaded with Workbox!");

workbox.setConfig({
	debug: false,
});

// Enable navigation preload
workbox.navigationPreload.enable();

// Precache files (Workbox will inject the manifest here)
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Network First strategy for API calls
workbox.routing.registerRoute(
	new RegExp("/api/"),
	new workbox.strategies.NetworkFirst({
		cacheName: "api-cache",
		plugins: [
			new workbox.expiration.ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 5 * 60, // 5 minutes
			}),
			new workbox.cacheableResponse.CacheableResponsePlugin({
				statuses: [0, 200],
			}),
		],
		networkTimeoutSeconds: 10,
	}),
);

// Network First for navigation requests (HTML pages)
workbox.routing.registerRoute(
	({ request }) => request.mode === "navigate",
	new workbox.strategies.NetworkFirst({
		cacheName: "pages-cache",
		plugins: [
			new workbox.expiration.ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 24 * 60 * 60, // 24 hours
			}),
		],
		networkTimeoutSeconds: 10,
	}),
);

// Cache First for images
workbox.routing.registerRoute(
	({ request }) => request.destination === "image",
	new workbox.strategies.CacheFirst({
		cacheName: "image-cache",
		plugins: [
			new workbox.expiration.ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
			}),
		],
	}),
);

// Stale While Revalidate for CSS and JS
workbox.routing.registerRoute(
	({ request }) => request.destination === "style" || request.destination === "script",
	new workbox.strategies.StaleWhileRevalidate({
		cacheName: "static-resources",
		plugins: [
			new workbox.expiration.ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
			}),
		],
	}),
);

// Listen for skip waiting message
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
