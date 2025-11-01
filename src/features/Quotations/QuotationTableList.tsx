import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useQuotationControllerFindAll } from "@api/services/quotation";
import { useAuthStore } from "@store/auth";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { currencyFormatter, parseDateStringToFormat } from "@shared/formatter";
import { Quotation } from "@api/services/models";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import { useQuotationHook } from "./QuotationHooks/useQuotationHook";
import { Constants } from "@shared/constants";
import { useTranslation } from "react-i18next";

const QuotationTableList = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const quationdata = useQuotationControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleDelete, handleEdit, handleView } = useQuotationHook();
	const columns: GridColDef<Quotation>[] = [
		{
			field: "quatation_number",
			headerName: t("quotation.number", { defaultValue: "Quotation Number" }),
			flex: 1,
			minWidth: 150,

			renderCell: (params) => {
				return (
					<Typography variant="h6" color={"secondary"}>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "date",
			headerName: t("quotation.date", { defaultValue: "Quotation Date" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "expiry_at",
			headerName: t("quotation.expiryDate", { defaultValue: "Expiry Date" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{parseDateStringToFormat(params.value)}</Typography>;
			},
		},
		{
			field: "status",
			headerName: t("quotation.table.status", { defaultValue: "Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const statusKey = params.value?.toLowerCase().replace(/\s+/g, "") || "";
				const translatedStatus = t(`quotation.status.${statusKey}`, {
					defaultValue: params.value || "",
				});
				return (
					<Chip
						label={translatedStatus}
						color={Constants?.invoiceStatusColorEnums[params?.value] ?? "default"}
						variant="filled"
					/>
				);
			},
		},

		{
			field: "total",
			headerName: t("quotation.total", { defaultValue: "Total" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>{currencyFormatter(params.value, user?.currency?.short_code)}</Typography>
				);
			},
		},
		{
			field: "action",
			headerName: t("quotation.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("quotation.table.view", { defaultValue: "View Quotation" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleView(params.row.id);
							}}
							src={VisibilityIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("quotation.table.edit", { defaultValue: "Edit Quotation" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							onClick={() => {
								handleEdit(params.row.id);
							}}
							src={EditIcon}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("quotation.table.delete", { defaultValue: "Delete Quotation" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("quotation.actions.deleteTitle", { defaultValue: "Delete Quotation" }),
									message: t("quotation.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this quotation?",
									}),
									onConfirm: async () => {
										await handleDelete(params.row.id);
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: t("app.delete", { defaultValue: "Delete" }),
								});
							}}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (quationdata.isLoading) return <Loader />;

	return (
		<Box>
			<DataGrid autoHeight rows={quationdata?.data} columns={columns} />
		</Box>
	);
};

export default QuotationTableList;
