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
import Loader from "@shared/components/Loader";
import { useQueryClient } from "@tanstack/react-query";

const MyProfile = () => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
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
		name: yup.string().required("Name is required"),
		email: yup.string().required("Email is required").email("Email is invalid"),
		phone: yup.number().required("Phone Number is required"),
		currency_id: yup.string().required("Select Currency is required"),
		old_password: yup.string().min(7, "Password is at least 7 characters"),
		password: yup.string().min(7, "Password is at least 7 characters"),
	});

	const id = user?.company?.[0]?.user_id ?? "";
	const handleSubmit = async (
		values: typeof initialValues,
		actions: FormikHelpers<typeof initialValues>,
	) => {
		await userUpdate.mutateAsync({
			id: id,
			data: values,
		});
		queryClient?.refetchQueries({
			queryKey: getCurrencyControllerFindAllQueryKey(),
		});
		actions.resetForm();
	};

	if (!user) {
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
									label="Full Name"
									component={TextFormField}
									placeholder={"Enter Full name"}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="email"
									label="Email"
									component={TextFormField}
									placeholder={"Enter email ID"}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="phone"
									label="Phone"
									component={PhoneInputFormField}
									required={true}
									placeholder={"Enter mobile nuber"}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="currency_id"
									label="Currency"
									loading={currencyList.isLoading || currencyList.isFetching}
									component={AutocompleteField}
									options={currencyList?.data?.map((currency) => ({
										value: currency.id,
										label: `${currency.short_code} - ${currency.name}`,
									}))}
								/>
							</Grid>
							<Grid item xs={12} sm={12}>
								<Divider />
							</Grid>

							<SettingFormHeading
								heading="Update Password"
								icon={Constants.customImages.UpdatePassWordIcon}
								text="If you want to update your password please fill the information below."
							/>
							<Grid item xs={12} sm={6}>
								<Field
									name="old_password"
									label="Old Password"
									component={TextFormField}
									placeholder={"Enter old password"}
									type="password"
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Field
									name="password"
									label="New Passwod"
									component={TextFormField}
									placeholder={"Enter new password"}
									type="password"
								/>
							</Grid>

							<Grid item xs={12} textAlign={"center"} my={2}>
								<Button variant="contained" type="submit">
									Update
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
