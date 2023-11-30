async function login(id) {
  const userData = await api.get("usuarios/" + id);

  sessionStorage.setItem(
    "user",
    JSON.stringify({
      id: userData.id,
      nome: userData.nome,
      foto: userData.foto,
    })
  );

  window.location.reload();
}

function logout() {
  sessionStorage.clear();
  window.location.reload();
}

function trazerUsuarioLogado() {
  const user = JSON.parse(sessionStorage.getItem("user"));

  return user;
}

async function removerComentario(id) {
  // Form Submit
  const formRemover = document.getElementById("formRemover");

  formRemover
    .querySelector('[data-prompt="nao"]')
    .addEventListener("click", () => {
      fecharModal("remover");
    });

  formRemover.addEventListener("submit", async (e) => {
    abrirModal("carregamento");
    e.preventDefault();

    await api.delete("comentarios/" + id);
    window.location.reload();

    fecharModal("carregamento");
  });

  abrirModal("remover");
}

async function editarComentario(id) {
  const $comentario = document.getElementById("comentario-input");

  abrirModal("carregamento");

  const comentario = await api.get("comentarios/" + id);

  $comentario.value = comentario.texto;

  fecharModal("carregamento");

  // Form Submit
  const formEditarComentario = document.getElementById("editCmt");

  formEditarComentario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const texto = formEditarComentario.querySelector(
      'textarea[name="comentario"]'
    ).value;

    abrirModal("carregamento");

    await api.patch("comentarios/" + id, { texto });

    fecharModal();

    window.location.reload();
  });

  abrirModal("editComment");
}

function renderizarUsuario(usuario) {
  const $inputUsuarioImagem = document.getElementById("inputUsuarioImagem");
  const $inputUsuarioNome = document.getElementById("inputUsuarioNome");
  const $usuarioImagem = document.querySelectorAll(".usuario-image");
  const $usuarioNome = document.querySelectorAll(".usuario-name");
  const $usuarioSobre = document.querySelectorAll(".details-description");

  $usuarioImagem.forEach(($el) => ($el.src = usuario.foto));
  $usuarioNome.forEach(($el) => ($el.innerText = usuario.nome));
  $usuarioSobre.forEach(
    ($el) => ($el.innerText = usuario.sobre || "Nenhuma informação.")
  );
  $inputUsuarioImagem.value = usuario.foto;
  $inputUsuarioNome.value = usuario.nome;
}

function renderizarDominios(dominios) {
  const tbody = document.querySelector("#gridDominios tbody");

  tbody.innerHTML = "";
  for (const dominio of dominios) {
    tbody.innerHTML += `
      <tr>
        <td>${dominio.dominio}</td>
        <td>${dominio.cert_https ? "Sim" : "Não"}</td>
        <td>${dominio.conex_http ? "Sim" : "Não"}</td>
        <td>${dominio.filtro_http ? "Sim" : "Não"}</td>
      </tr>
    `;
  }
}

function renderizarComentarios(comentarios) {
  const container = document.querySelector(".comments-container");

  container.innerHTML = "";
  for (const comentario of comentarios) {
    container.innerHTML += `
        <div class="comment-wrapper">
          <div class="comment-actions" data-visible="user-page-only">
            <i class="bx bxs-trash-alt trash-icon" onclick="removerComentario(${comentario.id})"></i>
            <i class="bx bxs-pencil edit-icon" onclick="editarComentario(${comentario.id})"></i>
          </div>
          <div class="comment">
            <div class="comment-details">
              <h4 class="comment-author">${comentario.dominio}</h4>
              <h4 class="comment-date">${comentario.data}</h4>
            </div>
            <p class="comment-text">${comentario.texto}</p>
          </div>
        </div>
    `;
  }
}

async function trazerDominios(usuario) {
  const dominios = await api.get("dominios?empresa=" + usuario);

  return dominios;
}

async function trazerComentarios(usuario) {
  const dominios = await api.get("dominios");
  let comentarios = (await api.get("comentarios?usuario=" + usuario)) || [];

  comentarios = comentarios.map((comentario) => {
    return {
      ...comentario,
      dominio:
        dominios.find((dominio) => dominio.id == comentario.dominio)?.dominio ||
        "Domínio Removido",
    };
  });

  return comentarios;
}

async function carregarUsuario(id) {
  if (!id) return false;

  const usuario = await api.get("usuarios/" + id);

  if (!usuario) return false;

  return usuario;
}

async function carregarPagina() {
  const botaoLogin = document.getElementById("loginBtn");
  const imagemUsuarioLogado = document.querySelector(".logged-user-image");

  abrirModal("carregamento");

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const usuario = await carregarUsuario(id);
  const usuarioLogado = trazerUsuarioLogado();

  // Remover isso na sprint 4
  if (!id) {
    window.location.href = "?id=10";
    return;
  }

  if (!usuario) {
    alert("Erro ao buscar o usuário/empresa!");
    return;
  }

  if (usuarioLogado) {
    document.getElementById("loginBtn").style.display = "none";
    document.querySelector(".logged-user-image").style.display = "flex";
    document.querySelector(".logged-user-image").src = usuarioLogado.foto;
  }

  renderizarUsuario(usuario);

  //
  if (usuario.empresa) {
    const dominiosEmpresa = await trazerDominios(id);
    const dominiosAbaBotao = document.querySelector(
      '[data-tab-header="domains"]'
    );

    mudarAba(dominiosAbaBotao);

    if (dominiosEmpresa) renderizarDominios(dominiosEmpresa);
  } else {
    const comentarios = await trazerComentarios(id);
    const comentariosAbaBotao = document.querySelector(
      '[data-tab-header="comments"]'
    );

    if (comentarios) renderizarComentarios(comentarios);

    mudarAba(comentariosAbaBotao);
  }

  // Exibição condicional dos botões
  const botoesInvisiveis = document.querySelectorAll("[data-visible]");
  const condicionais = {
    "user-only": !usuario.empresa,
    "company-only": usuario.empresa,
    "user-page-only": usuarioLogado?.id == id,
    "logged-user-only": usuarioLogado != null,
    "unlogged-user-only": !usuarioLogado != null,
    "verified-user": usuario.verificado,
  };

  botoesInvisiveis.forEach((botao) => {
    const condicional = botao.dataset.visible;

    if (!condicionais[condicional]) {
      botao.remove();
    }
  });

  fecharModal();

  // Event Listeners
  botaoLogin.addEventListener("click", (e) => {
    e.preventDefault();
    login(id);
  });

  imagemUsuarioLogado.addEventListener("click", logout);

  // Submit Formulários
  const formCadastroDominio = document.getElementById("cadDom");
  const formEdicaoPerfil = document.getElementById("editProf");

  formCadastroDominio.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dominio = document.querySelector("#cadDom input").value;

    abrirModal("carregamento");

    await api.post("dominios", {
      empresa: id,
      dominio: dominio,
      cert_https: true,
      conex_http: true,
      filtro_http: true,
    });

    fecharModal();

    window.location.reload();
  });

  formEdicaoPerfil.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = formEdicaoPerfil.querySelector('input[name="nome"]').value;
    const foto = formEdicaoPerfil.querySelector('input[name="foto"]').value;
    const sobre = formEdicaoPerfil.querySelector("textarea").value;

    abrirModal("carregamento");

    await api.patch("usuarios/" + id, { nome, foto, sobre });

    fecharModal();

    window.location.reload();
  });
}

carregarPagina();
