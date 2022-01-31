import { TokenResponse } from "../generatedcode/generated";

/**
 * Class for DIRECTLY ACCESSING token information.
 * It is preferable that you do NOT use this and instead use AuthController
 */
export default new (class AuthController {
    public token?: TokenResponse;
    public lastToken?: TokenResponse;
})();
