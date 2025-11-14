import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import loderJson from "@assets/loader.json";
import { useTranslation } from "react-i18next";

export default function Loader() {
	const { t } = useTranslation();
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
			<Typography sx={{ fontSize: 18 }}>
				{t("common.loading", { defaultValue: "Loading..." })}
			</Typography>
		</Box>
	);
}
