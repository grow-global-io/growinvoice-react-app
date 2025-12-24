import { Box, DialogContent, DialogTitle, Grid } from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Field } from "formik";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import {
	useCurrencyControllerFindCountries,
	useCurrencyControllerFindStatesByCountry,
} from "@api/services/currency";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import { AlertService } from "@shared/services/AlertService";

// TODO: Replace with actual API hooks when backend is ready
interface PickupAddressFormProps {
	handleClose: () => void;
	addressId?: string;
}

const PickupAddressForm = ({ handleClose, addressId }: PickupAddressFormProps) => {
	const { t } = useTranslation();
	const countryFindAll = useCurrencyControllerFindCountries();
	const isEditMode = !!addressId;

	// TODO: Replace with actual API call to fetch address data
	// const { data: addressData } = usePickupAddressControllerFindOne({ id: addressId });

	const validationSchema = yup.object({
		address: yup
			.string()
			.required(
				t("pickupAddress.validation.addressRequired", { defaultValue: "Address is required" }),
			),
		city: yup
			.string()
			.required(t("pickupAddress.validation.cityRequired", { defaultValue: "City is required" })),
		state: yup
			.string()
			.required(t("pickupAddress.validation.stateRequired", { defaultValue: "State is required" })),
		country: yup
			.string()
			.required(
				t("pickupAddress.validation.countryRequired", { defaultValue: "Country is required" }),
			),
		zipCode: yup
			.string()
			.required(
				t("pickupAddress.validation.zipCodeRequired", { defaultValue: "Zip Code is required" }),
			),
	});

	const initialValues = {
		address: "",
		city: "",
		state: "",
		country: "",
		zipCode: "",
	};

	const handleSubmit = async (values: typeof initialValues) => {
		try {
			// TODO: Replace with actual API call
			if (isEditMode) {
				// await updatePickupAddress.mutateAsync({ id: addressId, ...values });
				console.log("Update pickup address:", values);
			} else {
				// await createPickupAddress.mutateAsync(values);
				console.log("Create pickup address:", values);
			}
			AlertService.instance.successMessage(
				t("pickupAddress.success.saved", { defaultValue: "Pickup address saved successfully" }),
			);
			handleClose();
		} catch (error) {
			AlertService.instance.errorMessage(
				t("pickupAddress.error.saveFailed", { defaultValue: "Failed to save pickup address" }),
			);
		}
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			onSubmit={handleSubmit}
			enableReinitialize
		>
			{({ values, isSubmitting }) => {
				const statesFindAllByCountry = useCurrencyControllerFindStatesByCountry({
					countryId: values.country || "",
				});

				return (
					<Form>
						<DialogTitle>
							{t("pickupAddress.form.title", {
								defaultValue: isEditMode ? "Edit Pickup Address" : "Add Pickup Address",
							})}
						</DialogTitle>
						<DialogContent>
							<Box sx={{ mt: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Field
											name="address"
											label={t("pickupAddress.form.address", { defaultValue: "Address" })}
											component={TextFormField}
											multiline
											rows={3}
											isRequired
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="city"
											label={t("pickupAddress.form.city", { defaultValue: "City" })}
											component={TextFormField}
											isRequired
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="zipCode"
											label={t("pickupAddress.form.zipCode", { defaultValue: "Zip Code" })}
											component={TextFormField}
											isRequired
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="country"
											label={t("pickupAddress.form.country", { defaultValue: "Country" })}
											component={AutocompleteField}
											options={countryFindAll?.data?.map((item) => ({
												label: item.name,
												value: item.id,
											}))}
											loading={countryFindAll.isLoading}
											isRequired
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="state"
											label={t("pickupAddress.form.state", { defaultValue: "State" })}
											component={AutocompleteField}
											options={statesFindAllByCountry?.data?.map((item) => ({
												label: item.name,
												value: item.id,
											}))}
											loading={statesFindAllByCountry.isLoading}
											isRequired
										/>
									</Grid>
								</Grid>
							</Box>
						</DialogContent>
						<AppDialogFooter
							onClickCancel={handleClose}
							saveButtonText={t("pickupAddress.form.submit", { defaultValue: "Save" })}
							saveButtonDisabled={isSubmitting}
						/>
					</Form>
				);
			}}
		</Formik>
	);
};

export default PickupAddressForm;
