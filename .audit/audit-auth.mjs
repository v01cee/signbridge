import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = 'http://localhost:8088';
const OUT = './shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function runFlow(vp, vpName) {
  const tab = await browser.newPage();
  await tab.setViewport(vp);
  const logs = [];
  tab.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
  });
  tab.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  tab.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()}`));

  // 1) Login
  console.log(`\n[${vpName}] LOGIN`);
  await tab.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
  await tab.type('input[type="email"]', 'admin@signbridge.dev');
  await tab.type('input[type="password"]', 'admin123');
  await tab.screenshot({ path: `${OUT}/${vpName}__login-filled.png`, fullPage: true });

  await Promise.all([
    tab.waitForNavigation({ waitUntil: 'networkidle0' }),
    tab.click('button[type="submit"]'),
  ]).catch((e) => logs.push(`[login click] ${e.message}`));
  await new Promise((r) => setTimeout(r, 500));
  await tab.screenshot({ path: `${OUT}/${vpName}__after-login.png`, fullPage: true });
  const afterLoginUrl = tab.url();
  console.log(`  → ${afterLoginUrl}`);

  // 2) Open gesture detail
  console.log(`[${vpName}] GESTURE DETAIL`);
  await tab.goto(`${BASE}/gestures/21`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  await tab.screenshot({ path: `${OUT}/${vpName}__gesture-authed.png`, fullPage: true });

  // 3) Add to favorites
  console.log(`[${vpName}] ADD FAV`);
  const favBtn = await tab.$('button[title*="збранн"]');
  if (favBtn) {
    await favBtn.click();
    await new Promise((r) => setTimeout(r, 700));
    await tab.screenshot({ path: `${OUT}/${vpName}__gesture-faved.png`, fullPage: true });
    console.log(`  → favorited`);
  } else {
    console.log(`  ✗ no fav button`);
  }

  // 4) Open favorites page
  console.log(`[${vpName}] FAVORITES`);
  await tab.goto(`${BASE}/favorites`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 700));
  await tab.screenshot({ path: `${OUT}/${vpName}__favorites-authed.png`, fullPage: true });

  // 5) Open create page
  console.log(`[${vpName}] CREATE`);
  await tab.goto(`${BASE}/create`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  await tab.screenshot({ path: `${OUT}/${vpName}__create-authed.png`, fullPage: true });

  // 6) Mobile burger menu
  if (vpName === 'mobile') {
    console.log(`[mobile] BURGER`);
    await tab.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
    const burger = await tab.evaluateHandle(() => {
      return [...document.querySelectorAll('button')].find(b => /[☰✕]/.test(b.textContent));
    });
    if (burger && burger.asElement()) {
      await burger.asElement().click();
      await new Promise((r) => setTimeout(r, 300));
      await tab.screenshot({ path: `${OUT}/mobile__burger-open.png`, fullPage: true });
    }
  }

  // 7) Click on category filter
  console.log(`[${vpName}] CATEGORY FILTER`);
  await tab.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const catBtn = await tab.evaluateHandle(() => {
    return [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Числа');
  });
  if (catBtn && catBtn.asElement()) {
    await catBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 700));
    await tab.screenshot({ path: `${OUT}/${vpName}__filter-numbers.png`, fullPage: true });
  }

  // 8) Search
  console.log(`[${vpName}] SEARCH`);
  const search = await tab.$('input[type="text"], input[type="search"]');
  if (search) {
    await search.click({ clickCount: 3 });
    await search.type('Привет');
    await new Promise((r) => setTimeout(r, 700));
    await tab.screenshot({ path: `${OUT}/${vpName}__search-privet.png`, fullPage: true });
  }

  console.log(`[${vpName}] logs: ${logs.length}`);
  if (logs.length) console.log(logs.join('\n'));
  await tab.close();
  return logs;
}

const desktopLogs = await runFlow({ width: 1280, height: 900 }, 'desktop');
const mobileLogs = await runFlow({ width: 390, height: 844 }, 'mobile');

await browser.close();
console.log('\n=== DONE ===');
console.log('desktop errs:', desktopLogs.length, '| mobile errs:', mobileLogs.length);
