import { TextField } from "@mui/material";
import React from "react";
import { type DayRange } from "@hassanmojab/react-modern-calendar-datepicker";

export function DateCalander({
	dayRange,
	setDayRange: _setDayRange,
	setDisplayToday,
	textFieldRequired: _textFieldRequired = true,
}: {
	dayRange?: DayRange | null;
	// eslint-disable-next-line
	setDayRange: React.SetStateAction<any>;
	setDisplayToday?: (value: React.SetStateAction<boolean>) => void;
	textFieldRequired?: boolean;
}) {
	// Format date range for display
	const formatDateRange = (): string => {
		// Handle null/undefined dayRange
		if (!dayRange) {
			return "";
		}

		// Handle null from/to
		if (!dayRange.from || !dayRange.to) {
			return "";
		}

		const from = dayRange.from;
		const to = dayRange.to;

		// Validate that from and to are objects with required properties
		if (
			typeof from === "object" &&
			from !== null &&
			from.day != null &&
			from.month != null &&
			from.year != null &&
			typeof to === "object" &&
			to !== null &&
			to.day != null &&
			to.month != null &&
			to.year != null
		) {
			return `${from.month}/${from.day}/${from.year} - ${to.month}/${to.day}/${to.year}`;
		}

		return "";
	};

	const displayValue = formatDateRange();

	return (
		<TextField
			fullWidth
			value={displayValue}
			placeholder="Date range will be displayed here"
			disabled
			onClick={() => {
				if (setDisplayToday) {
					setDisplayToday(false);
				}
			}}
		/>
	);
}
