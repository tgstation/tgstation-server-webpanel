import IHttpClient from "./IHttpClient";

class HttpClient implements IHttpClient {
    private readonly serverUrl: string;

    constructor(serverUrl: string){
        this.serverUrl = serverUrl;
    }

    public runRequest(route: string, requestInfo?: RequestInit): Promise<Response> {
        return fetch(this.serverUrl + route, requestInfo);
    }
}

export default HttpClient;
