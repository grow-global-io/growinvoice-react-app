import { Box, Grid, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// TODO: Replace with actual API hooks when backend is ready
// For now, using mock data structure
interface PickupAddress {
	id: string;
	address: string;
	city: string;
	state?: string;
	country?: string;
	zipCode: string;
	isDefault?: boolean;
	createdAt?: string;
}

const PickupAddressList = ({ onEdit }: { onEdit: (id: string) => void }) => {
	const { t } = useTranslation();
	const { handleOpen, cleanUp } = useConfirmDialogStore();

	// TODO: Replace with actual API call
	// const pickupAddressList = usePickupAddressControllerFindAll();
	const [pickupAddresses] = useState<PickupAddress[]>([]);
	const isLoading = false;

	const handleDelete = (id: string) => {
		handleOpen({
			title: t("pickupAddress.actions.deleteTitle", {
				defaultValue: "Delete this Pickup Address?",
			}),
			message: t("pickupAddress.actions.deleteConfirm", {
				defaultValue: "Are you sure you want to delete this Pickup Address?",
			}),
			onConfirm: async () => {
				// TODO: Replace with actual API call
				// await removePickupAddress.mutateAsync({ id });
				console.log("Delete pickup address:", id);
			},
			onCancel: () => {
				cleanUp();
			},
			confirmButtonText: t("app.delete", { defaultValue: "Delete" }),
		});
	};

	const columns: GridColDef[] = [
		{
			field: "address",
			headerName: t("pickupAddress.table.address", { defaultValue: "Address" }),
			minWidth: 200,
			flex: 2,
		},
		{
			field: "city",
			headerName: t("pickupAddress.table.city", { defaultValue: "City" }),
			minWidth: 150,
			flex: 1,
		},
		{
			field: "state",
			headerName: t("pickupAddress.table.state", { defaultValue: "State" }),
			minWidth: 150,
			flex: 1,
		},
		{
			field: "country",
			headerName: t("pickupAddress.table.country", { defaultValue: "Country" }),
			minWidth: 150,
			flex: 1,
		},
		{
			field: "zipCode",
			headerName: t("pickupAddress.table.zipCode", { defaultValue: "Zip Code" }),
			minWidth: 120,
			flex: 1,
		},
		{
			field: "action",
			headerName: t("pickupAddress.table.action", { defaultValue: "Action" }),
			flex: 1,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("pickupAddress.table.edit", { defaultValue: "Edit" })}
					key={`edit-${params.row?.id}`}
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

				<Tooltip
					title={t("app.delete", { defaultValue: "Delete" })}
					key={`delete-${params.row?.id}`}
				>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={() => handleDelete(params.row.id)}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<DataGrid autoHeight rows={pickupAddresses} columns={columns} />
			</Grid>
		</Grid>
	);
};

export default PickupAddressList;
