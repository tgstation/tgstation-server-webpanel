interface IHttpClient {
    readonly serverUrl: string;

    runRequest(
        route: string,
        requestInfo?: RequestInit,
        fullRoute?: boolean
    ): Promise<Response>;
}

export default IHttpClient;
