import { useAuthControllerGetUserQuota } from "@api/services/auth";
import { usePlansControllerFindAll } from "@api/services/plans";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	Grid,
	LinearProgress,
	Typography,
} from "@mui/material";
import Loader from "@shared/components/Loader";
// import MembershipCard from "@shared/components/MembershipCard";
import { numberToOrdinal, parseDateStringToFormat } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { AttachMoney, ShoppingCart, People, Store, Receipt } from "@mui/icons-material";
import React, { useEffect } from "react";

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

function findLeftDate(end_Date: string): number {
	const todaysDate = moment();
	const endDate = moment(end_Date);
	const diffInMs = endDate.diff(todaysDate);
	const msInDay = 24 * 60 * 60 * 1000;
	return Math.floor(diffInMs / msInDay);
}

const getProgressColor = (percentage: number) => {
	if (percentage >= 75) return "error";
	if (percentage >= 50) return "warning";
	return "success";
};

const Membership = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const findAllPlans = usePlansControllerFindAll();
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
	useEffect(() => {
		findQuota.refetch();
	}, []);
	if (findAllPlans?.isLoading || findAllPlans?.isFetching) {
		return <Loader />;
	}
	return (
		<>
			<Box
				sx={{
					maxHeight: "calc(100vh - 220px)",
					overflowY: "auto",
					py: 2,
				}}
			>
				<Grid container spacing={2} display={"flex"} justifyContent={"center"}>
					<Grid item xs={12} sm={12} textAlign={"center"}>
						<Typography variant="h5" fontWeight={400} lineHeight={1.2}>
							upgrade your plan to generate more other features.
							<Button
								variant="text"
								color="primary"
								sx={{
									p: 0,
									ml: 1,
								}}
								onClick={() => {
									navigate("/plan/planspage");
								}}
							>
								Click here to upgrade
							</Button>
						</Typography>
					</Grid>
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
												{numberToOrdinal(index + 1)} Plan
											</Typography>
											<Box display={"flex"} my={1}>
												<Typography variant="h6">Plan :</Typography>
												<Typography variant="h6" fontWeight={"500"}>
													{" "}
													{item?.plan?.name}
												</Typography>
											</Box>
											<Box display={"flex"} alignItems={"center"} my={1}>
												<Typography variant="h6">Status :</Typography>
												<Chip label={"Active"} variant="filled" color={"success"} sx={{ ml: 1 }} />
											</Box>
											<Box display={"flex"} my={1}>
												<Typography variant="h6">Trial Ends :</Typography>
												<Typography variant="h6" fontWeight={"500"}>
													{" "}
													{parseDateStringToFormat(item?.end_date ?? "")} (
													{findLeftDate(item?.end_date ?? "")} days is left)
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
														{feature}
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
			</Box>
		</>
	);
};

export default Membership;
