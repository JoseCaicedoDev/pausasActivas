<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ accepted: [] }>()
const checked = ref(false)

function handleAccept() {
  if (checked.value) {
    emit('accepted')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[99998] bg-pa-bg flex items-center justify-center p-4">
    <div class="max-w-lg w-full card space-y-6">
      <div class="text-center">
        <div class="text-4xl mb-3">🏥</div>
        <h1 class="text-2xl font-bold text-pa-accent">Pausas Activas</h1>
        <p class="text-pa-text-muted text-sm mt-1">SST Colombia</p>
      </div>

      <div class="bg-pa-bg rounded-xl p-4 space-y-3 text-sm leading-relaxed">
        <h2 class="font-semibold text-pa-warning">Aviso Medico Importante</h2>
        <p>
          Esta aplicacion proporciona ejercicios generales de pausas activas para trabajadores de oficina.
          <strong class="text-pa-danger">Si siente dolor intenso durante cualquier ejercicio, suspendalo
          inmediatamente</strong> y consulte a su medico o a la ARL de su empresa.
        </p>
        <p>
          Los ejercicios no reemplazan la valoracion medica ocupacional ni el concepto de aptitud laboral.
        </p>
      </div>

      <div class="bg-pa-bg rounded-xl p-4 space-y-3 text-sm leading-relaxed">
        <h2 class="font-semibold text-pa-accent">Fundamento Legal</h2>
        <p>
          Las pausas activas son una obligacion del empleador segun la
          <strong>Resolucion 1843 de 2025</strong> del Ministerio del Trabajo de Colombia,
          como parte del Sistema de Gestion de Seguridad y Salud en el Trabajo (SG-SST).
        </p>
        <p>
          Se recomienda una pausa activa de minimo <strong>10 minutos</strong> cada
          <strong>2 horas</strong> de trabajo continuo.
        </p>
      </div>

      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="checked"
          type="checkbox"
          class="mt-1 w-4 h-4 rounded border-pa-surface-hover text-pa-accent focus:ring-pa-accent bg-pa-bg"
        />
        <span class="text-sm">
          He leido y entiendo el aviso medico. Acepto usar esta aplicacion bajo mi responsabilidad
          y consultare a un profesional de salud si tengo alguna condicion medica.
        </span>
      </label>

      <button
        :disabled="!checked"
        class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        @click="handleAccept"
      >
        Aceptar y Continuar
      </button>
    </div>
  </div>
</template>
