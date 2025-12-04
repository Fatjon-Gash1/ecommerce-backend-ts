[**ecommerce-backend-ts**](../README.md)

***

[ecommerce-backend-ts](../globals.md) / ProductService

# Class: ProductService

Defined in: Product.service.ts:27

Service responsible for product-related operations.

## Constructors

### new ProductService()

> **new ProductService**(`notificationService`?): [`ProductService`](ProductService.md)

Defined in: Product.service.ts:30

#### Parameters

##### notificationService?

[`NotificationService`](NotificationService.md)

#### Returns

[`ProductService`](ProductService.md)

## Methods

### addCategory()

> **addCategory**(`name`, `description`, `parentId`): `Promise`\<`CategoryResponse`\>

Defined in: Product.service.ts:49

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

> **addProductByCategoryId**(`username`, `categoryId`, `details`, `promote`?): `Promise`\<`ProductResponse`\>

Defined in: Product.service.ts:80

Creates a new product in a given category.

#### Parameters

##### username

`string`

##### categoryId

`number`

The id of the category

##### details

`ProductDetails`

The product creation details

##### promote?

`boolean`

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

Defined in: Product.service.ts:547

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

Defined in: Product.service.ts:575

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

Defined in: Product.service.ts:228

Retrieves all categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of Category instances

***

### getAllProducts()

> **getAllProducts**(`exclusive`?): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: Product.service.ts:265

Retrieves all products in the database.

#### Parameters

##### exclusive?

`boolean` = `false`

Whether to fetch exclusive products or not

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getAllTopLevelCategories()

> **getAllTopLevelCategories**(): `Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

Defined in: Product.service.ts:212

Retrieves all top level categories.

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an array of top level Category instances

***

### getNotificationService()

> `protected` **getNotificationService**(): `null` \| [`NotificationService`](NotificationService.md)

Defined in: Product.service.ts:34

#### Returns

`null` \| [`NotificationService`](NotificationService.md)

***

### getProductById()

> **getProductById**(`productId`): `Promise`\<`Product`\>

Defined in: Product.service.ts:309

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

Defined in: Product.service.ts:360

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

> **getProductsByCategory**(`categoryId`, `exclusive`?): `Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

Defined in: Product.service.ts:283

Retrieves all products of a certain category.

#### Parameters

##### categoryId

`number`

The ID of the category

##### exclusive?

`boolean` = `false`

Whether to fetch exclusive products or not

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Product`[]; \}\>

a promise resolving to an array of Product instances

***

### getProductsByStockStatus()

> **getProductsByStockStatus**(`status`): `Promise`\<\{ `count`: `number`; `products`: `ProductResponse`[]; \}\>

Defined in: Product.service.ts:386

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

Defined in: Product.service.ts:243

Retrieves all subCategories for a category.

#### Parameters

##### categoryId

`number`

The ID of the category

#### Returns

`Promise`\<\{ `count`: `number`; `rows`: `Category`[]; \}\>

A promise resolving to an object containing the count and rows

***

### handlePromotions()

> `protected` **handlePromotions**(`newProductId`, `username`, `promotion`, `threshold`): `Promise`\<`void`\>

Defined in: Product.service.ts:148

Handles promotions for new product arrivals and discounts

#### Parameters

##### newProductId

`number`

The id of the new product

##### username

`string`

The username of the admin who added the product

##### promotion

`Promotion`

The promotion type ('newArrival' or 'discount')

##### threshold

`number`

The number of products to trigger the promotion

#### Returns

`Promise`\<`void`\>

***

### searchProducts()

> **searchProducts**(`query`): `Promise`\<`ProductObject`[]\>

Defined in: Product.service.ts:591

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

> **setDiscountForProduct**(`username`, `productId`, `discount`, `promote`?): `Promise`\<`number`\>

Defined in: Product.service.ts:441

Sets the discount for a product.

#### Parameters

##### username

`string`

The admin username

##### productId

`number`

The id of the product

##### discount

`number`

The discount to set

##### promote?

`boolean`

A boolean indicating whether to promote the product

#### Returns

`Promise`\<`number`\>

A promise resolving to the discount and the new price

***

### updateCategoryById()

> **updateCategoryById**(`categoryId`, `name`, `description`): `Promise`\<`CategoryResponse`\>

Defined in: Product.service.ts:414

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

Defined in: Product.service.ts:480

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

> **viewProductById**(`productId`, `exclusive`?): `Promise`\<`Product`\>

Defined in: Product.service.ts:329

Retrieves a product by ID for customers only.

#### Parameters

##### productId

`number`

The ID of the product

##### exclusive?

`boolean` = `false`

Whether to fetch exclusive products or not

#### Returns

`Promise`\<`Product`\>

a promise resolving to a Product instance

#### Throws

ProductNotFoundError
Thrown if the product is not found
