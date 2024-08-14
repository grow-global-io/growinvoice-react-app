import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import loderJson from "@assets/loader.json";

export default function Loader() {
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let animation: AnimationItem | undefined;
		if (container.current) {
			animation = lottie.loadAnimation({
				container: container.current,
				renderer: "svg",
				loop: true,
				autoplay: true,
				animationData: loderJson,
			});
		}
		return () => {
			animation?.destroy();
		};
	}, []);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "80vh",
			}}
		>
			<div style={{ width: 300, height: 300 }} className="container" ref={container}></div>
			<Typography sx={{ fontSize: 18 }}>Loading...</Typography>
		</Box>
	);
}
