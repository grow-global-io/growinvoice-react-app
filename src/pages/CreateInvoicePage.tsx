import CreateInvoice from "@features/Invoices/CreateInvoice";
import type { AiInvoicePrefill } from "@features/Invoices/types/aiInvoicePrefill";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

const CreateInvoicePage = () => {
	const { id } = useParams<{ id?: string }>();
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const customerId = searchParams.get("customerId");
	const aiPrefill = (location.state as { fromAiPrefill?: AiInvoicePrefill } | null)?.fromAiPrefill;
	return (
		<CreateInvoice
			id={id}
			customerId={customerId ?? undefined}
			aiPrefill={aiPrefill}
		/>
	);
};

export default CreateInvoicePage;
