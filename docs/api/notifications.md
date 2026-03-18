# Notificacoes

> Notificacoes push (Firebase FCM) para o app mobile e notificacoes in-app para o painel web.

---

## Eventos que disparam notificacao

### Para o MOTORISTA (push no app)
| Evento | Mensagem |
|--------|---------|
| Novo frete disponivel proximo | "Novo frete disponivel! R$350 — Sao Paulo → Campinas" |
| Frete cancelado pela empresa | "Frete FF-1234 foi cancelado pela empresa" |
| Saque aprovado | "Seu saque de R$500 foi aprovado e processado" |
| Saque rejeitado | "Seu saque de R$500 foi rejeitado. Motivo: ..." |

### Para a EMPRESA (push + email)
| Evento | Mensagem |
|--------|---------|
| Motorista aceitou o frete | "Motorista encontrado para seu frete FF-1234" |
| Motorista a caminho da coleta | "Motorista saiu para buscar sua carga" |
| Coleta realizada | "Sua carga foi coletada. Em transporte!" |
| Entrega concluida | "Frete FF-1234 entregue com sucesso. Total: R$350" |
| Frete sem motorista (timeout) | "Nao encontramos motorista. Tente novamente" |

---

## POST `/notification/token`
Registra o token FCM do dispositivo do usuario autenticado.

**Protegido**

### Body
```json
{
  "fcmToken": "token-do-firebase",
  "platform": "android",
  "deviceId": "uuid-do-dispositivo"
}
```

### Resposta 201
```json
{
  "message": "Token registrado com sucesso"
}
```

---

## DELETE `/notification/token`
Remove o token FCM (usado no logout do app).

**Protegido**

### Body
```json
{
  "fcmToken": "token-do-firebase"
}
```

---

## GET `/notification`
Lista notificacoes do usuario autenticado.

**Protegido**

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `page` | number | Pagina |
| `unreadOnly` | boolean | Apenas nao lidas |

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Frete entregue!",
      "body": "Frete FF-1234-5678 foi entregue com sucesso",
      "type": "DELIVERY_COMPLETED",
      "read": false,
      "data": { "deliveryId": "uuid" },
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "meta": { "total": 20, "page": 1, "perPage": 20, "lastPage": 1 },
  "unreadCount": 5
}
```

---

## PATCH `/notification/:id/read`
Marca uma notificacao como lida.

**Protegido**

### Resposta 200
```json
{
  "id": "uuid",
  "read": true
}
```

---

## PATCH `/notification/read-all`
Marca todas as notificacoes como lidas.

**Protegido**

### Resposta 200
```json
{
  "message": "Todas as notificacoes marcadas como lidas",
  "updated": 5
}
```

---

## Tipos de notificacao (`type`)

| Type | Descricao |
|------|-----------|
| `DELIVERY_NEW` | Novo frete disponivel (motorista) |
| `DELIVERY_ACCEPTED` | Motorista encontrado (empresa) |
| `DELIVERY_COLLECTING` | A caminho da coleta (empresa) |
| `DELIVERY_IN_TRANSIT` | Em transporte (empresa) |
| `DELIVERY_COMPLETED` | Entregue (empresa + motorista) |
| `DELIVERY_CANCELLED` | Cancelado (empresa + motorista) |
| `WITHDRAWAL_APPROVED` | Saque aprovado (motorista) |
| `WITHDRAWAL_REJECTED` | Saque rejeitado (motorista) |
| `ACCOUNT_SUSPENDED` | Conta suspensa (qualquer) |
