import { Byond } from './generated';

import TgsResponse from '../models/TgsResponse';

export default interface IByondClient {
    read(): TgsResponse<Byond>;
}
