/**
 * @swagger
 * /blog:
 *   get:
 *     summary: Отримання списку блогів
 *     tags:
 *       - Blog
 *     responses:
 *       200:
 *         description: Список блогів успішно отримано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /blog/create:
 *   post:
 *     summary: Створення нового блогу за допомогою валідації
 *     tags:
 *       - Blog
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 30
 *                 description: Титул блога (от 4 до 30 символів)
 *                 example: Музичний смак
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *                 description: Опис блога (от 10 до 200 символів)
 *                 example: Музичний смак для всіх різний, наприклад для ...
 *               blogImage:
 *                 type: string
 *                 format: binary
 *                 description: Зображення блогу
 *     responses:
 *       201:
 *         description: Блог успішно створений
 *       400:
 *         description: Помилка валідації
 *       409:
 *         description: Блог з цим тітулем вже існує
 *       500:
 *         description: Помилка сервера
 *   get:
 *     summary: Відображення сторінки із формою створення блогу
 *     tags:
 *       - Blog
 *     responses:
 *       200:
 *         description: Сторінка створення блогу успішно відображається
 */

/**
 * @swagger
 * /blog/{id}:
 *   get:
 *     summary: Переглянути сторінку з певним блогом (відповідно до ID) та його коментарів
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID блога
 *     responses:
 *       200:
 *         description: Блог та коментарі успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   type: object
 *                   description: Дані блогу
 *                 comments:
 *                   type: array
 *                   description: Список коментарів
 *                   items:
 *                     type: object
 *                     description: Дані коментарів
 *       404:
 *         description: Блог не знайден
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /blog/{id}:
 *   delete:
 *     summary: Видалення блогу за ID
 *     description: При успішному видаленні блогу отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID блога
 *     responses:
 *       200:
 *         description: Блог успішно видалено
 *         content:
 *          text/html:
 *              schema:
 *                   type: string
 *                   description: Сторінка підтвердження видалення
 *       403:
 *         description: Користувач не має права видалити цей блог
 *       404:
 *         description: Блог не знайден
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /blog/edit/{id}:
 *   put:
 *     summary: Оновлення блогу за ID за допомогою валідації
 *     description: З успішним редагуванням блогу ми отримуємо помилку 404, оскільки в контролері ми приймаємо redirect, а не json
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID блога.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Нові дані заголовка блогу від 4 до 30 символів (за потреби), у разі відсутності нового заголовка, залишається старий заголовок
 *                 example: Техника для праці
 *               description:
 *                 type: string
 *                 description: Нові дані опис блогу від 10 до 200 символів (при необхідності), у разі відсутності нового опису, залишається старий опис
 *                 example: На правці я звичайно використовую ....
 *               blogImage:
 *                 type: string
 *                 format: binary
 *                 description: Нове зображення для блогу (за необхідності), у випадку з відустності нового зображення, старе зображення залишається
 *     responses:
 *       200:
 *         description: Блог успішно оновлен
 *       400:
 *         description: Помилка валідації
 *       403:
 *         description: Користувач не має права редагувати цей блог
 *       404:
 *         description: Блог не знайден
 *       500:
 *         description: Помилка сервера
 *   get:
 *     summary: Відображення сторінки з формою для редагування блогу
 *     tags:
 *       - Blog
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID блога.
 *     responses:
 *       200:
 *         description: Сторінка редагування блогу успішно відображається
 *       404:
 *         description: Блог не знайден
 *       500:
 *         description: ПОмилка сервера
 */





