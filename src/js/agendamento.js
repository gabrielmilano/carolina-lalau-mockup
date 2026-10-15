/* Pré-agendamento: o paciente escolhe tratamento, dia e período; o pedido chega
   formatado no WhatsApp do consultório, que confirma o horário. Sem servidor. */
(function () {
  var ZAP = "5548998114464";
  var TRATAMENTOS = [
    { id: "invisalign", nome: "Alinhadores Invisalign", quem: "Dra. Carolina Lalau" },
    { id: "aparelho", nome: "Aparelho fixo", quem: "Dra. Carolina Lalau" },
    { id: "clinica", nome: "Clínica geral e clareamento", quem: "Dra. Carolina Lalau" },
    { id: "harmonizacao", nome: "Harmonização orofacial", quem: "Dra. Carolina Michels" },
    { id: "implante", nome: "Implantes", quem: "Dr. Alexandre Benincá e Dr. Luiz Gustavo Rosso" },
    { id: "siso", nome: "Extração de sisos", quem: "Dr. Luiz Gustavo Rosso" },
    { id: "canal", nome: "Tratamento de canal", quem: "Dra. Gabriela Zanellato" },
    { id: "protese", nome: "Prótese", quem: "Dra. Caroline Gregorini" },
    { id: "avaliacao", nome: "Ainda não sei — quero uma avaliação", quem: "A equipe indica o profissional" }
  ];
  /* expediente: seg–qui 9h30–12h / 13h30–18h · sex 9h30–12h / 13h30–16h */
  var EXP = { manha: ["09:30", "10:00", "10:30", "11:00", "11:30"], tarde: ["13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"] };
  var SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  var SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var raiz = $("#agendamento");
  if (!raiz) return;

  var estado = { trat: null, dia: null, periodo: null, hora: null, nome: "", fone: "", primeira: null, obs: "" };
  var passo = 1;

  /* passo 1: tratamentos */
  $("#opcTrat").innerHTML = TRATAMENTOS.map(function (t) {
    return '<button type="button" class="opc" data-trat="' + t.id + '" aria-pressed="false">' + t.nome + "<small>" + t.quem + "</small></button>";
  }).join("");

  /* passo 2: próximos 10 dias úteis, a partir de amanhã */
  var dias = [], d = new Date(); d.setHours(12, 0, 0, 0);
  while (dias.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() > 0 && d.getDay() < 6) dias.push(new Date(d)); }
  var isoDia = function (x) { return x.getFullYear() + "-" + (x.getMonth() + 1) + "-" + x.getDate(); };
  $("#dias").innerHTML = dias.map(function (x) {
    return '<button type="button" class="dia" data-dia="' + isoDia(x) + '" aria-pressed="false"><small>' + SEMANA[x.getDay()] + "</small><b>" + x.getDate() + "</b><small>" + ("0" + (x.getMonth() + 1)).slice(-2) + "</small></button>";
  }).join("");
  var diaObj = function () { return dias.filter(function (x) { return isoDia(x) === estado.dia; })[0]; };

  function horas() {
    var alvo = $("#horas"), dd = diaObj();
    if (!estado.periodo || !dd) { alvo.innerHTML = ""; $("#rotHoras").hidden = true; return; }
    var lista = EXP[estado.periodo].filter(function (h) { return !(dd.getDay() === 5 && estado.periodo === "tarde" && h >= "16:00"); });
    $("#rotHoras").hidden = false;
    alvo.innerHTML = '<button type="button" class="hora" data-hora="" aria-pressed="' + (!estado.hora) + '">Tanto faz</button>' +
      lista.map(function (h) { return '<button type="button" class="hora" data-hora="' + h + '" aria-pressed="' + (estado.hora === h) + '">' + h.replace(":", "h").replace("h00", "h") + "</button>"; }).join("");
    $("#tardeLabel").textContent = dd.getDay() === 5 ? "13h30 às 16h" : "13h30 às 18h";
  }

  /* navegação entre passos */
  var indicadores = $$(".passos-ind li");
  function mostrar(n, dir) {
    var atual = $(".passo.ativo", raiz), prox = $('.passo[data-passo="' + n + '"]', raiz);
    passo = n;
    indicadores.forEach(function (li, i) { li.classList.toggle("ativo", i === n - 1); li.classList.toggle("feito", i < n - 1); });
    if (window.gsap && atual) {
      gsap.to(atual, { opacity: 0, x: dir * -24, duration: .22, ease: "power2.in", onComplete: function () {
        atual.classList.remove("ativo"); prox.classList.add("ativo");
        gsap.fromTo(prox, { opacity: 0, x: dir * 24 }, { opacity: 1, x: 0, duration: .4, ease: "power3.out" });
      } });
    } else { if (atual) atual.classList.remove("ativo"); prox.classList.add("ativo"); }
    $("#erro").textContent = "";
    if (n === 4) resumo();
  }
  function validar(n) {
    if (n === 1 && !estado.trat) return "Escolha um tratamento para continuar.";
    if (n === 2 && !estado.dia) return "Escolha um dia.";
    if (n === 2 && !estado.periodo) return "Escolha manhã ou tarde.";
    if (n === 3) {
      estado.nome = $("#agNome").value.trim(); estado.fone = $("#agFone").value.trim(); estado.obs = $("#agObs").value.trim();
      if (estado.nome.length < 2) return "Escreva seu nome.";
      if (estado.fone.replace(/\D/g, "").length < 10) return "Escreva um WhatsApp com DDD.";
    }
    return "";
  }
  raiz.addEventListener("click", function (e) {
    var t = e.target.closest("[data-trat]"); if (t) { estado.trat = t.dataset.trat; $$("[data-trat]", raiz).forEach(function (b) { b.setAttribute("aria-pressed", b === t); }); setTimeout(function () { mostrar(2, 1); }, 220); return; }
    var dd = e.target.closest("[data-dia]"); if (dd) { estado.dia = dd.dataset.dia; estado.hora = null; $$("[data-dia]", raiz).forEach(function (b) { b.setAttribute("aria-pressed", b === dd); }); if (window.gsap) gsap.fromTo(dd, { scale: .92 }, { scale: 1, duration: .35, ease: "back.out(3)" }); horas(); return; }
    var p = e.target.closest("[data-periodo]"); if (p) { estado.periodo = p.dataset.periodo; estado.hora = null; $$("[data-periodo]", raiz).forEach(function (b) { b.setAttribute("aria-pressed", b === p); }); horas(); return; }
    var h = e.target.closest("[data-hora]"); if (h) { estado.hora = h.dataset.hora || null; $$("[data-hora]", raiz).forEach(function (b) { b.setAttribute("aria-pressed", b === h); }); return; }
    var sn = e.target.closest("[data-primeira]"); if (sn) { estado.primeira = sn.dataset.primeira; $$("[data-primeira]", raiz).forEach(function (b) { b.setAttribute("aria-pressed", b === sn); }); return; }
    var av = e.target.closest("[data-avancar]"); if (av) { var er = validar(passo); if (er) { $("#erro").textContent = er; return; } mostrar(passo + 1, 1); return; }
    var vt = e.target.closest("[data-voltar]"); if (vt) { mostrar(passo - 1, -1); return; }
  });

  function textoPedido() {
    var t = TRATAMENTOS.filter(function (x) { return x.id === estado.trat; })[0], dd = diaObj();
    var quando = SEMANA_LONGA[dd.getDay()] + ", " + ("0" + dd.getDate()).slice(-2) + "/" + ("0" + (dd.getMonth() + 1)).slice(-2) + " — " + (estado.periodo === "manha" ? "manhã" : "tarde") + (estado.hora ? " (por volta das " + estado.hora + ")" : "");
    return { t: t, quando: quando, msg: "Olá! Gostaria de pré-agendar uma consulta pelo site.\n\n" +
      "• Tratamento: " + t.nome + "\n• Preferência: " + quando + "\n• Nome: " + estado.nome + "\n• WhatsApp: " + estado.fone +
      (estado.primeira ? "\n• Primeira consulta no consultório: " + (estado.primeira === "sim" ? "sim" : "não") : "") +
      (estado.obs ? "\n• Observação: " + estado.obs : "") + "\n\nAguardo a confirmação do horário. Obrigado(a)!" };
  }
  function resumo() {
    var r = textoPedido();
    $("#resumo").innerHTML =
      "<li><span>Tratamento</span><span>" + r.t.nome + "<br><small>" + r.t.quem + "</small></span></li>" +
      "<li><span>Preferência</span><span>" + r.quando + "</span></li>" +
      "<li><span>Nome</span><span>" + estado.nome.replace(/</g, "&lt;") + "</span></li>" +
      "<li><span>WhatsApp</span><span>" + estado.fone.replace(/</g, "&lt;") + "</span></li>";
    $("#enviar").href = "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(r.msg);
  }

  /* botões "pré-agendar" dos cards de tratamento já escolhem o tratamento */
  $$("[data-agendar]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.agendar, alvo = $('[data-trat="' + id + '"]', raiz);
      document.getElementById("agendar").scrollIntoView({ behavior: "smooth" });
      if (alvo) { estado.trat = id; $$("[data-trat]", raiz).forEach(function (x) { x.setAttribute("aria-pressed", x === alvo); }); setTimeout(function () { if (passo === 1) mostrar(2, 1); }, 700); }
    });
  });

  /* máscara simples de telefone */
  $("#agFone").addEventListener("input", function (e) {
    var v = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = v.length > 6 ? "(" + v.slice(0, 2) + ") " + v.slice(2, v.length - 4) + "-" + v.slice(-4) : v.length > 2 ? "(" + v.slice(0, 2) + ") " + v.slice(2) : v;
  });

  window.CL_AGENDA = { textoPedido: textoPedido, estado: estado };
})();
