import { redisClient } from '@/config/redis';
import { getBlackFriday, getCyberMondayDate } from './helpers';
import { holidayPromoQueue } from '@/queues';
import { Holiday } from '@/models/document';

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

export default async function setHolidaysJobScheduler() {
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

                return await holidayPromoQueue.upsertJobScheduler(
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
}
