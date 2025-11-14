import { type AxiosInstance } from "axios";
import { AlertService } from "./AlertService";
import { LoaderService } from "./LoaderService";
import { toastWithButton } from "./toastWithButton";
import i18next from "i18next";
// import { RsaService } from "./RsaService";

// Helper function to translate known backend messages
const translateBackendMessage = (message: string): string => {
	// Map known backend messages to translation keys
	const messageMap: Record<string, string> = {
		"Invoices sent to customers successfully": i18next.t("invoice.invoicesSentSuccessfully", {
			defaultValue: "Invoices sent to customers successfully",
		}),
	};

	return messageMap[message] || message;
};

// Flag to suppress success messages during receipt creation
let suppressSuccessMessages = false;

export const setSuppressSuccessMessages = (value: boolean): void => {
	suppressSuccessMessages = value;
};

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
					const message = response?.data?.message;
					if (message) {
						// Normalize message for comparison (trim and lowercase)
						const normalizedMessage = message.trim().toLowerCase();

						// Always filter out messages that shouldn't be shown (case-insensitive)
						// "Login successful" should never appear as a toast - it's handled in the login flow
						const alwaysExcludedMessages = [
							"limit exceeded. please upgrade your plan to add more features.",
							"login successful",
						];

						// Check if message should always be excluded
						const shouldAlwaysExclude = alwaysExcludedMessages.some(
							(excluded) => normalizedMessage === excluded.trim().toLowerCase(),
						);

						// Only show message if:
						// 1. It's not in the always-excluded list
						// 2. Success messages are not suppressed (e.g., during receipt creation)
						if (!shouldAlwaysExclude && !suppressSuccessMessages) {
							const translatedMessage = translateBackendMessage(message);
							AlertService.instance.successMessage(translatedMessage);
						}
					}
				}
				LoaderService.instance.hideLoader();
				return response;
			},
			(error) => {
				// Skip CanceledError - these are expected when React Query cancels requests
				if (error.code === "ERR_CANCELED" || error.message === "canceled") {
					return Promise.reject(error);
				}

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
