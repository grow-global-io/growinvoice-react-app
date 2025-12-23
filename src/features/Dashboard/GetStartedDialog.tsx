import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Step,
	Stepper,
	StepConnector,
	stepConnectorClasses,
	styled,
} from "@mui/material";
import React, { useRef } from "react";
import GetStartedInitialScreen from "./GetStarted/GetStartedInitialScreen";
import CurrencyUpdateForm from "./GetStarted/CurrencyUpdateForm";
import CompanyUpdateForm from "./GetStarted/CompanyUpdateForm";
import ProductTypeForm from "./GetStarted/ProductTypeForm";
import NicheSelectionForm from "./GetStarted/NicheSelectionForm";
import CatalogMethodForm from "./GetStarted/CatalogMethodForm";
import PaymentMethodsForm from "./GetStarted/PaymentMethodsForm";
import DeliveryOptionsForm from "./GetStarted/DeliveryOptionsForm";
import InvoiceAutomationForm from "./GetStarted/InvoiceAutomationForm";
import GSTTaxSettingsForm from "./GetStarted/GSTTaxSettingsForm";
import StoreBrandingForm from "./GetStarted/StoreBrandingForm";
import ConnectSocialsForm from "./GetStarted/ConnectSocialsForm";
import ThankYouForm from "./GetStarted/ThankYouForm";
import * as Yup from "yup";
import { Form, Formik, type FormikHelpers, type FormikProps } from "formik";
import { type UpdateCurrencyCompanyDto } from "@api/services/models";
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
import { useEffect, useState } from "react";
import { useGeoPrefetchStore } from "@store/geoPrefetch";

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 0,
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundColor: theme.palette.primary.main,
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundColor: theme.palette.primary.main,
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		height: 5,
		border: 0,
		width: "100%",
		padding: 0,
		backgroundColor: theme.palette.grey[100],
		borderRadius: 1,
	},
}));
const CustomStepperBox = styled(Box)(() => ({
	width: "60%", // Adjust the width as needed to control the spacing
	margin: "auto",
}));

