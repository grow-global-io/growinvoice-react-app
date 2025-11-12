import InvoiceDetail from "@features/Invoices/InvoiceDetail";
import { useParams } from "react-router-dom";
const InvoiceTemplatePage = () => {
	const { id } = useParams<{ id?: string }>();
	// Allow everyone to view the invoice regardless of login status
	return <InvoiceDetail invoiceId={id ?? ""} IsPublic={true} />;
};

export default InvoiceTemplatePage;
