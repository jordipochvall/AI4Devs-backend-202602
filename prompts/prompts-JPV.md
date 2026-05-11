# Prompts — JPV

Registro de los prompts enviados a Claude Code durante esta sesión, hasta antes de _"Me puedes generar la urls para estos endpoints?"_ (excluido).

---

## Prompt 1 — Lectura del README y arranque del backend

> Puedes leer el README.md para documentarte y levantar la app?

_(con selección IDE en `README.md` línea 16)_

---

## Prompt 2 — Arranque del frontend

> Levantalo

_(respuesta a la pregunta del asistente sobre si arrancar también el frontend)_

---

## Prompt 3 — Generación de datos de muestra

> Como experto en sql y bases de datos relacionales quiero que generes un conjunto de datos de muestra para poder desarrollar con datos de prueba.

_(con selección IDE en `README.md` línea 16, "seed.ts")_

---

## Prompt 4 — Implementación de endpoints con TDD

_(este prompt se reescribió varias veces tras interrupciones; se incluye la versión final completa que el asistente procesó)_

> Quiero que adoptes el rol de un developer senior con varios años de experiencia desarrollando microservicios con api rest. Tienes experiencia en las buenas prácticas como son TDD, SOLID o CUPID.
>
> Quiero que implementes los siguientes endpoints:
>
> **GET /positions/:id/candidates**
>
> Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:
>
> - Nombre completo del candidato (de la tabla candidate).
> - current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
> - La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score
>
> **PUT /candidates/:id/stage**
>
> Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.
>
> Para ambos endpoints quiero que se testeen los diferentes niveles de código.
> Presentame un plan y no asumas nada, prefiero que preguntes a que asumas unilateralmente.

---

## Prompt 5 — Ajustes al plan propuesto

> No quiero que metas el singleton que me comentabas, se considera un antipatrón. Busca una alternativa.
> Pon paginación.
> E[l] resto de punto[s] me parecen bien.

---

## Prompt 6 — Luz verde para empezar la implementación

> sí

_(respuesta a "¿Luz verde para empezar por la Fase 0?")_

---

## Prompt 7 — Confirmación para crear los commits separados

> sí

_(respuesta a "¿Quieres que prepare los commits separados (uno por fase)?")_
