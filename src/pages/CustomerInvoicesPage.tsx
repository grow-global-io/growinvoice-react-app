import CustomersInvoicesSections from "../features/Customer/CustomersInvoicesSections";
import { useParams } from "react-router-dom";
import NoDataFound from "../shared/components/NoDataFound";

const CustomerInvoicesPage = () => {
	const { customerId } = useParams<{ customerId: string }>();
	if (!customerId) {
		return <NoDataFound message="Customer is required" />;
	}
	return <CustomersInvoicesSections customerId={customerId} />;
};

export default CustomerInvoicesPage;
