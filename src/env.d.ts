declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        HOST: string;
        PORT: number;
        REDIS_URL: string;
        MYSQL_HOST: string;
        MYSQL_PORT: number;
        MYSQL_USER: string;
        MYSQL_PASSWORD: string;
        MYSQL_DATABASE: string;
        MYSQL_PROD_HOST: string;
        MYSQL_PROD_PORT: number;
        MYSQL_PROD_USER: string;
        MYSQL_PROD_PASSWORD: string;
        MYSQL_PROD_DATABASE: string;
        MONGODB_URI: string;
        ACCESS_TOKEN_KEY: string;
        REFRESH_TOKEN_KEY: string;
        ACCESS_TOKEN_EXPIRY: number;
        REFRESH_TOKEN_EXPIRY: string;
        GENERIC_TOKEN_KEY: string;
        GMAIL_USER: string;
        GMAIL_PASS: string;
        BASE_PATH: string;
        LLM_API_KEY: string;
        LLM_NAME: string;
        LLM_PROVIDER_API: string;
        STRIPE_KEY: string;
        CLIENT_URL: string;
        REGISTRATION_LOYALTY_POINTS: number;
    }
}
