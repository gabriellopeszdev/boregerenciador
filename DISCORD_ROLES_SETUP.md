# Configuração de Permissões - Discord Roles

## Visão Geral

O sistema de gerenciamento de Legend e Mod agora usa os **IDs dos cargos do Discord** para validar permissões, em vez de verificar campos no banco de dados. Apenas usuários com os cargos de **CEO**, **Diretor** ou **Gerente** podem acessar a página `/dashboard/roles` e gerenciar Legend/Mod.

## Como Configurar

### 1. Obter o ID da Guild (Servidor)

1. No Discord, vá para o seu servidor
2. Clique com botão direito no nome do servidor no topo
3. Selecione "Copiar ID do Servidor"
4. Use este ID para `DISCORD_GUILD_ID`

### 2. Obter IDs dos Cargos

1. No Discord, vá para Configurações do Servidor → Cargos
2. Para cada cargo (CEO, Diretor, Gerente):
   - Clique com botão direito no cargo
   - Selecione "Copiar ID"
   - Use este ID na variável correspondente

### 3. Configurar Variáveis de Ambiente

Atualize seu arquivo `.env.local` (ou `.env.production` para produção) com os IDs obtidos:

```env
# Discord OAuth (já configurado)
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui

# Discord Guild
DISCORD_GUILD_ID=123456789012345678

# Discord Roles - IDs dos cargos
DISCORD_STAFF_ROLE_ID=111111111111111111
DISCORD_CEO_ROLE_ID=222222222222222222
DISCORD_DIRETOR_ROLE_ID=333333333333333333
DISCORD_GERENTE_ROLE_ID=444444444444444444
```

## Fluxo de Verificação

1. **Autenticação**: Usuário faz login com Discord
2. **Armazenamento do Token**: O `accessToken` do Discord é armazenado na sessão JWT
3. **Verificação de Permissão**: Quando acessa `/dashboard/roles` ou tenta usar Legend/Mod:
   - A função `canManageRoles()` é chamada
   - Faz uma chamada à API do Discord para buscar os cargos do usuário
   - Compara com os IDs configurados em `.env`
   - Retorna `true` se o usuário tem algum dos 3 cargos

## Endpoints Protegidos

### POST `/api/players/[id]/legend`
Requer que o usuário tenha algum dos cargos: CEO, Diretor ou Gerente

Body:
```json
{
  "action": "add|remove",
  "rooms": [1, 2, 3],
  "expirationDate": "2024-12-31 23:59:59"
}
```

### POST `/api/players/[id]/mod`
Requer que o usuário tenha algum dos cargos: CEO, Diretor ou Gerente

Body:
```json
{
  "action": "add|remove",
  "rooms": [1, 2, 3]
}
```

## Teste Local

1. Certifique-se de que seu `.env.local` está configurado corretamente
2. Inicie o servidor: `npm run dev`
3. Acesse http://localhost:3000
4. Faça login com uma conta Discord que tenha os cargos de CEO, Diretor ou Gerente
5. Você deverá ver o botão "Setar Legend & Mod" no dashboard
6. Clique para acessar a página de gerenciamento

## Troubleshooting

### "Unauthorized" ao tentar acessar `/dashboard/roles`
- Verifique se o `DISCORD_GUILD_ID` está correto
- Certifique-se de que o usuário está no servidor Discord
- Verifique se os IDs dos cargos estão corretos no `.env`

### O botão "Setar Legend & Mod" não aparece
- Verifique os logs do servidor para mensagens com prefixo `[discord-roles]`
- Certifique-se de que o usuário tem um dos 3 cargos
- Verifique se `DISCORD_CEO_ROLE_ID`, `DISCORD_DIRETOR_ROLE_ID` e `DISCORD_GERENTE_ROLE_ID` estão configurados

### Erro "Variáveis de ambiente não configuradas"
- Verifique o arquivo `.env.local` ou `.env.production`
- Reinicie o servidor após atualizar as variáveis
- Certifique-se de que não há espaços extras nos IDs

## Logs

Todos os eventos relacionados a permissões são registrados com o prefixo `[discord-roles]`:

```
[discord-roles] Permissões do usuário: { isCEO: true, isDiretor: false, isGerente: false, hasAnyPermission: true }
```

Procure por esses logs para debugar problemas de permissão.
