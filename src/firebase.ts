import { environment } from "@enviroment";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: environment.firebase.apiKey,
	authDomain: environment.firebase.authDomain,
	projectId: environment.firebase.projectId,
	storageBucket: environment.firebase.storageBucket,
	messagingSenderId: environment.firebase.messagingSenderId,
	appId: environment.firebase.appId,
	measurementId: environment.firebase.measurementId,
};
console.log("firebaseConfig", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
