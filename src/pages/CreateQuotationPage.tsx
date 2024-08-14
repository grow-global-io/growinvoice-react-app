import CreateQuotation from "@features/Quotations/CreateQuotation";
import { useParams } from "react-router-dom";
const CreateQuotationPage = () => {
	const { id } = useParams<{ id?: string }>();
	return <CreateQuotation id={id} />;
};

export default CreateQuotationPage;
