import Axios, { AxiosError, AxiosRequestConfig } from "axios";
import { http } from "../../shared/axios";
import { InterceptorService } from "../../shared/services/InterceptorService";

const interceptorService = new InterceptorService(http);
interceptorService.addRequestInterceptor().addResponseInterceptor();

export const authInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	const source = Axios.CancelToken.source();
	const promise = http({ ...config, cancelToken: source.token }).then(({ data }) => data);

	// @ts-ignore
	promise.cancel = () => {
		source.cancel("Query was cancelled by React Query");
	};

	return promise;
};

export default authInstance;

export interface ErrorType<Error> extends AxiosError<Error> {}
