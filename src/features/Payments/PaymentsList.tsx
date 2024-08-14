import { Grid, Typography } from "@mui/material";
import PaymentsTableList from "./PaymentsTableList";
import CreatePayments from "./CreatePayments";

const PaymentsList = () => {
	return (
		<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" textTransform={"capitalize"}>
					Payments
				</Typography>
				<CreatePayments />
			</Grid>
			<Grid item xs={12}>
				<PaymentsTableList />
			</Grid>
		</Grid>
	);
};

export default PaymentsList;
