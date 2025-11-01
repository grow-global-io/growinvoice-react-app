import * as Yup from "yup";
import { Button, Dialog, DialogContent, Grid } from "@mui/material";
import AppDialogHeader from "../../../shared/components/Dialog/AppDialogHeader";
import { Field, Form, Formik } from "formik";
import { TextFormField } from "../../../shared/components/FormFields/TextFormField";
import { CheckBoxFormField } from "../../../shared/components/FormFields/CheckBoxFormField";
import {
	getPlansControllerFindAllQueryKey,
	usePlansControllerCreate,
	usePlansControllerUpdate,
} from "@api/services/plans";
import { type PlanWithFeaturesDto } from "@api/services/models";
import { useQueryClient } from "@tanstack/react-query";

const PlansCreate = ({
	open,
	handleClose,
	planData,
}: {
	open: boolean;
	handleClose: () => void;
	planData?: PlanWithFeaturesDto;
}) => {
	const queryClient = useQueryClient();
	const plancreate = usePlansControllerCreate();
	const plansUpdate = usePlansControllerUpdate();
	const initialValues = {
		name: planData?.name || "",
		description: planData?.description || "",
		price: planData?.price || 0,
		days: planData?.days || 0,
		isOneTime: planData?.isOneTime || false,
		is_active: planData?.is_active || true,
	};
	const validationSchema = Yup.object().shape({
		name: Yup.string().required("Plan name is required"),
		description: Yup.string().required("Description is required"),
		price: Yup.number()
			.required("Price is required")
			.min(0, "Price must be greater than or equal to 0"),
		days: Yup.number()
			.required("Billing cycle is required")
			.min(1, "Billing cycle must be at least 1 day"),
		isOneTime: Yup.boolean(),
	});
	const handleSubmit = async (values: typeof initialValues) => {
		if (planData) {
			await plansUpdate.mutateAsync({
				id: planData.id,
				data: {
					name: values.name,
					description: values.description,
					price: values.price,
					days: values.days,
					isOneTime: values.isOneTime,
					is_active: values.is_active,
					features: [...planData.PlanFeatures],
				},
			});
		} else {
			await plancreate.mutateAsync({
				data: {
					name: values.name,
					description: values.description,
					price: values.price,
					days: values.days,
					isOneTime: values.isOneTime,
					is_active: values.is_active,
					features: [],
				},
			});
		}
		handleClose();
		queryClient.refetchQueries({
			queryKey: getPlansControllerFindAllQueryKey(),
		});
	};
	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<AppDialogHeader title="Create New Plan" handleClose={handleClose} />
			<DialogContent>
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
				>
					{() => (
						<Form id="plans-create-form">
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field name="name" label="Plan Name" component={TextFormField} />
								</Grid>
								<Grid item xs={12}>
									<Field
										name="description"
										label="Description"
										component={TextFormField}
										multiline
										rows={4}
									/>
								</Grid>
								<Grid item xs={12}>
									<Field name="price" label="Price" type="number" component={TextFormField} />
								</Grid>
								<Grid item xs={12}>
									<Field
										name="days"
										label="Billing Cycle (in days)"
										type="number"
										component={TextFormField}
									/>
								</Grid>
								<Grid item xs={12}>
									<Field name="isOneTime" label="One-Time Payment" component={CheckBoxFormField} />
								</Grid>
								<Grid item xs={12} display="flex" justifyContent="flex-end">
									<Button type="submit" variant="contained" color="primary">
										Create Plan
									</Button>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default PlansCreate;
