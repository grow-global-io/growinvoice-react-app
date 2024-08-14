import InvoiceDetail from "@features/Invoices/InvoiceDetail";
import { useParams } from "react-router-dom";
const InvoiceTemplatePage = () => {
	const { id } = useParams<{ id?: string }>();
	return <InvoiceDetail invoiceId={id ?? ""} IsPublic={true} />;
};

export default InvoiceTemplatePage;
