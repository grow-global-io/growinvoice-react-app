import { Box, DialogContent } from "@mui/material";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import * as yup from "yup";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { useAuthStore } from "@store/auth";
import { type CreateGateWayDetailsDto, CreateGateWayDetailsDtoType } from "@api/services/models";
import {
	getGatewaydetailsControllerFindAllQueryKey,
	getGatewaydetailsControllerFindOneQueryKey,
	useGatewaydetailsControllerCreate,
	useGatewaydetailsControllerFindOne,
	useGatewaydetailsControllerUpdate,
	useGatewaydetailsControllerFindAll,
} from "@api/services/gatewaydetails";
import { stringToListDto } from "@shared/models/ListDto";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@shared/components/Loader";
import { useTranslation } from "react-i18next";

const GatewayDetailsForm = ({
	gatewayId,
	handleClose,
}: {
	gatewayId?: string;
	handleClose: () => void;
}) => {
	const { t, i18n } = useTranslation();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const gateWayList = useGatewaydetailsControllerFindAll();
	const filterTypeOptions = () => {
		if (gatewayId) {
			return Object.values(CreateGateWayDetailsDtoType).map(stringToListDto);
		}
		const typesInList = gateWayList.data?.map((item) => item.type) || [];
		return Object.values(CreateGateWayDetailsDtoType)
			.filter((type) => !typesInList.includes(type))
			.map(stringToListDto);
	};
	const { data: editValues, isLoading } = useGatewaydetailsControllerFindOne(gatewayId ?? "", {
		query: {
			enabled: !!gatewayId,
		},
	});

	const initialValues: CreateGateWayDetailsDto = {
		type: editValues?.type ?? "Stripe",
		key: editValues?.key ?? "",
		secret: editValues?.secret ?? "",
		user_id: user?.id ?? "",
		enabled: editValues?.enabled ?? false,
	};

	const schema: yup.Schema<CreateGateWayDetailsDto> = yup.object({
		type: yup
			.string()
			.required(() =>
				i18n.t("gatewayDetails.validation.typeRequired", { defaultValue: "Type is required" }),
			)
			.oneOf(Object.values(CreateGateWayDetailsDtoType), "Invalid Type"),
		key: yup
			.string()
			.test(
				"key",
				() =>
					i18n.t("gatewayDetails.validation.keyInvalid", { defaultValue: "key should be valid" }),
				(value) => {
					if (!value?.includes("*")) {
						return true;
					}
					return false;
				},
			)
			.required(() =>
				i18n.t("gatewayDetails.validation.keyRequired", { defaultValue: "key is required" }),
			),
		secret: yup.string().test(
			"secret",
			() =>
				i18n.t("gatewayDetails.validation.secretInvalid", {
					defaultValue: "secret should be valid",
				}),
			(value) => {
				if (!value?.includes("*")) {
					return true;
				}
				return false;
			},
		),
		user_id: yup
			.string()
			.required(() =>
				i18n.t("gatewayDetails.validation.userIdRequired", { defaultValue: "user id is required" }),
			),
		enabled: yup.boolean(),
	});

	const createGatwayDetail = useGatewaydetailsControllerCreate();
	const updateGatwayDetail = useGatewaydetailsControllerUpdate();
	const handleSubmit = async (
		values: CreateGateWayDetailsDto,
		action: FormikHelpers<CreateGateWayDetailsDto>,
	) => {
		if (editValues) {
			await updateGatwayDetail.mutateAsync({
				id: editValues.id,
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getGatewaydetailsControllerFindOneQueryKey(editValues.id ?? ""),
			});
		} else {
			await createGatwayDetail.mutateAsync({
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

	return (
		<Box>
			<Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={schema}>
				{(formik) => {
					return (
						<Form>
							<AppDialogHeader
								title={t("gatewayDetails.form.title", { defaultValue: "Add Gateway Details" })}
								handleClose={() => {
									handleClose();
								}}
							/>
							<DialogContent>
								<Field
									name="type"
									label={t("gatewayDetails.form.type", { defaultValue: "Type" })}
									component={AutocompleteField}
									options={filterTypeOptions()}
									isRequired={true}
									disabled={!!gatewayId}
								/>
								<Field
									name="key"
									label={t("gatewayDetails.form.key", { defaultValue: "Key" })}
									component={TextFormField}
									placeholder={t("gatewayDetails.form.keyPlaceholder", {
										defaultValue: "Enter Key",
									})}
									isRequired
								/>
								<Field
									name="secret"
									label={t("gatewayDetails.form.secret", { defaultValue: "Secret Id" })}
									component={TextFormField}
									placeholder={t("gatewayDetails.form.secretPlaceholder", {
										defaultValue: "Enter Secret Id",
									})}
								/>
								<Field
									name="enabled"
									label={t("gatewayDetails.enabled", { defaultValue: "Enabled" })}
									component={CheckBoxFormField}
								/>
							</DialogContent>
							<AppDialogFooter
								onClickCancel={() => {
									handleClose();
								}}
								saveButtonText={t("gatewayDetails.form.submit", { defaultValue: "Submit" })}
								saveButtonDisabled={!formik.isValid || formik.isSubmitting}
							/>
						</Form>
					);
				}}
			</Formik>
		</Box>
	);
};

export default GatewayDetailsForm;
