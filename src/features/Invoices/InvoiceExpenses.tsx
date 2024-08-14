import {
	useInvoiceControllerFindDueToday,
	useInvoiceControllerOutstandingReceivable,
	useInvoiceControllerFindDueMonth,
} from "@api/services/invoice";
import { Grid } from "@mui/material";
import Loader from "@shared/components/Loader";
import OverviewCard from "@shared/components/OverviewCard";
import { Constants } from "@shared/constants";
import { currencyFormatter, formatDateToIso } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import moment from "moment";

const InvoiceExpenses = () => {
	const { user } = useAuthStore();
	const outstandingReceivable = useInvoiceControllerOutstandingReceivable();
	const currentDate = moment().format("YYYY-MM-DD");
	const invoiceDueDay = useInvoiceControllerFindDueToday({ date: formatDateToIso(currentDate) });
	const invoiceDueMonth = useInvoiceControllerFindDueMonth({ date: formatDateToIso(currentDate) });

	if (outstandingReceivable.isLoading || invoiceDueDay.isLoading || invoiceDueMonth.isLoading) {
		return <Loader />;
	}

	const outstandingReceivableValue =
		outstandingReceivable?.data !== undefined
			? currencyFormatter(outstandingReceivable?.data, user?.currency?.short_code)
			: "";
	const invoiceDueDayValue =
		invoiceDueDay?.data !== undefined
			? currencyFormatter(invoiceDueDay?.data, user?.currency?.short_code)
			: "";
	const invoiceDueMonthValue =
		invoiceDueMonth?.data !== undefined
			? currencyFormatter(invoiceDueMonth?.data, user?.currency?.short_code)
			: "";

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
