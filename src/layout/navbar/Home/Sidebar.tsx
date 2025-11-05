import {
	AppBar,
	Avatar,
	Box,
	Button,
	Collapse,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Select,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuthStore } from "@store/auth";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation, useNavigate } from "react-router-dom";
import { Constants } from "@shared/constants";
import PaymentIcon from "@mui/icons-material/Payment";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import NotificationMain from "@features/Notification/NotificationMain";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { FaFileInvoice } from "react-icons/fa6";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import { useQueryClient } from "@tanstack/react-query";
import { useStoreLinkStore } from "@store/storeLinkStore";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import LinkIcon from "@mui/icons-material/Link";
import { useAuthControllerStatus } from "@api/services/auth";
import { usePWAInstall } from "../../../utils/usePwaInstall";
import useMobileDetection from "../../../utils/useMobileDetection";
import { toast } from "react-toastify";
import { findLeftDate } from "@shared/formatter";
import IosInstallInstructionDialog from "@shared/components/IosInstallInstructionDialog";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;
function Sidebar({ children }: { children: React.ReactNode }) {
	const { t, i18n } = useTranslation();
	const { handleOpen } = useStoreLinkStore();
	const { data: userData } = useAuthControllerStatus();
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuthStore();
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
	const { isInstallable, isInstalled, installApp } = usePWAInstall();
	const isMobile = useMobileDetection();
	const [showIosInstructions, setShowIOSInstructions] = useState<boolean>(false);

	const settingsWithFunc = [
		{
			name: t("nav.profile"),
			func: () => {
				navigate("/setting/myprofile");
			},
		},
		// {
		// 	name: "Dashboard",
		// 	func: () => {
		// 		navigate("/dashboard");
		// 	},
		// },
		{
			name: t("nav.logout"),
			func: () => {
				queryClient.clear();
				logout();
			},
		},
	];
	const handleDrawerClose = () => {
		setIsClosing(true);
		setMobileOpen(false);
	};

	const handleDrawerTransitionEnd = () => {
		setIsClosing(false);
	};

	const handleDrawerToggle = () => {
		if (!isClosing) {
			setMobileOpen(!mobileOpen);
		}
	};

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleInstallClick = async () => {
		const result = await installApp();

		switch (result) {
			case "accepted":
				toast.success("App installed successfully!");
				break;

			case "dismissed":
				toast.warn("Installation cancelled");
				break;

			case "manual":
				setShowIOSInstructions(true);
				break;

			case "unavailable":
				toast.error("Installation not available at this time");
				break;
		}
	};

	const menuList = [
		{
			path: "/",
			icon: <HomeIcon />,
			menuName: t("nav.home"),
			menuItems: [],
		},
		{
			path: "/product/productlist",
			icon: <StoreIcon />,
			menuName: t("product.title"),
			menuItems: [],
		},
		// New My Orders menu (shown above Invoices)
		{
			path: "/orders",
			icon: <ReceiptIcon />,
			menuName: t("orders.title", { defaultValue: "My Orders" }),
			menuItems: [],
		},
		{
			path: "/customer/customerlist",
			icon: <PeopleIcon />,
			menuName: t("customer.title"),
			menuItems: [],
		},
		{
			path: "/invoice",
			icon: <ReceiptIcon />,
			menuName: t("invoice.title"),
			menuItems: [
				{ path: "/invoice/invoicelist", label: t("invoice.title") },
				{ path: "/invoice/createinvoice", label: t("invoice.create") },
			],
		},
		{
			path: "/quotation",
			icon: <FaFileInvoice fontSize={"20px"} />,
			menuName: t("quotation.title", { defaultValue: "Quotation" }),
			menuItems: [
				{
					path: "/quotation/quotationlist",
					label: t("quotation.title", { defaultValue: "Quotation" }),
				},
				{
					path: "/quotation/createquotation",
					label: t("quotation.create", { defaultValue: "Create Quotation" }),
				},
			],
		},
		{
			path: "/expenses",
			icon: <InsertDriveFileOutlinedIcon />,
			menuName: t("report.expenses.title", { defaultValue: "Expenses" }),
			menuItems: [
				{
					path: "/expenses/expenseslist",
					label: t("report.expenses.title", { defaultValue: "Expenses" }),
				},
				{
					path: "/expenses/createexpenses",
					label: t("expenses.create", { defaultValue: "Create Expense" }),
				},
			],
		},
		{
			path: "/payment/paymentList",
			icon: <PaymentIcon />,
			menuName: t("payment.title"),
			menuItems: [],
		},
		{
			path: "/plan/planspage",
			icon: <BusinessCenterOutlinedIcon />,
			menuName: t("nav.plans"),
			menuItems: [],
		},
		{
			path: "/vendors/vendorslist",
			icon: <SellOutlinedIcon />,
			menuName: t("vendor.title"),
			menuItems: [],
		},
		{
			path: "/reports",
			icon: <SignalCellularAltOutlinedIcon />,
			menuName: t("nav.reports"),
			menuItems: [
				{ path: "/reports/productsales", label: t("report.sales", { defaultValue: "Sales" }) },
				{
					path: "/reports/customersales",
					label: t("customer.title") + " " + t("report.sales", { defaultValue: "Sales" }),
				},
				{
					path: "/reports/customerdata",
					label: t("report.customerData.title", { defaultValue: "All Customers Uploaded" }),
				},
				{ path: "/reports/profitloss", label: t("report.profitLoss") },
				{
					path: "/reports/Expenses",
					label: t("report.expenses.title", { defaultValue: "Expenses" }),
				},
				// { path: "/reports/vendors", label: "Vendors" },
			],
		},
	];

	const [menuToggle, setMenuToggle] = useState(
		menuList.map((menuItemMap) => {
			if (pathname.startsWith(menuItemMap?.path)) return true;
			return false;
		}),
	);

	useEffect(() => {
		if (mobileOpen) handleDrawerClose();
		setMenuToggle(
			menuList.map((menuItemMap) => {
				if (pathname.startsWith(menuItemMap?.path)) return true;
				return false;
			}),
		);
	}, [pathname]);

	const renderListItems = (
		{
			path,
			icon,
			menuName,
			menuItems,
		}: {
			path: string;
			icon: React.ReactElement;
			menuName: string;
			menuItems: { path: string; label: string }[];
		},
		index: number,
	) => {
		const navigation = (path: string) => {
			navigate(path);
		};
		const handleToggle = () => {
			setMenuToggle((prevState) => {
				const newState = [...prevState];
				newState.fill(false, 0, newState.length);
				newState[index] = !newState[index];
				return newState;
			});
		};
		const color = "secondary.dark";
		return (
			<>
				<ListItemButton
					key={index}
					sx={{
						bgcolor: path === pathname ? "secondary.main" : "inherit",
						borderRadius: "4px",
						padding: "2px 16px",
						"&:hover": {
							backgroundColor: path === pathname ? "secondary.main" : "rgba(13, 110, 253, 0.1)",
						},

						"&:hover .MuiListItemIcon-root": {
							color: path === pathname ? "custom.white" : "secondary.dark",
						},
						"&:hover .MuiListItemText-primary": {
							color: path === pathname ? "custom.white" : "secondary.dark",
						},
						"& .MuiListItemIcon-root": {
							color: path === pathname ? "custom.white" : "secondary.dark",
							minWidth: "auto",
						},
						"& .MuiListItemText-primary": {
							color: path === pathname ? "custom.white" : "secondary.dark",
						},
						border: "1px solid rgba(0, 0, 0, 0.1)",
						marginTop: "5px",
						borderWidth: "1px",
					}}
					onClick={menuItems?.length > 0 ? handleToggle : () => navigation(path)}
				>
					<ListItemIcon
						sx={{
							pr: 2,
						}}
					>
						{icon}
					</ListItemIcon>
					<ListItemText primary={menuName} />
					{menuItems?.length > 0 && (
						<ListItemIcon>
							{menuToggle[index] ? (
								<ExpandLessIcon sx={{ color: color }} />
							) : (
								<ExpandMoreIcon sx={{ color: color }} />
							)}
						</ListItemIcon>
					)}
				</ListItemButton>
				{menuItems?.length > 0 && (
					<Collapse in={menuToggle[index]} timeout="auto" unmountOnExit>
						<List
							component="div"
							disablePadding
							sx={{
								marginLeft: 3,
								my: 1,
							}}
						>
							{menuItems.map((item) => (
								<ListItemButton
									key={item.path}
									sx={{
										marginTop: "5px",
										pl: 4,
										bgcolor: pathname.startsWith(item?.path) ? "secondary.main" : "inherit",
										"&:hover": {
											backgroundColor: pathname.startsWith(item?.path)
												? "secondary.main"
												: "rgba(13, 110, 253, 0.1)",
										},
										"&:hover .MuiListItemText-primary": {
											color: pathname.startsWith(item?.path) ? "custom.white" : "secondary.dark",
										},
										"& .MuiListItemText-primary": {
											color: pathname.startsWith(item?.path) ? "custom.white" : "secondary.dark",
										},
										borderRadius: "4px",
									}}
									onClick={() => {
										navigation(item.path);
									}}
								>
									<ListItemText primary={item?.label} />
								</ListItemButton>
							))}
						</List>
					</Collapse>
				)}
			</>
		);
	};

	const drawer = (
		<div>
			<Box
				sx={{
					backgroundColor: "secondary.dark",
				}}
			>
				<Toolbar>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: 64,
						}}
					>
						<img src={Constants.customImages.Logo} alt="logo" style={{ height: 64, width: 64 }} />
						<Typography variant="h6" color={"custom.white"}>
							GROW INVOICE
						</Typography>
					</Box>
				</Toolbar>
			</Box>
			<Divider />
			<List sx={{ px: "7%" }} component="nav">
				{menuList.map((menu, index) => (
					<React.Fragment key={menu.path}>{renderListItems(menu, index)}</React.Fragment>
				))}
			</List>
		</div>
	);

	return (
		<Box sx={{ display: "flex", width: "100%" }}>
			<AppBar
				position="fixed"
				sx={{
					width: { lg: `calc(100% - ${drawerWidth}px)` },
					ml: { xs: 0, lg: `${drawerWidth}px` },
					backgroundColor: "secondary.dark",
				}}
			>
				<Toolbar
					sx={{
						display: "flex",
						justifyContent: {
							xs: "space-between",
							lg: "flex-end",
						},
						flex: 1,
					}}
				>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { lg: "none" } }}
					>
						<MenuIcon />
					</IconButton>
					<Box display={"flex"} alignItems={"center"} gap={1}>
						{isMobile && isInstallable && !isInstalled && (
							<Button sx={{ margin: 0 }} variant="contained" onClick={handleInstallClick}>
								{t("app.install", { defaultValue: "Install the App" })}
							</Button>
						)}
						{/* Trial Days Display for Free Plan Users Only */}
						{user?.UserPlans?.some((plan) => plan?.plan?.price === 0) &&
							!user?.UserPlans?.some((plan) => plan?.plan?.price && plan?.plan?.price > 0) && (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										backgroundColor: "rgba(255, 255, 255, 0.1)",
										borderRadius: 2,
										px: 2,
										py: 0.5,
										mr: 1,
									}}
								>
									<Typography
										variant="body2"
										sx={{
											color: "custom.white",
											fontWeight: 500,
											fontSize: "0.875rem",
										}}
									>
										{(() => {
											const freePlan = user?.UserPlans?.find((plan) => plan?.plan?.price === 0);
											if (freePlan?.end_date) {
												const daysLeft = findLeftDate(freePlan.end_date);
												return daysLeft > 0
													? t("app.trial.daysLeft", {
															defaultValue: "{{days}} days left",
															days: daysLeft,
														})
													: t("app.trial.expired", { defaultValue: "Trial expired" });
											}
											return t("app.trial.active", { defaultValue: "Trial active" });
										})()}
									</Typography>
								</Box>
							)}
						{/* Language Selector Dropdown - Always visible */}
						<Select
							value={i18n.language}
							onChange={(e) => {
								const newLang = e.target.value;
								i18n.changeLanguage(newLang);
								// Track that user has manually changed language
								localStorage.setItem("languageManuallyChanged", "true");
							}}
							sx={{
								minWidth: 80,
								height: 36,
								mr: 1,
								color: "custom.white",
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: "rgba(255, 255, 255, 0.3)",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "rgba(255, 255, 255, 0.5)",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "custom.white",
								},
								"& .MuiSvgIcon-root": {
									color: "custom.white",
								},
								"& .MuiSelect-select": {
									padding: "8px 32px 8px 12px",
									fontSize: "0.875rem",
									fontWeight: 500,
								},
							}}
							MenuProps={{
								PaperProps: {
									sx: {
										bgcolor: "background.paper",
										mt: 0.5,
									},
								},
							}}
						>
							<MenuItem value="en">ENG</MenuItem>
							<MenuItem value="fi">FI</MenuItem>
							<MenuItem value="est">EST</MenuItem>
						</Select>
						<NotificationMain />
						<Box
							mx={{ xs: 0, sm: 2 }}
							sx={{ cursor: "pointer" }}
							onClick={() => {
								handleOpen();
							}}
						>
							{user?.storeName ? (
								<Tooltip title={t("store.link", { defaultValue: "Store Link" })}>
									<IconButton
										sx={{
											gap: 1,
										}}
									>
										<LinkIcon sx={{ color: "custom.white" }} />
										<Typography
											color={"custom.white"}
											sx={{
												textTransform: "capitalize",
											}}
										>
											{userData?.storeName}
										</Typography>
									</IconButton>
								</Tooltip>
							) : (
								<Tooltip title={t("store.create", { defaultValue: "Create Store" })}>
									<NewReleasesIcon sx={{ color: "custom.white" }} />
								</Tooltip>
							)}
						</Box>
						<Box sx={{ flexGrow: 0 }}>
							<Tooltip title={t("app.more", { defaultValue: "More" })}>
								<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
									<Avatar
										alt="Remy Sharp"
										src={user?.company?.[0]?.logo ?? "/static/images/avatar/2.jpg"}
									/>
								</IconButton>
							</Tooltip>
							<Menu
								sx={{ mt: "45px" }}
								id="menu-appbar"
								anchorEl={anchorElUser}
								anchorOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								open={Boolean(anchorElUser)}
								onClose={handleCloseUserMenu}
							>
								{settingsWithFunc.map((setting) => (
									<MenuItem
										key={setting?.name}
										onClick={() => {
											setting.func();
											handleCloseUserMenu();
										}}
									>
										<Typography textAlign="center">{setting?.name}</Typography>
									</MenuItem>
								))}
							</Menu>
						</Box>
					</Box>
				</Toolbar>
			</AppBar>
			<Box
				component="nav"
				sx={{ width: { lg: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label="mailbox folders"
			>
				{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onTransitionEnd={handleDrawerTransitionEnd}
					onClose={handleDrawerClose}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: { sx: "block", lg: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							justifyContent: "space-between",
						},
					}}
				>
					{" "}
					<>
						{drawer}
						{isInstallable && !isInstalled && (
							<Button sx={{ margin: "8px 16px" }} variant="contained" onClick={handleInstallClick}>
								Install the App
							</Button>
						)}
					</>
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", lg: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							backgroundColor: "custom.lightBlue",
						},
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { lg: `calc(95% - ${drawerWidth}px)`, xs: `calc(95% - ${drawerWidth}px)` },
				}}
			>
				<Toolbar></Toolbar>
				{children}
			</Box>
			<IosInstallInstructionDialog
				open={showIosInstructions}
				onClose={() => setShowIOSInstructions(false)}
			/>
		</Box>
	);
}

export default Sidebar;
