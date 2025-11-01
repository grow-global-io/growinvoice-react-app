import React, { useState } from "react";
import { read, utils } from "xlsx";
import * as yup from "yup";

interface IExcelReader<T> {
	validationSchema: yup.Schema<T>;
}

interface IExcelError {
	id: number;
	error: yup.ValidationError;
}

export type UploadStatus = "pending" | "uploaded" | "error";

export function useExcelReader<T>({ validationSchema }: IExcelReader<T>) {
	const [rows, setRows] = useState<
		(T & { id: number | string; status: UploadStatus; reason?: string })[]
	>([]);
	const [errors, setErrors] = useState<IExcelError[]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = e.target?.result;
			const workbook = read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			console.log({ sheetName });
			const sheet = workbook.Sheets[sheetName];

			const rows = utils.sheet_to_json(sheet, {
				blankrows: false,
				defval: null,
				dateNF: "yyyy-mm-dd",
			});

			setTotalRows(rows.length);
			validateData(rows);
		};
		reader.readAsBinaryString(file);
	};

	const validateData = async (rows: unknown[]) => {
		try {
			const promises = rows.map(async (row, index) => {
				try {
					await validationSchema.validate(row, { abortEarly: false });
					const castedRow = validationSchema.cast(row);
					return castedRow;
				} catch (validationErrors) {
					if (validationErrors instanceof yup.ValidationError) {
						setErrors((prev) => [
							...prev,
							{ id: index + 1, error: validationErrors as yup.ValidationError },
						]);
					}
					return null;
				}
			});
			const results = await Promise.all(promises);
			const validRows = results.filter((result) => result !== null) as T[];
			setRows(validRows.map((row, index) => ({ ...row, id: index + 1, status: "pending" })));
		} catch (error) {
			console.log("[useExcelReader] validateData error: ", error);
		}
	};

	const reset = () => {
		setRows([]);
		setErrors([]);
	};

	return { rows, errors, handleFileChange, reset, totalRows, setRows };
}
