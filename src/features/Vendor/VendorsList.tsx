import { Grid, Typography } from "@mui/material";
import VendorsTableList from "./VendorsTableList";
import CreateVendors from "./CreateVendors";

const VendorsList = () => {
	return (
		<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" textTransform={"capitalize"}>
					Vendors
				</Typography>
				<CreateVendors />
			</Grid>
			<Grid item xs={12}>
				<VendorsTableList />
			</Grid>
		</Grid>
	);
};

export default VendorsList;
