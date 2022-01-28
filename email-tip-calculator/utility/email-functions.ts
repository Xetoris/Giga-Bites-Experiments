import {gmail_v1} from '@googleapis/gmail';
import log, {Logger} from 'loglevel';

/**
 * Iterates through a message to attempt to find the html payload.
 *
 * @remarks
 * 	Uses a recursive function to find the correct message part that contains the desired html. If found, it will base64
 * 	decode the content into the desired string.
 *
 * @param message - The message instance to search.
 * @param logger - [Optional] Logger instance for output.
 *
 * @returns HTML body of the message or null.
 */
function findHtmlMessage(message: gmail_v1.Schema$Message, logger: Logger = null): string | null {
	const targetContent = findHtmlPartRecursively(message.payload);
	let result: string;

	if (targetContent?.data) {
		try {
			result = Buffer.from(targetContent.data, 'base64').toString();
		} catch {
			if (logger) {
				log.warn('Failure decoding the HTML content!');
			}
		}
	}

	return result;
}

/**
 * Finds a message part whose mime type is 'text/html'.
 *
 * @remarks
 * 	Recursively navigates the tree structure checking mime types. For each node, if it is not the correct node then it
 * 	will check its children for one whose mime type is 'multipart/text'. It invokes the function again it finds one.
 *
 * @param part - The message part to consider.
 *
 * @returns The desired message part or null.
 */
function findHtmlPartRecursively(part: gmail_v1.Schema$MessagePart): gmail_v1.Schema$MessagePartBody | null {
	let result: gmail_v1.Schema$MessagePartBody = null;

	if (part.mimeType == 'text/html') {
		result = part.body;
	} else if (part.parts) {
		const possibleSubParts = part.parts.filter(x => /^(multipart|text)/i.test(x.mimeType));
		for (const subPart of possibleSubParts) {
			result = findHtmlPartRecursively(subPart);

			if (result) break;
		}
	}

	return result;
}

export {
	findHtmlMessage
};
