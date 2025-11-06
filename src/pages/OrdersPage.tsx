import React from "react";
import { Grid, Typography } from "@mui/material";
import OrdersList from "@features/Orders/OrdersList";
import OverviewCard from "@shared/components/OverviewCard";
import { useInvoiceControllerFindAll } from "@api/services/invoice";
import { currencyFormatter } from "@shared/formatter";
import { useTranslation } from "react-i18next";
import { Constants } from "@shared/constants";

const OrdersPage: React.FC = () => {
	const { t } = useTranslation();
	const invoices = useInvoiceControllerFindAll();
	const orders = (invoices?.data ?? []).filter((inv) => inv.fromStore === true);

	const totalOrders = orders.length;
	const totalPaidCount = orders.filter((o) => o.paid_status === "Paid").length;
	const totalPaidAmount = orders.reduce((acc, o) => acc + (o.paid_amount || 0), 0);
	const totalDueAmount = orders.reduce((acc, o) => acc + (o.due_amount || 0), 0);

	const cards = [
		{
			value: String(totalOrders),
			text: t("orders.summary.totalOrders", { defaultValue: "Total Orders" }),
			img: Constants.customImages.Stack,
		},
		{
			value: String(totalPaidCount),
			text: t("orders.summary.totalPaidInvoices", { defaultValue: "Total Paid" }),
			img: Constants.customImages.GreenCheck,
		},
		{
			value: currencyFormatter(totalPaidAmount, orders?.[0]?.currency?.short_code || "INR"),
			text: t("orders.summary.totalAmountPaid", { defaultValue: "Total Amount Paid" }),
			img: Constants.customImages.Amount,
		},
		{
			value: currencyFormatter(totalDueAmount, orders?.[0]?.currency?.short_code || "INR"),
			text: t("orders.summary.totalDueAmount", { defaultValue: "Total Due Amount" }),
			img: Constants.customImages.OrangeNoticeIcon,
		},
	];

	return (
		<>
			<Typography variant="h3" sx={{ paddingBottom: 2 }}>
				{t("orders.title", { defaultValue: "My Orders" })}
			</Typography>
			<Grid container spacing={2} sx={{ mb: 2 }}>
				{cards.map((c) => (
					<Grid item xs={12} md={3} key={c.text}>
						<OverviewCard name={c.text} img={c.img} value={c.value} />
					</Grid>
				))}
			</Grid>
			<OrdersList />
		</>
	);
};

export default OrdersPage;
