# 🔐 Funcionalidade de Alterar Senha

## Resumo
Agora é possível modificar a senha de qualquer jogador diretamente pelo painel administrativo. A senha é automaticamente criptografada usando bcrypt com salt de 10 rounds.

## Quem pode alterar senhas?
- ✅ **CEO**
- ✅ **Diretor**
- ✅ **Gerente**

## Como usar

### Na Tabela de Jogadores
1. Acesse a página "Dashboard > Players"
2. Encontre o jogador que deseja alterar a senha
3. Clique no botão **"Senha"** (ícone de chave) na coluna de ações
4. No diálogo que aparecer:
   - Você verá a senha atual do jogador
   - Pode copiar a senha atual usando o ícone de cópia
   - Digite a **nova senha** (mínimo 6 caracteres)
   - Confirme a nova senha digitando novamente
   - Clique em "Alterar Senha"

### No Mobile
1. Toque no menu de três pontos (⋮) do jogador
2. Selecione "Alterar Senha"
3. Siga os passos acima

## Comportamento

- ✅ A senha é **criptografada automaticamente** com bcrypt
- ✅ A interface mostra a **senha atual do jogador** (pode ser copiada)
- ✅ Validação de **senhas mínimas de 6 caracteres**
- ✅ As senhas devem **coincidir** na confirmação
- ✅ Sucesso/erro é exibido com **notificação Toast**
- ✅ O botão só aparece para **CEO, Diretor e Gerente**

## Arquivos Modificados/Criados

### Criados:
- `components/change-password-dialog.tsx` - Componente do diálogo
- `app/api/players/[id]/password/route.ts` - API route para alterar senha

### Modificados:
- `lib/queries.ts` - Adicionada função `updatePlayerPassword()`
- `components/players-table.tsx` - Integração do diálogo e botão

## Segurança

- ✅ Verificação de autenticação (NextAuth)
- ✅ Verificação de permissão (CEO/Diretor/Gerente apenas)
- ✅ Criptografia bcrypt com 10 rounds de salt
- ✅ Validação de senha no servidor

## Notas Técnicas

- A senha é hash'd com `bcrypt.hash(password, 10)`
- O banco de dados armazena apenas o hash, não a senha em texto plano
- Quando um usuário faz login, a senha fornecida é comparada com o hash armazenado
