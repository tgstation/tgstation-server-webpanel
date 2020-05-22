```typescript
    public async doSomething(someData: ParameterModel): Promise< InternalStatus<ReturnedSchema, GenericErrors | ErrorCode.SOME_ERROR>> {
        let response;
        try {
            response = await ServerClient.apiClient.OperationID({}, someData);
        } catch (stat) {
            return new InternalStatus<ReturnedSchema, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const thing = response.data as ReturnedSchema;
                //process data
                return new InternalStatus<ReturnedSchema, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: thing
                });
            }
            case 419: {
                const info = response.data as ProblemDetails;
                return new InternalStatus<User, ErrorCode.SOME_ERROR>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.SOME_ERROR, info)
                });
            }
            default: {
                return new InternalStatus<ReturnedSchema, ErrorCode.UNHANDLED_RESPONSE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.UNHANDLED_RESPONSE, response)
                });
            }
        }
    }
```

```typescript
    public async login(
            newCreds?: ICredentials
        ): Promise<
            InternalStatus<
                Token,
                | GenericErrors
                | ErrorCode.LOGIN_DISABLED
                | ErrorCode.LOGIN_FAIL
                | ErrorCode.LOGIN_NOCREDS
            >
        > {
            if (newCreds) {
                this.logout();
                this.credentials = newCreds;
            }
            if (!this.credentials)
                return new InternalStatus<Token, ErrorCode.LOGIN_NOCREDS>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.LOGIN_NOCREDS)
                });

            let response;
            try {
                response = await this.apiClient.HomeController_CreateToken({}, null, {
                    auth: {
                        username: this.credentials.userName,
                        password: this.credentials.password
                    }
                });
            } catch (stat) {
                return new InternalStatus<Token, GenericErrors>({
                    code: StatusCode.ERROR,
                    error: stat as InternalError<GenericErrors>
                });
            }

            switch (response.status) {
                case 200: {
                    const token = response.data as Token;
                    this._token = token;
                    /*if (token.expiresAt) {
                        const expiry = new Date(token.expiresAt);
                        const refreshtime = new Date(expiry.getTime() - 60000); //1 minute before expiry
                        const delta = refreshtime.getTime() - new Date().getTime(); //god damn, dates are hot garbage, get the ms until the refresh time
                        setInterval(() => this.login(), delta); //this is an arrow function so that "this" remains set
                    }*/
                    this.refreshServerInfo().then(() => {
                        this.emit('loginSuccess', token);
                    });
                    return new InternalStatus<Token, ErrorCode.OK>({
                        code: StatusCode.OK,
                        payload: token
                    });
                }
                default: {
                    return new InternalStatus<Token, ErrorCode.UNHANDLED_RESPONSE>({
                        code: StatusCode.ERROR,
                        error: new InternalError(ErrorCode.UNHANDLED_RESPONSE, response)
                    });
                }
            }
        }
```