import React from "react";
import {
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogContent,
	Divider,
	Grid,
	LinearProgress,
	Typography,
} from "@mui/material";
import AppDialogHeader from "../../../shared/components/Dialog/AppDialogHeader";
import { AdminUsersListDto } from "../../../api/services/auth/models";
import { findLeftDate, parseDateStringToFormat, numberToOrdinal } from "@shared/formatter";
import { AttachMoney, ShoppingCart, People, Store, Receipt } from "@mui/icons-material";
import { useAuthControllerGetUserQuota } from "@api/services/auth";
import { useTranslation } from "react-i18next";

const iconMapping: Record<string, React.ElementType> = {
	Invoice: Receipt,
	Quotation: AttachMoney,
	Customer: People,
	Product: Store,
	Tax: ShoppingCart,
	HSNCode: Store,
	ProductUnit: Store,
	PaymentDetails: AttachMoney,
	InvoiceSettings: Receipt,
	QuotationSettings: AttachMoney,
	Payments: AttachMoney,
};

const getProgressColor = (percentage: number) => {
	if (percentage >= 75) return "error";
	if (percentage >= 50) return "warning";
	return "success";
};

const UserData = ({
	open,
	handleClose,
	userData: user,
}: {
	open: boolean;
	handleClose: () => void;
	userData: AdminUsersListDto;
}) => {
	const { t } = useTranslation();
	const findQuota = useAuthControllerGetUserQuota(
		{
			userId: user?.id ?? "",
		},
		{
			query: {
				enabled: !!user?.id,
				refetchOnWindowFocus: true,
				refetchOnMount: true,
			},
		},
	);
	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<AppDialogHeader title="User Data" handleClose={handleClose} />
			<DialogContent>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={11}>
						<Card
							sx={{
								border: "1px solid",
								borderColor: "custom.settingSidebarBorder",
								p: 2,
							}}
						>
							{user?.UserPlans?.map((item, index) => {
								return (
									<Grid key={item.id} container>
										<Grid item xs={12} sm={6}>
											<Typography variant="h5" textTransform={"capitalize"}>
												{t("plans.planTitle", {
													defaultValue: "{{order}} Plan",
													order: numberToOrdinal(index + 1),
												})}
											</Typography>
											<Box display={"flex"} my={1}>
												<Typography variant="h6">
													{t("plans.planLabel", { defaultValue: "Plan" })} :
												</Typography>
												<Typography variant="h6" fontWeight={"500"}>
													{" "}
													{t(
														`plans.planNames.${item?.plan?.name?.toLowerCase().replace(/\s+/g, "")}`,
														{
															defaultValue: item?.plan?.name || "",
														},
													)}
												</Typography>
											</Box>
											<Box display={"flex"} alignItems={"center"} my={1}>
												<Typography variant="h6">
													{t("plans.status", { defaultValue: "Status" })} :
												</Typography>
												<Chip
													label={t("common.active", { defaultValue: "Active" })}
													variant="filled"
													color={"success"}
													sx={{ ml: 1 }}
												/>
											</Box>
											<Box display={"flex"} my={1}>
												<Typography variant="h6">
													{t("plans.trialEnds", { defaultValue: "Trial Ends" })} :
												</Typography>
												<Typography variant="h6" fontWeight={"500"}>
													{t("plans.trialEndsText", {
														defaultValue: "{{date}} ({{days}} days left)",
														date: parseDateStringToFormat(item?.end_date ?? ""),
														days: findLeftDate(item?.end_date ?? ""),
													})}
												</Typography>
											</Box>
										</Grid>
										<Grid item xs={12} sm={12}>
											<Divider
												sx={{
													mb: 1,
												}}
											/>
										</Grid>
									</Grid>
								);
							})}
						</Card>
					</Grid>
					<Grid item xs={12} sm={12} textAlign={"center"} mx={4}>
						<Grid container spacing={2} display={"flex"} justifyContent={"center"}>
							{findQuota?.data?.map((item, index) => {
								const { feature, usedCount, quotaCount } = item;
								const percentage = (usedCount / quotaCount) * 100;
								const Icon = iconMapping[feature];
								return (
									<Grid item xs={12} sm={6} md={4} key={index}>
										<Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
											<CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
												<Avatar sx={{ bgcolor: "primary.main" }}>
													<Icon />
												</Avatar>
												<Box flexGrow={1}>
													<Typography variant="h6" fontWeight={600}>
														{t(`plans.features.${feature}`, { defaultValue: feature })}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{usedCount} / {quotaCount}
													</Typography>
													<Box mt={1}>
														<LinearProgress
															variant="determinate"
															value={percentage}
															color={getProgressColor(percentage)}
															sx={{ height: 10, borderRadius: 5 }}
														/>
													</Box>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								);
							})}
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default UserData;
