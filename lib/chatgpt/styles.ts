/** Shadow-DOM CSS for `<chat-archive>`. String so the island can inject it without a CSS loader. */
export const CHAT_ARCHIVE_STYLES = `
:host { display: block; min-height: calc(100dvh - 8rem); color: #1c241f; font-family: var(--font), "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
.font-display { font-family: var(--font-display), "Times New Roman", serif; font-optical-sizing: auto; }
.shell { min-height: calc(100dvh - 8rem); background: #f3eee4; }
.landing { position: relative; overflow: hidden; min-height: calc(100dvh - 8rem); display: flex; align-items: center; }
.atmosphere {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(160deg, rgba(243,238,228,.92), rgba(232,239,234,.88)),
    radial-gradient(ellipse 80% 60% at 10% 20%, rgba(45,122,110,.16), transparent 55%),
    radial-gradient(ellipse 70% 50% at 90% 80%, rgba(196,140,74,.14), transparent 50%),
    repeating-linear-gradient(-12deg, rgba(28,36,31,.025) 0 1px, transparent 1px 14px);
}
.blob-a, .blob-b { position: absolute; border-radius: 9999px; filter: blur(28px); pointer-events: none; }
.blob-a { left: -6rem; top: 4rem; width: 18rem; height: 18rem; background: radial-gradient(circle, rgba(45,122,110,.28), transparent 70%); }
.blob-b { right: -4rem; bottom: 2rem; width: 20rem; height: 20rem; background: radial-gradient(circle, rgba(196,140,74,.18), transparent 70%); }
.wrap { position: relative; width: min(64rem, 100%); margin: 0 auto; padding: 4rem 1.5rem; }
h1.brand { margin: 0; font-size: clamp(2.75rem, 8vw, 4.5rem); letter-spacing: -0.03em; line-height: 1.05; }
.lede { margin: 1.25rem 0 0; max-width: 36rem; font-size: 1.15rem; line-height: 1.6; color: #4d5a53; }
.lede code { font-family: var(--font-mono), ui-monospace, monospace; font-size: .95em; }
.drop {
  margin-top: 2.5rem; max-width: 42rem; display: flex; flex-direction: column; gap: .75rem;
  min-height: 12rem; padding: 2rem 1.5rem; border: 1px solid #b9ae97; border-radius: 0.75rem;
  background: rgba(250,247,240,.85); cursor: pointer; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  box-shadow: 0 20px 60px -40px rgba(20,36,32,.55);
}
.drop:hover, .drop.active { border-color: #2d7a6e; transform: translateY(-2px); }
.drop.active { background: rgba(45,122,110,.14); }
.drop strong { font-family: var(--font-display), "Times New Roman", serif; font-size: 1.5rem; }
.drop span { color: #4d5a53; }
.hint { margin-top: 2rem; color: #7a877f; font-size: .9rem; }
.error { margin-top: 1rem; max-width: 42rem; padding: .75rem 1rem; border-radius: .5rem; border: 1px solid #e2b4ae; background: #f8e8e6; color: #8b2e2e; font-size: .9rem; }
.chrome {
  position: sticky; top: 0; z-index: 20; border-bottom: 1px solid #d5cdbc;
  background: rgba(243,238,228,.9); backdrop-filter: blur(10px);
  display: flex; flex-wrap: wrap; gap: .75rem 1rem; align-items: center; padding: .75rem 1.25rem;
}
.chrome .brand-btn { background: none; border: 0; cursor: pointer; font-family: var(--font-display), "Times New Roman", serif; font-size: 1.25rem; color: #1c241f; }
.chrome .meta { color: #7a877f; font-size: .85rem; }
.chrome input[type="search"] {
  flex: 1; min-width: 12rem; border: 1px solid #d5cdbc; border-radius: .5rem; padding: .5rem .75rem;
  background: #faf7f0; color: #1c241f; outline: none;
}
.chrome input[type="search"]:focus { border-color: #2d7a6e; box-shadow: 0 0 0 2px rgba(45,122,110,.25); }
.seg { display: inline-flex; border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: 2px; }
.seg button {
  border: 0; background: transparent; color: #4d5a53; border-radius: .35rem; padding: .4rem .7rem; cursor: pointer; font-size: .875rem;
}
.seg button.on { background: #1c241f; color: #f3eee4; }
.check { display: inline-flex; gap: .4rem; align-items: center; border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: .4rem .7rem; font-size: .875rem; color: #4d5a53; }
.file-btn { border: 1px solid #d5cdbc; border-radius: .5rem; background: #faf7f0; padding: .4rem .7rem; font-size: .875rem; cursor: pointer; }
.layout { display: grid; grid-template-columns: 1fr; min-height: calc(100dvh - 4.5rem); }
@media (min-width: 1024px) { .layout { grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); } }
.sidebar { background: #ebe4d6; max-height: 40vh; overflow: auto; border-bottom: 1px solid #d5cdbc; }
@media (min-width: 1024px) { .sidebar { max-height: none; border-bottom: 0; border-right: 1px solid #d5cdbc; } }
.side-h { padding: .75rem 1rem; border-bottom: 1px solid #d5cdbc; }
.side-h p { margin: 0; }
.side-h .label { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: #7a877f; font-weight: 600; }
.side-h .count { margin-top: .25rem; font-size: .875rem; color: #4d5a53; }
.conv {
  width: 100%; text-align: left; border: 0; background: transparent; cursor: pointer;
  padding: .75rem; margin: 0 .5rem .25rem; border-radius: .6rem; color: #1c241f;
}
.conv:hover { background: #e7dfd0; }
.conv.on { background: rgba(45,122,110,.14); }
.conv .title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 600; line-height: 1.35; }
.conv .sub { margin-top: .4rem; font-size: .75rem; color: #7a877f; display: flex; flex-wrap: wrap; gap: .35rem .5rem; }
.conv .off { color: #1f5f56; }
.thread-h { padding: 1.25rem 1.5rem; border-bottom: 1px solid #d5cdbc; }
.thread-h h2 { margin: 0; font-family: var(--font-display), "Times New Roman", serif; font-size: clamp(1.6rem, 3vw, 2.2rem); letter-spacing: -0.02em; line-height: 1.15; }
.thread-h .meta { margin-top: .75rem; display: flex; flex-wrap: wrap; gap: .35rem .75rem; color: #4d5a53; font-size: .9rem; }
.thread-h .off { color: #1f5f56; }
.msgs { padding: 1.25rem 1rem 2rem; display: flex; flex-direction: column; gap: 1.1rem; }
@media (min-width: 640px) { .msgs { padding-left: 2rem; padding-right: 2rem; } }
.msg { border-radius: .75rem; border: 1px solid #ddd4c3; background: #fffdf8; padding: 1rem 1.1rem; animation: rise .42s cubic-bezier(.22,1,.36,1) both; }
.msg.user { border-color: #c5d9d2; background: #e8f1ee; }
.msg.tool { border-color: #d2c7b2; background: #f1ebe0; }
.msg.offpath { box-shadow: 0 0 0 2px rgba(45,122,110,.35); }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.msg-h { display: flex; flex-wrap: wrap; gap: .4rem .6rem; align-items: center; margin-bottom: .75rem; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: #7a877f; }
.chip { border-radius: .3rem; padding: .15rem .45rem; font-weight: 700; letter-spacing: 0; text-transform: none; font-size: .75rem; }
.chip.user { background: #2d7a6e; color: #f4faf8; }
.chip.assistant { background: #3c3428; color: #f7f2e8; }
.chip.tool { background: #8a6a32; color: #fff8ea; }
.badge { border: 1px solid #d5cdbc; border-radius: .3rem; padding: .1rem .4rem; color: #1f5f56; letter-spacing: 0; text-transform: none; }
.badge.soft { background: rgba(45,122,110,.14); border: 0; }
.body { font-size: .98rem; line-height: 1.65; }
.body p { margin: .65em 0; }
.body p:first-child { margin-top: 0; }
.body p:last-child { margin-bottom: 0; }
.body pre, .code {
  overflow-x: auto; border-radius: .6rem; background: #24302b; color: #e8f0ec;
  padding: .85rem 1rem; font-family: var(--font-mono), ui-monospace, monospace; font-size: .88rem;
}
.body code { font-family: var(--font-mono), ui-monospace, monospace; font-size: .9em; background: rgba(28,36,31,.06); border-radius: .3rem; padding: .1rem .35rem; }
.body pre code { background: none; padding: 0; }
.body ul, .body ol { padding-left: 1.25rem; }
.body a { color: #1f5f56; }
.empty { margin: 2rem; padding: 2.5rem 1rem; text-align: center; color: #4d5a53; border: 1px dashed #d5cdbc; border-radius: .75rem; }
.hidden-input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
`
