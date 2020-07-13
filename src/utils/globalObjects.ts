//this should be a proper data store thing eventually but it will do 4 now
import Translation from "../translations/Translation";

//TODO: get a proper data storage solution
export interface GlobalObjects {
    translation: Translation;
}

export const GlobalObjects = {};
