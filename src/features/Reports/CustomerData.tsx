import { Box, Typography } from "@mui/material";
import CustomerDataTableList from "./CustomerDataTableList";
import { DateCalander } from "@shared/components/DateCalendar";
import Loader from "@shared/components/Loader";
import ReportsHooks from "./reportHooks/ReportsHooks";
import { useTranslation } from "react-i18next";

const CustomerData = () => {
	const { t } = useTranslation();
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
					{t("report.customerData.title", { defaultValue: "All Customers Uploaded" })}
				</Typography>
				<Box>
					<Typography variant="h6" fontWeight={"500"} textTransform={"capitalize"}>
						{t("report.selectDateRange", { defaultValue: "Select Date Range" })}
					</Typography>
					<DateCalander dayRange={dayRange} setDayRange={setDayRange} />
				</Box>
			</Box>
			<Box
				sx={{ width: { xs: "85vw", sm: "auto" }, overflowX: { xs: "scroll", sm: "visible" } }}
				my={2}
			>
				<CustomerDataTableList fromDate={fromDate} toDate={toDate} />
			</Box>
		</>
	);
};

export default CustomerData;
