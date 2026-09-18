/* ------------------------------------------------------------------
   Cliente da API — conversa com o Google Apps Script.
   O endereço fica em config.js, carregado antes do app.
   ------------------------------------------------------------------ */

const URL_API = () => (window.CONFIG && window.CONFIG.API_URL) || "";

function precisaConfig() {
  const u = URL_API();
  return !u || u.indexOf("COLE_AQUI") !== -1;
}

async function chamar(acao, dados) {
  if (precisaConfig()) throw new Error("SEM_CONFIG");
  const resp = await fetch(URL_API(), {
    method: "POST",
    // text/plain evita o preflight CORS, que o Apps Script não responde
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ acao, ...dados }),
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  const json = await resp.json();
  if (!json.ok) throw new Error(json.erro || "Erro no servidor");
  return json;
}

export const api = {
  semConfig: precisaConfig,

  // devolve { trabalhos, avaliadores, avaliacoes }
  carregar: () => chamar("carregar", {}),

  // o servidor substitui a avaliação anterior do mesmo avaliador/etapa/trabalho
  enviarAvaliacao: (registro) => chamar("enviarAvaliacao", { registro }),

  apagarAvaliacao: (id) => chamar("apagarAvaliacao", { id }),

  // sorteia os trabalhos de apresentação de cada avaliador cadastrado,
  // respeitando sede, área e séries; devolve o pacote atualizado + avisos
  distribuirApresentacao: () => chamar("distribuirApresentacao", {}),
};

/* preferência local (nome selecionado), guardada só no navegador do professor */
export const local = {
  get(chave) {
    try {
      return window.localStorage.getItem(chave) || "";
    } catch (e) {
      return "";
    }
  },
  set(chave, valor) {
    try {
      window.localStorage.setItem(chave, valor);
    } catch (e) {
      /* navegador em modo restrito: segue sem lembrar o nome */
    }
  },
};
