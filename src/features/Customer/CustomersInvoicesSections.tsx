import { useCustomerControllerFindOne } from "@api/services/customer";
import { Box, Divider, Grid, Tab, Tabs, Typography } from "@mui/material";
import TabPanel from "@shared/components/TabPanel";
import { useTabs } from "@shared/hooks/useTabs";
import CustomerDetails from "./CustomerDetails";
import Loader from "@shared/components/Loader";
import InvoiceTableDueList from "@features/Invoices/InvoiceTableDueList";
import InvoiceTablePaidList from "@features/Invoices/InvoiceTablePaidList";
import InvoiceTableAllList from "@features/Invoices/InvoiceTableAllList";

const CustomersInvoicesSections = ({ customerId }: { customerId: string }) => {
	const { data, isLoading } = useCustomerControllerFindOne(customerId, {
		query: {
			enabled: !!customerId && customerId !== "",
		},
	});
	const { handleChange, tabValue } = useTabs("customerInvoiceTab");
	if (isLoading) {
		return <Loader />;
	}
	if (!data) {
		return (
			<Typography variant="h6" color="error">
				No customer data found
			</Typography>
		);
	}
	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				Customer Invoices
			</Typography>
			<Divider sx={{ marginBottom: 2 }} />
			<Box>
				<CustomerDetails data={data} />
			</Box>
			<Divider sx={{ my: 2 }} />

			<Grid container sx={{ width: { xs: "90vw", sm: "100%" } }} my={2}>
				<Grid item xs={12}>
					<Tabs
						value={tabValue}
						onChange={handleChange}
						variant="standard"
						textColor="primary"
						indicatorColor="secondary"
						scrollButtons="auto"
					>
						<Tab
							label="Due Invoices"
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
						<Tab
							label="Paid Invoices"
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
						<Tab
							label="All Invoices"
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
					</Tabs>
				</Grid>
				<Grid item xs={12}>
					<TabPanel value={tabValue} index={0}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							Due Invoices
						</Typography>
						<InvoiceTableDueList customerId={customerId} />
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							Paid Invoices
						</Typography>
						<InvoiceTablePaidList customerId={customerId} />
					</TabPanel>

					<TabPanel value={tabValue} index={2}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							All Invoices
						</Typography>
						<InvoiceTableAllList customerId={customerId} />
					</TabPanel>
				</Grid>
			</Grid>
		</>
	);
};

export default CustomersInvoicesSections;
