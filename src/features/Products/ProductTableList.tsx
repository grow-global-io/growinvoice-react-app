import Box from "@mui/material/Box";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	DataGrid,
	type GridColDef,
	GridActionsCellItem,
	type GridActionsCellItemProps,
} from "@mui/x-data-grid";
import {
	getProductControllerFindAllQueryKey,
	useProductControllerFindAll,
	useProductControllerRemove,
} from "@api/services/product";
import Loader from "@shared/components/Loader";
import { timeAgo } from "@shared/formatter";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { useCreateProductStore } from "@store/createProductStore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { type ProductWithAllDataDto } from "@api/services/models";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useDialog } from "@shared/hooks/useDialog";
import ProductDialog from "@features/Store/ProductDialog";
import {
	useInventoryControllerFindAll,
	useInventoryControllerCreate,
	useInventoryControllerUpdate,
	getInventoryControllerFindAllQueryKey,
} from "@api/services/inventory";
import type { InventoryResponseDto as InventoryDto } from "@api/services/models";

type InventoryListResponse = { data: InventoryDto[] };

const EXCLUDED_UNITS = ["monthly", "quadrimester", "month", "months", "quadrimesters"];

const ProductTableList = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { updateProduct } = useCreateProductStore.getState();
	const productList = useProductControllerFindAll();
	const removeProduct = useProductControllerRemove();
	const inventoryQuery = useInventoryControllerFindAll();
	const createInventory = useInventoryControllerCreate();
	const updateInventory = useInventoryControllerUpdate();

	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { handleClickOpen, handleClose, open } = useDialog();
	const [selectedProduct, setSelectedProduct] = useState<ProductWithAllDataDto | undefined>(
		undefined,
	);

	const [stockDialogProduct, setStockDialogProduct] = useState<ProductWithAllDataDto | null>(null);
	const [stockDialogEntry, setStockDialogEntry] = useState<InventoryDto | null>(null);
	const [stockForm, setStockForm] = useState({
		operation: "set" as "add" | "subtract" | "set",
		quantity: 0,
		amount: 0,
		lowStockThreshold: 10,
	});
	const stockDialogOpen = Boolean(stockDialogProduct);

	const inventoryByProductId = useMemo(() => {
		const response = inventoryQuery.data as InventoryListResponse | undefined;
		const list = response?.data && Array.isArray(response.data) ? response.data : [];
		const map = new Map<string, InventoryDto>();
		list.forEach((entry) => map.set(entry.productId, entry));
		return map;
	}, [inventoryQuery.data]);

	const canHaveStock = (product: ProductWithAllDataDto) => {
		const unitName = product?.unit?.name?.toLowerCase() || "";
		return !EXCLUDED_UNITS.includes(unitName);
	};

	const handleOpenStockDialog = (product: ProductWithAllDataDto) => {
		const entry = inventoryByProductId.get(product.id) ?? null;
		setStockDialogProduct(product);
		setStockDialogEntry(entry);
		setStockForm({
			operation: "set",
			quantity: entry?.quantity ?? 0,
			amount: 0,
			lowStockThreshold: entry?.lowStockThreshold ?? 10,
		});
	};

	const handleCloseStockDialog = () => {
		setStockDialogProduct(null);
		setStockDialogEntry(null);
	};

	const handleSaveStock = async () => {
		if (!stockDialogProduct) return;
		try {
			const payload = {
				productId: stockDialogProduct.id,
				quantity: stockForm.operation === "set" ? stockForm.quantity : undefined,
				lowStockThreshold: stockForm.lowStockThreshold,
				operation: stockForm.operation,
				amount: stockForm.operation !== "set" ? stockForm.amount : undefined,
			};
			if (stockDialogEntry?.id) {
				await updateInventory.mutateAsync({ id: stockDialogEntry.id, data: payload });
			} else {
				await createInventory.mutateAsync({ data: payload });
			}
			await queryClient.invalidateQueries({ queryKey: getInventoryControllerFindAllQueryKey() });
			inventoryQuery.refetch();
			handleCloseStockDialog();
		} catch (err) {
			console.error("Failed to save stock:", err);
		}
	};

	const columns: GridColDef<ProductWithAllDataDto>[] = [
		{
			field: "name",
			headerName: t("product.table.product", { defaultValue: "Product" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Typography variant="h6" color="secondary">
						{params.value}
					</Typography>
				);
			},
		},
		{
			field: "unit",
			headerName: t("product.table.unit", { defaultValue: "Unit" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const unitName = params?.row?.unit?.name;
				const translatedUnit = unitName
					? t(`product.units.${unitName.toLowerCase()}`, { defaultValue: unitName })
					: unitName;
				return <Typography textTransform={"capitalize"}>{translatedUnit}</Typography>;
			},
		},
		{
			field: "productType",
			headerName: t("product.table.productType", { defaultValue: "Product Type" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const productType = params.row.type;
				const translatedType = productType
					? t(`product.type.${productType.toLowerCase()}`, { defaultValue: productType })
					: productType;
				return <Typography>{translatedType}</Typography>;
			},
		},
		{
			field: "createdAt",
			headerName: t("product.table.createdAt", { defaultValue: "Created At" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <Typography>{timeAgo(params.value, t)}</Typography>;
			},
		},
		{
			field: "stock",
			headerName: t("product.table.stock", { defaultValue: "Stock" }),
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				const entry = inventoryByProductId.get(params.row.id);
				if (!canHaveStock(params.row)) return <Typography color="text.secondary">—</Typography>;
				return (
					<Typography fontWeight={entry ? 600 : 400}>
						{entry ? `${entry.quantity} ${entry.unit || ""}` : "—"}
					</Typography>
				);
			},
		},
		{
			field: "action",
			headerName: t("product.table.action", { defaultValue: "Action" }),
			flex: 1,
			minWidth: 184,
			type: "actions",
			getActions: (params) => {
				const actions: React.ReactElement<GridActionsCellItemProps>[] = [];
				const openDeleteConfirm = () => {
					handleOpen({
						title: t("product.actions.deleteTitle", { defaultValue: "Delete Product" }),
						message: t("product.actions.deleteConfirm", {
							defaultValue: "Are you sure you want to delete this product?",
						}),
						onConfirm: async () => {
							await removeProduct.mutateAsync({ id: params.row.id });
							queryClient.invalidateQueries({
								queryKey: getProductControllerFindAllQueryKey(),
							});
						},
						onCancel: () => cleanUp(),
						confirmButtonText: t("common.delete", { defaultValue: "Delete" }),
					});
				};
				if (canHaveStock(params.row)) {
					actions.push(
						<GridActionsCellItem
							key={`stock-${params.row?.id}`}
							icon={
								<Tooltip title={t("product.table.updateStock", { defaultValue: "Update stock" })}>
									<Box>
										<CustomIconButton src={Inventory2Icon} />
									</Box>
								</Tooltip>
							}
							label={t("product.table.updateStock", { defaultValue: "Update stock" })}
							onClick={() => handleOpenStockDialog(params.row)}
						/>,
					);
				}
				actions.push(
					<GridActionsCellItem
						key={`view-${params.row?.id}`}
						icon={
							<Tooltip title={t("product.table.viewProduct", { defaultValue: "View Product" })}>
								<Box>
									<CustomIconButton src={VisibilityIcon} />
								</Box>
							</Tooltip>
						}
						label={t("product.table.viewProduct", { defaultValue: "View Product" })}
						onClick={() => {
							setSelectedProduct(params.row);
							handleClickOpen();
						}}
					/>,
					<GridActionsCellItem
						key={`edit-${params.row?.id}`}
						icon={
							<Tooltip title={t("product.table.editProduct", { defaultValue: "Edit Product" })}>
								<Box>
									<CustomIconButton src={EditIcon} />
								</Box>
							</Tooltip>
						}
						label={t("product.table.editProduct", { defaultValue: "Edit Product" })}
						onClick={() => updateProduct(params.row)}
					/>,
					<GridActionsCellItem
						key={`delete-${params.row?.id}`}
						icon={
							<Tooltip title={t("product.table.deleteProduct", { defaultValue: "Delete Product" })}>
								<Box>
									<CustomIconButton src={DeleteIcon} buttonType="delete" iconColor="error" />
								</Box>
							</Tooltip>
						}
						label={t("product.table.deleteProduct", { defaultValue: "Delete Product" })}
						onClick={openDeleteConfirm}
					/>,
				);
				return actions;
			},
		},
	];

	if (productList.isLoading || productList.isRefetching || productList.isFetching)
		return <Loader />;
	return (
		<Box>
			<DataGrid autoHeight rows={productList?.data ?? []} columns={columns} />
			<ProductDialog product={selectedProduct} handleClose={handleClose} open={open} />
			<Dialog open={stockDialogOpen} onClose={handleCloseStockDialog} maxWidth="sm" fullWidth>
				<DialogTitle>
					{t("product.stock.dialogTitle", { defaultValue: "Update stock" })}
				</DialogTitle>
				<DialogContent>
					{stockDialogProduct && (
						<>
							<Typography variant="body2" color="text.secondary" mb={2}>
								{t("product.table.product", { defaultValue: "Product" })}:{" "}
								<strong>{stockDialogProduct.name}</strong>
							</Typography>
							{stockDialogEntry && (
								<Typography variant="body2" color="text.secondary" mb={3}>
									{t("inventory.dialog.currentStock", { defaultValue: "Current Stock" })}:{" "}
									<strong>
										{stockDialogEntry.quantity} {stockDialogEntry.unit}
									</strong>
								</Typography>
							)}
						</>
					)}
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
						<TextField
							select
							label={t("inventory.dialog.operation", { defaultValue: "Operation" })}
							value={stockForm.operation}
							onChange={(e) =>
								setStockForm({
									...stockForm,
									operation: e.target.value as "add" | "subtract" | "set",
								})
							}
							SelectProps={{ native: true }}
							fullWidth
						>
							<option value="add">
								{t("inventory.operation.add", { defaultValue: "Add Stock" })}
							</option>
							<option value="subtract">
								{t("inventory.operation.subtract", { defaultValue: "Subtract Stock" })}
							</option>
							<option value="set">
								{t("inventory.operation.set", { defaultValue: "Set Stock" })}
							</option>
						</TextField>
						{stockForm.operation === "set" ? (
							<TextField
								label={t("inventory.dialog.quantity", { defaultValue: "Quantity" })}
								type="number"
								value={stockForm.quantity}
								onChange={(e) =>
									setStockForm({ ...stockForm, quantity: parseInt(e.target.value, 10) || 0 })
								}
								fullWidth
								inputProps={{ min: 0 }}
							/>
						) : (
							<TextField
								label={t("inventory.dialog.amount", { defaultValue: "Amount" })}
								type="number"
								value={stockForm.amount}
								onChange={(e) =>
									setStockForm({ ...stockForm, amount: parseInt(e.target.value, 10) || 0 })
								}
								fullWidth
								inputProps={{ min: 0 }}
							/>
						)}
						<TextField
							label={t("inventory.dialog.lowStockThreshold", {
								defaultValue: "Low Stock Threshold",
							})}
							type="number"
							value={stockForm.lowStockThreshold}
							onChange={(e) =>
								setStockForm({
									...stockForm,
									lowStockThreshold: parseInt(e.target.value, 10) || 0,
								})
							}
							fullWidth
							inputProps={{ min: 0 }}
							helperText={t("inventory.dialog.thresholdHelper", {
								defaultValue: "Alert when stock falls below this level",
							})}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseStockDialog}>
						{t("common.cancel", { defaultValue: "Cancel" })}
					</Button>
					<Button onClick={handleSaveStock} variant="contained">
						{t("common.save", { defaultValue: "Save" })}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ProductTableList;
