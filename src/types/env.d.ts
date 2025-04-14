declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_JOLPICA_API_BASE: string;
      NEXT_PUBLIC_DHL_API_BASE: string;
      DHL_PITSTOP_EVENT_ID: string;
      DHL_FASTEST_PITSTOP_ID: string;
      DHL_AVG_PITSTOP_ID: string;
      NEXT_PUBLIC_F1_MEDIA_BASE: string;
      REVALIDATION_TIME: string;
    }
  }
}

export {}