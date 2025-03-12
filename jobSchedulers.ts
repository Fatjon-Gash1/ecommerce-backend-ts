import { queue2, queue3 } from './jobQueues';
import { redisClient } from './config/redis';
import { Customer } from './models/relational';

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

const holidays: HolidayData[] = [
    {
        schedulerId: 'valentinesDay',
        name: "Valentine's Day",
        date: '02/14',
        promotion: { loyaltyPoints: 300, promoCode: true, percentOff: 20 },
    },
    {
        schedulerId: 'internationalWomenDay',
        name: "International Women's Day",
        date: '03/08',
        promotion: { loyaltyPoints: 250, promoCode: true, percentOff: 15 },
    },
    {
        schedulerId: 'aprilFoolsDay',
        name: "April Fools' Day",
        date: '04/01',
        promotion: { loyaltyPoints: 100, promoCode: false },
    },
    {
        schedulerId: 'earthDay',
        name: 'Earth Day',
        date: '04/22',
        promotion: { loyaltyPoints: 200, promoCode: false },
    },
    {
        schedulerId: 'internationalLaborDay',
        name: 'International Labor Day',
        date: '05/01',
        promotion: { loyaltyPoints: 350, promoCode: true, percentOff: 25 },
    },
    {
        schedulerId: 'worldEnvironmentDay',
        name: 'World Environment Day',
        date: '06/05',
        promotion: { loyaltyPoints: 150, promoCode: true, percentOff: 10 },
    },
    {
        schedulerId: 'internationalFriendshipDay',
        name: 'International Friendship Day',
        date: '07/30',
        promotion: { loyaltyPoints: 250, promoCode: true, percentOff: 20 },
    },
    {
        schedulerId: 'halloween',
        name: 'Halloween',
        date: '10/31',
        promotion: { loyaltyPoints: 400, promoCode: true, percentOff: 30 },
    },
    {
        schedulerId: 'blackFriday',
        name: 'Black Friday',
        date: null, // Last Friday of November
        promotion: { loyaltyPoints: 800, promoCode: true, percentOff: 60 },
    },
    {
        schedulerId: 'cyberMonday',
        name: 'Cyber Monday',
        date: null, // Monday after Black Friday
        promotion: { loyaltyPoints: 750, promoCode: true, percentOff: 55 },
    },
    {
        schedulerId: 'humanRightsDay',
        name: 'Human Rights Day',
        date: '12/10',
        promotion: { loyaltyPoints: 300, promoCode: false },
    },
    {
        schedulerId: 'newYearsEve',
        name: 'New Year’s Eve',
        date: '12/31',
        promotion: { loyaltyPoints: 500, promoCode: true, percentOff: 50 },
    },
];

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
