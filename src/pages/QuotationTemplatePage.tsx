import QuotationDetail from "@features/Quotations/QuotationDetail";
import { useParams } from "react-router-dom";
const QuotationTemplatePage = () => {
	const { id } = useParams<{ id?: string }>();
	return <QuotationDetail quotationId={id ?? ""} IsPublic={true} />;
};

export default QuotationTemplatePage;
