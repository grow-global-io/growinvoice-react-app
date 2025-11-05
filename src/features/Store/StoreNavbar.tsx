import { AppBar, Box, Grid, IconButton, TextField } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useProductCheckoutStore } from "../../store/productCheckoutStore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import * as yup from "yup";
import { Field, Form, Formik, useFormikContext } from "formik";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { type ListDto } from "@shared/models/ListDto";
import { useNavigate } from "react-router-dom";
import { Constants } from "@shared/constants";
import { useTranslation } from "react-i18next";

// Component to handle geo-location based currency detection
const GeoCurrencyDetector = ({
	currencyList,
	setCurrencyCode,
	currencyCode,
}: {
	currencyList: any;
	setCurrencyCode: (code: string) => void;
	currencyCode: string;
}) => {
	const hasDetectedRef = useRef(false);
	const { setFieldValue } = useFormikContext<any>();

	useEffect(() => {
		// Only detect once on initial load
		if (hasDetectedRef.current) return;
		if (!currencyList?.data || currencyList.isLoading) return;

		// Only auto-detect if currency is still at default (INR)
		// This allows manual selection to override geo-detection
		if (currencyCode && currencyCode !== "INR") {
			hasDetectedRef.current = true;
			return;
		}

		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("https://ipapi.co/json");
				const json = (await res.json()) as { currency?: string };
				if (cancelled) return;

				const detectedCurrency = json?.currency?.toUpperCase();

				// Only set EUR if detected, otherwise keep INR as default
				if (detectedCurrency === "EUR") {
					const eurCurrency = currencyList.data.find(
						(c: any) => c.short_code?.toUpperCase() === "EUR",
					);
					if (eurCurrency) {
						setCurrencyCode("EUR");
						setFieldValue("currency", "EUR");
						hasDetectedRef.current = true;
					}
				} else {
					// Default to INR if not EUR or if detection fails
					setCurrencyCode("INR");
					setFieldValue("currency", "INR");
					hasDetectedRef.current = true;
				}
			} catch {
				// On error, default to INR
				if (!cancelled) {
					setCurrencyCode("INR");
					setFieldValue("currency", "INR");
					hasDetectedRef.current = true;
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [currencyList?.data, currencyList.isLoading, setCurrencyCode, setFieldValue, currencyCode]);

	return null;
};

const StoreNavbar = ({ children, logo }: { children?: React.ReactNode; logo?: string }) => {
	const { t } = useTranslation();
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

	// Filter currencies to only show INR and EUR
	const filteredCurrencies = React.useMemo(() => {
		if (!currency?.data) return [];
		return currency.data.filter(
			(c) => c.short_code?.toUpperCase() === "INR" || c.short_code?.toUpperCase() === "EUR",
		);
	}, [currency?.data]);

	const initialValues = {
		currency: currencyCode || "INR", // Default to INR if no currency code is set
	};

	const validationSchema = yup.object({
		currency: yup
			.string()
			.required(t("store.currencyRequired", { defaultValue: "Currency is required" })),
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
							placeholder={t("store.searchPlaceholder", {
								defaultValue: "Search Products/Companies",
							})}
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
								enableReinitialize
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
										<GeoCurrencyDetector
											currencyList={currency}
											setCurrencyCode={setCurrencyCode}
											currencyCode={currencyCode}
										/>
										<Field
											name="currency"
											component={AutocompleteField}
											options={filteredCurrencies.map((c) => ({
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
