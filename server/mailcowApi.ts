interface MailcowConfig {
  apiUrl: string;
  apiKey: string;
}

interface MailcowDomain {
  domain: string;
  description?: string;
  active: boolean;
}

interface MailcowMailbox {
  local_part: string;
  domain: string;
  name?: string;
  password: string;
  quota: number;
  active: boolean;
}

interface MailcowAlias {
  address: string;
  goto: string;
  active: boolean;
}

interface MailcowResponse<T = any> {
  type: string;
  msg: T;
}

class MailcowAPI {
  private config: MailcowConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.MAILCOW_API_URL || "https://mail.byteshifted.net/api/v1",
      apiKey: process.env.MAILCOW_API_KEY || "",
    };

    if (!this.config.apiKey) {
      console.warn("MAILCOW_API_KEY not provided. Mailcow operations will be simulated.");
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<T> {
    if (!this.config.apiKey) {
      throw new Error("Mailcow API key not configured");
    }

    const url = `${this.config.apiUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.config.apiKey,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailcow API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  // Domain operations
  async createDomain(domain: string, description?: string): Promise<string> {
    const payload: MailcowDomain = {
      domain,
      description,
      active: true,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/add/domain", "POST", payload);
    
    if (response[0]?.type === "success") {
      return domain; // Return domain name as ID
    }
    
    throw new Error(`Failed to create domain: ${response[0]?.msg}`);
  }

  async updateDomain(domain: string, updates: Partial<MailcowDomain>): Promise<void> {
    const payload = {
      items: [domain],
      attr: updates,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/edit/domain", "POST", payload);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to update domain: ${response[0]?.msg}`);
    }
  }

  async deleteDomain(domain: string): Promise<void> {
    const response = await this.makeRequest<MailcowResponse[]>(`/delete/domain`, "POST", [domain]);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to delete domain: ${response[0]?.msg}`);
    }
  }

  // Mailbox operations
  async createMailbox(
    localPart: string,
    domain: string,
    password: string,
    quota: number,
    name?: string
  ): Promise<string> {
    const payload: MailcowMailbox = {
      local_part: localPart,
      domain,
      name,
      password,
      quota,
      active: true,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/add/mailbox", "POST", payload);
    
    if (response[0]?.type === "success") {
      return `${localPart}@${domain}`; // Return email as ID
    }
    
    throw new Error(`Failed to create mailbox: ${response[0]?.msg}`);
  }

  async updateMailbox(email: string, updates: Partial<MailcowMailbox>): Promise<void> {
    const payload = {
      items: [email],
      attr: updates,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/edit/mailbox", "POST", payload);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to update mailbox: ${response[0]?.msg}`);
    }
  }

  async deleteMailbox(email: string): Promise<void> {
    const response = await this.makeRequest<MailcowResponse[]>(`/delete/mailbox`, "POST", [email]);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to delete mailbox: ${response[0]?.msg}`);
    }
  }

  async resetMailboxPassword(email: string, newPassword: string): Promise<void> {
    await this.updateMailbox(email, { password: newPassword });
  }

  // Alias operations
  async createAlias(address: string, destination: string): Promise<string> {
    const payload: MailcowAlias = {
      address,
      goto: destination,
      active: true,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/add/alias", "POST", payload);
    
    if (response[0]?.type === "success") {
      return address; // Return address as ID
    }
    
    throw new Error(`Failed to create alias: ${response[0]?.msg}`);
  }

  async updateAlias(address: string, updates: Partial<MailcowAlias>): Promise<void> {
    const payload = {
      items: [address],
      attr: updates,
    };

    const response = await this.makeRequest<MailcowResponse[]>("/edit/alias", "POST", payload);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to update alias: ${response[0]?.msg}`);
    }
  }

  async deleteAlias(address: string): Promise<void> {
    const response = await this.makeRequest<MailcowResponse[]>(`/delete/alias`, "POST", [address]);
    
    if (response[0]?.type !== "success") {
      throw new Error(`Failed to delete alias: ${response[0]?.msg}`);
    }
  }

  // Utility methods
  async getMailboxUsage(email: string): Promise<{ used: number; quota: number }> {
    try {
      const response = await this.makeRequest<any>(`/get/mailbox/${email}`);
      return {
        used: response.quota_used || 0,
        quota: response.quota || 0,
      };
    } catch (error) {
      console.warn(`Failed to get mailbox usage for ${email}:`, error);
      return { used: 0, quota: 0 };
    }
  }
}

export const mailcowApi = new MailcowAPI();
