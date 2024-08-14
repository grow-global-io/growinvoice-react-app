import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
const HeroSecton = () => {
	const navigate = useNavigate();
	return (
		<Box padding={{ xs: "30px 0", lg: "50px 100px 0px 41px" }}>
			<Box component={"div"} className="main-heading-div">
				<Typography variant="h1" className="main-heading-text">
					Build the Future with
				</Typography>
				<Typography
					variant="h1"
					className="main-heading-heading"
					sx={{
						color: "secondary.main",
					}}
				>
					Grow Invoice
				</Typography>
				<Typography variant="h6" className="main-heading-para">
					we are team of talented engineers <br /> making apllication at Grow-Global
				</Typography>

				<Button
					variant="contained"
					sx={{ marginTop: { xs: 1, sm: "30px" } }}
					onClick={() => {
						navigate("/register");
					}}
				>
					Create your first invoice
				</Button>
			</Box>
		</Box>
	);
};

export default HeroSecton;
