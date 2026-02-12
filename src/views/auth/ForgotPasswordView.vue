<script setup lang="ts">
import { ref } from 'vue'
import { forgotPassword } from '@/services/authApi'
import { ApiError } from '@/services/apiClient'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await forgotPassword(email.value)
    successMessage.value = 'Si el correo existe, enviamos instrucciones para restablecer la contrasena.'
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'No fue posible procesar la solicitud'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-white">Olvide mi contrasena</h2>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <label class="text-sm text-pa-text-muted">Correo</label>
          <input
            v-model.trim="email"
            type="email"
            required
            class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
          />
        </div>
        <p v-if="errorMessage" class="text-xs text-red-400">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-xs text-green-400">{{ successMessage }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar enlace' }}
        </button>
      </form>
      <router-link class="text-xs text-pa-accent hover:underline" to="/login">Volver a login</router-link>
    </div>
  </div>
</template>
