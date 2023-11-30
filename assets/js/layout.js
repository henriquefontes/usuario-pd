// -------- Animação Texto Carregamento --------
const textoCarregamento = document.querySelector(".loading h3");
const textosCarregamento = ["Pescando Informações"];

// -------- Tab Menu --------
const abaAtual = document.querySelector(`*[data-tab-header].active`);
const abasBotoes = document.querySelectorAll("*[data-tab-header]");
const abaSublinhado = document.querySelector(".tab-underline");

if (abaAtual) {
  abaSublinhado.style.width = abaAtual.clientWidth + "px";
}

function mudarAba(abaBotao) {
  const abaSublinhada = abaBotao.dataset.tabHeader;
  const abaSublinhadaEl = document.querySelector(
    `*[data-tab="${abaSublinhada}"]`
  );
  const abaAtual = document.querySelector(`*[data-tab].active`);
  const abaAtualBotao = document.querySelector(".tab-button.active");

  if (abaAtualBotao && abaAtual) {
    abaAtualBotao.classList.remove("active");
    abaAtual.classList.remove("active");
  }

  abaBotao.classList.add("active");
  abaSublinhadaEl.classList.add("active");

  abaSublinhado.style.width = abaBotao.clientWidth + "px";

  if (abaSublinhado.offsetLeft < abaBotao.offsetLeft) {
    const translateVal = abaSublinhado.offsetLeft + abaBotao.offsetLeft;

    abaSublinhado.style.transform = `translateX(${translateVal}px)`;
  } else {
    const translateVal = abaSublinhado.offsetLeft - abaBotao.offsetLeft;

    abaSublinhado.style.transform = `translateX(${translateVal}px)`;
  }
}

abasBotoes.forEach((abaBotao) => {
  abaBotao.addEventListener("click", () => {
    mudarAba(abaBotao);
  });
});

// -------- Modal --------
function abrirModal(modalName) {
  const modalWrapper = document.querySelector(".modal-wrapper");
  const modals = document.querySelectorAll("[data-modal]");
  const modal = document.querySelector(`[data-modal="${modalName}"]`);

  modals.forEach((modal) => modal.classList.remove("active"));
  modal.classList.add("active");

  modalWrapper.classList.add("active");
  document.querySelector("body").style.overflow = "hidden";
}

function fecharModal() {
  const modalWrapper = document.querySelector(".modal-wrapper");
  const activeModal = document.querySelector(".modal.active");

  if (!activeModal) return;

  modalWrapper.classList.remove("active");
  activeModal.classList.remove("active");
  document.querySelector("body").style.overflowY = "scroll";
}

document.querySelectorAll(".modal-close-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    fecharModal();
  });
});

document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    abrirModal(btn.dataset.openModal);
  });
});

// -------- Animação Texto Carregamento --------
setInterval(() => {
  const texto = textoCarregamento.innerHTML;
  const randomIndex = Math.floor(Math.random() * textosCarregamento.length);

  if (texto.endsWith("...") || !texto) {
    textoCarregamento.innerHTML = textosCarregamento[randomIndex];
  } else {
    textoCarregamento.innerHTML += ".";
  }
}, 500);

// -------- Limite Máximo de Altura dos Menus --------
const abasBotoesContainer = document.querySelectorAll(".tab-container");

abasBotoesContainer.forEach((container) => {
  container.style.maxHeight = `calc(100vh - ${container.offsetTop}px)`;
});
