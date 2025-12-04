import request from 'supertest';
import app from '@/app';
import { Cart, Customer, Product } from '@/models/relational';
import { createTestUser, loginTestUser } from '../helpers/testUtils';

describe('Checkout API', () => {
    it('should add an item to cart', async () => {
        const customer = (await createTestUser('customer')) as Customer;
        const token = await loginTestUser(customer.username, customer.password);

        const product = await Product.create(
            {
                name: 'testproduct',
                description: 'testproduct desc',
                price: 100,
                imageUrls: ['testurl'],
                stockQuantity: 10,
                weight: 3,
                currency: 'eur',
            },
            { raw: true }
        );

        const res = await request(app)
            .post(`/users/customers/cart/items`)
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product.id, quantity: 2 });

        expect(res.status).toBe(201);

        const cart = await Cart.findOne({
            where: { customerId: customer.id },
        });

        let cartItem = null;
        (await cart?.getItems())?.forEach((item) => {
            if (item.getDataValue('productId') === product.id) {
                cartItem = item;
            }
        });

        expect(cartItem).not.toBe(null);
    });
});
