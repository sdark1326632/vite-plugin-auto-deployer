import { Plugin } from 'vite';

interface VitePluginAutoServerUploadOptions {
  mode?: string;
  host: string;
  port?: number;
  username?: string;
  password?: string;
  path: string;
  outDir?: string;
  readyTimeout?: number;
}

// 定义插件的导出函数类型
declare function vitePluginAutoServerUpload(options: VitePluginAutoServerUploadOptions | VitePluginAutoServerUploadOptions[]): Plugin;

export = vitePluginAutoServerUpload;