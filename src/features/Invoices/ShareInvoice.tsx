import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Grid,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import AppDialogHeader from "../../shared/components/Dialog/AppDialogHeader";
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from "react-share";
import LinkIcon from "@mui/icons-material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import { useState } from "react";

const ShareInvoice = ({
	open,
	handleClose,
	invoiceId,
}: {
	open: boolean;
	handleClose: () => void;
	invoiceId: string;
}) => {
	const url = `${window.location.origin}/invoice/invoicetemplate/${invoiceId}`;
	const [copied, setCopied] = useState(false);

	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 5000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};
	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
			<AppDialogHeader handleClose={handleClose} title="Share Invoice" />
			<DialogContent>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							label="Link"
							value={url}
							variant="outlined"
							fullWidth
							InputProps={{
								readOnly: true,
							}}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button
							variant="outlined"
							onClick={handleCopyClick}
							startIcon={<LinkIcon />}
							disabled={copied}
						>
							{copied ? "Copied!" : "Copy Link"}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="body2" color="textSecondary">
							Share on social media:
						</Typography>
					</Grid>
					<Grid item xs={12} container spacing={1}>
						<Grid item>
							<FacebookShareButton url={url}>
								<IconButton aria-label="Facebook">
									<FacebookIcon />
								</IconButton>
							</FacebookShareButton>
						</Grid>
						<Grid item>
							<TwitterShareButton url={url}>
								<IconButton aria-label="Twitter">
									<TwitterIcon />
								</IconButton>
							</TwitterShareButton>
						</Grid>
						<Grid item>
							<EmailShareButton url={url}>
								<IconButton aria-label="Email">
									<EmailIcon />
								</IconButton>
							</EmailShareButton>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} color="primary" variant="contained">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ShareInvoice;
