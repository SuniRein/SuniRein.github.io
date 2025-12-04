<script setup lang="ts">
import { computed } from 'vue';

const { lastUpdated } = defineProps<{
    lastUpdated: Date;
}>();

const now = new Date();
const diffDays = computed(() => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = now.getTime() - lastUpdated.getTime();
    return Math.floor(diff / msPerDay);
});
</script>

<template>
    <div class="last-updated-hint">
        本文最后更新于 {{ diffDays }} 天前，部分内容可能已不再适用，阅读时请留意时效性。
    </div>
</template>

<style scoped>
.last-updated-hint {
    display: inline-block;
    color: var(--vp-c-warning-2);
    background-color: var(--vp-custom-block-warning-code-bg);
    padding: 0.5em 1em;
    margin-bottom: 1em;
    border: 1px solid var(--vp-c-warning-3);
    border-radius: 8px;
}
</style>
