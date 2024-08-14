import { Box, Typography } from "@mui/material";
import ExpensesReportTable from "./ExpensesReportTable";
import { DateCalander } from "@shared/components/DateCalendar";
import Loader from "@shared/components/Loader";
import ReportsHooks from "./reportHooks/ReportsHooks";

const Expenses = () => {
	const { fromDate, toDate, dateRange, dayRange, setDayRange } = ReportsHooks();
	if (dateRange?.isLoading || dateRange?.isRefetching) {
		return <Loader />;
	}
	return (
		<>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexDirection: "row",
				}}
				mb={2}
			>
				<Typography variant="h3" fontWeight={"500"} textTransform={"capitalize"}>
					Expenses Report
				</Typography>
				<Box>
					<Typography variant="h6" fontWeight={"500"} textTransform={"capitalize"}>
						Select Date Range
					</Typography>
					<DateCalander dayRange={dayRange} setDayRange={setDayRange} />
				</Box>
			</Box>
			<Box
				sx={{ width: { xs: "85vw", sm: "auto" }, overflowX: { xs: "scroll", sm: "visible" } }}
				my={2}
			>
				<ExpensesReportTable fromDate={fromDate} toDate={toDate} />
			</Box>
		</>
	);
};

export default Expenses;
