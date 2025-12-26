// Backend API URL
const API_URL = "http://localhost:3000";

/* ============================
   ŞUBELERİ YÜKLE
============================ */
async function loadSubeler() {
  try {
    const res = await fetch(`${API_URL}/subeler`);
    const subeler = await res.json();

    const s1 = document.getElementById("sube1");
    const s2 = document.getElementById("sube2");
    const ilceSelect = document.getElementById("ilceSelect"); // form için

    s1.innerHTML = "";
    s2.innerHTML = "";
    ilceSelect.innerHTML = ""; // önce temizle

    subeler.forEach(sube => {
      // Şube dropdownları
      const o1 = document.createElement("option");
      o1.value = sube.sube_id;
      o1.textContent = sube.sube_adi;
      s1.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = sube.sube_id;
      o2.textContent = sube.sube_adi;
      s2.appendChild(o2);

      // İlçe dropdownu
      if (sube.ilce_adi) { // sadece dolu ilçe ekle
        const ilceOpt = document.createElement("option");
        ilceOpt.value = sube.ilce_adi;
        ilceOpt.textContent = sube.ilce_adi;
        ilceSelect.appendChild(ilceOpt);
      }
    });
  } catch (err) {
    console.error("Şubeler yüklenemedi:", err);
  }
}

/* ============================
   ŞUBE PERFORMANS (DB)
============================ */
async function getPerformans(subeID) {
  const res = await fetch(`${API_URL}/performans/${subeID}`);
  return await res.json();
}

//ANASAYFA
async function loadMiniCards() {

  /* ====================
     TOPLAM ŞUBE SAYISI
  =======================*/
  try {
    const toplam = await fetch("http://localhost:3000/api/toplam-sube")
      .then(r => r.json());

    document.getElementById("miniToplamSube").innerText =
      toplam.toplam_sube || "-";

  } catch (err) {
    document.getElementById("miniToplamSube").innerText = "-";
  }



  /* ====================
     ÖNERİLEN YENİ İLÇE (BUBBLE)
  =======================*/
  try {
    const yeniIlce = await fetch("http://localhost:3000/api/bubble-yeni-ilce")
      .then(r => r.json());

    document.getElementById("miniBubbleYeniIlce").innerText =
      yeniIlce?.ilce_adi || "-";

  } catch (err) {
    document.getElementById("miniBubbleYeniIlce").innerText = "-";
  }



  /* ====================
     KAPATILMASI ÖNERİLEN İLÇE
  =======================*/
  try {
    const kapatmaIlce = await fetch("http://localhost:3000/api/kapat-ilce")
      .then(r => r.json());

    document.getElementById("miniKapatmaIlce").innerText =
      kapatmaIlce?.ilce_adi || "-";

  } catch (err) {
    document.getElementById("miniKapatmaIlce").innerText = "-";
  }

}

/* ============================
   ŞUBE KARŞILAŞTIRMA GRAFİĞİ
============================ */
let karsilastirmaChart;

async function loadKarsilastirmaGrafik() {
  const id1 = document.getElementById("sube1").value;
  const id2 = document.getElementById("sube2").value;

  if (!id1 || !id2) return;

  const [p1, p2] = await Promise.all([
    getPerformans(id1),
    getPerformans(id2)
  ]);

  if (!p1.length || !p2.length) return;

  const years = p1.map(r => r.yil);

  const aktifMetrikler = Array.from(
    document.querySelectorAll(".filter-panel input:checked")
  ).map(cb => cb.value);

  const datasets = [];

  if (aktifMetrikler.includes("gelir")) {
    datasets.push(
      {
        label: "Gelir (Şube 1)",
        data: p1.map(r => r.gelir),
        backgroundColor: "#FF8C42"
      },
      {
        label: "Gelir (Şube 2)",
        data: p2.map(r => r.gelir),
        backgroundColor: "#FFD3B6"
      }
    );
  }

  if (aktifMetrikler.includes("gider")) {
    datasets.push(
      {
        label: "Gider (Şube 1)",
        data: p1.map(r => r.gider),
        backgroundColor: "#FF5252"
      },
      {
        label: "Gider (Şube 2)",
        data: p2.map(r => r.gider),
        backgroundColor: "#FF9E9E"
      }
    );
  }

  if (aktifMetrikler.includes("kar")) {
    datasets.push(
      {
        label: "Kâr (Şube 1)",
        data: p1.map(r => r.kar),
        backgroundColor: "#4CAF50"
      },
      {
        label: "Kâr (Şube 2)",
        data: p2.map(r => r.kar),
        backgroundColor: "#A5D6A7"
      }
    );
  }

  drawCompareChart(years, datasets);
}

