import { type CreateTaxDto } from "@api/services/models";
import {
	getTaxcodeControllerFindAllQueryKey,
	getTaxcodeControllerFindOneQueryKey,
	useTaxcodeControllerCreate,
	useTaxcodeControllerFindOne,
	useTaxcodeControllerUpdate,
} from "@api/services/tax-code";
import { Box, Button } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";
import { Formik, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateTaxCodeStore } from "@store/createTaxCodeStore";
import Loader from "@shared/components/Loader";
import { useTranslation } from "react-i18next";

const style = {
	bgcolor: "custom.lightBlue",
	padding: 2,
	borderRadius: 1,
	mb: 1,
};

const CreateTaxes = ({ handleClose }: { handleClose?: () => void }) => {
	const { t, i18n } = useTranslation();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createTax = useTaxcodeControllerCreate();
	const updateTax = useTaxcodeControllerUpdate();
	const { editTaxId } = useCreateTaxCodeStore.getState();
	const editValues = useTaxcodeControllerFindOne(editTaxId ?? "", {
		query: {
			enabled: editTaxId !== null,
		},
	});

	const validationSchema: Yup.Schema<CreateTaxDto> = Yup.object().shape({
		name: Yup.string().required(() =>
			i18n.t("tax.validation.nameRequired", { defaultValue: "Tax Name is required" }),
		),
		description: Yup.string().nullable(),
		percentage: Yup.number()
			.required(() =>
				i18n.t("tax.validation.percentageRequired", { defaultValue: "Percentage is required" }),
			)
			.min(
				0,
				i18n.t("tax.validation.percentageMin", {
					defaultValue: "Percentage should be greater than 0",
				}),
			)
			.max(
				100,
				i18n.t("tax.validation.percentageMax", {
					defaultValue: "Percentage should be less than 100",
				}),
			),
		user_id: Yup.string().required(() =>
			i18n.t("tax.validation.userRequired", { defaultValue: "User id is required" }),
		),
	});

	const initialValues: CreateTaxDto = {
		name: editValues?.data?.name ?? "",
		percentage: editValues?.data?.percentage ?? 0,
		description: editValues?.data?.description ?? "",
		user_id: user?.id ?? "",
	};

	const handleSubmit = async (values: CreateTaxDto, action: FormikHelpers<CreateTaxDto>) => {
		action.setSubmitting(true);
		if (editTaxId) {
			await updateTax.mutateAsync({
				id: editTaxId ?? "",
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getTaxcodeControllerFindOneQueryKey(editTaxId ?? ""),
			});
		} else {
			await createTax.mutateAsync({
				data: values,
			});
		}
		action.resetForm();
		if (handleClose) handleClose();

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
								name="name"
								component={TextFormField}
								label={t("tax.form.name", { defaultValue: "Tax Name" })}
								placeholder={t("tax.placeholders.name", { defaultValue: "Tax Name" })}
							/>
							<Field
								component={TextFormField}
								type="number"
								name="percentage"
								label={t("tax.form.percentage", { defaultValue: "Percentage" })}
							/>
							<Field
								name="description"
								component={TextFormField}
								label={t("tax.form.description", { defaultValue: "Description" })}
								placeholder={t("tax.placeholders.description", { defaultValue: "Description" })}
								multiline
								rows={5}
							/>
							<Box textAlign={"center"}>
								<Button
									variant="contained"
									onClick={() => {
										handleSubmit();
									}}
								>
									{editTaxId
										? t("app.update", { defaultValue: "Update" })
										: t("tax.form.create", { defaultValue: "Create" })}{" "}
									{t("tax.form.titleShort", { defaultValue: "Tax" })}
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

export default CreateTaxes;
