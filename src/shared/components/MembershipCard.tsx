import {
	Button,
	Card,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useAuthStore } from "@store/auth";
import { usePaymentsControllerStripePaymentForPlans } from "@api/services/payments";
import { PlanWithFeaturesDto } from "@api/services/models";
import { formatCurrency } from "@shared/formatter";
import { useMemo } from "react";

const style = {
	color: "secondary.dark",
	borderRadius: 1.5,
};

function formatPlansPriceUnit(days: number) {
	if (days % 30 === 0) {
		if (days === 30) return "Monthly";
		else return `${days / 30} months`;
	}
	if (days % 365 === 0) {
		if (days === 365) return "Yearly";
		else return `${days / 365} years`;
	}
	return `${days} days`;
}

const MembershipCard = ({ item }: { item: PlanWithFeaturesDto }) => {
	const { user } = useAuthStore();
	const createPlan = usePaymentsControllerStripePaymentForPlans();
	const handleUpgradePlan = async () => {
		const params = { user_id: user?.id ?? "", plan_id: item?.id ?? "" };
		const response = await createPlan.mutateAsync({ params });
		window.open(response);
	};

	const checkIsSubscribe = useMemo(() => {
		return user?.UserPlans?.some((userPlan) => userPlan.plan_id === item?.id);
	}, [user?.UserPlans]);

	return (
		<Card
			sx={{
				alignItems: "stretch",
				height: "100%",
				border: "1px solid",
				borderColor: "custom.settingSidebarBorder",
			}}
		>
			<Grid container sx={style}>
				<Grid item xs={12} textAlign={"center"}>
					<Typography variant="h4" p={3}>
						{item?.name}
					</Typography>
				</Grid>
				<Grid item xs={12} display={"flex"} justifyContent={"center"} alignItems={"center"}>
					<Typography variant="h3">{formatCurrency(item?.price)}</Typography> /
					<Typography variant="body2">{formatPlansPriceUnit(item?.days)}</Typography>
				</Grid>
				<Grid item xs={12}>
					<List>
						{item?.PlanFeatures?.map((plan, index) => (
							<ListItem key={index}>
								<ListItemIcon sx={{ minWidth: "30px" }}>
									<CheckIcon sx={{ color: "custom.greenCheck" }} />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography variant="h5" color={"secondary.dark"} fontWeight={500} ml={0}>
											{plan?.count} {plan?.feature}
										</Typography>
									}
								/>
							</ListItem>
						))}
					</List>
				</Grid>
				<Grid item xs={12} px={5} py={2}>
					<Button
						variant="outlined"
						fullWidth
						onClick={handleUpgradePlan}
						disabled={checkIsSubscribe}
					>
						{checkIsSubscribe ? "Subscribed Already" : "Upgrade"}
					</Button>
				</Grid>
			</Grid>
		</Card>
	);
};

export default MembershipCard;
