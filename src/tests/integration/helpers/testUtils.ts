import request from 'supertest';
import app from '@/app';
import { Admin, Customer } from '@/models/relational';
type UserType = 'customer' | 'admin';

export const createTestUser = async (
    type: UserType
): Promise<Customer | Admin> => {
    switch (type) {
        case 'customer':
            return Customer.create({
                firstName: 'Test',
                lastName: 'Customer',
                email: `test-customer-123123@example.com`,
                username: 'testcustomer',
                password: 'password123',
                stripeId: 'test_stripe_id',
            });
        case 'admin':
            return Admin.create({
                firstName: 'Test',
                lastName: 'Admin',
                email: `test-admin-123123@admin.com`,
                username: 'testadmin',
                password: 'password123',
                role: 'admin',
            });
    }
};

export const loginTestUser = async (
    username: string,
    password: string
): Promise<string> => {
    const res = await request(app).post('/users/auth/login').send({
        username,
        password,
    });

    return res.body.accessToken;
};
