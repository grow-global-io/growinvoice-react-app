const fs = require("fs");

const commonOutputOptions = {
	mode: "tags",
	client: "react-query",
	mock: false,
};

const commonInputOptions = {};

const commonHooks = {
	afterAllFilesWrite: "yarn run format",
};

const BASE_URL = "http://192.248.152.35";

const AUTH_API = `${BASE_URL}`;
const instanceTemplate = `import Axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { http } from "../../shared/axios";
import { InterceptorService } from "../../shared/services/InterceptorService";

const interceptorService = new InterceptorService(http);
interceptorService.addRequestInterceptor().addResponseInterceptor();

export const CUSTOM_INSTANCE = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = http({ ...config, cancelToken: source.token }).then(
    ({ data }) => data,
  );

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };

  return promise;
};

export default CUSTOM_INSTANCE;

export interface ErrorType<Error> extends AxiosError<Error> {}
`;

const services = [
	{ name: "auth", baseUrl: AUTH_API },
];

// Create .env
fs.writeFileSync("./.env", `VITE_BASE_URL=${BASE_URL}`);

// Create Instances folder
fs.mkdirSync("./src/api/instances", { recursive: true });
services.forEach((service) => {
	let newTemplate = instanceTemplate.replace(/BASE_URL/g, "environment.baseUrl");
	newTemplate = newTemplate.replace(/CUSTOM_INSTANCE/g, `${service.name}Instance`);
	fs.writeFileSync(`./src/api/instances/${service.name}Instance.ts`, newTemplate);
	fs.rmSync(`./src/api/services/${service.name}`, { force: true, recursive: true });
});

const oravalInputs = services.map((service) => {
	return {
		[service.name]: {
			output: {
				...commonOutputOptions,
				target: `src/api/services/${service.name}/index.ts`,
				schemas: `src/api/services/${service.name}/models`,
				override: {
					mutator: {
						path: `src/api/instances/${service.name}Instance.ts`,
						name: `${service.name}Instance`,
					},
				},
			},
			input: {
				...commonInputOptions,
				target: `${service.baseUrl}/api-docs.json`,
			},
			hooks: {
				...commonHooks,
			},
		},
	};
});

const oravalConfig = oravalInputs.reduce((acc, input) => {
	return { ...acc, ...input };
}, {});

fs.writeFileSync("./orval.config.cjs", `module.exports = ${JSON.stringify(oravalConfig, null, 2)}`);
