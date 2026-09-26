import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	LinearProgress,
	Step,
	StepLabel,
	Stepper,
	Typography,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import GetStartedInitialScreen from "./GetStarted/GetStartedInitialScreen";
import EssentialSetupForm from "./GetStarted/EssentialSetupForm";
import InvoicingTaxForm from "./GetStarted/InvoicingTaxForm";
import ThankYouForm from "./GetStarted/ThankYouForm";
import * as Yup from "yup";
import { Form, Formik, type FormikHelpers, type FormikProps } from "formik";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useUserControllerUpdateCurrencyCompany } from "@api/services/users";
import { authControllerStatus } from "@api/services/auth";
import { useGetStartedDialogStore } from "@store/useGetStartedDialog";
import { useTranslation } from "react-i18next";
import {
	useCurrencyControllerFindAll,
	useCurrencyControllerFindCountries,
	useCurrencyControllerFindStatesByCountry,
} from "@api/services/currency";
import { useGeoPrefetchStore } from "@store/geoPrefetch";
import { useNavigate } from "react-router-dom";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

const GetStartedDialog = () => {
	const { t, i18n: i18nInstance } = useTranslation();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const { open, handleClose, handleOpen } = useGetStartedDialogStore();
	const formikRef = useRef<FormikProps<UpdateCurrencyCompanyDto>>(null);
	const { user, setUser, isGetStartedDialogOpen } = useAuthStore();
	const updateUserData = useUserControllerUpdateCurrencyCompany();

	const [activeStep, setActiveStep] = useState(0); // 0 = Welcome/Choice, 1 = Essentials, 2 = Advanced (Optional), 3 = Complete
	const [geoLoading, setGeoLoading] = useState(false);
	const [justSubmitted, setJustSubmitted] = useState(false);
	const [isSubmittingState, setIsSubmittingState] = useState(false);
	const [userDismissed, setUserDismissed] = useState(false);

	// Preload currency/country/state by IP
	const currencyList = useCurrencyControllerFindAll();
	const countryList = useCurrencyControllerFindCountries();
	const [prefillCountryId, setPrefillCountryId] = useState<string>("");
	const [detectedCountryName, setDetectedCountryName] = useState<string>("");
	const [detectedCurrencyCode, setDetectedCurrencyCode] = useState<string>("");

	const statesByPrefillCountry = useCurrencyControllerFindStatesByCountry({
		countryId: prefillCountryId,
	});
	const [prefillCurrencyId, setPrefillCurrencyId] = useState<string>("");
	const [prefillStateId, setPrefillStateId] = useState<string>("");
	const [prefillCity, setPrefillCity] = useState<string>("");
	const [prefillZip, setPrefillZip] = useState<string>("");
	const [prefetchDone, setPrefetchDone] = useState(false);
	const [geoData, setGeoData] = useState<{
		currency?: string;
		country_name?: string;
		region?: string;
		city?: string;
		postal?: string;
	}>({});

	// Auto-open dialog if onboarding is incomplete
	useEffect(() => {
		const shouldOpen = isGetStartedDialogOpen();
		if (shouldOpen && !open && !justSubmitted && !userDismissed) {
			handleOpen();
		}
	}, [user?.company, user?.currency_id, open, justSubmitted, userDismissed, isGetStartedDialogOpen, handleOpen]);

	// Kick off IP-based preload on mount
	useEffect(() => {
		if (prefetchDone) return;
		if (!currencyList?.data || currencyList.isLoading) return;
		if (!countryList?.data || countryList.isLoading) return;
		let cancelled = false;

		(async () => {
			try {
				const geo = useGeoPrefetchStore.getState();
				let json = geo.ipData ?? {};
				if (!geo.loaded) {
					const res = await fetch("https://ipapi.co/json");
					json = (await res.json()) as any;
				}
				if (cancelled) return;
				setGeoData(json);

				// Match currency
				const code = json?.currency?.toUpperCase();
				if (code) {
					setDetectedCurrencyCode(code);
					const matchCur = currencyList.data.find((c) => c.short_code?.toUpperCase() === code);
					if (matchCur) setPrefillCurrencyId(matchCur.id);
				}

				// Match country
				const cname = (json?.country_name ?? "").toLowerCase();
				if (json?.country_name) setDetectedCountryName(json.country_name);
				const matchCountry = countryList.data.find((c) => c.name?.toLowerCase() === cname);
				if (matchCountry) setPrefillCountryId(matchCountry.id);

				if (json?.city) setPrefillCity(json.city);
				if (json?.postal) setPrefillZip(json.postal);
			} catch {
				// ignore
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [currencyList?.data, currencyList.isLoading, countryList?.data, countryList.isLoading, prefetchDone]);

	// Map region after states load
	useEffect(() => {
		if (!prefillCountryId) return;
		if (!statesByPrefillCountry?.data || statesByPrefillCountry.isLoading) return;
		const regionName = (geoData?.region ?? "").toLowerCase();
		if (regionName) {
			const matchState = statesByPrefillCountry.data.find(
				(s) => s.name?.toLowerCase() === regionName,
			);
			if (matchState) setPrefillStateId(matchState.id);
		}
		setPrefetchDone(true);
	}, [statesByPrefillCountry?.data, statesByPrefillCountry.isLoading, prefillCountryId, geoData]);

	// Smart suggested business name from company, user name, or email domain
	const getSuggestedCompanyName = () => {
		if (user?.company?.[0]?.name) return user.company[0].name;
		if (user?.name && user.name.trim() !== "") return user.name;
		if (user?.email) {
			const parts = user.email.split("@");
			const domain = parts[1]?.split(".")[0];
			if (domain && !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(domain.toLowerCase())) {
				return domain.replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
			}
			return parts[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
		}
		return "My Business";
	};

	const suggestedCompanyName = getSuggestedCompanyName();

	// Simplified validation: Only companyName and currency_id required
	const validationSchema: Yup.Schema<UpdateCurrencyCompanyDto> = Yup.object().shape({
		currency_id: Yup.string().required(() =>
			i18nInstance.t("getStarted.currency.required", { defaultValue: "Currency is required" }),
		),
		companyName: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.companyNameRequired", {
				defaultValue: "Business / Company Name is required",
			}),
		),
		phoneNumber: Yup.string().test(
			"is-phone",
			() =>
				i18nInstance.t("getStarted.company.phoneInvalid", {
					defaultValue: "Phone number is not valid",
				}),
			function (value) {
				if (!value) return true;
				return isValidPhoneNumber(value);
			},
		),
		country: Yup.string().optional(),
		state: Yup.string().optional(),
		city: Yup.string().optional(),
		address: Yup.string().optional(),
		zipCode: Yup.string().optional(),
		vat: Yup.string().optional(),
		logo: Yup.string().optional(),
	});

	const initialValues: UpdateCurrencyCompanyDto = {
		address: user?.company?.[0]?.address ?? "",
		city: user?.company?.[0]?.city ?? prefillCity ?? "",
		companyName: suggestedCompanyName,
		country: user?.company?.[0]?.country_id ?? prefillCountryId ?? "",
		currency_id: user?.currency_id ?? prefillCurrencyId ?? "",
		logo: user?.company?.[0]?.logo ?? "",
		phoneNumber: user?.company?.[0]?.phone ?? user?.phone ?? "",
		state: user?.company?.[0]?.state_id ?? prefillStateId ?? "",
		vat: user?.company?.[0]?.vat ?? "",
		zipCode: user?.company?.[0]?.zip ?? prefillZip ?? "",
	};

	const stepLabels = [
		t("getStarted.steps.essentials", { defaultValue: "1. Essential Profile" }),
		t("getStarted.steps.invoicing", { defaultValue: "2. Advanced Details (Optional)" }),
		t("getStarted.steps.ready", { defaultValue: "3. Ready" }),
	];

	// Submit and persist
	const handleSubmit = async (
		values: UpdateCurrencyCompanyDto,
		actions?: FormikHelpers<UpdateCurrencyCompanyDto>,
		redirectToInvoice = false,
	) => {
		if (isSubmittingState) return;
		setIsSubmittingState(true);
		actions?.setSubmitting(true);

		try {
			// Ensure fallback currency if not provided
			let finalCurrencyId = values.currency_id;
			if (!finalCurrencyId && currencyList?.data?.length) {
				const usdOrFirst =
					currencyList.data.find((c) => c.short_code === "USD") || currencyList.data[0];
				finalCurrencyId = usdOrFirst?.id || "";
			}

			const payload: UpdateCurrencyCompanyDto = {
				...values,
				currency_id: finalCurrencyId,
				companyName: values.companyName || suggestedCompanyName || "My Business",
			};

			await updateUserData.mutateAsync({ data: payload });
			const updatedUser = await authControllerStatus();
			setUser(updatedUser);
			setJustSubmitted(true);

			if (redirectToInvoice) {
				handleClose();
				navigate("/invoice/createinvoice");
			} else {
				setActiveStep(3); // Move to Thank You / Launch screen
			}
		} catch (error) {
			console.error("Error saving business profile:", error);
		} finally {
			actions?.setSubmitting(false);
			setIsSubmittingState(false);
		}
	};

	// 1-Click Quick Setup Handler from Welcome Screen
	const handleQuickSetup = async () => {
		const currentValues = formikRef.current?.values || initialValues;

		let currencyToUse = currentValues.currency_id || prefillCurrencyId;
		if (!currencyToUse && currencyList?.data?.length) {
			const matched = currencyList.data.find(
				(c) => c.short_code?.toUpperCase() === detectedCurrencyCode,
			);
			currencyToUse = matched?.id || currencyList.data[0].id;
		}

		const companyNameToUse =
			currentValues.companyName || suggestedCompanyName || "My Business";

		const quickPayload: UpdateCurrencyCompanyDto = {
			...currentValues,
			companyName: companyNameToUse,
			currency_id: currencyToUse || "",
			country: currentValues.country || prefillCountryId || undefined,
			city: currentValues.city || prefillCity || undefined,
			zipCode: currentValues.zipCode || prefillZip || undefined,
		};

		await handleSubmit(quickPayload, undefined, true);
	};

	// Quick Save & Start Invoicing from Step 1 (Bypass Step 2)
	const handleSaveAndCreateInvoice = async () => {
		const values = formikRef.current?.values || initialValues;
		let hasError = false;

		if (!values?.companyName || values.companyName.trim() === "") {
			formikRef.current?.setFieldError(
				"companyName",
				t("getStarted.company.companyNameRequired", { defaultValue: "Business Name is required" }),
			);
			formikRef.current?.setFieldTouched("companyName", true);
			hasError = true;
		}

		if (!values?.currency_id) {
			formikRef.current?.setFieldError(
				"currency_id",
				t("getStarted.currency.required", { defaultValue: "Currency is required" }),
			);
			formikRef.current?.setFieldTouched("currency_id", true);
			hasError = true;
		}

		if (hasError) return;

		await handleSubmit(values, undefined, true);
	};

	const handleNext = () => {
		if (activeStep === 1) {
			// Validate companyName and currency_id
			const values = formikRef.current?.values;
			let hasError = false;

			if (!values?.companyName || values.companyName.trim() === "") {
				formikRef.current?.setFieldError(
					"companyName",
					t("getStarted.company.companyNameRequired", { defaultValue: "Business Name is required" }),
				);
				formikRef.current?.setFieldTouched("companyName", true);
				hasError = true;
			}

			if (!values?.currency_id) {
				formikRef.current?.setFieldError(
					"currency_id",
					t("getStarted.currency.required", { defaultValue: "Currency is required" }),
				);
				formikRef.current?.setFieldTouched("currency_id", true);
				hasError = true;
			}

			if (hasError) return;
		}

		setActiveStep((prev) => prev + 1);
	};

	const handleBack = () => {
		setActiveStep((prev) => Math.max(0, prev - 1));
	};

	const handleDialogClose = () => {
		setUserDismissed(true);
		handleClose();
	};

	// Progress percentage
	const progressPercentage =
		activeStep === 0 ? 0 : activeStep === 1 ? 50 : activeStep === 2 ? 85 : 100;

	return (
		<Dialog
			open={open}
			onClose={handleDialogClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: {
					borderRadius: 3,
					boxShadow: "0 16px 48px rgba(0, 0, 0, 0.14)",
					overflow: "hidden",
					position: "relative",
				},
			}}
		>
			{/* Top-Right Dismiss Button */}
			<IconButton
				aria-label="close"
				onClick={handleDialogClose}
				sx={{
					position: "absolute",
					right: 12,
					top: 12,
					color: "text.disabled",
					zIndex: 10,
					"&:hover": { color: "text.primary", bgcolor: "grey.100" },
				}}
				size="small"
			>
				<CloseIcon fontSize="small" />
			</IconButton>

			<Formik
				innerRef={formikRef}
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={(values, actions) => handleSubmit(values, actions, false)}
				enableReinitialize={!formikRef.current?.dirty}
				autoComplete="off"
			>
				{({ values, isSubmitting }) => {
					return (
						<Form>
							{/* Progress Bar & Stepper (Visible on steps 1, 2, 3) */}
							{activeStep > 0 && activeStep <= 3 && (
								<Box sx={{ pt: 2.5, px: 3, bgcolor: "background.paper" }}>
									<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
										<Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase">
											{activeStep === 1
												? t("getStarted.stepCount1", { defaultValue: "Step 1 of 2 • Essential Business Profile" })
												: activeStep === 2
												? t("getStarted.stepCount2", { defaultValue: "Step 2 of 2 • Advanced Settings (Optional)" })
												: t("getStarted.stepCount3", { defaultValue: "Completed • Ready to Invoice" })}
										</Typography>
										<Typography variant="caption" fontWeight={700} color="text.secondary">
											{progressPercentage}%
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={progressPercentage}
										sx={{
											height: 6,
											borderRadius: 3,
											bgcolor: "grey.100",
											"& .MuiLinearProgress-bar": {
												borderRadius: 3,
												background: "linear-gradient(90deg, #1976d2, #4caf50)",
											},
										}}
									/>

									{!isMobile && (
										<Stepper activeStep={activeStep - 1} sx={{ mt: 2, mb: 1 }}>
											{stepLabels.map((label, idx) => (
												<Step key={label} completed={activeStep - 1 > idx}>
													<StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.78rem", fontWeight: 600 } }}>
														{label}
													</StepLabel>
												</Step>
											))}
										</Stepper>
									)}
								</Box>
							)}

							<DialogContent
								sx={{
									py: 2.5,
									px: { xs: 2.5, sm: 3.5 },
									maxHeight: "82vh",
									overflowY: "auto",
									minHeight: activeStep === 0 ? "auto" : "380px",
								}}
							>
								{activeStep === 0 && (
									<GetStartedInitialScreen
										onQuickSetup={handleQuickSetup}
										onGuidedSetup={() => setActiveStep(1)}
										onDismiss={handleDialogClose}
										detectedInfo={{
											countryName: detectedCountryName,
											currency: detectedCurrencyCode,
											companyName: suggestedCompanyName,
										}}
										isSubmitting={isSubmitting || isSubmittingState}
									/>
								)}

								{activeStep === 1 && (
									<EssentialSetupForm
										onGeoLoadingChange={setGeoLoading}
										geoData={geoData}
									/>
								)}

								{activeStep === 2 && <InvoicingTaxForm />}

								{activeStep === 3 && <ThankYouForm onActionSelect={handleClose} />}
							</DialogContent>

							{/* Actions Footer */}
							{activeStep > 0 && activeStep < 3 && (
								<DialogActions
									sx={{
										px: 3,
										py: 2,
										borderTop: "1px solid",
										borderColor: "divider",
										justifyContent: "space-between",
										bgcolor: "grey.50",
										flexWrap: "wrap",
										gap: 1,
									}}
								>
									{/* Back */}
									<Button
										variant="outlined"
										startIcon={<ArrowBackIcon />}
										onClick={handleBack}
										disabled={geoLoading || isSubmitting || isSubmittingState}
										size="medium"
										sx={{ borderRadius: 2 }}
									>
										{t("app.back", { defaultValue: "Back" })}
									</Button>

									<Box display="flex" gap={1.25} alignItems="center" flexWrap="wrap">
										{/* Instant Start Invoicing Shortcut on Step 1 (Save essentials & skip advanced) */}
										{activeStep === 1 && (
											<Button
												variant="outlined"
												color="primary"
												startIcon={<ReceiptLongIcon />}
												onClick={handleSaveAndCreateInvoice}
												disabled={geoLoading || isSubmitting || isSubmittingState}
												size="medium"
												sx={{ borderRadius: 2, fontWeight: 600 }}
											>
												{t("getStarted.startInvoicingNow", { defaultValue: "Save & Start Invoicing" })}
											</Button>
										)}

										{/* Next Step */}
										{activeStep === 1 && (
											<Button
												variant="contained"
												endIcon={<NavigateNextIcon />}
												onClick={handleNext}
												disabled={geoLoading || isSubmitting || isSubmittingState}
												size="medium"
												sx={{ borderRadius: 2, fontWeight: 600, px: 2.5 }}
											>
												{t("getStarted.nextAdvanced", { defaultValue: "Advanced Details" })}
											</Button>
										)}

										{/* Skip & Create Invoice on Step 2 */}
										{activeStep === 2 && (
											<Button
												variant="outlined"
												color="primary"
												startIcon={<ReceiptLongIcon />}
												onClick={() => handleSubmit(values, undefined, true)}
												disabled={geoLoading || isSubmitting || isSubmittingState}
												size="medium"
												sx={{ borderRadius: 2, fontWeight: 600 }}
											>
												{t("getStarted.skipAndInvoice", { defaultValue: "Skip & Create Invoice" })}
											</Button>
										)}

										{/* Complete Setup on Step 2 */}
										{activeStep === 2 && (
											<Button
												type="button"
												variant="contained"
												endIcon={<CheckIcon />}
												onClick={() => handleSubmit(values, undefined, false)}
												disabled={geoLoading || isSubmitting || isSubmittingState}
												size="medium"
												sx={{
													borderRadius: 2,
													fontWeight: 700,
													px: 3,
													boxShadow: "0 4px 14px rgba(25, 118, 210, 0.3)",
												}}
											>
												{isSubmitting || isSubmittingState
													? t("app.loading", { defaultValue: "Saving..." })
													: t("getStarted.finishSetup", { defaultValue: "Complete Setup" })}
											</Button>
										)}
									</Box>
								</DialogActions>
							)}
						</Form>
					);
				}}
			</Formik>
		</Dialog>
	);
};

export default GetStartedDialog;
