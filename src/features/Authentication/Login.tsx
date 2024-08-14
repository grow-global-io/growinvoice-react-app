import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Formik, Field, Form } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import * as yup from "yup";
import ForgotPassword from "./ForgotPassword";
import { useUserControllerLoginUser } from "@api/services/users";
import { useAuthStore } from "@store/auth";
import { useNavigate } from "react-router-dom";
import { Constants } from "@shared/constants";

const Login = () => {
	const navigation = useNavigate();
	const { setToken } = useAuthStore();
	const login = useUserControllerLoginUser();
	const initialValues = {
		email: "",
		password: "",
	};

	const schema = yup.object().shape({
		email: yup.string().email().required("Email is required"),
		password: yup.string().min(7, "Password is atleast 7 chars").required("Password is required"),
	});

	const handleSubmit = async (values: typeof initialValues) => {
		const a = await login.mutateAsync({
			data: {
				email: values.email,
				password: values.password,
			},
		});
		setToken(a.authToken);
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
								Welcome Back!
							</Typography>
							<Typography
								color="text.secondary"
								sx={{ mb: 2, textAlign: "center" }}
								variant="caption"
								fontWeight="400"
							>
								Please login to continue with growinvoice &nbsp;
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
											<Field name="email" component={TextFormField} label="Email" required={true} />
											<Field
												name="password"
												type={"password"}
												component={TextFormField}
												label="Password"
												required={true}
											/>
											<Box
												sx={{
													display: "flex",
													justifyContent: "flex-end",
													marginBottom: 1,
												}}
											>
												<ForgotPassword />
											</Box>
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
													Login
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
														navigation("/register");
													}}
												>
													Register
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

export default Login;
