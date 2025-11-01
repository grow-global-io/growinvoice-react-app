// import React from "react";
import {
	type OmitCreatePlanFeatureDto,
	OmitCreatePlanFeatureDtoFeature,
	type PlanWithFeaturesDto,
} from "../../../api/services/auth/models";
import { Button, Dialog, DialogContent, Grid, Typography } from "@mui/material";
import AppDialogHeader from "../../../shared/components/Dialog/AppDialogHeader";
import * as Yup from "yup";
import { Field, FieldArray, Form, Formik } from "formik";
import { AutocompleteField } from "../../../shared/components/FormFields/AutoComplete";
import { TextFormField } from "../../../shared/components/FormFields/TextFormField";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { getPlansControllerFindAllQueryKey, usePlansControllerUpdate } from "@api/services/plans";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const PlansFeatureUpdate = ({
	open,
	handleClose,
	planData,
}: {
	open: boolean;
	handleClose: () => void;
	planData?: PlanWithFeaturesDto;
}) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const plansUpdate = usePlansControllerUpdate();
	const initialValues: {
		data: OmitCreatePlanFeatureDto[];
	} = {
		data:
			planData?.PlanFeatures?.map((feat) => ({
				count: feat.count || 0,
				feature: feat.feature || OmitCreatePlanFeatureDtoFeature.Invoice,
			})) || [],
	};
	const validationSchema = Yup.object().shape({
		data: Yup.array().of(
			Yup.object().shape({
				count: Yup.number()
					.required("Count is required")
					.min(0, "Count must be greater than or equal to 0"),
				feature: Yup.string()
					.oneOf(Object.values(OmitCreatePlanFeatureDtoFeature), "Invalid feature")
					.required("Feature is required"),
			}),
		),
	});

	const handleSubmit = async (values: typeof initialValues) => {
		await plansUpdate.mutateAsync({
			id: planData?.id || "",
			data: {
				name: planData?.name || "",
				description: planData?.description || "",
				price: planData?.price || 0,
				days: planData?.days || 0,
				isOneTime: planData?.isOneTime || false,
				is_active: planData?.is_active || true,
				features: values.data.map((item) => ({
					count: item.count,
					feature: item.feature as OmitCreatePlanFeatureDtoFeature,
				})),
			},
		});
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
					{({ values }) => {
						return (
							<Form>
								<FieldArray
									name="data"
									render={(arrayHelpers) => (
										<Grid container spacing={2}>
											{values?.data && values?.data?.length > 0 ? (
												values.data.map((_, index) => (
													<Grid item xs={12} key={index}>
														<Grid container spacing={2}>
															<Grid item xs={4}>
																<Field
																	name={`data.${index}.feature`}
																	label="Feature"
																	component={AutocompleteField}
																	options={Object.values(OmitCreatePlanFeatureDtoFeature)
																		?.filter((feat) => {
																			// filter out already added features in values.data
																			return !values.data.some(
																				(item) => item.feature === feat && item !== _,
																			);
																		})
																		.map((feat) => ({
																			label: feat,
																			value: feat,
																		}))}
																/>
															</Grid>
															<Grid item xs={4}>
																<Field
																	type="number"
																	name={`data.${index}.count`}
																	label="Count"
																	component={TextFormField}
																/>
															</Grid>
															<Grid item xs={2} display="flex" alignItems="center">
																<CustomIconButton
																	src={CloseIcon}
																	buttonType="delete"
																	iconColor="error"
																	onClick={() => arrayHelpers.remove(index)}
																/>
															</Grid>
														</Grid>
													</Grid>
												))
											) : (
												<Grid item xs={12}>
													<Typography variant="body2" color="error">
														No price book entries found. Please add at least one.
													</Typography>
												</Grid>
											)}
											<Grid item xs={12}>
												<Button
													variant="outlined"
													startIcon={<AddIcon />}
													onClick={() =>
														arrayHelpers.push({
															count: 0,
															feature: OmitCreatePlanFeatureDtoFeature.Invoice,
														})
													}
												>
													Add Feature
												</Button>
											</Grid>
										</Grid>
									)}
								/>
								<Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
									<Button type="submit" variant="contained" color="primary">
										{t("plans.updateFeatures", { defaultValue: "Update Features" })}
									</Button>
								</Grid>
							</Form>
						);
					}}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default PlansFeatureUpdate;
