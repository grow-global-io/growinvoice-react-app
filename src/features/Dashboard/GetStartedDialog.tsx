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
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { UpdateCurrencyCompanyDto } from "@api/services/models";
import { useAuthStore } from "@store/auth";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useUserControllerUpdateCurrencyCompany } from "@api/services/users";
import { authControllerStatus } from "@api/services/auth";

const validationSchema: Yup.Schema<UpdateCurrencyCompanyDto> = Yup.object().shape({
	currency_id: Yup.string().required("Currency is required"),
	companyName: Yup.string().required("Company Name is required"),
	phoneNumber: Yup.string().test("is-phone", "Phone number is not valid", function (value) {
		if (!value) return true;
		return isValidPhoneNumber(value);
	}),
	country: Yup.string().required("Country is required"),
	state: Yup.string().required("State is required"),
	city: Yup.string().required("City is required"),
	address: Yup.string().required("Address is required"),
	zipCode: Yup.string().required("Zip Code is required"),
	vat: Yup.string(),
	logo: Yup.string(),
});

const steps = ["Personal Inf.", "Verification", "Insurance", "Payment"];

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

const GetStartedDialog = ({ open, handleClose }: { open: boolean; handleClose?: () => void }) => {
	const formikRef = useRef<FormikProps<UpdateCurrencyCompanyDto>>(null);
	const { user, setUser } = useAuthStore();
	const updateUserData = useUserControllerUpdateCurrencyCompany();
	const [activeStep, setActiveStep] = React.useState(0);

	const handleNext = (value?: string) => {
		if (!value && activeStep === 1) {
			formikRef.current?.setFieldError("currency_id", "Currency is required");
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
									Back
								</Button>

								{activeStep !== steps.length - 2 && (
									<Button
										variant="contained"
										onClick={() => {
											handleNext(values?.currency_id);
										}}
									>
										Next
									</Button>
								)}
								{activeStep === steps.length - 2 && (
									<Button variant="contained" onClick={submitForm}>
										Finish
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
