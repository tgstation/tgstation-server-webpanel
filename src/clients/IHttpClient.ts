interface IHttpClient {
    runRequest(route: string, requestInfo?: RequestInit): Promise<Response>;
}

export default IHttpClient;
