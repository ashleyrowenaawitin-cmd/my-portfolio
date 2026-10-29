/* ==========================================================================
   DESIGN SYSTEM COMPARISON — INTERACTIONS
   Renders the cards from comparison-data.js and handles preview, palette
   copying and the small-screen comparison view.
   ========================================================================== */

(() => {
  "use strict";

  const config = window.DESIGN_SYSTEM_COMPARISON;
  const grid = document.getElementById("ds-compare-grid");
  if (!config || !grid) return;

  const systems = config.systems;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const copyTimers = new WeakMap();

  /* ---------------------------------------------------------------- helpers */

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]
    );

  const safeHex = (value) =>
    /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value) ? value : "#808080";

  const safeSize = (value) =>
    /^\d+(?:\.\d+)?(?:rem|em|px)$/.test(value) ? value : "1rem";

  const relativeLuminance = (hex) => {
    const clean = safeHex(hex).slice(1);
    const full =
      clean.length === 3
        ? clean
            .split("")
            .map((character) => character + character)
            .join("")
        : clean;
    const channels = [0, 2, 4].map((offset) => {
      const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };

  /* 0.179 is the luminance where black and white text have the same
     contrast ratio, so each swatch gets the more readable ink. */
  const contrastInk = (hex) =>
    relativeLuminance(hex) > 0.179 ? "#000000" : "#ffffff";

  const getPrimary = (system, name, fallback) => {
    const color = system.palette.colors.find(
      (item) => item.name.toLowerCase() === name
    );
    return safeHex(color ? color.hex : fallback);
  };

  /* ------------------------------------------------------------------ icons */

  const icons = {
    eye: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.2 12S5.7 5.5 12 5.5 21.8 12 21.8 12 18.3 18.5 12 18.5 2.2 12 2.2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.2-3.1 1.8 1.8 0 0 1 1.2-3.1H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="11.5" r=".8" fill="currentColor"/><circle cx="9.5" cy="7.5" r=".8" fill="currentColor"/><circle cx="14.2" cy="6.8" r=".8" fill="currentColor"/><circle cx="17.2" cy="10" r=".8" fill="currentColor"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>`,
    close: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  };

  /* --------------------------------------------------------------- renderers */

  const renderPreview = (system) => `
    <button
      class="ds-preview"
      type="button"
      data-action="preview"
      aria-label="Preview the ${escapeHtml(system.name)} design system in full"
    >
      <img
        src="${escapeHtml(system.image.preview)}"
        srcset="${escapeHtml(system.image.previewSmall)} 640w, ${escapeHtml(system.image.preview)} 1024w"
        sizes="(max-width: 620px) calc(100vw - 72px), (max-width: 960px) calc(100vw - 120px), 480px"
        width="${Number(system.image.width) || 1024}"
        height="${Number(system.image.height) || 1280}"
        alt="${escapeHtml(system.image.alt)}"
        loading="lazy"
        decoding="async"
      >
      <span class="ds-preview__chips" aria-hidden="true">
        <span>${escapeHtml(system.imageLabel)}</span>
        <span>Full frame</span>
      </span>
      <span class="ds-preview__overlay" aria-hidden="true">
        <span class="ds-preview__cta">${icons.expand} Preview full design</span>
      </span>
    </button>`;

  const renderTypography = (system) => {
    const primary = getPrimary(system, "primary", "#4a2fd0");
    const secondary = getPrimary(system, "secondary", "#ec2e96");

    const scale = system.typography.scale
      .map(
        (item) => `
          <li class="ds-scale__row">
            <span class="ds-scale__tag">${escapeHtml(item.tag)}</span>
            <span
              class="ds-scale__text"
              style="font-family:${escapeHtml(
                system.typography.stack
              )};font-size:${safeSize(item.size)}"
            >${escapeHtml(item.text)}</span>
          </li>`
      )
      .join("");

    const buttons = system.buttonExamples
      .map(
        (button) => `
          <span
            class="ds-spec-button ds-spec-button--${escapeHtml(button.variant)}"
          >${escapeHtml(button.label)}</span>`
      )
      .join("");

    return `
      <section
        class="ds-type"
        aria-labelledby="ds-type-${system.id}"
        style="--spec-primary:${primary};--spec-secondary:${secondary}"
      >
        <div class="ds-section-head">
          <h4 id="ds-type-${system.id}">Typography</h4>
          <span class="ds-section-tag">${escapeHtml(system.typography.family)}</span>
        </div>

        <div
          class="ds-type__specimen"
          style="font-family:${escapeHtml(system.typography.stack)}"
        >
          <span class="ds-type__aa" aria-hidden="true">Aa</span>
          <div>
            <p class="ds-type__sample">${escapeHtml(system.typography.sample)}</p>
            <p class="ds-type__body">${escapeHtml(system.typography.body)}</p>
          </div>
        </div>

        <ol class="ds-scale" aria-label="${escapeHtml(system.name)} heading scale">
          ${scale}
        </ol>

        <div class="ds-button-row">
          <span class="ds-button-row__label">Buttons</span>
          <div
            class="ds-button-set"
            style="font-family:${escapeHtml(system.typography.stack)}"
          >${buttons}</div>
          <span class="ds-weights">${escapeHtml(
            system.typography.weights.join(" · ")
          )}</span>
        </div>
      </section>`;
  };

  const renderSwatch = (color, shade) => {
    const value = safeHex(shade ? color[shade] : color.hex);
    const label = shade ? `${color.name} ${shade} shade` : color.name;

    return `
      <button
        class="ds-swatch ${shade ? "ds-swatch--shade" : "ds-swatch--base"}"
        type="button"
        data-action="copy"
        data-hex="${value}"
        data-color="${escapeHtml(color.name)}${shade ? ` — ${shade}` : ""}"
        style="--swatch:${value};--swatch-ink:${contrastInk(value)}"
        aria-label="Copy ${escapeHtml(label)} color ${value}"
      >
        ${
          shade
            ? `<span class="ds-swatch__label">${escapeHtml(
                shade === "light" ? "Light" : "Dark"
              )}</span>`
            : `<span class="ds-swatch__label">${escapeHtml(color.name)}</span>`
        }
        <span class="ds-swatch__hex" aria-hidden="true">${value}</span>
        <span class="ds-swatch__copied" aria-hidden="true">
          ${icons.check} Copied
        </span>
      </button>`;
  };

  const renderPalette = (system) => {
    const families = system.palette.colors
      .map(
        (color) => `
          <div class="ds-color-family">
            ${renderSwatch(color)}
            <div class="ds-shades">
              ${renderSwatch(color, "light")}
              ${renderSwatch(color, "dark")}
            </div>
          </div>`
      )
      .join("");

    return `
      <section
        class="ds-palette"
        data-palette
        aria-labelledby="ds-palette-${system.id}"
      >
        <div class="ds-section-head">
          <h4 id="ds-palette-${system.id}">Color palette</h4>
          <span class="ds-section-tag">Click to copy</span>
        </div>
        <p class="ds-note">${escapeHtml(system.palette.source)}</p>
        <div class="ds-palette__grid">${families}</div>
      </section>`;
  };

  const renderCard = (system) => {
    const systemColor = safeHex(system.systemColor);
    return `
      <article
        class="ds-card"
        data-system="${escapeHtml(system.id)}"
        style="--system-color:${systemColor}"
        aria-labelledby="ds-name-${system.id}"
      >
        <header class="ds-card__head">
          <p class="ds-card__eyebrow">
            <span class="ds-card__dot" aria-hidden="true"></span>
            <span>${escapeHtml(system.label)}</span>
            <span class="ds-card__image-tag">${escapeHtml(system.imageLabel)}</span>
          </p>
          <h3 class="ds-card__name" id="ds-name-${system.id}">
            ${escapeHtml(system.name)}
          </h3>
          <p class="ds-card__tagline">${escapeHtml(system.tagline)}</p>
          <p class="ds-card__desc">${escapeHtml(system.description)}</p>
        </header>

        ${renderPreview(system)}

        <div class="ds-actions" role="group" aria-label="${escapeHtml(
          system.name
        )} actions">
          <button class="ds-action ds-action--primary" type="button" data-action="preview">
            ${icons.eye}
            <span>Preview Design</span>
          </button>
          <button class="ds-action ds-action--colors" type="button" data-action="explore">
            ${icons.palette}
            <span>Explore Colors</span>
          </button>
        </div>

        ${renderTypography(system)}
        ${renderPalette(system)}

        <p
          class="ds-copy-status"
          id="ds-copy-status-${system.id}"
          role="status"
          aria-live="polite"
        ></p>
      </article>`;
  };

  /* ---------------------------------------------------------------- render */

  grid.innerHTML = systems.map(renderCard).join("");

  /* --------------------------------------------------------- preview dialog */

  const dialog = document.getElementById("ds-preview-dialog");
  const dialogTitle = dialog ? dialog.querySelector("[data-dialog-title]") : null;
  const dialogMeta = dialog ? dialog.querySelector("[data-dialog-meta]") : null;
  const dialogImage = dialog ? dialog.querySelector("[data-dialog-image]") : null;

  const toast = document.getElementById("ds-toast");
  let toastTimer;

  const showToast = (message, isError = false) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  };

  const openPreview = (card) => {
    const system = systems.find((item) => item.id === card.dataset.system);
    if (!system) return;

    if (!dialog || typeof dialog.showModal !== "function") {
      window.open(system.image.full, "_blank", "noopener,noreferrer");
      return;
    }

    dialogTitle.textContent = system.name;
    dialogMeta.textContent = `${system.label} · ${system.imageLabel} · full design system reference`;
    dialogImage.src = system.image.full;
    dialogImage.alt = system.image.alt;
    dialogImage.width = Number(system.image.width) || 1024;
    dialogImage.height = Number(system.image.fullHeight) || Number(system.image.height) || 1280;

    document.documentElement.classList.add("ds-modal-open");
    dialog.showModal();
  };

  const closePreview = () => {
    if (dialog && dialog.open) dialog.close();
  };

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closePreview();
    });

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("ds-modal-open");
      if (dialogImage) {
        dialogImage.removeAttribute("src");
        dialogImage.alt = "";
      }
    });

    const closeButton = dialog.querySelector("[data-close]");
    if (closeButton) closeButton.addEventListener("click", closePreview);
  }

  /* ------------------------------------------------------------ copy colors */

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* Fall through to the legacy path. */
      }
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.top = "-1000px";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    input.remove();
    return copied;
  };

  const setStatus = (card, message, isError = false) => {
    const status = card.querySelector(".ds-copy-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  const handleCopy = async (swatch) => {
    const card = swatch.closest(".ds-card");
    const hex = swatch.dataset.hex;
    if (!card || !hex) return;

    const copied = await copyText(hex);
    const message = copied
      ? `Copied ${hex}${swatch.dataset.color ? ` (${swatch.dataset.color})` : ""}`
      : `Could not copy ${hex}. Select the value and copy it manually.`;

    setStatus(card, message, !copied);
    showToast(message, !copied);

    if (!copied) return;

    card
      .querySelectorAll(".ds-swatch[data-copied='true']")
      .forEach((item) => delete item.dataset.copied);
    swatch.dataset.copied = "true";

    const existingTimer = copyTimers.get(swatch);
    if (existingTimer) window.clearTimeout(existingTimer);
    copyTimers.set(
      swatch,
      window.setTimeout(() => {
        delete swatch.dataset.copied;
      }, 1700)
    );
  };

  /* --------------------------------------------------------------- actions */

  const exploreColors = (card) => {
    const palette = card.querySelector("[data-palette]");
    if (!palette) return;

    palette.classList.add("is-highlighted");
    window.setTimeout(() => palette.classList.remove("is-highlighted"), 1500);

    palette.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "center",
    });

    setStatus(card, "Palette ready — tab or tap a swatch to copy its hex.");
  };

  grid.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (!action) return;

    const card = action.closest(".ds-card");

    switch (action.dataset.action) {
      case "preview":
        if (card) openPreview(card);
        break;
      case "copy":
        handleCopy(action);
        break;
      case "explore":
        if (card) exploreColors(card);
        break;
      default:
        break;
    }
  });

  /* ----------------------------------------------------- mobile comparison */

  const viewGroup = document.querySelector("[data-cmp-view]");
  if (viewGroup) {
    const viewButtons = Array.from(
      viewGroup.querySelectorAll("[data-view]")
    );

    const setView = (view) => {
      grid.dataset.mobileView = view;
      viewButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.view === view)
        );
      });
    };

    setView(config.defaultView || "both");

    viewButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });

    viewGroup.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const current = viewButtons.indexOf(document.activeElement);
      if (current === -1) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next =
        viewButtons[
          (current + direction + viewButtons.length) % viewButtons.length
        ];
      next.focus();
      next.click();
    });
  }
})();
