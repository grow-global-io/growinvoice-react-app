import { Grid, Tab, Tabs, Typography } from "@mui/material";
import InvoiceExpenses from "./InvoiceExpenses";
import InvoiceTableList from "./InvoiceTableAllList";

import { useTabs } from "@shared/hooks/useTabs";
import TabPanel from "@shared/components/TabPanel";
import InvoiceTableDueList from "./InvoiceTableDueList";
import InvoiceTablePaidList from "./InvoiceTablePaidList";

const InvoiceListIndex = () => {
	const { handleChange, tabValue } = useTabs("invoiceTab");

	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				Invoices
			</Typography>
			<InvoiceExpenses />
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
						<InvoiceTableDueList />
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							Paid Invoices
						</Typography>
						<InvoiceTablePaidList />
					</TabPanel>

					<TabPanel value={tabValue} index={2}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							All Invoices
						</Typography>
						<InvoiceTableList />
					</TabPanel>
				</Grid>
			</Grid>
		</>
	);
};

export default InvoiceListIndex;
