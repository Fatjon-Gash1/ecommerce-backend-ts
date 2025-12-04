jest.unmock('@/services/Shipping.service');
import { ShippingService } from '@/services';
import { ShippingCountry } from '@/models/relational';
import {
    ShippingLocationNotFoundError,
    ShippingOptionNotFoundError,
} from '@/errors';
import { ProductItem, WeightCategory } from '@/types';
import { ShippingMethod, ShippingWeight } from '@/models/document';

class TestableShippingService extends ShippingService {
    public override determineWeightCategory(
        productItems: ProductItem[]
    ): Promise<{ weightCategory: WeightCategory; orderWeight: number }> {
        return super.determineWeightCategory(productItems);
    }
}

describe('ShippingService', () => {
    const shippingService = new TestableShippingService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('calculateShippingCost', () => {
        const productItem: ProductItem = {
            productId: 1,
            quantity: 10,
        };

        beforeEach(() => {
            jest.spyOn(
                shippingService,
                'determineWeightCategory'
            ).mockResolvedValue({
                weightCategory: 'standard',
                orderWeight: 5,
            });
            jest.spyOn(
                shippingService,
                'determineWeightCategoryForCart'
            ).mockResolvedValue({
                weightCategory: 'standard',
                orderWeight: 5,
            });
        });

        it('should throw ShippingLocationNotFoundError if shipping location is not found', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue(null);
            (ShippingMethod.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                shippingService.calculateShippingCost(
                    'Germany',
                    'standard',
                    undefined,
                    [productItem]
                )
            ).rejects.toThrow(ShippingLocationNotFoundError);

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
        });

        it('should throw ShippingOptionNotFoundError if shipping method is not found', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue({});
            (ShippingMethod.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                shippingService.calculateShippingCost(
                    'Germany',
                    'standard',
                    undefined,
                    [productItem]
                )
            ).rejects.toThrow(ShippingOptionNotFoundError);

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
        });

        it('should throw ShippingOptionNotFoundError if shipping weight is not found', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue({});
            (ShippingMethod.findOne as jest.Mock).mockResolvedValue({});
            (ShippingWeight.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                shippingService.calculateShippingCost(
                    'Germany',
                    'standard',
                    undefined,
                    [productItem]
                )
            ).rejects.toThrow(ShippingOptionNotFoundError);

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
            expect(
                shippingService.determineWeightCategory
            ).toHaveBeenCalledWith([productItem]);
            expect(ShippingWeight.findOne).toHaveBeenCalled();
        });

        it('should calculate shipping cost, determine weight and its category', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue({
                rate: 5,
            });
            (ShippingMethod.findOne as jest.Mock).mockResolvedValue({
                rate: 3,
            });
            (ShippingWeight.findOne as jest.Mock).mockResolvedValue({
                rate: 2.5,
            });

            const result = await shippingService.calculateShippingCost(
                'Germany',
                'standard',
                undefined,
                [productItem]
            );

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
            expect(
                shippingService.determineWeightCategory
            ).toHaveBeenCalledWith([productItem]);
            expect(ShippingWeight.findOne).toHaveBeenCalled();
            expect(result).toStrictEqual({
                cost: 10.5,
                weightCategory: 'standard',
                orderWeight: 5,
            });
        });

        it('should calculate shipping cost, determine weight and its category with safe shipping', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue({
                rate: 5,
            });
            (ShippingMethod.findOne as jest.Mock).mockResolvedValueOnce({
                rate: 3,
            });
            (ShippingMethod.findOne as jest.Mock).mockResolvedValueOnce({
                rate: 15,
            });
            (ShippingWeight.findOne as jest.Mock).mockResolvedValue({
                rate: 2.5,
            });

            const result = await shippingService.calculateShippingCost(
                'Germany',
                'standard',
                undefined,
                [productItem],
                true
            );

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
            expect(
                shippingService.determineWeightCategory
            ).toHaveBeenCalledWith([productItem]);
            expect(ShippingWeight.findOne).toHaveBeenCalled();
            expect(result).toStrictEqual({
                cost: 25.5,
                weightCategory: 'standard',
                orderWeight: 5,
            });
        });

        it('should calculate shipping cost for cart, determine weight and its category', async () => {
            (ShippingCountry.findOne as jest.Mock).mockResolvedValue({
                rate: 5,
            });
            (ShippingMethod.findOne as jest.Mock).mockResolvedValue({
                rate: 3,
            });
            (ShippingWeight.findOne as jest.Mock).mockResolvedValue({
                rate: 2.5,
            });

            const result = await shippingService.calculateShippingCost(
                'Germany',
                'standard',
                1
            );

            expect(ShippingCountry.findOne).toHaveBeenCalled();
            expect(ShippingMethod.findOne).toHaveBeenCalled();
            expect(
                shippingService.determineWeightCategory
            ).not.toHaveBeenCalledWith([productItem]);
            expect(
                shippingService.determineWeightCategoryForCart
            ).toHaveBeenCalledWith(1);
            expect(ShippingWeight.findOne).toHaveBeenCalled();
            expect(result).toStrictEqual({
                cost: 10.5,
                weightCategory: 'standard',
                orderWeight: 5,
            });
        });
    });
});
