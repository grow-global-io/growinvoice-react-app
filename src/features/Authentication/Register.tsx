import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Formik, Field, Form } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useUserControllerCreateUser } from "@api/services/users";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { Constants } from "@shared/constants";
import { isValidPhoneNumber } from "react-phone-number-input";

const Register = () => {
	const navigation = useNavigate();
	const createUser = useUserControllerCreateUser({
		mutation: {
			onSuccess: () => {
				navigation("/login");
			},
		},
	});

	const initialValues = {
		fullname: "",
		companyname: "",
		email: "",
		phone: "",
		password: "",
		conpassword: "",
	};

	const schema = yup.object().shape({
		fullname: yup.string().required("Full Name is required"),
		companyname: yup.string().required("Company Name is required"),
		email: yup.string().email().required("Email is required"),
		phone: yup.string().test("is-phone", "Phone number is not valid", function (value) {
			if (!value) return false;
			return isValidPhoneNumber(value);
		}),
		password: yup
			.string()
			.min(7, "Password is at least 7 characters")
			.required("Password is required"),
		conpassword: yup
			.string()
			.oneOf([yup.ref("password")], "Passwords must match")
			.required("Confirm Password is required"),
	});

	const handleSubmit = async (values: typeof initialValues) => {
		await createUser.mutateAsync({
			data: {
				name: values.fullname,
				companyName: values.companyname,
				phone: values.phone,
				email: values.email,
				password: values.password,
			},
		});
	};

	return (
		<Box
			sx={{
				position: "relative",
				backgroundImage: `url(${Constants.customImages.BgImageSvg})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				backgroundAttachment: "fixed",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				margin: 0,
				padding: 2,
				height: "95vh",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "custom.lightDark", // black overlay with 50% transparency
					zIndex: 1,
				},
			}}
		>
			<Box
				sx={{
					position: "relative",
					zIndex: 2,
					width: {
						xs: "100%",
						sm: "30%",
					},
				}}
			>
				<Card sx={{ borderRadius: 4, p: 2, mb: 3, overflow: "auto" }}>
					<CardContent>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<Typography fontWeight="600" sx={{ mb: 2, fontSize: 26 }}>
								Lets Start!
							</Typography>
							<Typography
								color="text.secondary"
								sx={{ mb: 2, textAlign: "center" }}
								variant="caption"
								fontWeight="400"
							>
								Please create your account to continue with &nbsp;
								<Typography color="text.secondary" variant="caption" fontWeight="700">
									GROWINVOICE
								</Typography>
							</Typography>
						</Box>
						<Box sx={{ mb: 2, mt: 2 }}>
							<Formik
								initialValues={initialValues}
								validationSchema={schema}
								onSubmit={handleSubmit}
							>
								{() => {
									return (
										<Form>
											<Field
												name="fullname"
												component={TextFormField}
												label="Full Name"
												required={true}
											/>
											<Field
												name="companyname"
												component={TextFormField}
												label="Company Name"
												required={true}
											/>
											<Field name="email" component={TextFormField} label="Email" required={true} />
											<Field
												name="phone"
												component={PhoneInputFormField}
												label="Phone"
												required={true}
											/>
											<Field
												name="password"
												type={"password"}
												component={TextFormField}
												label="Password"
												required={true}
											/>
											<Field
												name="conpassword"
												type={"password"}
												component={TextFormField}
												label="Confirm Password"
												required={true}
											/>
											<Box
												sx={{
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
													flexDirection: "column",
													gap: 2,
												}}
											>
												<Button
													// disabled={!formik.isValid || formik.isSubmitting}
													type="submit"
													variant="contained"
													color="primary"
													sx={{
														display: "flex",
														justifyContent: "center",
														alignItems: "center",
														minWidth: 200,
													}}
												>
													Register
												</Button>
												<Button
													variant="outlined"
													color="primary"
													sx={{
														display: "flex",
														justifyContent: "center",
														alignItems: "center",
														minWidth: 200,
													}}
													onClick={() => {
														navigation("/login");
													}}
												>
													login
												</Button>
											</Box>
										</Form>
									);
								}}
							</Formik>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
};

export default Register;
