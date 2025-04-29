export const API_CONFIG = {
  JOLPICA: {
    baseUrl: process.env.NEXT_PUBLIC_JOLPICA_API_BASE,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  DHL: {
    baseUrl: process.env.NEXT_PUBLIC_DHL_API_BASE,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  F1_MEDIA: {
    baseUrl: process.env.NEXT_PUBLIC_F1_MEDIA_BASE,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
  OPEN_F1: {
    baseUrl: process.env.NEXT_PUBLIC_OPEN_F1_API_BASE,
    revalidationTime: parseInt(process.env.REVALIDATION_TIME || "3600"),
  },
};