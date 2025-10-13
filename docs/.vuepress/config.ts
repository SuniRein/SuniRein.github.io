import { viteBundler } from '@vuepress/bundler-vite';
import { plumeTheme } from 'vuepress-theme-plume';
import { defineUserConfig } from 'vuepress';

import { feedPlugin } from '@vuepress/plugin-feed';
import { linksCheckPlugin } from '@vuepress/plugin-links-check';

import notes from './notes';

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'SuniRein 的个人小站',
    description: '一名普通技术宅的个人博客',
    head: [['link', { rel: 'icon', href: '/images/logo.svg' }]],

    bundler: viteBundler(),

    theme: plumeTheme({
        codeHighlighter: {
            lineNumbers: false,
            langAlias: {
                just: 'make',
                caddy: 'nu',
            },
        },

        comment: {
            provider: 'Giscus',
            comment: true,
            repo: 'SuniRein/blog-comment',
            repoId: 'R_kgDON36RWA',
            category: 'Announcements',
            categoryId: 'DIC_kwDON36RWM4Cm3sZ',
            lightTheme: 'light_protanopia',
            darkTheme: 'dark_dimmed',
        },

        encrypt: {
            rules: {
                '随笔/个人小结/2024年度总结.md': '2024-summary',
            },
        },

        markdown: {
            annotation: true,
            npmTo: {
                tabs: ['pnpm', 'npm', 'yarn'],
            },
            mermaid: true,
        },

        hostname: 'https://sunirein.tech',

        notes,
    }),

    plugins: [
        feedPlugin({
            hostname: 'https://sunirein.tech',
            atom: true,
            devServer: true,
        }),

        linksCheckPlugin({}),
    ],
});
