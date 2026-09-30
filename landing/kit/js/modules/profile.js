/* Profile section runtime: year switch, catalog filters, heatmap day selection. */
(() => {
  "use strict";

  function closest(el, selector) {
    return el && el.closest ? el.closest(selector) : null;
  }

  function activateYear(root, year) {
    root.querySelectorAll("[data-profile-year]").forEach((button) => {
      const on = button.getAttribute("data-profile-year") === year;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.querySelectorAll("[data-profile-year-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-profile-year-panel") === year);
    });
  }

  function bindYears(root) {
    root.querySelectorAll("[data-profile-years]").forEach((group) => {
      group.addEventListener("click", (event) => {
        const button = closest(event.target, "[data-profile-year]");
        if (!button) return;
        activateYear(group, button.getAttribute("data-profile-year"));
      });
    });
  }

  function bindFilters(root) {
    root.querySelectorAll("[data-profile-filter='repos']").forEach((filters) => {
      const list = root.querySelector("[data-profile-repo-list]");
      if (!list) return;
      const search = filters.querySelector("[data-profile-search]");
      const language = filters.querySelector("[data-profile-language]");
      const sort = filters.querySelector("[data-profile-sort]");
      const items = [...list.children];

      function apply() {
        const needle = String(search?.value ?? "").trim().toLowerCase();
        const lang = String(language?.value ?? "all");
        const order = String(sort?.value ?? "stars");
        const visible = items.filter((item) => {
          if (lang !== "all" && (item.getAttribute("data-language") || "") !== lang) return false;
          if (!needle) return true;
          return String(item.getAttribute("data-haystack") || "").toLowerCase().includes(needle);
        });
        visible.sort((left, right) => {
          if (order === "name") return String(left.getAttribute("data-name")).localeCompare(String(right.getAttribute("data-name")));
          if (order === "updated") return String(right.getAttribute("data-updated")).localeCompare(String(left.getAttribute("data-updated")));
          return Number(right.getAttribute("data-stars")) - Number(left.getAttribute("data-stars"));
        });
        items.forEach((item) => {
          item.hidden = !visible.includes(item);
        });
        visible.forEach((item) => list.appendChild(item));
      }

      filters.addEventListener("input", apply);
      filters.addEventListener("change", apply);
    });
  }

  function bindHeatmap(root) {
    const grid = root.querySelector("[data-profile-heatmap]");
    if (!grid) return;
    const title = root.querySelector("#daily-detail-title");
    const count = root.querySelector("[data-profile-day-count]");
    const weekday = root.querySelector("[data-profile-day-weekday]");
    const week = root.querySelector("[data-profile-day-week]");
    function select(button) {
      if (!button || button.disabled) return;
      grid.querySelectorAll("[data-date]").forEach((node) => node.removeAttribute("data-selected"));
      button.setAttribute("data-selected", "true");
      if (title) title.textContent = button.getAttribute("data-date") || "";
      if (count) count.textContent = button.getAttribute("data-count") || "0";
      if (weekday) weekday.textContent = button.getAttribute("data-weekday") || "";
      if (week) week.textContent = button.getAttribute("data-week") || "";
    }
    grid.addEventListener("click", (event) => {
      const button = closest(event.target, "[data-date]");
      select(button);
    });
    grid.addEventListener("keydown", (event) => {
      const current = closest(event.target, "[data-date]");
      if (!current) return;
      const buttons = [...grid.querySelectorAll("[data-date]:not(:disabled)")];
      const index = buttons.indexOf(current);
      const deltas = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
      if (event.key === "Home") {
        event.preventDefault();
        buttons[0]?.focus();
        select(buttons[0]);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        buttons.at(-1)?.focus();
        select(buttons.at(-1));
        return;
      }
      const delta = deltas[event.key];
      if (!delta) return;
      event.preventDefault();
      const next = buttons[Math.max(0, Math.min(buttons.length - 1, index + delta))];
      next?.focus();
      select(next);
    });
  }

  function boot() {
    document.querySelectorAll(".profile").forEach((root) => {
      bindYears(root);
      bindFilters(root);
      bindHeatmap(root);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
