import { Grid, Typography } from "@mui/material";
import ProductTableList from "./ProductTableList";
import CreateProduct from "./CreateProduct";

function ProductList() {
	return (
		<>
			<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
				<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
					<Typography variant="h3" textTransform={"capitalize"}>
						Products
					</Typography>
					<CreateProduct />
				</Grid>
				<Grid item xs={12}>
					<ProductTableList />
				</Grid>
			</Grid>
		</>
	);
}

export default ProductList;
