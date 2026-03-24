# FRETE FÁCIL — Plano de Desenvolvimento da API NestJS

## Stack Definida

| Item | Tecnologia |
|------|-----------|
| Framework | NestJS (TypeScript) |
| ORM | Prisma ORM |
| Banco de dados | PostgreSQL (novo, separado do frontend) |
| Autenticação | JWT próprio (Guards + Decorators NestJS) |
| Documentação | Swagger / OpenAPI (`/api/docs`) |
| Porta local | `3001` |
| Testes | Jest (unit) + Supertest (e2e) |

---

## Configuração Inicial do Projeto

```bash
# Criar o projeto NestJS
npm i -g @nestjs/cli
nest new frete-facil-api

# Entrar na pasta
cd frete-facil-api

# Dependências principais
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install @prisma/client
npm install --save-dev prisma

# Swagger
npm install @nestjs/swagger swagger-ui-express

# Validação
npm install class-validator class-dto @nestjs/class-transformer

# Inicializar Prisma
npx prisma init
```

### Variáveis de Ambiente (`.env`)

```env
# Banco de dados (novo PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/frete_facil_api"

# JWT
JWT_SECRET="sua_chave_secreta_forte_aqui"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development
```

---

## Estrutura de Pastas

```
frete-facil-api/
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   ├── seed.ts               # Dados iniciais
│   └── migrations/
├── src/
│   ├── main.ts               # Bootstrap + Swagger
│   ├── app.module.ts         # Módulo raiz
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts # Singleton do Prisma
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── signup.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   ├── companies/
│   │   ├── companies.module.ts
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   └── dto/
│   │       ├── create-company.dto.ts
│   │       └── update-company.dto.ts
│   ├── drivers/
│   │   ├── drivers.module.ts
│   │   ├── drivers.controller.ts
│   │   ├── drivers.service.ts
│   │   └── dto/
│   │       ├── create-driver.dto.ts
│   │       └── update-driver.dto.ts
│   ├── vehicles/
│   │   ├── vehicles.module.ts
│   │   ├── vehicles.controller.ts
│   │   ├── vehicles.service.ts
│   │   └── dto/
│   │       ├── create-vehicle.dto.ts
│   │       └── create-vehicle-type.dto.ts
│   ├── deliveries/
│   │   ├── deliveries.module.ts
│   │   ├── deliveries.controller.ts
│   │   ├── deliveries.service.ts
│   │   └── dto/
│   │       ├── create-delivery.dto.ts
│   │       └── update-delivery.dto.ts
│   ├── billing/
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   └── dto/
│   │       └── create-billing.dto.ts
│   ├── gps/
│   │   ├── gps.module.ts
│   │   ├── gps.controller.ts
│   │   ├── gps.service.ts
│   │   └── dto/
│   │       └── update-location.dto.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   └── dto/
│   │       └── create-notification.dto.ts
│   └── freight-config/
│       ├── freight-config.module.ts
│       ├── freight-config.controller.ts
│       ├── freight-config.service.ts
│       └── dto/
│           └── update-freight-config.dto.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Schema Prisma (Novo Banco)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  COMPANY
  DRIVER
}

enum UserStatus {
  ACTIVE
  PENDING
  INACTIVE
}

enum PixKeyType {
  EMAIL
  CPF
  PHONE
  CNPJ
  RANDOM
}

enum DeliveryStatus {
  PENDING
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum BillingType {
  CREDIT
  DEBIT
  WITHDRAWAL
}

enum BillingStatus {
  PENDING
  PAID
  FAILED
}

model User {
  id        String     @id @default(cuid())
  name      String
  email     String     @unique
  password  String
  phone     String?
  role      Role       @default(COMPANY)
  status    UserStatus @default(PENDING)
  photo     String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  company            Company?
  driver             Driver?
  notifications      Notification[]
  passwordResetTokens PasswordResetToken[]
}

model Company {
  id        String  @id @default(cuid())
  userId    String  @unique
  cnpj      String  @unique
  tradeName String?

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses  Address[]
  deliveries Delivery[]
}

model Driver {
  id               String  @id @default(cuid())
  userId           String  @unique
  cpf              String  @unique
  dateOfBirth      DateTime?
  isOnline         Boolean  @default(false)
  rating           Float    @default(0)
  totalDeliveries  Int      @default(0)
  balance          Decimal  @default(0) @db.Decimal(10, 2)
  autonomo         Boolean  @default(false)

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses    Address[]
  vehicle      Vehicle?
  bankAccount  BankAccount?
  deliveries   Delivery[]
  gpsLocations GpsLocation[]
  billings     Billing[]
}

model Address {
  id           String  @id @default(cuid())
  street       String
  number       String
  complement   String?
  neighborhood String
  city         String
  state        String
  zipCode      String
  lat          Float?
  lng          Float?

  companyId String?
  driverId  String?
  company   Company? @relation(fields: [companyId], references: [id], onDelete: Cascade)
  driver    Driver?  @relation(fields: [driverId], references: [id], onDelete: Cascade)
}

model Vehicle {
  id            String @id @default(cuid())
  driverId      String @unique
  vehicleTypeId String
  plate         String @unique
  model         String
  year          Int
  color         String

  driver      Driver      @relation(fields: [driverId], references: [id], onDelete: Cascade)
  vehicleType VehicleType @relation(fields: [vehicleTypeId], references: [id])
}

model VehicleType {
  id                   String  @id @default(cuid())
  name                 String  @unique
  icon                 String
  description          String?
  vehicleClass         String
  size                 String
  category             String
  maxWeight            Float
  basePrice            Decimal @db.Decimal(10, 2)
  pricePerKm           Decimal @db.Decimal(10, 2)
  helperPrice          Decimal @db.Decimal(10, 2)
  additionalStopPrice  Decimal @db.Decimal(10, 2)
  isActive             Boolean @default(true)

  vehicles   Vehicle[]
  deliveries Delivery[]
}

model BankAccount {
  id         String     @id @default(cuid())
  driverId   String     @unique
  bank       String
  agency     String
  account    String
  pixKey     String?
  pixKeyType PixKeyType?

  driver Driver @relation(fields: [driverId], references: [id], onDelete: Cascade)
}

model Delivery {
  id               String         @id @default(cuid())
  publicId         String         @unique @default(cuid())
  companyId        String
  driverId         String?
  vehicleTypeId    String
  status           DeliveryStatus @default(PENDING)

  originLat        Float
  originLng        Float
  originAddress    String
  destLat          Float
  destLng          Float
  destAddress      String

  cargoDescription String?
  weight           Float?
  needsHelper      Boolean  @default(false)
  additionalStops  Int      @default(0)
  scheduledAt      DateTime?
  estimatedPrice   Decimal  @db.Decimal(10, 2)
  finalPrice       Decimal? @db.Decimal(10, 2)
  estimatedDistance Float?
  rating           Int?
  comment          String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company     Company     @relation(fields: [companyId], references: [id])
  driver      Driver?     @relation(fields: [driverId], references: [id])
  vehicleType VehicleType @relation(fields: [vehicleTypeId], references: [id])
  billing     Billing?
}

model Billing {
  id          String        @id @default(cuid())
  accessKey   String?
  driverId    String
  deliveryId  String        @unique
  type        BillingType
  amount      Decimal       @db.Decimal(10, 2)
  platformFee Decimal       @db.Decimal(10, 2)
  netAmount   Decimal       @db.Decimal(10, 2)
  status      BillingStatus @default(PENDING)
  paidAt      DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  driver   Driver   @relation(fields: [driverId], references: [id])
  delivery Delivery @relation(fields: [deliveryId], references: [id])
}

model GpsLocation {
  id         String   @id @default(cuid())
  driverId   String
  deliveryId String?
  lat        Float
  lng        Float
  heading    Float?
  speed      Float?
  createdAt  DateTime @default(now())

  driver Driver @relation(fields: [driverId], references: [id], onDelete: Cascade)
}

model FreightConfig {
  id               String  @id @default("singleton")
  platformFeePct   Decimal @default(15) @db.Decimal(5, 2)
  insuranceFeePct  Decimal @default(0)  @db.Decimal(5, 2)
  minimumPrice     Decimal @default(20) @db.Decimal(10, 2)
  tollReimburse    Boolean @default(true)
  nightSurcharge   Decimal @default(0)  @db.Decimal(5, 2)
  weekendSurcharge Decimal @default(0)  @db.Decimal(5, 2)
  updatedAt        DateTime @updatedAt
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  email     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  read      Boolean  @default(false)
  data      String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Endpoints da API

### Auth — `/auth`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/auth/login` | Login, retorna JWT | Público |
| POST | `/auth/signup` | Cadastro de empresa | Público |
| POST | `/auth/forgot-password` | Solicitar reset de senha | Público |
| POST | `/auth/verify-reset-code` | Verificar código de reset | Público |
| POST | `/auth/reset-password` | Redefinir senha | Público |
| GET | `/auth/me` | Dados do usuário logado | Autenticado |

