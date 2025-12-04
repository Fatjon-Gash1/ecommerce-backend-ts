import request from 'supertest';
import app from '@/app';
import { Admin, Customer, User } from '@/models/relational';
import { createTestUser, loginTestUser } from '../helpers/testUtils';

describe('Authentication API', () => {
    let customer: Customer;
    let admin: Admin;
    let token: string;

    const userData = {
        details: {
            firstName: 'Test',
            lastName: 'Customer',
            username: 'testcustomer',
            email: `test-customer-123123@example.com`,
            password: 'Password123@',
        },
    };

    describe('User creation', () => {
        beforeEach(async () => {
            admin = (await createTestUser('admin')) as Admin;
            token = await loginTestUser(admin.username, admin.password);
        });

        it('should create a new customer', async () => {
            const res = await request(app)
                .post('/users/admin/customers')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            expect(res.status).toBe(201);

            const createdCustomer = await Customer.findOne({
                include: [
                    {
                        model: User,
                        as: 'user',
                        where: { username: userData.details.username },
                    },
                ],
            });
            expect(createdCustomer).not.toBeNull();
        });

        it('should create a new admin', async () => {
            const res = await request(app)
                .post('/users/admin/admins')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    details: {
                        ...userData.details,
                        lastName: 'Admin',
                        username: 'testadmin1',
                        email: 'test-admin-124124@example.com',
                    },
                });

            expect(res.status).toBe(201);

            const createdAdmin = await Admin.findOne({
                include: [
                    {
                        model: User,
                        as: 'user',
                        where: { username: 'testadmin' },
                    },
                ],
            });
            expect(createdAdmin).not.toBeNull();
        });

        it('should return 409 if customer username/email is already in use', async () => {
            await createTestUser('customer');

            const res = await request(app)
                .post('/users/admin/customers')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            expect(res.status).toBe(409);
        });
    });

    describe('User login', () => {
        beforeEach(async () => {
            customer = (await createTestUser('customer')) as Customer;
        });

        it('should log in a customer', async () => {
            const res = await request(app).post('/users/auth/login').send({
                username: customer.username,
                password: customer.password,
            });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
        });

        it('should return 401 for invalid login credentials', async () => {
            const res = await request(app).post('/users/auth/login').send({
                username: customer.username,
                password: 'wrongpassword',
            });

            expect(res.status).toBe(401);
        });

        it('should return 404 if the customer was not found', async () => {
            const res = await request(app).post('/users/auth/login').send({
                username: 'testuser',
                password: 'testpw1234',
            });

            expect(res.status).toBe(404);
        });
    });
});
