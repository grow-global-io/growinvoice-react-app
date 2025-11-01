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
		city: "",
		companyName: user?.company?.[0]?.name ?? "",
		country: "",
		currency_id: "",
		logo: "",
		phoneNumber: "",
		state: "",
		vat: "",
		zipCode: "",
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
									{activeStep === 1 && <CurrencyUpdateForm />}
									{activeStep === 2 && <CompanyUpdateForm />}
								</Box>
							</DialogContent>

							<DialogActions
								sx={{
									justifyContent: "space-between",
								}}
							>
								<Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>
									{t("app.back", { defaultValue: "Back" })}
								</Button>
								<Button variant="outlined" color="warning" onClick={handleClose}>
									{t("app.skip", { defaultValue: "Skip" })}
								</Button>

								{activeStep !== steps.length - 2 && (
									<Button
										variant="contained"
										onClick={() => {
											handleNext(values?.currency_id);
										}}
									>
										{t("app.next", { defaultValue: "Next" })}
									</Button>
								)}
								{activeStep === steps.length - 2 && (
									<Button variant="contained" onClick={submitForm}>
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
