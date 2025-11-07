import Box from "@mui/material/Box";
import { DataGrid, type GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
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
// import React from "react";
// import { useDialog } from "@shared/hooks/useDialog";
// import CustomerView from "./CustomerView";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type GetCustomerWithAddressDto } from "@api/services/models";
import { useMemo } from "react";
import { CustomToolbar } from "@shared/components/CustomToolbar";

const CustomerTableList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const CustomerData = useCustomerControllerFindAll();
	const { updateCustomer } = useCreateCustomerStore.getState();
	const removeCustomer = useCustomerControllerRemove();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	// const [viewCustomerId, setViewCustomerId] = React.useState<string | null>(null);
	// const { handleClickOpen, handleClose, open } = useDialog();

	// const openCustomerView = (id: string) => {
	// 	setViewCustomerId(id);
	// 	handleClickOpen();
	// };

	const columns: GridColDef<GetCustomerWithAddressDto>[] = [
		{
			field: "name",
			headerName: t("customer.table.fullName", { defaultValue: "Full Name" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography
						variant="h6"
						color="secondary"
						textTransform={"capitalize"}
						sx={{ cursor: "pointer" }}
						onClick={() => {
							// openCustomerView(params.row.id);
							navigate(`/invoice/customer/${params.row.id}`);
						}}
					>
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "source",
			headerName: t("customer.table.source", { defaultValue: "Source" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={
							params.row.fromStore
								? t("customer.table.store", { defaultValue: "Store" })
								: t("customer.table.direct", { defaultValue: "Direct" })
						}
						variant="filled"
						color="primary"
					/>
				);
			},
		},
		{
			field: "email",
			headerName: t("customer.table.contactEmail", { defaultValue: "Contact Email" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "phone",
			headerName: t("customer.table.contactNumber", { defaultValue: "Contact Number" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "_count",
			headerName: t("customer.table.invoiceCount", { defaultValue: "Invoice" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{params?.value?.invoice}</Typography>;
			},
		},

		{
			field: "totalDue",
			headerName: t("customer.table.amountDue", { defaultValue: "Amount Due" }),
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
			headerName: t("customer.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => [
				<Tooltip
					title={t("customer.table.viewCustomer", { defaultValue: "View Customer" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={VisibilityIcon}
							onClick={() => {
								// openCustomerView(params.row.id);
								navigate(`/invoice/customer/${params.row.id}`);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("customer.table.editCustomer", { defaultValue: "Edit Customer" })}
					key={params.row?.id}
				>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								updateCustomer(params.row);
							}}
						/>
					</Box>
				</Tooltip>,
				<Tooltip
					title={t("customer.table.deleteCustomer", { defaultValue: "Delete Customer" })}
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
									title: t("customer.actions.deleteTitle", { defaultValue: "Delete Customer" }),
									message: t("customer.actions.deleteConfirm", {
										defaultValue: "Are you sure you want to delete this customer?",
									}),
									onConfirm: async () => {
										await removeCustomer.mutateAsync({ id: params.row.id });
										queryClient.invalidateQueries({
											queryKey: getCustomerControllerFindAllQueryKey(),
										});
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: t("common.delete", { defaultValue: "Delete" }),
								});
							}}
						/>
					</Box>
				</Tooltip>,
			],
		},
	];

	if (CustomerData.isLoading) {
		return <Loader />;
	}

	// QuickSearchToolbar component for customer list (search bar)
	// Memoized to prevent unnecessary re-renders
	const QuickSearchToolbar = useMemo(() => {
		return () => {
			return (
				<Box
					sx={{
						px: 1,
						pb: 0,
						float: "left",
					}}
				>
					<GridToolbarQuickFilter
						variant="outlined"
						quickFilterParser={(input) => input.split(/\s+/).filter(Boolean)}
						placeholder={t("common.search", { defaultValue: "Search" }) as string}
					/>
				</Box>
			);
		};
	}, [t]);

	return (
		<Box>
			<DataGrid
				autoHeight
				rows={CustomerData?.data ?? []}
				columns={columns}
				slots={{
					toolbar: QuickSearchToolbar,
				}}
				localeText={{
					noRowsLabel: t("table.noRows", { defaultValue: "No rows" }),
				}}
				slots={{
					toolbar: () => {
						return (
							<CustomToolbar
								rows={CustomerData?.data?.map((item) => ({
									"Customer Name": item.name,
									"Contact Email": item.email,
									"Contact Number": item.phone,
									"Total Invoices": item._count?.invoice,
									"Total Amount Due's": item.totalDue,
									"Customer Type": item.option,
									"Phone Number": item.phone,
								}))}
							/>
						);
					},
				}}
			/>
		</Box>
	);
};

export default CustomerTableList;
