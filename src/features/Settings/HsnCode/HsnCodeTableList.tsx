import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Typography } from "@mui/material";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	getHsncodeControllerFindAllQueryKey,
	useHsncodeControllerFindAll,
	useHsncodeControllerRemove,
} from "@api/services/hsncode";
import Loader from "@shared/components/Loader";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";
import { getTaxcodeControllerFindAllQueryKey } from "@api/services/tax-code";

const HsnCodeTableList = () => {
	const queryClient = useQueryClient();
	const allHsnCode = useHsncodeControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeHsnCode = useHsncodeControllerRemove();
	const { updateHsnCode } = useCreateHsnCodeStore.getState();

	const columns: GridColDef[] = [
		{
			field: "code",
			headerName: "Code",
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
				<Tooltip title="Edit HSN Code" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateHsnCode(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete HSN Code" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete HSN Code",
									message: "Are you sure you want to delete this HSN Code?",
									onConfirm: async () => {
										await removeHsnCode.mutateAsync({ id: params.row.id });

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
	if (allHsnCode?.isLoading || allHsnCode?.isFetching) {
		return <Loader />;
	}
	return (
		<Box width={{ xs: "85vw", sm: "100%" }}>
			<DataGrid autoHeight rows={allHsnCode?.data} columns={columns} />
		</Box>
	);
};

export default HsnCodeTableList;
