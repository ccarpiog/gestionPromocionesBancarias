# Gestión de Promociones Bancarias  
**PRD – Google Apps Script WebApp + Google Sheets Backend**

## 0. Resumen
Aplicación web (Google Apps Script) para gestionar promociones bancarias y depósitos a plazo, con seguimiento de condiciones, planificación de transferencias tipo “nómina” (tintos), control manual de cumplimiento, ciclos de revisión personalizados y alertas por email.  
Los datos se almacenan en Google Sheets; el usuario proporciona y confirma manualmente la información (no hay conexión automática con bancos).

---

## 1. Objetivos
- Centralizar la gestión de promociones bancarias.
- Recordar cuándo enviar transferencias y cuándo vencen promociones o depósitos.
- Registrar **cumplimiento de condiciones** por periodos definidos.
- Mantener **historial y documentos** asociados.
- Reducir riesgo de perder beneficios por olvido.

---

## 2. Terminología Clave
| Término | Significado |
|--------|-------------|
| **Bodega** | Banco capaz de enviar transferencias **marcadas como nómina** (tintos). |
| **Tintos** | Transferencias enviadas marcadas como **salario/nómina**. |
| **Promoción** | Oferta bancaria o depósito que requiere condiciones y tiene beneficios. |
| **Periodo** | Intervalo de evaluación de condiciones (p.ej. del día 5 al 4 del mes siguiente). |
| **Condición** | Requisito que debe cumplirse en una promoción. |

---

## 3. Requisitos Funcionales

### 3.1 Gestión de Promociones
El usuario puede:
- Crear y editar promociones.
- Seleccionar banco.
- **Introducir número de cuenta** asociado a la promoción.
- Elegir tipo de promoción (`Plazo fijo`, `Promoción transferencias`, `Otro` + posibilidad de añadir nuevos tipos).
- Definir fechas (inicio, fin).
- Describir beneficios y notas.
- Marcar promoción como **Activa**, **En pausa**, **Completada**, **Fallida** o **Expirada**.
- Mostrar/ocultar promociones expiradas desde un filtro.

### 3.2 Condiciones
Cada promoción puede incluir una o varias condiciones, tales como:
- Mantener **saldo mínimo**.
- Tener **Bizum activo** con un número concreto.
- Recibir transferencias por encima de cierta cantidad y si deben estar **marcadas como nómina** (tintos).
- Número de **recibos** domiciliados al mes.
- Número de **compras con tarjeta** al mes.
- Condiciones **puntuales** (e.g., pasar dinero desde otra entidad una vez).

#### Importante:
- **No se obtiene información automática** de los bancos.
- El sistema evaluará condiciones como **Pendiente / Cumplida / No cumpliada**, pero el **usuario será quien marque manualmente el resultado final** por periodo o por condición puntual.
- La aplicación facilita un checklist con botones tipo:
  - ✅ Cumplido
  - ⚠️ Pendiente
  - ❌ No cumple

### 3.3 Periodos
- Cada promoción define su **ciclo de revisión**. Por ejemplo:
  - Del día 5 al día 4 del siguiente mes.
  - Del día 12 al día 11.
- El sistema genera automáticamente los periodos futuros a partir de la configuración.

### 3.4 Transferencias (Tintos)
- El usuario puede registrar transferencias entre bancos.
- Se indica:
  - Banco origen
  - Banco destino
  - Importe
  - Fecha planificada y fecha realizada
  - Si se marcó como **nómina** (solo permitido desde bancos marcados como **Bodega**)
- El sistema puede:
  - Mostrar qué transferencias están próximas o atrasadas.
  - Enviar notificaciones recordatorias.

### 3.5 Documentos
- Cada promoción podrá tener documentos adjuntos (subidos a Drive).
- Ejemplos: contrato de apertura, pantallazo de condiciones, justificantes.
- El detalle de la promoción mostrará la lista de archivos.

### 3.6 Notificaciones por Email
El sistema enviará correos cuando:
- Una transferencia programada está próxima a realizarse.
- El periodo está por finalizar y quedan condiciones sin marcar.
- Se acerca la fecha de vencimiento de una promoción o depósito.

### 3.7 Visualización
- **Dashboard** con:
  - Lista de promociones activas (y opción Mostrar expiradas).
  - Estado visual (semáforo) por periodo y condición.
  - Próximas acciones recomendadas.

---

## 4. Modelo de Datos (Google Sheets)

### 4.1 Hoja: `Banks`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| bank_id | Texto (PK) | ID único (slug) |
| name | Texto | Nombre del banco |
| is_bodega | Booleano | Puede enviar **tintos** |
| supports_bizum | Booleano | Tiene Bizum |
| active | Booleano | Mostrar/ocultar en UI |

### 4.2 Hoja: `Promotions`
| Campo | Tipo |
|-------|------|
| promo_id (PK) | Texto |
| bank_id | Texto (FK) |
| account_number | Texto (**nuevo**) |
| type | Texto (enum) |
| title | Texto |
| start_date | Fecha |
| end_date | Fecha |
| benefits | Texto |
| status | Texto (enum) |
| period_cycle_json | Texto (JSON) |
| notes | Texto |

### 4.3 Hoja: `Conditions`
| Campo | Tipo |
|-------|------|
| condition_id (PK) | Texto |
| promo_id | Texto |
| type | Enum |
| params_json | JSON |
| is_recurring | Booleano |

### 4.4 Hoja: `Periods`
| period_id | promo_id | start_ts | end_ts | index | status |

### 4.5 Hoja: `Evaluations`
| eval_id | condition_id | period_id | status (Pending/Met/Failed) | user_notes | marked_by | marked_on |

> Este es el componente clave: **el usuario marca Met / Failed**.

### 4.6 `Transfers`
| transfer_id | from_bank_id | to_bank_id | amount | date_planned | date_done | is_salary_marked | promo_id | status |

### 4.7 `Documents`
| document_id | promo_id | file_id | filename | uploaded_on |

---

## 5. Workflow Resumido
1. Crear promoción → define periodos.
2. Cada mes/periodo → revisar checklist de condiciones.
3. Registrar o planificar transferencias.
4. **Usuario marca manualmente** cada condición como cumplida o no cumplida.
5. El sistema envía recordatorios.
6. Al llegar fin de promoción → marcar estado final y guardar documentos.

---

## 6. Seguridad
- WebApp limitada solo al usuario (o dominio).
- Documentos almacenados en Drive bajo carpeta controlada.
- No se realiza scraping ni conexión a APIs bancarias.

---

## 7. Extensiones Futuras (Opcional)
- Exportar calendario .ics
- Recomendador automático de fechas óptimas de tinto
- Dashboard móvil simplificado

---

## 8. Criterios de éxito
- No perder promociones por olvido.
- Tiempos de revisión por mes reducidos.
- Flujo claro de qué hacer hoy y qué se acerca mañana.

---