<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen px-6 py-10 sm:px-10">
    <div class="mx-auto flex max-w-5xl flex-col">
      <div class="mb-12 flex items-center gap-3">
        <span class="text-2xl">🧘</span>
        <h1 class="text-2xl font-bold text-white">Pausas Activas</h1>
      </div>

      <section class="mx-auto w-full max-w-3xl space-y-8 text-center">
        <div class="inline-flex items-center rounded-full border border-pa-accent/40 bg-pa-surface px-4 py-2 text-sm font-medium text-pa-accent">
          Cumple con la Resolucion 1843 de 2025
        </div>

        <h2 class="text-4xl font-bold leading-tight text-white sm:text-6xl">
          Tu salud
          <span class="text-pa-accent"> no puede esperar 2 horas</span>
        </h2>

        <p class="mx-auto max-w-2xl text-lg text-pa-text-muted">
          Transforma tu jornada laboral con pausas activas inteligentes. Reduce tension fisica, mejora la energia
          diaria y registra tu cumplimiento en tiempo real.
        </p>

        <div class="pt-2">
          <router-link to="/login" class="btn-primary inline-flex min-w-52 justify-center">
            Ir a Login
          </router-link>
        </div>
      </section>

      <section class="mx-auto mt-14 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
        <article class="card text-left">
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-pa-text-muted">Productividad</h3>
          <p class="text-sm text-pa-text-muted">Mejora enfoque y ritmo de trabajo con pausas guiadas durante el dia.</p>
        </article>
        <article class="card text-left">
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-pa-text-muted">Bienestar</h3>
          <p class="text-sm text-pa-text-muted">Disminuye molestias de cuello, espalda y fatiga por sedentarismo.</p>
        </article>
        <article class="card text-left">
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-pa-text-muted">Cumplimiento</h3>
          <p class="text-sm text-pa-text-muted">Visualiza estadisticas y evidencia de cumplimiento de tu jornada.</p>
        </article>
      </section>
    </div>
  </div>
</template>