function drawCompareChart(labels, datasets) {
  const ctx = document
    .getElementById("yoneticiPerformansChart")
    .getContext("2d");

  if (karsilastirmaChart) karsilastirmaChart.destroy();

  karsilastirmaChart = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

let nufusKdsChart;

async function loadNufusKdsGrafik(yil) {
  try {
    const res = await fetch(`${API_URL}/nufus-kds/${yil}`);
    const data = await res.json();

    if (nufusKdsChart) nufusKdsChart.destroy();

    const labels = data.map(d => d.sube_adi + " (" + d.ilce_adi + ")");
    const values = data.map(d => Number(d.kar_per_10000));

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;

    const lowThreshold = minVal + 0.3 * range;
    const highThreshold = minVal + 0.7 * range;

    const backgroundColors = values.map(v => {
      if (v <= lowThreshold) return "#e53935";   // kırmızı → verimsiz şube
      if (v >= highThreshold) return "#4CAF50";  // yeşil → başarılı yönetim
      return "#FFB74D";                          // turuncu → yatırım önceliği
    });

    nufusKdsChart = new Chart(document.getElementById("ilceKarNufusChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Kâr / 10.000 Kişi",
          data: values,
          backgroundColor: backgroundColors    
        }]
      },
      options: {
        responsive: true,
            
        interaction: {
          mode: 'nearest',
          intersect: false
        },
      
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            intersect: false,
            mode: 'nearest',
            callbacks: {
              label: function(context) {
                const d = data[context.dataIndex];
                return `Kâr: ${d.kar.toLocaleString("tr-TR")} ₺, Nüfus: ${d.nufus.toLocaleString("tr-TR")}`;
              }
            }
          }
        },
      
        scales: {
          y: { beginAtZero: true }
        }
      }

  })

  } catch (err) {
    console.error("Nüfus-KDS grafiği yüklenemedi:", err);
  }
}


/* ============================
   EVENTLER
============================ */
document.getElementById("sube1").addEventListener("change", loadKarsilastirmaGrafik);
document.getElementById("sube2").addEventListener("change", loadKarsilastirmaGrafik);

document.querySelectorAll(".filter-panel input").forEach(cb => {
  cb.addEventListener("change", loadKarsilastirmaGrafik);
});

/* ============================
   TOP / LOW 5 GRAFİKLER (ESKİ HAL)
============================ */
let topChart = null;
let lowChart = null;

