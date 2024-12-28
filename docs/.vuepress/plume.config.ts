import { defineThemeConfig } from 'vuepress-theme-plume';

export default defineThemeConfig({
    logo: '/images/logo.svg',
    profile: {
        name: 'SuniRein',
        description: '一名普通的技术宅',
        avatar: '/images/avatar.avif',
        location: '中国 杭州',
        circle: true,
    },
    social: [{ icon: 'github', link: 'https://github.com/SuniRein' }],
    copyright: 'CC-BY-NC-SA-4.0',
});
