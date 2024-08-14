import CreateExpense from "@features/Expenses/CreateExpense";
import { useParams } from "react-router-dom";
const CreateExpensesPage = () => {
	const { id } = useParams<{ id?: string }>();
	return <CreateExpense id={id} />;
};

export default CreateExpensesPage;
