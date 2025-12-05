import Box from "@mui/material/Box";
import {
	DataGrid,
	type GridColDef,
	GridToolbarQuickFilter,
	GridToolbarContainer,
} from "@mui/x-data-grid";
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
import { useMemo, useCallback } from "react";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import { ExportToolbar } from "@shared/components/ExportToolbar";
const CustomerTableList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const CustomerData = useCustomerControllerFindAll();
	const countryFindAll = useCurrencyControllerFindCountries();
	const { updateCustomer } = useCreateCustomerStore.getState();
	const removeCustomer = useCustomerControllerRemove();
	const { handleOpen, cleanUp } = useConfirmDialogStore();

	// All hooks must be called before any conditional returns
	// Prepare export data with the requested format (with translated column headers)
	const exportData = useMemo(() => {
		// Get translated column headers
		const columnHeaders = {
			name: t("report.export.customerExport.name", { defaultValue: "Name" }),
			countryCode: t("report.export.customerExport.countryCode", { defaultValue: "Country code" }),
			contactPerson: t("report.export.customerExport.contactPerson", {
				defaultValue: "Contact person",
			}),
			streetAddress: t("report.export.customerExport.streetAddress", {
				defaultValue: "Street address",
			}),
			streetAddressLine2: t("report.export.customerExport.streetAddressLine2", {
				defaultValue: "Street address, line 2",
			}),
			postalCode: t("report.export.customerExport.postalCode", { defaultValue: "Postal code" }),
			cityMunicipality: t("report.export.customerExport.cityMunicipality", {
				defaultValue: "City/municipality",
			}),
			phoneNumber: t("report.export.customerExport.phoneNumber", { defaultValue: "Phone number" }),
			emailAddress: t("report.export.customerExport.emailAddress", {
				defaultValue: "Email address",
			}),
			numberOfShippingUnits: t("report.export.customerExport.numberOfShippingUnits", {
				defaultValue: "Number of shipping units",
			}),
		};

		return (
			CustomerData?.data?.map((item) => {
				// Prefer billing address, fallback to shipping address
				const address = item.billingAddress || item.shippingAddress;

				// Get country code from country_id
				let countryCode = "";
				if (address?.country_id && countryFindAll?.data) {
					const country = countryFindAll.data.find((c) => c.id === address.country_id);
					countryCode = country?.code || address?.country_name || "";
				} else if (address?.country_name) {
					countryCode = address.country_name;
				}

				return {
					[columnHeaders.name]: item.name || "",
					[columnHeaders.countryCode]: countryCode,
					[columnHeaders.contactPerson]: item.display_name || item.name || "",
					[columnHeaders.streetAddress]: address?.address || "",
					[columnHeaders.streetAddressLine2]: "", // Not available in data structure
					[columnHeaders.postalCode]: address?.zip || "",
					[columnHeaders.cityMunicipality]: address?.city || "",
					[columnHeaders.phoneNumber]: item.phone || "",
					[columnHeaders.emailAddress]: item.email || "",
					[columnHeaders.numberOfShippingUnits]: "", // Not available in data structure
				};
			}) ?? []
		);
	}, [CustomerData?.data, countryFindAll?.data, t]);

	// Combined toolbar with search and export
	const CombinedToolbar = useCallback(() => {
		return (
			<>
				<GridToolbarContainer
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 1,
						pb: 0,
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<GridToolbarQuickFilter
							variant="outlined"
							quickFilterParser={(input) => input.split(/\s+/).filter(Boolean)}
							placeholder={t("common.search", { defaultValue: "Search" }) as string}
						/>
					</Box>
					<ExportToolbar exportData={exportData} fileName="customers" />
				</GridToolbarContainer>
			</>
		);
	}, [t, exportData]);

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
				return <Chip label={params?.value} variant="filled" color={"error"} />;
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

	return (
		<Box>
			<DataGrid
				autoHeight
				rows={CustomerData?.data ?? []}
				columns={columns}
				slots={{
					toolbar: CombinedToolbar,
				}}
				localeText={{
					noRowsLabel: t("table.noRows", { defaultValue: "No rows" }),
				}}
			/>
		</Box>
	);
};

export default CustomerTableList;
