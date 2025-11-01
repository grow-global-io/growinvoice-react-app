import { Box, Button, Divider, Grid } from "@mui/material";
import { Formik, Field, Form, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { Constants } from "@shared/constants";
import SettingFormHeading from "./SettingFormHeading";
import { useAuthStore } from "@store/auth";
import {
	getCurrencyControllerFindAllQueryKey,
	useCurrencyControllerFindAll,
} from "@api/services/currency";
import { useUserControllerUpdateUser } from "@api/services/users";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDialogStore } from "@store/confirmDialog";

const MyProfile = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const { user, refecthUser, isRefecthing } = useAuthStore();
	const currencyList = useCurrencyControllerFindAll();
	const userUpdate = useUserControllerUpdateUser();
	const initialValues = {
		name: user?.name ?? "",
		email: user?.email ?? "",
		phone: user?.phone,
		currency_id: user?.currency_id ?? "",
		old_password: "",
		password: "",
	};
	const formikRef = useRef<FormikProps<typeof initialValues>>(null);
	const schema = yup.object().shape({
		name: yup.string().required(() => t("settings.myProfile.validation.nameRequired")),
		email: yup
			.string()
			.required(() => t("settings.myProfile.validation.emailRequired"))
			.email(() => t("settings.myProfile.validation.emailInvalid")),
		phone: yup.number().required(() => t("settings.myProfile.validation.phoneRequired")),
		currency_id: yup.string().required(() => t("settings.myProfile.validation.currencyRequired")),
		old_password: yup.string().min(7, () => t("settings.myProfile.validation.passwordMin")),
		password: yup.string().min(7, () => t("settings.myProfile.validation.passwordMin")),
	});

	const id = user?.company?.[0]?.user_id ?? "";

	const dataSave = async (values: typeof initialValues) => {
		await userUpdate.mutateAsync({
			id: id,
			data: values,
		});
		queryClient?.refetchQueries({
			queryKey: getCurrencyControllerFindAllQueryKey(),
		});
		refecthUser();
	};

	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		if (values.email !== user?.email) {
			handleOpen({
				title: t("settings.myProfile.confirmEmailChangeTitle"),
				message: t("settings.myProfile.confirmEmailChangeMessage"),
				onConfirm: async () => {
					await dataSave(values);
					actions.resetForm();
				},
				onCancel: () => {
					cleanUp();
				},
				confirmButtonText: t("common.yes"),
			});
		} else {
			await dataSave(values);
			actions.resetForm();
		}
	};

	if (!user || isRefecthing) {
		return <Loader />;
	}

	return (
		<Box>
			<Formik
				initialValues={initialValues}
				validationSchema={schema}
				onSubmit={handleSubmit}
				innerRef={formikRef}
			>
				{() => (
					<Form>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Field
									name="name"
									label={t("settings.myProfile.fullName")}
									component={TextFormField}
									placeholder={t("settings.myProfile.fullNamePlaceholder")}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="email"
									label={t("settings.myProfile.email")}
									component={TextFormField}
									placeholder={t("settings.myProfile.emailPlaceholder")}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="phone"
									label={t("settings.myProfile.phone")}
									component={PhoneInputFormField}
									required={true}
									placeholder={t("settings.myProfile.phonePlaceholder")}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="currency_id"
									label={t("settings.myProfile.currency")}
									loading={currencyList.isLoading || currencyList.isFetching}
									component={AutocompleteField}
									options={currencyList?.data
										?.filter(
											(currency) => currency.short_code === "EUR" || currency.short_code === "INR",
										)
										?.map((currency) => ({
											value: currency.id,
											label: `${currency.short_code} - ${currency.name}`,
										}))}
								/>
							</Grid>
							<Grid item xs={12} sm={12}>
								<Divider />
							</Grid>

							<SettingFormHeading
								heading={t("settings.myProfile.updatePassword")}
								icon={Constants.customImages.UpdatePassWordIcon}
								text={t("settings.myProfile.updatePasswordInfo")}
							/>
							<Grid item xs={12} sm={6}>
								<Field
									name="old_password"
									label={t("settings.myProfile.oldPassword")}
									component={TextFormField}
									placeholder={t("settings.myProfile.oldPasswordPlaceholder")}
									type="password"
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="password"
									label={t("settings.myProfile.newPassword")}
									component={TextFormField}
									placeholder={t("settings.myProfile.newPasswordPlaceholder")}
									type="password"
								/>
							</Grid>

							<Grid item xs={12} textAlign={"center"} my={2}>
								<Button variant="contained" type="submit">
									{t("common.update")}
								</Button>
							</Grid>
						</Grid>
					</Form>
				)}
			</Formik>
		</Box>
	);
};

export default MyProfile;
