import { useInvoiceControllerFindAll } from "@api/services/invoice";
import { type Invoice } from "@api/services/models";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import { Constants } from "@shared/constants";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";
import { useTranslation } from "react-i18next";

const InvoicesManagementList = () => {
	const { t } = useTranslation();
	const invoice = useInvoiceControllerFindAll();
	const { handleView } = useInvoiceHook();

	const columns: GridColDef<Invoice>[] = [
		{
			field: "user",
			headerName: "User",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Box sx={{ cursor: "pointer" }}>
						<Typography variant="h6" color={"secondary"}>
							{params.row?.user?.name}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: "source",
			headerName: "Source",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const sourceLabel = params.row.fromStore
					? t("invoice.source.store", { defaultValue: "Store" })
					: t("invoice.source.direct", { defaultValue: "Direct" });
				return <Chip label={sourceLabel} variant="filled" color="primary" />;
			},
		},
		{
			field: "due_date",
			headerName: "Due Date",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const statusKey = params.value?.toLowerCase().replace(/\s+/g, "") || "";
				let translatedStatus = t(`invoice.status.${statusKey}`, {
					defaultValue: params.value || "",
				});
				// Explicitly map "Mailed to customer" to "Receipt Sent"
				if (params.value === "Mailed to customer") {
					translatedStatus = t("invoice.status.mailedtocustomer", { defaultValue: "Receipt Sent" });
				}
				return (
					<Chip
						label={translatedStatus}
						color={
							Constants?.invoiceStatusColorEnums[params.value] ??
							Constants?.invoiceStatusColorEnums["Receipt Sent"] ??
							"default"
						}
						variant="filled"
					/>
				);
			},
		},
		{
			field: "total",
			headerName: "Total",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(params.value, params.row.currency?.short_code)}
					</Typography>
				);
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="View Invoice" key={params.row?.id}>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleView(params.row.id);
							}}
							src={VisibilityIcon}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (invoice.isLoading) {
		return <Loader />;
	}
	return (
		<Box>
			<DataGrid autoHeight rows={invoice.data ?? []} columns={columns} />
		</Box>
	);
};

export default InvoicesManagementList;
