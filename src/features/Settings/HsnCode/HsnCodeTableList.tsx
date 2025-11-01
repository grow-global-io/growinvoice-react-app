import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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
import { type HSNCode } from "@api/services/models";
import { useTranslation } from "react-i18next";

const HsnCodeTableList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const allHsnCode = useHsncodeControllerFindAll();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const removeHsnCode = useHsncodeControllerRemove();
	const { updateHsnCode } = useCreateHsnCodeStore.getState();

	const columns: GridColDef<HSNCode>[] = [
		{
			field: "code",
			headerName: t("hsn.table.code", { defaultValue: "Code" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "percentage",
			headerName: t("hsn.table.percentage", { defaultValue: "Percentage" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.row.tax?.percentage}%</Typography>;
			},
		},
		{
			field: "action",
			headerName: t("hsn.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("hsn.table.edit", { defaultValue: "Edit HSN Code" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateHsnCode(params.row?.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("hsn.table.delete", { defaultValue: "Delete HSN Code" })}
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
									title: t("hsn.actions.deleteTitle", { defaultValue: "Delete HSN Code" }),
									message: t("hsn.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this HSN Code?",
									}),
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
									confirmButtonText: t("app.delete", { defaultValue: "Delete" }),
								});
							}}
						/>
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
