import React from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { authControllerVerifyGoogleToken } from "@api/services/auth";
import { useAuthStore } from "@store/auth";
import { AlertService } from "@shared/services/AlertService";

const SigninWithGoogle = () => {
	const { setToken } = useAuthStore();
	const handleSuccess = async (credentialResponse: CredentialResponse) => {
		if (!credentialResponse.credential) return;
		try {
			const a = await authControllerVerifyGoogleToken({
				token: credentialResponse.credential,
			});
			if (!a) throw new Error("No auth token");
			setToken(a.authToken);
		} catch (error) {
			AlertService.instance.errorMessage("Email not registered");
		}
	};

	const handleError = () => {
		AlertService.instance.errorMessage("Login Failed");
	};
	return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default SigninWithGoogle;
