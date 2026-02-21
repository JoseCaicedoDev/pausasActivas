<script setup lang="ts">
import { ref } from 'vue'
import { forgotPassword } from '@/services/authApi'
import { ApiError } from '@/services/apiClient'
import AuthFormField from '@/components/forms/AuthFormField.vue'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await forgotPassword(email.value.trim())
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
        <AuthFormField
          id="forgot-email"
          v-model="email"
          label="Correo"
          name="email"
          type="email"
          autocomplete="email"
        />
        <p v-if="errorMessage" class="text-xs text-red-400" aria-live="polite">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-xs text-green-400" aria-live="polite">{{ successMessage }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar enlace' }}
        </button>
      </form>
      <router-link class="text-xs text-pa-accent hover:underline" to="/login">Volver a login</router-link>
    </div>
  </div>
</template>
