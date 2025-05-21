export interface ApiClientConfig {
  baseUrl: string;
  revalidationTime?: number;
}

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected revalidationTime: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl || "";
    this.revalidationTime = config.revalidationTime || 3600;
  }

  protected async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  protected async fetchRaw(
    endpoint: string,
    options?: RequestInit
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response;
  }

  protected async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries = 3
  ): Promise<Response> {
    try {
      const response: any = await this.fetch(url, options);

      if (response?.status === 429 && retries > 0) {
        const retryAfter = parseInt(
          response?.headers.get("retry-after") || "60"
        );
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return this.fetchWithRetry(url, options, retries - 1);
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 5000));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
}
