import {
	getGatewaydetailsControllerFindAllQueryKey,
	useGatewaydetailsControllerFindAll,
	useGatewaydetailsControllerRemove,
} from "@api/services/gatewaydetails";
import { Box, Chip, Grid, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const ShippingServicesList = ({ onEdit }: { onEdit: (id: string) => void }) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const gateWayList = useGatewaydetailsControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeService = useGatewaydetailsControllerRemove();

	// Filter only shipping services (for now, only Shiprocket)
	// Once backend adds Shiprocket to the enum, we can use: type === "Shiprocket"
	const shippingServices =
		gateWayList.data?.filter((item) => String(item.type).toLowerCase().includes("shiprocket")) ||
		[];

	const columns: GridColDef[] = [
		{
			field: "type",
			headerName: t("shippingServices.table.service", { defaultValue: "Service" }),
			minWidth: 150,
			flex: 1,
		},
		{
			field: "enabled",
			headerName: t("shippingServices.table.status", { defaultValue: "Status" }),
			minWidth: 150,
			flex: 1,
			renderCell: (params) => {
				return (
					<Chip
						label={
							params.value
								? t("shippingServices.enabled", { defaultValue: "Enabled" })
								: t("shippingServices.disabled", { defaultValue: "Disabled" })
						}
						color={params.value ? "success" : "error"}
					/>
				);
			},
		},
		{
			field: "action",
			headerName: t("shippingServices.table.action", { defaultValue: "Action" }),
			flex: 1,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("shippingServices.table.edit", { defaultValue: "Edit" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								onEdit(params.row.id);
							}}
						/>
					</Box>
				</Tooltip>,

				<Tooltip title={t("app.delete", { defaultValue: "Delete" })} key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("shippingServices.actions.deleteTitle", {
										defaultValue: "Delete this Shipping Service?",
									}),
									message: t("shippingServices.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this Shipping Service?",
									}),
									onConfirm: async () => {
										await removeService.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getGatewaydetailsControllerFindAllQueryKey(),
										});
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

	if (gateWayList?.isLoading || gateWayList?.isRefetching) {
		return <Loader />;
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<DataGrid autoHeight rows={shippingServices} columns={columns} />
			</Grid>
		</Grid>
	);
};

export default ShippingServicesList;
