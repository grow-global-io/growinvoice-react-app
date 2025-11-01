const env = import.meta.env;

export const environment = {
	production: env.VITE_APP_PROD || false,
	baseUrl: env.VITE_APP_BASE_URL,
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
	firebase: {
		apiKey: env.VITE_FIREBASE_API_KEY,
		authDomain: `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
		projectId: env.VITE_FIREBASE_PROJECT_ID,
		storageBucket: `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
		messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
		appId: env.VITE_FIREBASE_APP_ID,
		measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
	},
	clientId: env.VITE_GOOGLE_CLIENT_ID,
};