### Users — `/users`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/users` | Listar todos os usuários | ADMIN |
| GET | `/users/:id` | Buscar usuário por ID | ADMIN |
| PATCH | `/users/:id` | Atualizar usuário | ADMIN |
| DELETE | `/users/:id` | Deletar usuário | ADMIN |

### Companies — `/companies`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/companies` | Listar empresas | ADMIN |
| GET | `/companies/:id` | Buscar empresa | ADMIN / própria COMPANY |
| POST | `/companies` | Criar empresa | ADMIN |
| PATCH | `/companies/:id` | Atualizar empresa | ADMIN / própria COMPANY |
| DELETE | `/companies/:id` | Deletar empresa | ADMIN |
| PATCH | `/companies/:id/status` | Ativar / inativar | ADMIN |

### Drivers — `/drivers`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/drivers` | Listar motoristas | ADMIN |
| GET | `/drivers/:id` | Buscar motorista | ADMIN / próprio DRIVER |
| POST | `/drivers` | Criar motorista | ADMIN |
| PATCH | `/drivers/:id` | Atualizar motorista | ADMIN / próprio DRIVER |
| DELETE | `/drivers/:id` | Deletar motorista | ADMIN |
| PATCH | `/drivers/:id/status` | Ativar / inativar | ADMIN |
| PATCH | `/drivers/:id/online` | Toggle online/offline | DRIVER |

