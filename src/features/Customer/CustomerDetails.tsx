import { GetCustomerWithAddressDto } from "../../api/services/auth/models";
import { Box, Typography } from "@mui/material";
const CustomerDetails = ({ data }: { data: GetCustomerWithAddressDto }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Box
				sx={{
					gap: 2,
					diplay: "flex",
					flexDirection: "column",
				}}
			>
				<Typography variant="inherit" mb={1}>
					<b>Name:</b> {data?.name}
				</Typography>
				<Typography variant="inherit" mb={1}>
					<b>Email:</b> {data?.email}
				</Typography>
				<Typography variant="inherit">
					<b>Phone:</b> {data?.phone}
				</Typography>
			</Box>
			<Box
				sx={{
					gap: 2,
				}}
			>
				<Typography
					variant="h5"
					sx={{
						textDecoration: "underline",
					}}
				>
					Billing Address:
				</Typography>
				<Typography variant="inherit">
					{data?.billingAddress?.address}, {data?.billingAddress?.city}
					{", "}
					{data?.billingAddress?.zip}
				</Typography>
			</Box>
			<Box
				sx={{
					gap: 2,
				}}
			>
				<Typography
					variant="h5"
					sx={{
						textDecoration: "underline",
					}}
				>
					Shipping Address:
				</Typography>
				<Typography variant="inherit">
					{data?.shippingAddress?.address}, {data?.shippingAddress?.city}
					{", "}
					{data?.shippingAddress?.zip}
				</Typography>
			</Box>
		</Box>
	);
};

export default CustomerDetails;
