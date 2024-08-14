import { Box, Typography } from "@mui/material";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import CustomerReportTalbeList from "./CustomerReportTalbeList";
import { DateCalander } from "@shared/components/DateCalendar";
import Loader from "@shared/components/Loader";
import ReportsHooks from "./reportHooks/ReportsHooks";

const CustomerSales = () => {
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
					Customer Report
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
				<CustomerReportTalbeList fromDate={fromDate} toDate={toDate} />
			</Box>
		</>
	);
};

export default CustomerSales;
