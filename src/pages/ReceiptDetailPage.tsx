import InvoiceDetail from "@features/Invoices/InvoiceDetail";
import NoDataFound from "@shared/components/NoDataFound";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ReceiptDetailPage = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();

	if (id === undefined)
		return (
			<NoDataFound
				message={t("invoice.detail.noInvoiceFound", { defaultValue: "No Invoice Found" })}
			/>
		);

	return <InvoiceDetail invoiceId={id} />;
};

export default ReceiptDetailPage;
