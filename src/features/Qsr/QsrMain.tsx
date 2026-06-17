import { useState, useMemo, useEffect, useRef } from "react";
import {
	Box,
	Grid,
	Typography,
	TextField,
	InputAdornment,
	Card,
	CardContent,
	CardMedia,
	Button,
	IconButton,
	Autocomplete,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
	Badge,
	Tab,
	Tabs,
	CircularProgress,
	Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslation } from "react-i18next";
import { useProductControllerFindAll } from "@api/services/product";
import { useCustomerControllerFindAll, useCustomerControllerCreate, getCustomerControllerFindAllQueryKey } from "@api/services/customer";
import { usePaymentdetailsControllerFindAll } from "@api/services/paymentdetails";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useInvoiceControllerCreate, useInvoiceControllerTest } from "@api/services/invoice";
import { useAuthStore } from "@store/auth";
import { formatCurrency } from "@shared/formatter";
import { AlertService } from "@shared/services/AlertService";
import Loader from "@shared/components/Loader";
import { translateInvoiceHtml } from "@shared/utils/invoiceTemplateTranslator";
import { useEuropeanCountryDetection } from "@shared/hooks/useEuropeanCountryDetection";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	taxPercentage: number;
	total: number;
	tax: any[];
}

const QsrMain = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { isEuropeanCountry } = useEuropeanCountryDetection();

	// API Queries
	const productQuery = useProductControllerFindAll();
	const customerQuery = useCustomerControllerFindAll();
	const paymentDetailsQuery = usePaymentdetailsControllerFindAll();
	const currencyQuery = useCurrencyControllerFindAll();
	const createInvoiceMutation = useInvoiceControllerCreate();
	const createCustomerMutation = useCustomerControllerCreate();

	// Local UI State
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTab, setSelectedTab] = useState<"All" | "Goods" | "Service">("All");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
	const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
	const [discountPercentage, setDiscountPercentage] = useState<number>(0);

	// Print Modal State
	const [printedInvoiceId, setPrintedInvoiceId] = useState<string | null>(null);
	const [printDialogOpen, setPrintDialogOpen] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const [checkoutLoading, setCheckoutLoading] = useState(false);

	// Customer Quick-Add Modal State
	const [customerFormOpen, setCustomerFormOpen] = useState(false);
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");

	// Fetch invoice HTML for template9
	const getHtmlText = useInvoiceControllerTest(printedInvoiceId ?? "", undefined, {
		query: {
			enabled: printedInvoiceId !== null,
			gcTime: 0,
			staleTime: 0,
		},
	});

	// Get User's Currency Code
	const currencyCode = useMemo(() => {
		if (!user?.currency_id || !currencyQuery.data) return "INR";
		const matched = currencyQuery.data.find((c) => c.id === user.currency_id);
		return matched?.short_code || "INR";
	}, [user?.currency_id, currencyQuery.data]);

	// Auto-select Default Customer (Walk-in or first available)
	useEffect(() => {
		if (customerQuery.data && customerQuery.data.length > 0 && !selectedCustomerId) {
			const walkIn = customerQuery.data.find(
				(c) =>
					c.name.toLowerCase().includes("walk") ||
					c.display_name.toLowerCase().includes("walk") ||
					c.name.toLowerCase().includes("guest"),
			);
			if (walkIn) {
				setSelectedCustomerId(walkIn.id);
			} else {
				setSelectedCustomerId(customerQuery.data[0].id);
			}
		}
	}, [customerQuery.data, selectedCustomerId]);

	// Auto-select Default Payment Detail
	useEffect(() => {
		if (paymentDetailsQuery.data && paymentDetailsQuery.data.length > 0 && !selectedPaymentId) {
			setSelectedPaymentId(paymentDetailsQuery.data[0].id);
		}
	}, [paymentDetailsQuery.data, selectedPaymentId]);

	// Iframe HTML injection when EJS template is fetched
	useEffect(() => {
		if (iframeRef.current && getHtmlText.isSuccess && getHtmlText.data) {
			const iframe = iframeRef.current;
			const translatedHtml = translateInvoiceHtml(getHtmlText.data, t, isEuropeanCountry || false);
			iframe.srcdoc = translatedHtml;

			// Trigger browser print after a brief load delay
			const printTimeout = setTimeout(() => {
				if (iframe.contentWindow) {
					iframe.contentWindow.focus();
					iframe.contentWindow.print();
				}
			}, 600);
			return () => clearTimeout(printTimeout);
		}
	}, [getHtmlText.isSuccess, getHtmlText.data, t, isEuropeanCountry]);

	// Filter Catalog Products
	const filteredProducts = useMemo(() => {
		if (!productQuery.data) return [];
		return productQuery.data.filter((product) => {
			// Check if included in QSR Menu
			if (!product.includeQsr) return false;

			// Tab Filter
			if (selectedTab !== "All" && product.type !== selectedTab) return false;

			// Search Filter
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				return (
					product.name.toLowerCase().includes(query) ||
					(product.description && product.description.toLowerCase().includes(query))
				);
			}
			return true;
		});
	}, [productQuery.data, searchQuery, selectedTab]);

	// Get product's sell price (or default price) for user's currency
	const getProductPriceInfo = (product: any) => {
		const priceBook = product.priceBook?.find(
			(pb: any) => pb.currency?.short_code === currencyCode,
		);
		const price = priceBook?.sellPrice || priceBook?.price || 0;
		const taxPercentage =
			product.tax?.reduce((acc: number, t: any) => acc + (t.tax?.percentage || 0), 0) || 0;
		return { price, taxPercentage };
	};

	// Add to Cart
	const addToCart = (product: any) => {
		const { price, taxPercentage } = getProductPriceInfo(product);
		setCart((prevCart) => {
			const existing = prevCart.find((item) => item.id === product.id);
			if (existing) {
				const quantity = existing.quantity + 1;
				const total = price * quantity;
				return prevCart.map((item) =>
					item.id === product.id ? { ...item, quantity, total } : item,
				);
			} else {
				return [
					...prevCart,
					{
						id: product.id,
						name: product.name,
						price,
						quantity: 1,
						taxPercentage,
						total: price,
						tax: product.tax || [],
					},
				];
			}
		});
	};

	// Update Cart Quantity
	const updateQuantity = (id: string, delta: number) => {
		setCart((prevCart) =>
			prevCart
				.map((item) => {
					if (item.id === id) {
						const quantity = Math.max(0, item.quantity + delta);
						const total = item.price * quantity;
						return { ...item, quantity, total };
					}
					return item;
				})
				.filter((item) => item.quantity > 0),
		);
	};

	// Remove from Cart
	const removeFromCart = (id: string) => {
		setCart((prevCart) => prevCart.filter((item) => item.id !== id));
	};

	// Cart Totals Calculation
	const totals = useMemo(() => {
		let subTotal = 0;
		let totalTax = 0;

		cart.forEach((item) => {
			subTotal += item.price * item.quantity;
			totalTax += ((item.price * item.taxPercentage) / 100) * item.quantity;
		});

		const discountAmount = (subTotal * discountPercentage) / 100;
		const grandTotal = Math.max(0, subTotal + totalTax - discountAmount);

		return {
			subTotal,
			totalTax,
			discountAmount,
			grandTotal,
		};
	}, [cart, discountPercentage]);

	// Create Walk-in / Guest Customer Quick Save
	const handleQuickAddCustomer = async () => {
		if (!customerName.trim()) {
			AlertService.instance.errorMessage(t("customerForm.validation.nameRequired"));
			return;
		}
		try {
			const result = await createCustomerMutation.mutateAsync({
				data: {
					name: customerName,
					display_name: customerName,
					phone: customerPhone || undefined,
					email: customerEmail || undefined,
					option: "Individual", // default option
					fromStore: false,
					user_id: user?.id || "",
					currencies_id: user?.currency_id || "",
				},
			});
			if (result?.result?.id) {
				AlertService.instance.successMessage("Customer added successfully!");
				queryClient.invalidateQueries({ queryKey: getCustomerControllerFindAllQueryKey() });
				setSelectedCustomerId(result.result.id);
				setCustomerFormOpen(false);
				setCustomerName("");
				setCustomerPhone("");
				setCustomerEmail("");
			}
		} catch (err) {
			console.error("Failed to create customer:", err);
			AlertService.instance.errorMessage("Failed to create customer");
		}
	};

	// Checkout & Print Receipt
	const handleCheckout = async () => {
		if (cart.length === 0) {
			AlertService.instance.errorMessage("Please add at least one item to the cart.");
			return;
		}
		if (!selectedCustomerId) {
			AlertService.instance.errorMessage("Please select or create a customer.");
			return;
		}
		if (!selectedPaymentId) {
			AlertService.instance.errorMessage("Please select a payment method.");
			return;
		}

		setCheckoutLoading(true);
		try {
			const invoiceNumber = `REC-${Date.now()}`;
			const invoicePayload = {
				currency_id: user?.currency_id || "",
				customer_ids: [selectedCustomerId],
				user_id: user?.id || "",
				invoice_number: invoiceNumber,
				reference_number: invoiceNumber,
				date: new Date().toISOString(),
				due_date: new Date().toISOString(),
				is_recurring: false,
				notes: "Thank you for shopping with us. Have a Great Day.",
				paymentId: selectedPaymentId,
				sub_total: totals.subTotal,
				tax_id: null, // Taxes mapped at product level
				total: parseFloat(totals.grandTotal.toFixed(2)),
				paid_amount: parseFloat(totals.grandTotal.toFixed(2)),
				due_amount: 0,
				discountPercentage: discountPercentage,
				product: cart.map((item) => ({
					product_id: item.id,
					quantity: item.quantity,
					price: item.price,
					total: parseFloat(item.total.toFixed(2)),
					taxes: item.tax?.map((t: any) => t.tax_id) || [],
					discount: 0,
				})),
				template_id: "cm5wa4g8t03ax21ty431aydfc0", // Thermal Printer Template ID
			};

			const result = await createInvoiceMutation.mutateAsync({
				data: invoicePayload,
			});

			const createdInvoice = (result?.result as any)?.[0];
			if (createdInvoice?.id) {
				setPrintedInvoiceId(createdInvoice.id);
				setPrintDialogOpen(true);
				setCart([]); // Reset Cart
				setDiscountPercentage(0);
				AlertService.instance.successMessage("Invoice created and marked as fully paid!");
			}
		} catch (err) {
			console.error("Failed to create invoice:", err);
			AlertService.instance.errorMessage("Checkout failed. Please try again.");
		} finally {
			setCheckoutLoading(false);
		}
	};

	if (productQuery.isLoading || customerQuery.isLoading || paymentDetailsQuery.isLoading) {
		return <Loader />;
	}

	return (
		<Box sx={{ p: 1 }}>
			<Grid container spacing={3} sx={{ height: "calc(100vh - 120px)" }}>
				{/* LEFT COLUMN: Catalog Grid */}
				<Grid
					item
					xs={12}
					md={7}
					lg={8}
					sx={{ display: "flex", flexDirection: "column", height: "100%" }}
				>
					<Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
						<TextField
							placeholder="Search items..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon color="action" />
									</InputAdornment>
								),
							}}
							sx={{
								flexGrow: 1,
								minWidth: "200px",
								"& .MuiOutlinedInput-root": {
									borderRadius: "12px",
									backgroundColor: "background.paper",
								},
							}}
						/>

						{/* Tabs for Category filtering */}
						<Tabs
							value={selectedTab}
							onChange={(_, val) => setSelectedTab(val)}
							textColor="primary"
							indicatorColor="primary"
							sx={{
								backgroundColor: "background.paper",
								borderRadius: "12px",
								boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
								px: 1,
							}}
						>
							<Tab value="All" label="All" sx={{ fontWeight: 600 }} />
							<Tab value="Goods" label="Goods" sx={{ fontWeight: 600 }} />
							<Tab value="Service" label="Services" sx={{ fontWeight: 600 }} />
						</Tabs>
					</Box>

					{/* Products Scrollable Area */}
					<Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
						{filteredProducts.length === 0 ? (
							<Paper
								sx={{
									p: 5,
									textAlign: "center",
									borderRadius: "16px",
									backgroundColor: "custom.transparentWhite",
								}}
							>
								<Typography variant="h6" color="text.secondary">
									No items found for QSR Menu.
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
									Go to Products page, edit your items, and check the "Include in QSR Menu" option
									to display them here.
								</Typography>
							</Paper>
						) : (
							<Grid container spacing={2}>
								{filteredProducts.map((product) => {
									const { price, taxPercentage } = getProductPriceInfo(product);
									const finalPrice = price + (price * taxPercentage) / 100;
									const cartQty = cart.find((i) => i.id === product.id)?.quantity || 0;
									return (
										<Grid item xs={12} sm={6} md={4} key={product.id}>
											<Card
												onClick={() => addToCart(product)}
												sx={{
													height: "100%",
													display: "flex",
													flexDirection: "column",
													cursor: "pointer",
													position: "relative",
													borderRadius: "16px",
													transition: "all 0.2s ease",
													boxShadow:
														cartQty > 0
															? `0 0 0 2px #0D6EFD, 0 8px 16px rgba(13,110,253,0.15)`
															: "0 4px 12px rgba(0,0,0,0.05)",
													"&:hover": {
														transform: "translateY(-4px)",
														boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
													},
												}}
											>
												{cartQty > 0 && (
													<Badge
														badgeContent={cartQty}
														color="primary"
														sx={{
															position: "absolute",
															top: 16,
															right: 16,
															"& .MuiBadge-badge": {
																fontSize: "0.85rem",
																height: 24,
																minWidth: 24,
																borderRadius: "12px",
															},
														}}
													/>
												)}
												<CardMedia
													component="img"
													height="120"
													image={
														product.images?.[0] ||
														"https://via.placeholder.com/300x120?text=No+Image"
													}
													alt={product.name}
													sx={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
												/>
												<CardContent sx={{ flexGrow: 1, p: 2 }}>
													<Typography
														variant="h6"
														sx={{
															textTransform: "capitalize",
															fontWeight: 600,
															lineHeight: 1.2,
															mb: 0.5,
														}}
													>
														{product.name}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{
															display: "-webkit-box",
															WebkitLineClamp: 2,
															WebkitBoxOrient: "vertical",
															overflow: "hidden",
															height: 32,
															mb: 1,
														}}
													>
														{product.description || "No description available."}
													</Typography>
													<Box
														sx={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
														}}
													>
														<Typography
															variant="subtitle1"
															color="primary"
															sx={{ fontWeight: 700 }}
														>
															{formatCurrency(finalPrice, currencyCode)}
														</Typography>
														{taxPercentage > 0 && (
															<Typography
																variant="caption"
																sx={{ color: "success.main", fontWeight: 500 }}
															>
																+{taxPercentage}% Tax
															</Typography>
														)}
													</Box>
												</CardContent>
											</Card>
										</Grid>
									);
								})}
							</Grid>
						)}
					</Box>
				</Grid>

				{/* RIGHT COLUMN: Checkout Cart Panel */}
				<Grid
					item
					xs={12}
					md={5}
					lg={4}
					sx={{
						display: "flex",
						flexDirection: "column",
						height: "100%",
					}}
				>
					<Paper
						elevation={3}
						sx={{
							p: 3,
							display: "flex",
							flexDirection: "column",
							height: "100%",
							borderRadius: "20px",
							backgroundColor: "background.paper",
							boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
						}}
					>
						{/* Cart Header */}
						<Box
							sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
						>
							<Typography
								variant="h5"
								sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}
							>
								<ShoppingCartIcon color="primary" /> {t("store.cartTitle", { defaultValue: "Cart" })}
							</Typography>
							<Badge badgeContent={cart.reduce((a, b) => a + b.quantity, 0)} color="secondary" />
						</Box>

						{/* Customer Selector & Add Button */}
						<Box sx={{ mb: 2, display: "flex", gap: 1, alignItems: "center" }}>
							<Autocomplete
								value={customerQuery.data?.find((c) => c.id === selectedCustomerId) || null}
								onChange={(_, newValue) => setSelectedCustomerId(newValue?.id || "")}
								options={customerQuery.data || []}
								getOptionLabel={(option) =>
									`${option.display_name} ${option.phone ? `(${option.phone})` : ""}`
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Select Customer"
										variant="outlined"
										size="small"
										fullWidth
									/>
								)}
								sx={{ flexGrow: 1 }}
							/>
							<IconButton
								color="primary"
								onClick={() => setCustomerFormOpen(true)}
								sx={{
									backgroundColor: "rgba(13,110,253,0.08)",
									"&:hover": { backgroundColor: "rgba(13,110,253,0.15)" },
									borderRadius: "10px",
									p: 1,
								}}
							>
								<PersonAddIcon />
							</IconButton>
						</Box>

						{/* Payment Detail Selector */}
						<Box sx={{ mb: 2 }}>
							<FormControl fullWidth size="small">
								<InputLabel id="payment-select-label">Payment Detail</InputLabel>
								<Select
									labelId="payment-select-label"
									value={selectedPaymentId}
									label="Payment Detail"
									onChange={(e) => setSelectedPaymentId(e.target.value as string)}
									sx={{ borderRadius: "10px" }}
								>
									{paymentDetailsQuery.data?.map((p) => (
										<MenuItem key={p.id} value={p.id}>
											{p.paymentType}{" "}
											{p.upiId
												? `(${p.upiId})`
												: p.account_no
													? `(Acc: *${p.account_no.slice(-4)})`
													: ""}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						<Divider sx={{ mb: 2 }} />

						{/* Scrollable Cart Items */}
						<Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
							{cart.length === 0 ? (
								<Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
									<Typography variant="body1" sx={{ fontStyle: "italic" }}>
										Cart is empty
									</Typography>
									<Typography variant="caption">
										Click on products on the left to add them here.
									</Typography>
								</Box>
							) : (
								cart.map((item) => (
									<Box
										key={item.id}
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											mb: 2,
											p: 1.5,
											borderRadius: "12px",
											backgroundColor: "custom.transparentWhite",
											border: "1px solid rgba(0,0,0,0.03)",
										}}
									>
										<Box sx={{ flexGrow: 1, pr: 1 }}>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, textTransform: "capitalize" }}
											>
												{item.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{formatCurrency(item.price, currencyCode)} x {item.quantity}
											</Typography>
										</Box>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<IconButton
												size="small"
												onClick={() => updateQuantity(item.id, -1)}
												sx={{ border: "1px solid rgba(0,0,0,0.1)", p: 0.5 }}
											>
												<RemoveIcon fontSize="small" />
											</IconButton>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}
											>
												{item.quantity}
											</Typography>
											<IconButton
												size="small"
												onClick={() => updateQuantity(item.id, 1)}
												sx={{ border: "1px solid rgba(0,0,0,0.1)", p: 0.5 }}
											>
												<AddIcon fontSize="small" />
											</IconButton>
											<IconButton
												size="small"
												color="error"
												onClick={() => removeFromCart(item.id)}
												sx={{ ml: 1 }}
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Box>
									</Box>
								))
							)}
						</Box>

						{/* Discount Selector */}
						{cart.length > 0 && (
							<Box sx={{ mb: 2 }}>
								<TextField
									label="Discount (%)"
									type="number"
									size="small"
									fullWidth
									value={discountPercentage || ""}
									onChange={(e) => {
										const val = parseFloat(e.target.value);
										setDiscountPercentage(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
									}}
									inputProps={{ min: 0, max: 100 }}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "10px",
										},
									}}
								/>
							</Box>
						)}

						{/* Financial Summary */}
						<Box
							sx={{
								p: 2,
								borderRadius: "16px",
								backgroundColor: "custom.lightBlue",
								mb: 2,
							}}
						>
							<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
								<Typography variant="body2" color="text.secondary">
									Subtotal
								</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									{formatCurrency(totals.subTotal, currencyCode)}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
								<Typography variant="body2" color="text.secondary">
									Tax
								</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									{formatCurrency(totals.totalTax, currencyCode)}
								</Typography>
							</Box>
							{totals.discountAmount > 0 && (
								<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
									<Typography variant="body2" color="error">
										Discount
									</Typography>
									<Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
										-{formatCurrency(totals.discountAmount, currencyCode)}
									</Typography>
								</Box>
							)}
							<Divider sx={{ my: 1 }} />
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
									Total Amount
								</Typography>
								<Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
									{formatCurrency(totals.grandTotal, currencyCode)}
								</Typography>
							</Box>
						</Box>

						{/* Checkout Actions */}
						<Button
							variant="contained"
							color="primary"
							fullWidth
							disabled={cart.length === 0 || checkoutLoading}
							onClick={handleCheckout}
							sx={{
								py: 1.5,
								borderRadius: "14px",
								fontSize: "1rem",
								fontWeight: 700,
								textTransform: "none",
								boxShadow: "0 6px 20px rgba(13,110,253,0.3)",
							}}
						>
							{checkoutLoading ? (
								<CircularProgress size={24} color="inherit" />
							) : (
								<>
									<PrintIcon sx={{ mr: 1 }} /> Pay & Print Receipt
								</>
							)}
						</Button>
					</Paper>
				</Grid>
			</Grid>

			{/* CUSTOMER QUICK-ADD DIALOG */}
			<Dialog
				open={customerFormOpen}
				onClose={() => setCustomerFormOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Add Quick Customer</DialogTitle>
				<DialogContent dividers>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
						<TextField
							label="Name"
							fullWidth
							required
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
						/>
						<TextField
							label="Phone"
							fullWidth
							value={customerPhone}
							onChange={(e) => setCustomerPhone(e.target.value)}
						/>
						<TextField
							label="Email"
							type="email"
							fullWidth
							value={customerEmail}
							onChange={(e) => setCustomerEmail(e.target.value)}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCustomerFormOpen(false)}>Cancel</Button>
					<Button onClick={handleQuickAddCustomer} variant="contained" color="primary">
						Add Customer
					</Button>
				</DialogActions>
			</Dialog>

			{/* RECEIPT PRINTING MODAL DIALOG */}
			<Dialog
				open={printDialogOpen}
				onClose={() => setPrintDialogOpen(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: "20px",
						overflow: "hidden",
					},
				}}
			>
				<DialogTitle
					sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<CheckCircleOutlineIcon color="success" />
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							Order Complete
						</Typography>
					</Box>
					<IconButton onClick={() => setPrintDialogOpen(false)}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 0, backgroundColor: "grey.100" }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "500px",
							position: "relative",
						}}
					>
						{getHtmlText.isLoading && <CircularProgress sx={{ position: "absolute" }} />}
						{/* Public receipt display inside an iframe */}
						<Box
							ref={iframeRef}
							component="iframe"
							sx={{
								width: "100%",
								height: "100%",
								border: "none",
								backgroundColor: "background.paper",
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
					<Button
						variant="outlined"
						onClick={() => {
							if (iframeRef.current?.contentWindow) {
								iframeRef.current.contentWindow.focus();
								iframeRef.current.contentWindow.print();
							}
						}}
						startIcon={<PrintIcon />}
						sx={{ borderRadius: "10px" }}
					>
						Print Again
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setPrintDialogOpen(false);
							setPrintedInvoiceId(null);
						}}
						sx={{ borderRadius: "10px" }}
					>
						Next Order
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default QsrMain;
