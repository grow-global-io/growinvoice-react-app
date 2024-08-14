import { Box } from "@mui/material";
import MainHomeCard from "../../shared/components/MainHomeCards";
import MainHomeData from "./../../data/MainHomeData.json";

const ProcessSection = () => {
	return (
		<Box sx={{ padding: { xs: "0 20px", lg: "50px 100px" } }}>
			{MainHomeData.map((item, index) => (
				<MainHomeCard
					key={index}
					heading={item.heading}
					text={item.text}
					buttonText={item.buttonText}
					float={item.float}
				/>
			))}
		</Box>
	);
};

export default ProcessSection;
