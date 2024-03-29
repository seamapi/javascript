declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SEAM_API_KEY?: string
      SEAM_ENDPOINT?: string
    }
  }
}

export {}
