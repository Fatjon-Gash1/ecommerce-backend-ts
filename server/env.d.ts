// src/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: number;
        MYSQL_HOST?: string;
        MYSQL_USER?: string;
        MYSQL_PASSWORD?: string;
        MYSQL_DATABASE?: string;
        MONGODB_URI?: string;
    }
}
