<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/apiClient'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
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
    await auth.register({ email: email.value, password: password.value })
    await router.push('/')
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'No fue posible crear la cuenta'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-white">Crear cuenta</h2>
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
        <div class="space-y-1">
          <label class="text-sm text-pa-text-muted">Contrasena</label>
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
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Creando...' : 'Crear cuenta' }}
        </button>
      </form>
      <p class="text-xs text-pa-text-muted text-center">
        Ya tienes cuenta?
        <router-link class="text-pa-accent hover:underline" to="/login">Inicia sesion</router-link>
      </p>
    </div>
  </div>
</template>
