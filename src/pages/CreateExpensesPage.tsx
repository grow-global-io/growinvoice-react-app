import CreateExpense from "@features/Expenses/CreateExpense";
import type { AiExpensePrefill } from "@features/Expenses/types/aiExpensePrefill";
import { useLocation, useParams } from "react-router-dom";
const CreateExpensesPage = () => {
	const { id } = useParams<{ id?: string }>();
	const location = useLocation();
	const aiPrefill = (location.state as { fromAiExpensePrefill?: AiExpensePrefill } | null)
		?.fromAiExpensePrefill;
	return <CreateExpense id={id} aiPrefill={aiPrefill} />;
};

export default CreateExpensesPage;
