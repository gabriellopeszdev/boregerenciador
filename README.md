# 🚀 Boregerenciador

> **A Next-Gen Administration Dashboard for Haxball Rooms**

O **Boregerenciador** é uma solução robusta e moderna projetada para simplificar a gestão da sala **Bore Arena** no jogo **Haxball**. Focado em segurança, eficiência e facilidade de uso, ele integra autenticação via Discord para oferecer um controle granular de permissões e uma administração transparente de jogadores.

![Status do Projeto](https://img.shields.io/badge/status-development-orange?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan?style=flat-square)

---

## 📋 Funcionalidades Principais

O Boregerenciador foi construído pensando nas necessidades reais de staff e administração de servidores:

### 🔐 Segurança e Acesso
- **Autenticação Segura (OAuth2)**: Login exclusivo via Discord, garantindo que apenas usuários verificados acessem o painel.
- **Controle de Acesso Baseado em Cargos (RBAC)**: Integração profunda com Cargos do Discord. O sistema reconhece automaticamente Permissões de **CEO**, **Diretor** e **Gerente**.
- **Auditoria de Senhas**: Visualização e alteração segura de senhas de jogadores (Criptografia Bcrypt).

### 👥 Gestão de Jogadores
- **Dashboard Intuitivo**: Visão geral e listagem paginada de todos os jogadores registrados.
- **Edição de Perfil**: Gerencie facilmente permissões in-game, status VIP e outros atributos.
- **Reset de VIP**: Ferramenta rápida para remover privilégios VIP quando necessário.

### ⚖️ Sistema de Punições
- **Bans & Unbans**: Aplique banimentos com justificativa e duração. Histórico completo acessível.
- **Mutes & Unmutes**: Gerenciamento de silenciamentos de chat com logs detalhados.
- **Transparência**: Visualize quem aplicou a punição e quando ela expira.

---

## 🛠️ Stack Tecnológico

Utilizamos as tecnologias mais recentes para garantir performance e manutenibilidade:

- **Core**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: MySQL (via `mysql2`)
- **Autenticação**: [NextAuth.js](https://next-auth.js.org/)
- **UI Components**: Shadcn/UI (Radix UI) & Lucide Icons

---

## ⚙️ Configuração do Ambiente

Para rodar este projeto, você precisará configurar as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto com base nas chaves abaixo:

### Banco de Dados (MySQL)
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=seu_banco
DB_PORT=3306
# Opcional: Configurações de Pool
DB_WAIT_FOR_CONNECTIONS=true
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
```

### Autenticação (NextAuth)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_gerada_com_openssl
```

### Integração Discord
```bash
DISCORD_CLIENT_ID=seu_client_id
DISCORD_CLIENT_SECRET=seu_client_secret
DISCORD_GUILD_ID=id_do_seu_servidor_discord

# IDs dos Cargos para Permissões (Staff)
DISCORD_STAFF_ROLE_ID=id_cargo_staff
DISCORD_CEO_ROLE_ID=id_cargo_ceo
DISCORD_DIRETOR_ROLE_ID=id_cargo_diretor
DISCORD_GERENTE_ROLE_ID=id_cargo_gerente
```

> **Dica**: Consulte `DISCORD_ROLES_SETUP.md` para instruções detalhadas sobre como obter os IDs do Discord.

---

## 🚀 Como Rodar o Projeto

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/boregerenciador.git
   cd boregerenciador
   ```

2. **Instale as dependências**
   Recomendamos o uso do `pnpm` para maior velocidade.
   ```bash
   pnpm install
   ```

3. **Inicie o Banco de Dados**
   Certifique-se de que seu servidor MySQL está rodando e o banco de dados especificado no `.env` foi criado.

4. **Rode o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

5. **Acesse o painel**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🤝 Contribuição

Estamos abertos a contribuições para melhorar o ecossistema do servidor!

1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/IncrivelFeature`).
3. Commit suas mudanças (`git commit -m 'Add some IncrivelFeature'`).
4. Push para a Branch (`git push origin feature/IncrivelFeature`).
5. Abra um Pull Request.

---

## 📝 Licença

Este projeto está licenciado sob a licença **MIT** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <sub>Desenvolvido com ❤️ pela equipe Bore</sub>
</div>
