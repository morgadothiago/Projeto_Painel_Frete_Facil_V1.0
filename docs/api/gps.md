# GPS e Rastreamento em Tempo Real

> Usa WebSocket (Socket.IO) para atualizacao de localizacao em tempo real.

---

## WebSocket

### Conexao
```
URL: ws://localhost:3001
Path: /socket.io
```

### Autenticacao no handshake
```js
const socket = io("http://localhost:3001", {
  auth: { token: "Bearer eyJ..." }
});
```

---

## Eventos emitidos pelo CLIENT (app mobile — motorista)

### `driver:location`
Motorista envia sua posicao atual continuamente.

```json
{
  "lat": -23.5505,
  "lng": -46.6333,
  "heading": 180,
  "speed": 60,
  "accuracy": 5,
  "deliveryId": "uuid-do-frete-ativo"
}
```

**Frequencia recomendada:** a cada 5 segundos enquanto em frete ativo.

---

### `driver:online`
Motorista fica disponivel para receber fretes.

```json
{
  "lat": -23.5505,
  "lng": -46.6333
}
```

---

### `driver:offline`
Motorista fica indisponivel.

```json
{}
```

---

### `delivery:accept`
Motorista aceita um frete.

```json
{
  "deliveryId": "uuid"
}
```

---

### `delivery:status`
Motorista atualiza o status do frete.

```json
{
  "deliveryId": "uuid",
  "status": "COLLECTING"
}
```

---

## Eventos emitidos pelo SERVER

### `delivery:new`
Emitido para motoristas online quando um novo frete e criado proximo.

```json
{
  "deliveryId": "uuid",
  "publicId": "FF-1234-5678",
  "originCity": "Sao Paulo",
  "destinationCity": "Campinas",
  "estimatedPrice": 350.00,
  "estimatedDistance": 45.2,
  "vehicleType": "Caminhao 3/4",
  "expiresIn": 30
}
```

**Destinatarios:** motoristas dentro de um raio configuravel do ponto de origem.

---

### `driver:location:update`
Emitido para a empresa que solicitou o frete com a posicao atualizada do motorista.

**Room:** `delivery:{deliveryId}`

```json
{
  "deliveryId": "uuid",
  "driverId": "uuid",
  "lat": -23.5550,
  "lng": -46.6360,
  "heading": 175,
  "speed": 55,
  "updatedAt": "2025-01-01T11:30:00.000Z"
}
```

---

### `delivery:status:updated`
Emitido para a empresa quando o status do frete muda.

**Room:** `delivery:{deliveryId}`

```json
{
  "deliveryId": "uuid",
  "publicId": "FF-1234-5678",
  "status": "IN_TRANSIT",
  "updatedAt": "2025-01-01T11:00:00.000Z"
}
```

---

### `delivery:cancelled`
Emitido para o motorista caso a empresa cancele o frete.

```json
{
  "deliveryId": "uuid",
  "reason": "Solicitacao cancelada pela empresa"
}
```

---

## Rooms (salas do Socket.IO)

| Room | Membros | Proposito |
|------|---------|-----------|
| `driver:{driverId}` | O proprio motorista | Notificacoes pessoais |
| `delivery:{deliveryId}` | Empresa + Motorista | Acompanhamento do frete |
| `company:{companyId}` | Todos da empresa | Notificacoes da empresa |
| `admin` | Admins | Monitoramento geral |

---

## REST — Localizacao

### GET `/gps/delivery/:id`
Ultima localizacao conhecida do motorista em um frete.

**Protegido**

### Resposta 200
```json
{
  "deliveryId": "uuid",
  "driverId": "uuid",
  "lat": -23.5550,
  "lng": -46.6360,
  "heading": 175,
  "speed": 55,
  "updatedAt": "2025-01-01T11:30:00.000Z"
}
```

---

### GET `/gps/delivery/:id/history`
Historico de posicoes de um frete (para replay de rota).

**Protegido** — apenas `ADMIN`.

### Resposta 200
```json
{
  "deliveryId": "uuid",
  "points": [
    { "lat": -23.5505, "lng": -46.6333, "at": "2025-01-01T11:00:00.000Z" },
    { "lat": -23.5520, "lng": -46.6340, "at": "2025-01-01T11:05:00.000Z" }
  ]
}
```
