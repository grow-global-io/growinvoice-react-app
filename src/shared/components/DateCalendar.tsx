import { TextField } from "@mui/material";
import React from "react";
import DatePicker, { Calendar, DayRange } from "@hassanmojab/react-modern-calendar-datepicker";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";

export function DateCalander({
	dayRange,
	setDayRange,
	setDisplayToday,
	textFieldRequired = true,
}: {
	dayRange: DayRange;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setDayRange: React.SetStateAction<any>;
	setDisplayToday?: (value: React.SetStateAction<boolean>) => void;
	textFieldRequired?: boolean;
}) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderCustomInput = ({ ref }: { ref: React.Ref<any> }) => (
		<TextField
			autoComplete="off"
			ref={ref} // necessary
			onClick={() => {
				if (setDisplayToday) {
					setDisplayToday(false);
				}
			}}
			value={
				dayRange.from != null && dayRange.to != null
					? `${JSON.stringify(dayRange.from.month)}` +
						"/" +
						`${JSON.stringify(dayRange.from.day)}` +
						"/" +
						`${JSON.stringify(dayRange.from.year)}` +
						" - " +
						`${JSON.stringify(dayRange.to.month)}` +
						"/" +
						`${JSON.stringify(dayRange.to.day)}` +
						"/" +
						`${JSON.stringify(dayRange.to.year)}`
					: ""
			}
			placeholder=""
			label={undefined}
			fullWidth
		/>
	);
	return (
		<>
			{textFieldRequired ? (
				<DatePicker
					value={dayRange}
					colorPrimary="#054c5c" // added this
					colorPrimaryLight="#b8f2ff"
					calendarPopperPosition={"bottom"}
					onChange={setDayRange}
					renderInput={renderCustomInput}
					shouldHighlightWeekends
				/>
			) : (
				<Calendar
					value={dayRange}
					onChange={setDayRange}
					colorPrimary="#054c5c" // added this
					colorPrimaryLight="#b8f2ff"
				/>
			)}
		</>
	);
}
