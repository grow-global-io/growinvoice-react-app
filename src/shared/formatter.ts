import { Day } from "react-modern-calendar-datepicker";
import moment, { Moment } from "moment";
import "moment-timezone";

export const parseDateStringToFormat = (date: string | number, format?: string) => {
	if (!format) {
		format = "MM/DD/YYYY";
	}

	if (typeof date === "string") {
		return moment(date).format(format);
	}
	return moment(date * 1000).format(format);
};

export const parseDateToFormat = (date: Date | string, format?: string) => {
	if (!format) {
		format = "MM/DD/YYYY";
	}

	return moment(date).format(format);
};

// currency formatter
export const formatCurrency = (value: number, currency?: string) => {
	if (!currency) {
		currency = "USD";
	}

	return value.toLocaleString("en-US", {
		style: "currency",
		currency: currency,
	});
};

// dob to age
export const parseDateToAge = (date?: string) => {
	if (!date) {
		return 0;
	}
	const dob = moment(date, "YYYY-MM-DD");
	return moment().diff(dob, "years");
};

// parse Time slot to time
export const parseTimeSlotToTime = (timeSlot?: string, startTimeOnly?: boolean) => {
	if (!timeSlot) {
		return "00:00";
	}
	const time = timeSlot.split("-");

	// convert to 12 hour format
	const startTime = moment(time[0], "HH:mm").format("hh:mm A");
	const endTime = moment(time[1], "HH:mm").format("hh:mm A");
	if (startTimeOnly) {
		return `${startTime}`;
	} else {
		return `${startTime} - ${endTime}`;
	}
};

// parse Time slot to times object
// contains hours and minutes of start and end time
export const splitTimeSlotToTimes = (timeSlot?: string) => {
	if (!timeSlot) {
		return {
			startTime: {
				hours: 0,
				minutes: 0,
			},
			endTime: {
				hours: 0,
				minutes: 0,
			},
		};
	}

	const time = timeSlot.split("-");
	const startTime = moment(time[0], "HH:mm");
	const endTime = moment(time[1], "HH:mm");

	return {
		startTime: {
			hours: startTime.hours(),
			minutes: startTime.minutes(),
		},
		endTime: {
			hours: endTime.hours(),
			minutes: endTime.minutes(),
		},
	};
};

// get appointment timestamp from date and slot
export const getAppointmentTimestamp = (date: string, slot: string): Date => {
	const { startTime } = splitTimeSlotToTimes(slot);
	const appointmentDate = moment(date, "YYYY-MM-DD");
	appointmentDate.set({
		hours: startTime.hours,
		minutes: startTime.minutes,
		seconds: 0,
		milliseconds: 0,
	});
	return appointmentDate.toDate();
};

export const diffInMinutes = (date1: Date, date2: Date) => {
	return moment(date1).diff(moment(date2), "minutes");
};

export const getCurrentWeek = () => {
	const curr = new Date();
	const day = curr.getDay();
	const firstday = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000); //will return firstday (ie sunday) of the week
	const lastday = new Date(firstday.getTime() + 60 * 60 * 24 * 6 * 1000);

	return { weekStart: firstday, weekEnd: lastday };
};

export const getDayRange = (date: Date | string | Moment) => {
	const dateMonth = moment(date).month() + 1;
	const dateYear = moment(date).year();
	const dateDate = moment(date).date();
	return {
		year: dateYear,
		month: dateMonth,
		day: dateDate,
	};
};

export const getComapreDates = (date: Date | string | Moment, date1: Date | string | Moment) => {
	const firstDate = moment(date);
	const secondDate = moment(date1);

	// Compare the dates
	if (firstDate.isBefore(secondDate)) {
		return 0;
	} else if (firstDate.isAfter(secondDate)) {
		return 1;
	} else {
		return NaN;
	}
};

export const getDatesTimeFormat = (date: Date | string | Moment, timezone: string) => {
	return moment(date).tz(timezone).format("MM/DD/YYYY");
};

