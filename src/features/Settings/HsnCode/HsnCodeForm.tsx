import { Box, Grid, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateHSNCode from "@features/HSNCode/CreateHSNCode";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";

const HsnCodeForm = () => {
	const { setOpenHsnCodeForm } = useCreateHsnCodeStore.getState();
	return (
		<Box sx={{ width: { sm: "400px" } }} role="presentation">
			<Grid container justifyContent={"space-between"} p={2}>
				<Typography
					variant="h4"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<ContentPasteOutlinedIcon /> New HSN Code
					{/* <img src={Constants.customImages.QuotationIcon} alt="Invoice Icon" /> New Quotation */}
				</Typography>
				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => {
						setOpenHsnCodeForm(false);
					}}
				>
					<CloseIcon />
				</IconButton>
			</Grid>
			<Divider />
			<Box sx={{ mb: 2, mt: 2 }} p={2}>
				<CreateHSNCode
					handleClose={() => {
						setOpenHsnCodeForm(false);
					}}
				/>
			</Box>
		</Box>
	);
};

export default HsnCodeForm;
