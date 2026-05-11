# Prompts — JPV

## Prompt 1 — Generación de datos de muestra

> Como experto en sql y bases de datos relacionales quiero que generes un conjunto de datos de muestra para poder desarrollar con datos de prueba.

_(con selección IDE en `README.md` línea 16, "seed.ts")_

---

## Prompt 2 — Implementación de endpoints con TDD

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

## Prompt 3 — Ajustes al plan propuesto

> No quiero que metas el singleton que me comentabas, se considera un antipatrón. Busca una alternativa.
> Pon paginación.
> El resto de puntos me parecen bien.
