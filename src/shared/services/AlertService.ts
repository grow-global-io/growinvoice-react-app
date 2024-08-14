import { toast } from "react-toastify";

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
}
