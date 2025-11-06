import CreateInvoice from "@features/Invoices/CreateInvoice";
import { useParams, useSearchParams } from "react-router-dom";

const CreateInvoicePage = () => {
	const { id } = useParams<{ id?: string }>();
	const [searchParams] = useSearchParams();
	const customerId = searchParams.get("customerId");
	return <CreateInvoice id={id} customerId={customerId ?? undefined} />;
};

export default CreateInvoicePage;
