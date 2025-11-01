import InvoiceDetail from "@features/Invoices/InvoiceDetail";
import NoDataFound from "@shared/components/NoDataFound";
import { useAuthStore } from "@store/auth";
import { useParams } from "react-router-dom";
const InvoiceTemplatePage = () => {
	const { id } = useParams<{ id?: string }>();
	const { user } = useAuthStore();
	if (user) {
		return <NoDataFound message="Only customers can view this invoice." />;
	}
	return <InvoiceDetail invoiceId={id ?? ""} IsPublic={true} />;
};

export default InvoiceTemplatePage;
