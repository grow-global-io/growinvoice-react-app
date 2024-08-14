import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Typography } from "@mui/material";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	getTaxcodeControllerFindAllQueryKey,
	useTaxcodeControllerFindAll,
	useTaxcodeControllerRemove,
} from "@api/services/tax-code";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialogStore } from "@store/confirmDialog";
import Loader from "@shared/components/Loader";
import { useCreateTaxCodeStore } from "@store/createTaxCodeStore";
import { getHsncodeControllerFindAllQueryKey } from "@api/services/hsncode";

const TaxTypeTableList = () => {
	const queryClient = useQueryClient();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const allTaxCode = useTaxcodeControllerFindAll();
	const removeTaxCode = useTaxcodeControllerRemove();
	const { updateTaxCode } = useCreateTaxCodeStore.getState();

	const columns: GridColDef[] = [
		{
			field: "percentage",
			headerName: "Percentage",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="Edit Tax Type" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateTaxCode(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Tax Type" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Tax Type",
									message: "Are you sure you want to delete this Tax Type?",
									onConfirm: async () => {
										await removeTaxCode.mutateAsync({ id: params.row.id });
										await queryClient.refetchQueries({
											queryKey: getHsncodeControllerFindAllQueryKey(),
										});
										await queryClient.refetchQueries({
											queryKey: getTaxcodeControllerFindAllQueryKey(),
										});
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: "Delete",
								});
							}}
						/>
						,
					</Box>
				</Tooltip>,
			],
		},
	];
	if (allTaxCode?.isLoading || allTaxCode?.isFetching) {
		return <Loader />;
	}
	return (
		<Box width={{ xs: "85vw", sm: "100%" }}>
			<DataGrid autoHeight rows={allTaxCode?.data} columns={columns} />
		</Box>
	);
};

export default TaxTypeTableList;
