import {teda, Adapter, Config, Factory} from './types';

const Path = {
    ':method':         ['req', 'method'],
    ':url':            ['req', 'url'],
    ':http-version':   ['req', 'httpVersion'],
    ':user-agent':     ['req', 'headers', 'user-agent'],
    ':status':         ['res', 'statusCode'],
    ':date':           ['date'],
    ':content-length': ['contentLength'],
    ':duration':       ['duration'],
    ':remove-addr':    ['remoteAddr'],
};

const EVENTS = [
    'close',
    'error',
    'finish',
];

const PATTERN_REGEX = /(:\w+[(\-\w+)]+)/g;
const DATE_REGEX = /^\w+\s(\w+)\s(\d{1,2})\s(\d{4})\s(\d{2}:\d{2}:\d{2})\s\w+(\+\d{4})/;

export const Format = {
    DEFAULT: ':remove-addr - [:date] ":method :url HTTP/:http-version" :status :content-length - :duration ms',
    TINY: ':method :url :status :content-length - :duration ms',
};

/**
 *
 * @param format
 * @param config
 */
const factory: Factory = (format: string = Format.DEFAULT, config: Config = null): teda => {
    const {adapter, skip}: Config = {
        adapter: console.log.bind(console),
        skip: () => false,
        ...config,
    };

    /**
     *
     * @param path
     * @param context
     */
    const traverse = (path: Array<string>, context: object): string => (
        path.reduce((acc, step) => acc[step], context)
    );

    /**
     *
     * @param format
     * @param context
     */
    const compile = (format: string, context: object): string => {
        let string = format;
        const parts = string.match(PATTERN_REGEX);

        if (!parts) {
            return string;
        }

        for (const pattern of parts) {
            const path = Path[pattern];

            if (!path) {
                continue;
            }

            let value = traverse(path, context);
            if (value == undefined) {
                value = '[' + pattern + ']';
            }

            string = string.replace(pattern, value);
        }

        return string;
    };

    /**
     *
     */
    return (req, res, next) => {
        if (skip(req)) {
            return next();
        }

        const start = process.hrtime();

        /**
         *
         * @param req
         * @param res
         */
        const log = (req, res): void => {
            const end = process.hrtime(start);

            const context = {
                req,
                res,
                get duration() {
                    return (end[0] * 1e9 + end[1]) / 1e6;
                },
                get contentLength() {
                    const {['content-length']: length} = res.getHeaders();

                    return length;
                },
                get date() {
                    const date = new Date();
                    const [, month, day, year, time, tz] = date.toString()
                        .match(DATE_REGEX)
                    ;

                    return `${day}/${month}/${year} ${time} ${tz}`;
                },
                get remoteAddr() {
                    const {['x-forwarded-for']: addr} = res.getHeaders();

                    return addr || traverse(['socket', 'remoteAddress'], req);
                },
            };

            const line = compile(Format[format] || format, context);

            adapter(line);
        };

        /**
         *
         */
        const onEvent = (): void => {
            for (const event of EVENTS) {
                res.off(event, onEvent);
            }

            log(req, res);
        }

        for (const event of EVENTS) {
            res.on(event, onEvent);
        }

        return next();
    };
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 23.03.2021
 * Time: 20:47
 */
export default factory;
export type {Adapter, Config};
