import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  planType: varchar("plan_type").default("basic").notNull(),
  maxDomains: integer("max_domains").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer domains
export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  mailcowDomainId: varchar("mailcow_domain_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mailboxes
export const mailboxes = pgTable("mailboxes", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").notNull().unique(),
  domainId: varchar("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name"),
  quota: integer("quota").default(1024).notNull(), // in MB
  isActive: boolean("is_active").default(true).notNull(),
  mailcowMailboxId: varchar("mailcow_mailbox_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email aliases
export const aliases = pgTable("aliases", {
  id: varchar("id").primaryKey().notNull(),
  address: varchar("address").notNull().unique(),
  destination: varchar("destination").notNull(),
  domainId: varchar("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  mailcowAliasId: varchar("mailcow_alias_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  domains: many(domains),
  mailboxes: many(mailboxes),
  aliases: many(aliases),
}));

export const domainsRelations = relations(domains, ({ one, many }) => ({
  user: one(users, { fields: [domains.userId], references: [users.id] }),
  mailboxes: many(mailboxes),
  aliases: many(aliases),
}));

export const mailboxesRelations = relations(mailboxes, ({ one }) => ({
  domain: one(domains, { fields: [mailboxes.domainId], references: [domains.id] }),
  user: one(users, { fields: [mailboxes.userId], references: [users.id] }),
}));

export const aliasesRelations = relations(aliases, ({ one }) => ({
  domain: one(domains, { fields: [aliases.domainId], references: [domains.id] }),
  user: one(users, { fields: [aliases.userId], references: [users.id] }),
}));

// Schemas
export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMailboxSchema = createInsertSchema(mailboxes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertAliasSchema = createInsertSchema(aliases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMailboxSchema = createInsertSchema(mailboxes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertMailbox = z.infer<typeof insertMailboxSchema>;
export type UpdateMailbox = z.infer<typeof updateMailboxSchema>;
export type Mailbox = typeof mailboxes.$inferSelect;
export type InsertAlias = z.infer<typeof insertAliasSchema>;
export type Alias = typeof aliases.$inferSelect;

// Extended types with relations
export type DomainWithCounts = Domain & {
  mailboxCount: number;
  aliasCount: number;
};

export type MailboxWithDomain = Mailbox & {
  domain: Domain;
};

export type AliasWithDomain = Alias & {
  domain: Domain;
};
