# Chronos.work Mobile

Aplicativo mobile de controle de ponto e gerenciamento de tempo construído com React Native (Expo) para Android e iOS.

## 🚀 Tecnologias

- **React Native** com **Expo**
- **TypeScript** (strict mode)
- **React Navigation** (navegação entre telas)
- **AsyncStorage** (armazenamento local)
- **Expo Linear Gradient** (gradientes)
- **JWT Authentication** (autenticação com tokens)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend API rodando em `http://localhost:8000` (do repositório chronos_work)

Para testar o app:
- **Android**: Android Studio + emulador ou dispositivo físico
- **iOS**: Xcode + simulador (apenas macOS) ou dispositivo físico
- **Alternativa**: App Expo Go instalado no seu dispositivo móvel

## 🛠️ Instalação

1. Clone o repositório (ou navegue até a pasta):
```bash
cd C:\Users\pablo\Projetos\Chronos.work\chronos_work_mobile
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Edite o arquivo `src/lib/config.ts` e ajuste a URL da API:

```typescript
export const API_URL = 'http://SEU_IP:8000'; // Use seu IP local, não localhost!
```

**Importante**: Para testar em dispositivo físico, use o IP da sua máquina na rede local (ex: `http://192.168.1.100:8000`) ao invés de `localhost`, pois o dispositivo precisa acessar o backend rodando no seu computador.

## 📱 Executando o App

### Modo de Desenvolvimento

```bash
# Iniciar o Metro bundler
npm start

# Ou para uma plataforma específica:
npm run android  # Android
npm run ios      # iOS (apenas macOS)
npm run web      # Web (experimental)
```

Após executar `npm start`, você verá um QR code no terminal. Você pode:

- **Escanear o QR code** com o app Expo Go (Android) ou Camera (iOS)
- **Pressionar 'a'** para abrir no emulador Android
- **Pressionar 'i'** para abrir no simulador iOS (macOS)
- **Pressionar 'w'** para abrir no navegador web

### Testando em Dispositivo Físico

1. Instale o app **Expo Go** no seu dispositivo:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Certifique-se de que seu dispositivo e computador estão na **mesma rede Wi-Fi**

3. Configure a URL da API para usar o IP local da sua máquina

4. Execute `npm start` e escaneie o QR code com o Expo Go

## 🏗️ Estrutura do Projeto

```
chronos_work_mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis (Button, Input, Card, etc.)
│   ├── contexts/        # Context API (AuthContext)
│   ├── lib/            # Utilitários (API client, config)
│   ├── navigation/     # Configuração de navegação
│   ├── screens/        # Telas do app (Login, Register, Dashboard)
│   ├── theme/          # Sistema de design (cores, espaçamentos, etc.)
│   └── types/          # Tipos TypeScript
├── App.tsx             # Ponto de entrada do app
├── app.json           # Configuração do Expo
└── package.json       # Dependências
```

## 🎨 Sistema de Design

O app utiliza o mesmo sistema de cores e design do frontend web:

- **Cores primárias**: Azul (#3b82f6) e tons de cinza quente
- **Gradientes**: Utilizados em fundos de tela para efeito glassmorphism
- **Componentes**: Button, Input, Card com estilos consistentes
- **Tipografia**: Sizes e weights padronizados
- **Espaçamentos**: Sistema consistente (xs, sm, md, lg, xl, xxl)

## 🔐 Autenticação

O app utiliza autenticação JWT com os seguintes recursos:

- **Access Token**: Armazenado no AsyncStorage, enviado em todas as requisições autenticadas
- **Refresh Token**: Usado para renovar o access token automaticamente quando expira
- **Auto-login**: Ao abrir o app, tenta carregar o perfil do usuário se houver token válido
- **Navegação Condicional**: Redireciona automaticamente entre Login/Dashboard baseado no estado de autenticação

## 📊 Funcionalidades

### Telas Implementadas

1. **Login**
   - Email e senha
   - Validação de campos
   - Link para registro
   - Tratamento de erros

2. **Registro**
   - Dados básicos: nome, email, senha
   - Dados profissionais opcionais: CPF, departamento, cargo
   - Validação de campos
   - Confirmação de senha

3. **Dashboard**
   - Check-in / Check-out
   - Sessão ativa com contador de tempo
   - Estatísticas: horas trabalhadas hoje, último ponto
   - Histórico completo de registros
   - Pull-to-refresh
   - Atualização automática a cada minuto
   - Botão de logout

### API Endpoints Utilizados

- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `POST /auth/refresh-token` - Renovar access token
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Obter perfil do usuário
- `POST /timelog/checkin` - Registrar entrada
- `POST /timelog/checkout` - Registrar saída
- `GET /timelog` - Listar registros de tempo

## 🚧 Recursos Futuros

- [ ] Notificações push (lembrete de check-in/out)
- [ ] Modo offline com sincronização
- [ ] Edição de perfil
- [ ] Gráficos de produtividade
- [ ] Relatórios de horas trabalhadas
- [ ] Modo escuro
- [ ] Biometria para login rápido
- [ ] Export de dados (PDF, Excel)

## 🐛 Troubleshooting

### Erro de conexão com a API

Se você não conseguir conectar ao backend:

1. Verifique se o backend está rodando em `http://localhost:8000`
2. Se estiver testando em dispositivo físico, use o IP local da sua máquina
3. Certifique-se de que não há firewall bloqueando a conexão
4. Para Android, você pode usar `adb reverse tcp:8000 tcp:8000` para mapear localhost

### App não inicia

1. Limpe o cache: `npx expo start -c`
2. Reinstale as dependências: `rm -rf node_modules && npm install`
3. Verifique se todas as dependências estão instaladas corretamente

### Erro de TypeScript

1. Verifique se o TypeScript está instalado: `npm install -D typescript`
2. Reconstrua os tipos: `npx tsc --noEmit`

## 📄 Licença

Este projeto faz parte do ecossistema Chronos.work.

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📧 Contato

Para dúvidas ou suporte, entre em contato através do repositório principal do Chronos.work.

---

Desenvolvido com ❤️ usando React Native e Expo
