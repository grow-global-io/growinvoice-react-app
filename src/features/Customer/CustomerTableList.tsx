import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Tooltip, Typography } from "@mui/material";
import {
	getCustomerControllerFindAllQueryKey,
	useCustomerControllerFindAll,
	useCustomerControllerRemove,
} from "@api/services/customer";
import Loader from "@shared/components/Loader";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useDialog } from "@shared/hooks/useDialog";
import CustomerView from "./CustomerView";
import VisibilityIcon from "@mui/icons-material/Visibility";

const CustomerTableList = () => {
	const queryClient = useQueryClient();
	const CustomerData = useCustomerControllerFindAll();
	const { updateCustomer } = useCreateCustomerStore.getState();
	const removeCustomer = useCustomerControllerRemove();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const [viewCustomerId, setViewCustomerId] = React.useState<string | null>(null);
	const { handleClickOpen, handleClose, open } = useDialog();

	const openCustomerView = (id: string) => {
		setViewCustomerId(id);
		handleClickOpen();
	};

	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "Full Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="h6" color="secondary" textTransform={"capitalize"}>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "display_name",
			headerName: "Display Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography textTransform={"capitalize"}>{params.value}</Typography>;
			},
		},
		{
			field: "email",
			headerName: "Contact Email",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "phone",
			headerName: "Contact Number",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "_count",
			headerName: "Invoice",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params?.value?.invoice}</Typography>;
			},
		},

		{
			field: "totalDue",
			headerName: "Amount Due",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography>
						<Chip label={params?.value} variant="filled" color={"error"} />
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
				<Tooltip title="View Customer" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								openCustomerView(params.row.id);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Edit Customer" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateCustomer(params.row);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip title="Delete Customer" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Customer",
									message: "Are you sure you want to delete this customer?",
									onConfirm: async () => {
										await removeCustomer.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getCustomerControllerFindAllQueryKey(),
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

	if (CustomerData.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<DataGrid autoHeight rows={CustomerData?.data} columns={columns} />
			<CustomerView open={open} handleClose={handleClose} customerId={viewCustomerId ?? ""} />
		</Box>
	);
};

export default CustomerTableList;
