import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { mailcowApi } from "./mailcowApi";
import {
  insertDomainSchema,
  insertMailboxSchema,
  updateMailboxSchema,
  insertAliasSchema,
} from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Domain routes
  app.get("/api/domains", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const domains = await storage.getUserDomains(userId);
      res.json(domains);
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.post("/api/domains", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const domainData = insertDomainSchema.parse({ ...req.body, userId });

      // Create domain in mailcow
      const mailcowDomainId = await mailcowApi.createDomain(domainData.name);

      // Save to database
      const domain = await storage.createDomain({
        ...domainData,
        mailcowDomainId,
      });

      res.json(domain);
    } catch (error) {
      console.error("Error creating domain:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create domain" 
      });
    }
  });

  app.delete("/api/domains/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const domain = await storage.getUserDomain(userId, id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      // Delete from mailcow
      if (domain.mailcowDomainId) {
        await mailcowApi.deleteDomain(domain.mailcowDomainId);
      }

      // Delete from database
      await storage.deleteDomain(id);

      res.json({ message: "Domain deleted successfully" });
    } catch (error) {
      console.error("Error deleting domain:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete domain" 
      });
    }
  });

  // Mailbox routes
  app.get("/api/mailboxes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mailboxes = await storage.getUserMailboxes(userId);
      res.json(mailboxes);
    } catch (error) {
      console.error("Error fetching mailboxes:", error);
      res.status(500).json({ message: "Failed to fetch mailboxes" });
    }
  });

  app.post("/api/mailboxes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { password, ...mailboxData } = insertMailboxSchema.parse({ ...req.body, userId });

      // Verify domain ownership
      const domain = await storage.getUserDomain(userId, mailboxData.domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      const [localPart] = mailboxData.email.split('@');
      
      // Create mailbox in mailcow
      const mailcowMailboxId = await mailcowApi.createMailbox(
        localPart,
        domain.name,
        password,
        mailboxData.quota || 1024,
        mailboxData.fullName ?? undefined
      );

      // Save to database
      const mailbox = await storage.createMailbox({
        ...mailboxData,
        password, // Include password in storage call
        mailcowMailboxId,
      });

      res.json(mailbox);
    } catch (error) {
      console.error("Error creating mailbox:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create mailbox" 
      });
    }
  });

  app.patch("/api/mailboxes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updates = updateMailboxSchema.parse(req.body);

      const mailbox = await storage.getUserMailbox(userId, id);
      if (!mailbox) {
        return res.status(404).json({ message: "Mailbox not found" });
      }

      // Update in mailcow
      if (mailbox.mailcowMailboxId) {
        const mailcowUpdates: any = {};
        if (updates.fullName) mailcowUpdates.name = updates.fullName;
        if (updates.quota) mailcowUpdates.quota = updates.quota;
        if (updates.isActive !== undefined) mailcowUpdates.active = updates.isActive;
        if (updates.password) mailcowUpdates.password = updates.password;

        await mailcowApi.updateMailbox(mailbox.mailcowMailboxId, mailcowUpdates);
      }

      // Update in database
      const updatedMailbox = await storage.updateMailbox(id, updates);

      res.json(updatedMailbox);
    } catch (error) {
      console.error("Error updating mailbox:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update mailbox" 
      });
    }
  });

  app.delete("/api/mailboxes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const mailbox = await storage.getUserMailbox(userId, id);
      if (!mailbox) {
        return res.status(404).json({ message: "Mailbox not found" });
      }

      // Delete from mailcow
      if (mailbox.mailcowMailboxId) {
        await mailcowApi.deleteMailbox(mailbox.mailcowMailboxId);
      }

      // Delete from database
      await storage.deleteMailbox(id);

      res.json({ message: "Mailbox deleted successfully" });
    } catch (error) {
      console.error("Error deleting mailbox:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete mailbox" 
      });
    }
  });

  app.post("/api/mailboxes/:id/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const mailbox = await storage.getUserMailbox(userId, id);
      if (!mailbox) {
        return res.status(404).json({ message: "Mailbox not found" });
      }

      // Reset password in mailcow
      if (mailbox.mailcowMailboxId) {
        await mailcowApi.resetMailboxPassword(mailbox.mailcowMailboxId, password);
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to reset password" 
      });
    }
  });

  // Alias routes
  app.get("/api/aliases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aliases = await storage.getUserAliases(userId);
      res.json(aliases);
    } catch (error) {
      console.error("Error fetching aliases:", error);
      res.status(500).json({ message: "Failed to fetch aliases" });
    }
  });

  app.post("/api/aliases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const aliasData = insertAliasSchema.parse({ ...req.body, userId });

      // Verify domain ownership
      const domain = await storage.getUserDomain(userId, aliasData.domainId);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      // Create alias in mailcow
      const mailcowAliasId = await mailcowApi.createAlias(
        aliasData.address,
        aliasData.destination
      );

      // Save to database
      const alias = await storage.createAlias({
        ...aliasData,
        mailcowAliasId,
      });

      res.json(alias);
    } catch (error) {
      console.error("Error creating alias:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create alias" 
      });
    }
  });

  app.patch("/api/aliases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updates = req.body;

      const alias = await storage.getUserAlias(userId, id);
      if (!alias) {
        return res.status(404).json({ message: "Alias not found" });
      }

      // Update in mailcow
      if (alias.mailcowAliasId) {
        const mailcowUpdates: any = {};
        if (updates.destination) mailcowUpdates.goto = updates.destination;
        if (updates.isActive !== undefined) mailcowUpdates.active = updates.isActive;

        await mailcowApi.updateAlias(alias.mailcowAliasId, mailcowUpdates);
      }

      // Update in database
      const updatedAlias = await storage.updateAlias(id, updates);

      res.json(updatedAlias);
    } catch (error) {
      console.error("Error updating alias:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update alias" 
      });
    }
  });

  app.delete("/api/aliases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const alias = await storage.getUserAlias(userId, id);
      if (!alias) {
        return res.status(404).json({ message: "Alias not found" });
      }

      // Delete from mailcow
      if (alias.mailcowAliasId) {
        await mailcowApi.deleteAlias(alias.mailcowAliasId);
      }

      // Delete from database
      await storage.deleteAlias(id);

      res.json({ message: "Alias deleted successfully" });
    } catch (error) {
      console.error("Error deleting alias:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete alias" 
      });
    }
  });

  // Stats route
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
