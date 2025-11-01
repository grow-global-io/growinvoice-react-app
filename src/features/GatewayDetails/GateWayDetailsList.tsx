import {
	getGatewaydetailsControllerFindAllQueryKey,
	useGatewaydetailsControllerFindAll,
	useGatewaydetailsControllerRemove,
} from "@api/services/gatewaydetails";
import { Box, Chip, Grid, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { GateWayDialog } from "./GateWayDetailsIndex";
import { useDialog } from "@shared/hooks/useDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const GateWayDetailsList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const gateWayList = useGatewaydetailsControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removePayment = useGatewaydetailsControllerRemove();
	const [editId, setEditId] = useState<string | null>(null);

	const columns: GridColDef[] = [
		{
			field: "type",
			headerName: t("gatewayDetails.table.type", { defaultValue: "Type" }),
			minWidth: 150,
			flex: 1,
		},
		{
			field: "enabled",
			headerName: t("gatewayDetails.table.status", { defaultValue: "Status" }),
			minWidth: 150,
			flex: 1,
			renderCell: (params) => {
				return (
					<Chip
						label={
							params.value
								? t("gatewayDetails.enabled", { defaultValue: "Enabled" })
								: t("gatewayDetails.disabled", { defaultValue: "Disabled" })
						}
						color={params.value ? "success" : "error"}
					/>
				);
			},
		},
		{
			field: "action",
			headerName: t("gatewayDetails.table.action", { defaultValue: "Action" }),
			flex: 1,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("gatewayDetails.table.edit", { defaultValue: "Edit" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								setEditId(params.row.id);
								handleClickOpen();
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
									title: t("gatewayDetails.actions.deleteTitle", {
										defaultValue: "Delete this Gateway Detail?",
									}),
									message: t("gatewayDetails.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this Gateway Detail?",
									}),
									onConfirm: async () => {
										await removePayment.mutateAsync({ id: params.row.id });
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
	const { handleClickOpen, handleClose, open } = useDialog();

	if (gateWayList?.isLoading || gateWayList?.isRefetching) {
		return <Loader />;
	}
	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<DataGrid autoHeight rows={gateWayList?.data ?? []} columns={columns} />
				</Grid>
			</Grid>
			<GateWayDialog handleClose={handleClose} open={open} editId={editId ?? undefined} />
		</>
	);
};

export default GateWayDetailsList;
