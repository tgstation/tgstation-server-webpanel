//this should be a proper data store thing eventually but it will do 4 now
import ServerClient from '../clients/ServerClient';
import Translation from '../translations/Translation';
//TODO: get a proper data storage solution
export interface GlobalObjects {
    darkMode: boolean;
    translation: Translation;
}

export const GlobalObjects = {
    darkMode: true
};
