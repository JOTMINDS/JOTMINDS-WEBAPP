import { onRequestOptions as __api_openai_ts_onRequestOptions } from "/Users/kwabenabrefo/j/JOTMINDS/functions/api/openai.ts"
import { onRequestPost as __api_openai_ts_onRequestPost } from "/Users/kwabenabrefo/j/JOTMINDS/functions/api/openai.ts"
import { onRequestOptions as __api_send_otp_ts_onRequestOptions } from "/Users/kwabenabrefo/j/JOTMINDS/functions/api/send-otp.ts"
import { onRequestPost as __api_send_otp_ts_onRequestPost } from "/Users/kwabenabrefo/j/JOTMINDS/functions/api/send-otp.ts"

export const routes = [
    {
      routePath: "/api/openai",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_openai_ts_onRequestOptions],
    },
  {
      routePath: "/api/openai",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_openai_ts_onRequestPost],
    },
  {
      routePath: "/api/send-otp",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_send_otp_ts_onRequestOptions],
    },
  {
      routePath: "/api/send-otp",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_otp_ts_onRequestPost],
    },
  ]