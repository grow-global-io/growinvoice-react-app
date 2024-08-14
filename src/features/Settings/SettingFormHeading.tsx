import { Grid, Typography } from "@mui/material";

interface SettingFormHeadingProps {
	heading: string;
	icon: string;
	text?: string; // Make text optional
}

const SettingFormHeading: React.FC<SettingFormHeadingProps> = ({ heading, icon, text }) => {
	return (
		<Grid item xs={12} sm={12}>
			<Typography
				variant="h4"
				color={"secondary.dark"}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				<img src={icon} alt="Icon" /> {heading}
			</Typography>
			{text && (
				<Typography variant="body1" pl={4} lineHeight={1.5}>
					{text}
				</Typography>
			)}
		</Grid>
	);
};

export default SettingFormHeading;
