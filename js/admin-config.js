/**
 * admin-config.js
 * Configurações e metadados do painel administrativo
 */

const ADMIN_CONFIG = {
  // Painéis de navegação sidebar
  panels: [
    {
      id: 'contato',
      name: 'Contato & Links',
      icon: '📞',
      section: 'Conteúdo',
      sectionIndex: 0,
      description: 'Número de WhatsApp, e-mail e textos dos botões do menu em cada página.'
    },
    {
      id: 'digital',
      name: 'Planos Digitais',
      icon: '📱',
      section: 'Conteúdo',
      sectionIndex: 0,
      description: 'Edite os 3 planos de presença digital: nome, preço, features e adicionais.'
    },
    {
      id: 'visual',
      name: 'Comunicação Visual',
      icon: '🖼️',
      section: 'Conteúdo',
      sectionIndex: 0,
      description: 'Edite os 4 produtos: nome, descrição, preços e itens inclusos.'
    },
    {
      id: 'trafego',
      name: 'Tráfego Pago',
      icon: '📈',
      section: 'Conteúdo',
      sectionIndex: 0,
      description: 'Edite os planos de Google Ads, Meta Ads e o Combo.'
    },
    {
      id: 'galeria',
      name: 'Galeria de Trabalhos',
      icon: '🏗️',
      section: 'Portfólio',
      sectionIndex: 1,
      description: 'Adicione, remova e edite as fotos exibidas na página de Serviços.'
    }
  ],

  // Campos de categoria para galeria
  galeriaCategories: ['acm', 'digital', 'lona', 'adesivo', 'impresso', 'identidade'],

  // Layouts de galeria
  galeriaLayouts: ['', 'tall', 'wide']
};
