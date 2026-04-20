-- ============================================================
-- Restaurar dados completos de planos no Supabase (com CTA)
-- Execute no SQL Editor do Supabase
-- ============================================================
update site_data
set
  data = data
    || '{"cta":{"label":"Pronto para começar?","titleHtml":"Diagnóstico gratuito,<br><em>sem compromisso.</em>","sub":"Analisamos sua presença digital atual e mostramos exatamente o que está custando clientes. Em 30 minutos você sabe por onde começar.","whatsappText":"Peça sua cotação","whatsappHref":"https://wa.me/55?text=Quero%20um%20diagn%C3%B3stico%20gratuito","emailText":"Enviar e-mail","emailHref":"mailto:contato@vunostudio.com.br"}}'::jsonb,
  updated_at = now()
where key = 'planos';
