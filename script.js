const SHEET_URL = "https://docs.google.com/spreadsheets/d/1sUQBnkYXLRtiMLMudwlBQyrTaWypVuxEEgHi5UjMXR8/gviz/tq?tqx=out:json";

let rawData = [];
let currentView = "petugas"; // default view

// Ambil data dari Google Sheets
async function loadData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2)); // parsing format JSON Google Sheets
  
  rawData = json.table.rows.map(r => r.c.map(c => c ? c.v : ""));
  renderPetugas();
}

// Rekap per Petugas
function renderPetugas() {
  currentView = "petugas";
  const content = document.getElementById("content");
  content.innerHTML = "<h2>Rekap per Petugas</h2>";

  let idxPetugas = rawData[0].indexOf("petugas");
  let petugasData = {};

  rawData.slice(1).forEach(row => {
    let petugas = row[idxPetugas] || "Tidak ada";
    if (!petugasData[petugas]) petugasData[petugas] = 0;
    petugasData[petugas]++;
  });

  Object.keys(petugasData).forEach(p => {
    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<b>${p}</b><br>Jumlah pelanggan: ${petugasData[p]}<br>
    <button onclick="renderLunas('${p}')">Lihat Rekap Tanggal Lunas</button>`;
    content.appendChild(div);
  });
}

// Rekap lunas/belum lunas per petugas
function renderLunas(petugas) {
  currentView = "lunas";
  const content = document.getElementById("content");
  content.innerHTML = `<button onclick="renderPetugas()">← Kembali</button>
    <h2>Rekap Tanggal Lunas - ${petugas}</h2>`;

  let idxPetugas = rawData[0].indexOf("petugas");
  let idxTglLunas = rawData[0].indexOf("tgl lunas");

  let lunas = 0, belum = 0;
  let pelanggan = [];

  rawData.slice(1).forEach(row => {
    if (row[idxPetugas] === petugas) {
      if (row[idxTglLunas]) lunas++; else belum++;
      pelanggan.push(row);
    }
  });

  content.innerHTML += `<div class="card">Lunas: ${lunas}</div>`;
  content.innerHTML += `<div class="card">Belum Lunas: ${belum}</div>`;

  // tampilkan detail pelanggan
  let table = "<table><tr>";
  rawData[0].forEach(h => { table += `<th>${h}</th>` });
  table += "</tr>";
  pelanggan.forEach(r => {
    table += "<tr>";
    r.forEach(c => table += `<td>${c}</td>`);
    table += "</tr>";
  });
  table += "</table>";
  content.innerHTML += table;
}

loadData();
