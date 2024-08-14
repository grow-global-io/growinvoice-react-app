import { useCurrencyControllerFindAll } from "@api/services/currency";
import { CreateExpensesDto, CreateExpensesDtoCategory } from "@api/services/models";
import { useVendorsControllerFindAll } from "@api/services/vendors";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { DateFormField } from "@shared/components/FormFields/DateFormField";
import { FileUploadFormField } from "@shared/components/FormFields/FileUploadFormField";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { Constants } from "@shared/constants";
import { stringToListDto } from "@shared/models/ListDto";
import { Formik, Form, Field, FormikHelpers } from "formik";
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

const CreateExpense = ({ id }: { id?: string }) => {
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

	const initialValues: CreateExpensesDto = {
		receipt_url: ExpensesFindOne?.data?.receipt_url ?? "",
		category: ExpensesFindOne?.data?.category ?? "Travel",
		vendor_id: ExpensesFindOne?.data?.vendor_id ?? "",
		user_id: user?.id ?? "",
		expenseDate: ExpensesFindOne?.data?.expenseDate ?? moment().toString(),
		amount: ExpensesFindOne?.data?.amount ?? 0,
		currency_id: ExpensesFindOne?.data?.currency_id ?? "",
		notes: ExpensesFindOne?.data?.notes ?? "",
	};

	const schema: yup.Schema<CreateExpensesDto> = yup.object({
		receipt_url: yup.string(),
		category: yup
			.string()
			.required("Category is required")
			.oneOf(Object.values(CreateExpensesDtoCategory), "Invalid Type"),
		vendor_id: yup.string().required("Vendor is required"),
		user_id: yup.string().required("User is required"),
		expenseDate: yup.string().required("Vendor is required"),
		amount: yup.number().required("Amount is required"),
		currency_id: yup.string().required("currency is required"),
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
				<img src={Constants.customImages.invoiceIcon} alt="Invoice Icon" /> New Expenses
			</Typography>

			<Box sx={{ mb: 2, mt: 2 }}>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{() => {
						return (
							<Form>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6}>
										<Field name="receipt_url" label="Receipt" component={FileUploadFormField} />
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="category"
											label="Category"
											component={AutocompleteField}
											options={Object.values(CreateExpensesDtoCategory).map(stringToListDto)}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="vendor_id"
											label="Vendor"
											component={AutocompleteField}
											options={vendorsData?.data?.map((customer) => ({
												value: customer.id,
												label: customer.display_name,
											}))}
											loading={vendorsData.isLoading}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="expenseDate"
											label="Expense Date"
											component={DateFormField}
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="amount"
											label="Amount"
											component={TextFormField}
											isRequired={true}
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
											isRequired={true}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Field
											name="notes"
											label="Notes"
											component={TextFormField}
											multiline
											rows={5}
										/>
									</Grid>
									<Grid item xs={12} textAlign={"center"}>
										<Button variant="contained" type="submit">
											Save
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
