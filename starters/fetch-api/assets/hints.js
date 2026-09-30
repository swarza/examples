/*
 * The feature bubbles. Without this script every bubble is a <details> element that opens as a
 * sheet at the bottom of the screen. With it, each one becomes a button with aria-expanded that
 * opens a popover next to itself: one at a time, and Escape or a click outside closes it. It also
 * adds the "Show features" switch (remembered in localStorage) and Copy buttons on the commands.
 */
/* global document, navigator, localStorage, innerWidth, innerHeight, addEventListener, setTimeout */
(() => {
  const KEY = "halftone-features";
  const MARGIN = 16;
  const root = document.documentElement;
  let current = null; // the open bubble: { wrap, button, pop }

  function place({ button, pop }) {
    const r = button.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.max(MARGIN, Math.min(r.left + r.width / 2 - w / 2, innerWidth - MARGIN - w));
    const roomBelow = innerHeight - r.bottom - MARGIN;
    const roomAbove = r.top - MARGIN;
    const top = h + 8 <= roomBelow || roomBelow >= roomAbove ? r.bottom + 8 : r.top - 8 - h;
    pop.style.left = `${left}px`;
    // Too tall for either side: keep it on screen (it scrolls inside, see max-height).
    pop.style.top = `${Math.max(MARGIN, Math.min(top, innerHeight - MARGIN - h))}px`;
  }

  function close({ focus = false } = {}) {
    if (!current) return;
    current.button.setAttribute("aria-expanded", "false");
    current.pop.hidden = true;
    if (focus) current.button.focus();
    current = null;
  }

  function open(bubble) {
    close();
    bubble.button.setAttribute("aria-expanded", "true");
    bubble.pop.hidden = false;
    place(bubble);
    current = bubble;
  }

  const bubbles = [...document.querySelectorAll("details.hint")].map((details) => {
    const summary = details.querySelector("summary");
    const pop = details.querySelector(".hint-pop");
    const wrap = document.createElement("span");
    wrap.className = "hint";
    const button = document.createElement("button");
    button.type = "button";
    button.className = summary.className;
    button.setAttribute("aria-label", summary.getAttribute("aria-label"));
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", pop.id);
    button.append(...summary.childNodes);
    pop.hidden = true;
    wrap.append(button, pop);
    details.replaceWith(wrap);

    const bubble = { wrap, button, pop };
    button.addEventListener("click", () => (current === bubble ? close() : open(bubble)));
    // Tabbing out of the popover closes it.
    wrap.addEventListener("focusout", (event) => {
      if (current === bubble && event.relatedTarget && !wrap.contains(event.relatedTarget)) close();
    });
    return bubble;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && current) close({ focus: current.wrap.contains(document.activeElement) });
  });
  document.addEventListener("pointerdown", (event) => {
    if (current && !current.wrap.contains(event.target)) close();
  });
  addEventListener("resize", () => current && place(current));
  addEventListener("scroll", () => current && place(current), { passive: true });

  // Copy buttons on the commands, in the bubbles and on /how-it-works.
  if (navigator.clipboard) {
    for (const pre of document.querySelectorAll("pre.code")) {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "copy";
      copy.textContent = "Copy";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector("code").textContent.trim());
          copy.textContent = "Copied";
        } catch {
          copy.textContent = "Select it";
        }
        setTimeout(() => (copy.textContent = "Copy"), 1600);
      });
      pre.append(copy);
    }
  }

  // The switch that hides and shows the bubbles. On by default.
  if (!bubbles.length) return;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "features-toggle";
  toggle.innerHTML = '<span class="switch" aria-hidden="true"></span>Show features';
  const set = (on) => {
    root.dataset.features = on ? "on" : "off";
    toggle.setAttribute("aria-pressed", String(on));
    if (!on) close();
  };
  set(root.dataset.features !== "off");
  toggle.addEventListener("click", () => {
    const on = root.dataset.features === "off";
    set(on);
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {
      // Storage can be blocked; the switch still works for this page.
    }
  });
  document.body.append(toggle);
})();