async function loadTopLow5(yil) {
  try {
    const res = await fetch(`${API_URL}/kar-siralama/${yil}`);
    const data = await res.json();

    // Önceki chartları temizle
    if (topChart) topChart.destroy();
    if (lowChart) lowChart.destroy();

    const topColors = ['#FF7F50', '#FF8C42', '#FFA500', '#FFB84D', '#FFCC66'];
    const lowColors = ['#FFD27F', '#FFE066', '#FFE680', '#FFEB99', '#FFF2B3'];

    // =====================
    // TOP 5 PIE
    // =====================
    topChart = new Chart(document.getElementById("top5Chart"), {
      type: "pie",
      data: {
        labels: data.top5.map(i => i.sube_adi),
        datasets: [{
          data: data.top5.map(i => Number(i.kar)),
          backgroundColor: topColors,
          borderWidth: 1,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: 'nearest',
          intersect: true
        },

        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 14
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const d = data.top5[context.dataIndex];
                return `KÂR: ${Number(d.kar).toLocaleString("tr-TR")} ₺`;
              }
            }
          }
        }
      }
    });

    // =====================
    // LOW 5 PIE
    // =====================
    lowChart = new Chart(document.getElementById("low5Chart"), {
      type: "pie",
      data: {
        labels: data.low5.map(i => i.sube_adi),
        datasets: [{
          data: data.low5.map(i => Number(i.kar)),
          backgroundColor: lowColors,
          borderWidth: 1,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: 'nearest',
          intersect: true
        },

        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 14
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const d = data.low5[context.dataIndex];
                return `KÂR: ${Number(d.kar).toLocaleString("tr-TR")} ₺`;
              }
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Top / Low 5 pie chart yüklenemedi:", err);
  }
}

// Yıl değişince
document.getElementById("yearSelect").addEventListener("change", (e) => {
  loadTopLow5(e.target.value);
});



/* ============================
   LOKASYONLAR HARİTA + TABLO
============================ */
let map;
let heatMap;
let markersMap = {};     // sube_id => soldaki marker
let heatMarkersMap = {}; // sube_id => sağdaki marker

function getMusteriRenk(musteri) {
  if (musteri > 180000) return "#e53935"; // kırmızı
  if (musteri < 60000)  return "#43a047"; // yeşil
  return "#1e88e5";                       // mavi
}

async function loadLokasyonlar() {
  try {
    const [lokasyonRes, performansRes] = await Promise.all([
      fetch(`${API_URL}/sube-lokasyonlar`),
      fetch(`${API_URL}/sube-yogunluk-toplam`)
    ]);

    const lokasyonData = await lokasyonRes.json();
    const performansData = await performansRes.json();

    // performansData'yı sube_id ile mapleyelim ve 4 yıllık toplamları alalım
    const performansMap = {};
    performansData.forEach(p => {
      performansMap[p.sube_id] = {
        toplam_musteri: Number(p.toplam_musteri) || 0,
        toplam_kar: Number(p.toplam_kar) || 0
      };
    });

    // Haritalar oluştur (ilk seferde)
    if (!map) {
      map = L.map("map", { scrollWheelZoom: true }).setView([38.4192, 27.1287], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
    }

    if (!heatMap) {
      heatMap = L.map("heatMap", { scrollWheelZoom: true }).setView([38.4237, 27.1428], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(heatMap);
    }

    // Önceki marker’ları temizle
    Object.values(markersMap).forEach(m => map.removeLayer(m));
    Object.values(heatMarkersMap).forEach(m => heatMap.removeLayer(m));
    markersMap = {};
    heatMarkersMap = {};

    // Tabloyu temizle
    const tbody = document.querySelector("#lokasyonTable tbody");
    tbody.innerHTML = "";

    lokasyonData.forEach(sube => {
      const perf = performansMap[sube.sube_id] || { toplam_musteri: 0, toplam_kar: 0 };
      const verim = perf.toplam_musteri > 0 
        ? (perf.toplam_kar / perf.toplam_musteri).toFixed(2) 
        : 0;


      // SOLDaki harita marker (sadece şube adı)
      const marker = L.marker([sube.enlem, sube.boylam])
        .addTo(map)
        .bindPopup(`<b>${sube.sube_adi}</b>`);
      markersMap[sube.sube_id] = marker;

      // SAĞdaki yoğunluk marker
      const heatMarker = L.circleMarker([sube.enlem, sube.boylam], {
        radius: 6,
        color: getMusteriRenk(perf.toplam_musteri),
        fillColor: getMusteriRenk(perf.toplam_musteri),
        fillOpacity: 0.75,
        weight: 1
      }).addTo(heatMap);
      heatMarker.subeData = { ...sube, ...perf };
      heatMarker.bindPopup(() => {
        const data = heatMarker.subeData;
        return `
          <div style="min-width:150px; max-width:250px; line-height:1.3;">
            <b>${data.sube_adi}</b><br>
            Toplam Müşteri: ${Number(data.toplam_musteri).toLocaleString("tr-TR")}<br>
            Toplam Kâr: ${Number(data.toplam_kar).toLocaleString("tr-TR")} ₺
          </div>
        `;
      }, { maxWidth: 250 });
      heatMarkersMap[sube.sube_id] = heatMarker;

      // Tablo satırı
      const tr = document.createElement("tr");
      tr.dataset.subeId = sube.sube_id;
      tr.innerHTML = `
      <td>${sube.sube_adi}</td>
      <td>${sube.ilce_adi || ''}</td>
      <td>${sube.gelismislik_puani}</td>
      <td>${sube.rakip_sayisi}</td>
      <td>${verim}</td>
      `;

      tbody.appendChild(tr);

      // Tüm eventler: marker veya tablo tıklayınca her iki harita ve tablo senkron
      const highlightAndZoom = () => {
        // Tablo vurgula
        document.querySelectorAll("#lokasyonTable tbody tr").forEach(r => r.classList.remove("highlight"));
        tr.classList.add("highlight");

        // Soldaki ve sağdaki haritayı zoomla
        map.setView([sube.enlem, sube.boylam], 15);
        heatMap.setView([sube.enlem, sube.boylam], 15);

        // Popup aç
        marker.openPopup();
        heatMarker.openPopup();
      };

      marker.on("click", highlightAndZoom);
      heatMarker.on("click", highlightAndZoom);
      tr.addEventListener("click", highlightAndZoom);
    });

  } catch (err) {
    console.error("Lokasyonlar yüklenemedi:", err);
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html";
});

const API_DEMO = "http://localhost:3000/subeler-demo";

/* ======================================
   DEMO ŞUBELERİ TABLOYA YÜKLE
====================================== */
async function loadSubeListesi() {

  const tbody = document.querySelector("#subeListeTablo tbody");
  const uyarı = document.getElementById("subeEkleUyari");
  tbody.innerHTML = "";

  try {

    const subeler = await fetch(API_DEMO).then(r => r.json());

    subeler.forEach(sube => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${sube.sube_id}</td>
        <td>${sube.sube_adi}</td>
        <td>${sube.ilce_adi || "-"}</td>
        <td>
            <button class="silBtn" data-id="${sube.sube_id}">
                Sil
            </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Silme işlemi dinle
    document.querySelectorAll(".silBtn").forEach(btn => {

      btn.addEventListener("click", async () => {

        const id = btn.dataset.id;

        if (!confirm("Bu şubeyi silmek istediğinize emin misiniz?")) return;

        try {

          const res = await fetch(`${API_DEMO}/${id}`, { method: "DELETE" });

          if (!res.ok) throw new Error("Şube silinemedi.");

          // MESAJ: BAŞARI İLE SİLİNDİ
          uyarı.style.color = "green";
          uyarı.innerText = "Şube başarıyla silindi!";

          loadSubeListesi();

        } catch (err) {

          uyarı.style.color = "red";
          uyarı.innerText = err.message;
        }
      });
    });

  } catch (err) {
    console.error("Demo şubeler yüklenemedi:", err);
  }
}



/* ======================================
   ŞUBE EKLEME FORMU
====================================== */
document.getElementById("subeEkleForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  const sube_adi  = document.getElementById("subeAdiInput").value.trim();
  const ilce_adi  = document.getElementById("ilceSelect").value.trim();
  const enlem     = document.getElementById("enlemInput").value.trim();
  const boylam    = document.getElementById("boylamInput").value.trim();

  const uyarı = document.getElementById("subeEkleUyari");

  if (!sube_adi || !ilce_adi || !enlem || !boylam) {
    uyarı.style.color = "red";
    uyarı.innerText = "Lütfen tüm alanları doldurun.";
    return;
  }

  try {

    const res = await fetch(`${API_URL}/subeler-yonetim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sube_adi, ilce_adi, enlem, boylam })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Şube eklenemedi.");

    uyarı.style.color = "green";
    uyarı.innerText = "Şube başarıyla eklendi!";

    e.target.reset();
    loadSubeListesi();

  }
  catch (err) {

    uyarı.style.color = "red";
    uyarı.innerText = err.message;
  }

});



/* ======================================
   İLÇELERİ DROPDOWN'A YÜKLE
====================================== */
async function loadIlceler() {
  try {

    const res = await fetch(`${API_URL}/ilceler`);
    const ilceler = await res.json();

    const ilceSelect = document.getElementById("ilceSelect");

    ilceSelect.innerHTML = "<option value=''>Seçiniz</option>";

    ilceler.forEach(ilce => {

      const opt = document.createElement("option");
      opt.value = ilce.ilce_id;
      opt.textContent = ilce.ilce_adi;

      ilceSelect.appendChild(opt);
    });

  } catch (err) {
    console.error("İlçeler yüklenemedi:", err);
  }
}


// ==============================
// Satış - Maliyet - Kâr Chart Loader
// ==============================
let smkChart;

async function loadSatisMaliyetKar(year = 2025){

  const res = await fetch(`http://localhost:3000/api/satis_maliyet_kar?year=${year}`);
  const data = await res.json();

  const labels = data.map(x => x.sube_adi);
  const satis = data.map(x => x.satis);
  const maliyet = data.map(x => x.maliyet);
  const kar = data.map(x => x.kar);

  if(smkChart){
    smkChart.destroy();
  }

  const ctx = document.getElementById("chartSatisMaliyetKar");

  smkChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Satış",
          data: satis,
          backgroundColor: "rgba(0,80,255,0.6)"
        },
        {
          label: "Maliyet",
          data: maliyet,
          backgroundColor: "rgba(255,0,0,0.6)"
        },
        {
          type:"line",
          label:"Kâr",
          data: kar,
          borderWidth: 3,
          borderColor: "black"
        }
      ]
    },
    options: {
      responsive: true,
      plugins:{
        legend: {position:"bottom"},
        title:{
          display:true,
          text: ``
        }
      },
      scales:{
        y:{
          beginAtZero:true
        }
      }
    }
  });

}

// ============================================
//  ANASAYFA BUBBLE CHART (Nüfus – Kâr – Rekabet)
// ============================================
function loadIlceBubbleChart(){

fetch("http://localhost:3000/api/ilceBubbleData")
.then(r => r.json())
.then(data => {

    const selectedYear = document.getElementById("bubbleYearSelect").value;

    const bubbleDataset = data.map(row => {

        return {
            label: row.ilce_adi,
            data: [{
                x: row[`nufus${selectedYear}`],
                y: row[`kar${selectedYear}`],
                r: (row.rakip_sayisi * 7)
            }]
        }

    });

    if(window.ilceBubbleChart){
        window.ilceBubbleChart.destroy();
    }

    const ctx = document.getElementById("ilceBubbleChartCanvas");

    window.ilceBubbleChart = new Chart(ctx, {
        type: "bubble",
        data: {
            datasets: bubbleDataset
        },
        options: {
            plugins: {
                title: {
                    display: false,
                    text: ""
                },
                tooltip:{
                    callbacks:{
                        label: (ctx)=>{
                            return `${ctx.dataset.label} | Kâr: ${ctx.raw.y.toLocaleString()} ₺ | Nüfus: ${ctx.raw.x.toLocaleString()} | Rakip: ${ctx.raw.r/7}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title:{
                        display:true,
                        text:"Nüfus"
                    }
                },
                y: {
                    title:{
                        display:true,
                        text:"Yıllık Kâr"
                    }
                }
            }
        }
    });

});
}

const title = document.getElementById("bubbleChartTitle");
const infoBox = document.getElementById("bubbleInfoTooltip");

title.addEventListener("mouseenter", () => {
  infoBox.style.display = "block";
});

title.addEventListener("mouseleave", () => {
  infoBox.style.display = "none";
});

const matrixIcon = document.getElementById("bubbleMatrixInfo");
const matrixTooltip = document.getElementById("bubbleMatrixTooltip");

/* 1. tooltip – grafik okuma */
title.addEventListener("click", () => {
  infoBox.style.display =
    infoBox.style.display === "block" ? "none" : "block";

  // diğeri açıksa kapat
  matrixTooltip.style.display = "none";
});

/* 2. tooltip – yorum rehberi */
matrixIcon.addEventListener("click", (e) => {
  e.stopPropagation(); // başlık click’ini tetiklemesin

  matrixTooltip.style.display =
    matrixTooltip.style.display === "block" ? "none" : "block";

  // diğeri açıksa kapat
  infoBox.style.display = "none";
});

/* sayfa boşluğuna tıklanınca kapansın */
document.addEventListener("click", () => {
  infoBox.style.display = "none";
  matrixTooltip.style.display = "none";
});


document.getElementById("bubbleYearSelect").addEventListener("change", loadIlceBubbleChart);
loadIlceBubbleChart();


// yıl seçimi
document.getElementById("satisMaliyetYearSelect").addEventListener("change", (e)=>{
  loadSatisMaliyetKar(e.target.value);
});

// sayfa açılışında yükle
setTimeout(()=>{
  loadSatisMaliyetKar(2025);
},500);


document.addEventListener("DOMContentLoaded", async () => {
  // İlk yüklemede gerekli verileri yükle
  await loadIlceler();
  loadSubeListesi();
  await loadSubeler();
  await loadTopLow5(2025);
  setTimeout(loadKarsilastirmaGrafik, 400);
  await loadLokasyonlar();
  loadNufusKdsGrafik(2025);

  // Nüfus yılı seçimi
  const nufusYearSelect = document.getElementById("nufusYearSelect");
  if (nufusYearSelect) {
    nufusYearSelect.addEventListener("change", e => {
      loadNufusKdsGrafik(e.target.value);
    });
  }

  /* ============================
     MENÜ & SAYFA YÖNETİMİ
  ============================ */
  const pages = document.querySelectorAll('.page');

  // LocalStorage'dan aktif sayfayı al, yoksa default 'anasayfa'
  const savedPageId = localStorage.getItem('aktifSayfa') || 'anasayfa';
  pages.forEach(p => p.style.display = 'none');
  const defaultPage = document.getElementById(savedPageId);
  if (defaultPage) defaultPage.style.display = 'block';

  // Menüde aktif class ayarla
  document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  const activeMenu = document.querySelector(`.menu-item[data-target="${savedPageId}"]`);
  if (activeMenu) activeMenu.classList.add('active');

  // Menü tıklama eventleri
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', async () => {
      const targetId = item.dataset.target;

      // Tüm sayfaları gizle
      pages.forEach(p => p.style.display = 'none');

      // Hedef sayfayı göster
      const targetPage = document.getElementById(targetId);
      if (targetPage) targetPage.style.display = 'block';

      // Menüde aktif class
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // LocalStorage’a kaydet
      localStorage.setItem('aktifSayfa', targetId);

    });
  });
});