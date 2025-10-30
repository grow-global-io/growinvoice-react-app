import { useCustomerControllerCustomerCount } from "@api/services/customer";
import {
	useInvoiceControllerInvoiceCount,
	useInvoiceControllerTotalDue,
	useInvoiceControllerFindAll,
} from "@api/services/invoice";
import { Grid } from "@mui/material";
import Loader from "@shared/components/Loader";
import { currencyFormatter } from "@shared/formatter";
import { convertToTargetCurrency } from "@shared/currencyConversion";
import { useAuthStore } from "@store/auth";
import DashbaordCard from "@shared/components/DashbaordCard";
import { FaFileInvoiceDollar, FaFileInvoice } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { useQuotationControllerCountTotal } from "@api/services/quotation";
import { useTranslation } from "react-i18next";

const ExpensesSummary = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const customerCount = useCustomerControllerCustomerCount();
	const invoiceCount = useInvoiceControllerInvoiceCount();
	const invoiceDueAmount = useInvoiceControllerTotalDue();
	const allInvoices = useInvoiceControllerFindAll(undefined, {
		query: {
			enabled: true,
			refetchOnWindowFocus: false,
		},
	});
	const quotationCount = useQuotationControllerCountTotal();

	const targetCurrency = user?.currency?.short_code ?? "INR";
	const computedDue = (allInvoices?.data ?? [])
		.filter((inv) => inv?.paid_status !== "Paid")
		.reduce((sum, inv) => {
			const fromCode = inv?.currency?.short_code ?? targetCurrency;
			return sum + convertToTargetCurrency(inv?.due_amount ?? 0, fromCode, targetCurrency);
		}, 0);

	const dueAmountValue = currencyFormatter(computedDue, targetCurrency);

	const data = [
		{
			value: customerCount?.data ?? "",
			name: t("dashboard.summary.customers", { defaultValue: "Customers" }),
			img: <FaPeopleGroup color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardBlue",
			navigateToPath: "/customer/customerlist",
		},
		{
			value: invoiceCount?.data ?? "",
			name: t("dashboard.summary.invoices", { defaultValue: "Invoices" }),
			img: <FaFileInvoice color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashbaordYellow",
			navigateToPath: "/invoice/invoicelist?invoiceTab=2",
		},
		{
			value: quotationCount?.data?.total ?? "",
			name: t("dashboard.summary.estimates", { defaultValue: "Estimates" }),
			img: <FaFileInvoiceDollar color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashboadRed",
			navigateToPath: "/quotation/quotationlist",
		},
		{
			value: dueAmountValue,
			name: t("dashboard.summary.dueAmount", { defaultValue: "Due Amount" }),
			img: <MdAccountBalanceWallet color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardGreen",
			navigateToPath: "/invoice/invoicelist?invoiceTab=0",
		},
	];

	if (
		customerCount.isLoading ||
		invoiceCount.isLoading ||
		invoiceDueAmount.isLoading ||
		allInvoices.isLoading ||
		quotationCount?.isLoading
	) {
		return <Loader />;
	}
	return (
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
	);
};

export default ExpensesSummary;
