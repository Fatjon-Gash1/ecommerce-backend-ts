import winston from 'winston';

export class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = this.generateLogger();

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.simple()
                    ),
                })
            );
        }
    }

    private generateLogger(): winston.Logger {
        return winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({
                    filename: '../logs/error.log',
                    level: 'error',
                }),

                new winston.transports.File({
                    filename: '../logs/combined.log',
                }),
            ],
        });
    }

    public log(message: string, ...args: unknown[]) {
        this.logger.info(message + String(args));
    }

    public error(message: string, ...args: unknown[]) {
        this.logger.error(message + String(args));
    }
}

export const logger = new Logger();
