import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
	GridRowsProp,
	GridRowModesModel,
	GridRowModes,
	DataGrid,
	GridColDef,
	GridActionsCellItem,
	GridEventListener,
	GridRowId,
	GridRowModel,
	GridRowParams,
	MuiEvent,
} from "@mui/x-data-grid";
import { Grid, SelectChangeEvent, Tooltip, Typography, useTheme } from "@mui/material";
import GridSelectField from "@shared/components/DataGridFields/GridSelectField";
import GridTextField from "@shared/components/DataGridFields/GridTextField";
import { useProductControllerFindAll } from "@api/services/product";
import { currencyFormatter } from "@shared/formatter";
import CreateProduct from "@features/Products/CreateProduct";
import { FormikProps } from "formik";
import { OmitCreateInvoiceProductsDto } from "@api/services/models";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useHsncodeControllerFindAll } from "@api/services/hsncode";
import { CustomIconButton } from "./CustomIconButton";

export default function FullFeaturedCrudGrid({
	rows,
	setRows,
	errorText,
	setErrorText,
	formik,
}: {
	rows: GridRowsProp;
	setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
	errorText: string | undefined;
	setErrorText: React.Dispatch<React.SetStateAction<string | undefined>>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formik: FormikProps<any>;
}) {
	const taxCodes = useTaxcodeControllerFindAll();
	const hsnCodes = useHsncodeControllerFindAll();

	const handleTotal = (rows: GridRowsProp) => {
		const subtotal = rows.reduce((acc, row) => acc + (row.total as number), 0);
		formik?.setFieldValue(
			"product",
			rows.map((row) => {
				return {
					product_id: row.product_id,
					quantity: Number(row.quantity),
					price: row.price,
					total: row.total,
					tax_id: row.tax_id,
					hsnCode_id: row.hsnCode_id,
				} as OmitCreateInvoiceProductsDto;
			}),
		);
		const tax = taxCodes?.data?.find((tax) => tax.id === formik?.values.tax_id);
		formik?.setFieldValue("sub_total", subtotal);
		const discount = subtotal * (Number(formik?.values?.discountPercentage) / 100);
		const taxPercentage = subtotal * (Number(tax?.percentage ?? 0) / 100);
		formik?.setFieldValue("total", subtotal - discount + taxPercentage);
	};

	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
	const [isRowEditing, setIsRowEditing] = React.useState(false);
	const productList = useProductControllerFindAll();

	React.useEffect(() => {
		const editingRows = Object.values(rowModesModel).filter(
			(row) => row.mode === GridRowModes.Edit,
		);
		setIsRowEditing(editingRows.length > 0);
	}, [rowModesModel]);

	const handleRowEditStop: GridEventListener<"rowEditStop"> = (_, event) => {
		event.defaultMuiPrevented = true;
	};

	const handleRowEditStart = (_: GridRowParams, event: MuiEvent<React.SyntheticEvent>) => {
		event.defaultMuiPrevented = true;
	};

	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	};

	const handleSaveClick = (id: GridRowId) => () => {
		setErrorText(undefined);

		const row = rows.find((row) => row.id === id);
		if (!row?.product_id) {
			setErrorText("Product must be selected before saving.");
			return;
		}
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
		handleTotal(rows);
	};

	const handleDeleteClick = (id: GridRowId) => () => {
		if (rows.filter((row) => row.id !== id)?.length === 0) {
			setErrorText("At least one product is required");
		}
		setRows(rows.filter((row) => row.id !== id));
		handleTotal(rows.filter((row) => row.id !== id));
	};

	const handleCancelClick = (id: GridRowId) => () => {
		// if (rows.filter((row) => row.id !== id)?.length === 0) {
		// 	setErrorText("At least one product is required");

		// }
		setRows(rows.filter((row) => row.id !== id));
		handleTotal(rows.filter((row) => row.id !== id));
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});
		setErrorText("");
	};

	const processRowUpdate = (newRow: GridRowModel) => {
		if (!newRow.product_id) {
			setErrorText("Product must be selected before saving.");
			return newRow;
		}

		const updatedRow = { ...newRow, isNew: false };
		setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
		return updatedRow;
	};

	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const handleAddRow = () => {
		setErrorText(undefined);
		const randomInRange = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
		const id = rows.length + 2 + randomInRange;
		setRows((oldRows) => [
			...oldRows,
			{
				id,
				product_id: "",
				quantity: "",
				price: "",
				total: "",
				hsnCode_id: "",
				tax_id: "",
				isNew: true,
				isEditPosible: false,
				isEditble: true,
			},
		]);
		setRowModesModel((oldModel) => ({
			...oldModel,
			[id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
		}));
	};

	const theme = useTheme();

	const columns: GridColDef[] = [
		{
			field: "product_id",
			headerName: "Product",
			flex: 1.5,
			editable: true,
			renderEditCell: (params) => {
				const handleProductChange = (event: SelectChangeEvent) => {
					const value = event.target.value as string;
					const selectedProduct = productList?.data?.find((product) => product.id === value);
					const taxPercentage =
						taxCodes?.data?.find((tax) => tax.id === selectedProduct?.tax_id)?.percentage ?? 0;
					const total = selectedProduct?.price
						? selectedProduct?.price + (selectedProduct?.price * taxPercentage) / 100
						: 0;
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								product_id: value,
								quantity: 1,
								price: selectedProduct?.price,
								total: total,
								tax_id: selectedProduct?.tax_id,
								hsnCode_id: selectedProduct?.hsnCode_id,
							};
						}
						return row;
					});
					setRows(updatedRows);

					params.api.setEditCellValue({
						id: params.id,
						field: "quantity",
						value: 1,
					});
					params.api.setEditCellValue({
						id: params.id,
						field: "price",
						value: selectedProduct?.price,
					});
					params.api.setEditCellValue({
						id: params.id,
						field: "tax_id",
						value: selectedProduct?.tax_id,
					});
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: total,
					});

					params.api.setEditCellValue({
						id: params.id,
						field: "hsnCode_id",
						value: selectedProduct?.hsnCode_id,
					});
				};
				return (
					<GridSelectField
						params={params}
						valueOptions={productList?.data?.map((product) => {
							return {
								value: product.id,
								label: product.name,
							};
						})}
						onChangeValue={handleProductChange}
						disabled={params.row.isEditPosible}
					/>
				);
			},
			renderCell: (params) => {
				const productName = productList?.data?.find((product) => product.id === params.value)?.name;
				return <Typography>{productName}</Typography>;
			},
		},
		{
			field: "quantity",
			headerName: "Quantity",
			flex: 0.8,
			editable: true,
			preProcessEditCellProps: (params) => {
				const hasError = params.props.value < 1;
				return { ...params.props, error: hasError };
			},
			renderEditCell: (params) => {
				const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
					const value = parseInt(event.target.value, 10);
					if (value < 1) {
						setErrorText("Quantity should not be less than 0");
					} else {
						setErrorText("");
					}
					const price = productList?.data?.find(
						(product) => product.id === params.row.product_id,
					)?.price;
					const taxPercentage =
						taxCodes?.data?.find((item) => item.id === params.row.tax_id)?.percentage ?? 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: price ? price * value + (price * value * taxPercentage) / 100 : 0,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								quantity: value,
								total: price ? price * value + (price * value * taxPercentage) / 100 : 0,
							};
						}
						return row;
					});
					setRows(updatedRows);
				};
				return (
					<GridTextField
						params={params}
						label="quantity"
						type="number"
						onChangeValue={onChangeValue}
						disabled={params.row.price === "" || params.row.product_id === ""}
					/>
				);
			},
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "price",
			headerName: "Price",
			flex: 0.8,
			editable: true,
			renderEditCell: (params) => (
				<GridTextField params={params} label="price" type="number" disabled={true} />
			),
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(
							params.value,
							productList?.data?.find((product) => product.id === params.row.product_id)?.currency
								?.short_code ?? "USD",
						)}
					</Typography>
				);
			},
		},
		{
			field: "tax_id",
			headerName: "Tax",
			flex: 0.8,
			editable: true,
			renderEditCell: (params) => (
				<GridTextField
					params={params}
					label="Tax"
					value={taxCodes?.data?.find((tax) => tax.id === params.row.tax_id)?.percentage}
					disabled={true}
				/>
			),
			renderCell: (params) => {
				const tax = taxCodes?.data?.find((tax) => tax.id === params.value);
				return <Typography>{tax?.percentage ? `${tax?.percentage} %` : "--"}</Typography>;
			},
		},
		{
			field: "hsnCode_id",
			headerName: "HSN Code",
			flex: 0.8,
			editable: true,
			renderEditCell: (params) => (
				<GridTextField
					params={params}
					label="HSN Code"
					value={hsnCodes?.data?.find((hsnCode) => hsnCode.id === params.row.hsnCode_id)?.code}
					disabled={true}
				/>
			),
			renderCell: (params) => {
				const hsnCode = hsnCodes?.data?.find((hsnCode) => hsnCode.id === params.value);
				return <Typography>{hsnCode?.code}</Typography>;
			},
		},
		{
			field: "total",
			headerName: "Amount",
			flex: 0.8,
			editable: true,
			renderEditCell: (params) => (
				<GridTextField params={params} label="Amount" type="number" disabled={true} />
			),
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(
							params.value,
							productList?.data?.find((product) => product.id === params.row.product_id)?.currency
								?.short_code ?? "USD",
						)}
					</Typography>
				);
			},
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			flex: 0.7,
			cellClassName: "actions",
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							key={0}
							icon={
								<Tooltip title="Save Record">
									<Box>
										<CustomIconButton src={SaveIcon} />
									</Box>
								</Tooltip>
							}
							label="Save"
							sx={{
								color: "primary.main",
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							key={1}
							icon={
								<Tooltip title="Cancel Record">
									<Box>
										<CustomIconButton src={CancelIcon} buttonType="delete" iconColor="error" />
									</Box>
								</Tooltip>
							}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={
							<Tooltip title="Edit Record">
								<Box>
									<CustomIconButton src={EditIcon} />
								</Box>
							</Tooltip>
						}
						key={0}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						key={1}
						icon={
							<Tooltip title="Delete Record">
								<Box>
									<CustomIconButton src={DeleteIcon} buttonType="delete" iconColor="error" />
								</Box>
							</Tooltip>
						}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	return (
		<Box>
			<DataGrid
				sx={{
					minHeight: 300,
					"& .MuiDataGrid-columnHeaderTitleContainer": {
						fontSize: 14,
						fontWeight: "bold",
						color: theme.palette.text.primary,
					},
					"& .MuiDataGrid-cell": {
						fontSize: 18,
						color: theme.palette.text.primary,
						display: "flex",
						py: 1,
						alignItems: "center",
					},
					"& .MuiDataGrid-columnHeaderTitle": {
						fontWeight: 700,
					},
				}}
				rows={rows}
				columns={columns}
				editMode="row"
				getRowHeight={() => "auto"}
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStart={handleRowEditStart}
				onRowEditStop={handleRowEditStop}
				processRowUpdate={processRowUpdate}
				slots={{
					toolbar: () => {
						return (
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									p: 2,
									borderBottom: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="h5">Add Products:</Typography>
								<CreateProduct />
							</Box>
						);
					},
					footer: () => {
						return (
							<Grid
								container
								py={2}
								sx={{
									backgroundColor: "custom.tableHeaderBgColor",
								}}
							>
								<Grid item xs={12} display="flex" justifyContent="center">
									<Button
										variant="contained"
										startIcon={<AddIcon />}
										onClick={handleAddRow}
										disabled={isRowEditing}
									>
										Add record
									</Button>
								</Grid>
							</Grid>
						);
					},
				}}
				slotProps={{
					toolbar: { setRows, setRowModesModel },
				}}
			/>
			{errorText && <Typography color="error">{errorText}</Typography>}
		</Box>
	);
}
