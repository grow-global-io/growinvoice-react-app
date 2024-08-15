import { environment } from "@enviroment";
import axios from "axios";

export const http = axios.create({
	baseURL: environment.baseUrl,
	maxRedirects: 0,  // Prevent following redirects to HTTPS
    // Optionally, add timeout and other settings if needed
    timeout: 10000, // for example, set a timeout of 10 seconds

});
