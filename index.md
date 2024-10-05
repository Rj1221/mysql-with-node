# Full Project with Drizzle ORM, node-cache , Role-Based Access Control, and File Uploads

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation and Setup](#installation-and-setup)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
   - [User Model](#user-model)
   - [Post Model](#post-model)
   - [Comment Model](#comment-model)
5. [Cache Management with `node-cache`](#cache-management-with-node-cache)
6. [Controllers](#controllers)
   - [Auth Controller](#auth-controller)
   - [Post Controller](#post-controller)
   - [Comment Controller](#comment-controller)
7. [Middleware](#middleware)
   - [Authentication Middleware](#authentication-middleware)
   - [Role Middleware](#role-middleware)
8. [Routes](#routes)
   - [Auth Routes](#auth-routes)
   - [Post Routes](#post-routes)
   - [Comment Routes](#comment-routes)
9. [Security and Validation](#security-and-validation)
10. [File Uploads](#file-uploads)
11. [Real-Time Features with Socket.IO](#real-time-features-with-socketio)
12. [Utilities](#utilities)

- [Cache Utility](#cache-utility)
- [Pagination Utility](#pagination-utility)
- [Filter Utility](#filter-utility)
- [Sort Utility](#sort-utility)
- [Search Utility](#search-utility)

13. [Exercises and Solutions](#exercises-and-solutions)
14. [Conclusion](#conclusion)

---

## Project Overview

In this project, we’ll build a **Blog Platform** with the following features:

- **Authentication and Authorization** using JWT
- **Role-Based Access Control (RBAC)** for managing permissions
- **Post and Comment management** with relationship handling between users, posts, and comments
- **Caching** using `node-cache` for faster responses
- **File Uploads** using `multer` for handling image uploads
- **Real-Time Features** using `Socket.IO` to notify users of new comments
- **Security** practices using `helmet`, `express-validator`, and `csurf` for CSRF protection

---

## Installation and Setup

### Step 1: Install Dependencies

```bash
npm install drizzle-orm mysql2 express express-validator csurf helmet ejs bcrypt jsonwebtoken multer node-cache socket.io
```

### Step 2: Set Up the Database Connection

**db.js:**

```js
import { drizzle } from "drizzle-orm/mysql";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "yourpassword",
  database: "yourdatabase",
});

const db = drizzle(connection);
export default db;
```

---

## Project Structure

```
- controllers/
  - authController.js
  - postController.js
  - commentController.js
- models/
  - userModel.js
  - postModel.js
  - commentModel.js
- routes/
  - authRoutes.js
  - postRoutes.js
  - commentRoutes.js
- middleware/
  - authMiddleware.js
  - roleMiddleware.js
- utils/
  - cache.js
  - paginate.js
  - filter.js
  - sort.js
  - search.js
- uploads/ (for image uploads)
- app.js
- db.js
```

---

## Database Models

### User Model

**userModel.js:**

```js
import {
  mysqlTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", 255).notNull(),
  email: varchar("email", 255).notNull().unique(),
  password: varchar("password", 255).notNull(),
  role: varchar("role", 50).default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Post Model

**postModel.js:**

```js
import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";
import { users } from "./userModel.js";

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", 255).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", 255),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Comment Model

**commentModel.js:**

```js
import {
  mysqlTable,
  serial,
  text,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";
import { users } from "./userModel.js";
import { posts } from "./postModel.js";

export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  postId: int("post_id")
    .notNull()
    .references(() => posts.id),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## Cache Management with `node-cache`

### Setting Up `node-cache`

**cache.js:**

```js
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour TTL
export default cache;
```

---

## Controllers

### Auth Controller

**authController.js:**

```js
import db from "../db.js";
import { users } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

export const register = [
  body("name").notEmpty().trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      await db.insert(users).values({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
];

export const login = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await db
        .select()
        .from(users)
        .where(users.email.eq(req.body.email))
        .then((rows) => rows[0]);

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) {
        return res.status(400).json({ error: "Invalid credentials." });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        "your_jwt_secret",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful.", token });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
];
```

### Post Controller

**postController.js:**

```js
import db from "../db.js";
import { posts } from "../models/postModel.js";
import { users } from "../models/userModel.js";
import cache from "../utils/cache.js";
import { applyFilters } from "../utils/filter.js";
import { applySorting } from "../utils/sort.js";
import { paginate } from "../utils/paginate.js";
import { body, validationResult } from "express-validator";

export const getPosts = async (req, res) => {
  try {
    const cacheKey = `posts:${JSON.stringify(req.query)}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    } else {
      let query = db
        .select()
        .from(posts)
        .leftJoin(users, posts.userId.eq(users.id));

      query = applyFilters(query, req.query, ["title", "userId"]);
      query = applySorting(query, req.query.sortBy, req.query.sortOrder, posts);
      query = paginate(query, { page: req.query.page, limit: req.query.limit });

      const result = await query;

      cache.set(cacheKey, result); // Cache the result
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

export const createPost = [
  body("title").notEmpty().trim().escape(),
  body("content").notEmpty().trim(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await db.insert(posts).values({
        userId: req.user.id,
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.file ? req.file.path : null,
      });

      // Invalidate cache for posts
      cache.keys((err, keys) => {
        if (!err) {
          keys.forEach((key) => {
            if (key.startsWith("posts:")) {
              cache.del(key);
            }
          });
        }
      });

      res.status(201).json({ message: "Post created successfully." });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
];
```

### Comment Controller

**commentController.js:**

```js
import db from "../db.js";
import { comments } from "../models/commentModel.js";
import { users } from "../models/userModel.js";
import cache from "../utils/cache.js";
import { paginate } from "../utils/paginate.js";
import { body, validationResult } from "express-validator";

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const cacheKey = `comments:${postId}:${JSON.stringify(req.query)}`;

    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    } else {
      let query = db
        .select()
        .from(comments)
        .innerJoin(users, comments.userId.eq(users.id))
        .where(comments.postId.eq(postId));

      query = paginate(query, { page: req.query.page, limit: req.query.limit });

      const result = await query;

      cache.set(cacheKey, result);
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

export const createComment = [
  body("content").notEmpty().trim(),

  async (req, res) => {
    const { postId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await db.insert(comments).values({
        postId: parseInt(postId),
        userId: req.user.id,
        content: req.body.content,
      });

      // Invalidate cache for comments
      cache.keys((err, keys) => {
        if (!err) {
          keys.forEach((key) => {
            if (key.startsWith(`comments:${postId}:`)) {
              cache.del(key);
            }
          });
        }
      });

      res.status(201).json({ message: "Comment added successfully." });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
];
```

---

## Middleware

### Authentication Middleware

**authMiddleware.js:**

```js
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};
```

### Role Middleware

**roleMiddleware.js:**

```js
export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
```

---

## Routes

### Auth Routes

**authRoutes.js:**

```js
import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

### Post Routes

**postRoutes.js:**

```js
import express from "express";
import { getPosts, createPost } from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import commentRoutes from "./commentRoutes.js";

const router = express.Router();

router.get("/", getPosts);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "editor"),
  createPost
);

// Nested routes for comments
router.use("/:postId/comments", commentRoutes);

export default router;
```

### Comment Routes

**commentRoutes.js:**

```js
import express from "express";
import {
  getComments,
  createComment,
} from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", getComments);
router.post("/", authenticateToken, createComment);

export default router;
```

---

## Security and Validation

**app.js:**

```js
import express from "express";
import helmet from "helmet";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).json({ error: "Form tampered with." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## File Uploads

### Step 1: Install and Configure Multer

```bash
npm install multer
```

### Step 2: Configure Multer

**uploadConfig.js:**

```js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  },
});

export const upload = multer({ storage });
```

---

## Real-Time Features with Socket.IO

### Step 1: Install Socket.IO

```bash
npm install socket.io
```

### Step 2: Set Up Socket.IO Server

**In `app.js`:**

```js
import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io }; // Export to use in controllers
```

### Step 3: Emit Events from Controllers

**In `commentController.js`:**

```js
import { io } from "../app.js";

export const createComment = [
  body("content").notEmpty().trim(),

  async (req, res) => {
    const { postId } = req.params;

    try {
      const [comment] = await db
        .insert(comments)
        .values({
          postId: parseInt(postId),
          userId: req.user.id,
          content: req.body.content,
        })
        .returning();

      // Emit real-time event
      io.emit("newComment", comment);

      res.status(201).json({ message: "Comment added successfully.", comment });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
];
```

### Step 4: Frontend Code to Listen for Events

```js
import io from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("newComment", (comment) => {
  console.log("New comment received:", comment);
});
```

---

## Utilities

### Cache Utility

**cache.js:**

```js
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 });
export default cache;
```

### Pagination Utility

**paginate.js:**

```js
export function paginate(query, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
}
```

### Filter Utility

**filter.js:**

```js
import { and, eq, like } from "drizzle-orm";

export function applyFilters(query, filters, columns) {
  const conditions = [];
  for (const key in filters) {
    if (columns.includes(key)) {
      if (typeof filters[key] === "string" && filters[key].includes("%")) {
        conditions.push(like(key, filters[key]));
      } else {
        conditions.push(eq(key, filters[key]));
      }
    }
  }
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}
```

### Sort Utility

**sort.js:**

```js
export function applySorting(query, sortBy, sortOrder, columns) {
  if (columns.includes(sortBy)) {
    return query.orderBy(
      sortOrder === "desc" ? columns[sortBy].desc() : columns[sortBy]
    );
  }
  return query;
}
```

### Search Utility

**search.js:**

```js
import { like } from "drizzle-orm";

export function applySearch(query, searchTerm, columns) {
  if (searchTerm) {
    const conditions = columns.map((column) => like(column, `%${searchTerm}%`));
    return query.where(or(...conditions));
  }
  return query;
}
```

---
