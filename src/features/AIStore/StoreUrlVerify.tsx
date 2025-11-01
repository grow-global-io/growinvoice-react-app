import { useAuthControllerStatus } from "@api/services/auth";
import { useStoreControllerCreateUpdateStore } from "@api/services/store";
import { Box, Button, Grid, List, ListItem, ListItemButton, Typography } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import Loader from "@shared/components/Loader";
import { useAuthStore } from "@store/auth";
import { useStoreLinkStore } from "@store/storeLinkStore";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import i18n from "../../i18s";

const StoreUrlVerify = () => {
	const { t } = useTranslation();
	const create = useStoreControllerCreateUpdateStore();
	const user = useAuthControllerStatus();
	const { handleOpen } = useStoreLinkStore();
	const initalValues = {
		storeName: user?.data?.storeName || "",
	};

	const validationSchema = Yup.object().shape({
		storeName: Yup.string()
			.required(() => i18n.t("store.validation.nameRequired"))
			.test(
				"uniqueStoreName",
				() => i18n.t("store.validation.mustBeUnique"),
				async (value) => {
					if (!value) return true;
					return /^[a-zA-Z][a-zA-Z0-9_]{2,30}$/.test(value);
				},
			),
	});
	const { refecthUser } = useAuthStore();

	const handleSubmit = async (values: typeof initalValues) => {
		await create.mutateAsync({
			data: {
				storeName: values.storeName,
			},
		});
		user?.refetch();
		refecthUser();
		handleOpen();
	};

	const storeNameSuggestionsGenerator = (storeName: string) => {
		const suggestions: string[] = [];
		for (let i = 1; i <= 5; i++) {
			suggestions.push(`${storeName}${i}`);
		}
		return suggestions;
	};

	if (user?.isLoading) {
		return <Loader />;
	}

	return (
		<Box>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h5">
						{t("store.verification.title", { defaultValue: "Store URL Verification" })}
					</Typography>
					<Typography variant="body1">
						{t("store.verification.description", {
							defaultValue: "Please verify your store URL. You can use the following suggestions:",
						})}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Formik
						initialValues={initalValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ values, setFieldValue }) => (
							<Form>
								<Field
									name="storeName"
									label={t("store.name", { defaultValue: "Store Name" })}
									component={TextFormField}
								/>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6}>
										<Typography variant="body2" sx={{ mt: 2 }}>
											{t("store.verification.suggestedNames", {
												defaultValue: "Suggested Store Names (click to use):",
											})}
										</Typography>
										<List>
											{storeNameSuggestionsGenerator(values.storeName).length > 0 &&
												storeNameSuggestionsGenerator(values.storeName).map((suggestion, index) => (
													<ListItem key={index} disablePadding>
														<ListItemButton
															onClick={() => {
																setFieldValue("storeName", suggestion);
															}}
														>
															<Typography variant="body1">{suggestion}</Typography>
														</ListItemButton>
													</ListItem>
												))}
										</List>
									</Grid>
								</Grid>
								<Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
									{t("store.updateStoreName", { defaultValue: "Update Store Name" })}
								</Button>
							</Form>
						)}
					</Formik>
				</Grid>
			</Grid>
		</Box>
	);
};

export default StoreUrlVerify;
