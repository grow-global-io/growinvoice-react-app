import { toast } from "react-toastify";
import i18next from "i18next";

export class AlertService {
	private static _instance: AlertService;

	public static get instance(): AlertService {
		if (!AlertService._instance) {
			AlertService._instance = new AlertService();
		}
		return AlertService._instance;
	}

	private constructor() {}

	public successMessage(message: string): void {
		toast.success(message);
	}

	public errorMessage(message: string): void {
		toast.error(message, {
			autoClose: 15000,
		});
	}

	public success(key: string, defaultValue?: string): void {
		toast.success(i18next.t(key, { defaultValue }));
	}

	public error(key: string, defaultValue?: string): void {
		toast.error(i18next.t(key, { defaultValue }), { autoClose: 15000 });
	}
}
