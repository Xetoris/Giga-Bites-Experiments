import { auth, gmail, gmail_v1 } from "@googleapis/gmail";
import { GaxiosError } from 'gaxios';
import { Credentials, OAuth2Client } from "google-auth-library";
import { APIEndpoint } from "googleapis-common";
import { readFile, writeFile } from "node:fs/promises";
import * as readline from "node:readline";
import { promisify } from "util";

export class GoogleClient {
    private readonly credPath: string;
    private readonly tokenPath: string;
    private readonly scopes: string[] = ['https://www.googleapis.com/auth/gmail.readonly'];
    private apiClient: APIEndpoint;

    constructor(credentialPath: string, tokenStorePath: string) {
        this.credPath = credentialPath;
        this.tokenPath = tokenStorePath;
    }

    async getMessages(query: string, continuationToken?: string): Promise<gmail_v1.Schema$ListMessagesResponse> {
        const apiClient = await this.getAPIEndpoint();
        const messages = await apiClient.users.messages.list({
            userId: 'me',
            q: query,
            pageToken: continuationToken
        });

        return messages.data;
    }

    async getMessageBody(id: string): Promise<gmail_v1.Schema$Message | null> {
        const apiClient = await this.getAPIEndpoint();

        const resp = await apiClient.users.messages.get({
            userId: 'me',
            id: id
        });

        return resp?.data;
    }

    private async getAPIEndpoint(): Promise<APIEndpoint> {
        if(!this.apiClient) {
            const client = await this.getAuthedClient();

            this.apiClient = gmail({version: 'v1', auth: client});
        }

        return this.apiClient;
    }

    private async getAuthedClient(): Promise<OAuth2Client> {
        const credFileContents = await GoogleClient.readSecretsFile(this.credPath);
        const {client_secret, client_id, redirect_uris} = credFileContents.installed;
        const client = new auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        let accessToken = await GoogleClient.readTokenFile(this.tokenPath);
        if (!accessToken) {
            accessToken = await GoogleClient.promptUserForAccess(client, this.scopes);

            await GoogleClient.writeTokenFile(this.tokenPath, accessToken);
        }

        client.setCredentials(accessToken);

        return client;
    }

    private static async readSecretsFile(secretFilePath: string): Promise<any> {
        const fileContents = await readFile(secretFilePath);

        return JSON.parse(fileContents.toString());
    }

    private static async readTokenFile(tokenFilePath: string): Promise<any | null> {
        let response = null;

        try {
            const fileContents = await readFile(tokenFilePath);

            response = JSON.parse(fileContents.toString());
        } catch {
            console.log('Unable to access token storage file. Will attempt fetching a fresh token.');
        }

        return response;
    }

    private static async writeTokenFile(tokenFilePath: string, token: Credentials) {
        try {
            await writeFile(tokenFilePath, JSON.stringify(token));

            console.log(`Successfully stored token!\n ${tokenFilePath}`);
        } catch {
            console.log("Failed to persist token file. You'll be prompted for authentication again next time!");
        }
    }

    private static async promptUserForAccess(client: OAuth2Client, scopes: string[]): Promise<Credentials | null> {
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });

        let authCode;
        let rl: readline.Interface;
        try {
            console.log(`Please visit this url and authorize the app.\n It will give you a short code to enter.\n Auth Url: ${authUrl}`);

            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const questionPromise = promisify(rl.question).bind(rl);
            authCode = await questionPromise('Please enter the code here:');
        } finally {
            console.log('Thank you for attempting the authentication process!\nIf you still have the authentication link tab open, please close it! DO NOT LEAVE IT OPEN!');
            rl.close();
        }


        let token: Credentials;

        try {
            let tokenResponse = await client.getToken(authCode);
            token = tokenResponse.tokens;
        } catch (e: any) {
            console.log('Error requesting auth token!');

            if (e instanceof GaxiosError) {
                console.log(`API returned: ${e.response.data.error_description}`);
            }
        }

        return token;
    }
}