// Especificação OpenAPI Pública - Rotas de Stats e Recs (sem autenticação)
export const publicOpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Bore Gerenciador - API Pública',
    version: '1.0.0',
    description:
      'API pública do Bore Gerenciador. Estas rotas **não requerem autenticação** e podem ser consumidas por qualquer cliente externo.\n\nInclui endpoints para estatísticas de jogadores e replays de partidas.',
    contact: {
      name: 'Bore Staff',
    },
  },
  servers: [
    {
      url: 'https://boregerenciador.azura.dev.br',
      description: 'Produção',
    },
  ],
  tags: [
    {
      name: 'Stats',
      description: 'Estatísticas dos jogadores — pontos, gols, assistências, etc.',
    },
    {
      name: 'Recs',
      description: 'Replays (gravações) de partidas jogadas.',
    },
  ],
  paths: {
    '/api/public/stats': {
      get: {
        tags: ['Stats'],
        operationId: 'getStats',
        summary: 'Listar estatísticas dos jogadores',
        description:
          'Retorna uma lista paginada de estatísticas de todos os jogadores. Suporta busca por nome e ordenação por qualquer campo numérico.',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Número da página (começa em 1)',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Quantidade de resultados por página',
            schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            description: 'Termo de busca por nome do jogador',
            schema: { type: 'string', default: '' },
          },
          {
            name: 'sortBy',
            in: 'query',
            required: false,
            description: 'Campo para ordenação',
            schema: {
              type: 'string',
              default: 'points',
              enum: [
                'elo', 'games', 'goals', 'assists', 'post_hits', 'ag', 'cs',
                'wins', 'losses', 'goals_scored_match', 'points', 'block', 'ace',
                'defesas', 'pc', 'time', 'rebounds', 'blocks', 'steals', 'passes',
                'interceptions', 'disarms', 'hat_tricks', 'shots_on_goal', 'saves',
                'penalty_champion', 'playerName',
              ],
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            required: false,
            description: 'Direção da ordenação',
            schema: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de estatísticas retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PlayerStats' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
                example: {
                  data: [
                    {
                      elo: 1250,
                      games: 85,
                      goals: 42,
                      assists: 28,
                      post_hits: 5,
                      ag: 3,
                      cs: 12,
                      wins: 55,
                      losses: 30,
                      goals_scored_match: 18,
                      points: 1520,
                      block: 7,
                      ace: 2,
                      defesas: 15,
                      pc: 4,
                      time: 5200000,
                      rebounds: 10,
                      blocks: 8,
                      steals: 6,
                      passes: 120,
                      interceptions: 14,
                      disarms: 22,
                      hat_tricks: 3,
                      shots_on_goal: 95,
                      saves: 18,
                      penalty_champion: 1,
                      roomName: 'NIVEL',
                      playerName: 'Jogador01',
                    },
                    {
                      elo: -175,
                      games: 10,
                      goals: 1,
                      assists: 0,
                      post_hits: 0,
                      ag: 0,
                      cs: 0,
                      wins: 0,
                      losses: 10,
                      goals_scored_match: 0,
                      points: 0,
                      block: 0,
                      ace: 0,
                      defesas: 0,
                      pc: 0,
                      time: 1836829,
                      rebounds: 0,
                      blocks: 0,
                      steals: 0,
                      passes: 0,
                      interceptions: 0,
                      disarms: 0,
                      hat_tricks: 0,
                      shots_on_goal: 0,
                      saves: 0,
                      penalty_champion: 0,
                      roomName: 'NIVEL',
                      playerName: 'xpq',
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 50,
                    total: 234,
                    pages: 5,
                  },
                },
              },
            },
          },
          '400': {
            description: 'Parâmetros inválidos na requisição',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Parâmetro sortBy inválido',
                  details: 'O campo informado não é válido para ordenação.',
                },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Erro ao buscar stats',
                  details: 'Erro de conexão com o banco de dados',
                },
              },
            },
          },
        },
      },
    },
    '/api/public/recs': {
      get: {
        tags: ['Recs'],
        operationId: 'getRecs',
        summary: 'Listar replays de partidas',
        description:
          'Retorna uma lista paginada de replays (gravações de partida). Os replays podem ser filtrados por nome ou sala.',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Número da página (começa em 1)',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Quantidade de resultados por página',
            schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            description: 'Termo de busca por nome do replay',
            schema: { type: 'string', default: '' },
          },
          {
            name: 'roomId',
            in: 'query',
            required: false,
            description: 'Filtrar por ID da sala',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de replays retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Rec' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
                example: {
                  data: [
                    {
                      id: 42,
                      fileName: 'match_2026-02-10_sala3.hbr2',
                      roomId: 3,
                      createdAt: '2026-02-10T22:30:00.000Z',
                    },
                    {
                      id: 41,
                      fileName: 'match_2026-02-10_sala1.hbr2',
                      roomId: 1,
                      createdAt: '2026-02-10T21:15:00.000Z',
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 50,
                    total: 128,
                    pages: 3,
                  },
                },
              },
            },
          },
          '400': {
            description: 'Parâmetros inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Parâmetro de paginação inválido',
                },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Erro ao buscar recs',
                  details: 'Erro de conexão com o banco de dados',
                },
              },
            },
          },
        },
      },
    },
    '/api/public/recs/{id}': {
      get: {
        tags: ['Recs'],
        operationId: 'getRecById',
        summary: 'Baixar replay por ID',
        description:
          'Retorna o arquivo binário (.hbr2) de um replay específico. O download é feito com Content-Disposition attachment.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID único do replay',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Arquivo binário do replay',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '404': {
            description: 'Replay não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Replay não encontrado',
                },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Erro ao buscar replay',
                  details: 'Erro interno',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PlayerStats: {
        type: 'object',
        properties: {
          elo: { type: 'integer', description: 'Ranking Elo do jogador' },
          games: { type: 'integer', description: 'Total de partidas jogadas' },
          goals: { type: 'integer', description: 'Total de gols marcados' },
          assists: { type: 'integer', description: 'Total de assistências' },
          post_hits: { type: 'integer', description: 'Bolas na trave' },
          ag: { type: 'integer', description: 'Gols contra (auto-gol)' },
          cs: { type: 'integer', description: 'Clean sheets' },
          wins: { type: 'integer', description: 'Total de vitórias' },
          losses: { type: 'integer', description: 'Total de derrotas' },
          goals_scored_match: { type: 'integer', description: 'Gols marcados na partida' },
          points: { type: 'integer', description: 'Pontuação total' },
          block: { type: 'integer', description: 'Bloqueios' },
          ace: { type: 'integer', description: 'Aces' },
          defesas: { type: 'integer', description: 'Defesas realizadas' },
          pc: { type: 'integer', description: 'Penalidades convertidas' },
          time: { type: 'integer', description: 'Tempo total jogado (em milissegundos)' },
          rebounds: { type: 'integer', description: 'Rebotes' },
          blocks: { type: 'integer', description: 'Blocks' },
          steals: { type: 'integer', description: 'Roubos de bola' },
          passes: { type: 'integer', description: 'Passes completados' },
          interceptions: { type: 'integer', description: 'Interceptações' },
          disarms: { type: 'integer', description: 'Desarmes' },
          hat_tricks: { type: 'integer', description: 'Hat-tricks' },
          shots_on_goal: { type: 'integer', description: 'Chutes ao gol' },
          saves: { type: 'integer', description: 'Defesas (goleiro)' },
          penalty_champion: { type: 'integer', description: 'Campeão de pênaltis' },
          roomName: { type: 'string', description: 'Nome da sala' },
          playerName: { type: 'string', description: 'Nome do jogador' },
        },
        required: ['playerName', 'roomName'],
      },
      Rec: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do replay' },
          fileName: { type: 'string', description: 'Nome do arquivo de replay' },
          roomId: { type: 'integer', description: 'ID da sala onde a partida aconteceu' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora de criação do replay',
          },
        },
        required: ['id', 'fileName'],
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Página atual' },
          limit: { type: 'integer', description: 'Resultados por página' },
          total: { type: 'integer', description: 'Total de registros' },
          pages: { type: 'integer', description: 'Total de páginas' },
        },
        required: ['page', 'limit', 'total', 'pages'],
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Mensagem de erro' },
          details: { type: 'string', description: 'Detalhes adicionais do erro' },
        },
        required: ['error'],
      },
    },
  },
}
