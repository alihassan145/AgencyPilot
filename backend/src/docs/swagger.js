const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "DIGITAL I - Agency Management System API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          security: [],
          responses: { 200: { description: "Logged in" } },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user (admin)",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/auth/change-password": {
        post: {
          tags: ["Auth"],
          summary: "Change own password",
          responses: { 200: { description: "Updated" } },
        },
      },
      "/api/auth/admin/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Admin reset user password",
          responses: { 200: { description: "Reset" } },
        },
      },

      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "List users (admin)",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/users/{id}": {
        patch: {
          tags: ["Users"],
          summary: "Update user (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/clients": {
        get: {
          tags: ["Clients"],
          summary: "List clients (scoped)",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Clients"],
          summary: "Create client (admin)",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/clients/{id}": {
        get: {
          tags: ["Clients"],
          summary: "Get client (scoped)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        patch: {
          tags: ["Clients"],
          summary: "Update client (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        delete: {
          tags: ["Clients"],
          summary: "Delete client (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks (role-scoped)",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create task (admin/manager)",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update task (employees: status only)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete task (admin/manager)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/departments": {
        get: {
          tags: ["Departments"],
          summary: "List departments (admin)",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Departments"],
          summary: "Create department (admin)",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/departments/{id}": {
        patch: {
          tags: ["Departments"],
          summary: "Update department (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
        delete: {
          tags: ["Departments"],
          summary: "Delete department (admin)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/reports": {
        get: {
          tags: ["Reports"],
          summary: "List reports (role-scoped)",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Reports"],
          summary: "Submit report",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/reports/{id}/approve": {
        post: {
          tags: ["Reports"],
          summary: "Approve report (admin/manager)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/reports/{id}/reject": {
        post: {
          tags: ["Reports"],
          summary: "Reject report (admin/manager)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/attendance/check-in": {
        post: {
          tags: ["Attendance"],
          summary: "Check in",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/attendance/check-out": {
        post: {
          tags: ["Attendance"],
          summary: "Check out",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/attendance": {
        get: {
          tags: ["Attendance"],
          summary: "List attendance (role-scoped)",
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/leaves": {
        get: {
          tags: ["Leaves"],
          summary: "List leaves (role-scoped)",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Leaves"],
          summary: "Apply for leave",
          responses: { 201: { description: "Created" } },
        },
      },
      "/api/leaves/{id}/decide": {
        post: {
          tags: ["Leaves"],
          summary: "Approve/Reject leave (admin/manager)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/payroll/config": {
        get: {
          tags: ["Payroll"],
          summary: "Get payroll config",
          responses: { 200: { description: "OK" } },
        },
        post: {
          tags: ["Payroll"],
          summary: "Set payroll config (admin)",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/payroll/me": {
        get: {
          tags: ["Payroll"],
          summary: "My earnings summary",
          responses: { 200: { description: "OK" } },
        },
      },

      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List notifications",
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/notifications/mark-read": {
        post: {
          tags: ["Notifications"],
          summary: "Mark notifications as read",
          responses: { 200: { description: "OK" } },
        },
      },
    },
  },
  apis: ["src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
