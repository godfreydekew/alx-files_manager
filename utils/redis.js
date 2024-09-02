import { createClient } from 'redis';


class RedisClient {
    constructor() {
        this.connectd = false;
        this.client = createClient();
        this.client.on('connect', () => {
            this.connectd = true;
        });
        this.client.on('error', (err) => {console.log(err);});
    }

    isAlive() {
        return this.connectd;
    }

    async get(key) {
        const value = await this.client.get(key);
        if (value === undefined) {
            return null;
        } else {
            return value
        }
    }

    async set(key, value, duration) {
        await this.client.set(key,value, 'EX', duration);
    }

    async del(key) {
        await this.client.del(key);
    }
}

const redisClient = new RedisClient();
export default redisClient;