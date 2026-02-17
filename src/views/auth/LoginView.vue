<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/apiClient'
import AuthFormField from '@/components/forms/AuthFormField.vue'

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
    await auth.login({ email: email.value.trim(), password: password.value })
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
        <AuthFormField
          id="login-email"
          v-model="email"
          label="Correo"
          name="email"
          type="email"
          autocomplete="email"
        />
        <AuthFormField
          id="login-password"
          v-model="password"
          label="Contrasena"
          name="password"
          type="password"
          autocomplete="current-password"
        />
        <p v-if="errorMessage" class="text-xs text-red-400" aria-live="polite">{{ errorMessage }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      <div class="flex items-center justify-between text-xs">
        <router-link class="text-pa-accent hover:underline" to="/registro">Crear cuenta</router-link>
        <router-link class="text-pa-text-muted hover:underline" to="/olvide-contrasena">Olvide mi contrasena</router-link>
      </div>
    </div>
  </div>
</template>
