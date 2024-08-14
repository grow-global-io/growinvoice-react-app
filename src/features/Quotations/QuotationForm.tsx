import { Box, Grid, Typography, IconButton } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { Constants } from "@shared/constants";

const QuotationForm = ({ handleClose }: { handleClose: () => void }) => {
	const initialValues = {};
	const schema = yup.object({});
	const handleSubmit = () => {};

	return (
		<Box sx={{ width: "100%" }} role="presentation">
			<Grid container justifyContent={"space-between"}>
				<Typography
					variant="h4"
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<img src={Constants.customImages.QuotationIcon} alt="Invoice Icon" /> New Quotation
				</Typography>
				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => handleClose()}
				>
					<CloseIcon />
				</IconButton>
			</Grid>

			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{({ errors }) => {
						console.log(errors);
						return <Form>{/* Your form fields go here */}</Form>;
					}}
				</Formik>
			</Box>
		</Box>
	);
};

export default QuotationForm;
