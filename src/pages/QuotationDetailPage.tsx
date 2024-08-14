import QuotationDetail from "@features/Quotations/QuotationDetail";
import { useParams } from "react-router-dom";

const QuotationDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	return <QuotationDetail quotationId={id ?? ""} IsPublic={false} />;
};

export default QuotationDetailPage;
