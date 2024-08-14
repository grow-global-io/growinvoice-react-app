import * as React from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	List,
	ListItem,
	ListItemText,
	Button,
	Drawer,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import LoginIcon from "@mui/icons-material/Login";

const menuItems = ["Home", "About", "Features", "Services", "Pricing", "Contact"];

const DrawerList = () => {
	const navigate = useNavigate();
	return (
		<Box sx={{ width: 200 }} role="presentation" py={1}>
			<Toolbar sx={{ flexDirection: "column" }}>
				<List
					component="nav"
					sx={{
						flexDirection: "column",
						width: "100%",
						px: 2,
					}}
				>
					{menuItems.map((item) => (
						<ListItem
							key={item}
							sx={{
								"&:hover": {
									backgroundColor: "custom.lightBlue",
								},
							}}
						>
							<ListItemText primary={item} />
							<KeyboardArrowRightOutlinedIcon />
						</ListItem>
					))}
				</List>
				<Box
					gap={2}
					display={"flex"}
					flexDirection={"column"}
					sx={{
						width: "100%",
					}}
				>
					<Button
						variant="outlined"
						endIcon={<LoginIcon />}
						onClick={() => {
							navigate("/login");
						}}
						fullWidth
					>
						Login
					</Button>
					<Button
						variant="contained"
						endIcon={<LoginIcon />}
						onClick={() => {
							navigate("/register");
						}}
						fullWidth
					>
						Signup
					</Button>
				</Box>
			</Toolbar>
		</Box>
	);
};

const MainNavbar = () => {
	const navigate = useNavigate();
	const [drawerOpen, setDrawerOpen] = React.useState(false);

	const toggleDrawer = (open: boolean) => () => {
		setDrawerOpen(open);
	};

	return (
		<>
			<AppBar position="static">
				<Box py={2} sx={{ display: { xs: "block", lg: "none" } }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							px: 2,
						}}
					>
						<Typography variant="h4">Grow Invoice</Typography>
						<MenuIcon htmlColor="#000" onClick={toggleDrawer(true)} />
					</Box>
				</Box>
				<Toolbar sx={{ display: { xs: "none", lg: "flex" } }}>
					<Typography variant="h3">Grow Invoice</Typography>
					<Box component={"div"} className="menu-items" sx={{ flexGrow: 1, display: "flex" }}>
						<List component="nav" sx={{ display: "flex" }}>
							{menuItems.map((item) => (
								<ListItem key={item}>
									<ListItemText primary={item} />
								</ListItem>
							))}
						</List>
					</Box>
					<Box>
						<Button
							variant="outlined"
							endIcon={<LoginIcon />}
							onClick={() => {
								navigate("/login");
							}}
						>
							Login
						</Button>
						<Button
							variant="contained"
							endIcon={<LoginIcon />}
							onClick={() => {
								navigate("/register");
							}}
						>
							Signup
						</Button>
					</Box>
				</Toolbar>
			</AppBar>

			<Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
				<DrawerList />
			</Drawer>
		</>
	);
};

export default MainNavbar;
