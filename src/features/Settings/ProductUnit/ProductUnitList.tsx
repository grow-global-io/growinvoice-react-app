import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProductUnitTableList from "./ProductUnitTableList";
import CreateProductUnit from "./CreateProductUnit";

const ProductUnitList = () => {
	const { t } = useTranslation();
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" fontWeight={"500"} textTransform={"capitalize"}>
					{t("productUnit.title", { defaultValue: "Product Unit" })}
				</Typography>
				<CreateProductUnit />
			</Grid>
			<Grid item xs={12}>
				<ProductUnitTableList />
			</Grid>
		</Grid>
	);
};

export default ProductUnitList;
