import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "react-i18next";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const MenuLists = [
		{
			menuName: t("settings.menu.myProfile", { defaultValue: "My profile" }),
			path: "/setting/myprofile",
		},
		{
			menuName: t("settings.menu.membership", { defaultValue: "Membership" }),
			path: "/setting/membership",
		},
		{
			menuName: t("settings.menu.company", { defaultValue: "Company" }),
			path: "/setting/company",
		},
		// {
		// 	menuName: "Preferences",
		// 	path: "/setting/preferences",
		// },
		{
			menuName: t("settings.menu.invoices", { defaultValue: "Invoices" }),
			path: "/setting/invoices",
		},
		{
			menuName: t("settings.menu.quotation", { defaultValue: "Quotation" }),
			path: "/setting/quotation",
		},
		{
			menuName: t("settings.menu.productUnit", { defaultValue: "Product Unit" }),
			path: "/setting/productunit",
		},
		{
			menuName: t("settings.menu.paymentDetails", { defaultValue: "Payment Details" }),
			path: "/setting/paymentdetails",
		},
		{
			menuName: t("settings.menu.gatewayDetails", { defaultValue: "Gateway Details" }),
			path: "/setting/gatewaydetails",
		},
		{
			menuName: t("settings.menu.hsnCode", { defaultValue: "HSN Code" }),
			path: "/setting/hsncode",
		},
		{
			menuName: t("settings.menu.taxTypes", { defaultValue: "Tax Types" }),
			path: "/setting/taxtype",
		},
		{
			menuName: t("settings.menu.apiCredentials", { defaultValue: "API Credentials" }),
			path: "/setting/apicredentials",
		},
	];

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Box display={{ xs: "none", lg: "flex" }}>
				<Box width={"230px"}>
					<List
						sx={{
							borderRight: "2px solid",
							borderColor: "custom.settingSidebarBorder",
							flexGrow: 1,
						}}
					>
						{MenuLists.map((item, index) => (
							<ListItem
								key={index}
								onClick={() => {
									navigate(item.path);
								}}
								sx={{ my: 0 }}
							>
								<ListItemText
									primary={
										<Typography
											variant="h6"
											color={pathname == item.path ? "custom.primary" : "secondary.dark"}
											fontWeight={500}
											sx={{
												bgcolor: pathname == item.path ? "custom.lightBlue" : "",
												py: 1,
												px: 2,
												borderRadius: 1.5,
												width: "70%",
												cursor: "pointer",
											}}
										>
											{item.menuName}
										</Typography>
									}
								/>
							</ListItem>
						))}
					</List>
				</Box>

				<Box
					sx={{
						flexGrow: 1,
						px: 3,
						py: 1,
						width: { lg: `calc(100% - 230px)` },
						height: "auto",
						overflowY: "scroll",
					}}
				>
					<Box>
						<Typography variant="h3" textTransform={"capitalize"} mb={3}>
							{t("settings.title", { defaultValue: "Settings" })}
						</Typography>
					</Box>

					{children}
				</Box>
			</Box>

			<Box display={{ xs: "flex", lg: "none" }} flexDirection={"column"}>
				<Box display={"flex"} justifyContent={"space-between"} mb={3}>
					<Box>
						<Typography variant="h3" textTransform={"capitalize"}>
							{t("settings.title", { defaultValue: "Settings" })}
						</Typography>
					</Box>
					<IconButton
						aria-label="more"
						id="long-button"
						aria-controls={open ? "long-menu" : undefined}
						aria-expanded={open ? "true" : undefined}
						aria-haspopup="true"
						onClick={handleClick}
					>
						<MenuIcon />
					</IconButton>

					<Menu
						id="long-menu"
						MenuListProps={{
							"aria-labelledby": "long-button",
						}}
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							style: {
								maxHeight: "100%",
								width: "20ch",
							},
						}}
					>
						{MenuLists.map((item, index) => (
							<MenuItem
								key={index}
								onClick={() => {
									navigate(item.path);
									handleClose();
								}}
							>
								{item.menuName}
							</MenuItem>
						))}
					</Menu>
				</Box>
				{children}
			</Box>
		</>
	);
};

export default Sidebar;
