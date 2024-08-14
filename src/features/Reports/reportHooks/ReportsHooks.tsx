import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { useEffect, useMemo, useState } from "react";
import { DayRange } from "react-modern-calendar-datepicker";
import { useReportsControllerGetProfitLossRange } from "@api/services/reports";
import { convertUtcToFormat, parseDateStringToFormat } from "@shared/formatter";

const ReportsHooks = () => {
	const [dayRange, setDayRange] = useState<DayRange>({
		from: null,
		to: null,
	});
	const dateRange = useReportsControllerGetProfitLossRange();
	useEffect(() => {
		setDayRange({
			from: {
				day: parseInt(parseDateStringToFormat(dateRange?.data?.start ?? "", "DD")),
				month: parseInt(parseDateStringToFormat(dateRange?.data?.start ?? "", "MM")),
				year: parseInt(parseDateStringToFormat(dateRange?.data?.start ?? "", "YYYY")),
			},
			to: {
				day: parseInt(parseDateStringToFormat(dateRange?.data?.end ?? "", "DD")),
				month: parseInt(parseDateStringToFormat(dateRange?.data?.end ?? "", "MM")),
				year: parseInt(parseDateStringToFormat(dateRange?.data?.end ?? "", "YYYY")),
			},
		});
	}, [dateRange?.data]);

	const fromDate = useMemo(() => {
		if (dayRange.from) {
			return convertUtcToFormat(
				`${dayRange.from.year}-${dayRange.from.month}-${dayRange.from.day}`,
				"iso",
			);
		}
		return "";
	}, [dayRange.from]);

	const toDate = useMemo(() => {
		if (dayRange.to) {
			return convertUtcToFormat(
				`${dayRange.to.year}-${dayRange.to.month}-${dayRange.to.day}`,
				"iso",
			);
		}
		return "";
	}, [dayRange.to]);
	return {
		fromDate,
		toDate,
		dateRange,
		dayRange,
		setDayRange,
	};
};

export default ReportsHooks;
