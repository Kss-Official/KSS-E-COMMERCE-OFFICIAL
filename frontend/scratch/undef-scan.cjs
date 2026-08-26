const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const GLOBALS = new Set(['window','document','console','localStorage','sessionStorage','fetch','setTimeout','clearTimeout','setInterval','clearInterval','Math','JSON','Object','Array','String','Number','Boolean','Date','Promise','Error','Map','Set','WeakMap','RegExp','parseInt','parseFloat','isNaN','encodeURIComponent','decodeURIComponent','URLSearchParams','navigator','location','alert','confirm','prompt','requestAnimationFrame','cancelAnimationFrame','FormData','Blob','File','FileReader','Intl','Symbol','BigInt','globalThis','process','module','require','exports','__dirname','structuredClone','queueMicrotask','AbortController','Event','CustomEvent','IntersectionObserver','ResizeObserver','MutationObserver','crypto','performance','history','screen','matchMedia','undefined','NaN','Infinity','arguments','Image','Audio','CSS','DOMParser','Notification','WebSocket','Worker','TextEncoder','TextDecoder','atob','btoa','Proxy','Reflect','Function','Uint8Array','ArrayBuffer','HTMLElement','Node','Text','getComputedStyle','scrollTo','open','encodeURI','decodeURI','escape','unescape','Headers','Request','Response','Intl','WeakSet','Promise','eval','Element','Document','Window','URL','TouchEvent','KeyboardEvent','MouseEvent','ClipboardEvent','DragEvent','SVGElement','Storage','CSSStyleSheet','AbortSignal','ReadableStream','Uint16Array','Uint32Array','Int8Array','Float32Array','Float64Array','DataView','JSON']);

const roots = process.argv.slice(2);
const files = [];
for (const root of roots) {
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (['node_modules', 'dist', '.git', 'scratch'].includes(e.name)) continue;
        walk(p);
      } else if (/\.(jsx|js)$/.test(p)) {
        files.push(p);
      }
    }
  })(root);
}

let total = 0;
for (const f of files) {
  let ast;
  try {
    ast = parser.parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) {
    console.log('PARSE FAIL ' + f + ': ' + e.message);
    continue;
  }
  const found = new Map();
  traverse(ast, {
    ReferencedIdentifier(p) {
      const n = p.node.name;
      if (GLOBALS.has(n)) return;
      if (p.scope.hasBinding(n, true)) return;
      if (!found.has(n)) found.set(n, p.node.loc ? p.node.loc.start.line : 0);
    }
  });
  if (found.size) {
    console.log('--- ' + f);
    for (const [n, l] of found) console.log('    line ' + l + ': ' + n);
    total += found.size;
  }
}
console.log('\nTOTAL UNDEFINED REFERENCES: ' + total);
