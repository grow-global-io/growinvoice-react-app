import { Box, Grid, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateTaxes from "@features/ProductTaxes/CreateTaxes";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useCreateTaxCodeStore } from "@store/createTaxCodeStore";

const TaxCodeForm = () => {
	const { setOpenTaxCodeForm } = useCreateTaxCodeStore.getState();
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
					<DescriptionOutlinedIcon /> New Tax
					{/* <img src={Constants.customImages.QuotationIcon} alt="Invoice Icon" /> New Quotation */}
				</Typography>
				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => {
						setOpenTaxCodeForm(false);
					}}
				>
					<CloseIcon />
				</IconButton>
			</Grid>
			<Divider />
			<Box sx={{ mb: 2, mt: 2 }} p={2}>
				<CreateTaxes
					handleClose={() => {
						setOpenTaxCodeForm(false);
					}}
				/>
			</Box>
		</Box>
	);
};

export default TaxCodeForm;