const GetStartedDialog = () => {
	const { t, i18n: i18nInstance } = useTranslation();
	const { open, handleClose, handleOpen } = useGetStartedDialogStore();
	const formikRef = useRef<FormikProps<UpdateCurrencyCompanyDto>>(null);
	const { user, setUser, isGetStartedDialogOpen } = useAuthStore();
	const updateUserData = useUserControllerUpdateCurrencyCompany();
	const [activeStep, setActiveStep] = React.useState(0);
	const [geoLoading, setGeoLoading] = React.useState(false);
	const [justSubmitted, setJustSubmitted] = React.useState(false);
	const [isSubmittingState, setIsSubmittingState] = React.useState(false);
	const [userDismissed, setUserDismissed] = React.useState(false);

	// Preload currency/country/state by IP
	const currencyList = useCurrencyControllerFindAll();
	const countryList = useCurrencyControllerFindCountries();
	const [prefillCountryId, setPrefillCountryId] = useState<string>("");
	const statesByPrefillCountry = useCurrencyControllerFindStatesByCountry({
		countryId: prefillCountryId,
	});
	const [prefillCurrencyId, setPrefillCurrencyId] = useState<string>("");
	const [prefillStateId, setPrefillStateId] = useState<string>("");
	const [prefillCity, setPrefillCity] = useState<string>("");
	const [prefillZip, setPrefillZip] = useState<string>("");
	const [prefetchDone, setPrefetchDone] = useState(false);

	// Auto-open dialog if onboarding is incomplete (but don't reopen if just submitted or user dismissed)
	useEffect(() => {
		const shouldOpen = isGetStartedDialogOpen();
		if (shouldOpen && !open && !justSubmitted && !userDismissed) {
			handleOpen();
		}
		// Only check when user data changes or dialog state changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.company, open, justSubmitted, userDismissed]);

	// Kick off IP-based preload on mount (and when lists ready); use preloaded store if present
	useEffect(() => {
		if (prefetchDone) return;
		if (!currencyList?.data || currencyList.isLoading) return;
		if (!countryList?.data || countryList.isLoading) return;
		let cancelled = false;
		(async () => {
			try {
				const geo = useGeoPrefetchStore.getState();
				let json: {
					currency?: string;
					country_name?: string;
					region?: string;
					city?: string;
					postal?: string;
				} = geo.ipData ?? {};
				if (!geo.loaded) {
					const res = await fetch("https://ipapi.co/json");
					json = (await res.json()) as any;
				}
				if (cancelled) return;
				// currency
				const code = json?.currency?.toUpperCase();
				if (code) {
					const matchCur = currencyList.data.find((c) => c.short_code?.toUpperCase() === code);
					if (matchCur) setPrefillCurrencyId(matchCur.id);
				}
				// country
				const cname = (json?.country_name ?? "").toLowerCase();
				const matchCountry = countryList.data.find((c) => c.name?.toLowerCase() === cname);
				if (matchCountry) setPrefillCountryId(matchCountry.id);
				setPrefillCity(json?.city ?? "");
				setPrefillZip(json?.postal ?? "");
			} catch {
				// ignore
			}
		})();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currencyList?.data, currencyList.isLoading, countryList?.data, countryList.isLoading]);

	// After states load, map region
	useEffect(() => {
		if (!prefillCountryId) return;
		if (!statesByPrefillCountry?.data || statesByPrefillCountry.isLoading) return;
		// fetch again from ip to read region (or reuse previous)
		(async () => {
			try {
				const res = await fetch("https://ipapi.co/json");
				const json = (await res.json()) as { region?: string };
				const regionName = (json?.region ?? "").toLowerCase();
				const matchState = statesByPrefillCountry.data.find(
					(s) => s.name?.toLowerCase() === regionName,
				);
				if (matchState) setPrefillStateId(matchState.id);
			} catch {
				// ignore
			} finally {
				setPrefetchDone(true);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statesByPrefillCountry?.data, statesByPrefillCountry.isLoading, prefillCountryId]);

	const validationSchema: Yup.Schema<UpdateCurrencyCompanyDto> = Yup.object().shape({
		currency_id: Yup.string().required(() =>
			i18nInstance.t("getStarted.currency.required", { defaultValue: "Currency is required" }),
		),
		companyName: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.companyNameRequired", {
				defaultValue: "Company Name is required",
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
		country: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.countryRequired", { defaultValue: "Country is required" }),
		),
		state: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.stateRequired", { defaultValue: "State is required" }),
		),
		city: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.cityRequired", { defaultValue: "City is required" }),
		),
		address: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.addressRequired", { defaultValue: "Address is required" }),
		),
		zipCode: Yup.string().required(() =>
			i18nInstance.t("getStarted.company.zipCodeRequired", {
				defaultValue: "Zip Code is required",
			}),
		),
		vat: Yup.string(),
		logo: Yup.string(),
	});

	const steps = [
		t("getStarted.steps.step1", { defaultValue: "Personal Inf." }),
		t("getStarted.steps.step2", { defaultValue: "Verification" }),
		t("getStarted.steps.step3", { defaultValue: "Insurance" }),
		t("getStarted.steps.step4", { defaultValue: "Payment" }),
		t("getStarted.steps.step5", { defaultValue: "Products" }),
		t("getStarted.steps.step6", { defaultValue: "Niche" }),
		t("getStarted.steps.step7", { defaultValue: "Catalog" }),
		t("getStarted.steps.step8", { defaultValue: "Payment Methods" }),
		t("getStarted.steps.step9", { defaultValue: "Delivery" }),
		t("getStarted.steps.step10", { defaultValue: "Invoice Automation" }),
		t("getStarted.steps.step11", { defaultValue: "GST & Tax" }),
		t("getStarted.steps.step12", { defaultValue: "Branding" }),
		t("getStarted.steps.step13", { defaultValue: "Socials" }),
	];

	const handleNext = (value?: string) => {
		// Validate currency on step 1
		if (!value && activeStep === 1) {
			formikRef.current?.setFieldError(
				"currency_id",
				t("getStarted.currency.required", { defaultValue: "Currency is required" }),
			);
			formikRef.current?.setFieldTouched("currency_id", true);
			return;
		}

		// Validate required fields on step 2 (Company form)
		if (activeStep === 2) {
			const values = formikRef.current?.values;
			let hasError = false;

			// Validate country
			if (!values?.country || values.country.trim() === "") {
				formikRef.current?.setFieldError(
					"country",
					t("getStarted.company.countryRequired", { defaultValue: "Country is required" }),
				);
				formikRef.current?.setFieldTouched("country", true);
				hasError = true;
			}

			// Validate state
			if (!values?.state || values.state.trim() === "") {
				formikRef.current?.setFieldError(
					"state",
					t("getStarted.company.stateRequired", { defaultValue: "State is required" }),
				);
				formikRef.current?.setFieldTouched("state", true);
				hasError = true;
			}

			// Validate zipCode
			if (!values?.zipCode || values.zipCode.trim() === "") {
				formikRef.current?.setFieldError(
					"zipCode",
					t("getStarted.company.zipCodeRequired", { defaultValue: "Zip Code is required" }),
				);
				formikRef.current?.setFieldTouched("zipCode", true);
				hasError = true;
			}

			// Validate address
			if (!values?.address || values.address.trim() === "") {
				formikRef.current?.setFieldError(
					"address",
					t("getStarted.company.addressRequired", { defaultValue: "Address is required" }),
				);
				formikRef.current?.setFieldTouched("address", true);
				hasError = true;
			}

			if (hasError) {
				return;
			}
		}

		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleSkip = () => {
		if (activeStep < steps.length - 1) {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
		productType?: string;
		businessName?: string;
		niches?: string[];
		catalogMethod?: string;
		paymentMethods?: string[];
		enablePartialPayments?: boolean;
		selfDelivery?: boolean;
		deliveryPartners?: string[];
		deliveryRegions?: string[];
		pickupAddress?: string;
		autoGenerateInvoices?: boolean;
		invoicePrefix?: string;
		startingNumber?: string;
		invoiceFooterText?: string;
		sendInvoiceOnOrderConfirmation?: boolean;
		sendInvoiceOnPaymentCompletion?: boolean;
		sendCopyToStoreEmail?: boolean;
		gstRegistered?: boolean;
		enableHsnSac?: boolean;
		defaultTaxRate?: string;
		storeLogo?: string;
		storeName?: string;
		tagline?: string;
		primaryBrandColor?: string;
		whatsappCommunityUrl?: string;
		instagramHandle?: string;
		facebookPageId?: string;
		webhookUrl?: string;
		storeOrPaymentGateway?: "store" | "paymentGateway" | "both" | "none";
	}

	const initialValues: ExtendedFormValues = {
		address: "",
		city: prefillCity || "",
		companyName: user?.company?.[0]?.name ?? "",
		country: prefillCountryId || "",
		currency_id: prefillCurrencyId || "",
		logo: "",
		phoneNumber: "",
		state: prefillStateId || "",
		vat: "",
		zipCode: prefillZip || "",
		productType: "",
		businessName: "",
		niches: [],
		catalogMethod: "",
		paymentMethods: [],
		enablePartialPayments: false,
		selfDelivery: false,
		deliveryPartners: [],
		deliveryRegions: [],
		pickupAddress: "",
		autoGenerateInvoices: true,
		invoicePrefix: "INV-",
		startingNumber: "1",
		invoiceFooterText: "",
		sendInvoiceOnOrderConfirmation: true,
		sendInvoiceOnPaymentCompletion: false,
		sendCopyToStoreEmail: true,
		gstRegistered: false,
		enableHsnSac: false,
		defaultTaxRate: "",
		storeLogo: "",
		storeName: "",
		tagline: "",
		primaryBrandColor: "#9333ea",
		whatsappCommunityUrl: "",
		instagramHandle: "",
		facebookPageId: "",
		webhookUrl: "",
		storeOrPaymentGateway: "none",
	};

	// Ensure dialog closes after successful submission
	useEffect(() => {
		if (justSubmitted && open) {
			const timer = setTimeout(() => {
				handleClose();
				setJustSubmitted(false);
			}, 200);
			return () => clearTimeout(timer);
		}
	}, [justSubmitted, open, handleClose]);

	const handleSubmit = async (
		values: ExtendedFormValues,
		actions: FormikHelpers<ExtendedFormValues>,
	) => {
		if (isSubmittingState) {
			return;
		}
		setIsSubmittingState(true);
		actions.setSubmitting(true);
		// Extract only UpdateCurrencyCompanyDto fields for the API call
		const {
			productType,
			businessName,
			niches,
			catalogMethod,
			paymentMethods,
			enablePartialPayments,
			selfDelivery,
			deliveryPartners,
			deliveryRegions,
			pickupAddress,
			autoGenerateInvoices,
			invoicePrefix,
			startingNumber,
			invoiceFooterText,
			sendInvoiceOnOrderConfirmation,
			sendInvoiceOnPaymentCompletion,
			sendCopyToStoreEmail,
			gstRegistered,
			enableHsnSac,
			defaultTaxRate,
			storeLogo,
			storeName,
			tagline,
			primaryBrandColor,
			whatsappCommunityUrl,
			instagramHandle,
			facebookPageId,
			webhookUrl,
			storeOrPaymentGateway,
			...updateData
		} = values;

		// Log the additional fields (you can send these to a different endpoint if needed)
		if (
			productType ||
			businessName ||
			niches?.length ||
			catalogMethod ||
			paymentMethods?.length ||
			enablePartialPayments ||
			selfDelivery ||
			deliveryPartners?.length ||
			deliveryRegions?.length ||
			pickupAddress ||
			autoGenerateInvoices !== undefined ||
			invoicePrefix ||
			startingNumber ||
			invoiceFooterText ||
			sendInvoiceOnOrderConfirmation !== undefined ||
			sendInvoiceOnPaymentCompletion !== undefined ||
			sendCopyToStoreEmail !== undefined ||
			gstRegistered !== undefined ||
			enableHsnSac !== undefined ||
			defaultTaxRate ||
			storeLogo ||
			storeName ||
			tagline ||
			primaryBrandColor ||
			whatsappCommunityUrl ||
			instagramHandle ||
			facebookPageId ||
			webhookUrl ||
			storeOrPaymentGateway
		) {
			// Additional onboarding data is available but not sent to API yet
			// TODO: Send all additional fields to appropriate endpoint if needed
		}

		try {
			await updateUserData.mutateAsync({
				data: updateData,
			});
			const user = await authControllerStatus();
			setUser(user);
			setJustSubmitted(true);
			// Move to the thank you step (step 12) instead of using justSubmitted state
			setActiveStep(12);
			// Close dialog after showing thank you message for 2 seconds
			setTimeout(() => {
				actions.resetForm();
				handleClose();
				setActiveStep(0);
				setJustSubmitted(false);
			}, 2000);
		} catch (error) {
			console.error("Error submitting form:", error);
			// Don't close the dialog on error, let user retry
		} finally {
			actions.setSubmitting(false);
			setIsSubmittingState(false);
		}
	};

	const handleDialogClose = () => {
		setUserDismissed(true);
		handleClose();
	};

	return (
		<Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth={"sm"}>
			<Formik
				innerRef={formikRef}
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				{({ submitForm, values, isSubmitting, errors }) => {
					return (
						<Form>
							<DialogContent
								dividers
								style={{ maxHeight: "70vh", overflowY: "auto", minHeight: "400px" }}
							>
								{justSubmitted || activeStep > 11 ? (
									<ThankYouForm />
								) : (
									<>
										<CustomStepperBox>
											<Stepper
												activeStep={activeStep}
												alternativeLabel
												connector={<CustomStepConnector />}
											>
												{steps.map((label) => (
													<Step key={label}></Step>
												))}
											</Stepper>
										</CustomStepperBox>
										<Box textAlign={"center"} pt={3}>
											{activeStep === 0 && <GetStartedInitialScreen />}
											{activeStep === 1 && (
												<CurrencyUpdateForm onGeoLoadingChange={setGeoLoading} />
											)}
											{activeStep === 2 && <CompanyUpdateForm onGeoLoadingChange={setGeoLoading} />}
											{activeStep === 3 && <ProductTypeForm />}
											{activeStep === 4 && <NicheSelectionForm />}
											{activeStep === 5 && <CatalogMethodForm />}
											{activeStep === 6 && <PaymentMethodsForm />}
											{activeStep === 7 && <DeliveryOptionsForm />}
											{activeStep === 8 && <InvoiceAutomationForm />}
											{activeStep === 9 && <GSTTaxSettingsForm />}
											{activeStep === 10 && <StoreBrandingForm />}
											{activeStep === 11 && <ConnectSocialsForm />}
										</Box>
									</>
								)}
							</DialogContent>

							<DialogActions
								sx={{
									justifyContent: "space-between",
								}}
							>
								<Button
									variant="outlined"
									onClick={handleBack}
									disabled={activeStep === 0 || geoLoading}
								>
									{t("app.back", { defaultValue: "Back" })}
								</Button>
								<Button
									variant="outlined"
									color="warning"
									onClick={handleSkip}
									disabled={geoLoading || activeStep >= steps.length - 1}
								>
									{t("app.skip", { defaultValue: "Skip" })}
								</Button>

								{activeStep < steps.length - 1 && (
									<Button
										variant="contained"
										disabled={geoLoading}
										onClick={() => {
											handleNext(values?.currency_id);
										}}
									>
										{t("app.next", { defaultValue: "Next" })}
									</Button>
								)}
								{activeStep === 11 && !justSubmitted && activeStep <= 11 && (
									<Button
										type="button"
										variant="contained"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (isSubmittingState || isSubmitting) {
												return;
											}

											// On the last step, submit even if there are validation errors
											// This allows users to finish the onboarding even if they skipped some fields
											if (Object.keys(errors).length > 0) {
												// Manually call handleSubmit to bypass validation
												handleSubmit(values, {
													setSubmitting: (isSubmitting: boolean) => {
														formikRef.current?.setSubmitting(isSubmitting);
													},
													resetForm: () => {
														formikRef.current?.resetForm();
													},
												} as FormikHelpers<ExtendedFormValues>).catch((err) => {
													console.error("Submit form error:", err);
												});
											} else {
												submitForm().catch((err) => {
													console.error("Submit form error:", err);
												});
											}
										}}
										disabled={geoLoading || isSubmitting || isSubmittingState}
									>
										{isSubmitting || isSubmittingState
											? t("app.loading", { defaultValue: "Loading..." })
											: t("app.finish", { defaultValue: "Finish" })}
									</Button>
								)}
								{justSubmitted && (
									<Button variant="contained" onClick={handleClose}>
										{t("app.close", { defaultValue: "Close" })}
									</Button>
								)}
							</DialogActions>
						</Form>
					);
				}}
			</Formik>
		</Dialog>
	);
};

export default GetStartedDialog;
