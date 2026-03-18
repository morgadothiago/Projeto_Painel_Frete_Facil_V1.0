# FreteFácil — Documentação de Backend

> Especificação de todos os endpoints que o painel web e o app mobile consomem.

## Estrutura

```
docs/
├── api/
│   ├── auth.md          ← Autenticação (login, cadastro, refresh)
│   ├── users.md         ← Gestão de usuários e empresas
│   ├── delivery.md      ← Fretes (criar, listar, atualizar status)
│   ├── drivers.md       ← Motoristas / entregadores
│   ├── vehicles.md      ← Tipos de veículo
│   ├── billing.md       ← Faturamento e pagamentos
│   ├── gps.md           ← Rastreamento em tempo real (WebSocket)
│   └── notifications.md ← Notificações push
```

## Convenções Gerais

### Base URL
```
Desenvolvimento: http://localhost:3001
Produção:        https://api.seudominio.com
```

### Autenticação
Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <access_token>
```

### Formato de resposta padrão
```json
{
  "data": {},
  "message": "string",
  "statusCode": 200
}
```

### Paginação padrão
```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "lastPage": 5
  }
}
```

### Erros padrão
```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

### Roles de usuário
| Role | Descrição |
|------|-----------|
| `ADMIN` | Administrador da plataforma |
| `COMPANY` | Empresa que solicita fretes |
| `DRIVER` | Motorista / entregador |

---

## Status HTTP utilizados

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 422 | Entidade não processável |
| 500 | Erro interno do servidor |
