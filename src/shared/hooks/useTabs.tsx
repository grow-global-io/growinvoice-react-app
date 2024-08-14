import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useTabs = (searchParam = "tab") => {
	const [tabValue, setTabValue] = React.useState(0);
	const navigate = useNavigate();

	const query = new URLSearchParams(window.location.search);
	const tab = query.get(searchParam);
	useEffect(() => {
		if (tab && !isNaN(parseInt(tab))) {
			setTabValue(parseInt(tab));
		}
	}, [tab]);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		const query = new URLSearchParams(window.location.search);
		if (query.has(searchParam)) {
			query.set(searchParam, newValue.toString());
		} else {
			query.append(searchParam, newValue.toString());
		}
		navigate(`?${query.toString()}`, { replace: true });
	};

	return {
		tabValue,
		handleChange,
		setTabValue,
	};
};
