import ILocalization from "./ILocalization";

interface ITranslation {
  readonly locale: string;
  readonly messages: ILocalization;

  Load(): Promise<void>;
}

export default ITranslation;
