import {
	useInvoiceControllerFindDueToday,
	useInvoiceControllerOutstandingReceivable,
	useInvoiceControllerFindDueMonth,
	useInvoiceControllerFindAll,
} from "@api/services/invoice";
import { Grid } from "@mui/material";
import Loader from "@shared/components/Loader";
import OverviewCard from "@shared/components/OverviewCard";
import { Constants } from "@shared/constants";
import { currencyFormatter, formatDateToIso } from "@shared/formatter";
import { convertToTargetCurrency } from "@shared/currencyConversion";
import { useAuthStore } from "@store/auth";
import moment from "moment";

const InvoiceExpenses = () => {
	const { user } = useAuthStore();
	const outstandingReceivable = useInvoiceControllerOutstandingReceivable();
	// Fetch all invoices to compute multi-currency outstanding receivables (client-side rule)
	const allInvoices = useInvoiceControllerFindAll(undefined, {
		query: {
			enabled: true,
			refetchOnWindowFocus: false,
		},
	});
	const currentDate = moment().format("YYYY-MM-DD");
	const invoiceDueDay = useInvoiceControllerFindDueToday({ date: formatDateToIso(currentDate) });
	const invoiceDueMonth = useInvoiceControllerFindDueMonth({ date: formatDateToIso(currentDate) });

	if (
		outstandingReceivable.isLoading ||
		invoiceDueDay.isLoading ||
		invoiceDueMonth.isLoading ||
		allInvoices.isLoading
	) {
		return <Loader />;
	}

	// Compute outstanding across currencies: include Unpaid and PartiallyPaid
	const targetCurrency = user?.currency?.short_code ?? "INR";
	const computedOutstanding = (allInvoices?.data ?? [])
		.filter((inv) => inv?.paid_status !== "Paid")
		.reduce((sum, inv) => {
			const fromCode = inv?.currency?.short_code ?? targetCurrency;
			return sum + convertToTargetCurrency(inv?.due_amount ?? 0, fromCode, targetCurrency);
		}, 0);

	// Choose the larger of API value and computed value, but favor computed when available
	const outstandingBase = Number.isFinite(computedOutstanding)
		? computedOutstanding
		: (outstandingReceivable?.data ?? 0);

	const outstandingReceivableValue = currencyFormatter(outstandingBase, targetCurrency);

	// Compute "Due Today" and "Due Within 30 Days" with conversion
	const today = moment();
	const inThirtyDays = moment().add(30, "days");

	const dueToday = (allInvoices?.data ?? [])
		.filter((inv) => inv?.paid_status !== "Paid")
		.filter((inv) => moment(inv?.due_date).isSame(today, "day"))
		.reduce((sum, inv) => {
			const fromCode = inv?.currency?.short_code ?? targetCurrency;
			return sum + convertToTargetCurrency(inv?.due_amount ?? 0, fromCode, targetCurrency);
		}, 0);

	const dueMonth = (allInvoices?.data ?? [])
		.filter((inv) => inv?.paid_status !== "Paid")
		.filter(
			(inv) =>
				moment(inv?.due_date).isAfter(today, "day") &&
				moment(inv?.due_date).isSameOrBefore(inThirtyDays, "day"),
		)
		.reduce((sum, inv) => {
			const fromCode = inv?.currency?.short_code ?? targetCurrency;
			return sum + convertToTargetCurrency(inv?.due_amount ?? 0, fromCode, targetCurrency);
		}, 0);

	const invoiceDueDayValue = currencyFormatter(dueToday, targetCurrency);
	const invoiceDueMonthValue = currencyFormatter(dueMonth, targetCurrency);

	const data = [
		{
			value: outstandingReceivableValue,
			text: "Outstanding Receivables",
			img: Constants.customImages.LeftDownArr,
		},
		{
			value: invoiceDueDayValue,
			text: "Due Today",
			img: Constants.customImages.DueDateRed,
		},
		{
			value: invoiceDueMonthValue,
			text: "Due Within 30 Days",
			img: Constants.customImages.DueDateBlue,
		},
		{
			value: 0,
			text: "Overdue Invoice",
			img: Constants.customImages.Stack,
		},
	];

	return (
		<Grid container spacing={2}>
			{data.map((item) => (
				<Grid item xs={12} md={3} key={item.text}>
					<OverviewCard name={item.text} img={item.img} value={item.value} />
				</Grid>
			))}
		</Grid>
	);
};

export default InvoiceExpenses;
