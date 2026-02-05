import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
	type GridRowsProp,
	type GridRowModesModel,
	GridRowModes,
	DataGrid,
	type GridColDef,
	GridActionsCellItem,
	type GridEventListener,
	type GridRowId,
	type GridRowModel,
	type GridRowParams,
	type MuiEvent,
} from "@mui/x-data-grid";
import { Grid, type SelectChangeEvent, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import GridSelectField from "@shared/components/DataGridFields/GridSelectField";
import GridTextField from "@shared/components/DataGridFields/GridTextField";
import { useProductControllerFindAll } from "@api/services/product";
import { currencyFormatter } from "@shared/formatter";
import CreateProduct from "@features/Products/CreateProduct";
import { type FormikProps } from "formik";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useHsncodeControllerFindAll } from "@api/services/hsncode";
import { CustomIconButton } from "./CustomIconButton";
import { type OmitCreateInvoiceProductsExtended } from "@features/Invoices/CreateInvoice";
import GridMultiSelectField from "@shared/components/DataGridFields/GridMultiSelectField";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useEuropeanCountryDetection } from "@shared/hooks/useEuropeanCountryDetection";
import { AlertService } from "@shared/services/AlertService";

export default function FullFeaturedCrudGrid({
	rows,
	setRows,
	errorText,
	setErrorText,
	formik,
}: {
	rows: GridRowsProp<OmitCreateInvoiceProductsExtended>;
	setRows: React.Dispatch<React.SetStateAction<GridRowsProp<OmitCreateInvoiceProductsExtended>>>;
	errorText: string | undefined;
	setErrorText: React.Dispatch<React.SetStateAction<string | undefined>>;
	// eslint-disable-next-line
	formik: FormikProps<any>;
}) {
	const { t, i18n } = useTranslation();
	const currency_id = formik?.values?.currency_id;
	const taxCodes = useTaxcodeControllerFindAll();
	const hsnCodes = useHsncodeControllerFindAll();
	const { isEuropeanCountry } = useEuropeanCountryDetection();

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
					taxes: row.taxes,
					discount: row.discount,
				};
			}),
		);
		const tax = taxCodes?.data?.find((tax) => tax.id === formik?.values.tax_id);
		formik?.setFieldValue("sub_total", parseFloat(Number(subtotal ?? 0).toFixed(2)));
		const discount = subtotal * (Number(formik?.values?.discountPercentage) / 100);
		const taxPercentage = subtotal * (Number(tax?.percentage ?? 0) / 100);
		const total = subtotal - discount + taxPercentage;
		const round = parseFloat(Number(total ?? 0).toFixed(2));
		formik?.setFieldValue("total", round);
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
			setErrorText(
				t("invoiceForm.validation.productRequired", { defaultValue: "Product is required" }),
			);
			return;
		}
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
		handleTotal(rows);
	};

	const handleDeleteClick = (id: GridRowId) => () => {
		if (rows.filter((row) => row.id !== id)?.length === 0) {
			setErrorText(
				t("invoiceForm.validation.atLeastOneProduct", {
					defaultValue: "At least one product is required",
				}),
			);
		}
		setRows(rows.filter((row) => row.id !== id));
		handleTotal(rows.filter((row) => row.id !== id));
	};

	const handleCancelClick = (id: GridRowId) => () => {
		if (rows.filter((row) => row.id !== id)?.length === 0) {
			setErrorText(
				t("invoiceForm.validation.atLeastOneProduct", {
					defaultValue: "At least one product is required",
				}),
			);
		}
		setRows(rows.filter((row) => row.id !== id));
		handleTotal(rows.filter((row) => row.id !== id));
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});
		setErrorText("");
	};

	const processRowUpdate = (newRow: GridRowModel<OmitCreateInvoiceProductsExtended>) => {
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
		const id: string = rows.length + 2 + randomInRange + "";
		// Auto-select first tax if available
		const defaultTaxes = taxCodes?.data && taxCodes.data.length > 0 ? [taxCodes.data[0].id] : [];
		setRows((oldRows) => [
			...oldRows,
			{
				id,
				product_id: "",
				quantity: 0,
				price: 0,
				total: 0,
				hsnCode_id: "",
				taxes: defaultTaxes,
				discount: 0,
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
	const currencyList = useCurrencyControllerFindAll();

	const columns: GridColDef<OmitCreateInvoiceProductsExtended>[] = [
		{
			field: "product_id",
			headerName: t("invoice.table.product", { defaultValue: "Product" }),
			editable: true,
			minWidth: 200,
			flex: 1.5,
			renderEditCell: (params) => {
				const handleProductChange = (event: SelectChangeEvent, valuea?: string) => {
					const value =
						parseInt(event.target.value) === 0 ? (valuea as string) : event.target.value;
					const selectedProduct = productList?.data?.find((product) => product.id === value);
					const taxIds =
						taxCodes?.data
							?.filter((t) => selectedProduct?.tax?.map((tax) => tax.tax_id).includes(t.id))
							?.map((t) => t.id) ?? [];
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => taxIds.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					const price =
						selectedProduct?.priceBook?.find((price) => price.currency_id === currency_id)?.price ??
						0;
					const total = parseFloat((price + (price * taxPercentage) / 100).toFixed(2));
					const updatedRows: OmitCreateInvoiceProductsExtended[] = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								product_id: value,
								quantity: 1,
								price: price,
								total: total,
								tax_total_percentage: taxPercentage,
								taxes: taxIds, // Include taxes in updatedRows so handleTotal can use it
								hsnCode_id: selectedProduct?.hsnCode_id,
								discount: 0,
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
						value: price,
					});
					params.api.setEditCellValue({
						id: params.id,
						field: "taxes",
						value: taxIds,
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
					handleTotal(updatedRows);
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
			headerName: t("invoice.table.qty", { defaultValue: "QTY" }),
			minWidth: 100,
			editable: true,
			preProcessEditCellProps: (params) => {
				const rawValue = params.props.value as number | string;
				const numericValue = Number(rawValue);
				const hasError = Number.isNaN(numericValue) || numericValue <= 0;
				return { ...params.props, error: hasError };
			},
			renderEditCell: (params) => {
				const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
					const value = parseFloat(event.target.value || "0");
					if (Number.isNaN(value) || value <= 0) {
						setErrorText(
							t("invoiceForm.validation.quantityMin", {
								defaultValue: "Quantity should be greater than 0",
							}),
						);
					} else {
						setErrorText("");
					}
					const price = params.row.price;
					const discount = params.row.discount || 0;
					// const taxPercentage = params.row.tax_total_percentage ?? 0;
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => params.row.taxes?.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					// Calculate total (Selling Price): quantity * price * (1 - discount/100) * (1 + taxPercentage/100)
					const newTotal =
						price > 0 && value > 0 && taxPercentage > 0
							? parseFloat(
									(value * price * (1 - discount / 100) * (1 + taxPercentage / 100)).toFixed(2),
								)
							: price > 0 && value > 0
								? parseFloat((value * price * (1 - discount / 100)).toFixed(2))
								: 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: newTotal,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								quantity: value,
								total: newTotal,
							};
						}
						return row;
					});
					setRows(updatedRows);
					handleTotal(updatedRows);
				};
				return (
					<GridTextField
						params={params}
						label="quantity"
						type="number"
						onChangeValue={onChangeValue}
						disabled={params.row.price === 0 || params.row.product_id === ""}
					/>
				);
			},
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "price",
			headerName: t("invoice.table.stockPrice", { defaultValue: "Stock Price" }),
			minWidth: 150,
			editable: true,
			preProcessEditCellProps: (params) => {
				const hasError = params.props.value < 0.00001;
				return { ...params.props, error: hasError };
			},
			renderEditCell: (params) => {
				const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
					const value = parseFloat((parseFloat(event.target.value) || 0).toFixed(2)); // Round to 2 decimal places
					if (value < 0.00001) {
						setErrorText(
							t("invoiceForm.validation.priceMin", {
								defaultValue: "Price should be greater than 0",
							}),
						);
					} else {
						setErrorText("");
					}
					const quantity = params.row.quantity;
					const discount = params.row.discount || 0;
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => params.row.taxes?.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					// Calculate total (Selling Price): quantity * stockPrice * (1 - discount/100) * (1 + taxPercentage/100)
					const newTotal =
						quantity > 0 && taxPercentage > 0
							? parseFloat(
									(quantity * value * (1 - discount / 100) * (1 + taxPercentage / 100)).toFixed(2),
								)
							: quantity > 0
								? parseFloat((quantity * value * (1 - discount / 100)).toFixed(2))
								: 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: newTotal,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								price: value,
								total: newTotal,
							};
						}
						return row;
					});
					setRows(updatedRows);
					handleTotal(updatedRows);
				};
				return (
					<GridTextField
						params={params}
						label="price"
						type="number"
						onChangeValue={onChangeValue}
						disabled={params.row.product_id === ""}
					/>
				);
			},
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(
							params.value,
							currencyList?.data?.find((currency) => currency.id === currency_id)?.short_code ??
								"USD",
						)}
					</Typography>
				);
			},
		},
		{
			field: "discount",
			headerName: t("invoice.table.productDiscount", { defaultValue: "Discount %" }),
			minWidth: 100,
			editable: true,
			preProcessEditCellProps: (params) => {
				const hasError = params.props.value < 0 || params.props.value > 100;
				return { ...params.props, error: hasError };
			},
			renderEditCell: (params) => {
				const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
					const value = parseFloat((parseFloat(event.target.value) || 0).toFixed(2));
					if (value < 0 || value > 100) {
						setErrorText(
							t("invoiceForm.validation.discountRange", {
								defaultValue: "Discount should be between 0 and 100",
							}),
						);
					} else {
						setErrorText("");
					}
					const quantity = params.row.quantity;
					const price = params.row.price;
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => params.row.taxes?.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					// Calculate total (Selling Price): quantity * stockPrice * (1 - discount/100) * (1 + taxPercentage/100)
					const newTotal =
						quantity > 0 && price > 0 && taxPercentage > 0
							? parseFloat(
									(quantity * price * (1 - value / 100) * (1 + taxPercentage / 100)).toFixed(2),
								)
							: quantity > 0 && price > 0
								? parseFloat((quantity * price * (1 - value / 100)).toFixed(2))
								: 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: newTotal,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								discount: value,
								total: newTotal,
							};
						}
						return row;
					});
					setRows(updatedRows);
					handleTotal(updatedRows);
				};
				return (
					<GridTextField
						params={params}
						label="discount"
						type="number"
						onChangeValue={onChangeValue}
						disabled={params.row.product_id === ""}
					/>
				);
			},
			renderCell: (params) => {
				return <Typography>{params.value}%</Typography>;
			},
		},
		{
			field: "taxes",
			headerName: (i18n.language || "en").toLowerCase().startsWith("fi")
				? t("invoice.table.vatPercent", { defaultValue: "VAT %" })
				: t("invoice.table.taxPercent", { defaultValue: "Tax/GST %" }),
			minWidth: 150,
			editable: true,
			renderEditCell: (params) => {
				const handleTaxChange = (_: SelectChangeEvent, value?: string[]) => {
					const taxIds = value ?? [];

					// Check for duplicate taxes (same name and percentage)
					const selectedTaxes = taxCodes?.data?.filter((tax) => taxIds.includes(tax.id)) || [];
					const taxMap = new Map<string, number>();

					for (const tax of selectedTaxes) {
						const key = `${tax.name}-${tax.percentage}`;
						if (taxMap.has(key)) {
							// Duplicate found - show error and don't update
							AlertService.instance.errorMessage(
								t("productForm.duplicateTaxError", {
									defaultValue: `Tax "${tax.name} - ${tax.percentage}%" is already added.`,
								}),
							);
							return; // Don't update if duplicate
						}
						taxMap.set(key, 1);
					}

					const taxPercentage =
						taxCodes?.data
							?.filter((t) => taxIds.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					const price = params.row.price;
					const quantity = params.row.quantity;
					const discount = params.row.discount || 0;
					// Recalculate total (Selling Price) when tax changes: quantity * price * (1 - discount/100) * (1 + taxPercentage/100)
					const newTotal =
						price > 0 && quantity > 0 && taxPercentage > 0
							? parseFloat(
									(quantity * price * (1 - discount / 100) * (1 + taxPercentage / 100)).toFixed(2),
								)
							: price > 0 && quantity > 0
								? parseFloat((quantity * price * (1 - discount / 100)).toFixed(2))
								: 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: newTotal,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								taxes: taxIds,
								tax_total_percentage: taxPercentage,
								total: newTotal,
							};
						}
						return row;
					});
					setRows(updatedRows);
					handleTotal(updatedRows);
				};
				return (
					<GridMultiSelectField
						params={params}
						valueOptions={(() => {
							// Get currently selected tax IDs for this row
							const selectedTaxIds = params.row.taxes || [];
							// Get currently selected taxes data
							const selectedTaxes =
								taxCodes?.data?.filter((tax) => selectedTaxIds.includes(tax.id)) || [];

							// First, deduplicate taxes by name+percentage (keep only one per unique combination)
							const seenTaxes = new Map<string, string>(); // key: "name-percentage", value: taxId
							const uniqueTaxes =
								taxCodes?.data?.filter((item) => {
									const percentage = item?.percentage ?? 0;
									const key = `${item.name}-${percentage}`;
									if (seenTaxes.has(key)) {
										// If already seen, only keep it if it's already selected
										return selectedTaxIds.includes(item.id);
									}
									seenTaxes.set(key, item.id);
									return true;
								}) || [];

							// Map unique taxes to options
							return (
								uniqueTaxes
									.map((item) => {
										// Always show percentage, including 0%
										const percentage = item?.percentage ?? 0;
										return {
											label: `${item?.name} - ${percentage}%`,
											value: item?.id,
										};
									})
									.filter((option) => {
										// If this tax is already selected, keep it in options
										if (selectedTaxIds.includes(option.value)) {
											return true;
										}
										// Otherwise, check if it would be a duplicate of already selected
										const taxItem = taxCodes?.data?.find((tax) => tax.id === option.value);
										if (!taxItem) return false;

										// Check if a tax with same name and percentage is already selected
										const isDuplicate = selectedTaxes.some(
											(selectedTax) =>
												selectedTax.name === taxItem.name &&
												selectedTax.percentage === taxItem.percentage,
										);

										// Filter out duplicates
										return !isDuplicate;
									}) ?? []
							);
						})()}
						onChangeValue={handleTaxChange}
					/>
				);
			},
			renderCell: (params) => {
				const totalTaxPercentage =
					taxCodes?.data
						?.filter((t) => params.row.taxes?.includes(t.id))
						?.map((t) => t.percentage)
						.reduce((acc, curr) => acc + curr, 0) ?? 0;

				return <Typography>{totalTaxPercentage > 0 ? `${totalTaxPercentage}%` : "0%"}</Typography>;
			},
		},
		{
			field: "hsnCode_id",
			headerName: t("invoice.table.hsnCode", { defaultValue: "HSN Code" }),
			minWidth: 150,
			editable: true,
			renderEditCell: (params) => (
				<GridTextField
					params={params}
					label={t("invoice.table.hsnCode", { defaultValue: "HSN Code" })}
					value={`${hsnCodes?.data?.find((hsnCode) => hsnCode.id === params.row.hsnCode_id)?.code ?? ""} - ${hsnCodes?.data?.find((hsnCode) => hsnCode.id === params.row.hsnCode_id)?.tax?.percentage ?? 0}%`}
					disabled={true}
				/>
			),
			renderCell: (params) => {
				const hsnCode = hsnCodes?.data?.find((hsnCode) => hsnCode.id === params.value);
				return (
					<>
						{hsnCode && hsnCode.code ? (
							<Typography>
								{hsnCode?.code} - {hsnCode?.tax?.percentage ?? 0}%
							</Typography>
						) : (
							<>
								<Typography>-</Typography>
							</>
						)}
					</>
				);
			},
		},
		{
			field: "total",
			headerName: t("invoice.table.sellingPrice", { defaultValue: "Selling Price" }),
			minWidth: 150,
			editable: true,
			renderEditCell: (params) => {
				const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
					const newTotal = parseFloat((parseFloat(event.target.value) || 0).toFixed(2)); // Round to 2 decimal places
					if (newTotal < 0.00001) {
						setErrorText(
							t("invoiceForm.validation.priceMin", {
								defaultValue: "Price should be greater than 0",
							}),
						);
					} else {
						setErrorText("");
					}
					const quantity = params.row.quantity;
					const discount = params.row.discount || 0;
					const taxPercentage =
						taxCodes?.data
							?.filter((t) => params.row.taxes?.includes(t.id))
							?.map((t) => t.percentage)
							.reduce((acc, curr) => acc + curr, 0) ?? 0;
					// Calculate stock price: total / (quantity * (1 - discount/100) * (1 + taxPercentage/100))
					const newStockPrice =
						quantity > 0 && taxPercentage > 0 && 1 - discount / 100 > 0
							? parseFloat(
									(
										newTotal /
										(quantity * (1 - discount / 100) * (1 + taxPercentage / 100))
									).toFixed(2),
								)
							: quantity > 0 && 1 - discount / 100 > 0
								? parseFloat((newTotal / (quantity * (1 - discount / 100))).toFixed(2))
								: 0;
					params.api.setEditCellValue({
						id: params.id,
						field: "price",
						value: newStockPrice,
					});
					params.api.setEditCellValue({
						id: params.id,
						field: "total",
						value: newTotal,
					});
					const updatedRows = rows.map((row) => {
						if (row.id === params.id) {
							return {
								...row,
								price: newStockPrice,
								total: newTotal,
							};
						}
						return row;
					});
					setRows(updatedRows);
					handleTotal(updatedRows);
				};
				return (
					<GridTextField
						params={params}
						label={t("invoice.table.amount", { defaultValue: "Amount" })}
						type="number"
						onChangeValue={onChangeValue}
						disabled={params.row.product_id === ""}
					/>
				);
			},
			renderCell: (params) => {
				return (
					<Typography>
						{currencyFormatter(
							parseFloat((Number(params.value) || 0).toFixed(2)),
							currencyList?.data?.find((currency) => currency.id === currency_id)?.short_code ??
								"USD",
						)}
					</Typography>
				);
			},
		},
		{
			field: "actions",
			type: "actions",
			headerName: t("common.actions", { defaultValue: "Actions" }),
			minWidth: 150,
			cellClassName: "actions",
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							key={0}
							icon={
								<Tooltip title={t("invoice.table.saveRecord", { defaultValue: "Save Record" })}>
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
								<Tooltip title={t("invoice.table.cancelRecord", { defaultValue: "Cancel Record" })}>
									<Box>
										<CustomIconButton src={CancelIcon} buttonType="delete" iconColor="error" />
									</Box>
								</Tooltip>
							}
							label={t("common.cancel", { defaultValue: "Cancel" })}
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={
							<Tooltip title={t("invoice.table.editRecord", { defaultValue: "Edit Record" })}>
								<Box>
									<CustomIconButton src={EditIcon} />
								</Box>
							</Tooltip>
						}
						key={0}
						label={t("common.edit", { defaultValue: "Edit" })}
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						key={1}
						icon={
							<Tooltip title={t("invoice.table.deleteRecord", { defaultValue: "Delete Record" })}>
								<Box>
									<CustomIconButton src={DeleteIcon} buttonType="delete" iconColor="error" />
								</Box>
							</Tooltip>
						}
						label={t("common.delete", { defaultValue: "Delete" })}
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	// Filter out HSN Code column for European countries
	const filteredColumns = React.useMemo(() => {
		if (isEuropeanCountry === true) {
			return columns.filter((col) => col.field !== "hsnCode_id");
		}
		return columns;
	}, [columns, isEuropeanCountry]);

	return (
		<Box>
			<DataGrid
				sx={{
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
				columns={filteredColumns}
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
								<Typography variant="h5">
									{t("invoiceForm.addProducts", {
										defaultValue: "Add Products",
									})}{" "}
									{/* <span style={{ fontWeight: "normal", fontSize: "14px" }}>
										(
										{t("invoiceForm.addProductsSubtitle", {
											defaultValue: "for each product, click save once changes are made",
										})}
										):
									</span> */}
								</Typography>
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
										{t("invoiceForm.addRecord", { defaultValue: "Add record" })}
									</Button>
								</Grid>
							</Grid>
						);
					},
				}}
				autoHeight
				slotProps={{
					toolbar: { setRows, setRowModesModel },
				}}
			/>
			{errorText && <Typography color="error">{errorText}</Typography>}
		</Box>
	);
}
