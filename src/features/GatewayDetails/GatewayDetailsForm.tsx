import { Box, DialogContent } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import AppDialogHeader from "@shared/components/Dialog/AppDialogHeader";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import AppDialogFooter from "@shared/components/Dialog/AppDialogFooter";
import * as yup from "yup";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { useAuthStore } from "@store/auth";
import { CreateGateWayDetailsDto, CreateGateWayDetailsDtoType } from "@api/services/models";
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

const GatewayDetailsForm = ({
	gatewayId,
	handleClose,
}: {
	gatewayId?: string;
	handleClose: () => void;
}) => {
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
			.required("Type is required")
			.oneOf(Object.values(CreateGateWayDetailsDtoType), "Invalid Type"),
		key: yup
			.string()
			.test("key", "key should be valid", (value) => {
				if (!value?.includes("*")) {
					return true;
				}
				return false;
			})
			.required("key is required"),
		secret: yup.string().test("secret", "secret should be valid", (value) => {
			if (!value?.includes("*")) {
				return true;
			}
			return false;
		}),
		user_id: yup.string().required("user id is required"),
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
								title="Add Gateway Details"
								handleClose={() => {
									handleClose();
								}}
							/>
							<DialogContent>
								<Field
									name="type"
									label="Type"
									component={AutocompleteField}
									options={filterTypeOptions()}
									isRequired={true}
									disabled={!!gatewayId}
								/>
								<Field
									name="key"
									label="Key"
									component={TextFormField}
									placeholder="Enter Key"
									isRequired
								/>
								<Field
									name="secret"
									label="Secret Id"
									component={TextFormField}
									placeholder="Enter Secret Id"
								/>
								<Field name="enabled" label="Enabled" component={CheckBoxFormField} />
							</DialogContent>
							<AppDialogFooter
								onClickCancel={() => {
									handleClose();
								}}
								saveButtonText="Submit"
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
