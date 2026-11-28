'use strict';
/* Diagnosa (diagnosa.xhtml): memeriksa kenapa JavaScript tidak berjalan di hosting.
   Hapus diagnosa.xhtml dan file ini setelah masalah selesai. */
(function () {
  var out = document.getElementById('hasil'), st = document.getElementById('status'), errors = [], rows = [];
  window.addEventListener('error', function (e) { errors.push((e.filename || '').replace(/^.*\//, '') + ': ' + e.message); });
  function add(ok, label, detail) { rows.push({ ok: ok, label: label, detail: detail || '' }); }
  function peek(url) {
    return fetch(url, { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
      return r.text().then(function (t) { return { status: r.status, type: r.headers.get('content-type') || '-', text: t }; });
    }).catch(function (e) { return { err: String(e) }; });
  }
  function checkJs(url, marker, markerLabel) {
    return peek(url).then(function (r) {
      if (r.err) { add(false, url + ' diambil', r.err); return; }
      var isJs = r.status === 200 && r.text.charAt(0) !== '<' && r.text.length > 100;
      add(isJs, url + ' diambil', 'status ' + r.status + ', ' + r.type + ', ' + r.text.length + ' karakter' + (r.text.charAt(0) === '<' ? ' (ISINYA HTML, bukan JavaScript!)' : ''));
      if (isJs) add(r.text.indexOf(marker) >= 0, url + ' versi terbaru', markerLabel);
      if (isJs) {
        var syn = true, msg = ''; try { new Function(r.text); } catch (e) { syn = false; msg = e.message; }
        add(syn, url + ' sintaks valid', msg);
        var en = performance.getEntriesByType('resource').filter(function (x) { return x.name.indexOf(url) >= 0; })[0];
        if (en) {
          var bytes = new Blob([r.text]).size;
          add(en.decodedBodySize === bytes, url + ' yang DIJALANKAN browser = yang ada di server',
            (en.transferSize === 0 ? 'diambil dari CACHE browser' : 'diunduh dari server') + '; ukuran dijalankan ' + en.decodedBodySize + ' byte, di server ' + bytes + ' byte');
        }
      }
    });
  }
  function run() {
    add(true, 'Halaman dimuat sebagai', document.contentType);
    var modern = true; try { new Function('return null ?? 1'); } catch (e) { modern = false; }
    add(modern, 'Browser mendukung JavaScript modern (operator ??)', modern ? 'ya' : 'TIDAK - browser ini lebih lama dari 2020');
    add(true, 'Browser', navigator.userAgent);
    add(typeof ELIB_BUILD !== 'undefined', 'helpers.js dijalankan', typeof ELIB_BUILD !== 'undefined' ? 'versi ' + ELIB_BUILD : 'tidak dijalankan atau versi lama');
    add(typeof enhance === 'function', 'helpers.js punya fungsi enhance (versi baru)', '');
    add(typeof api === 'function', 'api.js dijalankan', '');
    add(typeof initLogin === 'function', 'auth.js dijalankan', '');
    return checkJs('js/common/helpers.js', 'Jaring pengaman', 'mengandung "Jaring pengaman"')
      .then(function () { return checkJs('js/pages/auth.js', 'LEBIH DULU', 'mengandung "LEBIH DULU"'); })
      .then(function () { return peek('login.php'); })
      .then(function (r) {
        if (r.err) { add(false, 'login.php dapat dipanggil', r.err); return; }
        var json = true; try { JSON.parse(r.text); } catch (e) { json = false; }
        add(json, 'login.php membalas JSON', 'status ' + r.status + ', ' + r.type + ', awal: ' + r.text.slice(0, 70).replace(/\s+/g, ' '));
      });
  }
  run().then(function () {
    add(errors.length === 0, 'Error JavaScript', errors.length ? errors.join(' | ') : 'tidak ada');
    st.textContent = 'Hasil pemeriksaan (kirimkan semua baris ini ke Claude):';
    while (out.firstChild) out.removeChild(out.firstChild);
    rows.forEach(function (x) {
      var li = document.createElement('li');
      li.textContent = (x.ok ? 'OK  ' : 'GAGAL  ') + x.label + (x.detail ? ' - ' + x.detail : '');
      li.style.color = x.ok ? '#1a7f37' : '#c0392b';
      out.appendChild(li);
    });
  });
})();
