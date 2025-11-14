import { toast } from "react-toastify";
import i18next from "i18next";

// Export toast for dismissing messages
export { toast };

// Track recently shown messages to prevent duplicates
const recentMessages = new Map<string, number>();
const DEDUPLICATION_WINDOW = 3000; // 3 seconds

export class AlertService {
	private static _instance: AlertService;

	public static get instance(): AlertService {
		if (!AlertService._instance) {
			AlertService._instance = new AlertService();
		}
		return AlertService._instance;
	}

	private constructor() {}

	private shouldShowMessage(message: string): boolean {
		const normalizedMessage = message.trim().toLowerCase();
		const now = Date.now();
		const lastShown = recentMessages.get(normalizedMessage);

		// If message was shown recently, don't show it again
		if (lastShown && now - lastShown < DEDUPLICATION_WINDOW) {
			return false;
		}

		// Update the timestamp for this message
		recentMessages.set(normalizedMessage, now);

		// Clean up old entries (older than deduplication window)
		for (const [key, timestamp] of recentMessages.entries()) {
			if (now - timestamp > DEDUPLICATION_WINDOW) {
				recentMessages.delete(key);
			}
		}

		return true;
	}

	private translateServerMessage(message: string): string {
		switch (message) {
			case "Login successful":
				return i18next.t("auth.notifications.loginSuccess", {
					defaultValue: message,
				});
			case "Invalid password":
				return i18next.t("auth.errors.invalidPassword", {
					defaultValue: message,
				});
			case "User not found":
				return i18next.t("auth.errors.userNotFound", {
					defaultValue: message,
				});
			default:
				return message;
		}
	}

	public successMessage(message: string): void {
		const translatedMessage = this.translateServerMessage(message);
		if (this.shouldShowMessage(translatedMessage)) {
			toast.success(translatedMessage);
		}
	}

	public errorMessage(message: string): void {
		const translatedMessage = this.translateServerMessage(message);
		if (this.shouldShowMessage(translatedMessage)) {
			toast.error(translatedMessage, {
				autoClose: 15000,
			});
		}
	}

	public success(key: string, defaultValue?: string): void {
		toast.success(i18next.t(key, { defaultValue }));
	}

	public error(key: string, defaultValue?: string): void {
		toast.error(i18next.t(key, { defaultValue }), { autoClose: 15000 });
	}
}
