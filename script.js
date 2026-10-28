
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS PRINCIPALES
  const events = [...document.querySelectorAll(".timeline-event")];
  const searchInput = document.querySelector(
    "#searchInput, #timelineSearch, .search-input, [data-timeline-search]"
  );
  const filterButtons = document.querySelectorAll(
    "[data-filter], .filter-btn"
  );

  // 1. ANIMACIÓN DE APARICIÓN AL DESPLAZARSE
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document
      .querySelectorAll(".timeline-event, .category-card, .conclusion-section")
      .forEach((element) => observer.observe(element));
  } else {
    document
      .querySelectorAll(".timeline-event, .category-card, .conclusion-section")
      .forEach((element) => element.classList.add("visible"));
  }

  // 2. BÚSQUEDA DE ACONTECIMIENTOS
  function searchEvents() {
    const query = searchInput
      ? searchInput.value.trim().toLocaleLowerCase("es")
      : "";

    events.forEach((event) => {
      const text = event.textContent.toLocaleLowerCase("es");
      const matchesSearch = text.includes(query);
      const matchesFilter =
        !event.dataset.activeFilter ||
        event.dataset.activeFilter === "all" ||
        getCategories(event).includes(event.dataset.activeFilter);

      event.hidden = !(matchesSearch && matchesFilter);
    });

    updateEmptyMessage();
  }

  if (searchInput) {
    searchInput.addEventListener("input", searchEvents);
  }

  // 3. FILTROS POR CATEGORÍA
  function getCategories(event) {
    const categories = [
      event.dataset.category,
      ...[...event.querySelectorAll(".tag")].map((tag) => tag.textContent),
    ];

    return categories
      .filter(Boolean)
      .map((category) => category.trim().toLocaleLowerCase("es"));
  }

  let activeFilter = "all";

  function applyFilter(filter) {
    activeFilter = filter.toLocaleLowerCase("es");

    events.forEach((event) => {
      event.dataset.activeFilter = activeFilter;
    });

    filterButtons.forEach((button) => {
      const buttonFilter = (
        button.dataset.filter || button.textContent
      ).trim().toLocaleLowerCase("es");

      const selected =
        buttonFilter === activeFilter ||
        (activeFilter === "all" &&
          ["all", "todos", "todas", ""].includes(buttonFilter));

      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    searchEvents();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = (
        button.dataset.filter || button.textContent
      ).trim();

      applyFilter(filter);
    });
  });

  // 4. MENSAJE CUANDO NO HAY RESULTADOS
  function updateEmptyMessage() {
    let message = document.querySelector("#noResultsMessage");
    const visibleEvents = events.some((event) => !event.hidden);

    if (!message && !visibleEvents && events.length) {
      message = document.createElement("p");
      message.id = "noResultsMessage";
      message.className = "no-results";
      message.textContent =
        "No se encontraron acontecimientos. Prueba otra búsqueda o categoría.";

      document.querySelector(".timeline")?.appendChild(message);
    }

    if (message) {
      message.hidden = visibleEvents;
    }
  }

  // 5. MOSTRAR Y OCULTAR INFORMACIÓN ADICIONAL
  document
    .querySelectorAll("[data-details-toggle], .details-toggle")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".event-card, .timeline-event");
        const details = card?.querySelector(
          ".event-details, .details-body, [data-event-details]"
        );

        if (!details) return;

        const isOpen =
          button.getAttribute("aria-expanded") === "true";

        details.hidden = isOpen;
        button.setAttribute("aria-expanded", String(!isOpen));

        const label = button.dataset.openLabel || "Ver detalles";
        const closeLabel = button.dataset.closeLabel || "Ocultar detalles";

        button.textContent = isOpen ? label : closeLabel;
      });
    });

  // 6. NAVEGACIÓN A LOS ACONTECIMIENTOS
  document
    .querySelectorAll("[data-scroll-target]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.querySelector(
          button.dataset.scrollTarget
        );

        target?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });

  // 7. BOTÓN PARA VOLVER ARRIBA
  const topButton = document.querySelector(
    "#backToTop, .back-to-top, [data-back-to-top]"
  );

  if (topButton) {
    const updateTopButton = () => {
      topButton.hidden = window.scrollY < 400;
    };

    window.addEventListener("scroll", updateTopButton, {
      passive: true,
    });

    updateTopButton();

    topButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // 8. NAVEGACIÓN CON TECLADO EN TARJETAS ENLAZADAS
  document
    .querySelectorAll(".category-card[ data-target ]")
    .forEach((card) => {
      card.addEventListener("click", () => {
        const target = document.querySelector(card.dataset.target);
        target?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });

  // 9. AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
});
