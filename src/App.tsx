import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { protectedRoutes, unProtectedRoutes } from "./routes";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuthStore } from "@store/auth";
import { useLoaderStore } from "@store/loader";
import Loader from "@shared/components/Loader";
import NotFoundPage from "@pages/NotFoundPage";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { useEffectOnce } from "@shared/hooks/useEffectOnce";
import Navbar from "@layout/navbar/Home/Navbar";
import GetStartedDialog from "@features/Dashboard/GetStartedDialog";
import { useCreateProductStore } from "@store/createProductStore";
import { ProductDrawer } from "@features/Products/CreateProduct";
import { useCreateCustomerStore } from "@store/createCustomerStore";
import { CustomerDrawer } from "@features/Customer/CreateCustomer";
import ParentofSidebar from "@layout/navbar/Settings/Sidebar";
import { useCreatePaymentStore } from "@store/createPaymentStore";
import { PaymentDrawer } from "@features/Payments/CreatePayments";
import { useCreateVendorsStore } from "@store/createVendorsStore";
import { VendorsDrawer } from "@features/Vendor/CreateVendors";
import { useCreateTaxCodeStore } from "@store/createTaxCodeStore";
import { TaxCodeDrawer } from "@features/Settings/TaxCode/CreateTaxCode";
import { useCreateHsnCodeStore } from "@store/createHsnCodeStore";
import { HsnCodeDrawer } from "@features/Settings/HsnCode/CreateHsnCode";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";
import { ProductUnitDrawer } from "@features/Settings/ProductUnit/CreateProductUnit";
import { useCreateVendorsViewStore } from "@store/createVendorViewStore";
import VendorViewDialog from "@features/Vendor/VendorView";
import { toast, ToastContainer } from "react-toastify";
import { GateWayDialog } from "@features/GatewayDetails/GateWayDetailsIndex";
import "react-toastify/dist/ReactToastify.css";
import useSocket from "@shared/hooks/useNotificationSocket";
import PlansPage from "@pages/PlansPage";
import React from "react";

