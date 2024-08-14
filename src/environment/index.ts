const env = process.env;

export const environment = {
	production: env.REACT_APP_PROD || false,
	baseUrl: "http://funtofun.site",
	isTrueProd: env.VITE_APP_ENVIRONMENT === "production",
};
