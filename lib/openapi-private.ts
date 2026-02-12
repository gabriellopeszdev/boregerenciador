import { publicOpenApiSpec } from './openapi-public'

// Especificação OpenAPI Privada — Estende a pública e adiciona rotas administrativas
// Requer autenticação (session) + cargo: Dono, Diretor ou Gerente
export const privateOpenApiSpec = {
  ...publicOpenApiSpec,
  info: {
    ...publicOpenApiSpec.info,
    title: 'Bore Gerenciador - API Privada (Admin)',
    description:
      'API privada do Bore Gerenciador. **Requer autenticação via Discord** e cargo de **Dono**, **Diretor** ou **Gerente**.\n\nInclui todas as rotas públicas (Stats e Recs) além de rotas administrativas para gerenciar jogadores, bans, mutes, cargos e configurações do sistema.',
  },
  tags: [
    ...publicOpenApiSpec.tags!,
    {
      name: 'Players',
      description: 'Gerenciamento de jogadores — listagem, busca e informações.',
    },
    {
      name: 'Bans',
      description: 'Gerenciamento de banimentos — listar, criar e remover bans.',
    },
    {
      name: 'Mutes',
      description: 'Gerenciamento de mutes — listar, criar e remover mutes.',
    },
    {
      name: 'Roles',
      description: 'Gerenciamento de cargos — Legend/VIP e Mod.',
    },
    {
      name: 'Config',
      description: 'Configurações do sistema — reset de VIP, verificação de roles, status do socket.',
    },
  ],
  paths: {
    // Inclui todas as rotas públicas
    ...publicOpenApiSpec.paths,

    // ─── PLAYERS ────────────────────────────────────────────────
    '/api/players': {
      get: {
        tags: ['Players'],
        operationId: 'getPlayers',
        summary: 'Listar jogadores (paginado)',
        description: 'Retorna uma lista paginada de jogadores registrados. Requer autenticação.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Número da página',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
            description: 'Resultados por página',
          },
          {
            name: 'searchTerm',
            in: 'query',
            required: false,
            schema: { type: 'string', default: '' },
            description: 'Termo de busca por nome',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de jogadores retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    players: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Player' },
                    },
                    totalCount: { type: 'integer' },
                  },
                },
                example: {
                  players: [
                    {
                      id: 1,
                      name: 'Jogador01',
                      conn: 'abc123',
                      vip: 4,
                      expired_vip: '2026-03-01',
                      mod: '[1,2]',
                      dono: 0,
                      diretor: 0,
                      admin: 0,
                      gerente: 0,
                    },
                  ],
                  totalCount: 234,
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          '400': {
            description: 'Parâmetros de paginação inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Invalid pagination parameters' },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Internal server error' },
              },
            },
          },
        },
      },
    },

    // ─── LEGEND / VIP ───────────────────────────────────────────
    '/api/players/{id}/legend': {
      post: {
        tags: ['Roles'],
        operationId: 'managePlayerLegend',
        summary: 'Adicionar ou remover Legend/VIP de um jogador',
        description:
          'Define ou remove o status de Legend (vip=4) ou VIP (vip=3) de um jogador. Envia comando via Socket.io para o jogo e atualiza o banco de dados.\n\nRequer cargo de **Dono**, **Diretor** ou **Gerente**.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do jogador',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: {
                    type: 'string',
                    enum: ['add', 'remove'],
                    description: 'Ação a ser executada',
                  },
                  vipLevel: {
                    type: 'integer',
                    enum: [3, 4],
                    description: '3 = VIP, 4 = Legend (obrigatório quando action=add)',
                  },
                  expirationDate: {
                    type: 'string',
                    description: 'Data de expiração (obrigatório quando action=add)',
                  },
                  rooms: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'IDs das salas (opcional)',
                  },
                },
              },
              examples: {
                addLegend: {
                  summary: 'Adicionar Legend',
                  value: {
                    action: 'add',
                    vipLevel: 4,
                    expirationDate: '2026-03-15',
                  },
                },
                removeLegend: {
                  summary: 'Remover Legend',
                  value: { action: 'remove' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Operação realizada com sucesso',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Missing or invalid vipLevel/expirationDate' },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          '403': {
            description: 'Sem permissão — precisa ser Dono, Diretor ou Gerente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Insufficient permissions' },
              },
            },
          },
          '404': {
            description: 'Jogador não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Player not found' },
              },
            },
          },
        },
      },
    },

    // ─── MOD ────────────────────────────────────────────────────
    '/api/players/{id}/mod': {
      post: {
        tags: ['Roles'],
        operationId: 'managePlayerMod',
        summary: 'Adicionar ou remover Mod de um jogador',
        description:
          'Define ou remove o status de Moderador de um jogador em salas específicas. Atualiza o banco e emite evento Socket.io.\n\nRequer cargo de **Dono**, **Diretor** ou **Gerente**.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do jogador',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: {
                    type: 'string',
                    enum: ['add', 'remove'],
                    description: 'Ação a ser executada',
                  },
                  rooms: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'IDs das salas onde o jogador será mod (obrigatório para action=add)',
                  },
                },
              },
              examples: {
                addMod: {
                  summary: 'Adicionar Mod',
                  value: { action: 'add', rooms: [1, 2, 3] },
                },
                removeMod: {
                  summary: 'Remover Mod',
                  value: { action: 'remove' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Operação realizada com sucesso',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Invalid rooms array' },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Insufficient permissions' },
              },
            },
          },
          '404': {
            description: 'Jogador não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Player not found' },
              },
            },
          },
        },
      },
    },

    // ─── PASSWORD ───────────────────────────────────────────────
    '/api/players/{id}/password': {
      put: {
        tags: ['Players'],
        operationId: 'changePlayerPassword',
        summary: 'Alterar senha de um jogador',
        description:
          'Altera a senha de um jogador no banco de dados. A senha é criptografada antes de ser salva.\n\nRequer cargo de **Dono**, **Diretor** ou **Gerente**.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do jogador',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                  newPassword: {
                    type: 'string',
                    minLength: 6,
                    description: 'Nova senha (mínimo 6 caracteres)',
                  },
                },
              },
              example: { newPassword: 'novaSenha123' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Senha alterada com sucesso',
            content: {
              'application/json': {
                example: { success: true, message: 'Senha atualizada com sucesso' },
              },
            },
          },
          '400': {
            description: 'Senha inválida (faltando ou menos de 6 caracteres)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Senha inválida' },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Você não tem permissão para alterar senhas' },
              },
            },
          },
        },
      },
    },

    // ─── BANS ───────────────────────────────────────────────────
    '/api/bans': {
      get: {
        tags: ['Bans'],
        operationId: 'getBans',
        summary: 'Listar banimentos (paginado)',
        description: 'Retorna uma lista paginada de jogadores banidos. Requer autenticação.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'searchTerm',
            in: 'query',
            required: false,
            schema: { type: 'string', default: '' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de bans',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Ban' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
                example: {
                  data: [
                    {
                      id: 1,
                      name: 'Cheater01',
                      reason: 'Hack detectado',
                      bannedBy: 'Admin01',
                      conn: 'xyz789',
                      time: '2026-02-10T18:00:00.000Z',
                    },
                  ],
                  pagination: { page: 1, limit: 10, total: 45, pages: 5 },
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Bans'],
        operationId: 'createBan',
        summary: 'Banir um jogador',
        description:
          'Cria um novo banimento para um jogador. Emite evento Socket.io para o jogo aplicar o ban em tempo real.',
        security: [{ discordAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'reason', 'time'],
                properties: {
                  name: { type: 'string', description: 'Nome do jogador' },
                  reason: { type: 'string', description: 'Motivo do ban' },
                  time: { type: 'string', format: 'date-time', description: 'Data/hora do ban' },
                  conn: { type: 'string', description: 'Conn do jogador (opcional)' },
                  ipv4: { type: 'string', description: 'IP do jogador (opcional)' },
                  room: { type: 'integer', description: 'ID da sala (opcional)' },
                },
              },
              example: {
                name: 'Cheater01',
                reason: 'Uso de hack',
                time: '2026-02-11T12:00:00.000Z',
                conn: 'xyz789',
                room: 1,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Ban criado com sucesso',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '400': {
            description: 'Campos obrigatórios faltando ou data inválida',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Missing required fields' },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
        },
      },
    },

    // ─── MUTES ──────────────────────────────────────────────────
    '/api/mutes': {
      get: {
        tags: ['Mutes'],
        operationId: 'getMutes',
        summary: 'Listar mutes (paginado)',
        description: 'Retorna uma lista paginada de jogadores mutados. Requer autenticação.',
        security: [{ discordAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'searchTerm',
            in: 'query',
            required: false,
            schema: { type: 'string', default: '' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de mutes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Mute' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
                example: {
                  data: [
                    {
                      id: 1,
                      name: 'Toxic01',
                      reason: 'Linguagem imprópria',
                      mutedBy: 'Mod01',
                      time: '2026-02-10T20:00:00.000Z',
                    },
                  ],
                  pagination: { page: 1, limit: 10, total: 20, pages: 2 },
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Mutes'],
        operationId: 'createMute',
        summary: 'Mutar um jogador',
        description:
          'Cria um novo mute para um jogador. Emite evento Socket.io para o jogo aplicar o mute em tempo real.',
        security: [{ discordAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'reason', 'time'],
                properties: {
                  name: { type: 'string', description: 'Nome do jogador' },
                  reason: { type: 'string', description: 'Motivo do mute' },
                  time: { type: 'string', format: 'date-time', description: 'Data/hora do mute' },
                  conn: { type: 'string', description: 'Conn do jogador (opcional)' },
                  ipv4: { type: 'string', description: 'IP do jogador (opcional)' },
                  room: { type: 'integer', description: 'ID da sala (opcional)' },
                },
              },
              example: {
                name: 'Toxic01',
                reason: 'Linguagem imprópria',
                time: '2026-02-11T14:00:00.000Z',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Mute criado com sucesso',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '400': {
            description: 'Campos obrigatórios faltando',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Missing required fields' },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Unauthorized' },
              },
            },
          },
        },
      },
    },

    // ─── CONFIG: Reset VIP ──────────────────────────────────────
    '/api/config/reset-vip': {
      post: {
        tags: ['Config'],
        operationId: 'resetAllVip',
        summary: 'Resetar todos os VIPs',
        description:
          'Reseta o VIP de **todos** os jogadores para 0. **Apenas o Dono (CEO)** pode executar esta ação.',
        security: [{ discordAuth: [] }],
        responses: {
          '200': {
            description: 'VIPs resetados com sucesso',
            content: {
              'application/json': {
                example: { success: true, message: 'Todos os VIPs foram resetados para 0' },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Não autenticado' },
              },
            },
          },
          '403': {
            description: 'Sem permissão — apenas CEO',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Sem permissão (apenas CEO)' },
              },
            },
          },
        },
      },
    },

    // ─── CONFIG: Verificar CEO ──────────────────────────────────
    '/api/config/is-ceo': {
      get: {
        tags: ['Config'],
        operationId: 'checkIsCeo',
        summary: 'Verificar se o usuário é CEO',
        description: 'Verifica se o usuário logado possui o cargo de Dono (CEO) no Discord.',
        security: [{ discordAuth: [] }],
        responses: {
          '200': {
            description: 'Status de CEO retornado',
            content: {
              'application/json': {
                example: { isCeo: true },
              },
            },
          },
        },
      },
    },

    // ─── CONFIG: Discord Roles ──────────────────────────────────
    '/api/config/discord-roles': {
      get: {
        tags: ['Config'],
        operationId: 'getDiscordRolesConfig',
        summary: 'Obter configuração de roles do Discord',
        description: 'Retorna os IDs das roles do Discord configuradas no servidor (guild, CEO, diretor, gerente).',
        responses: {
          '200': {
            description: 'Configuração de roles retornada',
            content: {
              'application/json': {
                example: {
                  guildId: '123456789',
                  ceoRoleId: '987654321',
                  diretorRoleId: '111222333',
                  gerenteRoleId: '444555666',
                },
              },
            },
          },
        },
      },
    },

    // ─── CONFIG: Can Manage ─────────────────────────────────────
    '/api/config/can-manage': {
      get: {
        tags: ['Config'],
        operationId: 'checkCanManage',
        summary: 'Verificar se o usuário pode gerenciar roles',
        description:
          'Verifica se o usuário logado possui permissão para gerenciar cargos (CEO, Diretor ou Gerente).',
        security: [{ discordAuth: [] }],
        responses: {
          '200': {
            description: 'Status de permissão retornado',
            content: {
              'application/json': {
                example: { canManage: true },
              },
            },
          },
        },
      },
    },

    // ─── SOCKET STATUS ──────────────────────────────────────────
    '/api/socket/status': {
      get: {
        tags: ['Config'],
        operationId: 'getSocketStatus',
        summary: 'Status do Socket.IO',
        description: 'Retorna o status atual da conexão Socket.IO e número de clientes conectados.',
        responses: {
          '200': {
            description: 'Socket.IO conectado e funcionando',
            content: {
              'application/json': {
                example: {
                  status: 'connected',
                  message: 'Socket.IO está funcionando',
                  socketPath: '/api/socketio',
                  connectedClients: 3,
                  timestamp: '2026-02-11T12:00:00.000Z',
                },
              },
            },
          },
          '202': {
            description: 'Socket.IO ainda inicializando',
            content: {
              'application/json': {
                example: {
                  status: 'initializing',
                  message: 'Socket.IO está inicializando...',
                  socketPath: '/api/socketio',
                  info: 'Acesse novamente em alguns segundos',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    ...publicOpenApiSpec.components,
    schemas: {
      ...publicOpenApiSpec.components!.schemas,
      Player: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do jogador' },
          name: { type: 'string', description: 'Nome do jogador' },
          conn: { type: 'string', description: 'Identificador de conexão' },
          ipv4: { type: 'string', description: 'Endereço IP' },
          vip: {
            type: 'integer',
            description: 'Nível VIP (0=nenhum, 3=VIP, 4=Legend)',
            enum: [0, 3, 4],
          },
          expired_vip: {
            type: 'string',
            nullable: true,
            description: 'Data de expiração do VIP (null se não tem)',
          },
          mod: {
            type: 'string',
            nullable: true,
            description: 'JSON array com IDs das salas onde é mod (ex: "[1,2,3]")',
          },
          password: { type: 'string', description: 'Senha criptografada' },
          dono: { type: 'integer', description: 'Flag de Dono (0 ou 1)' },
          diretor: { type: 'integer', description: 'Flag de Diretor (0 ou 1)' },
          admin: { type: 'integer', description: 'Flag de Admin (0 ou 1)' },
          gerente: { type: 'integer', description: 'Flag de Gerente (0 ou 1)' },
        },
        required: ['id', 'name'],
      },
      Ban: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', description: 'Nome do jogador banido' },
          reason: { type: 'string', description: 'Motivo do ban' },
          bannedBy: { type: 'string', description: 'Nome do staff que baniu' },
          conn: { type: 'string' },
          ipv4: { type: 'string' },
          time: { type: 'string', format: 'date-time', description: 'Data do ban' },
          room: { type: 'integer', description: 'ID da sala' },
        },
      },
      Mute: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', description: 'Nome do jogador mutado' },
          reason: { type: 'string', description: 'Motivo do mute' },
          mutedBy: { type: 'string', description: 'Nome do staff que mutou' },
          time: { type: 'string', format: 'date-time', description: 'Data do mute' },
        },
      },
    },
    securitySchemes: {
      discordAuth: {
        type: 'http',
        scheme: 'bearer',
        description:
          'Autenticação via sessão Discord (next-auth). O token é gerenciado internamente pelo framework — basta estar logado no painel.',
      },
    },
  },
  security: [{ discordAuth: [] }],
}
