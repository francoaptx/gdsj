<template>
  <div class="app-modal-overlay" @click.self="closeModal">
    <div class="app-modal-content">
      <h3 :class="{'success': type === 'success', 'error': type === 'error'}">{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="app-modal-actions">
        <button @click="closeModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  title: {
    type: String,
    default: 'Notificación',
  },
  message: {
    type: String,
    required: true,
  },
  type: { // 'success' or 'error'
    type: String,
    default: 'info',
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.app-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Higher than other modals if any */
}

.app-modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 450px;
  text-align: center;
}

.app-modal-content h3 {
  margin-top: 0;
  font-size: 1.5em;
  color: #333;
}

.app-modal-content h3.success { color: #28a745; }
.app-modal-content h3.error { color: #dc3545; }

.app-modal-content p {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 20px;
}

.app-modal-actions button {
  padding: 10px 25px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.app-modal-actions button:hover {
  background-color: #0056b3;
}
</style>