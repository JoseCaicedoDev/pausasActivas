<script setup lang="ts">
</script>

<template>
  <div class="space-y-6 pb-4">
    <h2 class="text-xl font-bold text-white">Acerca de</h2>

    <div class="card space-y-4">
      <div class="text-center">
        <div class="text-5xl mb-3" aria-hidden="true">&#x1F9D8;</div>
        <h3 class="text-lg font-bold text-pa-accent">Pausas Activas</h3>
        <p class="text-sm text-pa-text-muted">SST Colombia v1.0.0</p>
      </div>
      <p class="text-sm leading-relaxed">
        Aplicacion disenada para apoyar el cumplimiento de pausas activas laborales en entornos de oficina,
        conforme a la normativa colombiana de Seguridad y Salud en el Trabajo (SG-SST).
      </p>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-pa-accent">Fundamento Legal</h3>
      <div class="space-y-2 text-sm leading-relaxed">
        <p>
          <strong>Resolucion 1843 de 2025</strong> del Ministerio del Trabajo de Colombia establece la obligatoriedad
          de implementar pausas activas como parte del Sistema de Gestion de Seguridad y Salud en el Trabajo (SG-SST).
        </p>
        <p>
          El <strong>Ministerio de Salud de Colombia</strong> recomienda realizar pausas activas de minimo
          <strong> 10 minutos</strong> cada <strong>2 horas</strong> de trabajo continuo frente a pantallas.
        </p>
        <p>
          Las Administradoras de Riesgos Laborales (ARL) promueven estos programas como estrategia de prevencion de
          desordenes musculoesqueleticos y fatiga visual.
        </p>
      </div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-pa-warning">Aviso Medico</h3>
      <div class="space-y-2 text-sm leading-relaxed">
        <p>
          Los ejercicios incluidos en esta aplicacion son de caracter general y estan disenados para personas sin
          condiciones medicas que los contraindiquen.
        </p>
        <p class="text-pa-danger font-medium">
          Si siente dolor intenso, mareo o malestar durante cualquier ejercicio, suspendalo inmediatamente y consulte
          a su medico o a la ARL de su empresa.
        </p>
        <p>
          Esta aplicacion no reemplaza la valoracion medica ocupacional ni el concepto de aptitud laboral emitido por
          un profesional de salud.
        </p>
      </div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold text-pa-text-muted">Categorias de ejercicios</h3>
      <ul class="space-y-2 text-sm">
        <li class="flex items-center gap-2">
          <span class="text-sky-400" aria-hidden="true">•</span>
          <strong>Salud visual:</strong> movimientos oculares y descanso visual.
        </li>
        <li class="flex items-center gap-2">
          <span class="text-emerald-400" aria-hidden="true">•</span>
          <strong>Cuello y hombros:</strong> estiramientos cervicales y de trapecio.
        </li>
        <li class="flex items-center gap-2">
          <span class="text-amber-400" aria-hidden="true">•</span>
          <strong>Manos y munecas:</strong> prevencion del tunel carpiano.
        </li>
        <li class="flex items-center gap-2">
          <span class="text-violet-400" aria-hidden="true">•</span>
          <strong>Espalda:</strong> movilidad vertebral y alivio lumbar.
        </li>
      </ul>
    </div>

    <div class="text-center text-xs text-pa-text-muted py-2">
      <p>Desarrollado para el bienestar laboral colombiano</p>
    </div>
  </div>
</template>
