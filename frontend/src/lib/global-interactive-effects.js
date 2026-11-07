const selector = [
  "button:not(:disabled)",
  "[role='button']",
  ".primary-button",
  ".secondary-button",
  ".nav-link",
  ".auth-submit",
  ".soft-card",
  ".feature-card",
  ".platform-card",
  ".stat-card",
  ".auth-form-card",
  ".dashboard-window",
  "[class*='card']"
].join(",");

const timers = new WeakMap();

function getTarget(element) {
  if (!(element instanceof Element)) return null;

  const target = element.closest(selector);

  if (!target || target.classList.contains("interactive-surface")) {
    return null;
  }

  return target;
}

function activate(target) {
  if (!target) return;

  clearTimeout(timers.get(target));

  target.classList.add("atlas-interactive");

  const large = target.matches(".feature-card");
  const small = target.matches(
    "button, [role='button'], .primary-button, .secondary-button, .nav-link, .auth-submit"
  );

  target.classList.remove("atlas-small", "atlas-medium", "atlas-large");
  target.classList.add(
    large ? "atlas-large" : small ? "atlas-small" : "atlas-medium"
  );

  target.classList.remove("ice");
  target.classList.add("fire");
}

function deactivate(target) {
  if (!target) return;

  target.classList.remove("fire");
  target.classList.add("ice");

  const timer = setTimeout(() => {
    target.classList.remove(
      "ice",
      "atlas-interactive",
      "atlas-small",
      "atlas-medium",
      "atlas-large"
    );
  }, target.classList.contains("atlas-large") ? 1100 : 800);

  timers.set(target, timer);
}

document.addEventListener("pointerover", (event) => {
  const target = getTarget(event.target);
  if (!target || target.contains(event.relatedTarget)) return;
  activate(target);
});

document.addEventListener("pointerout", (event) => {
  const target = getTarget(event.target);
  if (!target || target.contains(event.relatedTarget)) return;
  deactivate(target);
});

document.addEventListener("focusin", (event) => {
  activate(getTarget(event.target));
});

document.addEventListener("focusout", (event) => {
  const target = getTarget(event.target);
  if (target && !target.contains(event.relatedTarget)) {
    deactivate(target);
  }
});
