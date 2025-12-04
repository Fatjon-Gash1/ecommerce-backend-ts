import type { Customer } from '@/models/relational';
import { birthdayPromoQueue } from '@/queues';

export default async function addBirthdayJobScheduler(newCustomer: Customer) {
    const startDate =
        new Date().getFullYear() + newCustomer.birthday.toISOString().slice(4);

    await birthdayPromoQueue.upsertJobScheduler(
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
