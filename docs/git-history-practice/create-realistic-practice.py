"""Create an isolated, clearly disclosed Git date exercise with incremental code."""

from datetime import datetime
from pathlib import Path
import os
import subprocess


ROOT = Path(__file__).resolve().parent / "realistic-practice-repo"
if ROOT.exists():
    raise SystemExit(f"Target already exists: {ROOT}")
ROOT.mkdir()


def git(*args, dated=None):
    env = os.environ.copy()
    if dated:
        env["GIT_AUTHOR_DATE"] = dated
        env["GIT_COMMITTER_DATE"] = dated
    subprocess.run(["git", "-C", str(ROOT), *args], check=True, env=env, capture_output=True)


def put(name, content):
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")


def commit(date, time, title):
    stamp = f"2026-{date}T{time}:00+09:00"
    datetime.fromisoformat(stamp)
    git("add", "--all")
    git("commit", "-m", title, dated=stamp)


git("init", "-b", "main")
git("config", "user.name", "Git Date Practice")
git("config", "user.email", "git-date-practice@example.invalid")

put("README.md", """
# Storefront history exercise

This isolated repository was generated on 2026-11-23 to practice Git author and
committer dates. All dated commits are simulated. It has no remote and is not a
record of work done on the dates shown in Git.

Run `python -m http.server 8000` in this folder, then open
`http://localhost:8000` to view the incremental sample storefront.
""")
put("index.html", """
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Atelier Market</title>
</head>
<body>
  <header><h1>Atelier Market</h1><p>일상의 물건을 오래도록</p></header>
  <main><h2>상품</h2><div id="products"></div></main>
</body>
</html>
""")
commit("09-27", "10:12", "Set up storefront page structure")

put("data.js", """
export const products = [
  { id: 'lamp', name: '아르코 테이블 램프', category: '조명', price: 79000, color: '#d5b89a' },
  { id: 'mug', name: '하루 세라믹 머그', category: '리빙', price: 28000, color: '#d6d8cf' },
  { id: 'bag', name: '캔버스 데일리 백', category: '패션', price: 42000, color: '#cbb9a3' },
  { id: 'tray', name: '오크 원목 트레이', category: '리빙', price: 56000, color: '#b78862' },
];
""")
commit("09-27", "15:43", "Add sample product catalog")

put("app.js", """
import { products } from './data.js';

const grid = document.querySelector('#products');
grid.innerHTML = products.map((product) => `
  <article class="product">
    <div class="product-image" style="background:${product.color}"></div>
    <p class="category">${product.category}</p>
    <h3>${product.name}</h3>
    <strong>${product.price.toLocaleString('ko-KR')}원</strong>
  </article>
`).join('');
""")
index = ROOT / "index.html"
index.write_text(index.read_text(encoding="utf-8").replace("</body>", '<script type="module" src="./app.js"></script>\n</body>'), encoding="utf-8")
commit("10-04", "09:18", "Render product cards from catalog data")

put("styles.css", """
:root { color: #242c2a; background: #f7f6f2; font-family: Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
header { padding: 44px max(5vw, 24px); background: #e7e9e1; }
header h1 { margin: 0; font-size: clamp(2rem, 5vw, 4rem); letter-spacing: -.05em; }
header p { margin-bottom: 0; color: #56625b; }
main { max-width: 1180px; margin: auto; padding: 48px 24px 80px; }
#products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.product { background: white; padding: 12px 12px 20px; border-radius: 16px; }
.product-image { aspect-ratio: 1; border-radius: 10px; }
.category { margin: 18px 0 8px; color: #657169; font-size: .8rem; }
.product h3 { margin: 0 0 12px; font-size: 1rem; }
""")
index.write_text(index.read_text(encoding="utf-8").replace("</head>", '<link rel="stylesheet" href="./styles.css">\n</head>'), encoding="utf-8")
commit("10-04", "16:26", "Introduce catalog visual styles")

put("cart.js", """
const KEY = 'atelier-cart';

export function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

export function addToCart(id) {
  const cart = readCart();
  cart[id] = Math.min(99, (Number(cart[id]) || 0) + 1);
  localStorage.setItem(KEY, JSON.stringify(cart));
  return cart;
}
""")
app = ROOT / "app.js"
app.write_text(app.read_text(encoding="utf-8").replace("import { products }", "import { addToCart } from './cart.js';\nimport { products }").replace("  </article>", '    <button data-add="${product.id}">장바구니 담기</button>\n  </article>') + "\ngrid.addEventListener('click', (event) => {\n  const id = event.target.closest('[data-add]')?.dataset.add;\n  if (id) { addToCart(id); location.reload(); }\n});\n", encoding="utf-8")
commit("10-11", "11:05", "Add persistent cart actions")

