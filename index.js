const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const csvWriter = require('./writer');

const account = process.argv[2];
const password = process.argv[3];
const stockId = process.argv[4];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.wantgoo.com/');
  console.log('Home page loaded.');

  await page.click('#aLogin');
  console.log('Opened login window.');

  await page.type('#idUserName', account);
  console.log('Typed account.');

  await page.type('#idPassword', password);
  console.log('Typed password');

  await page.click('#btnLogIn');
  console.log('Clicked login button.');
  
  await page.waitForNavigation();
  console.log('Logged in.');

  await page.goto(`https://www.wantgoo.com/stock/astock/agentstatrank?stockno=${stockId}&type=2`);
  console.log('Now at fetch page.');

  const titles = ['排行', '券商名稱', '買張', '買價', '賣張', '賣價', '買賣超(張)', '均價'];
  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('#listResult tbody tr td'))
    return tds.reduce((rows, td, index) => {
      const rIndex = Math.floor(index / 8);
      const cIndex = index % 8;
    
      if (!rows[rIndex]) {
        rows[rIndex] = [];
      }

      const row = rows[rIndex];
      if (cIndex === 1) {
        row.push(td.title);
      } else {
        row.push(td.innerHTML);
      }
      return rows;
    }, []);
  });

  await mkdirp('./stock-data', function(err) { 
    csvWriter.save(`./stock-data/stock-${stockId}.csv`, titles, data);
    console.log(`Saved CSV file of stock id ${stockId}.`);
  });

  await browser.close();
})();