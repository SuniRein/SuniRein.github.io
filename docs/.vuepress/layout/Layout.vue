<script setup lang="ts">
import { computed } from 'vue';
import { Layout } from 'vuepress-theme-plume/client';
import { useData } from 'vuepress-theme-plume/composables';

import LastUpdatedHint from './LastUpdatedHint.vue';

const { page } = useData();
const lastUpdated = computed(() => (page.value.git.updatedTime ? new Date(page.value.git.updatedTime) : null));
</script>

<template>
    <Layout>
        <template #doc-meta-bottom>
            <LastUpdatedHint v-if="lastUpdated" :last-updated="lastUpdated" />
        </template>
    </Layout>
</template>
