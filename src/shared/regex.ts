export class RegexExp {
	static readonly phoneNumber = /^[0]?[1-9]\d{9}$/;
	static readonly dateFormat = /^\d{4}-[1-12]\d-[1-31]\d$/;
	static readonly punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	static readonly passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
	static readonly htmlTags = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	static readonly fullNameRegex = /^[A-Za-z\s]+$/;
	static readonly linkRegex = /^(ftp|http|https):\/\/[^ "]+$/;
	static readonly numberRegex = /^(0|[1-9][0-9]*)$/;
}
