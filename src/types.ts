import {IncomingMessage, ServerResponse} from 'http';

export type teda = (req: IncomingMessage, res: ServerResponse, next: Function) => void;

export type Factory = (format?: string, config?: Config) => teda;

export type Adapter = (string: string) => void;

export type Config = {
    skip?: (req: IncomingMessage) => boolean,
    adapter?: Adapter,
}
