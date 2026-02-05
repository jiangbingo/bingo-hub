/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BIGMODEL_API_KEY: string;
  // 可以添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
