// src/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: number;
        REDIS_HOST?: string;
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
        BASE_PATH?: string;
        LLM_API_KEY?: string;
        LLM_NAME?: string;
        LLM_PROVIDER_API?: string;
        STRIPE_KEY?: string;
        CLIENT_URL?: string;
    }
}
