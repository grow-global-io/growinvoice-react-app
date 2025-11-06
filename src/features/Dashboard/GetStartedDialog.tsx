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
	const { open, handleClose } = useGetStartedDialogStore();
	const formikRef = useRef<FormikProps<UpdateCurrencyCompanyDto>>(null);
	const { user, setUser } = useAuthStore();
	const updateUserData = useUserControllerUpdateCurrencyCompany();
	const [activeStep, setActiveStep] = React.useState(0);
	const [geoLoading, setGeoLoading] = React.useState(false);

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
	];

	const handleNext = (value?: string) => {
		if (!value && activeStep === 1) {
			formikRef.current?.setFieldError(
				"currency_id",
				t("getStarted.currency.required", { defaultValue: "Currency is required" }),
			);
			formikRef.current?.setFieldTouched("currency_id", true);
			return;
		}
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const initialValues: UpdateCurrencyCompanyDto = {
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
	};

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		actions.setSubmitting(true);
		await updateUserData.mutateAsync({
			data: values,
		});
		const user = await authControllerStatus();
		setUser(user);
		handleClose();
		actions.resetForm();
		actions.setSubmitting(false);
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth={"sm"}>
			<Formik
				innerRef={formikRef}
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				{({ submitForm, values }) => {
					return (
						<Form>
							<DialogContent dividers style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
									{activeStep === 1 && <CurrencyUpdateForm onGeoLoadingChange={setGeoLoading} />}
									{activeStep === 2 && <CompanyUpdateForm onGeoLoadingChange={setGeoLoading} />}
								</Box>
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
									onClick={handleClose}
									disabled={geoLoading}
								>
									{t("app.skip", { defaultValue: "Skip" })}
								</Button>

								{activeStep !== steps.length - 2 && (
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
								{activeStep === steps.length - 2 && (
									<Button variant="contained" onClick={submitForm} disabled={geoLoading}>
										{t("app.finish", { defaultValue: "Finish" })}
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
