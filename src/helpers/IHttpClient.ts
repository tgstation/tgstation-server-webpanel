interface IHttpClient {
    runRequest(url: string, requestInfo?: RequestInit): Promise<Response>;
}

export default IHttpClient;
