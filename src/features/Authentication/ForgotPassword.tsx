import { Dialog, DialogContent, Button, Typography } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useDialog } from "@shared/hooks/useDialog";
import { useUserControllerForgotPassword } from "@api/services/users";

export default function ForgotPassword() {
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
				Forgot Password?
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<Formik initialValues={initialValues} onSubmit={handleSubmit}>
					{(formik) => {
						return (
							<Form>
								<AppDialogHeader title="Forgot Password" handleClose={handleClose} />
								<DialogContent>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontStyle: "italic", fontSize: 12 }}
									>
										Enter your email address below and we will send you a link to reset your
										password.
									</Typography>
									<Field
										name="email"
										type="email"
										component={TextFormField}
										required={true}
										placeholder="Enter email"
									/>
								</DialogContent>
								<AppDialogFooter
									onClickCancel={handleClose}
									saveButtonText="Submit"
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
