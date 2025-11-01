import {
	getHsncodeControllerFindAllQueryKey,
	getHsncodeControllerFindOneQueryKey,
	useHsncodeControllerCreate,
	useHsncodeControllerFindOne,
	useHsncodeControllerUpdate,
} from "@api/services/hsncode";
import { type CreateHSNCodeTaxDto } from "@api/services/models";
import { Box, Button } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";
import { Formik, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { RegexExp } from "@shared/regex";
import { getTaxcodeControllerFindAllQueryKey } from "@api/services/tax-code";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";
import Loader from "@shared/components/Loader";
import { useTranslation } from "react-i18next";

const style = {
	bgcolor: "custom.lightBlue",
	padding: 2,
	borderRadius: 1,
	mb: 1,
};

const CreateHSNCode = ({ handleClose }: { handleClose?: () => void }) => {
	const { t, i18n } = useTranslation();
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
			.required(() =>
				i18n.t("hsn.validation.codeRequired", { defaultValue: "HSN Code is required" }),
			)
			.matches(
				RegexExp?.numberRegex,
				i18n.t("hsn.validation.codeInvalid", { defaultValue: "Invalid HSN Code" }),
			),
		tax: Yup.number()
			.required(() => i18n.t("hsn.validation.taxRequired", { defaultValue: "Tax is required" }))
			.min(0, i18n.t("hsn.validation.taxMin", { defaultValue: "Tax should be greater than 0" }))
			.max(100, i18n.t("hsn.validation.taxMax", { defaultValue: "Tax should be less than 100" })),
		user_id: Yup.string().required(() =>
			i18n.t("hsn.validation.userRequired", { defaultValue: "User id is required" }),
		),
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
							<Field
								component={TextFormField}
								name="hsn_code"
								label={t("hsn.form.code", { defaultValue: "HSN Code" })}
								type="number"
								placeholder={t("hsn.placeholders.code", { defaultValue: "Enter HSN code" })}
							/>
							{!editHsnCodeId && (
								<Field
									component={TextFormField}
									type="number"
									name="tax"
									label={t("hsn.form.tax", { defaultValue: "Tax (in percentage)" })}
									placeholder={t("hsn.placeholders.tax", { defaultValue: "Enter percentage" })}
								/>
							)}
							<Box textAlign={"center"}>
								<Button
									variant="contained"
									onClick={() => {
										handleSubmit();
									}}
								>
									{editHsnCodeId
										? t("app.update", { defaultValue: "Update" })
										: t("hsn.form.create", { defaultValue: "Create" })}{" "}
									{t("hsn.form.codeShort", { defaultValue: "HSN Code" })}
								</Button>
								{handleClose && (
									<Button variant="outlined" onClick={handleClose}>
										{t("app.close", { defaultValue: "Close" })}
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
