import { viteBundler } from '@vuepress/bundler-vite';
import { plumeTheme } from 'vuepress-theme-plume';
import { defineUserConfig } from 'vuepress';

import { feedPlugin } from '@vuepress/plugin-feed';

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'SuniRein 的个人小站',
    description: '一名普通技术宅的个人博客',

    bundler: viteBundler(),

    theme: plumeTheme({
        plugins: {
            markdownPower: {
                // See https://theme-plume.vuejs.press/guide/markdown/npm-to
                npmTo: {
                    tabs: ['pnpm', 'npm', 'yarn'],
                },
            },
            shiki: {
                languages: ['asm', 'c', 'cpp', 'sh', 'css', 'javascript', 'typescript', 'vue', 'nginx'],
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
        },
        hostname: 'https://sunirein.tech',
    }),

    plugins: [
        feedPlugin({
            hostname: 'https://sunirein.tech',
            atom: true,
            devServer: true,
        }),
    ],
});