// convert seconds to mins
export const formatTime = (seconds: number) => {
	if (!seconds) {
		return "0 min";
	}
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes} min ${remainingSeconds} sec`;
};

//
export function formatDateToDateHours(date: string, time: string) {
	const [startTime, endTime] = time.split("-");

	const startDateFormat = moment(`${date}T${startTime}`, "YYYY-MM-DDTHHmm").format(
		"YYYY-MM-DDTHH:mm",
	);
	const endDateFormat = moment(`${date}T${endTime}`, "YYYY-MM-DDTHHmm").format("YYYY-MM-DDTHH:mm");

	return { startDateFormat, endDateFormat };
}

export function getClientSlotTime(date: string, time: string, timeZone: string) {
	const formatDate = moment(date).format("YYYY-MM-DD");
	const { startDateFormat, endDateFormat } = formatDateToDateHours(formatDate, time);
	const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	function convertTimeToClientSlot(dateFormat: string) {
		return moment
			.tz(dateFormat, timeZone || clientTimezone)
			.tz(clientTimezone)
			.format("HH:mm");
	}

	const StartClientSlot = convertTimeToClientSlot(startDateFormat);
	const EndClientSlot = convertTimeToClientSlot(endDateFormat);

	return `${StartClientSlot}-${EndClientSlot}`;
}

export function getClientDate(dateTime: string, timeZone: string, format: string) {
	// date time format should be YYYY-MM-DDTHH:mm
	const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	return moment.tz(dateTime, timeZone).tz(clientTimezone).format(format);
}

export function getCurrentTimeStamp(format?: string) {
	if (!format) {
		return moment().format("YYYY-MM-DD") + "T00:00:00.000Z";
	}
	return format.includes("T00:00") ? format : moment().format(format);
}

export const formatToIso = (date: string | null | undefined) => {
	if (!date) {
		return "";
	}
	const isValidate = moment(date, "YYYY-MM-DD").isValid();
	if (date.includes("T00:00:00")) {
		return date;
	} else if (isValidate) {
		return date + "T00:00:00.000Z";
	}
	console.warn("Invalid date format");
	return date;
};

export const formatDateToIso = (date: Date | null | undefined | string) => {
	if (!date) {
		return "";
	}
	const stringDate = moment(date).format("YYYY-MM-DD");
	if (stringDate) {
		return stringDate + "T00:00:00.000Z";
	}
	console.warn("Invalid date format");
	return stringDate;
};

export const convertUtcToFormat = (utcTime: Date | string, format?: string) => {
	if (!format) {
		format = "MM/DD/YYYY";
	}
	if (format === "iso") {
		return moment.utc(utcTime).toISOString();
	}
	return moment.utc(utcTime).format(format);
};

export const convertDayToDate = (date: Day) => {
	const currentMoment = moment();
	const combinedDateTime = moment(`${date.year}-${date.month}-${date.day}`).set({
		hour: currentMoment.hours(),
		minute: currentMoment.minutes(),
		second: currentMoment.seconds(),
		millisecond: currentMoment.milliseconds(),
	});
	const utcOffset = currentMoment.utcOffset();
	return combinedDateTime.subtract(utcOffset, "minutes").format("YYYY-MM-DD");
};

export function timeAgo(isoString: string): string {
	const currentDate = new Date();
	const inputDate = new Date(isoString);
	const timeDifference = currentDate.getTime() - inputDate.getTime();
	const minutes = Math.floor(timeDifference / (1000 * 60));
	const hours = Math.floor(minutes / 60);

	if (minutes < 1) {
		return "Just now";
	} else if (minutes < 60) {
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	} else if (hours < 24) {
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	} else {
		const days = Math.floor(hours / 24);
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	}
}

export const currencyFormatter = (money: number, currency?: string) => {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency ?? "INR",
		}).format(money);
	} catch (error) {
		console.error(error);
		return money;
	}
};

export function snakeToReadableText(snakeStr: string): string {
	return snakeStr
		.split("_") // Split the string by underscores
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
		.join(" "); // Join the words with spaces
}
