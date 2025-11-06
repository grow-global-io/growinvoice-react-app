import { create } from "zustand";

type IpData = {
	currency?: string;
	country_name?: string;
	region?: string;
	city?: string;
	postal?: string;
};

interface GeoPrefetchState {
	loaded: boolean;
	loading: boolean;
	ipData?: IpData;
	prefetch: () => Promise<void>;
}

export const useGeoPrefetchStore = create<GeoPrefetchState>((set, get) => ({
	loaded: false,
	loading: false,
	ipData: undefined,
	prefetch: async () => {
		if (get().loaded || get().loading) return;
		try {
			set({ loading: true });
			const res = await fetch("https://ipapi.co/json");
			const json = (await res.json()) as IpData;
			set({ ipData: json, loaded: true, loading: false });
		} catch {
			set({ loaded: true, loading: false });
		}
	},
}));
