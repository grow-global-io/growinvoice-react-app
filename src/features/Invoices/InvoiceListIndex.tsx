import { Grid, Tab, Tabs, Typography } from "@mui/material";
import InvoiceExpenses from "./InvoiceExpenses";
import InvoiceTableList from "./InvoiceTableAllList";

import { useTabs } from "@shared/hooks/useTabs";
import TabPanel from "@shared/components/TabPanel";
import InvoiceTableDueList from "./InvoiceTableDueList";
import InvoiceTablePaidList from "./InvoiceTablePaidList";
import { useTranslation } from "react-i18next";

const InvoiceListIndex = () => {
	const { t } = useTranslation();
	const { handleChange, tabValue } = useTabs("invoiceTab");

	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				{t("invoice.title")}
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
							label={t("invoice.dueInvoices", { defaultValue: "Due Invoices" })}
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
						<Tab
							label={t("invoice.paidInvoices", { defaultValue: "Paid Invoices" })}
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
						<Tab
							label={t("invoice.allInvoices", { defaultValue: "All Invoices" })}
							style={{ fontWeight: "bold", fontSize: 14, textTransform: "capitalize" }}
						/>
					</Tabs>
				</Grid>
				<Grid item xs={12}>
					<TabPanel value={tabValue} index={0}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							{t("invoice.dueInvoices", { defaultValue: "Due Invoices" })}
						</Typography>
						<InvoiceTableDueList />
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							{t("invoice.paidInvoices", { defaultValue: "Paid Invoices" })}
						</Typography>
						<InvoiceTablePaidList />
					</TabPanel>

					<TabPanel value={tabValue} index={2}>
						<Typography variant="h3" sx={{ paddingBottom: 2, textTransform: "capitalize" }}>
							{t("invoice.allInvoices", { defaultValue: "All Invoices" })}
						</Typography>
						<InvoiceTableList />
					</TabPanel>
				</Grid>
			</Grid>
		</>
	);
};

export default InvoiceListIndex;
