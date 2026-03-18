# Usuarios e Empresas

---

## GET `/user`
Lista todos os usuarios. Apenas `ADMIN`.

**Protegido**

### Query params
| Param | Tipo | Descricao |
|-------|------|-----------|
| `page` | number | Pagina (default: 1) |
| `perPage` | number | Itens por pagina (default: 20) |
| `role` | string | `ADMIN`, `COMPANY`, `DRIVER` |
| `search` | string | Busca por nome ou email |
| `status` | string | `ACTIVE`, `INACTIVE` |

### Resposta 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Empresa XYZ",
      "email": "contato@empresa.com",
      "role": "COMPANY",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 50, "page": 1, "perPage": 20, "lastPage": 3 }
}
```

---

## GET `/user/:id`
Detalhe de um usuario. `ADMIN` acessa qualquer um; outros apenas o proprio.

**Protegido**

### Resposta 200
```json
{
  "id": "uuid",
  "name": "Empresa XYZ",
  "email": "contato@empresa.com",
  "phone": "(11) 99999-9999",
  "role": "COMPANY",
  "status": "ACTIVE",
  "company": {
    "cnpj": "00.000.000/0001-00",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "city": "Sao Paulo",
      "state": "SP",
      "zipCode": "01310-100"
    }
  },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## PATCH `/user/:id`
Atualiza dados do usuario. `ADMIN` atualiza qualquer um; outros apenas o proprio.

**Protegido**

### Body (campos opcionais)
```json
{
  "name": "Empresa XYZ Atualizada",
  "phone": "(11) 88888-8888",
  "company": {
    "address": {
      "street": "Nova Rua",
      "number": "456"
    }
  }
}
```

---

## PATCH `/user/:id/status`
Ativa ou inativa um usuario. Apenas `ADMIN`.

**Protegido**

### Body
```json
{
  "status": "INACTIVE",
  "reason": "Conta suspensa por violacao dos termos"
}
```

---

## PATCH `/user/me/password`
Altera a propria senha.

**Protegido**

### Body
```json
{
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha123"
}
```

### Erros
| Codigo | Motivo |
|--------|--------|
| 400 | Senha atual incorreta |
| 422 | Nova senha muito fraca |

---

## POST `/user/me/photo`
Upload de foto de perfil.

**Protegido**

### Body (multipart/form-data)
| Campo | Tipo | Descricao |
|-------|------|-----------|
| `file` | file | Imagem (jpg, png, max 5MB) |

### Resposta 200
```json
{
  "photoUrl": "https://storage.../foto.jpg"
}
```

---

## GET `/company/:id/deliveries`
Lista todos os fretes de uma empresa. Apenas `ADMIN` ou a propria empresa.

**Protegido**

### Query params
Mesmos filtros de `GET /delivery`.