### Vehicles — `/vehicles`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/vehicle-types` | Listar tipos de veículo | Autenticado |
| POST | `/vehicle-types` | Criar tipo de veículo | ADMIN |
| PATCH | `/vehicle-types/:id` | Atualizar tipo | ADMIN |
| DELETE | `/vehicle-types/:id` | Deletar tipo | ADMIN |
| GET | `/vehicles` | Listar veículos | ADMIN |
| GET | `/vehicles/:id` | Buscar veículo | ADMIN / próprio DRIVER |
| POST | `/vehicles` | Cadastrar veículo | DRIVER |
| PATCH | `/vehicles/:id` | Atualizar veículo | DRIVER |

### Deliveries — `/deliveries`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/deliveries` | Listar entregas | ADMIN |
| GET | `/deliveries/company` | Entregas da empresa logada | COMPANY |
| GET | `/deliveries/driver` | Entregas do motorista logado | DRIVER |
| GET | `/deliveries/:id` | Buscar entrega | Autenticado |
| POST | `/deliveries` | Criar entrega | COMPANY |
| PATCH | `/deliveries/:id/status` | Atualizar status | DRIVER / ADMIN |
| PATCH | `/deliveries/:id/accept` | Motorista aceita entrega | DRIVER |
| PATCH | `/deliveries/:id/rate` | Avaliar entrega | COMPANY |
| POST | `/deliveries/estimate` | Calcular preço estimado | COMPANY |

### Billing — `/billing`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/billing` | Listar registros | ADMIN |
| GET | `/billing/driver` | Faturamento do motorista | DRIVER |
| GET | `/billing/:id` | Buscar registro | ADMIN / próprio DRIVER |
| POST | `/billing` | Criar registro | ADMIN |
| PATCH | `/billing/:id/pay` | Marcar como pago | ADMIN |

