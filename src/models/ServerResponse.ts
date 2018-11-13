import IErrorMessage from "./IErrorMessage";

class ServerResponse<TModel> {
    public readonly response: Response;
    private model: TModel;

    constructor(response: Response) {
        this.response = response;
    }

    public async getModel(): Promise<TModel> {
        if (!this.response.ok)
            throw new Error("Tried to read a non-ok response model!")
        const json = await this.response.json();
        return json as TModel;
    }

    public async getError(): Promise<string> {
        if (this.response.status === 500) {
            const newWindow = window.open();
            if (newWindow != null)
                newWindow.document.write(await this.response.text());
            return "An internal server error occurred!";
        }
        try {
            const json = await this.response.json();
            const errorMessage = json as IErrorMessage;
            if (errorMessage.message)
                return "HTTP " + this.response.status + "(Server API: " + errorMessage.serverApiVersion + "): " + errorMessage.message;
            return this.response.statusText;
        } catch (e) {
            return this.response.statusText;
        }
    }
}

export default ServerResponse;
