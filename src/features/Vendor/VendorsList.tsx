import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import VendorsTableList from "./VendorsTableList";
import CreateVendors from "./CreateVendors";

const VendorsList = () => {
	const { t } = useTranslation();
	return (
		<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" textTransform={"capitalize"}>
					{t("vendor.title", { defaultValue: "Vendors" })}
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
