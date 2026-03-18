# Faturamento e Pagamentos

> Controla o saldo dos motoristas, repasses e historico financeiro.

---

## Modelo de negocio

```
Empresa paga o frete → Plataforma retém taxa → Motorista recebe saldo → Motorista solicita saque
```

---

## GET `/billing`
Lista lancamentos de faturamento. `ADMIN` ve todos; `DRIVER` ve apenas os seus.

**Protegido**

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `page` | number | Pagina (default: 1) |
| `perPage` | number | Itens por pagina (default: 20) |
| `type` | string | `CREDIT`, `DEBIT`, `WITHDRAWAL` |
| `driverId` | string | Filtrar por motorista (apenas ADMIN) |
| `startDate` | string | Data inicio (ISO 8601) |
| `endDate` | string | Data fim (ISO 8601) |

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "accessKey": "FF-2025-000001",
      "type": "CREDIT",
      "amount": 350.00,
      "platformFee": 52.50,
      "netAmount": 297.50,
      "description": "Frete FF-1234-5678 concluido",
      "delivery": {
        "id": "uuid",
        "publicId": "FF-1234-5678"
      },
      "driver": {
        "id": "uuid",
        "name": "Joao Silva"
      },
      "status": "COMPLETED",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "meta": { "total": 200, "page": 1, "perPage": 20, "lastPage": 10 },
  "summary": {
    "totalCredits": 5000.00,
    "totalDebits": 200.00,
    "totalWithdrawals": 1000.00,
    "currentBalance": 3800.00
  }
}
```

---

## GET `/billing/:id`
Detalhe de um lancamento.

**Protegido**

### Resposta 200
```json
{
  "id": "uuid",
  "accessKey": "FF-2025-000001",
  "type": "CREDIT",
  "amount": 350.00,
  "platformFee": 52.50,
  "platformFeePercent": 15,
  "netAmount": 297.50,
  "description": "Frete FF-1234-5678 concluido",
  "delivery": {
    "id": "uuid",
    "publicId": "FF-1234-5678",
    "originCity": "Sao Paulo",
    "destinationCity": "Campinas"
  },
  "driver": {
    "id": "uuid",
    "name": "Joao Silva",
    "email": "joao@email.com"
  },
  "status": "COMPLETED",
  "paidAt": "2025-01-01T12:05:00.000Z",
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

---

## GET `/billing/balance`
Saldo atual do motorista autenticado. Apenas `DRIVER`.

**Protegido**

### Resposta 200
```json
{
  "available": 1200.00,
  "pending": 297.50,
  "total": 1497.50,
  "lastUpdated": "2025-01-01T12:00:00.000Z"
}
```

---

## POST `/billing/withdrawal`
Solicita saque do saldo. Apenas `DRIVER`.

**Protegido**

### Body
```json
{
  "amount": 500.00,
  "pixKey": "joao@email.com"
}
```

### Resposta 201
```json
{
  "id": "uuid",
  "amount": 500.00,
  "pixKey": "joao@email.com",
  "status": "PENDING",
  "estimatedDate": "2025-01-02",
  "createdAt": "2025-01-01T15:00:00.000Z"
}
```

### Erros
| Codigo | Motivo |
|--------|--------|
| 400 | Saldo insuficiente |
| 400 | Valor minimo nao atingido (ex: R$ 50,00) |
| 422 | Chave PIX invalida |

---

## GET `/billing/extract`
Extrato detalhado de um periodo. Apenas `ADMIN` e `DRIVER`.

**Protegido**

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `startDate` | string | Data inicio (obrigatorio) |
| `endDate` | string | Data fim (obrigatorio) |
| `driverId` | string | Filtrar por motorista (apenas ADMIN) |

### Resposta 200
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "summary": {
    "grossRevenue": 10000.00,
    "platformFees": 1500.00,
    "netRevenue": 8500.00,
    "withdrawals": 3000.00,
    "balance": 5500.00,
    "totalDeliveries": 45
  },
  "transactions": []
}
```

---

## PATCH `/billing/withdrawal/:id`
Aprova ou rejeita um saque. Apenas `ADMIN`.

**Protegido**

### Body
```json
{
  "status": "APPROVED",
  "transactionId": "pix-transaction-id",
  "note": ""
}
```

### Status possiveis
| Status | Descricao |
|--------|-----------|
| `PENDING` | Aguardando aprovacao |
| `APPROVED` | Aprovado e processando PIX |
| `COMPLETED` | PIX enviado com sucesso |
| `REJECTED` | Rejeitado pelo admin |
