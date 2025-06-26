import { AppBar, Box, IconButton, TextField, Typography } from "@mui/material";
import React from "react";
import { useProductCheckoutStore } from "../../store/productCheckoutStore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import * as yup from "yup";
import { Field, Form, Formik } from "formik";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { ListDto } from "@shared/models/ListDto";
import { useNavigate } from "react-router-dom";

const StoreNavbar = ({ children }: { children?: React.ReactNode }) => {
	const {
		setOpenCheckoutForm,
		checkoutProducts,
		currencyCode,
		setCurrencyCode,
		searchTerm,
		handleSearchChange,
		removeAllProductsFromCheckout
	} = useProductCheckoutStore();
	const navigate = useNavigate();
	const currency = useCurrencyControllerFindAll();

	const initialValues = {
		currency: currencyCode || "INR", // Default to INR if no currency code is set
	};

	const validationSchema = yup.object({
		currency: yup.string().required("Currency is required"),
	});

	return (
		<>
			<AppBar position="static" sx={{ backgroundColor: "custom.lightBlue" }}>
				<Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexGrow: 1,
							px: 2,
						}}
					>
						<Typography
							variant="h4"
							sx={{ cursor: "pointer" }}
							onClick={() => {
								navigate("/store");
							}}
						>
							Grow Invoice
						</Typography>
						<Box>
							<TextField
								variant="outlined"
								placeholder="Search Products/Companies"
								value={searchTerm || ""}
								onChange={(e) => handleSearchChange?.(e.target.value)}
								sx={{ width: 500 }}
							/>
						</Box>
						<Box component={"span"} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Formik
								initialValues={initialValues}
								validationSchema={validationSchema}
								onSubmit={(values) => {
									console.log("Selected Currency:", values.currency);
								}}
							>
								{() => (
									<Form style={{ margin: 0, padding: 0 }}>
										<Box sx={{ minWidth: 240, maxWidth: 300 }}>
											<Field
												name="currency"
												component={AutocompleteField}
												options={currency?.data?.map((c) => ({
													label: [c.name, c.short_code].join(" - "),
													value: c.short_code,
												}))}
												disableClearable
												sx={{
													m: 0,
													p: 0,
												}}
												onValueChange={(value: ListDto) => {
													setCurrencyCode?.(String(value.value));
													removeAllProductsFromCheckout?.();
												}}
											/>
										</Box>
									</Form>
								)}
							</Formik>
							<IconButton onClick={() => setOpenCheckoutForm(true)}>
								<ShoppingCartIcon />{" "}
								{checkoutProducts.length > 0 && (
									<span style={{ marginLeft: 8, fontWeight: "bold" }}>
										{checkoutProducts.length}
									</span>
								)}
							</IconButton>
						</Box>
					</Box>
				</Box>
			</AppBar>
			{children}
		</>
	);
};

export default StoreNavbar;
