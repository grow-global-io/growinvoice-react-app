import { Dialog, DialogContent, Button, Typography } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useDialog } from "@shared/hooks/useDialog";
import { useUserControllerForgotPassword } from "@api/services/users";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
	const { t } = useTranslation();
	const { open, handleClickOpen, handleClose } = useDialog();
	const forgotPassword = useUserControllerForgotPassword();

	const initialValues = {
		email: "",
	};

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		try {
			actions.setSubmitting(true);
			await forgotPassword.mutateAsync({
				data: values,
			});
			actions.setSubmitting(false);
			actions.resetForm();
			handleClose();
		} catch (error) {
			actions.setSubmitting(false);
			console.log(error);
		}
	};

	return (
		<>
			<Button
				variant="text"
				sx={{
					fontWeight: 600,
					textTransform: "none",
				}}
				onClick={handleClickOpen}
			>
				{t("auth.forgotPassword")}
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<Formik initialValues={initialValues} onSubmit={handleSubmit}>
					{(formik) => {
						return (
							<Form>
								<AppDialogHeader
									title={t("auth.forgotPasswordTitle", { defaultValue: "Forgot Password" })}
									handleClose={handleClose}
								/>
								<DialogContent>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontStyle: "italic", fontSize: 12 }}
									>
										{t("auth.forgotPasswordHelp", {
											defaultValue:
												"Enter your email address below and we will send you a link to reset your password.",
										})}
									</Typography>
									<Field
										name="email"
										type="email"
										component={TextFormField}
										required={true}
										placeholder={t("auth.email", { defaultValue: "Email" })}
									/>
								</DialogContent>
								<AppDialogFooter
									onClickCancel={handleClose}
									cancelButtonText={t("app.cancel", { defaultValue: "Cancel" })}
									saveButtonText={t("app.confirm", { defaultValue: "Confirm" })}
									saveButtonDisabled={!formik.isValid || formik.isSubmitting}
								/>
							</Form>
						);
					}}
				</Formik>
			</Dialog>
		</>
	);
}
