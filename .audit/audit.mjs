import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:8088';
const OUT = './shots';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'gesture-detail', path: '/gestures/21' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'favorites', path: '/favorites' },
  { name: 'create', path: '/create' },
];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const allLogs = {};

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const page of PAGES) {
    const tab = await browser.newPage();
    await tab.setViewport(vp);
    const logs = [];
    tab.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        logs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    tab.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
    tab.on('requestfailed', (req) => {
      const url = req.url();
      if (!url.includes('chrome-extension://')) {
        logs.push(`[reqfail] ${url} - ${req.failure()?.errorText}`);
      }
    });

    try {
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    } catch (e) {
      logs.push(`[goto] ${e.message}`);
    }

    // Дать дойти запросам и анимации
    await new Promise((r) => setTimeout(r, 800));

    const fileName = `${vpName}__${page.name}.png`;
    await tab.screenshot({ path: path.join(OUT, fileName), fullPage: true });

    // Дополнительные метрики
    const dom = await tab.evaluate(() => ({
      title: document.title,
      bodyScrollWidth: document.body.scrollWidth,
      bodyScrollHeight: document.body.scrollHeight,
      hasRoot: !!document.querySelector('#root')?.firstElementChild,
      bodyText: document.body.innerText.substring(0, 200),
    }));

    allLogs[`${vpName}__${page.name}`] = { dom, logs };
    await tab.close();
    console.log(`✓ ${vpName} ${page.path}`);
  }
}

fs.writeFileSync('./report.json', JSON.stringify(allLogs, null, 2));
await browser.close();
console.log('\n=== REPORT ===');
console.log(JSON.stringify(allLogs, null, 2));
