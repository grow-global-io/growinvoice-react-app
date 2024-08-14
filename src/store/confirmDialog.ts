import { create } from "zustand";

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
	title: "Are you sure?",
	message: "",
	confirmButtonText: "Confirm",
	cancelButtonText: "Cancel",
	handleOpen: ({
		title,
		message,
		onConfirm,
		onCancel,
		confirmButtonText = "Confirm",
		cancelButtonText = "Cancel",
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
			title: "Are you sure?",
			open: false,
			message: "",
			onConfirm: undefined,
			onCancel: undefined,
		});
	},
}));
