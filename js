// ============================================================
// DAVRANIŞ: JavaScript
// Python'dan gelen biri için kısa harita:
//   kayitlar = []              ->  let kayitlar = [];
//   def fonksiyon():           ->  function fonksiyon() { }
//   for k in liste:            ->  for (const k of liste) { }
//   liste.append(x)            ->  liste.push(x)
//   k["tur"]  (sözlük)         ->  k.tur  (nesne / object)
//   if x == y:                 ->  if (x === y) { }     (=== sıkı eşitlik, hep bunu kullan)
//   print()                    ->  console.log()  veya sayfaya yazmak
//   Girinti zorunlu DEĞİL, bloklar { } ile belirlenir. Yine de girinti yap, okunsun.
// Her satırın sonuna ; koymak alışkanlıktır. Çoğu yerde yazmasan da çalışır.
// ============================================================


// ---------- 1) VERİ ----------

// const = sonradan "yeniden atanamaz" değişken. let = atanabilir.
// Kural: değişmeyecekse const, değişecekse let kullan.
// (Dikkat: const bir liste/nesne içine eleman eklemeye engel değildir, sadece
// değişkeni başka bir şeye çevirmeyi engeller.)
const KATEGORILER = {
  gider: ["Market", "Fatura", "Ulaşım", "Yeme-içme", "Eğlence", "Sağlık", "Eğitim", "Diğer"],
  gelir: ["Maaş", "Ek gelir", "Hediye", "Diğer"]
};

// Kayıtları tarayıcıda saklarken kullanacağımız "çekmece adı".
const ANAHTAR = "butce-kayitlari";

// Bellekte yedek liste: localStorage çalışmazsa (bazı önizleme ortamlarında çalışmaz)
// uygulama çökmesin, sayfa açık kaldığı sürece kayıtlar bellekte dursun.
let bellek = [];

// Ekranda hangi filtre seçili. "hepsi", "gelir" veya "gider".
let filtre = "hepsi";


// ---------- 2) KAYDETME VE YÜKLEME (localStorage) ----------
// localStorage: tarayıcının küçük kalıcı çekmecesi. Sayfayı kapatsan da kalır.
// SADECE METİN saklar. Bu yüzden listeyi JSON metnine çevirip saklıyoruz:
//   JSON.stringify(liste) -> liste yazıya
//   JSON.parse(yazi)      -> yazı tekrar listeye

// try / catch = Python'daki try / except. "Dene, hata çıkarsa şunu yap."
function yukle() {
  try {
    // İlk açılışta çekmece boştur, getItem null döner. "||" = "null ise şunu kullan".
    return JSON.parse(localStorage.getItem(ANAHTAR) || "[]");
  } catch (hata) {
    return bellek;
  }
}

function kaydet() {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(kayitlar));
  } catch (hata) {
    bellek = kayitlar;
  }
}

// Uygulama açılırken eski kayıtları çekmeceden alıyoruz.
let kayitlar = yukle();


// ---------- 3) KÜÇÜK YARDIMCILAR ----------

// Sürekli document.getElementById yazmamak için kısaltma.
// Bu "ok fonksiyonu": (parametre) => sonuç. Python'daki lambda gibi düşünebilirsin.
const $ = (id) => document.getElementById(id);

