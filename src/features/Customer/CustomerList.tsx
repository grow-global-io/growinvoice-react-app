import CustomerTableList from "./CustomerTableList";

import { Grid, Typography } from "@mui/material";
import CreateCustomer from "./CreateCustomer";

const CustomerList = () => {
	return (
		<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" textTransform={"capitalize"}>
					Customers
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
