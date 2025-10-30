import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

// Initialize i18n first with fallback, then detect country
i18n
	.use(HttpApi)
	.use(initReactI18next)
	.init({
		supportedLngs: ["en", "hi", "fi"],
		fallbackLng: "en",
		lng: "en", // Start with English as default
		backend: {
			loadPath: "/locales/{{lng}}/translation.json",
		},
		interpolation: { escapeValue: false },
	});

// Detect country and change language after initialization
const detectAndSetLanguage = async () => {
	try {
		if (typeof window === "undefined") return;
		const res = await fetch("https://ipapi.co/json");
		if (!res.ok) throw new Error("ipapi request failed");
		const data = await res.json();
		const countryName = (data?.country_name as string) || "";
		const detectedLang = countryName.toLowerCase() === "spain" ? "fi" : "en";

		// Only change if different from current language
		if (i18n.language !== detectedLang) {
			await i18n.changeLanguage(detectedLang);
		}
	} catch (_e) {
		// Keep default language on error
	}
};

// Run detection after a short delay to ensure i18n is ready
setTimeout(detectAndSetLanguage, 100);

export default i18n;
