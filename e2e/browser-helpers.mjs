// Reusable helpers for driving the nemesis dev UI from an eval kernel (Bun).
//
// Usage in an eval cell:
//   const H = await import("file:///home/spacecowboy/Projects/nemesis/e2e/browser-helpers.mjs?v=N");
//   // ^?v=N cache-bust: the Bun kernel caches module imports by URL, so bump N
//   // after editing this file or the old version keeps running.
//   const tab = browser.tab("nemesis-dev");
//   await H.goto(tab, "/settings");
//   await H.setVal(tab, "#newUsername", "somenewname");
//
// Rules these helpers encode (learned the hard way, 2026-09-27):
// - `tab.run` callbacks run in an isolated realm: cell closures, module
//   function params, and globalThis are invisible inside the callback. Data
//   goes in via `{ args: [...] }` — delivered to the callback as extra
//   parameters (`fn(ctx, ...args)`).
// - The harness AST-rewrites literal `tab.run(` calls and inlines the args
//   EXPRESSION by source, which breaks when the call lives in a module
//   function (its params are not in scope where the generated code runs —
//   "ReferenceError: <param> is not defined"). Calling through
//   `tab.run.bind(tab)` bypasses the rewrite and passes args values
//   correctly. That is why every helper binds first.
// - Everything that touches the DOM must go through `page.evaluate(fn, arg)`
//   inside the callback; `document` does not exist in the run realm.
// - Direct helpers are UNRELIABLE in this harness build: `tab.click` with
//   `text/…` selectors times out, `tab.fill` throws "ReferenceError: index
//   is not defined" from internal codegen. `tab.evaluate("expr")` and
//   `tab.goto` work fine and are used where sufficient.
// - MUI/React controlled inputs ignore `el.value = x`; use the native value
//   setter + input event (setVal/setValByIndex below).
// - Login/Register pages use MUI auto-ids (:r0:, :r1:...) — address those
//   inputs by index, not id. Settings page fields have explicit ids:
//   #newUsername, #usernameCurrentPassword, #currentPassword, #newPassword,
//   #confirmPassword.

export const devUrl = "http://nemesis.dev.lan";

/** Navigate to a path under the dev origin and wait for settle. */
export async function goto(tab, path) {
  await tab.goto(`${devUrl}${path}`);
  await new Promise((r) => setTimeout(r, 1500));
}

/** Fill an input by CSS selector (React-safe native setter). */
export async function setVal(tab, selector, value) {
  const run = tab.run.bind(tab);
  await run(
    async ({ page }, pv) => {
      await page.evaluate(
        ([s, v]) => {
          const el = document.querySelector(s);
          if (!el) throw new Error(`input not found: ${s}`);
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          ).set;
          setter.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        pv,
      );
    },
    { args: [[selector, value]] },
  );
}

/** Fill the Nth input on the page (MUI auto-id pages: login/register). */
export async function setValByIndex(tab, index, value) {
  const run = tab.run.bind(tab);
  await run(
    async ({ page }, pv) => {
      await page.evaluate(
        ([idx, v]) => {
          const el = Array.from(document.querySelectorAll("input"))[idx];
          if (!el) throw new Error(`input index ${idx} not found`);
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          ).set;
          setter.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        pv,
      );
    },
    { args: [[index, value]] },
  );
}

/** Click the first button whose trimmed text matches exactly. */
export async function clickText(tab, text) {
  const run = tab.run.bind(tab);
  await run(
    async ({ page }, t) => {
      await page.evaluate((txt) => {
        const el = Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent.trim() === txt,
        );
        if (!el) throw new Error(`button not found: ${txt}`);
        el.click();
      }, t);
    },
    { args: [text] },
  );
}

/** Snapshot the page: url, error-looking lines, and head of the body text. */
export async function readState(tab) {
  const url = await tab.evaluate("location.href");
  const text = String(await tab.evaluate("document.body.innerText"));
  const errors = text
    .split("\n")
    .filter(
      (t) =>
        t &&
        t.length < 120 &&
        /incorrect|invalid|error|failed|exists/i.test(t),
    );
  return { url, errors, text: text.slice(0, 400) };
}

/** Log in through the UI (inputs addressed by index — MUI auto-ids). */
export async function login(tab, username, password) {
  await goto(tab, "/login");
  await setValByIndex(tab, 0, username);
  await setValByIndex(tab, 1, password);
  await clickText(tab, "Login");
  await new Promise((r) => setTimeout(r, 2500));
  return readState(tab);
}

/** Log out via the topbar Sign Out button. */
export async function logout(tab) {
  await clickText(tab, "Sign Out");
  await new Promise((r) => setTimeout(r, 2000));
  return readState(tab);
}
