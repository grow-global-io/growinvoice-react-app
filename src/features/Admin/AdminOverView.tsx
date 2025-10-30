import { useCustomerControllerCustomerCount } from "@api/services/customer";
import { useInvoiceControllerInvoiceCount } from "@api/services/invoice";
import { useQuotationControllerCountTotal } from "@api/services/quotation";
import { useUserControllerUserCount } from "@api/services/users";
import { Grid, Typography } from "@mui/material";
import DashbaordCard from "@shared/components/DashbaordCard";
import React from "react";
import { FaFileInvoiceDollar, FaFileInvoice } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const AdminOverView = () => {
	const { t } = useTranslation();
	const customerCount = useCustomerControllerCustomerCount();
	const invoiceCount = useInvoiceControllerInvoiceCount();
	const quotationCount = useQuotationControllerCountTotal();
	const userCount = useUserControllerUserCount();

	const data = [
		{
			value: customerCount?.data ?? "",
			name: t("admin.customers", { defaultValue: "Customers" }),
			img: <FaPeopleGroup color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardBlue",
			navigateToPath: "/customer/customerlist",
		},
		{
			value: invoiceCount?.data ?? "",
			name: t("admin.invoices", { defaultValue: "Invoices" }),
			img: <FaFileInvoice color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashbaordYellow",
			navigateToPath: "/invoice/invoicelist?invoiceTab=2",
		},
		{
			value: quotationCount?.data?.total ?? "",
			name: t("admin.estimates", { defaultValue: "Estimates" }),
			img: <FaFileInvoiceDollar color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashboadRed",
			navigateToPath: "/quotation/quotationlist",
		},
		{
			value: userCount?.data ?? "",
			name: t("admin.users", { defaultValue: "Users" }),
			img: <FaPeopleGroup color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardGreen",
			navigateToPath: "/users/userlist",
		},
	];
	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				{t("admin.overview", { defaultValue: "Overview" })}
			</Typography>
			<Grid container spacing={2}>
				{data.map((item, index) => (
					<Grid item xs={12} md={3} key={index}>
						<DashbaordCard
							name={item.name}
							icon={item.img}
							value={item.value}
							bgColor={item.BgColor}
							navigateToPath={item.navigateToPath}
						/>
					</Grid>
				))}
			</Grid>
		</>
	);
};

export default AdminOverView;
