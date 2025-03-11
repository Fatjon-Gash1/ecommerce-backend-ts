// src/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: number;
        MYSQL_HOST?: string;
        MYSQL_USER?: string;
        MYSQL_PASSWORD?: string;
        MYSQL_DATABASE?: string;
        MONGODB_URI?: string;
        ACCESS_TOKEN_KEY?: string;
        REFRESH_TOKEN_KEY?: string;
        ACCESS_TOKEN_EXPIRY?: string;
        REFRESH_TOKEN_EXPIRY?: string;
        GENERIC_TOKEN_KEY?: string;
        GMAIL_USER?: string;
        GMAIL_PASS?: string;
        TEMPLATES_PATH?: string;
        STRIPE_KEY?: string;
        CLIENT_URL?: string;
    }
}
