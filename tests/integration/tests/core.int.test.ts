import request from 'supertest';
import app from '@/app';
import { Admin, Category, Product } from '@/models/relational';
import { createTestUser, loginTestUser } from '../helpers/testUtils';

describe('Core API', () => {
    let admin: Admin;
    let token: string;

    beforeEach(async () => {
        admin = (await createTestUser('admin')) as Admin;
        token = await loginTestUser(admin.username, admin.password);
    });

    it('should create a new category', async () => {
        const res = await request(app)
            .post('/users/admin/products/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'testcategory',
                description: 'testcategory desc',
            });

        expect(res.status).toBe(201);

        const category = await Category.findOne({
            where: { name: 'testcategory' },
        });

        expect(category).not.toBeNull();
    });

    it('should create a new product inside a category', async () => {
        const category = await Category.create({
            name: 'testcategory',
            description: 'testcategory desc',
        });
        const productData = {
            details: {
                name: 'testproduct',
                description: 'testproduct desc',
                price: 100,
                imageUrls: ['testurl'],
                stockQuantity: 10,
                weight: 3,
            },
        };

        const res = await request(app)
            .post(`/users/admin/products/categories/${category.id}/products`)
            .set('Authorization', `Bearer ${token}`)
            .send(productData);

        expect(res.status).toBe(201);

        const product = await Product.findOne({
            where: { name: 'testproduct' },
        });

        expect(product).not.toBeNull();
    });
});
