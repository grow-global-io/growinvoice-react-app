import { Box, Button, Grid } from "@mui/material";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as yup from "yup";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { PhoneInputFormField } from "@shared/components/FormFields/PhoneInputFormField";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useAuthStore } from "@store/auth";
import { useCurrencyControllerFindCountries } from "@api/services/currency";
import StateFormField from "@shared/components/FormFields/StateFormField";
import {
	getCompanyControllerFindOneQueryKey,
	useCompanyControllerFindOne,
	useCompanyControllerUpdate,
} from "@api/services/company";
import AvatarFormField from "@shared/components/FormFields/AvatarFormField";
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";

const Company = () => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const countryFindAll = useCurrencyControllerFindCountries();
	const companyUpdate = useCompanyControllerUpdate();
	const companyFindOne = useCompanyControllerFindOne(user?.company?.[0]?.id ?? "");

	const initialValues = {
		name: companyFindOne?.data?.name ?? "",
		phone: companyFindOne?.data?.phone ?? "",
		vat: companyFindOne?.data?.vat ?? "",
		country_id: companyFindOne?.data?.country_id ?? "",
		state_id: companyFindOne?.data?.state_id ?? "",
		city: companyFindOne?.data?.city ?? "",
		zip: companyFindOne?.data?.zip ?? "",
		address: companyFindOne?.data?.address ?? "",
		logo: companyFindOne?.data?.logo ?? "",
		user_id: user?.id ?? "",
	};
	const schema = yup.object().shape({
		name: yup.string().required("Company name is required"),
		phone: yup.number().required("Phone Number is required"),
		vat: yup.string(),
		country_id: yup.string().required("Select Country"),
		state_id: yup.string().required("Select state"),
		city: yup.string().required("Select city"),
		zip: yup.string().required("Postal Code is required"),
		address: yup.string().required("Address is required"),
		logo: yup.string(),
		user_id: yup.string().required("user Id is required"),
	});
	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		await companyUpdate.mutateAsync({
			id: user?.company?.[0]?.id ?? "",
			data: values,
		});
		queryClient?.refetchQueries({
			queryKey: getCompanyControllerFindOneQueryKey(user?.company?.[0]?.id ?? ""),
		});
		actions.resetForm();
	};

	if (companyFindOne.isLoading || companyFindOne?.isRefetching || companyFindOne?.isFetching)
		return <Loader />;

	return (
		<>
			<Box>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{() => {
						return (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Field name="logo" label="Logo" component={AvatarFormField} isRequired={true} />
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="name"
											label="Company Name"
											component={TextFormField}
											isRequired={true}
											placeholder={"Enter company name"}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="phone"
											label="Phone"
											component={PhoneInputFormField}
											isRequired={true}
											placeholder={"Enter mobile nuber"}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="vat"
											label="Vat Number"
											component={TextFormField}
											placeholder={"Vat Number"}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="country_id"
											label="Country"
											component={AutocompleteField}
											options={countryFindAll?.data?.map((item) => ({
												label: item.name,
												value: item.id,
											}))}
											loading={countryFindAll.isLoading}
											placeholder={"Select"}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<StateFormField
											countryFieldName="country_id"
											stateFieldName="state_id"
											stateLabel="State"
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="city"
											label="City"
											component={TextFormField}
											isRequired={true}
											placeholder={"Select"}
										/>
									</Grid>

									<Grid item xs={12} sm={6}>
										<Field
											name="zip"
											label="Postal Code"
											component={TextFormField}
											isRequired={true}
											placeholder={"Enter postal code"}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="address"
											label="Address"
											component={TextFormField}
											isRequired={true}
											placeholder={"Add address"}
											multiline
											rows={5}
										/>
									</Grid>

									<Grid item xs={12} textAlign={"center"} my={2}>
										<Button variant="contained" type="submit">
											Update
										</Button>
									</Grid>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</Box>
		</>
	);
};

export default Company;
