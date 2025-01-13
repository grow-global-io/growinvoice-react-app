const env = process.env;

export const environment = {
	production: env.REACT_APP_PROD || false,
	baseUrl: "http://18.61.212.196",
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
};
