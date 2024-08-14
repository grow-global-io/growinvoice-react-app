import Box from "@mui/material/Box";
import "./mainhome.css";
import MainNavbar from "@layout/navbar/Mainpage/MainNavbar";
import HeroSecton from "./HeroSecton";
import ProcessSection from "./ProcessSection";

export default function MainHome() {
	return (
		<Box component={"div"} className="mainpage">
			<MainNavbar />
			<HeroSecton />
			<ProcessSection />
		</Box>
	);
}
