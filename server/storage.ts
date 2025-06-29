import {
  users,
  domains,
  mailboxes,
  aliases,
  type User,
  type UpsertUser,
  type Domain,
  type InsertDomain,
  type Mailbox,
  type InsertMailbox,
  type UpdateMailbox,
  type Alias,
  type InsertAlias,
  type DomainWithCounts,
  type MailboxWithDomain,
  type AliasWithDomain,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Domain operations
  getUserDomains(userId: string): Promise<DomainWithCounts[]>;
  getDomain(id: string): Promise<Domain | undefined>;
  getUserDomain(userId: string, domainId: string): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined>;
  deleteDomain(id: string): Promise<boolean>;
  
  // Mailbox operations
  getUserMailboxes(userId: string): Promise<MailboxWithDomain[]>;
  getDomainMailboxes(domainId: string): Promise<MailboxWithDomain[]>;
  getMailbox(id: string): Promise<Mailbox | undefined>;
  getUserMailbox(userId: string, mailboxId: string): Promise<Mailbox | undefined>;
  createMailbox(mailbox: InsertMailbox): Promise<Mailbox>;
  updateMailbox(id: string, updates: UpdateMailbox): Promise<Mailbox | undefined>;
  deleteMailbox(id: string): Promise<boolean>;
  
  // Alias operations
  getUserAliases(userId: string): Promise<AliasWithDomain[]>;
  getDomainAliases(domainId: string): Promise<AliasWithDomain[]>;
  getAlias(id: string): Promise<Alias | undefined>;
  getUserAlias(userId: string, aliasId: string): Promise<Alias | undefined>;
  createAlias(alias: InsertAlias): Promise<Alias>;
  updateAlias(id: string, updates: Partial<Alias>): Promise<Alias | undefined>;
  deleteAlias(id: string): Promise<boolean>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    domainCount: number;
    mailboxCount: number;
    aliasCount: number;
    totalStorageUsed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Domain operations
  async getUserDomains(userId: string): Promise<DomainWithCounts[]> {
    const result = await db
      .select({
        id: domains.id,
        name: domains.name,
        userId: domains.userId,
        isActive: domains.isActive,
        mailcowDomainId: domains.mailcowDomainId,
        createdAt: domains.createdAt,
        updatedAt: domains.updatedAt,
        mailboxCount: count(mailboxes.id),
        aliasCount: count(aliases.id),
      })
      .from(domains)
      .leftJoin(mailboxes, eq(domains.id, mailboxes.domainId))
      .leftJoin(aliases, eq(domains.id, aliases.domainId))
      .where(eq(domains.userId, userId))
      .groupBy(domains.id);
    
    return result.map(row => ({
      ...row,
      mailboxCount: row.mailboxCount || 0,
      aliasCount: row.aliasCount || 0,
    }));
  }

  async getDomain(id: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }

  async getUserDomain(userId: string, domainId: string): Promise<Domain | undefined> {
    const [domain] = await db
      .select()
      .from(domains)
      .where(and(eq(domains.id, domainId), eq(domains.userId, userId)));
    return domain;
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db
      .insert(domains)
      .values({ ...domain, id: nanoid() })
      .returning();
    return newDomain;
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined> {
    const [domain] = await db
      .update(domains)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(domains.id, id))
      .returning();
    return domain;
  }

  async deleteDomain(id: string): Promise<boolean> {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Mailbox operations
  async getUserMailboxes(userId: string): Promise<MailboxWithDomain[]> {
    return await db
      .select({
        id: mailboxes.id,
        email: mailboxes.email,
        domainId: mailboxes.domainId,
        userId: mailboxes.userId,
        fullName: mailboxes.fullName,
        quota: mailboxes.quota,
        isActive: mailboxes.isActive,
        mailcowMailboxId: mailboxes.mailcowMailboxId,
        createdAt: mailboxes.createdAt,
        updatedAt: mailboxes.updatedAt,
        domain: domains,
      })
      .from(mailboxes)
      .innerJoin(domains, eq(mailboxes.domainId, domains.id))
      .where(eq(mailboxes.userId, userId));
  }

  async getDomainMailboxes(domainId: string): Promise<MailboxWithDomain[]> {
    return await db
      .select({
        id: mailboxes.id,
        email: mailboxes.email,
        domainId: mailboxes.domainId,
        userId: mailboxes.userId,
        fullName: mailboxes.fullName,
        quota: mailboxes.quota,
        isActive: mailboxes.isActive,
        mailcowMailboxId: mailboxes.mailcowMailboxId,
        createdAt: mailboxes.createdAt,
        updatedAt: mailboxes.updatedAt,
        domain: domains,
      })
      .from(mailboxes)
      .innerJoin(domains, eq(mailboxes.domainId, domains.id))
      .where(eq(mailboxes.domainId, domainId));
  }

  async getMailbox(id: string): Promise<Mailbox | undefined> {
    const [mailbox] = await db.select().from(mailboxes).where(eq(mailboxes.id, id));
    return mailbox;
  }

  async getUserMailbox(userId: string, mailboxId: string): Promise<Mailbox | undefined> {
    const [mailbox] = await db
      .select()
      .from(mailboxes)
      .where(and(eq(mailboxes.id, mailboxId), eq(mailboxes.userId, userId)));
    return mailbox;
  }

  async createMailbox(mailbox: InsertMailbox): Promise<Mailbox> {
    const [newMailbox] = await db
      .insert(mailboxes)
      .values({ ...mailbox, id: nanoid() })
      .returning();
    return newMailbox;
  }

  async updateMailbox(id: string, updates: UpdateMailbox): Promise<Mailbox | undefined> {
    const [mailbox] = await db
      .update(mailboxes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mailboxes.id, id))
      .returning();
    return mailbox;
  }

  async deleteMailbox(id: string): Promise<boolean> {
    const result = await db.delete(mailboxes).where(eq(mailboxes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Alias operations
  async getUserAliases(userId: string): Promise<AliasWithDomain[]> {
    return await db
      .select({
        id: aliases.id,
        address: aliases.address,
        destination: aliases.destination,
        domainId: aliases.domainId,
        userId: aliases.userId,
        isActive: aliases.isActive,
        mailcowAliasId: aliases.mailcowAliasId,
        createdAt: aliases.createdAt,
        updatedAt: aliases.updatedAt,
        domain: domains,
      })
      .from(aliases)
      .innerJoin(domains, eq(aliases.domainId, domains.id))
      .where(eq(aliases.userId, userId));
  }

  async getDomainAliases(domainId: string): Promise<AliasWithDomain[]> {
    return await db
      .select({
        id: aliases.id,
        address: aliases.address,
        destination: aliases.destination,
        domainId: aliases.domainId,
        userId: aliases.userId,
        isActive: aliases.isActive,
        mailcowAliasId: aliases.mailcowAliasId,
        createdAt: aliases.createdAt,
        updatedAt: aliases.updatedAt,
        domain: domains,
      })
      .from(aliases)
      .innerJoin(domains, eq(aliases.domainId, domains.id))
      .where(eq(aliases.domainId, domainId));
  }

  async getAlias(id: string): Promise<Alias | undefined> {
    const [alias] = await db.select().from(aliases).where(eq(aliases.id, id));
    return alias;
  }

  async getUserAlias(userId: string, aliasId: string): Promise<Alias | undefined> {
    const [alias] = await db
      .select()
      .from(aliases)
      .where(and(eq(aliases.id, aliasId), eq(aliases.userId, userId)));
    return alias;
  }

  async createAlias(alias: InsertAlias): Promise<Alias> {
    const [newAlias] = await db
      .insert(aliases)
      .values({ ...alias, id: nanoid() })
      .returning();
    return newAlias;
  }

  async updateAlias(id: string, updates: Partial<Alias>): Promise<Alias | undefined> {
    const [alias] = await db
      .update(aliases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aliases.id, id))
      .returning();
    return alias;
  }

  async deleteAlias(id: string): Promise<boolean> {
    const result = await db.delete(aliases).where(eq(aliases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    domainCount: number;
    mailboxCount: number;
    aliasCount: number;
    totalStorageUsed: number;
  }> {
    const [stats] = await db
      .select({
        domainCount: sql<number>`(SELECT COUNT(*) FROM ${domains} WHERE ${domains.userId} = ${userId})`,
        mailboxCount: sql<number>`(SELECT COUNT(*) FROM ${mailboxes} WHERE ${mailboxes.userId} = ${userId})`,
        aliasCount: sql<number>`(SELECT COUNT(*) FROM ${aliases} WHERE ${aliases.userId} = ${userId})`,
        totalStorageUsed: sql<number>`(SELECT COALESCE(SUM(${mailboxes.quota}), 0) FROM ${mailboxes} WHERE ${mailboxes.userId} = ${userId})`,
      })
      .from(users)
      .where(eq(users.id, userId));
    
    return stats || { domainCount: 0, mailboxCount: 0, aliasCount: 0, totalStorageUsed: 0 };
  }
}

export const storage = new DatabaseStorage();
