import {
	AppBar,
	Avatar,
	Box,
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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import NotificationMain from "@features/Notification/NotificationMain";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { FaFileInvoice } from "react-icons/fa6";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
const drawerWidth = 240;
function Sidebar({ children }: { children: React.ReactNode }) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuthStore();
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
	const settingsWithFunc = [
		{
			name: "Profile",
			func: () => {
				navigate("/setting/myprofile");
			},
		},
		{
			name: "Dashboard",
			func: () => {
				navigate("/dashboard");
			},
		},
		{
			name: "Logout",
			func: () => {
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

	const menuList = [
		{
			path: "/",
			icon: <HomeIcon />,
			menuName: "Home",
			menuItems: [],
		},
		{
			path: "/product/productlist",
			icon: <StoreIcon />,
			menuName: "Product",
			menuItems: [],
		},
		{
			path: "/customer/customerlist",
			icon: <PeopleIcon />,
			menuName: "Customer",
			menuItems: [],
		},
		{
			path: "/invoice",
			icon: <ReceiptIcon />,
			menuName: "Invoice",
			menuItems: [
				{ path: "/invoice/invoicelist", label: "Invoice" },
				{ path: "/invoice/createinvoice", label: "Create Invoice" },
			],
		},
		{
			path: "/quotation",
			icon: <FaFileInvoice fontSize={"20px"} />,
			menuName: "Quotation",
			menuItems: [
				{ path: "/quotation/quotationlist", label: "Quotation" },
				{ path: "/quotation/createquotation", label: "Create Quotation" },
			],
		},
		{
			path: "/expenses",
			icon: <InsertDriveFileOutlinedIcon />,
			menuName: "Expenses",
			menuItems: [
				{ path: "/expenses/expenseslist", label: "Expenses" },
				{ path: "/expenses/createexpenses", label: "Create Expense" },
			],
		},
		{
			path: "/payment/paymentList",
			icon: <PaymentIcon />,
			menuName: "Payment",
			menuItems: [],
		},
		{
			path: "/plan/planspage",
			icon: <BusinessCenterOutlinedIcon />,
			menuName: "Plans",
			menuItems: [],
		},
		{
			path: "/vendors/vendorslist",
			icon: <SellOutlinedIcon />,
			menuName: "Vendors",
			menuItems: [],
		},
		{
			path: "/reports",
			icon: <SignalCellularAltOutlinedIcon />,
			menuName: "Reports",
			menuItems: [
				{ path: "/reports/productsales", label: "Product Sales" },
				{ path: "/reports/customersales", label: "Customer Sales" },
				{ path: "/reports/profitloss", label: "Profit Loss" },
				{ path: "/reports/Expenses", label: "Expenses" },
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
						<NotificationMain />
						<Box
							mx={{ xs: 0, sm: 2 }}
							sx={{ cursor: "pointer" }}
							onClick={() => {
								navigate("/setting/myprofile");
							}}
						>
							<SettingsOutlinedIcon />
						</Box>
						<Box sx={{ flexGrow: 0 }}>
							<Tooltip title="Open settings">
								<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
									<Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
						"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
					}}
				>
					{drawer}
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
		</Box>
	);
}

export default Sidebar;
