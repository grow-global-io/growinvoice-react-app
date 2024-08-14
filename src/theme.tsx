import * as React from "react";
import { ThemeOptions, createTheme, alpha } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { TransitionProps } from "@mui/material/transitions";
import { Box, Slide } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

// for datagrid search component
function QuickSearchToolbar() {
	return (
		<Box
			sx={{
				px: 1,
				pb: 0,
				float: "left",
			}}
		>
			<GridToolbarQuickFilter variant="outlined" />
		</Box>
	);
}

const themeOptions: ThemeOptions = {
	palette: {
		mode: "light",
		primary: {
			main: "rgba(13, 110, 253, 1)",
			contrastText: "#fff",
			light: "#31C4C3",
		},
		secondary: {
			main: "#0D6EFD",
			contrastText: "#fff",
			light: "#CFF1DE",
			dark: "#000",
		},
		warning: {
			main: "#facea8",
		},
		grey: {
			"100": "#d1d1d1",
			"200": "#c1c1c1",
			"300": "#979797",
			"400": "#7c828a",
			"500": "#7D8398",
		},
		text: {
			secondary: "#0a97b7",
			primary: "#054c5c",
			disabled: "#99a1a1",
		},
		background: {
			paper: "#fff",
			default: "#fafafa",
		},
		action: {
			active: "#979797",
			activatedOpacity: 0.1,
			selected: "#C0EDED",
		},
	},
	typography: {
		fontFamily: '"Roboto", sans-serif',
		fontSize: 14,
		h1: {
			fontSize: "2.5rem",
			fontWeight: "bold",
			lineHeight: "2.75rem",
			letterspacing: "0rem",
		},
		h2: {
			fontSize: "2rem",
			fontWeight: "normal",
			lineHeight: "2.2rem",
			letterspacing: "0rem",
		},
		h3: {
			fontSize: "1.5rem",
			fontWeight: "bold",
			lineHeight: "2.2rem",
			letterspacing: "1.15rem",
			textTransform: "uppercase",
		},
		h4: {
			fontSize: "1.1rem",
			fontWeight: "bold",
			lineHeight: "1.7rem",
			letterspacing: "0rem",
		},
		h5: {
			fontSize: "1rem",
			fontWeight: "bold",
			lineHeight: "1.7rem",
			letterspacing: "0rem",
		},
		h6: {
			fontSize: "0.85rem",
			fontWeight: "bold",
			lineHeight: "1rem",
			letterspacing: "0rem",
		},
		body1: {
			fontSize: "0.8rem",
			lineHeight: "1.7rem",
			fontWeight: "normal",
			letterspacing: "0rem",
		},
		body2: {
			fontSize: "0.7rem",
			fontWeight: "normal",
			lineHeight: "1.7rem",
			letterspacing: "0rem",
		},
		button: {
			fontSize: "0.8rem",
			fontWeight: "bolder",
			lineHeight: "1.15rem",
			textTransform: "uppercase",
			letterspacing: "2rem",
		},
	},
	components: {
		MuiTypography: {
			defaultProps: {
				color: "text.primary",
				fontSize: "body1",
				// textTransform: "capitalize",
			},
		},
		MuiAppBar: {
			styleOverrides: {
				colorInherit: {
					// backgroundImage: "linear-gradient(180deg, #8CEEED, #FBFEFD)",
					backgroundColor: "rgba(102, 209, 209, 0.1)",
					borderBottom: "2px solid #eceefe;",
					color: "#fff",
				},
			},
			defaultProps: {
				elevation: 0,
				color: "inherit",
			},
		},
		MuiButton: {
			defaultProps: {
				// disableElevation: true,
				sx: {
					borderRadius: 1,
					minWidth: 120,
					margin: "0px 8px",
					textTransform: "capitalize",
					// outlined variant
					"&.MuiButton-outlined": {
						borderWidth: 3,
						padding: "5px 20px",
					},
					// contained variant
					"&.MuiButton-contained": {
						padding: "6px 20px",
						fontSize: "14px",
						fontWeight: "500",
						lineHeight: "20px",
					},
					// text variant
					"&.MuiButton-text": {
						padding: "5px 0px",
					},
				},
			},
		},
		MuiButtonGroup: {
			defaultProps: {
				size: "small",
			},
		},
		MuiCheckbox: {
			defaultProps: {
				size: "small",
			},
		},
		MuiFab: {
			defaultProps: {
				size: "small",
			},
		},
		MuiFormControl: {
			defaultProps: {
				size: "small",
				margin: "dense",
			},
		},
		MuiFormHelperText: {
			defaultProps: {
				margin: "dense",
			},
		},
		MuiIconButton: {
			defaultProps: {
				size: "small",
			},
		},
		MuiInputBase: {
			defaultProps: {
				size: "small",
				margin: "dense",
			},
		},
		MuiInputLabel: {
			defaultProps: {
				size: "small",
			},
		},
		MuiRadio: {
			defaultProps: {
				size: "small",
			},
		},
		MuiSwitch: {
			defaultProps: {
				size: "small",
			},
		},
		MuiTextField: {
			defaultProps: {
				size: "small",
				margin: "dense",
				sx(theme) {
					return {
						mb: theme.spacing(1),
						"label + &": {
							marginTop: theme.spacing(2),
						},
						"& .MuiTextField-root": {
							borderRadius: 8,
							position: "relative",
							// backgroundColor: theme.palette.mode === "light" ? "#fcfcfb" : "#2b2b2b",
							border: `0.5px solid ${theme.palette.text.secondary}`,
							fontSize: 16,
							padding: "10px 12px",
							transition: theme.transitions.create([
								"border-color",
								"background-color",
								"box-shadow",
							]),
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
					};
				},
			},
		},
		MuiAutocomplete: {
			defaultProps: {
				size: "small",
				sx(theme) {
					return {
						mb: theme.spacing(1),
						"label + &": {
							marginTop: theme.spacing(1),
						},
						"& .MuiAutocomplete-root": {
							borderRadius: 8,
							position: "relative",
							// backgroundColor: theme.palette.mode === "light" ? "#fcfcfb" : "#2b2b2b",
							border: `0.5px solid ${theme.palette.text.secondary}`,
							fontSize: 16,
							padding: "10px 12px",
							transition: theme.transitions.create([
								"border-color",
								"background-color",
								"box-shadow",
							]),
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
					};
				},
			},
		},
		MuiList: {
			defaultProps: {
				dense: true,
			},
		},
		MuiMenuItem: {
			defaultProps: {
				dense: true,
			},
		},
		MuiTable: {
			defaultProps: {
				size: "small",
			},
		},
		MuiCard: {
			defaultProps: {
				elevation: 2,
			},
		},
		MuiDialog: {
			defaultProps: {
				TransitionComponent: Transition,
			},
		},

		MuiAccordion: {
			defaultProps: {
				elevation: 0,
				disableGutters: true,
				square: true,
				sx(theme) {
					return {
						border: `1px solid ${theme.palette.divider}`,
						"&:not(:last-child)": {
							borderBottom: 0,
						},
						"&:before": {
							display: "none",
						},
					};
				},
			},
		},
		MuiAccordionSummary: {
			defaultProps: {
				expandIcon: <ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem", color: "text.primary" }} />,
				sx(theme) {
					return {
						backgroundColor: theme.palette.primary.main,
						flexDirection: "row-reverse",
						"& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
							transform: "rotate(90deg)",
						},
						"& .MuiAccordionSummary-content": {
							marginLeft: theme.spacing(1),
						},
					};
				},
			},
		},
		MuiAccordionDetails: {
			defaultProps: {
				sx(theme) {
					return {
						"& .MuiTabs-indicator": {
							backgroundColor: theme.palette.text.primary,
						},
					};
				},
			},
		},
		MuiTabs: {
			defaultProps: {
				sx(theme) {
					return {
						"& .MuiTabs-indicator": {
							backgroundColor: theme.palette.text.primary,
						},
					};
				},
			},
		},
		MuiTab: {
			defaultProps: {
				// root typography
				sx(theme) {
					return {
						fontSize: "0.7rem",
						color: "#979797",
						"&.Mui-selected": {
							color: theme.palette.text.primary,
						},
						// "&.Mui-focusVisible": {
						// 	backgroundColor: "#d1eaff",
						// },
					};
				},
			},
		},
		MuiListItemText: {
			defaultProps: {
				primaryTypographyProps: {
					// variant: "h6",
					fontSize: "0.8rem",
					fontWeight: "bold",
					color: "text.primary",
					textTransform: "capitalize",
					// lineHeight: 1,
				},
				secondaryTypographyProps: {
					// variant: "body2",
					color: "text.secondary",
					// lineHeight: 1,
				},
			},
		},
		MuiToggleButton: {
			defaultProps: {
				sx: {
					"&.Mui-selected": {
						color: "#3AB0C0",
						backgroundColor: "#D6F0F3",
					},
				},
			},
		},
		MuiAvatar: {
			defaultProps: {
				sx: {
					"&.MuiAvatar-root": {
						width: 40,
						height: 40,
						backgroundColor: "#c1c1c1",
					},
				},
			},
		},
		MuiDataGrid: {
			defaultProps: {
				// components: { toolbar: QuickSearchToolbar },
				slots: {
					toolbar: QuickSearchToolbar,
				},
				pageSizeOptions: [10, 25, 50, 100],
				initialState: {
					pagination: {
						paginationModel: { pageSize: 10, page: 0 },
					},
				},
				checkboxSelection: false,
				sx(theme) {
					return {
						"& .MuiDataGrid-columnHeaderTitleContainer": {
							fontSize: 14,
							fontWeight: "bold",
							color: theme.palette.text.primary,
						},
						"& .MuiDataGrid-cell": {
							fontSize: 14,
							py: 1,
							color: theme.palette.text.primary,
							display: "flex",
							alignItems: "center",
						},
						"& .MuiDataGrid-columnHeaderTitle": {
							fontWeight: 700,
						},
					};
				},
			},
		},
		MuiTableHead: {
			defaultProps: {
				sx: {
					"&.MuiTableHead-root": {
						fontSize: 16,
					},
				},
			},
		},
		MuiTableCell: {
			defaultProps: {
				sx: {
					"&.MuiTableCell-root": {
						fontSize: 14,
					},
				},
			},
		},
	},
};

const customTheme = {
	...themeOptions,
	palette: {
		custom: {
			primary: "#0D6EFD",
			secondary: "#31C4C3",
			tertiary: "#FFC107",
			quaternary: "#054c5c",
			greenCheck: "rgba(15, 187, 0, 1)",
			white: "#fff",
			tableBtnBgColor: "#121212",
			productTblColor: "#32C371",
			productTbleBgColor: "#D6F3E2",
			BtnLightBgColor: "	 #bce2e6",
			BtnLightPinkBgColor: "#edbfbf",
			BtnMediumPinkBgColor: "#ffbfbf",
			lightDark: "rgba(0, 0, 0, 0.2)",
			lightgray: "rgba(217, 217, 217, 0.07)",
			transparentWhite: "#F7F7F7",
			lightGreenColor: "rgba(145, 197, 97, 0.12)",
			lightOrangeColor: "rgba(214, 162, 67, 0.12)",
			darkGreen: "rgba(145, 197, 97, 1)",
			darkOrange: "rgba(214, 162, 67, 1)",
			tableHeaderBgColor: "rgba(230, 230, 230, 1)",
			lightBlue: "rgba(246, 250, 255, 1)",
			settingSidebarBorder: "rgba(227, 224, 224, 1)",
			greyrgba: "rgba(125, 131, 152, 0.1)",
			apiBtnBgColor: "#BF384B",
			GreenBtnColor: "#0FBB00",
			grayColor: "#808080",
			invDetailBtnBorder: "rgba(13, 110, 253, 0.5)",
			DashboardBlue: "#17a2b8",
			DashboardGreen: "#28a745",
			DashbaordYellow: "#ffc107",
			DashboadRed: "#dc3545",
		},
		...themeOptions.palette,
	},
};

export const theme = createTheme(customTheme);
