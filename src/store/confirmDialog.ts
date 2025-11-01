import { create } from "zustand";
import i18n from "../i18s";

interface ConfirmDialogStore {
	open: boolean;
	title: string;
	message: string;
	result?: boolean;
	confirmButtonText: string;
	cancelButtonText: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	cleanUp: () => void;
	handleOpen: ({
		title,
		message,
		onConfirm,
		onCancel,
		confirmButtonText,
	}: {
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
		confirmButtonText?: string;
		cancelButtonText?: string;
	}) => void;
}

export const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
	open: false,
	title: i18n.t("dialog.confirmTitle", { defaultValue: "Are you sure?" }),
	message: "",
	confirmButtonText: i18n.t("app.confirm", { defaultValue: "Confirm" }),
	cancelButtonText: i18n.t("app.cancel", { defaultValue: "Cancel" }),
	handleOpen: ({
		title,
		message,
		onConfirm,
		onCancel,
		confirmButtonText = i18n.t("app.confirm", { defaultValue: "Confirm" }),
		cancelButtonText = i18n.t("app.cancel", { defaultValue: "Cancel" }),
	}: {
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
		confirmButtonText?: string;
		cancelButtonText?: string;
	}) => {
		set({
			title,
			message,
			open: true,
			onConfirm,
			onCancel,
			confirmButtonText,
			cancelButtonText,
		});
	},
	cleanUp() {
		set({
			title: i18n.t("dialog.confirmTitle", { defaultValue: "Are you sure?" }),
			open: false,
			message: "",
			onConfirm: undefined,
			onCancel: undefined,
		});
	},
}));
