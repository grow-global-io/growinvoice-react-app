import { Card, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface OverviewCardProps {
	name: string;
	icon: React.ReactNode;
	value: string | number;
	bgColor: string;
	navigateToPath: string;
}

const DashbaordCard = ({ name, icon, value, bgColor, navigateToPath }: OverviewCardProps) => {
	const navigate = useNavigate();
	return (
		<Card
			sx={{
				alignItems: "stretch",
				height: "100%",
				cursor: "pointer",
			}}
			onClick={() => navigate(navigateToPath)}
		>
			<Grid
				container
				sx={{
					p: 2,

					height: "100%",
				}}
			>
				<Grid
					item
					xs={4}
					sx={{
						bgcolor: bgColor,
						display: "flex",
						borderRadius: 1,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{icon}
				</Grid>
				<Grid item xs={8} alignItems={"center"} pl={1}>
					<Typography variant="h6" sx={{ my: 1 }}>
						{name}{" "}
					</Typography>
					<Typography variant="h3">{value}</Typography>{" "}
				</Grid>
			</Grid>
		</Card>
	);
};

export default DashbaordCard;
