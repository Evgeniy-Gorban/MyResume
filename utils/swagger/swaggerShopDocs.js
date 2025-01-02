/**
 * @swagger
 * /shop:
 *   get:
 *     summary: Отримати список продуктів та категорій у магазині
 *     tags:
 *       - Shop
 *     responses:
 *       200:
 *         description: Список продуктів та категорій успішно отримано
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/profile/{username}:
 *   get:
 *     summary: Отримати профіль користувача
 *     description: Перегляд профілю користувача, його кошика та фотографію профілю
 *     tags:
 *       - Shop
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: Ім'я користувача, чий профіль потрібно отримати
 *     responses:
 *       200:
 *         description: Профіль користувача успішно отримано
 *       404:
 *         description: Користувач не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /shop/profile/upload/{username}:
 *   post:
 *     summary: Завантажити у профілі фото профілю для користувача
 *     tags:
 *       - Shop
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: Ім'я користувача, для якого завантажується фото профілю
 *         example: Іван
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Фото профілю успішно завантажено
 *       404:
 *         description: Користувача або профілю не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/product/add:
 *   post:
 *     summary: Додати продукт до кошика користувача 
 *     description: Наприклад ID Iphone 17 - 6772ab3684175163cd480c40
 *     tags:
 *       - Shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Ім'я користувача, до якого потрібно додати продукт
 *                 example: Іван
 *               productId:
 *                 type: string
 *                 description: ID продукту, який потрібно додати до кошика
 *                 example: 6772ab3684175163cd480c40
 *     responses:
 *       200:
 *         description: Продукт успішно доданий до кошика
 *       404:
 *         description: Користувача або продукту не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/product/update:
 *   put:
 *     summary: Оновити кількість продукту у кошику користувача
 *     description: Наприклад ID Iphone 17 - 6772ab3684175163cd480c40. При успішному додаванні/зменшенні продукту в кошику користувача отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *     tags:
 *       - Shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Ім'я користувача
 *                 example: Іван
 *               productId:
 *                 type: string
 *                 description: ID продукту, який потрібно оновити у кошику
 *                 example: 6772ab3684175163cd480c40
 *               action:
 *                 type: string
 *                 enum: [increase, decrease]
 *                 description: Дія, яку потрібно виконати з кількістю продукту (збільшити чи зменшити)
 *                 example: "increase"
 *     responses:
 *       200:
 *         description: Кількість продукту успішно оновлено
 *       400:
 *         description: Помилка при додаванні/зменшенні кількості продуктів
 *       404:
 *         description: Користувач, кошик чи продукт не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/product/delete:
 *   delete:
 *     summary: Видалити продукт із кошика користувача
 *     description: Наприклад ID Iphone 17 - 6772ab3684175163cd480c40. При успішному видаленні продукту з кошика користувача отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *     tags:
 *       - Shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Ім'я користувача
 *                 example: Іван
 *               productId:
 *                 type: string
 *                 description: ID продукту, який потрібно видалити з корзини
 *                 example: 6772ab3684175163cd480c40
 *     responses:
 *       200:
 *         description: Продукт успішно видалено з кошика
 *       404:
 *         description: Користувач, кошик чи продукт не знайдено
 *       500:
 *         description: Помилка серверв
*/

/**
 * @swagger
 * /shop/placing-order:
 *   get:
 *     summary: Страница оформления заказа
 *     description: Заглушка для оформлення замовлення та підключення зовнішніх API
 *     tags:
 *       - Shop
 *     responses:
 *       200:
 *         description: Сторінка успішно завантажена
 *       500:
 *         description: Помилка сервера
 */