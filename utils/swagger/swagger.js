const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Resume API',
            description: 'Документація для мого сайту резюме',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],

    },
    apis:
        [
            './utils/swagger/swaggerAuthDocs.js',
            './utils/swagger/swaggerBlogDocs.js',
            './utils/swagger/swaggerBlogCommentsDocs.js',
            './utils/swagger/swaggerShopDocs.js',
            './utils/swagger/swaggerShopAdminDocs.js',
            './utils/swagger/swaggerChatDocs.js',
            './utils/swagger/swaggerNoteDocs.js'
        ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerSpec,
};