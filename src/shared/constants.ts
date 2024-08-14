import invoiceIcon from "@assets/img/invoice-icon.png";
import BgImageSvg from "@assets/bgpng.png";
import GroupUser from "@assets/img/group-user.png";
import InvoiceFile from "@assets/img/invoice-file.png";
import Estimate from "@assets/img/estimate.png";
import Amount from "@assets/img/due-amount.png";
import GetStartedImage from "@assets/img/greet-img.png";
import LeftDownArr from "@assets/img/left-down-arrow.png";
import DueDateRed from "@assets/img/due-date-red.png";
import DueDateBlue from "@assets/img/due-date-blue.png";
import Stack from "@assets/img/stack.png";
import Logo from "@assets/logo.svg";
import Eye from "@assets/img/eye.png";
import GreenCheck from "@assets/img/green-check.png";
import UnpaidSymbol from "@assets/img/unpaid-symbol.png";
import UpdatePassWordIcon from "@assets/img/update-pass-icon.png";
import ProductSymbol from "@assets/img/new-product-symbol.png";
import CustomerImg from "@assets/img/customer-img.png";
import BillingAddressIcon from "@assets/img/billing-address-icon.png";
import CloseIcon from "@assets/img/close-icon.png";
import PencilEditIcon from "@assets/img/edit-pencil-icon.png";
import FinancialIcon from "@assets/img/financial-icon.png";
import QuotationIcon from "@assets/img/quotation-icon.png";
import OrangeNoticeIcon from "@assets/img/onrange-notice-icon.png";
import redNoticeIcon from "@assets/img/red-notice-icon.png";
import BlueLocationIcon from "@assets/img/bluelocationIcon.png";
import Template1 from "@assets/img/template_1.png";
import Template2 from "@assets/img/template_2.png";
import Template3 from "@assets/img/template_3.jpg";
import Template4 from "@assets/img/template_4.jpg";
import TemplateIcon from "@assets/img/invoice-template-icon.png";

export type AddressExpressions = {
	companyAddressTemplate: Array<{ name: string; label: string }>;
	customerBillingAddressTemplate: Array<{ name: string; label: string }>;
	customerShippingAddressTemplate: Array<{ name: string; label: string }>;
};
export class Constants {
	static readonly customImages = {
		invoiceIcon,
		BgImageSvg,
		GroupUser,
		InvoiceFile,
		Estimate,
		Amount,
		GetStartedImage,
		LeftDownArr,
		DueDateRed,
		DueDateBlue,
		Stack,
		Logo,
		Eye,
		GreenCheck,
		UnpaidSymbol,
		UpdatePassWordIcon,
		ProductSymbol,
		CustomerImg,
		BillingAddressIcon,
		CloseIcon,
		FinancialIcon,
		PencilEditIcon,
		QuotationIcon,
		OrangeNoticeIcon,
		redNoticeIcon,
		BlueLocationIcon,
		Template1,
		Template2,
		Template3,
		Template4,
		TemplateIcon,
	};

	static readonly addressExpressions: AddressExpressions = {
		companyAddressTemplate: [
			{ name: "company_name", label: "{company.name}" },
			{ name: "company_vat_number", label: "{company.vat}" },
			{ name: "company_billing_address_1", label: "{company.address}" },
			{ name: "company_billing_city", label: "{company.city}" },
			{ name: "company_billing_state", label: "{company.state}" },
			{ name: "company_billing_country", label: "{company.country}" },
			{ name: "company_billing_phone", label: "{company.phone}" },
			{ name: "company_billing_zip", label: "{company.zip}" },
		],
		customerBillingAddressTemplate: [
			{ name: "customer_name", label: "{customer.name}" },
			{ name: "customer_address", label: "{customer.address}" },
			{ name: "customer_phone", label: "{customer.phone}" },
			{ name: "customer_billing_city", label: "{customer.city}" },
			{ name: "customer_billing_state", label: "{customer.state}" },
			{ name: "customer_billing_country", label: "{customer.country}" },
			{ name: "customer_billing_zip", label: "{customer.zip}" },
		],
		customerShippingAddressTemplate: [
			{ name: "customer_name", label: "{customer.name}" },
			{ name: "customer_address", label: "{customer.address}" },
			{ name: "customer_phone", label: "{customer.phone}" },
			{ name: "customer_billing_city", label: "{customer.city}" },
			{ name: "customer_billing_state", label: "{customer.state}" },
			{ name: "customer_billing_country", label: "{customer.country}" },
			{ name: "customer_billing_zip", label: "{customer.zip}" },
		],
	};

	static readonly dashboardType = {
		Table: "Table",
		Graph: "Graph",
	};

	static readonly invoiceDefaultPrefix = "INV";

	static readonly quotationDefaultPrefix = "QUO";

	static readonly invoiceStatusColorEnums: {
		[key: string]: "default" | "info" | "warning" | "success" | "secondary" | "primary" | "error";
	} = {
		Draft: "error",
		"Mailed to customer": "info",
		Viewed: "warning",
		Paid: "success",
		Unpaid: "warning",
		Accepted: "success",
		Rejected: "error",
	};
}
