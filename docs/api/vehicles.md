# Tipos de Veiculo

> Tabela configuravel de veiculos suportados pela plataforma, com suas regras de preco.

---

## GET `/vehicle-type`
Lista todos os tipos de veiculo ativos. Publico.

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Moto",
      "icon": "motorcycle",
      "description": "Ideal para entregas rapidas e pequenas",
      "maxWeight": 30,
      "isActive": true,
      "pricing": {
        "basePrice": 15.00,
        "pricePerKm": 1.50,
        "helperPrice": 0.00,
        "additionalStopPrice": 5.00
      }
    },
    {
      "id": "uuid",
      "name": "Carro",
      "icon": "car",
      "description": "Para pequenos volumes",
      "maxWeight": 300,
      "isActive": true,
      "pricing": {
        "basePrice": 25.00,
        "pricePerKm": 2.00,
        "helperPrice": 30.00,
        "additionalStopPrice": 8.00
      }
    },
    {
      "id": "uuid",
      "name": "Van",
      "icon": "van",
      "description": "Grandes volumes, entregas multiplas",
      "maxWeight": 1500,
      "isActive": true,
      "pricing": {
        "basePrice": 60.00,
        "pricePerKm": 3.50,
        "helperPrice": 50.00,
        "additionalStopPrice": 15.00
      }
    },
    {
      "id": "uuid",
      "name": "Caminhao 3/4",
      "icon": "truck",
      "description": "Cargas medias",
      "maxWeight": 4000,
      "isActive": true,
      "pricing": {
        "basePrice": 120.00,
        "pricePerKm": 5.00,
        "helperPrice": 80.00,
        "additionalStopPrice": 25.00
      }
    },
    {
      "id": "uuid",
      "name": "Caminhao Toco",
      "icon": "truck-large",
      "description": "Cargas pesadas",
      "maxWeight": 8000,
      "isActive": true,
      "pricing": {
        "basePrice": 200.00,
        "pricePerKm": 7.00,
        "helperPrice": 100.00,
        "additionalStopPrice": 40.00
      }
    }
  ]
}
```

---

## POST `/vehicle-type`
Cria um novo tipo de veiculo. Apenas `ADMIN`.

**Protegido**

### Body
```json
{
  "name": "Caminhao Truck",
  "icon": "truck-xl",
  "description": "Para cargas muito pesadas",
  "maxWeight": 14000,
  "isActive": true,
  "pricing": {
    "basePrice": 350.00,
    "pricePerKm": 10.00,
    "helperPrice": 150.00,
    "additionalStopPrice": 60.00
  }
}
```

### Resposta 201
```json
{
  "id": "uuid",
  "name": "Caminhao Truck",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## PATCH `/vehicle-type/:id`
Atualiza um tipo de veiculo. Apenas `ADMIN`.

**Protegido**

### Body (campos opcionais)
```json
{
  "name": "Caminhao Truck",
  "isActive": false,
  "pricing": {
    "basePrice": 400.00,
    "pricePerKm": 11.00
  }
}
```

---

## DELETE `/vehicle-type/:id`
Remove um tipo de veiculo. Apenas `ADMIN`.

**Protegido**

> Nao remove fisicamente se houver fretes vinculados — marca como `isActive: false`.

### Resposta 200
```json
{
  "message": "Tipo de veiculo desativado com sucesso"
}
```
