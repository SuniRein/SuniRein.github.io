import { viteBundler } from '@vuepress/bundler-vite';
import { plumeTheme } from 'vuepress-theme-plume';
import { defineUserConfig } from 'vuepress';

import { feedPlugin } from '@vuepress/plugin-feed';

import notes from './notes';

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'SuniRein 的个人小站',
    description: '一名普通技术宅的个人博客',

    bundler: viteBundler(),

    theme: plumeTheme({
        codeHighlighter: {
            lineNumbers: false,
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
    ],
});
