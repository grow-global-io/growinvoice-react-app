import { AppBar, Box, Button, Grid, Toolbar, Typography } from "@mui/material";
import MembershipCard from "@shared/components/MembershipCard";
import { usePlansControllerFindAll } from "@api/services/plans";
import Loader from "@shared/components/Loader";
import { Constants } from "@shared/constants";
import { useAuthStore } from "@store/auth";

const Plans = () => {
	const { logout, user } = useAuthStore();
	const findAllPlans = usePlansControllerFindAll();
	if (findAllPlans?.isLoading || findAllPlans?.isFetching) {
		return <Loader />;
	}
	return (
		<Box>
			{user?.UserPlans?.length === 0 && (
				<AppBar position="fixed" sx={{ backgroundColor: "secondary.dark" }}>
					<Toolbar
						sx={{
							display: "flex",
							justifyContent: "space-between",
							flex: 1,
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								height: 64,
							}}
						>
							<img src={Constants.customImages.Logo} alt="logo" style={{ height: 64, width: 64 }} />
							<Typography variant="h6" color={"custom.white"}>
								GROW INVOICE
							</Typography>
						</Box>
						<Box>
							<Button onClick={() => logout()}>
								<Typography variant="h4" color={"custom.white"} fontWeight={400}>
									Logout
								</Typography>
							</Button>
						</Box>
					</Toolbar>
				</AppBar>
			)}

			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				Plans
			</Typography>
			<Grid container spacing={2} display={"flex"} justifyContent={"center"} mt={5}>
				{findAllPlans?.data?.map((item, index) => (
					<Grid item xs={12} sm={6} md={4} key={index} my={2}>
						<MembershipCard item={item} />
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default Plans;
