import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig(() => {
  const isHttps = process.env.VITE_HTTPS === "true";

  return {
    plugins: [react()],
    server: {
      ...(isHttps && {
        https: {
          // 개발용 자체 서명 인증서 생성 (실제 배포 시에는 유효한 인증서 사용)
          key: fs.readFileSync("./localhost-key.pem").catch(() => null),
          cert: fs.readFileSync("./localhost.pem").catch(() => null),
        },
      }),
      host: true, // 외부 접근 허용
      port: 5173,
    },
    preview: {
      ...(isHttps && {
        https: {
          key: fs.readFileSync("./localhost-key.pem").catch(() => null),
          cert: fs.readFileSync("./localhost.pem").catch(() => null),
        },
      }),
      host: true,
      port: 4173,
    },
  };
});
