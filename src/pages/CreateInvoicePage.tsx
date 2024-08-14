import CreateInvoice from "@features/Invoices/CreateInvoice";
import { useParams } from "react-router-dom";

const CreateInvoicePage = () => {
	const { id } = useParams<{ id?: string }>();
	return <CreateInvoice id={id} />;
};

export default CreateInvoicePage;
