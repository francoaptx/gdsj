<template>
  <div class="search-bar">
    <input
      v-model="query"
      @input="onSearch"
      placeholder="Buscar por número, Cite, remitente, referencia..."
      type="text"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  onSearch: (query: string) => void;
}>();
const query = defineModel<string>('query', { default: '' });

watch(query, () => props.onSearch(query.value));
</script>