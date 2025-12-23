import { Box, DialogContent } from "@mui/material";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import * as yup from "yup";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { useAuthStore } from "@store/auth";
import { type CreateGateWayDetailsDto } from "@api/services/models";
import {
	getGatewaydetailsControllerFindAllQueryKey,
	getGatewaydetailsControllerFindOneQueryKey,
	useGatewaydetailsControllerCreate,
	useGatewaydetailsControllerFindOne,
	useGatewaydetailsControllerUpdate,
	useGatewaydetailsControllerFindAll,
} from "@api/services/gatewaydetails";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";
import { useTranslation } from "react-i18next";

const ShippingServiceForm = ({
	serviceId,
	handleClose,
}: {
	serviceId?: string;
	handleClose: () => void;
}) => {
	const { t, i18n } = useTranslation();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const gateWayList = useGatewaydetailsControllerFindAll();

	// For now, only Shiprocket is available as a shipping service
	const shippingServiceTypes = [{ label: "Shiprocket", value: "Shiprocket" }];

	const filterTypeOptions = () => {
		if (serviceId) {
			return shippingServiceTypes.map((item) => ({ label: item.label, value: item.value }));
		}
		// Filter out types that are already added
		const typesInList = gateWayList.data?.map((item) => String(item.type)) || [];
		return shippingServiceTypes
			.filter((type) => !typesInList.includes(type.value))
			.map((item) => ({ label: item.label, value: item.value }));
	};

	const { data: editValues, isLoading } = useGatewaydetailsControllerFindOne(serviceId ?? "", {
		query: {
			enabled: !!serviceId,
		},
	});

	const initialValues: CreateGateWayDetailsDto = {
		type: (editValues?.type ?? "Shiprocket") as any,
		key: editValues?.key ?? "",
		secret: editValues?.secret ?? "",
		user_id: user?.id ?? "",
		enabled: editValues?.enabled ?? false,
	};

	const schema: yup.Schema<any> = yup.object({
		type: yup.string().required(() =>
			i18n.t("shippingServices.validation.typeRequired", {
				defaultValue: "Service type is required",
			}),
		),
		key: yup
			.string()
			.test(
				"key",
				() =>
					i18n.t("shippingServices.validation.emailInvalid", {
						defaultValue: "Email should be valid",
					}),
				(value) => {
					if (!value?.includes("*")) {
						return true;
					}
					return false;
				},
			)
			.required(() =>
				i18n.t("shippingServices.validation.emailRequired", { defaultValue: "Email is required" }),
			),
		secret: yup
			.string()
			.test(
				"secret",
				() =>
					i18n.t("shippingServices.validation.passwordInvalid", {
						defaultValue: "API Password should be valid",
					}),
				(value) => {
					if (!value?.includes("*")) {
						return true;
					}
					return false;
				},
			)
			.required(() =>
				i18n.t("shippingServices.validation.passwordRequired", {
					defaultValue: "API Password is required",
				}),
			),
		user_id: yup.string().required(() =>
			i18n.t("shippingServices.validation.userIdRequired", {
				defaultValue: "user id is required",
			}),
		),
		enabled: yup.boolean(),
	});

	const createService = useGatewaydetailsControllerCreate();
	const updateService = useGatewaydetailsControllerUpdate();

	const handleSubmit = async (
		values: CreateGateWayDetailsDto,
		action: FormikHelpers<CreateGateWayDetailsDto>,
	) => {
		if (editValues) {
			await updateService.mutateAsync({
				id: editValues.id,
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getGatewaydetailsControllerFindOneQueryKey(editValues.id ?? ""),
			});
		} else {
			await createService.mutateAsync({
				data: values,
			});
		}
		action.resetForm();
		queryClient.invalidateQueries({
			queryKey: getGatewaydetailsControllerFindAllQueryKey(),
		});
		handleClose();
	};

	if (isLoading) {
		return <Loader />;
	}

	const isShiprocket =
		String(initialValues.type).toLowerCase().includes("shiprocket") ||
		(editValues?.type && String(editValues.type).toLowerCase().includes("shiprocket"));

	return (
		<Box>
			<Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={schema}>
				{(formik) => {
					const currentType = String(formik.values.type);
					const showShiprocketFields =
						currentType.toLowerCase().includes("shiprocket") || isShiprocket;

					return (
						<Form>
							<AppDialogHeader
								title={t("shippingServices.form.title", { defaultValue: "Add Shipping Service" })}
								handleClose={() => {
									handleClose();
								}}
							/>
							<DialogContent>
								<Field
									name="type"
									label={t("shippingServices.form.serviceType", { defaultValue: "Service Type" })}
									component={AutocompleteField}
									options={filterTypeOptions()}
									isRequired={true}
									disabled={!!serviceId}
								/>
								<Field
									name="key"
									label={
										showShiprocketFields
											? t("shippingServices.form.email", { defaultValue: "Email" })
											: t("shippingServices.form.key", { defaultValue: "Key" })
									}
									component={TextFormField}
									placeholder={
										showShiprocketFields
											? t("shippingServices.form.emailPlaceholder", {
													defaultValue: "Enter Email",
												})
											: t("shippingServices.form.keyPlaceholder", {
													defaultValue: "Enter Key",
												})
									}
									isRequired
								/>
								<Field
									name="secret"
									label={
										showShiprocketFields
											? t("shippingServices.form.apiPassword", { defaultValue: "API Password" })
											: t("shippingServices.form.secret", { defaultValue: "Secret" })
									}
									component={TextFormField}
									placeholder={
										showShiprocketFields
											? t("shippingServices.form.apiPasswordPlaceholder", {
													defaultValue: "Enter API Password",
												})
											: t("shippingServices.form.secretPlaceholder", {
													defaultValue: "Enter Secret",
												})
									}
									isRequired
								/>
								<Field
									name="enabled"
									label={t("shippingServices.enabled", { defaultValue: "Enabled" })}
									component={CheckBoxFormField}
								/>
							</DialogContent>
							<AppDialogFooter
								onClickCancel={() => {
									handleClose();
								}}
								saveButtonText={t("shippingServices.form.submit", { defaultValue: "Submit" })}
								saveButtonDisabled={!formik.isValid || formik.isSubmitting}
							/>
						</Form>
					);
				}}
			</Formik>
		</Box>
	);
};

export default ShippingServiceForm;
