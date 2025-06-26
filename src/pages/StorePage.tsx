import React from "react";
import StoreMain from "../features/Store/StoreMain";
import { useParams } from "react-router-dom";
import NoDataFound from "@shared/components/NoDataFound";

const StorePage = () => {
	const { userId } = useParams<{ userId: string }>();
	if (!userId) {
		return <NoDataFound message="User is required to access the store." />;
	}
	return <StoreMain userId={userId} />;
};

export default StorePage;
