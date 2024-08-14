import { Box, Grid, Typography } from "@mui/material";
import ProfitLossTableList from "./ProfitLossTableList";
import { FiFileText } from "react-icons/fi";
// import { HiOutlineCircleStack } from "react-icons/hi2";
import ProfitLossCard from "@shared/components/ProfitLossCard";
import { DateCalander } from "@shared/components/DateCalendar";
import { useReportsControllerGetProfitLossCount } from "@api/services/reports";
import Loader from "@shared/components/Loader";
import { currencyFormatter } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaArrowDownLong } from "react-icons/fa6";
import ReportsHooks from "./reportHooks/ReportsHooks";

const ProfitLoss = () => {
	const { user } = useAuthStore();
	const { fromDate, toDate, dateRange, dayRange, setDayRange } = ReportsHooks();
	const profitLossData = useReportsControllerGetProfitLossCount({
		end: toDate,
		start: fromDate,
	});
	const data = [
		{
			amount: currencyFormatter(profitLossData?.data?.totalIncome ?? 0, user?.currency?.short_code),
			text: "Total Income",
			icon: <FiFileText style={{ color: "rgba(25, 32, 56, 1)", fontSize: "30px" }} />,
		},
		{
			amount: currencyFormatter(
				profitLossData?.data?.totalExpenses ?? 0,
				user?.currency?.short_code,
			),
			text: "Total Expenses",
			icon: <FiFileText style={{ color: "rgba(246, 146, 22, 1)", fontSize: "30px" }} />,
		},
		// {
		// 	amount: "$32.5k",
		// 	text: "Invoiced Amount",
		// 	icon: <HiOutlineCircleStack style={{ color: "rgba(15, 187, 0, 1)", fontSize: "30px" }} />,
		// },
		{
			amount: currencyFormatter(
				profitLossData?.data?.profitOrLoss ?? 0,
				user?.currency?.short_code,
			),
			text: (profitLossData?.data?.profitOrLoss ?? 0) > 0 ? "Profit" : "Loss",
			icon:
				(profitLossData?.data?.profitOrLoss ?? 0) > 0 ? (
					<FaArrowUpLong style={{ color: "#0FBB00", fontSize: "30px" }} />
				) : (
					<FaArrowDownLong style={{ color: "#BF384B", fontSize: "30px" }} />
				),
		},
	];

	if (
		dateRange?.isLoading ||
		dateRange?.isRefetching ||
		profitLossData?.isLoading ||
		profitLossData?.isFetching
	) {
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
					Profit And Loss
				</Typography>
				<Box>
					<Typography variant="h6" fontWeight={"500"} textTransform={"capitalize"}>
						Select Date Range
					</Typography>
					<DateCalander dayRange={dayRange} setDayRange={setDayRange} />
				</Box>
			</Box>
			<Grid container spacing={2}>
				{data.map((item, index) => (
					<Grid item xs={12} md={3} key={index}>
						<ProfitLossCard name={item.text} icon={item.icon} value={item.amount} />
					</Grid>
				))}
			</Grid>
			<Box
				sx={{ width: { xs: "85vw", sm: "auto" }, overflowX: { xs: "scroll", sm: "visible" } }}
				my={2}
			>
				<ProfitLossTableList fromDate={fromDate} toDate={toDate} />
			</Box>
		</>
	);
};

export default ProfitLoss;
