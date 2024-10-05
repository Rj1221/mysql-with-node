import {
  int,
  tinyint,
  boolean,
  smallint,
  mediumint,
  bigint,
  real,
  float,
  double,
  decimal,
  serial,
  binary,
  varbinary,
  char,
  varchar,
  text,
  date,
  datetime,
  time,
  year,
  timestamp,
  mysqlEnum,
  mysqlTable,
  primaryKey,
} from "drizzle-orm/mysql-core";
import {
  eq, // equal
  relations, // relations
  ne, // not equal
  gt, // greater than
  gte, // greater than or equal
  lt, // less than
  lte, // less than or equal
  isNull, // is null
  isNotNull, // is not null
  inArray, // in array
  notInArray, // not in array
  exists, // exists
  notExists, // not exists
  between, // between
  notBetween, // not between
  like, // like
  notLike, // not like
  ilike, // ilike
  notILike, // not ilike
  not, // not
  and, // and
  or, // or
  arrayContains, // array contains
  arrayContained, // array contained
  arrayOverlaps, // array overlaps
} from "drizzle-orm";
import db from "../db/db";
// All Columns Constraints
/*
NOT NULL =>int: int('int').notNull(),
UNIQUE =>int: int('int').unique(),
PRIMARY KEY =>int: int('int').primaryKey(),
FOREIGN KEY =>int: int('int').foreignKey('table_name', 'column_name'),
export const user = mysqlTable("user", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name"),
  parentId: int("parent_id")
}, (table) => {
  return {
    parentReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "custom_fk"
    }),
  };
})
DEFAULT =>int: int('int').default(0),
AUTO_INCREMENT =>int: int('int').autoincrement(),
REFERENCES =>int: int('int').references('table_name', 'column_name'),
*/

//Indexes and Constraints
/*
import { int, text, index, uniqueIndex, mysqlTable } from "drizzle-orm/mysql-core";
INDEX =>int: int('int').index(),
UNIQUE INDEX =>int: int('int').uniqueIndex(),
export const user = mysqlTable("user", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name"),
  email: text("email"),
}, (table) => {
  return {
    nameIdx: index("name_idx").on(table.name),
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});
FULLTEXT INDEX =>int: int('int').fulltextIndex(),
SPATIAL INDEX =>int: int('int').spatialIndex(),
*/

// Query

/*One-to-One */

// export const user = mysqlTable("user", {
//   id: int("id").primaryKey().autoincrement(),
//   name: text("name"),
//   invitedBy: int("invited_by"),
// });

// export const userInvitation = mysqlTable("user_invitation", {
//   id: int("id").primaryKey().autoincrement(),
//   userId: int("user_id"),
//   invitationCode: text("invitation_code"),
// });

// relations.oneToOne(user, userInvitation, {
//   columns: [user.id],
//   referenceColumns: [userInvitation.userId],
// });

/*One-to-Many */

// export const user = mysqlTable("user", {
//   id: int("id").primaryKey().autoincrement(),
//   name: text("name"),
// });

// export const userAddress = mysqlTable("user_address", {
//   id: int("id").primaryKey().autoincrement(),
//   userId: int("user_id"),
//   address: text("address"),
// });

// relations.oneToMany(user, userAddress, {
//   columns: [user.id],
//   referenceColumns: [userAddress.userId],
// });

/*Many-to-Many */

// export const user = mysqlTable("user", {
//   id: int("id").primaryKey().autoincrement(),
//   name: text("name"),
// });

// export const userGroup = mysqlTable("user_group", {
//   id: int("id").primaryKey().autoincrement(),
//   name: text("name"),
// });

// export const userGroupRelation = mysqlTable("user_group_relation", {
//   userId: int("user_id"),
//   groupId: int("group_id"),
// });

// relations.manyToMany(user, userGroup, userGroupRelation, {
//   columns: [user.id],
//   referenceColumns: [userGroupRelation.userId],
// });
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: int("age").notNull(),
});
// Select with all columns

/* const result = db.select().from(users); */

// Select with specific columns

/*
 const result = db.select({users.id, users.name}).from(users); 
 console.log(result[0]);
*/

// Conditional Select

/*
const result = db.select().from(users).where(users.id.eq(1));
console.log(result[0]);
*/

// Filtering

/*
const result = db.select().from(users).where(users.age.gt(20));
console.log(result[0]);
*/

// Combining Filters

/*
const result = db.select().from(users).where(users.age.gt(20).and(users.age.lt(30)));
console.log(result[0]);
*/

// Select Distinct

/*
await db.selectDistinct().from(users).orderBy(usersTable.id, usersTable.name);
*/

