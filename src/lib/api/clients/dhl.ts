import { BaseApiClient } from './base';
import { DHLEndpoint } from '@/app/dhl/[endpoint]/route';

export class DHLApiClient extends BaseApiClient {
  async fetchFromDHL(endpoint: DHLEndpoint | string): Promise<any> {
    try {
    const response = await fetch(`dhl/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: this.revalidationTime },
    });

    if (!response.ok) throw new Error(`DHL error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch DHL data");
    return null;
  }
  }
}