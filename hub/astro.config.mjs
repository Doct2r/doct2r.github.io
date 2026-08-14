import { defineConfig } from 'astro/config';

// 루트(hub)는 사이트의 진짜 루트(/)에서 서빙된다 — base 오버라이드 불필요.
// 블로그(Hugo)는 /blog/ 서브패스에서 별도로 서빙되며 이 프로젝트와 무관하게 빌드된다.
export default defineConfig({
  site: 'https://doct2r.github.io',
  outDir: './dist',
});
