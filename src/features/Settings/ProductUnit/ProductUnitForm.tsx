import { Box, Grid, Typography, IconButton, Divider } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CreateProductUnit from "@features/ProductUnit/CreateProductUnit";
import NoteOutlinedIcon from "@mui/icons-material/NoteOutlined";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";

const ProductUnitForm = () => {
	const { setOpenProductUnitForm } = useCreateProductUnitStore.getState();
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
					<NoteOutlinedIcon /> New Product Unit
				</Typography>
				<IconButton
					sx={{
						color: "secondary.dark",
					}}
					onClick={() => setOpenProductUnitForm(false)}
				>
					<CloseIcon />
				</IconButton>
			</Grid>
			<Divider />
			<Box sx={{ mb: 2, mt: 2 }} p={2}>
				<CreateProductUnit
					handleClose={() => {
						setOpenProductUnitForm(false);
					}}
				/>
			</Box>
		</Box>
	);
};

export default ProductUnitForm;
