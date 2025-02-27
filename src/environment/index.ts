const env = process.env;
export const environment = {
	production: env.REACT_APP_PROD || false,
	baseUrl: env.REACT_APP_BASE_URL,
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
};
