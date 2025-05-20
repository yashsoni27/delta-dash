export const API_CONFIG = {
  JOLPICA: {
    baseUrl: process.env.NEXT_PUBLIC_JOLPICA_API_BASE as string,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  DHL: {
    baseUrl: process.env.NEXT_PUBLIC_DHL_API_BASE as string,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  F1_MEDIA: {
    baseUrl: process.env.NEXT_PUBLIC_F1_MEDIA_BASE as string,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  OPEN_F1: {
    baseUrl: process.env.NEXT_PUBLIC_OPEN_F1_API_BASE as string,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  MULTVIEWER: {
    baseUrl: process.env.NEXT_PUBLIC_MULTVIEWER_BASE as string,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  ELEVENLABS: {
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY as string,
  }
};