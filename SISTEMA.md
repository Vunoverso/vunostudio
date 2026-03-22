# Vuno Studio - Documento do Sistema

## Visão Geral

O projeto Vuno Studio é um site institucional com painel administrativo para edição de conteúdo, portfólio e planos comerciais.

O site foi estruturado para manter hospedagem simples de frontend estático, mas com conteúdo dinâmico vindo do Supabase.

Hoje o sistema está em um modelo híbrido:

- frontend estático em HTML, CSS e JavaScript puro
- conteúdo dinâmico carregado no navegador
- painel admin para edição manual
- persistência centralizada no Supabase

Esse modelo evita a complexidade de um framework fullstack, mas já permite atualizar conteúdo sem republicar arquivos JSON manualmente.

---

## Stack Atual

- HTML5
- CSS3
- JavaScript puro
- Supabase Auth
- Supabase Database
- JSON local como fallback

Sem framework frontend.
Sem backend próprio.

---

## Estrutura do Projeto

### Páginas principais

- index.html
- servicos.html
- planos.html
- admin.html

### Estilos

- css/global.css
- css/style.css
- css/servicos.css
- css/planos.css
- css/admin.css

### Scripts principais

- js/main.js
- js/index.js
- js/servicos.js
- js/planos.js
- js/nav.js
- js/site-data.js

### Scripts do admin

- js/admin-auth.js
- js/admin-config.js
- js/admin-data.js
- js/admin-ui.js

### Configuração Supabase

- js/supabase-config.js
- js/supabase-client.js

### Dados locais

- data/content.json
- data/planos.json
- data/images.json
- data/index.json
- data/servicos.json

### Assets

- images/
- images/galeria/
- images/servicos/

---

## Arquitetura Atual

### Site público

O site público funciona com HTML estático e carregamento de conteúdo via JavaScript.

Fluxo:

1. A página HTML carrega a estrutura base.
2. O JavaScript tenta buscar dados na tabela `site_data` do Supabase.
3. Se não encontrar ou se houver falha, usa os arquivos em `data/*.json` como fallback.
4. Os componentes da página são preenchidos no browser.

Arquivo central desse fluxo:

- js/site-data.js

Esse arquivo expõe `window.loadSiteData(key, fallbackUrl)`.

### Painel administrativo

O painel admin foi adaptado para autenticação com Supabase e gravação no banco.

Fluxo:

1. Usuário faz login com e-mail e senha via Supabase Auth.
2. O painel tenta carregar os dados da tabela `site_data`.
3. Caso o conteúdo exista, preenche os formulários.
4. Ao salvar, o painel faz `upsert` por chave na tabela `site_data`.

Chaves atualmente utilizadas:

- `content`
- `planos`
- `images`
- `index` (site público preparado para leitura)
- `servicos` (site público preparado para leitura)

Observação:

O painel hoje salva diretamente `content`, `planos` e `images`.

`index` e `servicos` já podem ser lidos pelo site público se forem gravados no banco, mas ainda não possuem painel administrativo completo dedicado.

---

## Páginas e Responsabilidades

### Home

Arquivo principal:

- index.html

Renderização:

- js/index.js

Dados:

- data/index.json
- Supabase `site_data.key = 'index'`

Estado atual:

- hero dinâmico
- CTA final dinâmico
- carregamento do conteúdo via banco ou fallback JSON

Limitação atual:

- o arquivo HTML atual contém placeholder no meio do markup para seções intermediárias que não estão mais presentes no arquivo atual

### Serviços

Arquivo principal:

- servicos.html

Renderização:

- js/servicos.js

Dados:

- data/servicos.json
- Supabase `site_data.key = 'servicos'`

Estado atual:

- hero dinâmico
- seção digital dinâmica
- seção visual dinâmica
- seção de tráfego dinâmica
- processo dinâmico
- CTA dinâmico
- galeria carregada separadamente por `images`

### Planos

Arquivo principal:

- planos.html

Renderização:

- js/planos.js
- partes globais também em js/main.js

Dados:

- data/planos.json
- Supabase `site_data.key = 'planos'`

Estado atual:

- planos digitais dinâmicos
- produtos visuais dinâmicos
- planos de tráfego dinâmicos
- FAQ dinâmico

### Admin

Arquivo principal:

- admin.html

Módulos:

- js/admin-auth.js
- js/admin-data.js
- js/admin-ui.js
- js/admin-config.js

Estado atual:

- login com Supabase Auth
- edição de contato e links
- edição de planos digitais
- edição de comunicação visual
- edição de tráfego pago
- edição da galeria
- salvamento direto no banco

Melhorias aplicadas recentemente:

- mensagens mais claras quando não existe registro no banco
- tratamento especial para execução via `file://`
- telas de Visual e Tráfego não ficam mais vazias sem explicação
- possibilidade de adicionar itens manualmente mesmo sem carga inicial

---

## Banco de Dados

### Tabela principal

Tabela:

- `site_data`

Estrutura atual:

- `key` - text - chave primária
- `data` - jsonb - conteúdo da chave
- `updated_at` - timestamptz - data de atualização

Essa tabela centraliza o conteúdo do site.

### Padrão de armazenamento

Cada linha representa um bloco lógico do sistema.

Exemplos:

