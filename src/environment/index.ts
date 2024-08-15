const env = process.env;

export const environment = {
	production: env.REACT_APP_PROD || false,
	baseUrl: "http://192.248.152.35",
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
};