// Select with Order By

/*
const result = db.select().from(users).orderBy(users.age);
console.log(result[0]);
*/

// Select with Group By

/*
const result = db.select().from(users).groupBy(users.age);
console.log(result[0]);
*/

// Select with Limit

/*
const result = db.select().from(users).limit(10);
console.log(result[0]);
*/

// ----- Insert -----

// Insert One Row

/*
await db.insert(users).values({ name: 'Andrew' });

*/

// Insert Multiple Rows

/*
await db.insert(users).values([
  { name: 'Andrew' },
  { name: 'John' },
]);
*/

// Insert On Conflict Do Nothing

/*
await db.insert(users)
  .values({ id: 1, name: 'John' })
  .onConflictDoNothing();

// explicitly specify conflict target
await db.insert(users)
  .values({ id: 1, name: 'John' })
  .onConflictDoNothing({ target: users.id });
*/

// Insert On Conflict Update

/*
await db.insert(users)
  .values({ id: 1, name: 'John' })
  .onConflictUpdate({ name: 'John' });

// explicitly specify conflict target
await db.insert(users)
  .values({ id: 1, name: 'John' })
  .onConflictUpdate({ name: 'John' }, { target: users.id });
*/

// On Duplicate Key Update

/*
await db.insert(users)
  .values({ id: 1, name: 'John' })
  .onDuplicateKeyUpdate({ set: { name: 'John' } });
*/

// ----- Update -----

// Update With RETURNING

/*
const updatedUserId: { updatedId: number }[] = await db.update(users)
  .set({ name: 'Mr. Dan' })
  .where(eq(users.name, 'Dan'))
  .returning({ updatedId: users.id });
*/

// Update With Update Clause

/*
const averagePrice = db.$with('average_price').as(
        db.select({ value: sql`avg(${products.price})`.as('value') }).from(products)
);

const result = await db.with(averagePrice)
    .update(products)
    .set({
      cheap: true
    })
    .where(lt(products.price, sql`(select * from ${averagePrice})`))
    .returning({
      id: products.id
    });
*/

// ----- Delete -----

// Delete With RETURNING

/*
const deletedUser = await db.delete(users)
  .where(eq(users.name, 'Dan'))
  .returning();

// partial return
const deletedUserIds: { deletedId: number }[] = await db.delete(users)
  .where(eq(users.name, 'Dan'))
  .returning({ deletedId: users.id });
*/

// Delete With Using

/*
const averageAmount = db.$with('average_amount').as(
  db.select({ value: sql`avg(${orders.amount})`.as('value') }).from(orders)
);

const result = await db
  .with(averageAmount)
  .delete(orders)
  .where(gt(orders.amount, sql`(select * from ${averageAmount})`))
  .returning({
    id: orders.id
  });
*/

// ---- Joins ----
// Inner Join, Left Join, Right Join, Full Join

/*
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const pets = pgTable('pets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: integer('owner_id').notNull().references(() => users.id),
})
  */

// Inner Join
/*
Description: The INNER JOIN keyword selects records that have matching values in both tables.
Syntax: SELECT column_name(s)
FROM table1
INNER JOIN table2
ON table1.column_name = table2.column_name;
Example:
const result = db.select().from(users).innerJoin(pets, pets.ownerId.eq(users.id));
console.log(result[0]);

*/

// Left Join
/*
Description: The LEFT JOIN keyword returns all records from the left table (table1), and the matched records from the right table (table2). The result is NULL from the right side if there is no match.
Syntax: SELECT column_name(s)
FROM table1
LEFT JOIN table2
ON table1.column_name = table2.column_name;
Example:
const result = db.select().from(users).leftJoin(pets, pets.ownerId.eq(users.id));
console.log(result[0]);

*/

// Right Join
/*
Description: The RIGHT JOIN keyword returns all records from the right table (table2), and the matched records from the left table (table1). The result is NULL from the left side when there is no match.
Syntax: SELECT column_name(s)
FROM table1
RIGHT JOIN table2
ON table1.column_name = table2.column_name;
Example:
const result = db.select().from(users).rightJoin(pets, pets.ownerId.eq(users.id));
console.log(result[0]);

*/

// Full Join
/*
Description: The FULL OUTER JOIN keyword returns all records when there is a match in left (table1) or right (table2) table records.
Syntax: SELECT column_name(s)
FROM table1
FULL OUTER JOIN table2
ON table1.column_name = table2.column_name;
Example:
const result = db.select().from(users).fullOuterJoin(pets, pets.ownerId.eq(users.id));
console.log(result[0]);

*/
