import { defineNotesConfig } from 'vuepress-theme-plume';
import gtest from './gtest';

export default defineNotesConfig({
    dir: '/notes/',
    link: '/',
    notes: [gtest],
});
