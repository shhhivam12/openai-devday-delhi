import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const networkRequests = sqliteTable(
  "network_requests",
  {
    id: text("id").primaryKey(),
    node: text("node").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    people: integer("people").notNull(),
    location: text("location").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("received"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("network_requests_node_created").on(table.node, table.createdAt),
  ],
);
export const networkCheckins = sqliteTable(
  "network_checkins",
  {
    id: text("id").primaryKey(),
    node: text("node").notNull(),
    name: text("name").notNull(),
    people: integer("people").notNull(),
    location: text("location").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("network_checkins_node_created").on(table.node, table.createdAt),
  ],
);
export const networkMessages = sqliteTable(
  "network_messages",
  {
    id: text("id").primaryKey(),
    node: text("node").notNull(),
    name: text("name").notNull(),
    message: text("message").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("network_messages_node_created").on(table.node, table.createdAt),
  ],
);
export const networkOperations = sqliteTable("network_operations", {
  id: text("id").primaryKey(),
  fingerprint: text("fingerprint").notNull(),
  createdAt: text("created_at").notNull(),
});
