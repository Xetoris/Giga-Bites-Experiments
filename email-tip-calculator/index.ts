import {gmail_v1} from '@googleapis/gmail';
import currency from 'currency.js';
import logger from 'loglevel';

import {GoogleClient} from './clients/index.js';
import {
	findHtmlMessage,
	getQueryFormattedString,
	getRelativeFutureDate
} from './utility/index.js';

const TIP_XML_REGEX = /<tr><td.*>Tip<\/td><td><\/td><td><\/td><td>\$(\d+)\.(\d+)<\/td><\/tr>/i;

let tipTotal = new currency('0.00');

const client = new GoogleClient('./config/client_secret.json', './config/access_token.json');

const queryTargetDate = new Date();
const startSearchDate = getQueryFormattedString(queryTargetDate);
const endSearchDate = getQueryFormattedString(getRelativeFutureDate(queryTargetDate, 1));

const messageQueryText = `"GIGA BITES CAFE - Transaction Receipt" after:${startSearchDate} before:${endSearchDate}`;

let messageQueryResponse: gmail_v1.Schema$ListMessagesResponse;
let totalProcessing = 0;

logger.setLevel('info');

logger.info('Starting Tip fetching and calculation!');

do {
	messageQueryResponse = await client.getMessages(
		messageQueryText,
		messageQueryResponse?.nextPageToken
	);

	if (!messageQueryResponse.messages || messageQueryResponse.messages.length < 0) {
		logger.info('No Tip messages located.');
		break;
	}

	for (const message of messageQueryResponse.messages) {
		logger.info(`Processing: ${++totalProcessing} of ${messageQueryResponse.resultSizeEstimate}`);
		try {
			const messageBody = await client.getMessageBody(message.id);

			const html = findHtmlMessage(messageBody, logger);
			const xmlMatches = TIP_XML_REGEX.exec(html);

			const dollar = xmlMatches[1];
			const cent = xmlMatches[2];

			tipTotal = tipTotal.add(`${dollar}.${cent}`);
		} catch {
			logger.warn(`Encountered error processing message! [Id: ${message.id}]`);
		}
	}

} while (messageQueryResponse.nextPageToken);

logger.info(`Final Tip Total: ${tipTotal.format()}`);
