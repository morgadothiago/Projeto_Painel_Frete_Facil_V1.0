# Autenticação

## POST `/auth/login`
Login de empresa ou motorista.

**Público** — não exige token.

### Body
```json
{
  "email": "empresa@email.com",
  "password": "senha123"
}
```

### Resposta 200
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "name": "Nome do usuário",
    "email": "empresa@email.com",
    "role": "COMPANY"
  }
}
```

### Erros
| Código | Motivo |
|--------|--------|
| 401 | Credenciais inválidas |
| 400 | Email ou senha ausente |

---

## POST `/auth/register/company`
Cadastro de empresa (painel web).

**Público** — não exige token.

### Body
```json
{
  "name": "Empresa XYZ",
  "cnpj": "00.000.000/0001-00",
  "email": "contato@empresa.com",
  "phone": "(11) 99999-9999",
  "password": "senha123",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Sala 1",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }
}
```

### Resposta 201
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "Empresa XYZ",
    "email": "contato@empresa.com",
    "role": "COMPANY"
  }
}
```

### Erros
| Código | Motivo |
|--------|--------|
| 409 | Email ou CNPJ já cadastrado |
| 400 | Dados inválidos |

---

## POST `/auth/register/driver`
Cadastro de motorista (app mobile).

**Público** — não exige token.

### Body
```json
{
  "name": "João Silva",
  "cpf": "000.000.000-00",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "password": "senha123",
  "dateOfBirth": "1990-01-15",
  "address": {
    "street": "Rua das Palmeiras",
    "number": "456",
    "complement": "",
    "neighborhood": "Jardim",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "04000-000"
  },
  "vehicle": {
    "vehicleTypeId": "uuid-do-tipo",
    "plate": "ABC-1234",
    "model": "Volkswagen Delivery",
    "year": 2020,
    "color": "Branco"
  },
  "bankAccount": {
    "bank": "Nubank",
    "agency": "0001",
    "account": "12345-6",
    "pixKey": "joao@email.com",
    "pixKeyType": "EMAIL"
  }
}
```

### Resposta 201
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "DRIVER"
  }
}
```

---

## POST `/auth/refresh`
Renova o access token usando o refresh token do cookie.

**Público** — não exige header de Authorization.
O refresh token deve ser enviado via cookie `httpOnly`.

### Resposta 200
```json
{
  "access_token": "eyJ..."
}
```

### Erros
| Código | Motivo |
|--------|--------|
| 401 | Refresh token inválido ou expirado |

---

## POST `/auth/logout`
Invalida a sessão e limpa o cookie do refresh token.

**Protegido** — exige token.

### Resposta 200
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## GET `/auth/me`
Retorna os dados do usuário autenticado.

**Protegido** — exige token.

### Resposta 200
```json
{
  "id": "uuid",
  "name": "Empresa XYZ",
  "email": "contato@empresa.com",
  "role": "COMPANY",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## POST `/auth/forgot-password`
Envia email de recuperação de senha.

**Público** — não exige token.

### Body
```json
{
  "email": "contato@empresa.com"
}
```

### Resposta 200
```json
{
  "message": "Email de recuperação enviado"
}
```

---

## POST `/auth/reset-password`
Redefine a senha com o token recebido por email.

**Público** — não exige token.

### Body
```json
{
  "token": "token-do-email",
  "password": "nova-senha123"
}
```

### Resposta 200
```json
{
  "message": "Senha redefinida com sucesso"
}
```
