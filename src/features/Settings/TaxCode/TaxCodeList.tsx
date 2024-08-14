import { Grid, Typography } from "@mui/material";
import TaxTypeTableList from "./TaxTypeTableList";
import CreateTaxCode from "./CreateTaxCode";

const TaxCodeList = () => {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" fontWeight={"500"} textTransform={"capitalize"}>
					Tax Type
				</Typography>
				<CreateTaxCode />
			</Grid>
			<Grid item xs={12}>
				<TaxTypeTableList />
			</Grid>
		</Grid>
	);
};

export default TaxCodeList;
