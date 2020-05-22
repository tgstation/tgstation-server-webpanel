import IHttpClient from './IHttpClient';

class HttpClient implements IHttpClient {
    public readonly serverUrl: string;

    public constructor(serverUrl: string, private readonly basePath: string) {
        this.serverUrl = serverUrl;
    }

    public runRequest(
        route: string,
        requestInfo?: RequestInit,
        fullRoute?: boolean
    ): Promise<Response> {
        if (!fullRoute && this.serverUrl) {
            route = this.serverUrl + this.basePath + route;
            requestInfo = requestInfo || {};
            requestInfo.mode = 'cors';
        }
        return fetch(route, requestInfo);
    }
}

export default HttpClient;
