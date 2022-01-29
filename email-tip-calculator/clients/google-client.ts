import {auth, gmail, gmail_v1} from '@googleapis/gmail';
import {GaxiosError} from 'gaxios';
import {Credentials, OAuth2Client} from 'google-auth-library';
import {APIEndpoint} from 'googleapis-common';
import {Logger} from 'loglevel';
import {readFile, writeFile} from 'node:fs/promises';
import * as readline from 'node:readline';
import {promisify} from 'util';

/**
 * Simple client for interacting with Google's GMAIL API.
 */
export class GoogleClient {
	private readonly credPath: string;
	private readonly tokenPath: string;
	private readonly scopes: string[] = ['https://www.googleapis.com/auth/gmail.readonly'];
	private readonly logger: Logger;
	private apiClient: APIEndpoint;

	constructor(credentialPath: string, tokenStorePath: string, logger: Logger = null) {
		this.credPath = credentialPath;
		this.tokenPath = tokenStorePath;
		this.logger = logger;
	}

	async getMessages(query: string, continuationToken?: string): Promise<gmail_v1.Schema$ListMessagesResponse> {
		const apiClient = await this.getAPIEndpoint(this.logger);
		const messages = await apiClient.users.messages.list({
			userId: 'me',
			q: query,
			pageToken: continuationToken
		});

		return messages.data;
	}

	async getMessageBody(id: string): Promise<gmail_v1.Schema$Message | null> {
		const apiClient = await this.getAPIEndpoint(this.logger);

		const resp = await apiClient.users.messages.get({
			userId: 'me',
			id: id
		});

		return resp?.data;
	}

	private async getAPIEndpoint(logger: Logger = null): Promise<APIEndpoint> {
		if (!this.apiClient) {
			const client = await this.getAuthedClient(logger);

			this.apiClient = gmail({version: 'v1', auth: client});
		}

		return this.apiClient;
	}

	private async getAuthedClient(logger: Logger = null): Promise<OAuth2Client> {
		const credFileContents = await GoogleClient.readSecretsFile(this.credPath);
		const {client_secret, client_id, redirect_uris} = credFileContents.installed;
		const client = new auth.OAuth2(
			client_id,
			client_secret,
			redirect_uris[0]
		);

		let accessToken = await GoogleClient.readTokenFile(this.tokenPath, logger);
		if (!accessToken) {
			accessToken = await GoogleClient.promptUserForAccess(client, this.scopes, logger);

			await GoogleClient.writeTokenFile(this.tokenPath, accessToken, logger);
		}

		client.setCredentials(accessToken);

		return client;
	}

	private static async readSecretsFile(secretFilePath: string): Promise<any> {
		const fileContents = await readFile(secretFilePath);

		return JSON.parse(fileContents.toString());
	}

	private static async readTokenFile(tokenFilePath: string, logger: Logger = null): Promise<any | null> {
		let response = null;

		try {
			const fileContents = await readFile(tokenFilePath);

			response = JSON.parse(fileContents.toString());
		} catch {
			if (logger) {
				logger.debug('Unable to access token storage file. Will attempt fetching a fresh token.');
			}
		}

		return response;
	}

	private static async writeTokenFile(tokenFilePath: string, token: Credentials, logger: Logger = null) {
		try {
			await writeFile(tokenFilePath, JSON.stringify(token));

			if (logger) {
				logger.debug(`Successfully stored token!\n ${tokenFilePath}`);
			}
		} catch {
			if (logger) {
				logger.debug('Failed to persist token file. You\'ll be prompted for authentication again next time!');
			}
		}
	}

	private static async promptUserForAccess(client: OAuth2Client, scopes: string[], logger: Logger = null): Promise<Credentials | null> {
		const authUrl = client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes
		});

		let authCode;
		let rl: readline.Interface;
		try {
			rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			const questionPromise = promisify(rl.question).bind(rl);
			authCode = await questionPromise(`Please visit this url and authorize the app.\n It will give you a short code to enter.\n Auth Url: ${authUrl}\n\nEnter the code here:`);
		} finally {
			if (logger) {
				logger.info('Thank you for attempting the authentication process!\nIf you still have the authentication link tab open, please close it! DO NOT LEAVE IT OPEN!');
			}

			rl.close();
		}


		let token: Credentials;

		try {
			const tokenResponse = await client.getToken(authCode);
			token = tokenResponse.tokens;
		} catch (e: any) {
			if (logger) {
				logger.warn('Error requesting auth token!');
			}

			if (e instanceof GaxiosError) {
				if (logger) {
					logger.error(`API returned: ${e.response.data.error_description}`);
				}
			}
		}

		return token;
	}
}