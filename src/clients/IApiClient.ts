interface IApiClient {
    makeApiRequest(route: string, verb: string, body?: any): Promise<Response>;
}

export default IApiClient;
