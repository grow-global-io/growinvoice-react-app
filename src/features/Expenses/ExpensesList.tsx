import { Box, Typography } from "@mui/material";
import ExpensesTable from "./ExpensesTable";

const ExpensesList = () => {
	return (
		<Box>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				Expenses
			</Typography>
			<ExpensesTable />
		</Box>
	);
};

export default ExpensesList;
