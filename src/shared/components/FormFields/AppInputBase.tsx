import { styled, alpha } from "@mui/material/styles";
import MuiInputBase from "@mui/material/InputBase";

const AppInputBase = styled(MuiInputBase)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	"label + &": {
		marginTop: theme.spacing(3),
	},
	"& .MuiInputBase-input": {
		borderRadius: 8,
		position: "relative",
		// backgroundColor: theme.palette.mode === "light" ? "#fcfcfb" : "#2b2b2b",
		border: `0.5px solid ${theme.palette.text.secondary}`,
		fontSize: 16,
		padding: "10px 12px",
		transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
		"&:focus": {
			boxShadow: `${alpha(theme.palette.text.secondary, 0.25)} 0 0 0 0.2rem`,
			borderColor: theme.palette.text.secondary,
		},
		"&::placeholder": {
			color: theme.palette.text.secondary,
			fontStyle: "italic",
			fontSize: 12,
		},
	},
}));

export default AppInputBase;
