# Motoristas / Entregadores

> Rotas acessadas pelo painel admin e pela empresa para gerenciar motoristas.

---

## GET `/driver`
Lista todos os motoristas. Apenas `ADMIN`.

**Protegido**

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `page` | number | Pagina (default: 1) |
| `perPage` | number | Itens por pagina (default: 20) |
| `status` | string | `ACTIVE`, `INACTIVE`, `PENDING` |
| `search` | string | Busca por nome, CPF, email |
| `isOnline` | boolean | Filtrar motoristas online |

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Joao Silva",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999",
      "cpf": "***.***.***-00",
      "status": "ACTIVE",
      "isOnline": true,
      "rating": 4.8,
      "totalDeliveries": 320,
      "balance": 1200.00,
      "vehicle": {
        "plate": "ABC-1234",
        "model": "VW Delivery",
        "vehicleType": { "id": "uuid", "name": "Caminhao 3/4" }
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 50, "page": 1, "perPage": 20, "lastPage": 3 }
}
```

---

## GET `/driver/:id`
Detalhe de um motorista.

**Protegido** — `ADMIN` ou o proprio motorista.

### Resposta 200
```json
{
  "id": "uuid",
  "name": "Joao Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "cpf": "000.000.000-00",
  "dateOfBirth": "1990-01-15",
  "photo": "https://storage.../foto.jpg",
  "status": "ACTIVE",
  "isOnline": true,
  "rating": 4.8,
  "totalDeliveries": 320,
  "balance": 1200.00,
  "address": {
    "street": "Rua das Palmeiras",
    "number": "456",
    "neighborhood": "Jardim",
    "city": "Sao Paulo",
    "state": "SP",
    "zipCode": "04000-000"
  },
  "vehicle": {
    "id": "uuid",
    "plate": "ABC-1234",
    "model": "VW Delivery",
    "year": 2020,
    "color": "Branco",
    "vehicleType": { "id": "uuid", "name": "Caminhao 3/4" }
  },
  "bankAccount": {
    "bank": "Nubank",
    "agency": "0001",
    "account": "12345-6",
    "pixKey": "joao@email.com",
    "pixKeyType": "EMAIL"
  },
  "documents": {
    "cnh": "https://storage.../cnh.jpg",
    "cnhExpiry": "2028-01-15",
    "vehicleDocument": "https://storage.../doc.jpg"
  },
  "deliveriesHistory": [],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## PATCH `/driver/:id`
Atualiza dados de um motorista.

**Protegido** — `ADMIN` ou o proprio motorista.

### Body (campos opcionais)
```json
{
  "name": "Joao Silva",
  "phone": "(11) 88888-8888",
  "address": { "...": "..." },
  "bankAccount": { "...": "..." }
}
```

---

## PATCH `/driver/:id/status`
Ativa ou inativa um motorista. Apenas `ADMIN`.

**Protegido**

### Body
```json
{
  "status": "INACTIVE",
  "reason": "Documentacao vencida"
}
```

---

## PATCH `/driver/me/online`
Motorista marca presenca online/offline. Apenas `DRIVER`.

**Protegido**

### Body
```json
{
  "isOnline": true
}
```

### Resposta 200
```json
{
  "isOnline": true,
  "message": "Voce esta online e recebendo fretes"
}
```

---

## GET `/driver/me/deliveries`
Lista o historico de fretes do motorista autenticado.

**Protegido** — apenas `DRIVER`.

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `page` | number | Pagina |
| `status` | string | Filtrar por status |
| `startDate` | string | Data inicio |
| `endDate` | string | Data fim |

---

## POST `/driver/:id/document`
Upload de documento do motorista (CNH, documento do veiculo).

**Protegido** — `ADMIN` ou o proprio motorista.

### Body (multipart/form-data)
| Campo | Tipo | Descricao |
|-------|------|-----------|
| `type` | string | `CNH`, `VEHICLE_DOCUMENT`, `PHOTO` |
| `file` | file | Arquivo da imagem (jpg, png, pdf) |
| `expiryDate` | string | Data de vencimento (apenas CNH) |

### Resposta 201
```json
{
  "url": "https://storage.../arquivo.jpg",
  "type": "CNH",
  "expiryDate": "2028-01-15"
}
```
