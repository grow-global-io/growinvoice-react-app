import { useCustomerControllerCustomerCount } from "@api/services/customer";
import {
	useInvoiceControllerInvoiceCount,
	useInvoiceControllerTotalDue,
} from "@api/services/invoice";
import { Grid } from "@mui/material";
import Loader from "@shared/components/Loader";
import { currencyFormatter } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import DashbaordCard from "@shared/components/DashbaordCard";
import { FaFileInvoiceDollar, FaFileInvoice } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { useQuotationControllerCountTotal } from "@api/services/quotation";

const ExpensesSummary = () => {
	const { user } = useAuthStore();
	const customerCount = useCustomerControllerCustomerCount();
	const invoiceCount = useInvoiceControllerInvoiceCount();
	const invoiceDueAmount = useInvoiceControllerTotalDue();
	const quotationCount = useQuotationControllerCountTotal();

	const data = [
		{
			value: customerCount?.data ?? "",
			name: "Customers",
			img: <FaPeopleGroup color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardBlue",
			navigateToPath: "/customer/customerlist",
		},
		{
			value: invoiceCount?.data ?? "",
			name: "Invoices",
			img: <FaFileInvoice color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashbaordYellow",
			navigateToPath: "/invoice/invoicelist?invoiceTab=2",
		},
		{
			value: quotationCount?.data?.total ?? "",
			name: "Estimates",
			img: <FaFileInvoiceDollar color="#fff" fontSize={"40px"} />,
			BgColor: "custom.DashboadRed",
			navigateToPath: "/quotation/quotationlist",
		},
		{
			value: currencyFormatter(invoiceDueAmount?.data ?? 0, user?.currency?.short_code),
			name: "Due Amount",
			img: <MdAccountBalanceWallet color="#fff" fontSize={"50px"} />,
			BgColor: "custom.DashboardGreen",
			navigateToPath: "/invoice/invoicelist?invoiceTab=0",
		},
	];

	if (
		customerCount.isLoading ||
		invoiceCount.isLoading ||
		invoiceDueAmount.isLoading ||
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
