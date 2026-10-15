/* Movimento: estados iniciais aplicados aqui; sem JS o site fica estático e legível. */
(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* menu mobile e cabeçalho funcionam mesmo sem GSAP */
  var bt = $(".abrir-menu"), menu = $(".menu");
  if (bt) {
    bt.addEventListener("click", function () { var a = menu.classList.toggle("aberto"); bt.setAttribute("aria-expanded", a); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("aberto"); }); });
  }
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = matchMedia("(pointer: fine)").matches;
  var lenis = null;
  if (window.Lenis && fino && !reduz) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var alvo = $(a.getAttribute("href")); if (!alvo) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(alvo, { offset: -10, duration: 1.3 }); else alvo.scrollIntoView({ behavior: "smooth" });
    });
  });

  var topo = $(".topo");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) {
    topo.classList.toggle("rolado", s.scroll() > 10);
    topo.classList.toggle("escondido", s.direction === 1 && s.scroll() > 500);
  } });

  function quebrar(el) {
    var txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="pal" aria-hidden="true"><span>' + w + "</span></span>"; }).join(" ");
    return $$(".pal > span", el);
  }

  /* herói: uma única entrada orquestrada */
  var h1 = $(".heroi h1");
  if (h1) {
    var pals = quebrar(h1);
    var tl = gsap.timeline({ delay: .15 });
    tl.from(".heroi .caps", { opacity: 0, y: 12, duration: .8, ease: "power3.out" })
      .from(pals, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: .05 }, "-=.5")
      .from(".heroi [data-surge]", { opacity: 0, y: 18, duration: .9, ease: "power3.out", stagger: .1 }, "-=.7")
      .fromTo(".heroi .arco", { clipPath: "inset(100% 0 0 0 round 999px 999px 18px 18px)" }, { clipPath: "inset(0% 0 0 0 round 999px 999px 18px 18px)", duration: 1.4, ease: "expo.inOut" }, .1)
      .from(".heroi .arco img", { scale: 1.18, duration: 1.8, ease: "expo.out" }, .3)
      .from(".heroi .etiqueta", { opacity: 0, y: 20, duration: .8, ease: "power3.out" }, "-=.6");
  }

  /* traço da folha (logo) desenhado pela rolagem */
  $$(".folha path").forEach(function (p) {
    var len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(p, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: p.closest("section") || p, start: "top 85%", end: "center 35%", scrub: 1 } });
  });

  $$("[data-titulo]").forEach(function (el) {
    var pals = quebrar(el);
    gsap.from(pals, { yPercent: 110, duration: 1, ease: "expo.out", stagger: .04, scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  $$("[data-surge]").forEach(function (el) {
    if (el.closest(".heroi")) return;
    gsap.from(el, { opacity: 0, y: 26, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$(".secao .arco").forEach(function (a) {
    gsap.fromTo(a, { clipPath: "inset(100% 0 0 0 round 999px 999px 18px 18px)" }, { clipPath: "inset(0% 0 0 0 round 999px 999px 18px 18px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: a, start: "top 85%" } });
    var img = $("img", a);
    if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: a, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from(".trat", { opacity: 0, y: 34, duration: .9, ease: "power3.out", stagger: .07, scrollTrigger: { trigger: ".trats", start: "top 82%" } });
  gsap.from(".resultados figure", { opacity: 0, y: 40, duration: 1, ease: "power3.out", stagger: .12, scrollTrigger: { trigger: ".resultados", start: "top 82%" } });
  gsap.from(".cartao", { opacity: 0, y: 50, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".cartao", start: "top 85%" } });
  gsap.from(".time li", { opacity: 0, x: -14, duration: .6, ease: "power2.out", stagger: .05, scrollTrigger: { trigger: ".time", start: "top 85%" } });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
