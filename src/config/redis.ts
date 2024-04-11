import { createClient } from 'redis';

const redisConnection = createClient({
    password: 'Dd1hXlWj16FXjPIYjDJ37c3Lo51mI5z3',
    socket: {
        host: 'redis-16073.c263.us-east-1-2.ec2.cloud.redislabs.com',
        port: 16073
    }
});

export default redisConnection;
