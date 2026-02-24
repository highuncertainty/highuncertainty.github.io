const fs = require('fs');
const path = require('path');

const METRIKA_COUNTER = '106336642';

// Скрипт Яндекс.Метрики
const metrikaScript = `
   <script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(${METRIKA_COUNTER}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
`;

// Noscript для метрики
const metrikaNoscript = `<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_COUNTER}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`;

function injectMetrika(html) {
  // Проверяем, не добавлен ли уже код Metrika
  if (html.includes('yandex.ru/metrika') || html.includes(`ym(${METRIKA_COUNTER}`)) {
    return html;
  }

  // Вставляем скрипт метрики перед закрывающим тегом </head>
  let result = html.replace('</head>', `${metrikaScript}</head>`);

  // Вставляем noscript сразу после открывающего тега <body>
  result = result.replace('<body>', `<body>\n${metrikaNoscript}`);

  return result;
}

// Рекурсивная функция для поиска HTML файлов
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Инжектируем Metrika во все HTML файлы
const outputDir = 'docs-html';

if (fs.existsSync(outputDir)) {
  const htmlFiles = findHtmlFiles(outputDir);

  htmlFiles.forEach(filePath => {
    try {
      const html = fs.readFileSync(filePath, 'utf8');

      // Проверяем, не добавлен ли уже код Metrika
      if (html.includes('yandex.ru/metrika')) {
        console.log(`Metrika already present in ${filePath}`);
        return;
      }

      const transformed = injectMetrika(html);
      fs.writeFileSync(filePath, transformed, {encoding: 'utf8'});
      console.log(`Injected Metrika into ${filePath}`);
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  });

  console.log('Metrika injection completed!');
} else {
  console.error('Output directory not found:', outputDir);
  process.exit(1);
}