function AppContainer() {
	const { isLoggedIn, logout, validateToken, user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation(); // Get the current path

	useEffectOnce(() => {
		setIsLoading(true);
		validateToken()
			.then(() => {
				setIsLoading(false);
			})
			.catch(() => {
				logout();
				setIsLoading(false);
			});
	});
	const userId = user?.id ?? "";
	const socket = useSocket(userId);

	useEffect(() => {
		if (socket && user?.id) {
			socket.on("newMessage", (notification) => {
				toast(() => {
					return (
						<div>
							<h3>{notification?.title}</h3>
							<p>{notification?.body}</p>
						</div>
					);
				});
			});

			// Clean up the listener on component unmount
			return () => {
				socket.off("newMessage");
			};
		}
	}, [socket, user?.id]);

	if (isLoading) {
		return <Loader />;
	}

	if (!isLoggedIn) {
		return (
			<Routes>
				{unProtectedRoutes.map(({ path, Component }) => (
					<Route key={path} path={path} element={<Component />} />
				))}
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		);
	}

	const includeParentofSidebar = location.pathname.includes("setting");
	if (user?.UserPlans?.length === 0) {
		return (
			<>
				<Routes>
					<Route path={"/plan/planspage"} element={<PlansPage />} />
					<Route path={"*"} element={<Navigate to="/plan/planspage" replace />} />
				</Routes>
			</>
		);
	}

	return (
		<Navbar>
			{includeParentofSidebar ? (
				<ParentofSidebar>
					<GetStartedDialog
						open={
							user?.company?.length === 0 ||
							user?.company?.[0]?.country_id === "" ||
							user?.company?.[0]?.address === null ||
							user?.company?.[0]?.address === ""
						}
					/>
					<Routes>
						<Route path="*" element={<NotFoundPage />} />
						{protectedRoutes.map(({ path, Component }) => (
							<Route key={path} path={path} element={<Component />} />
						))}
						<Route path="/login" element={<Navigate to="/" replace />} />
						<Route path="/register" element={<Navigate to="/" replace />} />
					</Routes>
				</ParentofSidebar>
			) : (
				<>
					<GetStartedDialog
						open={
							user?.company?.length === 0 ||
							user?.company?.[0]?.country_id === "" ||
							user?.company?.[0]?.address === null ||
							user?.company?.[0]?.address === ""
						}
					/>
					<Routes>
						<Route path="*" element={<NotFoundPage />} />
						{protectedRoutes.map(({ path, Component }) => (
							<Route key={path} path={path} element={<Component />} />
						))}
						<Route path="/login" element={<Navigate to="/" replace />} />
					</Routes>
				</>
			)}
		</Navbar>
	);
}

function App() {
	const [backdropOpen, setBackdropOpen] = useState(false);
	const [openProductForm, setOpenProductForm] = useState(false);
	const [openCustomerForm, setOpenCustomerForm] = useState(false);
	const [openPaymentForm, setOpenPaymentForm] = useState(false);
	const [openVendorsForm, setOpenVendorsForm] = useState(false);
	const [openGateWayForm, setOpenGateWayForm] = useState(false);
	const [openHsnCodeForm, setOpenHsnCodeForm] = useState(false);
	const [openTaxCodeForm, setOpenTaxCodeForm] = useState(false);
	const [openProductUnitForm, setOpenProductUnitForm] = useState(false);
	const [openVendorViewForm, setOpenVendorViewForm] = useState(false);

	const handleCloseProductForm = () => {
		setOpenProductForm(false);
	};

	const handleCloseCustomerForm = () => {
		setOpenCustomerForm(false);
	};

	const handleClosePaymentForm = () => {
		setOpenPaymentForm(false);
	};

	const handleCloseVendorsForm = () => {
		setOpenVendorsForm(false);
	};
	const handleCloseGateWayForm = () => {
		setOpenGateWayForm(false);
	};
	const handleCloseHsnCodeForm = () => {
		setOpenHsnCodeForm(false);
	};
	const handleCloseTaxCodeForm = () => {
		setOpenTaxCodeForm(false);
	};
	const handleCloseProductUnitForm = () => {
		setOpenProductUnitForm(false);
	};
	const handleCloseVendorViewForm = () => {
		setOpenVendorViewForm(false);
	};

	const loaderRef = useRef(useLoaderStore.getState());
	const createProduct = useRef(useCreateProductStore.getState());
	const createCustomer = useRef(useCreateCustomerStore.getState());
	const createPayment = useRef(useCreatePaymentStore.getState());
	const createVendors = useRef(useCreateVendorsStore.getState());
	const createHsnCode = useRef(useCreateHsnCodeStore.getState());
	const createTaxCode = useRef(useCreateTaxCodeStore.getState());
	const createProductUnit = useRef(useCreateProductUnitStore.getState());
	const createVendorView = useRef(useCreateVendorsViewStore.getState());

	useEffect(() => {
		const unsubscribeLoading = useLoaderStore.subscribe((state) => {
			loaderRef.current = state;
			setBackdropOpen(state.open);
		});

		const unsubscribeProductForm = useCreateProductStore.subscribe((state) => {
			createProduct.current = state;
			setOpenProductForm(state.open);
		});

		const unsubscribeCustomerForm = useCreateCustomerStore.subscribe((state) => {
			createCustomer.current = state;
			setOpenCustomerForm(state.open);
		});

		const unsubscribePaymentForm = useCreatePaymentStore.subscribe((state) => {
			createPayment.current = state;
			setOpenPaymentForm(state.open);
		});
		const unsubscribeVendorsForm = useCreateVendorsStore.subscribe((state) => {
			createVendors.current = state;
			setOpenVendorsForm(state.open);
		});
		const unsubscribeHsnCodeForm = useCreateHsnCodeStore.subscribe((state) => {
			createHsnCode.current = state;
			setOpenHsnCodeForm(state.open);
		});
		const unsubscribeTaxCodeForm = useCreateTaxCodeStore.subscribe((state) => {
			createTaxCode.current = state;
			setOpenTaxCodeForm(state.open);
		});

		const unsubscribeProductUnitForm = useCreateProductUnitStore.subscribe((state) => {
			createProductUnit.current = state;
			setOpenProductUnitForm(state.open);
		});
		const unsubscribeVendorViewForm = useCreateVendorsViewStore.subscribe((state) => {
			createVendorView.current = state;
			setOpenVendorViewForm(state.open);
		});

		return () => {
			unsubscribeLoading();
			unsubscribeProductForm();
			unsubscribeCustomerForm();
			unsubscribePaymentForm();
			unsubscribeVendorsForm();
			unsubscribeHsnCodeForm();
			unsubscribeTaxCodeForm();
			unsubscribeProductUnitForm();
			unsubscribeVendorViewForm();
		};
	}, []);

	return (
		<>
			<AppContainer />
			<ToastContainer
				position="top-right"
				autoClose={5000}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				stacked
			/>
			<Backdrop
				sx={{
					color: "custom.white",
					zIndex: (theme) => Math.max.apply(Math, Object.values(theme.zIndex)) + 1,
				}}
				open={backdropOpen}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
			<ConfirmDialog />
			<ProductDrawer open={openProductForm} handleClose={handleCloseProductForm} />
			<CustomerDrawer open={openCustomerForm} handleClose={handleCloseCustomerForm} />
			<PaymentDrawer open={openPaymentForm} handleClose={handleClosePaymentForm} />
			<VendorsDrawer open={openVendorsForm} handleClose={handleCloseVendorsForm} />
			<GateWayDialog open={openGateWayForm} handleClose={handleCloseGateWayForm} />
			<HsnCodeDrawer open={openHsnCodeForm} handleClose={handleCloseHsnCodeForm} />
			<TaxCodeDrawer open={openTaxCodeForm} handleClose={handleCloseTaxCodeForm} />
			<ProductUnitDrawer open={openProductUnitForm} handleClose={handleCloseProductUnitForm} />
			<VendorViewDialog open={openVendorViewForm} handleClose={handleCloseVendorViewForm} />
		</>
	);
}

export default App;
