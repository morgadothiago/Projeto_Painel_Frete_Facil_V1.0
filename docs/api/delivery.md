# Fretes (Entregas)

## Status possíveis de um frete

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando motorista aceitar |
| `ACCEPTED` | Motorista aceitou, aguardando coleta |
| `COLLECTING` | Motorista a caminho da coleta |
| `IN_TRANSIT` | Em transporte |
| `DELIVERED` | Entregue com sucesso |
| `CANCELLED` | Cancelado |
| `FAILED` | Falha na entrega |

---

## POST `/delivery`
Cria um novo frete. Apenas `COMPANY` ou `ADMIN`.

**Protegido**

### Body
```json
{
  "vehicleTypeId": "uuid",
  "originAddress": {
    "street": "Rua da Coleta",
    "number": "100",
    "complement": "",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "destinationAddress": {
    "street": "Rua da Entrega",
    "number": "200",
    "complement": "Apto 5",
    "neighborhood": "Vila Nova",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "02000-000",
    "lat": -23.5600,
    "lng": -46.6400
  },
  "additionalStops": [],
  "cargoDescription": "Caixas de papelão",
  "weight": 150.5,
  "needsHelper": false,
  "scheduledAt": null,
  "notes": "Entregar no período da manhã"
}
```

### Resposta 201
```json
{
  "id": "uuid",
  "publicId": "FF-1234-5678",
  "status": "PENDING",
  "estimatedPrice": 350.00,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

---

## GET `/delivery`
Lista fretes da empresa autenticada com paginação e filtros.

**Protegido**

### Query params
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `status` | string | Filtrar por status |
| `startDate` | string | Data início (ISO 8601) |
| `endDate` | string | Data fim (ISO 8601) |
| `search` | string | Busca por publicId ou endereço |

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "publicId": "FF-1234-5678",
      "status": "IN_TRANSIT",
      "originAddress": { "city": "São Paulo", "state": "SP" },
      "destinationAddress": { "city": "Campinas", "state": "SP" },
      "estimatedPrice": 350.00,
      "finalPrice": null,
      "driver": {
        "id": "uuid",
        "name": "João Silva",
        "phone": "(11) 99999-9999",
        "vehicle": { "plate": "ABC-1234", "model": "VW Delivery" },
        "rating": 4.8
      },
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T11:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "lastPage": 5
  }
}
```

---

## GET `/delivery/:id`
Detalhe de um frete específico.

**Protegido**

### Resposta 200
```json
{
  "id": "uuid",
  "publicId": "FF-1234-5678",
  "status": "IN_TRANSIT",
  "originAddress": {
    "street": "Rua da Coleta",
    "number": "100",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "destinationAddress": {
    "street": "Rua da Entrega",
    "number": "200",
    "neighborhood": "Vila Nova",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "02000-000",
    "lat": -23.5600,
    "lng": -46.6400
  },
  "additionalStops": [],
  "cargoDescription": "Caixas de papelão",
  "weight": 150.5,
  "needsHelper": false,
  "vehicleType": { "id": "uuid", "name": "Caminhão 3/4", "icon": "truck" },
  "estimatedPrice": 350.00,
  "finalPrice": null,
  "estimatedDistance": 45.2,
  "estimatedDuration": 75,
  "driver": {
    "id": "uuid",
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "photo": "https://...",
    "vehicle": {
      "plate": "ABC-1234",
      "model": "VW Delivery",
      "color": "Branco"
    },
    "rating": 4.8,
    "totalDeliveries": 320
  },
  "currentLocation": {
    "lat": -23.5550,
    "lng": -46.6360,
    "updatedAt": "2025-01-01T11:30:00.000Z"
  },
  "timeline": [
    { "status": "PENDING",    "at": "2025-01-01T10:00:00.000Z" },
    { "status": "ACCEPTED",   "at": "2025-01-01T10:05:00.000Z" },
    { "status": "COLLECTING", "at": "2025-01-01T10:30:00.000Z" },
    { "status": "IN_TRANSIT", "at": "2025-01-01T11:00:00.000Z" }
  ],
  "notes": "Entregar no período da manhã",
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

---

## PATCH `/delivery/:id/status`
Atualiza o status de um frete. Apenas `DRIVER` (para avanços de status) ou `COMPANY`/`ADMIN` (para cancelar).

**Protegido**

### Body
```json
{
  "status": "IN_TRANSIT",
  "note": "Saiu para entrega"
}
```

---

## DELETE `/delivery/:id`
Cancela um frete com status `PENDING`. Apenas `COMPANY` ou `ADMIN`.

**Protegido**

### Resposta 200
```json
{
  "message": "Frete cancelado com sucesso"
}
```

---

## POST `/delivery/simulate`
Simula preço e rota de um frete **antes** de criar. Público.

### Body
```json
{
  "vehicleTypeId": "uuid",
  "originLat": -23.5505,
  "originLng": -46.6333,
  "destinationLat": -23.5600,
  "destinationLng": -46.6400,
  "needsHelper": false,
  "additionalStops": 0
}
```

### Resposta 200
```json
{
  "estimatedPrice": 350.00,
  "estimatedDistance": 45.2,
  "estimatedDuration": 75,
  "priceBreakdown": {
    "base": 200.00,
    "perKm": 100.00,
    "helper": 0.00,
    "additionalStops": 0.00,
    "total": 300.00
  },
  "route": {
    "polyline": "encodedPolylineString",
    "waypoints": []
  }
}
```

---

## POST `/delivery/:id/rate`
Avalia um frete concluído. Apenas `COMPANY`.

**Protegido**

### Body
```json
{
  "rating": 5,
  "comment": "Motorista muito pontual e cuidadoso"
}
```
