# proxyfy

*proxyfy* is a Node.js module you can use to check if proxies from
a big list are working.

For example, let's say you want to connect to the website *example.com*, but it
blocks requests from your IP. So you search on the Internet a few proxy servers
to use to connect to this website. The problem is that a lot of proxies you can
find are not working, or maybe they are already blocked by *example.com*.

With *proxyfy*, you can test big lists of proxy servers to see if they
work to send requests to a website.

## Install
To install the module: 

```bash
npm install proxyfy --save
```

## Example


```javascript
import Proxyfy from 'proxyfy';
// or
const Proxyfy = require('proxyfy');

const proxyfy = new Proxyfy({
    url: 'http://www.example.com',
    regex: /Example Domain/
});

(async () => {
    proxyfy.on('alive', proxy =>
        console.log(proxy));

    /*  {
     *		proxy: '123.234.321.32:80',
     *		host: '123.234.321.32',
     *		port: '80',
     *		timeout: 1000
     *	}
     */

    const itsWorking = await proxyfy.fromFile('myProxyFile.txt');
    console.log(itsWorking);
    
    /*  [{
     *		proxy: '123.234.321.32:80',
     *		host: '123.234.321.32',
     *		port: '80',
     *		timeout: 1000
     *	}, ...]
     */
});
```

The file you pass as first parameter contains the proxy servers to test. Here is
an example:

```
123.234.321.32:80
12.234.21.243:8080
132.34.212.4:3128
#127.32.76.123:80 <= This line will be ignored
```

### Proxyfy Class

This is default class with following options object:

| Key | Default value | Description |
| ------ | ------ | ------ |
| request | ... | request-promise-native wrapper |
| protocol | `'http'` | Also can be 'https' |
| url | `'http://www.example.com'` | URI of site to test on regex |
| regex | `/Example Domain/` | Regex for test of response  |
| poolSize | 300 | Maximum number of concurrent requests  |