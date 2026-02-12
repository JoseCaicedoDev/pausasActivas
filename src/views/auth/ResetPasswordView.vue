<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/authApi'
import { ApiError } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()
const token = computed(() => String(route.query.token || ''))

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'Token de recuperacion invalido'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = 'La contrasena debe tener al menos 8 caracteres'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contrasenas no coinciden'
    return
  }

  isLoading.value = true
  try {
    await resetPassword(token.value, password.value)
    successMessage.value = 'Contrasena actualizada. Redirigiendo a login...'
    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'No fue posible restablecer la contrasena'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-white">Restablecer contrasena</h2>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <label class="text-sm text-pa-text-muted">Nueva contrasena</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-pa-text-muted">Confirmar contrasena</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
          />
        </div>
        <p v-if="errorMessage" class="text-xs text-red-400">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-xs text-green-400">{{ successMessage }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Actualizando...' : 'Actualizar contrasena' }}
        </button>
      </form>
    </div>
  </div>
</template>
