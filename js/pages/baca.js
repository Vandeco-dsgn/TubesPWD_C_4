'use strict';
/* Pembaca buku di situs (baca.xhtml): PDF lewat PDF.js, EPUB lewat epub.js.
   Halaman yang sedang dibaca disimpan otomatis ke server dan tampil di progress bar Beranda. */
const loadScript = src => new Promise((ok, no) => {
  const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Gagal memuat ' + src));
  document.head.appendChild(s);
});
const stageMsg = (t, err) => { const m = $('#rdMsg'); m.className = 'rd-msg' + (err ? ' err' : ''); m.textContent = t; };

/* Penyimpan progres: menunda 0,7 dtk setelah halaman berhenti berganti, dan menyimpan sisa saat tab ditutup/disembunyikan */
function makeTracker(isbn, total) {
  let pending = null, sent = null, timer = null;
  const fd = v => objFD({ action: 'simpan', isbn, halaman: v });
  const flush = () => {
    if (pending === null || pending === sent) return;
    clearTimeout(timer); sent = pending;
    navigator.sendBeacon ? navigator.sendBeacon('baca.php', fd(pending)) : api('baca.php', fd(pending));
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  return {
    sync(v) { sent = v; pending = v; },                       // posisi awal (sudah tersimpan di server)
    set(stored) {
      stored = Math.max(0, Math.min(total, stored));
      $('#rdFill').style.width = (total ? stored / total * 100 : 0) + '%';
      if (stored === pending) return;
      pending = stored; clearTimeout(timer);
      timer = setTimeout(() => { sent = stored; api('baca.php', fd(stored)); }, 700);
    },
    flush,
  };
}

/* Penghalang unduh/cetak sederhana (tidak bisa 100% — lihat catatan di README/jawaban) */
function lockDown() {
  ['contextmenu', 'dragstart', 'copy', 'cut'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
  });
}

async function readPdf(buf, b, track) {
  await loadScript('js/vendor/pdfjs/pdf.min.js?v=2.12.313');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdfjs/pdf.worker.min.js?v=2.12.313';
  const pdf = await pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise;
  const n = pdf.numPages, total = b.halaman || n;
  /* Jumlah halaman di database bisa beda dari PDF asli, jadi disimpan sebagai skala: halaman/n × total */
  const toStored = p => Math.round(p / n * total);
  const toPage = s => Math.min(n, Math.max(1, Math.round(s / total * n)));
  let page = b.halaman_terakhir > 0 ? toPage(b.halaman_terakhir) : 1, zoom = 1, busy = false, again = false;
  const stage = $('#stage'), canvas = document.createElement('canvas');
  canvas.id = 'pdfCanvas'; stage.appendChild(canvas); /* dibuat lewat JS: <canvas> tidak ada di XHTML 1.0 */
  $('#pgTot').textContent = n; show($('#rdCtrl'), true); show($('#rdMsg'), false);

  async function draw() {
    if (busy) { again = true; return; }
    busy = true;
    do {
      again = false;
      const pg = await pdf.getPage(page), w = pg.getViewport({ scale: 1 }).width;
      const css = Math.min(stage.clientWidth - 32, 1100) / w * zoom, dpr = window.devicePixelRatio || 1;
      const vp = pg.getViewport({ scale: css * dpr });
      canvas.width = vp.width; canvas.height = vp.height;
      canvas.style.width = vp.width / dpr + 'px'; canvas.style.height = vp.height / dpr + 'px';
      await pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    } while (again);
    busy = false;
  }
  function go(p) {
    p = Math.max(1, Math.min(n, Math.round(+p) || 1));
    const moved = p !== page; page = p;
    $('#pgIn').value = page; track.set(toStored(page));
    if (moved) { draw(); stage.scrollTop = 0; }
  }
  $('#btnPrev').onclick = () => go(page - 1);
  $('#btnNext').onclick = () => go(page + 1);
  $('#pgIn').onchange = e => go(e.target.value);
  $('#btnZoomIn').onclick = () => { zoom = Math.min(3, zoom * 1.2); draw(); };
  $('#btnZoomOut').onclick = () => { zoom = Math.max(0.5, zoom / 1.2); draw(); };
  document.addEventListener('keydown', e => {
    if (e.target.localName === 'input') return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) go(page + 1);
    if (['ArrowLeft', 'PageUp'].includes(e.key)) go(page - 1);
  });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 200); });
  $('#pgIn').value = page; track.sync(b.halaman_terakhir); track.set(b.halaman_terakhir);
  await draw();
  if (b.halaman_terakhir === 0) track.set(toStored(page)); // halaman pertama yang dibuka langsung tercatat
}

