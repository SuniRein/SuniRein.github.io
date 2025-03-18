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
        plugins: {
            markdownEnhance: {
                mermaid: true,
            },
            markdownPower: {
                // See https://theme-plume.vuejs.press/guide/markdown/npm-to
                npmTo: {
                    tabs: ['pnpm', 'npm', 'yarn'],
                },
                annotation: true,
            },
            shiki: {
                languages: [
                    'ansi',
                    'asm',
                    'c',
                    'cmake',
                    'cpp',
                    'css',
                    'javascript',
                    'nginx',
                    'proto',
                    'rust',
                    'sh',
                    'typescript',
                    'vue',
                    'xml',
                ],
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
