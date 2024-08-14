import {
	getHsncodeControllerFindAllQueryKey,
	getHsncodeControllerFindOneQueryKey,
	useHsncodeControllerCreate,
	useHsncodeControllerFindOne,
	useHsncodeControllerUpdate,
} from "@api/services/hsncode";
import { CreateHSNCodeTaxDto } from "@api/services/models";
import { Box, Button } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";
import { Formik, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { RegexExp } from "@shared/regex";
import { getTaxcodeControllerFindAllQueryKey } from "@api/services/tax-code";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";
import Loader from "@shared/components/Loader";

const style = {
	bgcolor: "custom.lightBlue",
	padding: 2,
	borderRadius: 1,
	mb: 1,
};

const CreateHSNCode = ({ handleClose }: { handleClose?: () => void }) => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createHSNCode = useHsncodeControllerCreate();
	const updateHSNCode = useHsncodeControllerUpdate();
	const { editHsnCodeId } = useCreateHsnCodeStore.getState();
	const editValues = useHsncodeControllerFindOne(editHsnCodeId ?? "", {
		query: {
			enabled: editHsnCodeId !== null,
		},
	});
	const validationSchema: Yup.Schema<CreateHSNCodeTaxDto> = Yup.object().shape({
		hsn_code: Yup.string()
			.required("HSN Code is required")
			.matches(RegexExp?.numberRegex, "Invalid HSN Code"),
		tax: Yup.number()
			.required("Tax is required")
			.min(0, "Tax should be greater than 0")
			.max(100, "Tax should be less than 100"),
		user_id: Yup.string().required("User id is required"),
	});

	const initialValues: CreateHSNCodeTaxDto = {
		hsn_code: editValues?.data?.code ?? "",
		tax: 0,
		user_id: user?.id ?? "",
	};

	const handleSubmit = async (
		values: CreateHSNCodeTaxDto,
		action: FormikHelpers<CreateHSNCodeTaxDto>,
	) => {
		action.setSubmitting(true);
		if (editHsnCodeId) {
			await updateHSNCode.mutateAsync({
				id: editHsnCodeId ?? "",
				data: {
					code: values?.hsn_code?.toString() ?? "",
					tax_id: editValues?.data?.tax_id ?? "",
					user_id: values?.user_id,
				},
			});
			queryClient.invalidateQueries({
				queryKey: getHsncodeControllerFindOneQueryKey(editHsnCodeId ?? ""),
			});
		} else {
			await createHSNCode.mutateAsync({
				data: {
					...values,
					hsn_code: values.hsn_code.toString(),
				},
			});
		}
		action.resetForm();
		if (handleClose) handleClose();
		queryClient.refetchQueries({
			queryKey: getHsncodeControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getTaxcodeControllerFindAllQueryKey(),
		});
		action.setSubmitting(false);
	};
	if (editValues?.isLoading || editValues?.isFetching) {
		return <Loader />;
	}
	return (
		<Box sx={style}>
			<Formik
				initialValues={initialValues}
				onSubmit={handleSubmit}
				validationSchema={validationSchema}
			>
				{({ handleSubmit }) => {
					return (
						<>
							<Field component={TextFormField} name="hsn_code" label="HSN Code" type="number" />
							{!editHsnCodeId && (
								<Field
									component={TextFormField}
									type="number"
									name="tax"
									label="Tax (in percentage)"
								/>
							)}
							<Box textAlign={"center"}>
								<Button
									variant="contained"
									onClick={() => {
										handleSubmit();
									}}
								>
									{editHsnCodeId ? "Update" : "Create"} HSN Code
								</Button>
								{handleClose && (
									<Button variant="outlined" onClick={handleClose}>
										Close
									</Button>
								)}
							</Box>
						</>
					);
				}}
			</Formik>
		</Box>
	);
};

export default CreateHSNCode;
