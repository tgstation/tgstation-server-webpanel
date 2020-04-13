import ServerResponse from './ServerResponse';

export type TgsResponse<TModel> = Promise<ServerResponse<TModel> | null>;