app.write_text(app.read_text(encoding="utf-8").replace("import { addToCart }", "import { addToCart, readCart }") + "\nconst cart = readCart();\nconst count = Object.values(cart).reduce((sum, quantity) => sum + Number(quantity), 0);\nconst subtotal = products.reduce((sum, product) => sum + product.price * (Number(cart[product.id]) || 0), 0);\ndocument.querySelector('#cart-summary').textContent = `장바구니 ${count}개 · ${subtotal.toLocaleString('ko-KR')}원`;\n", encoding="utf-8")
index.write_text(index.read_text(encoding="utf-8").replace("<main>", '<main><p id="cart-summary" aria-live="polite"></p>'), encoding="utf-8")
commit("10-11", "17:31", "Show cart quantity and subtotal")

put("coupon.js", """
export function discountedTotal(subtotal, code) {
  if (code.trim().toUpperCase() !== 'WELCOME10') return subtotal;
  return Math.max(0, subtotal - Math.min(Math.round(subtotal * .1), 10000));
}
""")
app.write_text("import { discountedTotal } from './coupon.js';\n" + app.read_text(encoding="utf-8") + "\ndocument.querySelector('#apply-coupon').addEventListener('click', () => {\n  const code = document.querySelector('#coupon').value;\n  const total = discountedTotal(subtotal, code);\n  document.querySelector('#total').textContent = `예상 결제 금액 ${total.toLocaleString('ko-KR')}원`;\n});\n", encoding="utf-8")
index.write_text(index.read_text(encoding="utf-8").replace('<p id="cart-summary" aria-live="polite"></p>', '<p id="cart-summary" aria-live="polite"></p><label for="coupon">쿠폰 코드</label><input id="coupon" autocomplete="off"><button id="apply-coupon">적용</button><p id="total" aria-live="polite"></p>'), encoding="utf-8")
commit("10-18", "10:40", "Calculate sample coupon discount")

put("catalog-safety.js", """
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function safeColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#e5e5e5';
}
""")
app.write_text("import { escapeHtml, safeColor } from './catalog-safety.js';\n" + app.read_text(encoding="utf-8").replace("${product.color}", "${safeColor(product.color)}").replace("${product.category}", "${escapeHtml(product.category)}").replace("${product.name}", "${escapeHtml(product.name)}"), encoding="utf-8")
commit("10-18", "14:52", "Validate catalog values before rendering")

put("responsive.css", """
button { min-height: 42px; border: 0; border-radius: 8px; padding: 0 14px; background: #254d3f; color: white; cursor: pointer; }
button:hover { background: #17392e; }
button:focus-visible, input:focus-visible { outline: 3px solid #d18d4b; outline-offset: 2px; }
input { min-height: 42px; margin: 0 8px; border: 1px solid #a7afa8; border-radius: 8px; padding: 0 12px; }
.product button { margin-top: 18px; width: 100%; }
@media (max-width: 900px) { #products { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { #products { grid-template-columns: 1fr; } main { padding: 32px 16px; } header { padding: 32px 16px; } }
""")
index.write_text(index.read_text(encoding="utf-8").replace("</head>", '<link rel="stylesheet" href="./responsive.css">\n</head>'), encoding="utf-8")
commit("10-22", "09:27", "Refine small-screen catalog layout")

app.write_text(app.read_text(encoding="utf-8").replace('<button data-add="${product.id}">', '<button type="button" aria-label="${escapeHtml(product.name)} 장바구니 담기" data-add="${product.id}">'), encoding="utf-8")
index.write_text(index.read_text(encoding="utf-8").replace('<div id="products"></div>', '<div id="products" aria-label="상품 목록"></div>').replace('<button id="apply-coupon">', '<button type="button" id="apply-coupon">'), encoding="utf-8")
commit("10-22", "16:08", "Improve product and coupon control labels")

for line in subprocess.run(["git", "-C", str(ROOT), "log", "--reverse", "--format=%h %aI %s"], check=True, capture_output=True, text=True).stdout.splitlines():
    print(line)
