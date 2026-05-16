const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "APIWatch — Auth Service",
      version: "1.0.0",
      description: "Authentication microservice for APIWatch.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Local (direct)" },
      { url: "http://localhost:3000", description: "Via API Gateway" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };