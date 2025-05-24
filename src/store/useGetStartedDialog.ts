import {create } from 'zustand';

interface GetStartedDialogStore {
    open: boolean;
    handleClose: () => void;
    handleOpen: () => void;
}

export const useGetStartedDialogStore = create<GetStartedDialogStore>((set) => ({
    open: false,
    handleClose: () => set({ open: false }),
    handleOpen: () => set({ open: true  })
}));