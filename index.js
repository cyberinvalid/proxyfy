const fileSystem = require('fs');
const rq = require('request-promise-native');
const { EventEmitter } = require('events');

const fs = fileSystem.promises;

function toChunk(array, limit) {
    const chunked = [];
    for(let i = 0; i < array.length; i += limit)
        chunked.push(array.slice(i, i + limit));

    return chunked;
}

module.exports = class Proxyfy extends EventEmitter {
    constructor(options) {
        super();

        this.request = options?.request || rq.defaults({
            timeout: 3e4,
            pool: false,
            tunnel: false
        });
        this.protocol = options?.protocol || 'http';
        this.url = options?.url || 'http://www.example.com';
        this.regex = options?.regex || /Example Domain/;
        this.poolSize = options?.poolSize || 300;
    }

    async fromFile(file) {
        const data = await fs.readFile(file, 'utf8');
        const chunks = toChunk(data.split(/\r?\n/), this.poolSize);

        const successfully = [];

        for(const chunk of chunks) {
            const promise = Promise.allSettled(chunk.map(proxy =>
                this.check(proxy)));

            for(const result of await promise) {
                if(result.status === 'fulfilled')
                    successfully.push(result.value);
            }
        }

        return successfully;
    }

    async check(proxy) {
        if(!proxy && proxy.startsWith('#'))
            throw new Error('This line is commented');

        const [host, port] = proxy.split(':');

        if(!host || !port)
            throw new Error('Host or port is not specified');

        const timeStart = Date.now();
        const result = await this.request(this.url, { proxy: `${this.protocol}://${proxy}` });

        if(!result || !this.regex.exec(result))
            throw new Error(`Body doesn't match the regex ${this.regex}.`);

        const data = {
            proxy, host, port, timeout: Date.now() - timeStart
        }

        this.emit('alive', data);

        return data;
    }
};
