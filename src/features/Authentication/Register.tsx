import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Formik, Field, Form } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useUserControllerCreateUser } from "@api/services/users";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { Constants } from "@shared/constants";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/auth";

const Register = () => {
	const { t } = useTranslation();
	const navigation = useNavigate();
	const { setToken } = useAuthStore();
	const createUser = useUserControllerCreateUser({
		mutation: {
			onSuccess: (response) => {
				// The API now returns { message: string, authToken: string }
				// If user already exists, it logs them in and returns the token
				const responseData = response as any; // Type assertion since API response changed
				if (responseData?.authToken) {
					setToken(responseData.authToken);
					// Redirect to dashboard after successful registration/login
					navigation("/");
				} else {
					// Fallback to login page if no token (shouldn't happen with new API)
					navigation("/login");
				}
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
		fullname: yup
			.string()
			.required(t("auth.fullNameRequired", { defaultValue: "Full Name is required" })),
		companyname: yup
			.string()
			.required(t("auth.companyNameRequired", { defaultValue: "Company Name is required" })),
		email: yup
			.string()
			.email()
			.required(t("auth.emailRequired", { defaultValue: "Email is required" })),
		phone: yup
			.string()
			.test(
				"is-phone",
				t("auth.phoneInvalid", { defaultValue: "Phone number is not valid" }),
				function (value) {
					if (!value) return false;
					return isValidPhoneNumber(value);
				},
			),
		password: yup
			.string()
			.min(7, t("auth.passwordMin", { defaultValue: "Password is at least 7 characters" }))
			.required(t("auth.passwordRequired", { defaultValue: "Password is required" })),
		conpassword: yup
			.string()
			.oneOf(
				[yup.ref("password")],
				t("auth.passwordsMatch", { defaultValue: "Passwords must match" }),
			)
			.required(
				t("auth.confirmPasswordRequired", { defaultValue: "Confirm Password is required" }),
			),
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
								{t("auth.letsStart", { defaultValue: "Lets Start!" })}
							</Typography>
							<Typography
								color="text.secondary"
								sx={{ mb: 2, textAlign: "center" }}
								variant="caption"
								fontWeight="400"
							>
								{t("auth.createAccount", {
									defaultValue: "Please create your account to continue with",
								})}{" "}
								&nbsp;
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
												label={t("auth.fullName", { defaultValue: "Full Name" })}
												required={true}
											/>
											<Field
												name="companyname"
												component={TextFormField}
												label={t("auth.companyName", { defaultValue: "Company Name" })}
												required={true}
											/>
											<Field
												name="email"
												component={TextFormField}
												label={t("auth.email")}
												required={true}
											/>
											<Field
												name="phone"
												component={PhoneInputFormField}
												label={t("auth.phone", { defaultValue: "Phone" })}
												required={true}
											/>
											<Field
												name="password"
												type={"password"}
												component={TextFormField}
												label={t("auth.password")}
												required={true}
											/>
											<Field
												name="conpassword"
												type={"password"}
												component={TextFormField}
												label={t("auth.confirmPassword", { defaultValue: "Confirm Password" })}
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
													{t("auth.register", { defaultValue: "Register" })}
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
													{t("auth.login", { defaultValue: "Login" })}
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
