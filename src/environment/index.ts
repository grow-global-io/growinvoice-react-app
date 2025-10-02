const env = process.env;
export const environment = {
	production: env.REACT_APP_PROD || false,
	baseUrl: env.REACT_APP_BASE_URL,
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
	firebase: {
		apiKey: env.REACT_APP_FIREBASE_API_KEY,
		authDomain: `${env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
		projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
		storageBucket: `${env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
		messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
		appId: env.REACT_APP_FIREBASE_APP_ID,
		measurementId: env.REACT_APP_FIREBASE_MEASUREMENT_ID,
	},
	clientId: env.REACT_APP_GOOGLE_CLIENT_ID,
};