### GPS — `/gps`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/gps/location` | Enviar localização | DRIVER |
| GET | `/gps/driver/:id` | Última localização do motorista | Autenticado |
| GET | `/gps/delivery/:id` | Localização da entrega ativa | COMPANY / ADMIN |

### Notifications — `/notifications`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/notifications` | Listar notificações do usuário | Autenticado |
| PATCH | `/notifications/:id/read` | Marcar como lida | Autenticado |
| PATCH | `/notifications/read-all` | Marcar todas como lidas | Autenticado |
| DELETE | `/notifications/:id` | Deletar notificação | Autenticado |

### Freight Config — `/freight-config`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/freight-config` | Buscar configuração | ADMIN |
| PATCH | `/freight-config` | Atualizar configuração | ADMIN |

### Dashboard — `/dashboard`

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/dashboard/stats` | Estatísticas gerais | ADMIN |
| GET | `/dashboard/company` | Stats da empresa logada | COMPANY |
| GET | `/dashboard/driver` | Stats do motorista logado | DRIVER |

---

## main.ts — Bootstrap com Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global
  app.setGlobalPrefix('api');

  // Validação automática dos DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS (para o frontend Next.js)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Frete Fácil API')
    .setDescription('API REST para o sistema de fretes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('API rodando em: http://localhost:3001');
  console.log('Swagger em:    http://localhost:3001/api/docs');
}
bootstrap();
```

---

## Autenticação JWT

### Fluxo

```
POST /auth/login
  → valida email/senha no banco
  → bcrypt.compare(password, hash)
  → gera JWT com payload: { sub, email, role, status }
  → retorna { access_token, user }

Rotas protegidas:
  → Header: Authorization: Bearer <token>
  → JwtAuthGuard valida o token
  → RolesGuard verifica a role necessária
  → @CurrentUser() injeta o usuário na controller
```

### Payload do JWT

```typescript
interface JwtPayload {
  sub: string;      // user.id
  email: string;
  role: Role;       // ADMIN | COMPANY | DRIVER
  status: UserStatus;
  companyId?: string;
  driverId?: string;
}
```

---

## Ordem de Desenvolvimento (Prioridade)

| Fase | Módulos | Descrição |
|------|---------|-----------|
| **1** | Prisma + PrismaService | Setup do banco e singleton |
| **2** | Auth | Login, signup, JWT guards, decorators |
| **3** | Users | CRUD básico |
| **4** | Companies | CRUD + ativação |
| **5** | Drivers | CRUD + toggle online |
| **6** | VehicleTypes + Vehicles | Tipos e veículos dos motoristas |
| **7** | Deliveries | Criação, fluxo de status, estimativa de preço |
| **8** | Billing | Faturamento pós-entrega |
| **9** | GPS | Envio e leitura de localização |
| **10** | Notifications | Notificações internas |
| **11** | Dashboard | Estatísticas e relatórios |
| **12** | FreightConfig | Configuração de preços |

---

## Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run start:dev

# Gerar migration após alterar schema
npx prisma migrate dev --name nome_da_migration

# Visualizar banco no Prisma Studio
npx prisma studio

# Rodar seed
npx prisma db seed

# Acessar Swagger
http://localhost:3001/api/docs

# Rodar testes
npm run test         # unit
npm run test:e2e     # end-to-end
npm run test:cov     # com coverage
```

---

## Integração com o Frontend Next.js

Após a API estar rodando, o frontend substituirá as Server Actions por chamadas HTTP:

```typescript
// Exemplo: substituir loginAction() por fetch
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access_token, user } = await response.json();
```

O token JWT retornado deverá ser armazenado (cookie httpOnly ou localStorage) e enviado em todas as requisições autenticadas via header `Authorization: Bearer <token>`.

---

## Próximos Passos

1. [ ] `nest new frete-facil-api` — criar o projeto
2. [ ] Copiar o `schema.prisma` deste documento e rodar `npx prisma migrate dev`
3. [ ] Implementar `PrismaModule` e `PrismaService`
4. [ ] Implementar `AuthModule` completo (login + JWT + guards)
5. [ ] Testar no Swagger: `http://localhost:3001/api/docs`
6. [ ] Avançar módulo por módulo seguindo a tabela de prioridades
