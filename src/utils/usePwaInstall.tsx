import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

interface PWAInstallState {
	isInstallable: boolean;
	isInstalled: boolean;
	platform: "ios" | "android" | "desktop" | "unknown";
	canInstall: boolean;
	installMethod: "native" | "manual" | "none";
}

export const usePWAInstall = () => {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [state, setState] = useState<PWAInstallState>({
		isInstallable: false,
		isInstalled: false,
		platform: "unknown",
		canInstall: false,
		installMethod: "none",
	});

	useEffect(() => {
		const detectPlatform = (): "ios" | "android" | "desktop" | "unknown" => {
			const userAgent = navigator.userAgent.toLowerCase();

			if (/iphone|ipad|ipod/.test(userAgent)) {
				return "ios";
			} else if (/android/.test(userAgent)) {
				return "android";
			} else if (/windows|mac|linux/.test(userAgent) && !/mobile/.test(userAgent)) {
				return "desktop";
			}

			return "unknown";
		};

		const isIOSInstalled = (): boolean => {
			// Check if running in standalone mode on iOS
			return (window.navigator as any).standalone === true;
		};

		const isAndroidInstalled = (): boolean => {
			// Check if running in standalone mode on Android
			return (
				window.matchMedia("(display-mode: standalone)").matches ||
				document.referrer.includes("android-app://")
			);
		};

		const isIOSInstallable = (): boolean => {
			const platform = detectPlatform();
			if (platform !== "ios") return false;

			// Check if it's iOS Safari (not installed) and has PWA capabilities
			const isInSafari =
				/safari/.test(navigator.userAgent.toLowerCase()) && !(window.navigator as any).standalone;

			const isInIOSChrome =
				/crios/.test(navigator.userAgent.toLowerCase()) && !(window.navigator as any).standalone;

			return isInSafari || isInIOSChrome;
		};

		const platform = detectPlatform();

		// Check if already installed
		const isInstalled = platform === "ios" ? isIOSInstalled() : isAndroidInstalled();

		if (isInstalled) {
			setState({
				isInstallable: false,
				isInstalled: true,
				platform,
				canInstall: false,
				installMethod: "none",
			});
			return;
		}

		// Handle iOS
		if (platform === "ios") {
			const canInstall = isIOSInstallable();
			setState({
				isInstallable: canInstall,
				isInstalled: false,
				platform: "ios",
				canInstall,
				installMethod: canInstall ? "manual" : "none",
			});
			return;
		}

		// Handle Android/Desktop with beforeinstallprompt
		const handleBeforeInstallPrompt = (e: Event) => {
			console.log("beforeinstallprompt event fired");
			e.preventDefault();
			const promptEvent = e as BeforeInstallPromptEvent;
			setDeferredPrompt(promptEvent);

			setState((prev) => ({
				...prev,
				isInstallable: true,
				canInstall: true,
				installMethod: "native",
			}));
		};

		const handleAppInstalled = () => {
			console.log("App installed");
			setState((prev) => ({
				...prev,
				isInstalled: true,
				isInstallable: false,
				canInstall: false,
				installMethod: "none",
			}));
			setDeferredPrompt(null);
		};

		// Set initial state for non-iOS platforms
		setState({
			isInstallable: false,
			isInstalled: false,
			platform,
			canInstall: false,
			installMethod: "none",
		});

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		// Cleanup
		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const installApp = async (): Promise<"accepted" | "dismissed" | "unavailable" | "manual"> => {
		// iOS manual installation
		if (state.platform === "ios") {
			return "manual"; // Caller should show instructions
		}

		// Android/Desktop native installation
		if (!deferredPrompt) {
			return "unavailable";
		}

		try {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			setDeferredPrompt(null);
			setState((prev) => ({
				...prev,
				isInstallable: false,
				canInstall: false,
				installMethod: "none",
			}));

			return outcome;
		} catch (error) {
			console.error("Error during installation:", error);
			return "unavailable";
		}
	};

	const getIOSInstallInstructions = (): string[] => {
		const userAgent = navigator.userAgent.toLowerCase();

		if (/safari/.test(userAgent) && !/crios/.test(userAgent)) {
			// Safari
			return [
				"Tap the Share button",
				'Scroll down and tap "Add to Home Screen"',
				'Tap "Add" to install the app',
			];
		} else if (/crios/.test(userAgent)) {
			// Chrome on iOS
			return [
				"Tap the menu (⋯) in the top right",
				'Tap "Add to Home Screen"',
				'Tap "Add" to install the app',
			];
		}

		return [
			"Use the browser menu",
			'Look for "Add to Home Screen" option',
			"Follow the prompts to install",
		];
	};

	return {
		...state,
		installApp,
		getIOSInstallInstructions,
		deferredPrompt: !!deferredPrompt,
	};
};
