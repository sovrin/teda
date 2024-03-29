import teda, {Adapter, Config, Format} from '../src';
import assert from 'assert';
import {IncomingMessage, ServerResponse} from 'http';

const Ref = {
    remoteAddress: "1",
    method: "2",
    url: "3",
    httpVersion: "4",
    statusCode: "5",
    date: "6",
    contentLength: 0,
    duration: "8",
    userAgent: undefined,
};

// albeit scoring 100% code coverage
// these are not optimal tests
describe('teda', () => {
    const listeners = {};

    /**
     *
     * @param format
     * @param event
     * @param options
     * @param callback
     */
    const execute = async (
        format: string,
        event: string,
        options: Omit<Config, 'adapter'> = null,
        callback = () => listeners[event]()
    ) => (
        new Promise<any>((resolve => {
            const adapter: Adapter = resolve;

            teda(format, {adapter, ...options})(req, res, callback);
        }))
    );

    const req = {
        method: Ref.method,
        url: Ref.url,
        httpVersion: Ref.httpVersion,
        headers: {
            'user-agent': Ref.userAgent,
        },
        socket: {
            remoteAddress: Ref.remoteAddress,
        },
    } as unknown as IncomingMessage;

    const res = {
        statusCode: Ref.statusCode,
        getHeaders: () => ({
            'content-length': Ref.contentLength,
        }),
        on: (event, handler) => {
            listeners[event] = handler;
        },
        off: (event) => {
            listeners[event] = null;
        },
    } as unknown as ServerResponse;

    describe('run down all formats with values', () => {
        const runs = [
            {type: null, options: ['', 'finish'], expected: ''},
            {type: 'empty', options: ['', 'finish'], expected: ''},
            {type: 'unmodified', options: ['foobar', 'finish'], expected: 'foobar'},
            {type: 'remote-addr', options: [':remote-addr', 'finish'], expected: Ref.remoteAddress},
            {type: 'method', options: [':method', 'finish'], expected: Ref.method},
            {type: 'url', options: [':url', 'finish'], expected: Ref.url},
            {type: 'http-version', options: [':http-version', 'finish'], expected: Ref.httpVersion},
            {type: 'status', options: [':status', 'finish'], expected: Ref.statusCode},
            {type: 'date', options: [':date', 'finish'], expected: /\d+[\/].*?[:].*?\+\d{4}/}, // loosey goosey
            {type: 'content-length', options: [':content-length', 'finish'], expected: '0'},
            {type: 'duration', options: ['#:duration#', 'finish'], expected: /(#\d+\.\d+#)/},
            {type: 'url and method', options: [':url :method', 'finish'], expected: Ref.url + ' ' + Ref.method},
            {type: 'url and unknown', options: [':url :unknown', 'finish'], expected: Ref.url + ' :unknown'},
            {type: 'user-agent', options: [':user-agent', 'finish'], expected: '[:user-agent]'},
        ];

        for (const {type, options: [format, event], expected} of runs) {
            it(`it should return ${type}`, async () => {
                const value = await execute(format, event);

                // @ts-ignore
                if (expected instanceof RegExp) {
                    assert(expected.test(value), `value: ${value} is does not match with: ${expected.toString()}`);
                } else {
                    assert(value === expected, `value: ${value} is not equal to expected: ${expected}`);
                }
            });
        }

        assert(Object.keys(listeners).length === 0, 'there should not be any active listeners');
    });

    describe('configuration', () => {
        it('should use default format', async () => {
            const value = await execute(undefined, 'finish');

            assert(/\d\s.*-\s.*ms/.test(value), 'return value differs from expectation')
        });

        it('should use tiny format', async () => {
            const value = await execute(Format.TINY, 'finish');

            assert(/2 3 5 0 - .*ms/.test(value), 'return value differs from expectation')
        });

        it('should use console.log as adapter', (done) => {
            const backup = console.log;
            console.log = (string) => {
                assert(string === 'foobar', 'return value differs from expectation');

                console.log = backup;

                done();
            };

            teda('foobar')(req, res, () => listeners['finish']());
        });

        it('should skip log', (done) => {
            execute(undefined, 'finish', {
                skip: () => {
                    return true;
                },
            }, () => {
                done();
            });
        });
    });
});
