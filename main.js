/*
* IndexedDB
* */
createDatabase();
function createDatabase() {
    if (!('indexedDB' in window)){
        console.log('Web Browser tidak mendukung Indexed DB');
        return;
    }
    var request = window.indexedDB.open('pwa',1);
    request.onerror = errordbHandle;
    request.onupgradeneeded = (e)=>{
        var db = e.target.result;
        db.onerror = errordbHandle;
        var objectStore = db.createObjectStore('produk',
            {keyPath: 'kode'});
        console.log('Object store produk berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.error = errordbHandle;
        console.log('Berhasil melakukan koneksi ke database lokal');
        // lakukan sesuatu ...
        bacaDariDB();
    }
}

function errordbHandle(e) {
    console.log('Error DB : '+e.target.errorCode);
}

var tabel = document.getElementById('tabel-produk'),
    kode = document.getElementById('kode'),
    nama= document.getElementById('nama'),
    jumlah= document.getElementById('jumlah'),
    form = document.getElementById('form-tambah');

form.addEventListener('submit',tambahBaris);
tabel.addEventListener('click',hapusBaris);

function tambahBaris(e){
    // cek nim apakah sudah ada
    if (tabel.rows.namedItem(kode.value)){
        alert('Error: NIM sudah terdaftar');
        e.preventDefault();
        return;
    }
    // masukkan data ke database
    tambahKeDB({
        kode : kode.value,
        nama : nama.value,
        jumlah : jumlah.value
    });

    // append baris baru dari data form
    var baris = tabel.insertRow();
    baris.id = kode.value;
    baris.insertCell().appendChild(document.createTextNode(kode.value));
    baris.insertCell().appendChild(document.createTextNode(nama.value));
    baris.insertCell().appendChild(document.createTextNode(jumlah.value));

    // tambah bagian button delete
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = kode.value;
    btn.className = 'btn btn-sm btn-danger';
    baris.insertCell().appendChild(btn);
    e.preventDefault();
}

function tambahKeDB(produk) {
    var objectStore = buatTransaksi().objectStore('produk');
    var request = objectStore.add(produk);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('Produk ['+produk.kode+'] '
        +'berhasil di tambahkan')
}

function buatTransaksi() {
    var transaction = db.transaction(['produk'],'readwrite');
    transaction.onerror = errordbHandle;
    transaction.complete = console.log('Transaksi selesai');

    return transaction;
}

function bacaDariDB() {
    var objectStore = buatTransaksi().objectStore('produk');
    objectStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if (result){
            console.log('Membaca [' + result.value.kode +'] dari DB');
            // append baris dari database
            var baris = tabel.insertRow();
            baris.id = kode.value;
            baris.insertCell().appendChild(document.createTextNode(result.value.kode));
            baris.insertCell().appendChild(document.createTextNode(result.value.nama));
            baris.insertCell().appendChild(document.createTextNode(result.value.jumlah));

            // append tombol hapus
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.kode;
            btn.className = 'btn btn-sm btn-danger';
            baris.insertCell().appendChild(btn);
            result.continue();
        }
    }
}

function hapusBaris(e) {
    if (e.target.type ==='button'){
        var hapus = confirm('Apakah yakin menghapus data?');
        if (hapus){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            hapusDariDB(e.target.id);
        }
    }
}

function hapusDariDB(kode) {
    var objectStore = buatTransaksi().objectStore('produk');
    var request = objectStore.delete(kode);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('Produk ['+kode+'] terhapus');
}

if ('serviceWorker' in navigator){
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/serviceworker.js').then(
            function (reg) {
                // registerasi service worker berhasil
                console.log('SW registration success, scope :',reg.scope);
            }, function (err) {
                // reg failed
                console.log('SW registration failed : ', err);
            }
        )
    })
}
