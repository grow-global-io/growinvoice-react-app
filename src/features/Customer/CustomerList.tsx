import CustomerTableList from "./CustomerTableList";

import { Grid, Typography } from "@mui/material";
import CreateCustomer from "./CreateCustomer";
import { useTranslation } from "react-i18next";

const CustomerList = () => {
	const { t } = useTranslation();
	return (
		<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" textTransform={"capitalize"}>
					{t("customer.title")}
				</Typography>
				<CreateCustomer />
			</Grid>
			<Grid item xs={12}>
				<CustomerTableList />
			</Grid>
		</Grid>
	);
};

export default CustomerList;
