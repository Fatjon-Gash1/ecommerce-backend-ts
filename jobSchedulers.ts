import { queue2, queue3 } from './jobQueues';
import { redisClient } from './config/redis';
import { Customer } from './models/relational';
import { Holiday } from './models/document';

interface HolidayData {
    schedulerId: string;
    name: string;
    date: string | null;
    promotion: PromotionData;
}

interface PromotionData {
    loyaltyPoints: number;
    promoCode: boolean;
    percentOff?: number;
}

function getBlackFriday(): number {
    const date = new Date(new Date().getFullYear(), 11, 0);

    while (date.getDay() !== 5) {
        date.setDate(date.getDate() - 1);
    }

    return date.getDate();
}

function getCyberMondayDate(): string {
    const year = new Date().getFullYear();
    const fridayDate = getBlackFriday();
    const date = new Date(year, 10, fridayDate);

    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }

    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0].replaceAll('-', '/');
}

(async () => {
    const set = await redisClient.zcard(
        'bull:holidayPromotionJobQueue:delayed'
    );
    if (!set) {
        const holidays = (await Holiday.find({}).select('-__t -__v')).map(
            (holiday) => holiday.toObject()
        );

        const jobSchedulerPromises = holidays.map(
            async (holiday: HolidayData) => {
                const startDate =
                    holiday.schedulerId === 'blackFriday'
                        ? `${new Date().getFullYear()}/11/${getBlackFriday()}`
                        : holiday.schedulerId === 'cyberMonday'
                          ? getCyberMondayDate()
                          : `${new Date().getFullYear()}/${holiday.date}`;

                return await queue3.upsertJobScheduler(
                    `${holiday.schedulerId}:${startDate}:promotion:jobScheduler`,
                    {
                        every: 31536000000,
                        startDate,
                    },
                    {
                        name: holiday.schedulerId + ':promotionJob',
                        data: {
                            holidayName: holiday.name,
                            promotion: holiday.promotion,
                        },
                    }
                );
            }
        );
        await Promise.allSettled(jobSchedulerPromises);
    }
})();

export async function addBirthdayJobScheduler(newCustomer: Customer) {
    const startDate =
        new Date().getFullYear() + newCustomer.birthday.toISOString().slice(4);

    await queue2.upsertJobScheduler(
        `birthday:scheduler:${startDate}:${newCustomer.username}`,
        {
            every: 31536000000,
            startDate,
        },
        {
            name: 'birthday-promocode:job',
            data: {
                stripeCustomerId: newCustomer.stripeId,
                email: newCustomer.email,
                firstName: newCustomer.firstName,
                birthday: newCustomer.birthday,
            },
        }
    );
}
