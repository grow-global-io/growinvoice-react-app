import { Box, Tooltip, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import {
	getVendorsControllerFindAllQueryKey,
	useVendorsControllerFindAll,
	useVendorsControllerRemove,
} from "@api/services/vendors";
import { timeAgo } from "@shared/formatter";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";
import { useTranslation } from "react-i18next";

const VendorsTableList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const allvendors = useVendorsControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { updateVendors } = useCreateVendorsStore.getState();
	const removeVendors = useVendorsControllerRemove();
	const { openVendorsView } = useCreateVendorsViewStore.getState();

	const columns: GridColDef[] = [
		{
			field: "display_name",
			headerName: t("vendor.displayName", { defaultValue: "Display Name" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="body1" color="secondary">
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "name",
			headerName: t("vendorForm.contactName", { defaultValue: "Contact Name" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "createdAt",
			headerName: t("vendor.table.createdAt", { defaultValue: "Created At" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{timeAgo(params.value, t)}</Typography>;
			},
		},
		{
			field: "action",
			headerName: t("vendor.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("vendor.table.viewVendor", { defaultValue: "View Vendor" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								openVendorsView(params.row.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("vendor.table.editVendor", { defaultValue: "Edit Vendor" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateVendors(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("vendor.table.deleteVendor", { defaultValue: "Delete Vendor" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: t("vendor.actions.deleteTitle", { defaultValue: "Delete Vendor" }),
									message: t("vendor.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this vendor?",
									}),
									onConfirm: async () => {
										await removeVendors.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getVendorsControllerFindAllQueryKey(),
										});
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: t("common.delete", { defaultValue: "Delete" }),
								});
							}}
						/>
						,
					</Box>
				</Tooltip>,
			],
		},
	];

	if (allvendors.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid autoHeight rows={allvendors?.data} columns={columns} />
			{/* <VendorViewDialog  open={open} handleClose={handleClose} vendorId={viewVendorId ?? ""} /> */}
		</Box>
	);
};

export default VendorsTableList;
