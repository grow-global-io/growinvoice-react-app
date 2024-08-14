import {
	getQuotationControllerFindAllQueryKey,
	getQuotationControllerQuotationPublicFindOneQueryKey,
	getQuotationControllerTestQueryKey,
	useQuotationControllerConvertToInvoice,
	useQuotationControllerInvoiceSentToMail,
	useQuotationControllerMarkedAsAccepted,
	useQuotationControllerMarkedAsMailed,
	useQuotationControllerMarkedAsRejected,
	useQuotationControllerRemove,
} from "@api/services/quotation";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
} from "@api/services/invoice";

export const useQuotationHook = () => {
	const navigate = useNavigate();
	const removeQuotation = useQuotationControllerRemove();
	const queryClient = useQueryClient();

	const sendQuotationMail = useQuotationControllerInvoiceSentToMail();

	const handleView = (quotationId: string) => {
		navigate(`/quotation/quotationdetails/${quotationId}`);
	};

	const handleEdit = (quotationId: string) => {
		navigate(`/quotation/createquotation/${quotationId}`);
	};

	const handleDelete = async (quotationId: string) => {
		await removeQuotation.mutateAsync({ id: quotationId });
		queryClient.refetchQueries({
			queryKey: getQuotationControllerFindAllQueryKey(),
		});
		refetchQueries(quotationId);
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerTestQueryKey(quotationId),
		});
	};

	const refetchQueries = async (quotationId: string) => {
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerQuotationPublicFindOneQueryKey(quotationId),
		});
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerFindAllQueryKey(),
		});
		await queryClient.refetchQueries({
			queryKey: getQuotationControllerTestQueryKey(quotationId),
		});
	};

	const handleSendMail = async (quotationId: string, email: string) => {
		const invoiceLink = `${window.location.origin}/quotation/quotationtemplate/${quotationId}`;
		const sendMailDto = {
			email: email,
			subject: "Quotation Details",
			body: `
                <p>Please find the attached quotation. You can also view the quotation online by clicking the button below:</p>
                <a href="${invoiceLink}" style="text-decoration: none;">
                    <button style="
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: white;
                        background-color: #007BFF;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        View Quotation
                    </button>
                </a>
            `,
		};

		await sendQuotationMail.mutateAsync({
			data: sendMailDto,
			params: {
				id: quotationId,
			},
		});
		await refetchQueries(quotationId);
	};

	const convertToInvoice = useQuotationControllerConvertToInvoice();
	const handleConvertToInvoice = async (quotationId: string) => {
		await convertToInvoice.mutateAsync({
			params: {
				id: quotationId,
			},
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});
		queryClient?.refetchQueries({
			queryKey: getQuotationControllerTestQueryKey(quotationId),
		});
		refetchQueries(quotationId);
		navigate("/invoice/invoicelist");
	};

	const markedAccepted = useQuotationControllerMarkedAsAccepted();
	const handleMarkedAccepted = async (quotationId: string) => {
		await markedAccepted.mutateAsync({
			params: {
				id: quotationId,
			},
		});
		refetchQueries(quotationId);
	};

	const markedRejected = useQuotationControllerMarkedAsRejected();
	const handleMarkedRejected = async (quotationId: string) => {
		await markedRejected.mutateAsync({
			params: {
				id: quotationId,
			},
		});
		refetchQueries(quotationId);
	};

	const markedMailedSent = useQuotationControllerMarkedAsMailed();
	const handleMarkedSendMail = async (quotationId: string) => {
		await markedMailedSent.mutateAsync({
			params: {
				id: quotationId,
			},
		});
		refetchQueries(quotationId);
	};

	const handleShare = (quotationId: string) => {
		navigate(`/quotation/quotationtemplate/${quotationId}`);
	};

	return {
		handleView,
		handleEdit,
		handleDelete,
		handleSendMail,
		handleConvertToInvoice,
		handleMarkedAccepted,
		handleMarkedRejected,
		handleMarkedSendMail,
		handleShare,
	};
};
