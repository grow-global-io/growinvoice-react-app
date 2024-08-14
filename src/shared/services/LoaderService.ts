import { useLoaderStore } from "@store/loader";

export class LoaderService {
	private static _instance: LoaderService;

	public static get instance(): LoaderService {
		if (!LoaderService._instance) {
			LoaderService._instance = new LoaderService();
		}
		return LoaderService._instance;
	}

	private constructor() {}

	public showLoader(): void {
		useLoaderStore.getState().setLoader(true);
	}

	public hideLoader(): void {
		useLoaderStore.getState().setLoader(false);
	}
}
