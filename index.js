const fileSystem = require('fs');
const rq = require('request-promise-native');

const fs = fileSystem.promises;

module.exports = class Proxyfy {
    constructor(options) {
        this.request = options?.request || rq.defaults({ timeout: 3e4 });
        this.protocol = options?.protocol || 'http';
        this.url = options?.url || 'http://www.example.com';
        this.regex = options?.regex || /Example Domain/;
    }

    async fromFile(file) {
        const data = await fs.readFile(file, 'utf8');
        const promise = Promise.allSettled(data.split(/\r?\n/).map(proxy =>
            this.check(proxy)));

        const successfully = [];

        for(const result of await promise) {
            if(result.status === 'fulfilled')
                successfully.push(result.value);
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

        return {
            proxy, host, port, timeout: Date.now() - timeStart
        };
    }
};
