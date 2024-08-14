import LoginPage from "@pages/LoginPage";
import MainHomePage from "@pages/MainHomePage";
import RegisterPage from "@pages/RegisterPage";
import OveviewPage from "@pages/OveviewPage";
import { Route } from "@shared/models/Route";
import ResetPassword from "@features/Authentication/ResetPassword";
import ProductListPage from "@pages/ProductListPage";
import CreateProductPage from "@pages/CreateProductPage";
import CustomerListPage from "@pages/CustomerListPage";
import CreateCustomerPage from "@pages/CreateCustomerPage";
import InvoiceListPage from "@pages/InvoiceListPage";
import CreateInvoicePage from "@pages/CreateInvoicePage";
import CreateQuotationPage from "@pages/CreateQuotationPage";
import QuotationListPage from "@pages/QuotationListPage";
import MyProfilePage from "@pages/MyProfilePage";
import MemberShipPage from "@pages/MemberShipPage";
import PreferencesPage from "@pages/PreferencesPage";
import CompanyPage from "@pages/CompanyPage";
import InvoicesPage from "@pages/InvoicesPage";
import ApiCredentialsPage from "@pages/ApiCredentialsPage";
import InvoiceDetailPage from "@pages/InvoiceDetailPage";
import QuotationDetailPage from "@pages/QuotationDetailPage";
import InvoiceTemplatePage from "@pages/InvoiceTemplatePage";
import DashboardPage from "@pages/DashboardPage";
import QuotationSettingsPage from "@pages/QuotationSettingsPage";
import QuotationTemplatePage from "@pages/QuotationTemplatePage";
import PaymentsListPage from "@pages/PaymentsListPage";
import VendorsListPage from "@pages/VendorsListPage";
import PaymentDetailsPage from "@pages/PaymentDetailsPage";
import GateWayDetailsPage from "@pages/GateWayDetailsPage";
import PaymentSuccessPage from "@pages/PaymentSuccessPage";
import PlansPage from "@pages/PlansPage";
import CreateExpensesPage from "@pages/CreateExpensesPage";
import ExpensesListPage from "@pages/ExpensesListPage";
import HsnCodeListPage from "@pages/HsnCodeListPage";
import TaxCodeListPage from "@pages/TaxCodeListPage";
import ProductUnitListPage from "@pages/ProductUnitListPage";
import ProductSalesPage from "@pages/ProductSalesPage";
import CustomerSalesPage from "@pages/CustomerSalesPage";
import ProfitLossPage from "@pages/ProfitLossPage";
import ExpensesPage from "@pages/ExpensesPage";
import VendorsPage from "@pages/VendorsPage";

export const unProtectedRoutes: Route[] = [
	{
		path: "/",
		Component: MainHomePage,
	},
	{
		path: "/login",
		Component: LoginPage,
	},
	{
		path: "/register",
		Component: RegisterPage,
	},
	{
		path: "/reset-password",
		Component: ResetPassword,
	},
	{
		path: "/invoice/invoicetemplate/:id",
		Component: InvoiceTemplatePage,
	},
	{
		path: "/quotation/quotationtemplate/:id",
		Component: QuotationTemplatePage,
	},
	{
		path: "/payment/success",
		Component: PaymentSuccessPage,
	},
];

export const protectedRoutes: Route[] = [
	{
		path: "/",
		Component: OveviewPage,
	},
	{
		path: "/product/productlist",
		Component: ProductListPage,
	},
	{
		path: "/product/createproduct",
		Component: CreateProductPage,
	},
	{
		path: "/customer/customerlist",
		Component: CustomerListPage,
	},
	{
		path: "/customer/createcustomer",
		Component: CreateCustomerPage,
	},
	{
		path: "/invoice/invoicelist",
		Component: InvoiceListPage,
	},
	{
		path: "/invoice/createinvoice",
		Component: CreateInvoicePage,
	},
	{
		path: "/invoice/invoicedetails/:id",
		Component: InvoiceDetailPage,
	},
	{
		path: "/invoice/createinvoice/:id",
		Component: CreateInvoicePage,
	},
	{
		path: "/quotation/createquotation",
		Component: CreateQuotationPage,
	},
	{
		path: "/quotation/createquotation/:id",
		Component: CreateQuotationPage,
	},
	{
		path: "/quotation/quotationlist",
		Component: QuotationListPage,
	},
	{
		path: "/quotation/quotationdetails/:id",
		Component: QuotationDetailPage,
	},
	{
		path: "/setting/myprofile",
		Component: MyProfilePage,
	},
	{
		path: "/setting/membership",
		Component: MemberShipPage,
	},
	{
		path: "/setting/company",
		Component: CompanyPage,
	},
	{
		path: "/setting/preferences",
		Component: PreferencesPage,
	},
	{
		path: "/setting/invoices",
		Component: InvoicesPage,
	},
	{
		path: "/setting/productunit",
		Component: ProductUnitListPage,
	},
	{
		path: "/setting/hsncode",
		Component: HsnCodeListPage,
	},
	{
		path: "/setting/taxtype",
		Component: TaxCodeListPage,
	},
	{
		path: "/setting/apicredentials",
		Component: ApiCredentialsPage,
	},
	{
		path: "/invoice/invoicetemplate/:id",
		Component: InvoiceTemplatePage,
	},
	{
		path: "/quotation/quotationtemplate/:id",
		Component: QuotationTemplatePage,
	},
	{
		path: "/dashboard",
		Component: DashboardPage,
	},
	{
		path: "/setting/quotation",
		Component: QuotationSettingsPage,
	},
	{
		path: "/payment/paymentList",
		Component: PaymentsListPage,
	},
	{
		path: "/vendors/vendorslist",
		Component: VendorsListPage,
	},
	{
		path: "/plan/planspage",
		Component: PlansPage,
	},
	{
		path: "/setting/paymentdetails",
		Component: PaymentDetailsPage,
	},
	{
		path: "/setting/gatewaydetails",
		Component: GateWayDetailsPage,
	},
	{
		path: "/payment/success",
		Component: PaymentSuccessPage,
	},
	{
		path: "/expenses/createexpenses",
		Component: CreateExpensesPage,
	},
	{
		path: "/expenses/createexpenses/:id",
		Component: CreateExpensesPage,
	},
	{
		path: "/expenses/expenseslist",
		Component: ExpensesListPage,
	},
	{
		path: "/reports/productsales",
		Component: ProductSalesPage,
	},
	{
		path: "/reports/customersales",
		Component: CustomerSalesPage,
	},
	{
		path: "/reports/profitloss",
		Component: ProfitLossPage,
	},
	{
		path: "/reports/Expenses",
		Component: ExpensesPage,
	},
	{
		path: "/reports/vendors",
		Component: VendorsPage,
	},
];
