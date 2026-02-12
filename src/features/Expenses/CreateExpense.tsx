import { useCurrencyControllerFindAll } from "@api/services/currency";
import { type CreateExpensesDto, CreateExpensesDtoCategory } from "@api/services/models";
import { useVendorsControllerFindAll } from "@api/services/vendors";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { DateFormField } from "@shared/components/FormFields/DateFormField";
import { FileUploadFormField } from "@shared/components/FormFields/FileUploadFormField";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { FieldWithTooltip } from "@shared/components/FormFields/FieldWithTooltip";
import { expenseFormTooltips } from "@shared/tooltips";
import { Constants } from "@shared/constants";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as yup from "yup";
import { useAuthStore } from "@store/auth";
import {
	getExpensesControllerFindAllQueryKey,
	getExpensesControllerFindOneQueryKey,
	useExpensesControllerCreate,
	useExpensesControllerFindOne,
	useExpensesControllerUpdate,
} from "@api/services/expenses";
import { formatDateToIso } from "@shared/formatter";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Loader from "@shared/components/Loader";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import type { AiExpensePrefill } from "./types/aiExpensePrefill";

const CreateExpense = ({ id, aiPrefill }: { id?: string; aiPrefill?: AiExpensePrefill }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const vendorsData = useVendorsControllerFindAll();
	const currencyList = useCurrencyControllerFindAll();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	const ExpensesFindOne = useExpensesControllerFindOne(id ?? "", {
		query: {
			enabled: id !== undefined,
		},
	});

	const baseInitialValues: CreateExpensesDto = {
		receipt_url: ExpensesFindOne?.data?.receipt_url ?? "",
		category: ExpensesFindOne?.data?.category ?? "Travel",
		vendor_id: ExpensesFindOne?.data?.vendor_id ?? "",
		user_id: user?.id ?? "",
		expenseDate: ExpensesFindOne?.data?.expenseDate ?? moment().toString(),
		amount: ExpensesFindOne?.data?.amount ?? 0,
		currency_id: ExpensesFindOne?.data?.currency_id ?? user?.currency_id ?? "",
		notes: ExpensesFindOne?.data?.notes ?? "",
	};

	// When navigating from Your AI with extracted expense data, merge prefill into base values (only for new expenses)
	const initialValues: CreateExpensesDto =
		aiPrefill && !id
			? {
					...baseInitialValues,
					...aiPrefill,
					user_id: user?.id ?? baseInitialValues.user_id,
				}
			: baseInitialValues;

	const schema: yup.Schema<CreateExpensesDto> = yup.object({
		receipt_url: yup.string(),
		category: yup
			.string()
			.required(t("expensesForm.validation.categoryRequired"))
			.oneOf(Object.values(CreateExpensesDtoCategory), t("expensesForm.validation.invalidType")),
		vendor_id: yup.string().required(t("expensesForm.validation.vendorRequired")),
		user_id: yup.string().required(t("expensesForm.validation.userRequired")),
		expenseDate: yup.string().required(t("expensesForm.validation.expenseDateRequired")),
		amount: yup.number().required(t("expensesForm.validation.amountRequired")),
		currency_id: yup.string().required(t("expensesForm.validation.currencyRequired")),
		notes: yup.string(),
	});

	const createExpenses = useExpensesControllerCreate();
	const updateExpenses = useExpensesControllerUpdate();
	const handleSubmit = async (
		values: CreateExpensesDto,
		actions: FormikHelpers<CreateExpensesDto>,
	) => {
		actions.setSubmitting(true);
		if (id) {
			await updateExpenses.mutateAsync({
				id: id ?? "",
				data: {
					...values,
					amount: parseFloat(values.amount.toString()),
					expenseDate: formatDateToIso(values.expenseDate),
				},
			});
			queryClient.invalidateQueries({
				queryKey: getExpensesControllerFindOneQueryKey(id ?? ""),
			});
		} else {
			await createExpenses.mutateAsync({
				data: {
					...values,
					amount: parseFloat(values.amount.toString()),
					expenseDate: formatDateToIso(values.expenseDate),
				},
			});
		}

		await queryClient.refetchQueries({
			queryKey: getExpensesControllerFindAllQueryKey(),
		});
		actions.resetForm();
		actions.setSubmitting(false);
		navigate("/expenses/expenseslist");
	};

	const { setOpenVendorsForm } = useCreateVendorsStore.getState();
	if (ExpensesFindOne?.isLoading || ExpensesFindOne?.isFetching || ExpensesFindOne.isRefetching) {
		return <Loader />;
	}
	return (
		<>
			<Typography
				variant="h3"
				textTransform={"capitalize"}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<img src={Constants.customImages.invoiceIcon} alt={t("expensesForm.iconAlt")} />{" "}
				{t("expensesForm.title")}
			</Typography>

			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{() => {
						return (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.receipt_url.titleKey)}
											tooltipDescription={t(expenseFormTooltips.receipt_url.descriptionKey)}
										>
											<Field
												name="receipt_url"
												label={t("expensesForm.receipt")}
												component={FileUploadFormField}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.category.titleKey)}
											tooltipDescription={t(expenseFormTooltips.category.descriptionKey)}
										>
											<Field
												name="category"
												label={t("expensesForm.category")}
												component={AutocompleteField}
												options={Object.values(CreateExpensesDtoCategory).map((value) => ({
													value,
													label: t(`expenses.categoryTypes.${value.toLowerCase()}`, {
														defaultValue: value,
													}),
												}))}
												isRequired={true}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.vendor_id.titleKey)}
											tooltipDescription={t(expenseFormTooltips.vendor_id.descriptionKey)}
										>
											<Field
												name="vendor_id"
												label={t("expensesForm.vendor")}
												component={AutocompleteField}
												options={vendorsData?.data?.map((customer) => ({
													value: customer.id,
													label: customer.display_name,
												}))}
												loading={vendorsData.isLoading}
												isRequired={true}
											/>
										</FieldWithTooltip>
										<Button
											variant="text"
											onClick={() => setOpenVendorsForm(true)}
											startIcon={<AddIcon />}
										>
											{t("expensesForm.addVendor")}
										</Button>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.expenseDate.titleKey)}
											tooltipDescription={t(expenseFormTooltips.expenseDate.descriptionKey)}
										>
											<Field
												name="expenseDate"
												label={t("expensesForm.expenseDate")}
												component={DateFormField}
												isRequired={true}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.amount.titleKey)}
											tooltipDescription={t(expenseFormTooltips.amount.descriptionKey)}
										>
											<Field
												name="amount"
												label={t("expensesForm.amount")}
												component={TextFormField}
												isRequired={true}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.currency_id.titleKey)}
											tooltipDescription={t(expenseFormTooltips.currency_id.descriptionKey)}
										>
											<Field
												name="currency_id"
												label={t("expensesForm.currency")}
												loading={currencyList.isLoading || currencyList.isFetching}
												component={AutocompleteField}
												options={currencyList?.data?.map((currency) => ({
													value: currency.id,
													label: `${currency.short_code} - ${currency.name}`,
												}))}
												isRequired={true}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} sm={6}>
										<FieldWithTooltip
											tooltipTitle={t(expenseFormTooltips.notes.titleKey)}
											tooltipDescription={t(expenseFormTooltips.notes.descriptionKey)}
										>
											<Field
												name="notes"
												label={t("expensesForm.notes")}
												component={TextFormField}
												multiline
												rows={5}
											/>
										</FieldWithTooltip>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											{t("expensesForm.save")}
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

export default CreateExpense;
