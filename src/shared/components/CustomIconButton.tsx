import { Avatar, IconButton, SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

export const CustomIconButton = ({
	src,
	onClick,
	bgcolor = "action.selected",
	iconColor = "primary",
	title,
	buttonType,
	disabled,
}: Readonly<{
	src: string | (OverridableComponent<SvgIconTypeMap> & { muiName: string });
	onClick?: () => void;
	bgcolor?: string;
	iconColor?: "primary" | "secondary" | "action" | "disabled" | "error";
	title?: string;
	buttonType?: "delete" | "normal";
	disabled?: boolean;
}>) => {
	if (typeof src === "string") {
		return (
			<Avatar
				title={title}
				component={IconButton}
				onClick={onClick}
				sx={{
					bgcolor: bgcolor,
					borderRadius: 4,
					p: 1,
					"&:hover": {
						bgcolor: "custom.BtnLightBgColor",
					},
					mx: 0.5,
					height: "40px",
					width: "40px",
				}}
				disabled={disabled}
				src={src}
				variant="square"
			/>
		);
	} else {
		const Icon = src;
		return (
			<IconButton
				title={title}
				onClick={onClick}
				disabled={disabled}
				sx={{
					bgcolor: buttonType === "delete" ? "custom.BtnLightPinkBgColor" : bgcolor,

					borderRadius: 4,
					p: 1,
					mx: 0.5,
					"&:hover": {
						bgcolor:
							buttonType === "delete" ? "custom.BtnMediumPinkBgColor" : "custom.BtnLightBgColor",
					},
					height: "40px",
					width: "40px",
				}}
			>
				<Icon color={iconColor} />
			</IconButton>
		);
	}
};
