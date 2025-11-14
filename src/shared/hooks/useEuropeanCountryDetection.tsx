import { useState, useEffect } from "react";

// List of European Union countries and other European countries
const EUROPEAN_COUNTRIES = [
	"Albania",
	"Andorra",
	"Armenia",
	"Austria",
	"Azerbaijan",
	"Belarus",
	"Belgium",
	"Bosnia and Herzegovina",
	"Bulgaria",
	"Croatia",
	"Cyprus",
	"Czech Republic",
	"Denmark",
	"Estonia",
	"Finland",
	"France",
	"Georgia",
	"Germany",
	"Greece",
	"Hungary",
	"Iceland",
	"Ireland",
	"Italy",
	"Latvia",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Malta",
	"Moldova",
	"Monaco",
	"Montenegro",
	"Netherlands",
	"North Macedonia",
	"Norway",
	"Poland",
	"Portugal",
	"Romania",
	"Russia",
	"San Marino",
	"Serbia",
	"Slovakia",
	"Slovenia",
	"Spain",
	"Sweden",
	"Switzerland",
	"Ukraine",
	"United Kingdom",
	"Vatican City",
].map((country) => country.toLowerCase());

export const useEuropeanCountryDetection = () => {
	const [isEuropeanCountry, setIsEuropeanCountry] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const detectCountry = async () => {
			try {
				const res = await fetch("https://ipapi.co/json");
				const json = (await res.json()) as { country_name?: string };
				if (cancelled) return;

				const countryName = (json?.country_name || "").toLowerCase();
				const isEuropean = EUROPEAN_COUNTRIES.includes(countryName);

				setIsEuropeanCountry(isEuropean);
				setIsLoading(false);
			} catch {
				if (!cancelled) {
					// Default to false (not European) on error
					setIsEuropeanCountry(false);
					setIsLoading(false);
				}
			}
		};

		detectCountry();

		return () => {
			cancelled = true;
		};
	}, []);

	return { isEuropeanCountry, isLoading };
};
