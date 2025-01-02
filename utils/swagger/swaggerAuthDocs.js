/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Логин користувача
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: Пароль користувача
 *                 example: admin
 *     responses:
 *       201:
 *         description: Відображення сторінки логіну після успішної реєстрації
 *       400:
 *         description: Помилка валідації
 *       409:
 *         description: Такий користувач вже існує
 *       500:
 *         description: Помилка сервера
 *   get:
 *     summary: Відображення сторінки реєстрації
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Сторінка для реєстрації користувача
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Логін користувача
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Логин користувача
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: Пароль користувача
 *                 example: adminpassword
 *     responses:
 *       200:
 *         description: Успішний вхід, токен відправлений в cookie
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Неправильне логин користувача або пароль
 *       500:
 *         description: Помилка сервера
 *   get:
 *     summary: Відображення сторінки логіну
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Сторінка для логіну користувача
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Вихід користувача
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Успішний вихід, токен видалений з cookies
 *       500:
 *         description: Помилка сервера
 */