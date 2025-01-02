/**
 * @swagger
 *  /notes:
 *    get:
 *      summary: Отримати список усіх нотаток
 *      description: Повертає список усіх нотаток, збережених на сервері
 *      tags:
 *        - Notes
 *      responses:
 *        200:
 *          description: Успішна відповідь із переліком нотаток
 *        500:
 *          description: Помилка сервера
*/

/**
 * @swagger
 *  /notes/create:
 *    post:
 *      summary: Створити нову нотатку
 *      description: Створює нову нотатку із вмістом
 *      tags:
 *        - Notes
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: Заголовок замітки
 *                  example: Моя замітка
 *                content:
 *                  type: string
 *                  description: Вміст нотатки
 *                  example: О 2 годині дня на тренування
 *      responses:
 *        200:
 *          description: Нотатка успішно створена
 *        400:
 *          description: Назва файлу або контент порожня
 *        500:
 *          description: Помилка сервера
 */

/**
 * @swagger
 *  /notes/edit:
 *    get:
 *      summary: Відкрити форму редагування нотатки
 *      description: Відкриває сторінку з формою для редагування нотатки на основі імені файлу
 *      tags:
 *        - Notes
 *      parameters:
 *        - in: query
 *          name: title
 *          required: true
 *          schema:
 *            type: string
 *          description: Ім'я файлу нотатки, яку потрібно відредагувати
 *          example: "note1"
 *      responses:
 *        200:
 *          description: Форма для редагування нотатки
 *        400:
 *          description: Ім'я файлу не вказано
 *        404:
 *          description: Файл не знайдено
 *        500:
 *          description: Помилка сервера
 *    put:
 *      summary: Оновити нотатку
 *      description: Оновлює зміст нотатки з новим заголовком та вмістом. При успішному редагуванні файлу отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *      tags:
 *        - Notes
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                oldTitle:
 *                  type: string
 *                  description: Поточний заголовок
 *                  example: Моя замітка
 *                title:
 *                  type: string
 *                  description: Новий заголовок нотатки (за бажанням)
 *                  example: Купити продукти у магазині
 *                content:
 *                  type: string
 *                  description: Новий вміст нотатки (за бажанням)
 *                  example: Овочі, хліб
 *      responses:
 *        200:
 *          description: Нотатка успішно оновлена
 *        404:
 *          description: Файл не знайдено
 *        500:
 *          description: Помилка сервера
 */

/**
 * @swagger
 *  /notes/delete:
 *    delete:
 *      summary: Видалити нотатку
 *      description: Видалення нотатки за вказаним ім'ям файлу.  При успішному видаленні файлу отримуємо помилку 404, тому що в контролері приймаємо redirect, а не json
 *      tags:
 *        - Notes
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: Назва файлу якого потрібно видалити
 *                  example: Моя замітка
 *      responses:
 *        200:
 *          description: Заметка успешно удалена
 *        400:
 *          description: Не указано имя файла
 *        404:
 *          description: Файл не знайдено
 *        500:
 *          description: Помилка сервера
 */

/**
 * @swagger
 *  /notes/download:
 *    get:
 *      summary: Завантажити замітку
 *      description: Дозволяє скачати замітку вказаним шляхом
 *      tags:
 *        - Notes
 *      parameters:
 *        - in: query
 *          name: title
 *          required: true
 *          description: Ім'я файлу якому потрібно скачати
 *          example: Моя замітка
 *      responses:
 *        200:
 *          description: Файл успішно завантажено
 *        400:
 *          description: Ім'я файлу не вказано
 *        404:
 *          description: Файл не знайдено
 *        500:
 *          description: Помилка сервера
 */

/**
 * @swagger
 *  /notes/upload:
 *    post:
 *      summary: Завантажити файл нотатки
 *      description: Завантажує файл із нотаткою на сервер
 *      tags:
 *        - Notes
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                noteFile:
 *                  type: string
 *                  format: binary
 *                  description: Файл нотатки для завантаження
 *      responses:
 *        200:
 *          description: Нотатка успішно завантажена
 *        400:
 *          description: Файл не завантажений
 *        500:
 *          description: Помилка сервера
 */