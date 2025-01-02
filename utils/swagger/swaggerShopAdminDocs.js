/**
 * @swagger
 * /shop/admin/panel:
 *   get:
 *     summary: Отримання даних для адмін-панелі
 *     description: Включено сортування користувачів, кошиків та продуктів
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - name: sortUser
 *         in: query
 *         description: Сортування користувачів по імені (asc/desc)
 *         schema:
 *           type: string
 *           example: asc
 *       - name: sortCartUser
 *         in: query
 *         description: Сортування кошиків по імені користувача (asc/desc)
 *         schema:
 *           type: string
 *           example: asc
 *       - name: sortProduct
 *         in: query
 *         description: Критерій сортування продуктів (title/price/category)
 *         schema:
 *           type: string
 *           example: title
 *       - name: sortDirection
 *         in: query
 *         description: Напрямок сортування продуктів (asc/desc)
 *         schema:
 *           type: string
 *           example: asc
 *     responses:
 *       200:
 *         description: Успішна відповідь
 *       404:
 *         description: Користувач, кошик, категорія чи продукт не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/admin/product/add:
 *   get:
 *     summary: Форма додавання нового продукту 
 *     tags:
 *       - Shop-admin
 *     responses:
 *       200:
 *         description: Форму для додавання продукту відображено
 *       404:
 *         description: Категорія не знайдена
 *       500:
 *         description: Помилка сервера
 *   post:
 *     summary: Додавання нового продукту
 *     description: Наприклад ID категорії Ноутбуків - 6772ac8684175163cd480cd6
 *     tags:
 *       - Shop-admin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Ноутбук ASUS
 *               description:
 *                 type: string
 *                 example: Новий ноутбук, 5 гиг
 *               price:
 *                 type: number
 *                 example: 10000
 *               productImg:
 *                 type: string
 *                 format: binary
 *               existingCategory:
 *                 description: Якщо категорія вже існує, вибираємо її за ID з бази
 *                 type: string
 *                 example: 6772ac8684175163cd480cd6
 *               newCategory:
 *                 description: Якщо категорії існуючої немає, створюємо по імені
 *                 type: string
 *                 example: Ноутбуки
 *     responses:
 *       200:
 *         description: Продукт успішно доданий
 *       400:
 *         description: Некоректні дані
 *       404:
 *         description: Категорія не знайдена
 *       409:
 *         description: Конфлікт даних (категорія чи продукт вже існує)
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/admin/user/delete/{userId}:
 *   delete:
 *     summary: Видалення користувача за ID
 *     description: Наприлад користувач Іван ID 6772a78c085568910f185e24. При успішному видаленні користувача отримуємо помилку 404, так як у контролері приймаємо redirect, а не json.
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID пользователя для удаления
 *         example: 6772a78c085568910f185e24
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Користувач успішно видалено
 *       404:
 *         description: Користувач не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/admin/cart/product/delete/{userId}/{productId}:
 *   delete:
 *     summary: Видалення продукту з кошика користувача
 *     description: Наприлад користувач Іван ID 6772a78c085568910f185e24, ID Iphone 17 - 6772ab3684175163cd480c40. При успішному видаленні продукту з кошика користувача отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID користувача
 *         example: 6772a78c085568910f185e24
 *         schema:
 *           type: string
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID продукта
 *         example: 6772ab3684175163cd480c40
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Продукт успішно видалено з кошика
 *       404:
 *         description: Профіль, продукт або кошик не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/admin/product/delete/{productId}:
 *   delete:
 *     summary: Видалення продукту з магазину
 *     description: Наприлад ID Iphone 17 - 6772ab3684175163cd480c40. При успішному видаленні продукту з магазину отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID продукта
 *         example: 6772ab3684175163cd480c40
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Продукт успішно вилучено з магазину
 *       404:
 *         description: Продукт не знайдено
 *       500:
 *         description: Помилка сервера
*/

/**
 * @swagger
 * /shop/admin/product/edit/{productId}:
 *   get:
 *     summary: Отримати форму для редагування продукту
 *     description: Отримує сторінку для редагування продукту, включаючи категорії та поточні дані продукту
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукту, який потрібно редагувати
 *     responses:
 *       200:
 *         description: Відображення сторінки з даними для редагування продукту
 *       404:
 *         description: Категорія або продукт не знайдено
 *       500:
 *         description: Помилка сервера
 *   put:
 *     summary: Редагувати дані продукту
 *     description: Наприлад ID Iphone 17 - 6772ab3684175163cd480c40. Редагує дані продукту, включаючи назву, опис, ціну, категорію та зображення. Якщо вказано нову категорію, створює її
 *     tags:
 *       - Shop-admin
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукту для редагування
 *         example: 6772ab3684175163cd480c40
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Назва продукту
 *                 example: Iphone нова назва
 *               description:
 *                 type: string
 *                 description: Опис продукта
 *                 example: Iphone новий опис
 *               price:
 *                 type: number
 *                 description: Ціна продукту
 *                 example: 45500
 *               productImg:
 *                 type: string
 *                 format: binary
 *                 description: Зображення продукту (необов'язково)
 *               existingCategory:
 *                 type: string
 *                 description: ID існуючої категорії для заміни категорії (якщо існуюча категорія не вибрана, залишається та категорія де знаходиться продукт)
 *                 example: 6766c88254aee9628382419a
 *               newCategory:
 *                 type: string
 *                 description: Якщо категорії існуючої немає, створюємо нову по імені
 *                 example: Телефоны
 *     responses:
 *       200:
 *         description: Продукт успішно оновлено
 *       400:
 *         description: Помилка завантаження зображення
 *       404:
 *         description: Продукт чи категорія не знайдені
 *       409:
 *         description: Категорія вже існує
 *       500:
 *         description: Помилка сервера
 */