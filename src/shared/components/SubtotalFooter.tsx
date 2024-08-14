import CreateTaxes from "@features/ProductTaxes/CreateTaxes";
import { Button, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import { Field, FormikProps } from "formik";
import { AutocompleteField } from "./FormFields/AutoComplete";
import { TextFormField } from "./FormFields/TextFormField";
import AddIcon from "@mui/icons-material/Add";
import { useTaxcodeControllerFindAll } from "@api/services/tax-code";
import { useEffect, useState } from "react";

const SubtotalFooter = ({
	formik,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formik: FormikProps<any>;
}) => {
	const taxCodes = useTaxcodeControllerFindAll();
	const [taxesCreateopen, setTaxesCreateOpen] = useState(false);

	useEffect(() => {
		if (
			formik?.values?.discountPercentage > 0 ||
			formik?.values.tax_id !== "" ||
			formik?.values.tax_id !== undefined ||
			formik?.values.tax_id !== null
		) {
			const tax = taxCodes?.data?.find((tax) => tax.id === formik?.values.tax_id);
			const discount =
				formik?.values?.sub_total *
				(formik?.values?.discountPercentage.toString() === "NaN"
					? 0
					: formik?.values?.discountPercentage / 100);

			const taxPercentage = formik?.values?.sub_total * (Number(tax?.percentage ?? 0) / 100);
			formik?.setFieldValue("total", formik?.values?.sub_total - discount + taxPercentage);
			if (formik?.values?.due_amount) {
				formik?.setFieldValue("due_amount", formik?.values?.sub_total - discount + taxPercentage);
			}
		} else {
			formik?.setFieldValue("total", formik?.values?.sub_total);
			if (formik?.values?.due_amount) {
				formik?.setFieldValue("due_amount", formik?.values?.sub_total);
			}
		}
	}, [formik?.values?.discountPercentage, formik?.values.tax_id]);

	if (taxCodes.isLoading || taxCodes.isFetching) return <Typography>Loading...</Typography>;

	return (
		<Card>
			<CardContent>
				<Grid
					container
					display={"flex"}
					alignItems={"center"}
					px={2}
					py={3}
					borderRadius={1}
					sx={{ background: "custom.transparentWhite" }}
				>
					<Grid item xs={12} sm={6}>
						<Typography variant="h5">Subtotal</Typography>
					</Grid>
					<Grid item xs={12} sm={6} textAlign={"right"}>
						<Field
							name="sub_total"
							component={TextFormField}
							type="number"
							disabled
							isRequired={true}
						/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Typography variant="h5">Taxes</Typography>
					</Grid>
					<Grid item xs={12} sm={6} textAlign={"right"}>
						<Field
							name="tax_id"
							component={AutocompleteField}
							loading={taxCodes.isLoading || taxCodes.isFetching}
							options={taxCodes?.data?.map((item) => {
								return {
									label: item?.percentage + "%",
									value: item?.id,
								};
							})}
						/>
						<Button variant="text" startIcon={<AddIcon />} onClick={() => setTaxesCreateOpen(true)}>
							Add Taxes
						</Button>
					</Grid>
					{taxesCreateopen && (
						<Grid item xs={12}>
							<CreateTaxes handleClose={() => setTaxesCreateOpen(false)} />
						</Grid>
					)}
					<Grid item xs={12} sm={6}>
						<Typography variant="h5">Discount in %</Typography>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Field name="discountPercentage" component={TextFormField} type="number" />
					</Grid>
					<Grid item xs={12}>
						<Divider />
					</Grid>
					<Grid item xs={12} sm={6}>
						<Typography variant="h5">Total</Typography>
					</Grid>
					<Grid item xs={12} sm={6} textAlign={"right"}>
						<Field
							name="total"
							component={TextFormField}
							type="number"
							isRequired={true}
							disabled
						/>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default SubtotalFooter;
