import { AxiosInstance } from "axios";
import { AlertService } from "./AlertService";
import { LoaderService } from "./LoaderService";
import { toastWithButton } from "./toastWithButton";
import i18next from "i18next";
// import { RsaService } from "./RsaService";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export class InterceptorService {
	public constructor(private _axiosInstance: AxiosInstance) {}

	public addRequestInterceptor(): this {
		this._axiosInstance.interceptors.request.use(
			(config) => {
				if (["post", "put", "delete", "patch"].includes(config.method || "")) {
					LoaderService.instance.showLoader();
				}
				const authToken = localStorage.getItem("authToken");
				if (authToken) {
					config.headers["Authorization"] = `Bearer ${authToken}`;
				}

				// Attach preferred language for server-side localization (e.g., invoice templates)
				config.headers["Accept-Language"] = i18next.language || "en";

				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);
		return this;
	}

	public addResponseInterceptor(): this {
		this._axiosInstance.interceptors.response.use(
			(response) => {
				if (["post", "put", "delete", "patch"].includes(response.config.method || "")) {
					if (
						response?.data?.message &&
						response?.data?.message !==
							"Limit exceeded. Please upgrade your plan to add more features."
					) {
						AlertService.instance.successMessage(response.data.message);
					}
				}
				LoaderService.instance.hideLoader();
				return response;
			},
			(error) => {
				console.error("[InterceptorService] error", error);
				// check the error status code
				LoaderService.instance.hideLoader();
				if (![401, 404, 500].includes(error.response?.status || 0)) {
					const message = error.response?.data?.message;
					if (
						message &&
						message !== "Limit exceeded. Please upgrade your plan to add more features."
					) {
						AlertService.instance.errorMessage(message);
					}
					if (
						error.response?.data?.message ===
						"Limit exceeded. Please upgrade your plan to add more features."
					) {
						console.log("Limit exceeded. Please upgrade your plan to add more features.");
						toastWithButton();
					}
				}

				if (
					error.response?.status === 401 &&
					(error.response?.data?.message === "jwt expired" ||
						error?.response?.data?.message === "No auth token")
				) {
					AlertService.instance.errorMessage("Session expired, logging you out");

					new Promise((resolve) => setTimeout(() => resolve(true), 2000)).then(() => {
						window.location.reload();
					});
				}

				LoaderService.instance.hideLoader();
				return Promise.reject(error);
			},
		);
		return this;
	}
}
