import { useCompanyControllerFindOne, useCompanyControllerUpdate } from "@api/services/company";
import { Box, Button, Grid, Typography } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import Loader from "@shared/components/Loader";
import { useDialog } from "@shared/hooks/useDialog";
import { useAuthStore } from "@store/auth";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import AiRollDialog from "./AIRollDialog";
import { useTranslation } from "react-i18next";
import i18n from "../../i18s";

const RollUpForm = () => {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const companyFindOne = useCompanyControllerFindOne(user?.company?.[0]?.id ?? "");
	const companyUpdate = useCompanyControllerUpdate();
	const initialValues = {
		companyName: companyFindOne?.data?.name ?? "",
		lineOfBusiness: companyFindOne?.data?.lineOfBusiness ?? "",
		shortDescription: companyFindOne?.data?.short_description ?? "",
	};

	const validationSchema = Yup.object().shape({
		companyName: Yup.string().required(() => i18n.t("aiStore.validation.companyNameRequired")),
		lineOfBusiness: Yup.string().required(() =>
			i18n.t("aiStore.validation.lineOfBusinessRequired"),
		),
		shortDescription: Yup.string().required(() =>
			i18n.t("aiStore.validation.shortDescriptionRequired"),
		),
	});

	const { handleClickOpen, handleClose, open } = useDialog();

	const handleSubmit = async (values: typeof initialValues) => {
		await companyUpdate.mutateAsync({
			id: user?.company?.[0]?.id ?? "",
			data: {
				name: values.companyName,
				lineOfBusiness: values.lineOfBusiness,
				short_description: values.shortDescription,
			},
		});
		handleClickOpen();
	};

	if (companyFindOne.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h5">
						{t("aiStore.title", { defaultValue: "ROLL UP AI STORE" })}
					</Typography>
					<Typography variant="body1">
						{t("aiStore.subtitle", { defaultValue: "Create and manage your AI store with ease." })}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{() => (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6}>
										<Field
											name="companyName"
											label={t("aiStore.companyName", { defaultValue: "Company Name" })}
											component={TextFormField}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="lineOfBusiness"
											label={t("aiStore.lineOfBusiness", { defaultValue: "Line of Business" })}
											component={TextFormField}
											placeholder={t("aiStore.lineOfBusinessPlaceholder", {
												defaultValue: "Enter line of business",
											})}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="shortDescription"
											label={t("aiStore.shortDescription", { defaultValue: "Short Description" })}
											component={TextFormField}
											multiline
											rows={4}
											placeholder={t("aiStore.shortDescriptionPlaceholder", {
												defaultValue: "Enter short description",
											})}
										/>
									</Grid>
									<Grid item xs={12} textAlign="center">
										<Button type="submit" variant="contained" color="primary">
											{t("aiStore.submitButton", { defaultValue: "Let's Roll Up AI Store" })}
										</Button>
									</Grid>
								</Grid>
							</Form>
						)}
					</Formik>
				</Grid>
			</Grid>
			<AiRollDialog open={open} handleClose={handleClose} />
		</Box>
	);
};

export default RollUpForm;
