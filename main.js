const http = require('http'); // модуль для создания http сервера
const fs = require('fs'); // модуль для работы с файлами
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

class Server {
  constructor() {
    this.routes = {};
    this.users = {};
    this.app = express();
    this.app.use(express.json());

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'User API',
          version: '1.0.0',
        },
      },
      apis: ['./main.js'], // Specify the path to the main file (or files) that contain your route definitions
    };

    this.specs = swaggerJsdoc(options);
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(this.specs));
    
    /**
     * @openapi
     * /users:
     *   get:
     *     summary: Get all users
     *     responses:
     *       200:
     *         description: OK
     */
    this.app.get('/users', (req, res) => {
      // Your code to get all users
      res.json(this.users);
    });

    /**
     * @openapi
     * /users/{id}:
     *   get:
     *     summary: Get a user by ID
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         description: ID of the user
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: OK
     *       404:
     *         description: User not found
     */
    this.app.get('/users/:id', (req, res) => {
      const userId = req.params.id;
      // Your code to get a user by ID
      const user = this.users[userId];
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  }

  



  addRoute(route, method, handler) {
    const routeKey = `${method}:${route}`;
    this.routes[routeKey] = handler;
  }

  handleRequest(method, route) {
    const routeKey = `${method}:${route}`;
    if (routeKey in this.routes) {
      const handler = this.routes[routeKey];
      return handler();
    } else {
      return "404 Not Found";
    }
  }

  getUser(userId) {
    if (userId in this.users) {
      return this.users[userId];
    } else {
      return null;
    }
  }

  createUser(userId, name) {
    if (userId in this.users) {
      return null;
    } else {
      const user = { id: userId, name };
      this.users[userId] = user;
      return user;
    }
  }

  updateUser(userId, name) {
    if (userId in this.users) {
      const user = this.users[userId];
      user.name = name;
      return user;
    } else {
      return null;
    }
  }

  deleteUser(userId) {
    if (userId in this.users) {
      delete this.users[userId];
    }
  }

  start(port) {
    // Добавляем маршруты в express
    /**
     * @openapi
     * /user:
     *   get:
     *     summary: Get a user
     *     responses:
     *       200:
     *         description: OK
     *       404:
     *         description: User not found
     */
    this.app.get('/user', (req, res) => {
      const userId = 123;
      const user = this.getUser(userId);
      if (user) {
        res.send(user.getInfo());
      } else {
        res.send("User not found");
      }
    });

    /**
     * @openapi
     * /user:
     *   post:
     *     summary: Upload a user
     *     parameters:
     *       - name: body
     *         in: body
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             username:
     *                type: string 
     *                example: defaultUser
     *             password:
     *                type: string
     *                example: defaultPassword
     *     responses:
     *       200:
     *         description: OK
     *       404:
     *         description: User not found
     */
    this.app.post('/user', (req, res) => {
      const userId = 123;
      const name = "John";
      const user = this.createUser(userId, name);
      if (user) {
        res.send("User created");
      } else {
        res.send("User already exists");
      }
    });


    /**
     * @openapi
     * /user:
     *   put:
     *     summary: Update a user
     *     parameters:
     *       - name: body
     *         in: body
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             username:
     *                type: string 
     *                example: defaultUser
     *             password:
     *                type: string
     *                example: defaultPassword
     *     responses:
     *       200:
     *         description: OK
     *       404:
     *         description: User not found
     */
    this.app.put('/user', (req, res) => {
      const userId = 123;
      const newName = "Jane";
      const user = this.updateUser(userId, newName);
      if (user) {
        res.send("User updated");
      } else {
        res.send("User not found");
      }
    });


    /**
     * @openapi
     * /user:
     *   delete:
     *     summary: Delete a user
     *     responses:
     *       204:
     *         description: Deleted
     *       404:
     *         description: User not found
     */
    this.app.delete('/user', (req, res) => {
      const userId = 123;
      this.deleteUser(userId);
      res.send("User deleted");
    });

    this.app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.specs);
    });
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(this.specs));

    // Запускаем сервер на указанном порту
    this.app.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
    });
  }
}

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  getInfo() {
    return `User: ${this.name}`;
  }
}

// Создаем экземпляр класса Server
const server = new Server();

// Добавляем маршруты в сервер
server.addRoute("/user", "GET", () => {
  const userId = 123;
  const user = server.getUser(userId);
  if (user) {
    return user.getInfo();
  } else {
    return "User not found";
  }
});

server.addRoute("/user", "POST", () => {
  const userId = 123;
  const name = "John";
  const user = server.createUser(userId, name);
  if (user) {
    return "User created";
  } else {
    return "User already exists";
  }
});

server.addRoute("/user", "PUT", () => {
  const userId = 123;
  const newName = "Jane";
  const user = server.updateUser(userId, newName);
  if (user) {
    return "User updated";
  } else {
    return "User not found";
  }
});

server.addRoute("/user", "DELETE", () => {
  const userId = 123;
  server.deleteUser(userId);
  return "User deleted";
});


server.start(3000);

module.exports = Server;