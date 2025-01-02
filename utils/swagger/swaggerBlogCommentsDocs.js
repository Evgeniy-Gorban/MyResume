/**
 * @swagger
 * /blog/comment/{id}:
 *   post:
 *     summary: Створити коментар для блогу за допомогою валідації
 *     tags:
 *       - Blog comment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID блога
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Текс коментаря от 2 до 100 символів
 *                 example: Це мій коментар!
 *     responses:
 *       200:
 *         description: Коментар успішно створився
 *       400:
 *         description: Помилка валідації даних
 *       404:
 *         description: Блог не знайден
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /blog/comment/{id}/{commentId}:
 *   put:
 *     summary: Відредагуйте коментар, використовуючи валідацією
 *     tags:
 *       - Blog comment
 *     description: З успішним редагуванням коментаря ми отримуємо помилку 404, оскільки в контролері ми приймаємо redirect, а не JSON.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID блога
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID коментаря
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Текс коментаря от 2 до 100 символів
 *                 example: Цей коментар було оновлено!
 *     responses:
 *       200:
 *         description: Коментар успішно відредаговано
 *       400:
 *         description: Помилка валідації даних
 *       404:
 *         description: Блог чи коментар не знайдено
 *       500:
 *         description: Помилка сервера
 *   get:
 *     summary: Переглянути коментар по ID
 *     tags:
 *       - Blog comment
 *     description: Отримати коментар за вказаним ID коментарем для вказаного блогу.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID блога
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID коментаря
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Коментар успішно знайден
 *       404:
 *         description: Блог чи коментар не знайдено
 *       500:
 *         description: Помилка серверва
 */

/**
 * @swagger
 * /blog/comment/{id}/{commentId}:
 *   delete:
 *     summary: Видалити коментар
 *     tags:
 *       - Blog comment
 *     description: З успішним видаленням коментаря ми отримуємо помилку 404, оскільки в контролері ми приймаємо redirect, а не json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID блога
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID коментаря
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Коментар успішно видалено
 *       404:
 *         description: Блог чи коментар не знайдено
 *       500:
 *         description: Помилка сервера
 */