async function readEpub(buf, b, track) {
  await loadScript('js/vendor/jszip.min.js?v=3.10.1'); await loadScript('js/vendor/epub.min.js?v=0.3.93');
  const total = b.halaman || 100, box = $('#epub');
  show(box, true); show($('#rdCtrl'), true); show($('#pgBox'), false); show($('#pctBox'), true);
  const book = ePub(buf);
  const rend = book.renderTo('epub', { width: '100%', height: '100%', flow: 'paginated', spread: 'none' });
  rend.hooks.content.register(c => {
    c.addStylesheetRules({ body: { '-webkit-user-select': 'none', 'user-select': 'none' } });
    ['contextmenu', 'dragstart', 'copy', 'cut'].forEach(ev => c.document.addEventListener(ev, e => e.preventDefault()));
    c.document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault(); });
  });
  await book.ready; await book.locations.generate(1024);
  show($('#rdMsg'), false);
  track.sync(b.halaman_terakhir); track.set(b.halaman_terakhir);
  $('#pctTxt').textContent = Math.round((b.halaman_terakhir / total) * 100) + '%';
  let settle = Infinity; // selama membuka posisi tersimpan, perpindahan otomatis tidak ikut disimpan (hindari pergeseran progres)
  rend.on('relocated', loc => {
    const pct = loc.atEnd ? 1 : Math.max(0, book.locations.percentageFromCfi(loc.start.cfi) || 0);
    $('#pctTxt').textContent = Math.round(pct * 100) + '%';
    if (Date.now() < settle) return;
    track.set(Math.round(pct * total));
  });
  const start = b.halaman_terakhir > 0 ? Math.min(0.999, b.halaman_terakhir / total) : 0;
  await rend.display(start > 0 ? book.locations.cfiFromPercentage(start) : undefined);
  settle = Date.now() + 1500;
  let zoom = 1;
  const move = d => d > 0 ? rend.next() : rend.prev();
  $('#btnPrev').onclick = () => move(-1); $('#btnNext').onclick = () => move(1);
  $('#btnZoomIn').onclick = () => { zoom = Math.min(2.5, zoom + 0.15); rend.themes.fontSize(Math.round(zoom * 100) + '%'); };
  $('#btnZoomOut').onclick = () => { zoom = Math.max(0.7, zoom - 0.15); rend.themes.fontSize(Math.round(zoom * 100) + '%'); };
  const key = e => { if (['ArrowRight', 'PageDown'].includes(e.key)) move(1); if (['ArrowLeft', 'PageUp'].includes(e.key)) move(-1); };
  document.addEventListener('keydown', key); rend.on('keyup', key);
}

async function initBaca() {
  lockDown();
  /* Tombol Kembali: kembali ke halaman asal (Beranda/Riwayat) bila ada, jika tidak ke Riwayat */
  $('#btnBack').onclick = e => { if (history.length > 1 && document.referrer.startsWith(location.origin)) { e.preventDefault(); history.back(); } };
  const isbn = new URLSearchParams(location.search).get('isbn') || '';
  const info = await api('baca.php?isbn=' + encodeURIComponent(isbn));
  if (!info.ok) { $('#rdTitle').textContent = 'Tidak bisa dibuka'; stageMsg(info.error, 1); return; }
  const b = info.buku; $('#rdTitle').textContent = b.judul; document.title = 'E-Lib | ' + b.judul;
  stageMsg('Memuat buku…');
  let buf;
  try {
    const r = await fetch('file.php?isbn=' + encodeURIComponent(isbn), { credentials: 'same-origin', headers: { 'X-Reader': '1' } });
    if (r.status === 401) { location.href = 'login.xhtml'; return; }
    if (!r.ok) { let m = 'Gagal memuat file buku.'; try { m = (await r.json()).error || m; } catch (e) {} return stageMsg(m, 1); }
    buf = await r.arrayBuffer();
  } catch (e) { return stageMsg('Tidak bisa terhubung ke server.', 1); }
  const track = makeTracker(isbn, b.halaman || 1);
  try { await (b.format === 'epub' ? readEpub : readPdf)(buf, b, track); }
  catch (e) { console.error(e); stageMsg('File buku tidak bisa ditampilkan (rusak atau format tidak didukung).', 1); }
}
document.addEventListener('DOMContentLoaded', initBaca);
