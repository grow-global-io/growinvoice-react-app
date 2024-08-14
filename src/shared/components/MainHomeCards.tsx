import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MainHomeCard = ({
	heading,
	text,
	buttonText,
	float,
}: {
	heading: string;
	text: string;
	buttonText: string;
	float: string;
}) => {
	const navigate = useNavigate();
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: { xs: "start", lg: float },
				margin: { xs: "50px 0", sm: "100px 0" },
			}}
		>
			<Box sx={{ width: { xs: "auto", sm: "719px" } }}>
				<Typography
					variant="h3"
					sx={{
						fontSize: { xs: "auto", sm: "36px" },
						fontWeight: "600",
						lineHeight: { xs: "auto", sm: "54px" },
						color: "secondary.dark",
					}}
				>
					{heading}
				</Typography>
				<Typography
					sx={{
						width: { xs: "40%", sm: "333px" },
						borderBottomStyle: "solid",
						borderBottomWidth: "4px",
						borderImage:
							"linear-gradient( to right,rgba(13, 202, 240, 1),rgba(13, 110, 253, 1)) 1 stretch",
						marginBottom: "15px",
					}}
				></Typography>
				<Typography
					variant="h5"
					sx={{
						fontSize: { xs: "auto", sm: "24px" },
						fontWeight: "400",
						lineHeight: { xs: "25px", sm: "40px" },
						color: "secondary.dark",
					}}
				>
					{text}
				</Typography>
				<Button
					variant="contained"
					sx={{ marginTop: "20px", width: { xs: "auto", sm: "30%" } }}
					onClick={() => {
						navigate("/register");
					}}
				>
					{buttonText}
				</Button>
			</Box>
		</Box>
	);
};
export default MainHomeCard;
