import IHttpClient from "./IHttpClient";

class HttpClient implements IHttpClient {
    public runRequest(url: string, requestInfo?: RequestInit): Promise<Response> {
        return fetch(url, requestInfo);
    }
}

export default HttpClient;
