[**server**](../README.md)

***

[server](../README.md) / ProductService

# Class: ProductService

Defined in: [Product.service.ts:60](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L60)

Service responsible for product-related operations.

## Constructors

### new ProductService()

> **new ProductService**(`paymentService`?): [`ProductService`](ProductService.md)

Defined in: [Product.service.ts:63](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L63)

#### Parameters

##### paymentService?

[`PaymentService`](PaymentService.md)

#### Returns

[`ProductService`](ProductService.md)

## Methods

### addCategory()

> **addCategory**(`name`, `description`, `parentId`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:78](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L78)

Creates a new category in the database.

#### Parameters

##### name

`string`

The name of the category

##### description

`string`

The description of the category

##### parentId

The id of the parent category

`null` | `number`

#### Returns

`Promise`\<`CategoryResponse`\>

A promise resolving to the created category

#### Throws

CategoryAlreadyExistsError
Thrown if the category already exists.

***

### addProductByCategoryId()

> **addProductByCategoryId**(`categoryId`, `details`): `Promise`\<`ProductResponse`\>

Defined in: [Product.service.ts:109](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L109)

Creates a new product in a given category.

#### Parameters

##### categoryId

`number`

The id of the category

##### details

`ProductDetails`

The product creation details

#### Returns

`Promise`\<`ProductResponse`\>

A promise that resolves to the created product

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

#### Throws

ProductAlreadyExistsError
Thrown if the product already exists or if the
product image is already in use.

***

### deleteCategoryById()

> **deleteCategoryById**(`categoryId`): `Promise`\<`void`\>

Defined in: [Product.service.ts:459](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L459)

Deletes a category by id.

#### Parameters

##### categoryId

`number`

The id of the category

#### Returns

`Promise`\<`void`\>

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

***

### deleteProductById()

> **deleteProductById**(`productId`): `Promise`\<`void`\>

Defined in: [Product.service.ts:487](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L487)

Deletes a product by id.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`void`\>

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### getAllCategories()

> **getAllCategories**(): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:180](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L180)

Retrieves all categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of Category instances

***

### getAllProducts()

> **getAllProducts**(): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: [Product.service.ts:216](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L216)

Retrieves all products in the database.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getAllTopLevelCategories()

> **getAllTopLevelCategories**(): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:164](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L164)

Retrieves all top level categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of top level Category instances

***

### getDiscountedPrice()

> **getDiscountedPrice**(`productId`): `Promise`\<`number`\>

Defined in: [Product.service.ts:348](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L348)

Retrieves the product's discounted price.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`number`\>

A promise resolving to the discounted price

#### Throws

ProductNotFoundError
Thrown if the product is not found.

***

### getProductById()

> **getProductById**(`productId`): `Promise`\<`Product`\>

Defined in: [Product.service.ts:253](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L253)

Retrieves a product by ID for admins only.

#### Parameters

##### productId

`number`

The ID of the product

#### Returns

`Promise`\<`Product`\>

a promise resolving to a Product instance

***

### getProductCategory()

> **getProductCategory**(`productId`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:295](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L295)

Retrieves the category of a product.

#### Parameters

##### productId

`number`

The id of the product

#### Returns

`Promise`\<`CategoryResponse`\>

A promise resolving to a Category instance

#### Throws

ProductNotFoundError
Thrown if the product is not found.

#### Throws

CategoryNotFoundError
Thrown if the category is not found.

***

### getProductsByCategory()

> **getProductsByCategory**(`categoryId`): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: [Product.service.ts:231](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L231)

Retrieves all products of a certain category.

#### Parameters

##### categoryId

`number`

The ID of the category

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getProductsByStockStatus()

> **getProductsByStockStatus**(`status`): `Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

Defined in: [Product.service.ts:321](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L321)

Retrieves all products by stock status.

#### Parameters

##### status

`string`

The stock status ('inStock' or 'outOfStock')

#### Returns

`Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

A promise resolving to an array of Product instances

***

### getSubCategoriesForCategory()

> **getSubCategoriesForCategory**(`categoryId`): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: [Product.service.ts:195](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L195)

Retrieves all subCategories for a category.

#### Parameters

##### categoryId

`number`

The ID of the category

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an object containing the count and rows

***

### searchProducts()

> **searchProducts**(`query`): `Promise`\<`ProductObject`[]\>

Defined in: [Product.service.ts:503](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L503)

Searches for products based on a query.

#### Parameters

##### query

`string`

The search query

#### Returns

`Promise`\<`ProductObject`[]\>

A promise resolving to an array of matched products

***

### setDiscountForProduct()

> **setDiscountForProduct**(`productId`, `discount`): `Promise`\<`number`\>

Defined in: [Product.service.ts:401](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L401)

Sets the discount for a product.

#### Parameters

##### productId

`number`

The id of the product

##### discount

`number`

The discount to set

#### Returns

`Promise`\<`number`\>

A promise resolving to the discount and the new price

***

### updateCategoryById()

> **updateCategoryById**(`categoryId`, `name`, `description`): `Promise`\<`CategoryResponse`\>

Defined in: [Product.service.ts:376](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L376)

Updates an existing category

#### Parameters

##### categoryId

`number`

The id of the category to update

##### name

`string`

The new name of the category

##### description

`string`

The new description of the category

#### Returns

`Promise`\<`CategoryResponse`\>

A promise that resolves to the updated category

#### Throws

CategoryNotFoundError
Thrown if the category doesn't exist

***

### updateProductById()

> **updateProductById**(`productId`, `details`): `Promise`\<`ProductResponse`\>

Defined in: [Product.service.ts:434](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L434)

Updates an existing product in the database.

#### Parameters

##### productId

`number`

The id of the product to update

##### details

`ProductDetails`

The product update details

#### Returns

`Promise`\<`ProductResponse`\>

A promise resolving to the updated product

#### Throws

ProductNotFoundError
Thrown if the product doesn't exist.

***

### viewProductById()

> **viewProductById**(`productId`): `Promise`\<`Product`\>

Defined in: [Product.service.ts:272](https://github.com/Fatjon-Gash1/edge-tech/blob/085a51adf25b768e5a328e0a366f458113cc8929/server/services/Product.service.ts#L272)

Retrieves a product by ID for customers only.

#### Parameters

##### productId

`number`

The ID of the product

#### Returns

`Promise`\<`Product`\>

a promise resolving to a Product instance

#### Throws

ProductNotFoundError
Thrown if the product is not found
