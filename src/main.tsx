import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { environment } from "@enviroment";
import { ErrorBoundary } from "react-error-boundary";
import InternalServerErrorPage from "@pages/InternalServerErrorPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import i18n from "./i18s"; // Initialize translations

import { registerSW } from "virtual:pwa-register";

// 3. Call registerSW and use its callbacks
const updateSW = registerSW({
	onNeedRefresh() {
		// This replaces your 'config.onUpdate(registration)'
		// Show a prompt to the user
		if (confirm("New content available! Do you want to reload?")) {
			// This sends the 'SKIP_WAITING' message
			updateSW(true);
		}
	},
	onOfflineReady() {
		// This replaces your 'config.onSuccess(registration)'
		console.log("App is ready to work offline.");
	},
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			staleTime: 1 * 60 * 60 * 1000, // 1 hour
			retry: false,
		},
	},
});

const RootApp = () => {
	const [appTheme, setAppTheme] = React.useState(createAppTheme());

	React.useEffect(() => {
		const updateTheme = () => {
			// Small delay to ensure i18n is ready
			setTimeout(() => {
				setAppTheme(createAppTheme());
			}, 100);
		};

		const handler = () => updateTheme();

		// Listen for language changes
		i18n.on("languageChanged", handler);

		// Listen for when translations are loaded
		i18n.on("loaded", handler);

		// Update theme after a short delay to ensure i18n is initialized
		updateTheme();

		return () => {
			i18n.off("languageChanged", handler);
			i18n.off("loaded", handler);
		};
	}, []);

	// Validate Google Client ID
	const googleClientId = environment.clientId;
	if (!googleClientId && !environment.production) {
		console.warn(
			"Google OAuth Client ID is missing. Please add VITE_GOOGLE_CLIENT_ID to your .env file.",
		);
	}

	return (
		<React.StrictMode>
			{googleClientId ? (
				<GoogleOAuthProvider clientId={googleClientId}>
					<QueryClientProvider client={queryClient}>
						<ThemeProvider theme={appTheme}>
							<BrowserRouter>
								<ErrorBoundary FallbackComponent={InternalServerErrorPage}>
									<App />
								</ErrorBoundary>
							</BrowserRouter>
						</ThemeProvider>
						{!environment.production && <ReactQueryDevtools />}
					</QueryClientProvider>
				</GoogleOAuthProvider>
			) : (
				<QueryClientProvider client={queryClient}>
					<ThemeProvider theme={appTheme}>
						<BrowserRouter>
							<ErrorBoundary FallbackComponent={InternalServerErrorPage}>
								<App />
							</ErrorBoundary>
						</BrowserRouter>
					</ThemeProvider>
					{!environment.production && <ReactQueryDevtools />}
				</QueryClientProvider>
			)}
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<RootApp />);
