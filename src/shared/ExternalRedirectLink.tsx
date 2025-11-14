import { useEffect } from "react";

const ExternalRedirect = ({ to }: { to: string }) => {
	useEffect(() => {
		// Use window.location.replace for a true redirect
		// that doesn't add the old page to the browser history.
		window.location.replace(to);
	}, [to]);

	// Return null or a loading indicator while the redirect happens
	return null;
};

export default ExternalRedirect;