- `content` -> links globais, rodapé, CTAs de navegação
- `planos` -> presença digital, visual, tráfego e FAQ
- `images` -> galeria de trabalhos
- `index` -> hero e CTA da home
- `servicos` -> copy e blocos da página de serviços

---

## Autenticação

O admin usa Supabase Auth com e-mail e senha.

Arquivos envolvidos:

- js/supabase-config.js
- js/supabase-client.js
- js/admin-auth.js

Fluxo:

1. O usuário informa e-mail e senha.
2. O sistema chama `signInWithPassword`.
3. Se houver sessão válida, o admin é liberado.
4. Logout usa `signOut()`.

Observações importantes:

- a senha não fica mais hardcoded no frontend
- o usuário admin precisa existir no Supabase
- o provider de e-mail/senha precisa estar habilitado

---

## Políticas do Supabase

Para o sistema funcionar corretamente, a tabela `site_data` precisa permitir:

1. leitura pública para o site
2. escrita apenas para usuários autenticados do admin

Exemplo conceitual de política:

- leitura pública para `select`
- `insert` e `update` restritos a `authenticated`

Sem isso:

- o site público não consegue ler o conteúdo
- o admin não consegue gravar alterações

---

## Fallback Local

O sistema usa JSON local como fallback em desenvolvimento.

Isso é útil quando:

- o banco ainda não foi populado
- o conteúdo está em fase de migração
- o frontend precisa continuar funcionando sem dependência total do banco

Limitação importante:

Navegadores bloqueiam `fetch` de arquivos locais quando a página é aberta via `file://`.

Por isso:

- o projeto deve ser testado com Live Server ou outro servidor HTTP local
- abrir o HTML por duplo clique gera erro de CORS no fallback local

---

## Estado Atual do Projeto

### O que já foi concluído

- página de planos estruturada com dados dinâmicos
- página de serviços estruturada com dados dinâmicos
- home preparada para dados dinâmicos na parte existente do arquivo atual
- autenticação do admin migrada para Supabase Auth
- salvamento do admin migrado para Supabase
- site público preparado para ler do Supabase
- fallback local mantido para JSON
- melhorias de UX no admin para estados sem dados

### O que ainda está pendente

- painel admin para editar `index`
- painel admin para editar `servicos`
- primeira carga completa de todos os dados no banco
- revisão final do deploy em produção
- reconstrução das seções ausentes no meio de `index.html`, se ainda fizerem parte do escopo do site

---

## Deploy Recomendado

### Site público

Melhores opções para este projeto:

- Cloudflare Pages
- Netlify
- Vercel

Como o frontend é estático, qualquer uma dessas opções atende bem.

Recomendação prática:

- site público em Cloudflare Pages ou Netlify
- domínio principal: `vunostudio.com.br`

### Admin

Não é recomendado publicar `admin.html` de forma aberta no mesmo deploy público do site.

Melhor prática:

- manter local inicialmente
- ou publicar depois em subdomínio separado
- ou proteger com camada adicional de acesso

Exemplo futuro:

- `admin.vunostudio.com.br`

---

## Funcionamento Conceitual do Sistema

### Modelo atual

O projeto não é mais um site estático puro.

Também não é um sistema full dynamic server-side.

Ele opera em um modelo híbrido:

- estrutura estática
- conteúdo dinâmico no cliente
- backend de dados e autenticação via Supabase

Esse modelo é adequado para:

- site institucional
- página de serviços
- catálogo pequeno ou médio
- portfólio
- edição administrativa simples

Não é necessário migrar para Next.js ou outro framework neste estágio, a menos que o escopo cresça muito.

---

## Riscos e Pontos de Atenção

### 1. Admin exposto publicamente

Mesmo com login, o admin não deve ser tratado como página pública comum.

### 2. Dependência de políticas corretas no Supabase

Se as policies estiverem erradas:

- o site não lê
- o admin não salva

### 3. Diferença entre ambiente local e produção

Local com `file://` gera bloqueios de CORS.

Ambiente correto de teste deve ser HTTP ou HTTPS.

### 4. Conteúdo incompleto da home

O `index.html` atual contém trecho placeholder, então parte da home original não está mais materializada no arquivo.

---

## Próximos Passos Recomendados

### Curto prazo

1. Confirmar policies da tabela `site_data`
2. Popular o banco com `content`, `planos` e `images`
3. Testar o site público lendo direto do Supabase
4. Publicar o site no domínio principal

### Médio prazo

1. Criar painel admin para `index`
2. Criar painel admin para `servicos`
3. Adicionar mecanismo de carga inicial automática do JSON local para o banco

### Longo prazo

1. Separar admin em subdomínio próprio
2. reforçar controle de acesso
3. avaliar migração para arquitetura full dynamic apenas se o escopo crescer

---

## Resumo Executivo

Até aqui, o projeto evoluiu de um site com conteúdo hardcoded para um sistema híbrido com:

- frontend estático
- conteúdo centralizado em banco
- autenticação real no admin
- base pronta para crescimento

O estágio atual já é suficiente para operar como site profissional institucional com edição centralizada de conteúdo, desde que:

- o Supabase esteja corretamente configurado
- o banco seja populado
- o site público seja publicado em ambiente HTTPS
