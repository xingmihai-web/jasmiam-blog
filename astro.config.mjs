import path from "path";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import Compress from "@playform/compress";
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

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
  build: { assets: 'vh_static' },

  integrations: [
    Compress({
      HTML: true,
      CSS: true,
      JavaScript: true,
      SVG: true,
      Image: false,
      Action: {
        Passed: async () => true,
      },
    }),

    swup({
      theme: false,
      animationClass: "vh-animation-",
      containers: [".main-inner>.main-inner-content", ".vh-header>.main"],
      smoothScrolling: true,
      progress: true,
      cache: true,
      preload: [
        { selector: 'a[href^="/posts/"]', threshold: 0.25 },
      ],
      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
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
      remarkPlugins: [remarkMath, remarkDirective, remarkNote],
      rehypePlugins: [rehypeKatex, rehypeSlug, addClassNames],
    }),
  ],

  markdown: {
    remarkPlugins: [remarkMath, remarkDirective, remarkNote],
    rehypePlugins: [rehypeKatex, rehypeSlug, addClassNames],
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-light' },
  },

  vite: {
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    css: {
      codeSplit: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            katex: ['rehype-katex', 'katex'],
            swup: ['@swup/astro'],
          },
        },
      },
    },
  },

  server: { host: '0.0.0.0' },
});
