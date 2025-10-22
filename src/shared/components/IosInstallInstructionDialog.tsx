import { Box, List, ListItem, Modal } from "@mui/material";
import { usePWAInstall } from "../../utils/usePwaInstall";
import AppDialogHeader from "./Dialog/AppDialogHeader";


interface IosInstallInstructionDialogProps {
	open: boolean;
	onClose: () => void;
}

const IosInstallInstructionDialog = ({ open, onClose }: IosInstallInstructionDialogProps) => {
	const { getIOSInstallInstructions } = usePWAInstall();
	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		maxWidth: "90svw",
		width: "80%",
		bgcolor: "background.paper",
		borderRadius: "4px",
		boxShadow: 24,
		p: 1,
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Box sx={style}>
				<AppDialogHeader title="How to Install?" handleClose={onClose}></AppDialogHeader>
				<List>
					{getIOSInstallInstructions().map((instructions, index) => {
						return (
							<ListItem key={index}>
								{index + 1}. {instructions}
							</ListItem>
						);
					})}
				</List>
			</Box>
		</Modal>
	);
};

export default IosInstallInstructionDialog;
