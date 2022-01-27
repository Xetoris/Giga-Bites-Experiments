import { gmail_v1 } from '@googleapis/gmail'
import log, { Logger } from 'loglevel';

function findHtmlMessage(message: gmail_v1.Schema$Message, logger: Logger = null): string | null {
    let targetContent = findHtmlPartRecursively(message.payload);
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

function findHtmlPartRecursively(part: gmail_v1.Schema$MessagePart): gmail_v1.Schema$MessagePartBody | null {
    let result: gmail_v1.Schema$MessagePartBody = null;

    if (part.mimeType == 'text/html') {
        result = part.body;
    } else if (part.parts) {
        let possibleSubParts = part.parts.filter(x => /^(multipart|text)/i.test(x.mimeType));
        for (let subPart of possibleSubParts) {
            result = findHtmlPartRecursively(subPart);

            if (result) break;
        }
    }

    return result;
}

export {
    findHtmlMessage
}