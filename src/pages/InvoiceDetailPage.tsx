import InvoiceDetail from "@features/Invoices/InvoiceDetail";
import NoDataFound from "@shared/components/NoDataFound";
import { useParams } from "react-router-dom";

const InvoiceDetailPage = () => {
	const { id } = useParams<{ id: string }>();

	if (id === undefined) return <NoDataFound message="No Invoice Found" />;

	return <InvoiceDetail invoiceId={id} />;
};

export default InvoiceDetailPage;
