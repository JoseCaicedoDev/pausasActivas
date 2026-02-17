<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/apiClient'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function submit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/panel'
    await router.push(redirect)
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'No fue posible iniciar sesion'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-white">Iniciar sesion</h2>
      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1">
          <label for="login-email" class="text-sm text-pa-text-muted">Correo</label>
          <input
            id="login-email"
            v-model.trim="email"
            name="email"
            type="email"
            autocomplete="email"
            spellcheck="false"
            required
            class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
          />
        </div>
        <div class="space-y-1">
          <label for="login-password" class="text-sm text-pa-text-muted">Contrasena</label>
          <input
            id="login-password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-pa-surface-hover bg-pa-bg px-3 py-2 text-sm"
          />
        </div>
        <p v-if="errorMessage" class="text-xs text-red-400" aria-live="polite">{{ errorMessage }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
      <div class="flex items-center justify-between text-xs">
        <router-link class="text-pa-accent hover:underline" to="/registro">Crear cuenta</router-link>
        <router-link class="text-pa-text-muted hover:underline" to="/olvide-contrasena">Olvide mi contrasena</router-link>
      </div>
    </div>
  </div>
</template>
