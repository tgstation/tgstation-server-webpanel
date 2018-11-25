interface IHttpClient {
    runRequest(route: string, requestInfo?: RequestInit, fullRoute?: boolean): Promise<Response>;
}

export default IHttpClient;
