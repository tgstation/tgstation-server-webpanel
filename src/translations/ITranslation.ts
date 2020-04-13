import ILocalization from "./ILocalization";
import { ErrorCode } from '../clients/generated';

interface ITranslation {
  readonly locale: string;
  readonly messages: ILocalization;

  forErrorCode(errorCode: ErrorCode, serverMessage?: string): string;
}

export default ITranslation;
