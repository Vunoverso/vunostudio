/**
 * admin-auth.js
 * Sistema de autenticação do painel (login/logout)
 */

async function doLogin() {
  const emailEl = document.getElementById('adminEmail');
  const pwdEl = document.getElementById('pwd');
  const errEl = document.getElementById('loginErr');

  const email = (emailEl && emailEl.value || '').trim();
  const password = (pwdEl && pwdEl.value || '').trim();

  if (!email || !password) {
    if (errEl) {
      errEl.textContent = 'Preencha e-mail e senha.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (!window.supabaseClient) {
    if (errEl) {
      errEl.textContent = 'Supabase nao inicializado.';
      errEl.style.display = 'block';
    }
    return;
  }

  const btn = document.querySelector('#loginScreen .btn-primary');
  if (btn) btn.disabled = true;

  const result = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (btn) btn.disabled = false;

  if (result.error) {
    console.error('Supabase login failed:', result.error);

    let message = 'Falha no login. Verifique e-mail e senha.';
    if (result.error.message === 'Invalid login credentials') {
      message = 'Falha no login. Verifique e-mail e senha.';
    } else if (result.error.message === 'Email not confirmed') {
      message = 'O e-mail ainda não foi confirmado no Supabase.';
    } else if (result.error.message) {
      message = 'Falha no login: ' + result.error.message;
    }

    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
    if (pwdEl) {
      pwdEl.value = '';
      pwdEl.focus();
    }
    return;
  }

  if (errEl) errEl.style.display = 'none';
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminLayout').classList.add('on');
  loadAll();
}

async function doLogout() {
  if (window.supabaseClient) {
    await window.supabaseClient.auth.signOut();
  }
  location.reload();
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
  const errEl = document.getElementById('loginErr');
  if (errEl) errEl.style.display = 'none';

  // Tecla Enter no input de senha
  const emailInput = document.getElementById('adminEmail');
  const pwdInput = document.getElementById('pwd');
  if (emailInput) {
    emailInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doLogin();
    });
  }
  if (pwdInput) {
    pwdInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doLogin();
    });
  }

  // Verificar sessao existente no Supabase
  if (!window.supabaseClient) return;

  const { data } = await window.supabaseClient.auth.getSession();
  if (data && data.session) {
    if (emailInput && !emailInput.value) {
      emailInput.value = data.session.user && data.session.user.email ? data.session.user.email : '';
    }
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLayout').classList.add('on');
    loadAll();
  }
});
