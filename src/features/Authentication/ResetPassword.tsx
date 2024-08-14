import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import NoDataFound from "@shared/components/NoDataFound";
import * as yup from "yup";
import { useUserControllerResetPassword } from "@api/services/users";
import { Constants } from "@shared/constants";

const ResetPassword = () => {
	const location = useLocation();
	const navigation = useNavigate();
	const resetPassword = useUserControllerResetPassword({
		mutation: {
			onSuccess: () => {
				navigation("/login");
			},
		},
	});
	const queryParams = new URLSearchParams(location.search);
	const token = queryParams.get("token");

	const initialValues = {
		token: token || "",
		password: "",
		conpassword: "",
	};

	const schema = yup.object().shape({
		token: yup.string().required("Token is required"),
		password: yup
			.string()
			.min(7, "Password is at least 7 characters")
			.required("Password is required"),
		conpassword: yup
			.string()
			.oneOf([yup.ref("password")], "Passwords must match")
			.required("Confirm Password is required"),
	});

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		actions.setSubmitting(true);
		await resetPassword.mutateAsync({
			data: {
				token: values.token,
				password: values.password,
			},
		});
		actions.resetForm();
		actions.setSubmitting(false);
	};

	if (!token) {
		return <NoDataFound message="Invalid token. Please check your email for the correct link." />;
	}

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
			<Box sx={{ position: "relative", zIndex: 2 }}>
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
								Reset Password
							</Typography>
							<Typography color="text.secondary" sx={{ mb: 2 }} variant="caption" fontWeight="400">
								Please enter your new password to reset your password &nbsp;
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
								{(formik) => {
									return (
										<Form>
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
													disabled={!formik.isValid || formik.isSubmitting}
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
													Reset Password
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
			<Box>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						fontStyle: "italic",
						fontSize: 10,
						fontWeight: 700,
						textAlign: "center",
					}}
				>
					© GROW INVOICE - {new Date().getFullYear()}
				</Typography>
			</Box>
		</Box>
	);
};

export default ResetPassword;
