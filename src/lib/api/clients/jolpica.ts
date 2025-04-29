import { transformResponse } from "@/lib/utils";
import { BaseApiClient } from "./base";
import { PaginationInfo } from "@/types";

export class JolpicaApiClient extends BaseApiClient {
  async fetchFromApi<T>(
    endpoint: string,
    dataKey: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<{ data: T } & PaginationInfo> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const mrData = (await this.fetch(`${endpoint}.json?${queryParams}`)) as {
      MRData: any;
    };
    return transformResponse<T>(mrData.MRData, dataKey);
  }

  async fetchWithDelay<T>(
    endpoint: string,
    dataKey: string,
    delay: number,
    limit: number,
    offset: number
  ): Promise<{data: T} & PaginationInfo> {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return this.fetchFromApi<T>(endpoint, dataKey, limit, offset);
  }
}
