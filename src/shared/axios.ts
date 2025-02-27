import { environment } from "@enviroment";
import axios from "axios";

export const http = axios.create({
	baseURL: environment.baseUrl,
});
