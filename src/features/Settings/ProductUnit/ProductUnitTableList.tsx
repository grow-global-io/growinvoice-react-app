import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	getProductunitControllerFindAllQueryKey,
	useProductunitControllerFindAll,
	useProductunitControllerRemove,
} from "@api/services/productunit";
import Loader from "@shared/components/Loader";
import { Box, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";

const ProductUnitTableList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const allProductUnit = useProductunitControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeProductUnit = useProductunitControllerRemove();
	const { updateProductUnit } = useCreateProductUnitStore.getState();
	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: t("productUnit.table.name", { defaultValue: "Name" }),
			flex: 1,
			minWidth: 150,
		},
		{
			field: "action",
			headerName: t("productUnit.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("productUnit.table.edit", { defaultValue: "Edit Product Unit" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateProductUnit(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("productUnit.table.delete", { defaultValue: "Delete Product Unit" })}
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
									title: t("productUnit.actions.deleteTitle", {
										defaultValue: "Delete Product Unit",
									}),
									message: t("productUnit.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this Product Unit?",
									}),
									onConfirm: async () => {
										await removeProductUnit.mutateAsync({ id: params.row.id });

										await queryClient.refetchQueries({
											queryKey: getProductunitControllerFindAllQueryKey(),
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
	if (allProductUnit?.isLoading || allProductUnit.isFetching) {
		return <Loader />;
	}
	return (
		<DataGrid
			autoHeight
			rows={allProductUnit?.data}
			columns={columns}
			sx={{
				width: {
					sm: "100%",
					md: "100%",
					lg: "99%",
				},
			}}
		/>
	);
};

export default ProductUnitTableList;
