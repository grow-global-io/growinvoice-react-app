import { Box, Typography } from "@mui/material";
import ExpensesTable from "./ExpensesTable";

import { useTranslation } from "react-i18next";

const ExpensesList = () => {
	const { t } = useTranslation();
	return (
		<Box>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				{t("expenses.title", { defaultValue: "Expenses" })}
			</Typography>
			<ExpensesTable />
		</Box>
	);
};

export default ExpensesList;
