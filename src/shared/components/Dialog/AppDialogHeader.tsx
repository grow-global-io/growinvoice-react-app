import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

export interface DialogTitleProps {
	id: string;
	children?: React.ReactNode;
	onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
	const { children, onClose, ...other } = props;

	return (
		<DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }} {...other}>
			<Typography component="span" sx={{ flexGrow: 1, textTransform: "uppercase" }} variant="h4">
				{children}
			</Typography>
			<IconButton
				aria-label="close"
				onClick={onClose}
				sx={{
					color: (theme) => theme.palette.grey[500],
				}}
			>
				<CloseIcon />
			</IconButton>
		</DialogTitle>
	);
}

export default function AppDialogHeader({
	handleClose,
	title,
}: {
	handleClose: () => void;
	title: string;
}) {
	return (
		<BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
			{title}
		</BootstrapDialogTitle>
	);
}
