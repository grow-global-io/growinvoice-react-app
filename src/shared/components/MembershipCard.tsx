import {
	Button,
	Card,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useAuthStore } from "@store/auth";
import {
	usePaymentsControllerGrowlimitlessPyamentsForPlans,
	usePaymentsControllerStripePaymentForPlans,
} from "@api/services/payments";
import { PlanWithFeaturesDto } from "@api/services/models";
import { formatCurrency } from "@shared/formatter";
import React, { useMemo } from "react";
import { environment } from "@enviroment";
import { useInvoiceHook } from "@features/Invoices/invoiceHooks/useInvoiceHook";

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
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const options = ["Select Payment Method", "Stripe", "Growlimitless", "Razorpay"];

	const { user } = useAuthStore();
	const createPlan = usePaymentsControllerGrowlimitlessPyamentsForPlans();
	const stripePlan = usePaymentsControllerStripePaymentForPlans();
	const { handleRazorPayPaymentForPlans } = useInvoiceHook();
	const handleUpgradePlan = async (type: "Stripe" | "Growlimitless" | "Razorpay") => {
		const params = { user_id: user?.id ?? "", plan_id: item?.id ?? "" };
		if (item.price === 0) {
			// want to open in same tab
			window.open(
				`${environment.baseUrl}/api/payments/successGrowlimitlessPlans?plan_id=${item.id}&user_id=${user?.id}`,
				"_self",
			);
			return;
		}
		if (type === "Stripe") {
			const response = await stripePlan.mutateAsync({ params });
			window.open(response as string, "_self");
			return;
		}
		if (type === "Razorpay") {
			await handleRazorPayPaymentForPlans(
				params.plan_id,
				params.user_id,
				"rzp_live_YzB8fovZA2pLja",
			);
			return;
		}
		const response = await createPlan.mutateAsync({ params });
		window.open(response as string, "_self");
	};

	const checkIsSubscribe = useMemo(() => {
		return user?.UserPlans?.some((userPlan) => userPlan.plan_id === item?.id);
	}, [user?.UserPlans]);

	const handleMenuItemClick = (_: React.MouseEvent<HTMLElement>, index: number) => {
		setSelectedIndex(index);
		handleClose();
		if (index > 0) {
			handleUpgradePlan(options[index] as "Stripe" | "Growlimitless");
		}
	};

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
						{item?.name} {checkIsSubscribe ? "(Current Plan)" : ""}
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
						aria-expanded={open ? "true" : undefined}
						onClick={handleClickListItem}
						aria-controls="lock-menu"
					>
						Upgrade
					</Button>
					<Menu
						id="lock-menu"
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						MenuListProps={{
							"aria-labelledby": "lock-button",
						}}
						// fullWidth
						PaperProps={{
							style: {
								width: "100%",
								maxWidth: 360,
							},
						}}
					>
						{options.map((option, index) => (
							<MenuItem
								key={option}
								disabled={index === 0}
								selected={index === selectedIndex}
								onClick={(event) => handleMenuItemClick(event, index)}
							>
								{option}
							</MenuItem>
						))}
					</Menu>
				</Grid>
			</Grid>
		</Card>
	);
};

export default MembershipCard;
