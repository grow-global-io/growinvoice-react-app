import { AppBar, Box, Grid, IconButton, TextField } from "@mui/material";
import React from "react";
import { useProductCheckoutStore } from "../../store/productCheckoutStore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import * as yup from "yup";
import { Field, Form, Formik } from "formik";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { ListDto } from "@shared/models/ListDto";
import { useNavigate } from "react-router-dom";
import { Constants } from "@shared/constants";

const StoreNavbar = ({ children, logo }: { children?: React.ReactNode; logo?: string }) => {
	const {
		setOpenCheckoutForm,
		checkoutProducts,
		currencyCode,
		setCurrencyCode,
		searchTerm,
		handleSearchChange,
		removeAllProductsFromCheckout,
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
				<Grid container alignItems="center" p={2}>
					<Grid item xs={12} sm={1}>
						<img
							src={logo ?? Constants.customImages.Logo}
							alt="Grow Invoice"
							style={{ height: 40, marginRight: 16, verticalAlign: "middle", cursor: "pointer" }}
							onClick={() => navigate("/store")}
						/>
					</Grid>
					<Grid item xs={12} sm={7} sx={{ display: "flex", alignItems: "center" }}>
						<TextField
							variant="outlined"
							placeholder="Search Products/Companies"
							value={searchTerm || ""}
							onChange={(e) => handleSearchChange?.(e.target.value)}
							sx={{ flexGrow: 1, marginRight: 2 }}
						/>
					</Grid>
					<Grid item xs={10} sm={3}>
						<Box component={"span"} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Formik
								initialValues={initialValues}
								validationSchema={validationSchema}
								onSubmit={(values) => {
									console.log("Selected Currency:", values.currency);
								}}
							>
								{() => (
									<Form
										style={{
											margin: 0,
											padding: 0,
											flexGrow: 1,
											display: "flex",
											alignItems: "center",
										}}
									>
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
									</Form>
								)}
							</Formik>
						</Box>
					</Grid>
					<Grid item xs={1} sm={1} sx={{ textAlign: "right" }}>
						<IconButton onClick={() => setOpenCheckoutForm(true)}>
							<ShoppingCartIcon />{" "}
							{checkoutProducts.length > 0 && (
								<span style={{ marginLeft: 8, fontWeight: "bold" }}>{checkoutProducts.length}</span>
							)}
						</IconButton>
					</Grid>
				</Grid>
			</AppBar>
			{children}
		</>
	);
};

export default StoreNavbar;
