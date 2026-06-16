import path from "path";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import Compress from "@playform/compress";
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import critters from 'astro-critical-css'; // ✅ 新增：Critical CSS

import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import { remarkNote, addClassNames } from './src/plugins/markdown.custom'

import SITE_INFO from './src/config';
import swup from '@swup/astro';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: SITE_INFO.Site,
  base: '/',

  build: {
    assets: 'vh_static',
  },

  /* =======================
     ✅ 性能核心：Critical CSS
     ======================= */
  integrations: [
    critters({
      // 关键：只内联首屏 CSS，其余异步加载
      preload: true,
      noscriptFallback: true,
      inlineThreshold: 20_000, // ≤20KB 的 CSS 直接内联
      compress: true,
    }),

    swup({
      theme: false,
      animationClass: "vh-animation-",
      containers: [
        ".main-inner > .main-inner-content",
        ".vh-header > .main"
      ],
      smoothScrolling: true,
      progress: true,
      cache: true,

      // ✅ 限制 preload，避免提前拉取阻塞 CSS
      preload: [
        { selector: 'a[href^="/posts/"]', threshold: 0.25 },
        { selector: 'a[href^="/tags/"]', threshold: 0.25 },
      ],

      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),

    Compress({
      HTML: true,
      CSS: true,          // ✅ 开启 CSS 压缩
      JavaScript: true,
      SVG: true,
      Image: false,       // 图片你已单独处理
      Action: {
        Passed: async () => true,
      },
    }),

    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize: (item) => ({
        ...item,
        url: item.url.endsWith('/') ? item.url.slice(0, -1) : item.url,
      }),
    }),

    mdx({
      extendMarkdownConfig: false,
      remarkPlugins: [
        remarkMath,
        remarkDirective,
        remarkNote,
      ],
      rehypePlugins: [
        rehypeKatex,
        rehypeSlug,
        addClassNames,
      ],
    }),
  ],

  /* =======================
     Markdown 配置
     ======================= */
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkDirective,
      remarkNote,
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      addClassNames,
    ],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-light',
    },
  },

  /* =======================
     Vite 优化
     ======================= */
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    css: {
      // ✅ 启用 CSS Code Splitting
      codeSplit: true,
    },

    build: {
      // ✅ 减小 chunk 体积，避免单文件过大
      rollupOptions: {
        output: {
          manualChunks: {
            katex: ['katex'],
            swup: ['@swup/astro'],
          },
        },
      },
    },
  },

  server: {
    host: '0.0.0.0',
  },
});
