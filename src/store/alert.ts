import { environment } from "@enviroment";
import { AlertProps } from "@mui/material";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { createStore } from "zustand/vanilla";
// import { mountStoreDevtool } from "simple-zustand-devtools";
// import { environment } from "../environment";

interface AlertStore {
	open: boolean;
	message: string;
	severity: AlertProps["severity"];
	setAlert: (open: boolean, message: string, severity: AlertProps["severity"]) => void;
}

export const useAlertStore = createStore<AlertStore>((set) => ({
	open: false,
	message: "",
	severity: "success",
	setAlert: (open, message, severity) => set({ open, message, severity }),
}));

if (environment.production === false) {
	mountStoreDevtool("Alert", useAlertStore);
}
