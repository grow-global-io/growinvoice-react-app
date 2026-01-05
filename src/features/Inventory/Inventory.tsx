import {
	Box,
	Card,
	CardContent,
	Grid,
	Typography,
	Paper,
	Button,
	TextField,
	IconButton,
	Tooltip,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	MenuItem,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import { useProductControllerFindAll } from "@api/services/product";
import Loader from "@shared/components/Loader";
import { parseDateStringToFormat } from "@shared/formatter";
import {
	useInventoryControllerFindAll,
	useInventoryControllerCreate,
	useInventoryControllerUpdate,
	useInventoryControllerRemove,
	getInventoryControllerFindAllQueryKey,
	type InventoryDto,
	type InventoryListResponse,
} from "@api/services/inventory";
import { useQueryClient } from "@tanstack/react-query";

// Use InventoryDto from API service
type StockEntry = InventoryDto;

const Inventory = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const productsData = useProductControllerFindAll();

	// Fetch inventory from backend (excludes monthly/quadrimester products automatically)
	const inventoryQuery = useInventoryControllerFindAll();

	// Mutation hooks
	const createMutation = useInventoryControllerCreate();
	const updateMutation = useInventoryControllerUpdate();
	const deleteMutation = useInventoryControllerRemove();

	// Get inventory data from backend
	// Ensure stockEntries is always an array
	// API returns { data: [...], message: "..." } structure
	const stockEntries: StockEntry[] = (() => {
		const response = inventoryQuery.data as InventoryListResponse | undefined;
		if (!response) return [];

		// Handle object response with data property
		if (response && typeof response === "object" && "data" in response) {
			return Array.isArray(response.data) ? response.data : [];
		}

		// Fallback: handle direct array response (for backward compatibility)
		if (Array.isArray(response)) {
			return response;
		}

		return [];
	})();

	const [openDialog, setOpenDialog] = useState(false);
	const [editingStock, setEditingStock] = useState<StockEntry | null>(null);
	const [formData, setFormData] = useState({
		productId: "",
		quantity: 0,
		lowStockThreshold: 10,
		operation: "add" as "add" | "subtract" | "set",
		amount: 0,
	});

	// Get list of product IDs that already have inventory entries
	const productsWithInventory = useMemo(() => {
		return new Set(stockEntries.map((entry) => entry.productId));
	}, [stockEntries]);

	// Filter available products (excluding monthly/quadrimester and products already in inventory)
	const availableProducts = useMemo(() => {
		if (!productsData?.data) return [];

		const excludedUnits = ["monthly", "quadrimester", "month", "months", "quadrimesters"];
		return productsData.data.filter((product) => {
			const unitName = product.unit?.name?.toLowerCase() || "";
			// Exclude monthly/quadrimester units
			if (excludedUnits.includes(unitName)) return false;
			// Exclude products that already have inventory entries
			if (productsWithInventory.has(product.id)) return false;
			return true;
		});
	}, [productsData?.data, productsWithInventory]);

	// Backend handles filtering and returns only valid inventory entries

	// Calculate summary statistics
	const summaryStats = useMemo(() => {
		// Ensure stockEntries is an array before processing
		if (!Array.isArray(stockEntries)) {
			return {
				totalProducts: 0,
				available: 0,
				partiallyAvailable: 0,
				unavailable: 0,
				totalQuantity: 0,
			};
		}

		const totalProducts = stockEntries.length;
		const available = stockEntries.filter(
			(entry: StockEntry) => entry.status === "available",
		).length;
		const partiallyAvailable = stockEntries.filter(
			(entry: StockEntry) => entry.status === "partially_available",
		).length;
		const unavailable = stockEntries.filter(
			(entry: StockEntry) => entry.status === "unavailable",
		).length;
		const totalQuantity = stockEntries.reduce(
			(sum: number, entry: StockEntry) => sum + entry.quantity,
			0,
		);

		return {
			totalProducts,
			available,
			partiallyAvailable,
			unavailable,
			totalQuantity,
		};
	}, [stockEntries]);

	const handleOpenDialog = (stock?: StockEntry) => {
		if (stock) {
			setEditingStock(stock);
			setFormData({
				productId: stock.productId,
				quantity: stock.quantity,
				lowStockThreshold: stock.lowStockThreshold,
				operation: "set",
				amount: 0,
			});
		} else {
			setEditingStock(null);
			// Use the filtered available products (already excludes products with inventory)
			setFormData({
				productId: availableProducts.length > 0 ? availableProducts[0].id : "",
				quantity: 0,
				lowStockThreshold: 10,
				operation: "add",
				amount: 0,
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingStock(null);
		// Reset form data
		setFormData({
			productId: "",
			quantity: 0,
			lowStockThreshold: 10,
			operation: "add",
			amount: 0,
		});
	};

	const handleSaveStock = async () => {
		// For new entries, productId must be selected
		if (!editingStock && !formData.productId) {
			return;
		}

		// For existing entries, editingStock must exist
		if (editingStock && !editingStock.id) {
			return;
		}

		try {
			const payload = {
				productId: editingStock ? editingStock.productId : formData.productId,
				quantity: formData.operation === "set" ? formData.quantity : undefined,
				lowStockThreshold: formData.lowStockThreshold,
				operation: formData.operation as "add" | "subtract" | "set",
				amount: formData.operation !== "set" ? formData.amount : undefined,
			};

			if (editingStock?.id) {
				// Update existing inventory entry
				await updateMutation.mutateAsync({
					id: editingStock.id,
					data: payload,
				});
			} else {
				// Create new inventory entry
				await createMutation.mutateAsync({
					data: payload,
				});
			}

			// Refetch inventory data to show the updated list
			await queryClient.invalidateQueries({
				queryKey: getInventoryControllerFindAllQueryKey(),
			});
			await inventoryQuery.refetch();
			handleCloseDialog();
		} catch (error) {
			console.error("Failed to save inventory:", error);
			// TODO: Show error toast/notification
		}
	};

	const handleDeleteStock = async (stockId: string) => {
		try {
			await deleteMutation.mutateAsync({ id: stockId });
			// Refetch inventory data
			await queryClient.invalidateQueries({
				queryKey: getInventoryControllerFindAllQueryKey(),
			});
		} catch (error) {
			console.error("Failed to delete inventory:", error);
			// TODO: Show error toast/notification
		}
	};

	const columns: GridColDef<StockEntry>[] = [
		{
			field: "productName",
			headerName: t("inventory.table.product", { defaultValue: "Product" }),
			flex: 1,
			minWidth: 200,
			renderCell: (params) => (
				<Typography variant="body1" fontWeight={500}>
					{params.value}
				</Typography>
			),
		},
		{
			field: "quantity",
			headerName: t("inventory.table.quantity", { defaultValue: "Quantity" }),
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Typography variant="body1" fontWeight={600}>
					{params.value} {params.row.unit}
				</Typography>
			),
		},
		{
			field: "status",
			headerName: t("inventory.table.status", { defaultValue: "Status" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				const status = params.value as "available" | "partially_available" | "unavailable";
				const colors: Record<
					"available" | "partially_available" | "unavailable",
					"success" | "warning" | "error"
				> = {
					available: "success",
					partially_available: "warning",
					unavailable: "error",
				};
				const labels: Record<"available" | "partially_available" | "unavailable", string> = {
					available: t("inventory.status.available", { defaultValue: "Available" }),
					partially_available: t("inventory.status.partiallyAvailable", {
						defaultValue: "Partially Available",
					}),
					unavailable: t("inventory.status.unavailable", { defaultValue: "Unavailable" }),
				};
				return <Chip label={labels[status]} color={colors[status]} size="small" />;
			},
		},
		{
			field: "lowStockThreshold",
			headerName: t("inventory.table.threshold", { defaultValue: "Low Stock Threshold" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Typography variant="body2" color="text.secondary">
					{params.value} {params.row.unit}
				</Typography>
			),
		},
		{
			field: "lastUpdated",
			headerName: t("inventory.table.lastUpdated", { defaultValue: "Last Updated" }),
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Typography variant="body2" color="text.secondary">
					{parseDateStringToFormat(params.value, "MM/DD/YYYY HH:mm")}
				</Typography>
			),
		},
		{
			field: "actions",
			headerName: t("inventory.table.actions", { defaultValue: "Actions" }),
			flex: 1,
			minWidth: 150,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: "flex", gap: 1 }}>
					<Tooltip title={t("inventory.actions.edit", { defaultValue: "Edit Stock" })}>
						<IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title={t("inventory.actions.delete", { defaultValue: "Delete" })}>
						<IconButton size="small" color="error" onClick={() => handleDeleteStock(params.row.id)}>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	// Loading state
	if (productsData.isLoading || inventoryQuery.isLoading) {
		return <Loader />;
	}

	// Error state
	if (inventoryQuery.isError) {
		return (
			<Box sx={{ textAlign: "center", py: 4 }}>
				<Typography variant="body1" color="error">
					{t("inventory.error.loadFailed", {
						defaultValue: "Failed to load inventory. Please try again.",
					})}
				</Typography>
				<Button onClick={() => inventoryQuery.refetch()} sx={{ mt: 2 }}>
					{t("common.retry", { defaultValue: "Retry" })}
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
					flexDirection: { xs: "column", md: "row" },
					gap: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<InventoryIcon sx={{ fontSize: 40, color: "primary.main" }} />
					<Typography variant="h3" fontWeight={500} textTransform="capitalize">
						{t("inventory.title", { defaultValue: "Inventory Management" })}
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog()}
					sx={{ height: "fit-content" }}
				>
					{t("inventory.addStock", { defaultValue: "Add Stock" })}
				</Button>
			</Box>

			{/* Summary Cards */}
			<Grid container spacing={2} mb={3}>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<InventoryIcon sx={{ color: "primary.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("inventory.summary.totalProducts", { defaultValue: "Total Products" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600}>
								{summaryStats.totalProducts}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<TrendingUpIcon sx={{ color: "success.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("inventory.summary.available", { defaultValue: "Available" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600} color="success.main">
								{summaryStats.available}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<WarningIcon sx={{ color: "warning.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("inventory.summary.partiallyAvailable", {
										defaultValue: "Partially Available",
									})}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600} color="warning.main">
								{summaryStats.partiallyAvailable}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<TrendingDownIcon sx={{ color: "error.main" }} />
								<Typography variant="body2" color="text.secondary">
									{t("inventory.summary.unavailable", { defaultValue: "Unavailable" })}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={600} color="error.main">
								{summaryStats.unavailable}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Stock Table */}
			<Card>
				<CardContent>
					<Typography variant="h6" fontWeight={600} mb={2}>
						{t("inventory.stockList", { defaultValue: "Stock List" })}
					</Typography>
					{!Array.isArray(stockEntries) || stockEntries.length === 0 ? (
						<Box sx={{ textAlign: "center", py: 4 }}>
							<Typography variant="body1" color="text.secondary">
								{t("inventory.noStock", {
									defaultValue: "No stock entries found. Add products to manage inventory.",
								})}
							</Typography>
						</Box>
					) : (
						<Paper variant="outlined">
							<Box sx={{ height: 600, width: "100%" }}>
								<DataGrid
									rows={stockEntries}
									columns={columns}
									pageSizeOptions={[10, 25, 50, 100]}
									disableRowSelectionOnClick
									sx={{
										"& .MuiDataGrid-cell:focus": {
											outline: "none",
										},
									}}
								/>
							</Box>
						</Paper>
					)}
				</CardContent>
			</Card>

			{/* Edit Stock Dialog */}
			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>
					{editingStock
						? t("inventory.dialog.editTitle", { defaultValue: "Edit Stock" })
						: t("inventory.dialog.addTitle", { defaultValue: "Add Stock" })}
				</DialogTitle>
				<DialogContent>
					{editingStock && (
						<>
							<Typography variant="body2" color="text.secondary" mb={2}>
								{t("inventory.dialog.product", { defaultValue: "Product" })}:{" "}
								<strong>{editingStock.productName}</strong>
							</Typography>
							<Typography variant="body2" color="text.secondary" mb={3}>
								{t("inventory.dialog.currentStock", { defaultValue: "Current Stock" })}:{" "}
								<strong>
									{editingStock.quantity} {editingStock.unit}
								</strong>
							</Typography>
						</>
					)}
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
						{!editingStock && (
							<TextField
								select
								label={t("inventory.dialog.product", { defaultValue: "Product" })}
								value={formData.productId}
								onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
								fullWidth
								required
								SelectProps={{
									native: false,
								}}
							>
								{availableProducts.length === 0 ? (
									<MenuItem disabled value="">
										{t("inventory.dialog.noProductsAvailable", {
											defaultValue: "No products available to add",
										})}
									</MenuItem>
								) : (
									availableProducts.map((product) => (
										<MenuItem key={product.id} value={product.id}>
											{product.name} ({product.unit?.name || "pcs"})
										</MenuItem>
									))
								)}
							</TextField>
						)}
						<TextField
							select
							label={t("inventory.dialog.operation", { defaultValue: "Operation" })}
							value={formData.operation}
							onChange={(e) =>
								setFormData({
									...formData,
									operation: e.target.value as "add" | "subtract" | "set",
								})
							}
							SelectProps={{
								native: true,
							}}
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
						{formData.operation === "set" ? (
							<TextField
								label={t("inventory.dialog.quantity", { defaultValue: "Quantity" })}
								type="number"
								value={formData.quantity}
								onChange={(e) =>
									setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
								}
								fullWidth
								inputProps={{ min: 0 }}
							/>
						) : (
							<TextField
								label={t("inventory.dialog.amount", { defaultValue: "Amount" })}
								type="number"
								value={formData.amount}
								onChange={(e) =>
									setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
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
							value={formData.lowStockThreshold}
							onChange={(e) =>
								setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })
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
					<Button onClick={handleCloseDialog}>
						{t("common.cancel", { defaultValue: "Cancel" })}
					</Button>
					<Button
						onClick={handleSaveStock}
						variant="contained"
						disabled={
							(!editingStock && !formData.productId) ||
							(!editingStock && availableProducts.length === 0)
						}
					>
						{t("common.save", { defaultValue: "Save" })}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Inventory;