// Sayıyı "1.250,50 ₺" gibi Türkçe para biçimine çevirir. Kendimiz yazmaya gerek yok.
function para(sayi) {
  return sayi.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

// Bugünün tarihini "2026-11-08" biçiminde verir.
// Bu biçim (YYYY-AA-GG) önemli: <input type="date"> bu biçimi kullanır
// ve yazı olarak sıralandığında tarih sırasıyla da aynı çıkar.
function bugun() {
  const d = new Date();
  // getMonth() 0'dan başlar (Ocak = 0), o yüzden +1.
  // padStart(2, "0"): "5" -> "05" yapar.
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + ay + "-" + gun;
}

// "2026-11-08" -> "08.11.2026" (ekranda göstermek için)
function tarihYaz(metin) {
  const parcalar = metin.split("-");     // Python'daki split ile aynı
  return parcalar[2] + "." + parcalar[1] + "." + parcalar[0];
}

// Seçili aya ait kayıtları döndürür.
// filter: listeden şartı sağlayanları alıp YENİ bir liste yapar. Orijinali değiştirmez.
// startsWith: "2026-11-08" yazısı "2026-11" ile başlıyor mu?
function seciliAyKayitlari() {
  const ay = $("ay").value;
  return kayitlar.filter(function (k) {
    return k.tarih.startsWith(ay);
  });
}

// Senin Python kodundaki gelir_toplam / gider_toplam hesabının düzgün hali.
// Hata neydi? Orada "=" kullanmıştın, yani her turda öncekinin üstüne yazıyordu.
// Toplamak için "+=" gerekir.
function toplamlar(liste) {
  let gelir = 0;
  let gider = 0;
  for (const k of liste) {
    if (k.tur === "gelir") {
      gelir += k.miktar;
    } else {
      gider += k.miktar;
    }
  }
  // Bir fonksiyon tek değer döndürebilir; iki değeri nesne içine koyup döndürüyoruz.
  return { gelir: gelir, gider: gider, bakiye: gelir - gider };
}


// ---------- 4) FORMU HAZIRLAMA ----------

// Gelir mi gider mi seçildiğine göre kategori listesini yeniden doldurur.
function kategoriDoldur() {
  // querySelector: CSS seçicisiyle eleman bulur. Burada "name'i tur olan ve seçili radio".
  const tur = document.querySelector('input[name="tur"]:checked').value;

  $("kategori").innerHTML = "";               // önce eski seçenekleri temizle
  for (const ad of KATEGORILER[tur]) {        // KATEGORILER["gider"] -> gider listesi
    const secenek = document.createElement("option");  // HTML'de yok, JS ile elemanı biz üretiyoruz
    secenek.textContent = ad;                           // içine yazıyı koy
    $("kategori").appendChild(secenek);                 // sayfadaki select'in içine ekle
  }
}


// ---------- 5) EKRANI ÇİZME ----------
// Bu uygulamanın kalbi. Mantık şu:
//   veri değişti -> ciz() çağır -> ekran verinin son haline göre baştan çizilir.
// Elemanları tek tek "güncellemek" yerine baştan çizmek daha basit ve hata yapması zor.
function ciz() {
  const liste = seciliAyKayitlari();
  const t = toplamlar(liste);
  const [y, m] = $("ay").value.split("-");
$("ayYazi").textContent = new Date(y, m - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  // textContent: elemanın içindeki yazıyı değiştirir.
  // Güvenli yöntem: kullanıcının yazdığı notta "<b>" gibi bir şey olsa bile
  // HTML olarak çalıştırılmaz, düz yazı olarak görünür.
  $("bakiye").textContent = para(t.bakiye);
  $("topGelir").textContent = para(t.gelir);
  $("topGider").textContent = para(t.gider);

  // --- Kayıt listesi ---
  const ul = $("liste");
  ul.innerHTML = "";   // eski listeyi sil

  // Filtreye göre ayıkla ve yeniden eskiye sırala.
  // sort içindeki fonksiyon iki elemanı karşılaştırır. Negatif/pozitif sayı sıralamayı belirler.
  // localeCompare: iki yazıyı karşılaştırır. Tarih yazısı olduğu için sırası doğru çıkar.
  const gorunen = liste
    .filter(function (k) { return filtre === "hepsi" || k.tur === filtre; })
    .sort(function (a, b) { return b.tarih.localeCompare(a.tarih) || b.id - a.id; });

  if (gorunen.length === 0) {
    // Boş durumda kullanıcıya ne yapacağını söylüyoruz.
    const li = document.createElement("li");
    li.className = "bos";
    li.textContent = "Bu ay için kayıt yok. Yukarıdan ilk kaydını ekle.";
    ul.appendChild(li);
  }

  for (const k of gorunen) {
    // Her kayıt için bir <li> kutusu ve içine 4 parça üretiyoruz.
    const li = document.createElement("li");
    li.className = "kayit";

    const ad = document.createElement("span");
    ad.className = "ad";
    ad.textContent = k.kategori;

    const alt = document.createElement("span");
    alt.className = "alt";
    // Not varsa tarihin yanına ekle. "? :" kısa if-else'tir: şart ? doğruysa : yanlışsa
    alt.textContent = tarihYaz(k.tarih) + (k.not ? " · " + k.not : "");

    const tutar = document.createElement("span");
    tutar.className = "tutar " + k.tur;   // "tutar gelir" veya "tutar gider": CSS rengi buna göre verir
    tutar.textContent = (k.tur === "gelir" ? "+" : "−") + para(k.miktar);

    const sil = document.createElement("button");
    sil.className = "sil";
    sil.textContent = "Sil";

    // Butona tıklanınca ne olacak? Olay dinleyici (event listener):
    // addEventListener("olayAdı", çalışacakFonksiyon)
    sil.addEventListener("click", function () {
      // confirm: "Tamam / İptal" kutusu çıkarır, Tamam'a basılırsa true döner.
      if (confirm("Bu kayıt silinsin mi?")) {
        // Silmek = silinecek DIŞINDAKİ herkesi tutmak. Her kaydın benzersiz id'si var.
        // !== "eşit değil" demek.
        kayitlar = kayitlar.filter(function (x) { return x.id !== k.id; });
        kaydet();
        ciz();     // veri değişti, ekranı yeniden çiz
      }
    });

    // append: birden çok elemanı sırayla içine ekler. Sıra: ad, tutar, alt, sil.
    li.append(ad, tutar, alt, sil);
    ul.appendChild(li);
  }

  raporCiz(liste, t);
}

// Ay sonu raporu: özet satırları ve kategori çubukları.
function raporCiz(liste, t) {
  // Tasarruf oranı = kalan / gelir. Gelir 0 ise bölme yapılmaz (0'a bölme hatası olmasın).
  const oran = t.gelir > 0 ? Math.round((t.bakiye / t.gelir) * 100) : null;

  const giderler = liste.filter(function (k) { return k.tur === "gider"; });

  // reduce: listeyi dolaşıp TEK bir sonuca indirir. Burada "en büyük gider"i buluyoruz.
  // "en" = o ana kadarki en büyük. İlk turda en yok (null), ilk kayıt en büyük olur.
  const enBuyuk = giderler.reduce(function (en, k) {
    return (!en || k.miktar > en.miktar) ? k : en;
  }, null);

  // Her satır [başlık, değer] çifti. Dizinin içinde dizi.
  const satirlar = [
    ["Toplam gelir", para(t.gelir)],
    ["Toplam gider", para(t.gider)],
    ["Kalan", para(t.bakiye)],
    ["Tasarruf oranı", oran === null ? "—" : "%" + oran],
    ["En büyük gider", enBuyuk ? enBuyuk.kategori + " · " + para(enBuyuk.miktar) : "—"],
    ["Kayıt sayısı", String(liste.length)]
  ];

  const ozet = $("ozetSatirlari");
  ozet.innerHTML = "";
  for (const cift of satirlar) {
    const satir = document.createElement("div");
    satir.className = "satir";
    const baslik = document.createElement("span");
    baslik.textContent = cift[0];
    const deger = document.createElement("strong");
    deger.textContent = cift[1];
    satir.append(baslik, deger);
    ozet.appendChild(satir);
  }

  // --- Kategoriye göre gider toplamı ---
  // Bir nesneyi "sayaç" olarak kullanıyoruz: { Market: 500, Fatura: 300 }
  const kat = {};
  for (const k of giderler) {
    // Kategori daha önce yoksa kat[k.kategori] undefined olur, || 0 ile 0'dan başlatırız.
    kat[k.kategori] = (kat[k.kategori] || 0) + k.miktar;
  }

  // Object.entries: nesneyi [anahtar, değer] çiftleri listesine çevirir, sıralayabilelim diye.
  const sirali = Object.entries(kat).sort(function (a, b) { return b[1] - a[1]; });

  const kutu = $("kategoriler");
  kutu.innerHTML = "";

  if (sirali.length === 0) {
    const p = document.createElement("p");
    p.className = "bos";
    p.textContent = "Bu ay gider kaydı yok.";
    kutu.appendChild(p);
    return;     // fonksiyondan çık, aşağıdakini çalıştırma
  }

  for (const cift of sirali) {
    const adi = cift[0];
    const tutar = cift[1];
    const yuzde = t.gider > 0 ? (tutar / t.gider) * 100 : 0;

    const d = document.createElement("div");
    d.className = "kat";

    const ust = document.createElement("div");
    ust.className = "kat-ust";
    const s1 = document.createElement("span");
    s1.textContent = adi;
    const s2 = document.createElement("span");
    s2.textContent = para(tutar) + " · %" + Math.round(yuzde);
    ust.append(s1, s2);

    // Çubuk: dış kutu + içindeki dolgu. Dolgunun genişliğini yüzde olarak veriyoruz.
    const cubuk = document.createElement("div");
    cubuk.className = "cubuk";
    const dolgu = document.createElement("i");
    dolgu.style.width = yuzde + "%";    // .style ile CSS'i JS içinden verebilirsin
    cubuk.appendChild(dolgu);

    d.append(ust, cubuk);
    kutu.appendChild(d);
  }
}


// ---------- 6) OLAYLAR (kullanıcı bir şey yapınca ne olsun) ----------

// Form gönderilince (Kaydı ekle'ye basınca)
// "e" = olay hakkında bilgi veren nesne.
$("form").addEventListener("submit", function (e) {
  // Form normalde gönderilince sayfayı yeniler. Yenilenirse bizim JS ve ekran sıfırlanır.
  // preventDefault = "tarayıcı, kendi varsayılan davranışını yapma, ben hallederim".
  e.preventDefault();

  const tur = document.querySelector('input[name="tur"]:checked').value;
  const miktar = parseFloat($("miktar").value);   // Python'daki float(). Yazı -> sayı
  const tarih = $("tarih").value;

  // DOĞRULAMA: Python kodunda float(input()) yanlış girişte programı çökertirdi.
  // Burada önce kontrol ediyoruz. Boş girilirse parseFloat NaN ("sayı değil") döner,
  // NaN > 0 de false olur. Yani bu tek şart hem boşu hem eksiyi yakalar.
  if (!(miktar > 0)) {
    $("hata").textContent = "Tutar 0'dan büyük bir sayı olmalı.";
    return;    // fonksiyondan çık, kayıt ekleme
  }
  if (!tarih) {
    $("hata").textContent = "Bir tarih seç.";
    return;
  }
  $("hata").textContent = "";   // hata yoksa eski mesajı temizle

  // Python'daki sözlüğün karşılığı. id: silerken kaydı ayırt etmek için benzersiz numara.
  // Date.now() = o anın milisaniye sayısı, her kayıtta farklı çıkar.
  const kayit = {
    id: Date.now(),
    tur: tur,
    miktar: miktar,
    tarih: tarih,
    kategori: $("kategori").value,
    not: $("not").value.trim()      // trim: baştaki sondaki boşlukları siler
  };

  kayitlar.push(kayit);   // append -> push
  kaydet();

  // Kullanıcı geçmiş bir ay için kayıt girdiyse, o ayı göster. Yoksa kaydı ekranda göremez,
  // "eklenmedi" sanır.
  $("ay").value = tarih.slice(0, 7);   // "2026-11-08" -> ilk 7 karakter "2026-11"
  $("miktar").value = "";
  $("not").value = "";
  ciz();
});

// Gelir/Gider değişince kategorileri yenile.
// querySelectorAll birden fazla eleman bulur, forEach her biri için çalışır.
document.querySelectorAll('input[name="tur"]').forEach(function (r) {
  r.addEventListener("change", kategoriDoldur);   // fonksiyonu () olmadan veriyoruz: "bunu çalıştır"
});

// Ay değişince ekranı yenile
function ayDegistir(fark) {
  const parcalar = $("ay").value.split("-");        // "2026-11" -> ["2026", "11"]
  const yil = Number(parcalar[0]);
  const ay = Number(parcalar[1]);
  const d = new Date(yil, ay - 1 + fark, 1);        // JS yıl taşmasını kendisi halleder (Ocak - 1 = önceki Aralık)
  $("ay").value = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  ciz();
}
$("oncekiAy").addEventListener("click", function () { ayDegistir(-1); });
$("sonrakiAy").addEventListener("click", function () { ayDegistir(1); });

// Filtre butonları
document.querySelectorAll(".filtre button").forEach(function (b) {
  b.addEventListener("click", function () {
    filtre = b.dataset.f;    // HTML'deki data-f="gelir" -> JS'te dataset.f
    // Hangi buton seçili olduğunu işaretle; görünümü CSS halleder.
    document.querySelectorAll(".filtre button").forEach(function (x) {
      x.setAttribute("aria-pressed", x === b);
    });
    ciz();
  });
});

// Sekmeler (Kayıtlar / Rapor)
document.querySelectorAll(".sekmeler button").forEach(function (b) {
  b.addEventListener("click", function () {
    document.querySelectorAll(".sekmeler button").forEach(function (x) {
      x.setAttribute("aria-selected", x === b);
    });
    // Her paneli dolaş: butonun gösterdiği paneli aç, diğerlerini gizle.
    document.querySelectorAll(".panel").forEach(function (p) {
      p.hidden = (p.id !== b.dataset.panel);
    });
  });
});


// ---------- 7) BAŞLANGIÇ ----------
// Sayfa açılınca bir kere çalışan satırlar. Sıra önemli:
// önce kutuları doldur, sonra ekranı çiz.
$("tarih").value = bugun();            // tarih kutusu bugünle gelsin
$("ay").value = bugun().slice(0, 7);   // ay seçici bu ayla başlasın
kategoriDoldur();
ciz();
