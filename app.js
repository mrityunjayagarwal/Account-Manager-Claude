/* ===================== Storage keys ===================== */
const LS_ACC = "gk_ledger_accounts_v1";
const LS_TXN = "gk_ledger_txns_v1";
const LS_BACKUP = "gk_ledger_lastbackup_v1";

/* ===================== Date helpers (local time, no UTC drift) ===================== */
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ymOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const todayStr = () => ymd(new Date());
const thisMonth = () => ymOf(new Date());
const parseYMD = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s) => parseYMD(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtMonth = (s) => { const [y, m] = s.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }); };
const lastDayOfMonth = (s) => { const [y, m] = s.split("-").map(Number); return ymd(new Date(y, m, 0)); };
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const total = (t) => t.splits.reduce((s, x) => s + Number(x.amount || 0), 0);

const CATS_IN = ["Client Payment", "Refund", "Loan Received", "Interest", "Other Income"];
const CATS_OUT = ["Rent", "Salary/Wages", "Supplies", "Utilities", "Loan Repayment", "Travel", "Other Expense"];

function defaultAccounts() {
  return [
    { id: "acc1", name: "Bank Account 1", type: "bank", opening: 0 },
    { id: "acc2", name: "Bank Account 2", type: "bank", opening: 0 },
    { id: "acc3", name: "Bank Account 3", type: "bank", opening: 0 },
    { id: "acc4", name: "Bank Account 4", type: "bank", opening: 0 },
    { id: "cash", name: "Cash", type: "cash", opening: 0 },
  ];
}

/* ===================== Icons (inline SVG, no network needed) ===================== */
function icon(name, size = 18) {
  const s = size;
  const map = {
    plus: `<path d="M12 5v14M5 12h14"/>`,
    x: `<path d="M18 6L6 18M6 6l12 12"/>`,
    trash: `<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6"/>`,
    pencil: `<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
    bank: `<path d="M3 21h18M4 21V9l8-6 8 6v12M9 21V13h6v8"/>`,
    cash: `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>`,
    down: `<path d="M17 7L7 17M7 8v9h9"/>`,
    up: `<path d="M7 17L17 7M9 7h8v8"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
    gear: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>`,
    chevdown: `<path d="M6 9l6 6 6-6"/>`,
    chevleft: `<path d="M15 18l-6-6 6-6"/>`,
    chevright: `<path d="M9 18l6-6-6-6"/>`,
    check: `<path d="M20 6L9 17l-5-5"/>`,
    inbox: `<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 4h13l3.5 8v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6l3.5-8z"/>`,
    file: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>`,
    download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>`,
    upload: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>`,
    printer: `<path d="M6 9V2h12v7"/><rect x="4" y="9" width="16" height="8" rx="1"/><path d="M6 17h12v5H6z"/>`,
    back: `<path d="M19 12H5M12 19l-7-7 7-7"/>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
    cloud: `<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>`,
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${map[name] || ""}</svg>`;
}
const acctIcon = (a, size = 14) => icon(a.type === "cash" ? "cash" : "bank", size);

/* ===================== State ===================== */
let accounts = defaultAccounts();
let txns = [];
let view = "ledger"; // ledger | report
let filterType = "all";
let filterAccount = "all";
let search = "";
let selectedMonth = thisMonth();
let modal = null; // { kind: 'form'|'settings', ...}
let deleteConfirmId = null;
let toastTimer = null;

function load() {
  try { const a = localStorage.getItem(LS_ACC); if (a) accounts = JSON.parse(a); } catch (e) {}
  try { const t = localStorage.getItem(LS_TXN); if (t) txns = JSON.parse(t); } catch (e) {}
}
function saveAccounts() {
  try { localStorage.setItem(LS_ACC, JSON.stringify(accounts)); }
  catch (e) { toast("Couldn't save — device storage may be full."); }
}
function saveTxns() {
  try { localStorage.setItem(LS_TXN, JSON.stringify(txns)); }
  catch (e) { toast("Couldn't save — device storage may be full."); }
}
function toast(msg) {
  clearTimeout(toastTimer);
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = "block";
  toastTimer = setTimeout(() => { el.style.display = "none"; }, 2600);
}

function balances() {
  const map = {};
  accounts.forEach((a) => (map[a.id] = Number(a.opening) || 0));
  txns.forEach((t) => t.splits.forEach((s) => {
    if (map[s.accountId] === undefined) return;
    map[s.accountId] += t.type === "received" ? Number(s.amount) : -Number(s.amount);
  }));
  return map;
}
function totalBalance(bal) { return accounts.reduce((s, a) => s + (bal[a.id] || 0), 0); }

function monthStats(m) {
  let received = 0, paid = 0;
  txns.forEach((t) => {
    if (t.date.slice(0, 7) !== m) return;
    if (t.type === "received") received += total(t); else paid += total(t);
  });
  return { received, paid, net: received - paid };
}

function filteredTxns() {
  const q = search.trim().toLowerCase();
  return txns
    .filter((t) => t.date.slice(0, 7) === selectedMonth)
    .filter((t) => (filterType === "all" ? true : t.type === filterType))
    .filter((t) => (filterAccount === "all" ? true : t.splits.some((s) => s.accountId === filterAccount)))
    .filter((t) => !q || (t.party || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q) || (t.note || "").toLowerCase().includes(q))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
}

/* ===================== Render: Ledger page ===================== */
function render() {
  const app = document.getElementById("app");
  app.innerHTML = view === "report" ? renderReportPage() : renderLedgerPage();
  if (modal) app.insertAdjacentHTML("beforeend", renderModal());
}

function renderLedgerPage() {
  const bal = balances();
  const tb = totalBalance(bal);
  const ms = monthStats(selectedMonth);
  const isCur = selectedMonth === thisMonth();
  const list = filteredTxns();

  return `
    <header class="top">
      <div>
        <p class="eyebrow">Personal Ledger</p>
        <h1 class="serif">Payments &amp; Expenses</h1>
      </div>
      <div class="headerbtns">
        <button class="iconbtn" onclick="openReport()" aria-label="Reports">${icon("file")}</button>
        <button class="iconbtn" onclick="openSettings()" aria-label="Settings">${icon("gear")}</button>
      </div>
    </header>

    <div class="card dark">
      <p class="eyebrow">Total across all accounts</p>
      <p class="balance-total serif">${inr(tb)}</p>
      <p class="sub">Live balance — not limited to the month below</p>
    </div>

    <div class="card">
      <div class="monthnav">
        <button class="iconbtn" onclick="shiftMonth(-1)" aria-label="Previous month">${icon("chevleft")}</button>
        <label class="monthlabel" for="monthPicker">${icon("calendar", 15)} <span class="serif">${fmtMonth(selectedMonth)}</span></label>
        <button class="iconbtn" onclick="shiftMonth(1)" ${isCur ? "disabled style='opacity:.3'" : ""} aria-label="Next month">${icon("chevright")}</button>
      </div>
      <input type="month" id="monthPicker" value="${selectedMonth}" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;" onchange="if(this.value){selectedMonth=this.value;render();}" />
      ${!isCur ? `<button class="jumpbtn" onclick="selectedMonth=thisMonth();render();">Jump to this month</button>` : ""}
      <div class="statgrid">
        <div class="statbox in"><p class="lbl">Received</p><p class="val">${inr(ms.received)}</p></div>
        <div class="statbox out"><p class="lbl">Paid</p><p class="val">${inr(ms.paid)}</p></div>
        <div class="statbox net"><p class="lbl">Net</p><p class="val" style="color:${ms.net >= 0 ? "var(--green)" : "var(--red)"}">${ms.net >= 0 ? "+" : "−"}${inr(Math.abs(ms.net))}</p></div>
      </div>
    </div>

    <div class="acctgrid">
      ${accounts.map((a) => `
        <div class="acctcard">
          <p class="name">${acctIcon(a)} ${esc(a.name)}</p>
          <p class="bal serif ${(bal[a.id] || 0) < 0 ? "neg" : ""}">${inr(bal[a.id])}</p>
        </div>`).join("")}
    </div>

    <div class="filterbar">
      <div class="segmented">
        ${["all", "received", "paid"].map((v) => `<button class="${v} ${filterType === v ? "active " + v : ""}" onclick="filterType='${v}';render();">${v === "all" ? "All" : v === "received" ? "Received" : "Paid"}</button>`).join("")}
      </div>
      <select class="pill" onchange="filterAccount=this.value;render();">
        <option value="all" ${filterAccount === "all" ? "selected" : ""}>All accounts</option>
        ${accounts.map((a) => `<option value="${a.id}" ${filterAccount === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}
      </select>
      <div class="searchwrap">
        ${icon("search", 14)}
        <input id="searchInput" placeholder="Search party, category, note" value="${esc(search)}" oninput="search=this.value;renderTxnListOnly();" />
      </div>
    </div>

    <div id="txnList">${renderTxnListHTML(list)}</div>

    <button class="fab" onclick="openForm()">${icon("plus", 17)} Add entry</button>
  `;
}

function renderTxnListOnly() {
  const el = document.getElementById("txnList");
  if (el) el.innerHTML = renderTxnListHTML(filteredTxns());
}

function renderTxnListHTML(list) {
  if (list.length === 0) {
    return `<div class="empty">${icon("inbox", 30)}<p style="font-weight:600;margin:8px 0 2px;">Nothing recorded in ${fmtMonth(selectedMonth)}</p><p style="font-size:13px;">Add an entry below, or pick another month above.</p></div>`;
  }
  return list.map((t) => renderTxnRow(t)).join("");
}

function renderTxnRow(t) {
  const isIn = t.type === "received";
  const amt = total(t);
  const nameOf = (id) => (accounts.find((a) => a.id === id) || {}).name || "Deleted account";
  const open = t.id === window.__openTxnId;
  const confirming = t.id === deleteConfirmId;
  return `
    <div class="txn ${t.type}">
      <div class="row" onclick="toggleTxn('${t.id}')">
        <div class="badgeicon">${icon(isIn ? "down" : "up", 15)}</div>
        <div class="mid">
          <div><span class="tag">${isIn ? "Received" : "Paid"}</span><span class="party">${esc(t.party) || (isIn ? "Unnamed source" : "Unnamed payee")}</span></div>
          <div class="meta">${fmtDate(t.date)}${t.category ? " · " + esc(t.category) : ""} · ${t.splits.length > 1 ? t.splits.length + " accounts" : esc(nameOf(t.splits[0]?.accountId))}</div>
        </div>
        <div class="amt">${isIn ? "+" : "−"}${inr(amt)}</div>
      </div>
      ${open ? `
        <div class="detail">
          ${t.splits.map((s) => `<div class="splitline"><span>${esc(nameOf(s.accountId))}</span><span style="font-weight:600;color:${isIn ? "var(--green)" : "var(--red)"}">${isIn ? "+" : "−"}${inr(s.amount)}</span></div>`).join("")}
          ${t.note ? `<p class="note">${esc(t.note)}</p>` : ""}
          <div class="actions">
            <button class="btnsm edit" onclick="event.stopPropagation();openForm('${t.id}')">${icon("pencil", 13)} Edit</button>
            ${confirming
              ? `<button class="btnsm delconfirm" onclick="event.stopPropagation();deleteTxn('${t.id}')">Confirm delete</button>
                 <button class="btnsm cancel" onclick="event.stopPropagation();deleteConfirmId=null;renderTxnListOnly();">Cancel</button>`
              : `<button class="btnsm del" onclick="event.stopPropagation();deleteConfirmId='${t.id}';renderTxnListOnly();">${icon("trash", 13)} Delete</button>`
            }
          </div>
        </div>` : ""}
    </div>`;
}

function toggleTxn(id) {
  window.__openTxnId = window.__openTxnId === id ? null : id;
  deleteConfirmId = null;
  renderTxnListOnly();
}
function deleteTxn(id) {
  txns = txns.filter((t) => t.id !== id);
  saveTxns();
  deleteConfirmId = null;
  renderTxnListOnly();
  updateHeaderNumbers();
}
function updateHeaderNumbers() { render(); } // simplest: full refresh (cheap at personal-use data sizes)

function shiftMonth(delta) {
  const [y, m] = selectedMonth.split("-").map(Number);
  selectedMonth = ymOf(new Date(y, m - 1 + delta, 1));
  render();
}

/* ===================== Transaction form modal ===================== */
function openForm(editId) {
  const existing = editId ? txns.find((t) => t.id === editId) : null;
  const isCur = selectedMonth === thisMonth();
  const defDate = existing ? existing.date : (isCur ? todayStr() : lastDayOfMonth(selectedMonth));
  modal = {
    kind: "form",
    editId: editId || null,
    type: existing?.type || "received",
    date: existing?.date || defDate,
    party: existing?.party || "",
    category: existing?.category || "",
    note: existing?.note || "",
    splits: existing?.splits?.length
      ? existing.splits.map((s) => ({ accountId: s.accountId, amount: String(s.amount) }))
      : [{ accountId: accounts[0]?.id, amount: "" }],
  };
  render();
}
function closeModal() { modal = null; render(); }

function formSum() { return modal.splits.reduce((s, x) => s + (Number(x.amount) || 0), 0); }
function formValid() {
  return formSum() > 0 && modal.splits.every((s) => s.accountId && Number(s.amount) > 0) && !!modal.date;
}
function setFormType(t) { modal.type = t; refreshModal(); }
function setFormField(field, value) { modal[field] = value; } // no re-render needed; DOM already shows typed value
function updateSplitField(i, field, value) {
  modal.splits[i][field] = value;
  const sumEl = document.getElementById("formSum");
  if (sumEl) sumEl.textContent = (modal.type === "received" ? "+" : "−") + inr(formSum());
  const btn = document.getElementById("saveBtnLabel");
  if (btn) btn.textContent = modal.editId ? "Save changes" : (modal.type === "received" ? `Record ${inr(formSum())} received` : `Record ${inr(formSum())} paid`);
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) saveBtn.disabled = !formValid();
  const hint = document.getElementById("formHint");
  if (hint) hint.style.display = formValid() ? "none" : "block";
}
function addSplitRow() {
  const used = new Set(modal.splits.map((s) => s.accountId));
  const next = accounts.find((a) => !used.has(a.id)) || accounts[0];
  modal.splits.push({ accountId: next?.id, amount: "" });
  refreshModal();
}
function removeSplitRow(i) {
  if (modal.splits.length > 1) modal.splits.splice(i, 1);
  refreshModal();
}
function refreshModal() { render(); }

function saveForm() {
  if (!formValid()) return;
  const txn = {
    id: modal.editId || uid(),
    createdAt: modal.editId ? (txns.find((t) => t.id === modal.editId)?.createdAt || Date.now()) : Date.now(),
    type: modal.type,
    date: modal.date,
    party: modal.party.trim(),
    category: modal.category.trim(),
    note: modal.note.trim(),
    splits: modal.splits.map((s) => ({ accountId: s.accountId, amount: Number(s.amount) })),
  };
  const exists = txns.some((t) => t.id === txn.id);
  txns = exists ? txns.map((t) => (t.id === txn.id ? txn : t)) : [...txns, txn];
  saveTxns();
  selectedMonth = txn.date.slice(0, 7);
  modal = null;
  render();
}

function openSettings() {
  modal = { kind: "settings", accounts: accounts.map((a) => ({ ...a, opening: String(a.opening) })) };
  render();
}
function setSettingField(i, field, value) { modal.accounts[i][field] = value; }
function addSettingAccount() {
  modal.accounts.push({ id: uid(), name: "New account", type: "bank", opening: "0" });
  refreshModal();
}
function removeSettingAccount(i) {
  if (modal.accounts.length <= 1) return;
  const name = modal.accounts[i].name || "this account";
  if (!confirm(`Remove "${name}"? Its past entries will stay in history (shown as "Deleted account"), but its balance will drop out of your totals.`)) return;
  modal.accounts.splice(i, 1);
  refreshModal();
}
function saveSettings() {
  accounts = modal.accounts.map((a) => ({ ...a, name: a.name.trim() || "Untitled", opening: Number(a.opening) || 0 }));
  saveAccounts();
  modal = null;
  render();
}

/* ===================== Backup / Restore ===================== */
function backupPayload() {
  return JSON.stringify({ app: "personal-ledger", version: 1, exportedAt: new Date().toISOString(), accounts, txns }, null, 2);
}
async function backupNow() {
  const data = backupPayload();
  const filename = `ledger-backup-${todayStr()}.json`;
  const file = new File([data], filename, { type: "application/json" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Ledger backup" });
      markBackedUp();
      return;
    }
  } catch (e) { /* fall through to download */ }
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  markBackedUp();
  toast("Backup downloaded — save it into Google Drive from your Files/Downloads.");
}
function markBackedUp() {
  try { localStorage.setItem(LS_BACKUP, new Date().toISOString()); } catch (e) {}
  refreshModal();
}
function triggerImport() { document.getElementById("importInput").click(); }
function handleImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.accounts || !data.txns) throw new Error("bad file");
      if (!confirm(`Restore backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleString("en-IN") : "unknown date"}? This replaces everything currently on this device.`)) return;
      accounts = data.accounts; txns = data.txns;
      saveAccounts(); saveTxns();
      modal = null;
      render();
      toast("Backup restored.");
    } catch (e) {
      toast("That file doesn't look like a valid ledger backup.");
    }
    input.value = "";
  };
  reader.readAsText(file);
}

/* ===================== Modal render ===================== */
function renderModal() {
  if (!modal) return "";
  if (modal.kind === "settings") return renderSettingsModal();
  return renderFormModal();
}

function renderFormModal() {
  const isIn = modal.type === "received";
  const cats = isIn ? CATS_IN : CATS_OUT;
  const sum = formSum();
  const valid = formValid();
  return `
  <div class="modal-backdrop" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modalhead ${isIn ? "received" : "paid"}">
        <h2>${icon(isIn ? "down" : "up", 17)} ${modal.editId ? "Edit " : ""}${isIn ? "Money received" : "Money paid"}</h2>
        <button onclick="closeModal()">${icon("x", 15)}</button>
      </div>
      <div class="modalbody">
        <div class="typetoggle">
          <button class="${isIn ? "active received" : ""}" onclick="setFormType('received')">${icon("down", 14)} I received</button>
          <button class="${!isIn ? "active paid" : ""}" onclick="setFormType('paid')">${icon("up", 14)} I paid</button>
        </div>
        <div class="grid2">
          <div class="field"><label>Date</label><input type="date" value="${modal.date}" onchange="setFormField('date', this.value)"/></div>
          <div class="field"><label>${isIn ? "Received from" : "Paid to"}</label><input type="text" placeholder="Party name" value="${esc(modal.party)}" oninput="setFormField('party', this.value)"/></div>
        </div>
        <div class="field">
          <label>Category</label>
          <input list="catlist" value="${esc(modal.category)}" placeholder="${isIn ? "e.g. Client Payment" : "e.g. Supplies"}" oninput="setFormField('category', this.value)"/>
          <datalist id="catlist">${cats.map((c) => `<option value="${c}"></option>`).join("")}</datalist>
        </div>
        <div>
          <div class="sumline">
            <span class="lbl">${isIn ? "Which accounts received it" : "Which accounts it went from"}</span>
            <span class="val" id="formSum" style="color:${isIn ? "var(--green)" : "var(--red)"}">${isIn ? "+" : "−"}${inr(sum)}</span>
          </div>
          ${modal.splits.map((s, i) => `
            <div class="splitrow">
              <select onchange="updateSplitField(${i},'accountId',this.value)">
                ${accounts.map((a) => `<option value="${a.id}" ${a.id === s.accountId ? "selected" : ""}>${esc(a.name)}</option>`).join("")}
              </select>
              <div class="splitamt"><span>₹</span><input type="number" min="0" inputmode="decimal" placeholder="0" value="${esc(s.amount)}" oninput="updateSplitField(${i},'amount',this.value)"/></div>
              <button class="rmbtn" ${modal.splits.length === 1 ? "disabled style='opacity:.25'" : ""} onclick="removeSplitRow(${i})">${icon("trash", 15)}</button>
            </div>`).join("")}
          ${modal.splits.length < accounts.length ? `<button class="addsplit" onclick="addSplitRow()">${icon("plus", 14)} Split across another account</button>` : ""}
        </div>
        <div class="field"><label>Note (optional)</label><textarea rows="2" oninput="setFormField('note', this.value)">${esc(modal.note)}</textarea></div>
      </div>
      <div class="modalfoot">
        <button class="savebtn ${isIn ? "received" : "paid"}" id="saveBtn" ${valid ? "" : "disabled"} onclick="saveForm()">
          ${icon("check", 16)} <span id="saveBtnLabel">${modal.editId ? "Save changes" : (isIn ? `Record ${inr(sum)} received` : `Record ${inr(sum)} paid`)}</span>
        </button>
        <p class="hint" id="formHint" style="${valid ? "display:none" : ""}">Enter an amount above zero for each account listed</p>
      </div>
    </div>
  </div>`;
}

function renderSettingsModal() {
  const lastBackup = (() => { try { return localStorage.getItem(LS_BACKUP); } catch (e) { return null; } })();
  return `
  <div class="modal-backdrop" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modalhead neutral">
        <h2>Settings</h2>
        <button onclick="closeModal()">${icon("x", 15)}</button>
      </div>
      <div class="modalbody">
        <div>
          <p style="font-size:13px;opacity:.55;margin:0 0 10px;">Rename your accounts, set an opening balance if you're starting mid-way, or add/remove accounts entirely.</p>
          ${modal.accounts.map((a, i) => `
            <div class="settingrow">
              <select onchange="setSettingField(${i},'type',this.value)" style="width:64px;padding:9px 4px;border-radius:10px;border:1px solid var(--navy-faint);background:#fff;font-size:18px;text-align:center;flex-shrink:0;">
                <option value="bank" ${a.type === "bank" ? "selected" : ""}>🏦</option>
                <option value="cash" ${a.type === "cash" ? "selected" : ""}>💵</option>
              </select>
              <input type="text" value="${esc(a.name)}" oninput="setSettingField(${i},'name',this.value)"/>
              <div class="amt"><span>₹</span><input type="number" value="${esc(a.opening)}" oninput="setSettingField(${i},'opening',this.value)"/></div>
              <button class="rmbtn" ${modal.accounts.length <= 1 ? "disabled style='opacity:.25'" : ""} onclick="removeSettingAccount(${i})">${icon("trash", 15)}</button>
            </div>`).join("")}
          <button class="addsplit" style="margin:4px 0 14px;" onclick="addSettingAccount()">${icon("plus", 14)} Add another account</button>
          <button class="savebtn neutral" onclick="saveSettings()">${icon("check", 15)} Save accounts</button>
        </div>

        <hr class="divider"/>

        <div>
          <p style="font-weight:700;margin:0 0 4px;" class="serif">Backup &amp; restore</p>
          <p style="font-size:13px;opacity:.55;margin:0 0 12px;">
            Everything here lives only on this device. Back up regularly and save the file into your Google Drive so you don't lose it.
          </p>
          <button class="backupbtn primary" onclick="backupNow()">${icon("cloud", 16)} Back up now</button>
          <p class="filehint">${lastBackup ? "Last backup: " + new Date(lastBackup).toLocaleString("en-IN") : "No backup taken yet"}</p>
          <button class="backupbtn" onclick="triggerImport()">${icon("upload", 16)} Restore from a backup file</button>
          <input type="file" id="importInput" accept="application/json" style="display:none" onchange="handleImportFile(this)"/>
          <p class="filehint">On Android, "Back up now" can save straight into Drive via the share sheet. On iPhone, it downloads a file — use the Files app's "Save to Drive" to move it in, or open it from Drive when restoring.</p>
        </div>
      </div>
    </div>
  </div>`;
}

/* ===================== Reports ===================== */
const PRESETS = [
  { id: "allTime", label: "All time" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "thisQuarter", label: "This quarter" },
  { id: "fy", label: "This FY (Apr–Mar)" },
  { id: "custom", label: "Custom range" },
];
let reportPreset = "thisMonth";
let reportFrom, reportTo;
let reportParty = ""; // empty = all people; otherwise a search term (partial match)
let showPartySuggestions = false;
let reportCategory = ""; // empty = all categories; otherwise a search term (partial match)
let showCategorySuggestions = false;
let selectedReportAccounts = new Set(); // ids of accounts included in the statement
function rangeFor(preset) {
  const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
  if (preset === "allTime") {
    if (txns.length === 0) return [ymd(new Date(y, m, 1)), ymd(new Date(y, m + 1, 0))];
    const dates = txns.map((t) => t.date).sort();
    return [dates[0], todayStr()];
  }
  if (preset === "thisMonth") return [ymd(new Date(y, m, 1)), ymd(new Date(y, m + 1, 0))];
  if (preset === "lastMonth") return [ymd(new Date(y, m - 1, 1)), ymd(new Date(y, m, 0))];
  if (preset === "thisQuarter") { const qs = Math.floor(m / 3) * 3; return [ymd(new Date(y, qs, 1)), ymd(new Date(y, qs + 3, 0))]; }
  if (preset === "fy") { const fyStart = m >= 3 ? y : y - 1; return [ymd(new Date(fyStart, 3, 1)), ymd(new Date(fyStart + 1, 2, 31))]; }
  return [ymd(new Date(y, m, 1)), ymd(new Date(y, m + 1, 0))];
}
function openReport() {
  view = "report";
  reportPreset = "thisMonth";
  reportParty = "";
  reportCategory = "";
  showPartySuggestions = false;
  showCategorySuggestions = false;
  selectedReportAccounts = new Set(accounts.map((a) => a.id));
  [reportFrom, reportTo] = rangeFor("thisMonth");
  render();
}
function toggleReportAccount(id) {
  if (selectedReportAccounts.has(id)) selectedReportAccounts.delete(id);
  else selectedReportAccounts.add(id);
  render();
}
function toggleAllReportAccounts() {
  const allSelected = accounts.every((a) => selectedReportAccounts.has(a.id));
  selectedReportAccounts = allSelected ? new Set() : new Set(accounts.map((a) => a.id));
  render();
}
function pickPreset(p) { reportPreset = p; if (p !== "custom") [reportFrom, reportTo] = rangeFor(p); render(); }
function setReportFrom(v) { reportFrom = v; reportPreset = "custom"; render(); }
function setReportTo(v) { reportTo = v; reportPreset = "custom"; render(); }
function setReportParty(v) { reportParty = v; renderReportResultsOnly(); renderPartySuggestions(); }
function clearReportParty() {
  reportParty = "";
  const input = document.getElementById("partySearch");
  if (input) input.value = "";
  render();
}
function selectParty(name) {
  reportParty = name;
  const input = document.getElementById("partySearch");
  if (input) input.value = name;
  showPartySuggestions = false;
  render();
}
function focusPartySearch() { showPartySuggestions = true; renderPartySuggestions(); }
function blurPartySearchDelayed() { setTimeout(() => { showPartySuggestions = false; renderPartySuggestions(); }, 180); }
function renderPartySuggestions() {
  const el = document.getElementById("partySuggestions");
  if (!el) return;
  if (!showPartySuggestions) { el.style.display = "none"; el.innerHTML = ""; return; }
  const q = reportParty.trim().toLowerCase();
  const matches = allParties().filter((p) => !q || p.toLowerCase().includes(q)).slice(0, 8);
  if (matches.length === 0) { el.style.display = "none"; el.innerHTML = ""; return; }
  el.style.display = "block";
  el.innerHTML = matches.map((p) => `<div class="suggestitem" onclick="selectParty('${esc(p).replace(/'/g, "\\'")}')">${esc(p)}</div>`).join("");
}

function setReportCategory(v) { reportCategory = v; renderReportResultsOnly(); renderCategorySuggestions(); }
function clearReportCategory() {
  reportCategory = "";
  const input = document.getElementById("categorySearch");
  if (input) input.value = "";
  render();
}
function selectCategory(name) {
  reportCategory = name;
  const input = document.getElementById("categorySearch");
  if (input) input.value = name;
  showCategorySuggestions = false;
  render();
}
function focusCategorySearch() { showCategorySuggestions = true; renderCategorySuggestions(); }
function blurCategorySearchDelayed() { setTimeout(() => { showCategorySuggestions = false; renderCategorySuggestions(); }, 180); }
function renderCategorySuggestions() {
  const el = document.getElementById("categorySuggestions");
  if (!el) return;
  if (!showCategorySuggestions) { el.style.display = "none"; el.innerHTML = ""; return; }
  const q = reportCategory.trim().toLowerCase();
  const matches = allCategories().filter((c) => !q || c.toLowerCase().includes(q)).slice(0, 8);
  if (matches.length === 0) { el.style.display = "none"; el.innerHTML = ""; return; }
  el.style.display = "block";
  el.innerHTML = matches.map((c) => `<div class="suggestitem" onclick="selectCategory('${esc(c).replace(/'/g, "\\'")}')">${esc(c)}</div>`).join("");
}

function backToLedger() { view = "ledger"; render(); }

function allParties() {
  const set = new Set();
  txns.forEach((t) => { if (t.party && t.party.trim()) set.add(t.party.trim()); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function allCategories() {
  const set = new Set();
  txns.forEach((t) => set.add(t.category && t.category.trim() ? t.category.trim() : "Uncategorised"));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function matchedAmount(t) {
  return t.splits.filter((s) => selectedReportAccounts.has(s.accountId)).reduce((sum, s) => sum + Number(s.amount || 0), 0);
}

function reportRows() {
  const q = reportParty.trim().toLowerCase();
  const c = reportCategory.trim().toLowerCase();
  return txns.filter((t) => t.date >= reportFrom && t.date <= reportTo)
    .filter((t) => !q || (t.party || "").toLowerCase().includes(q))
    .filter((t) => !c || (t.category && t.category.trim() ? t.category : "Uncategorised").toLowerCase().includes(c))
    .filter((t) => t.splits.some((s) => selectedReportAccounts.has(s.accountId)))
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.createdAt - b.createdAt));
}

function renderReportResultsOnly() {
  const el = document.getElementById("reportResults");
  if (el) el.innerHTML = renderReportResultsHTML();
}

function renderReportPage() {
  const parties = allParties();
  const categories = allCategories();
  return `
    <header class="top no-print">
      <div>
        <button class="backlink" onclick="backToLedger()">${icon("back", 15)} Back to ledger</button>
        <h1 class="serif">Reports</h1>
      </div>
      <div class="headerbtns">
        <button class="iconbtn" onclick="downloadCSV()" aria-label="Download CSV" style="width:auto;padding:0 12px;background:var(--navy);color:#fff;gap:6px;display:flex;">${icon("download", 15)}<span style="font-size:13px;font-weight:600;">CSV</span></button>
        <button class="iconbtn" onclick="window.print()" aria-label="Print">${icon("printer", 16)}</button>
      </div>
    </header>

    <div class="card no-print">
      <div class="presetbar">
        ${PRESETS.map((p) => `<button class="presetbtn ${reportPreset === p.id ? "active" : ""}" onclick="pickPreset('${p.id}')">${p.label}</button>`).join("")}
      </div>
      <div class="grid2">
        <div class="field"><label>From</label><input type="date" value="${reportFrom}" max="${reportTo}" onchange="setReportFrom(this.value)"/></div>
        <div class="field"><label>To</label><input type="date" value="${reportTo}" min="${reportFrom}" onchange="setReportTo(this.value)"/></div>
      </div>
      ${parties.length > 0 ? `
      <div class="field" style="margin-top:10px;">
        <label>Search a person</label>
        <div class="searchwrap" style="width:100%;">
          ${icon("search", 14)}
          <input id="partySearch" placeholder="Type a name to filter, e.g. Ramesh" autocomplete="off"
            value="${esc(reportParty)}" oninput="setReportParty(this.value)"
            onfocus="focusPartySearch()" onblur="blurPartySearchDelayed()"
            style="${reportParty ? "padding-right:30px;" : ""}" />
          ${reportParty ? `<button onclick="clearReportParty()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--navy-dim);cursor:pointer;padding:4px;display:flex;">${icon("x", 14)}</button>` : ""}
          <div id="partySuggestions" class="suggestlist"></div>
        </div>
      </div>
      ` : ""}
      ${categories.length > 0 ? `
      <div class="field" style="margin-top:10px;">
        <label>Search a category</label>
        <div class="searchwrap" style="width:100%;">
          ${icon("search", 14)}
          <input id="categorySearch" placeholder="Type a category, e.g. Rent" autocomplete="off"
            value="${esc(reportCategory)}" oninput="setReportCategory(this.value)"
            onfocus="focusCategorySearch()" onblur="blurCategorySearchDelayed()"
            style="${reportCategory ? "padding-right:30px;" : ""}" />
          ${reportCategory ? `<button onclick="clearReportCategory()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--navy-dim);cursor:pointer;padding:4px;display:flex;">${icon("x", 14)}</button>` : ""}
          <div id="categorySuggestions" class="suggestlist"></div>
        </div>
      </div>
      ` : ""}
      <div class="field" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <label style="margin:0;">Accounts included</label>
          <button onclick="toggleAllReportAccounts()" style="border:none;background:none;color:#9A8449;font-weight:600;font-size:12px;cursor:pointer;padding:0;">
            ${accounts.every((a) => selectedReportAccounts.has(a.id)) ? "Clear all" : "Select all"}
          </button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${accounts.map((a) => `
            <button onclick="toggleReportAccount('${a.id}')"
              style="display:flex;align-items:center;gap:5px;border:1px solid var(--navy-faint);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer;background:${selectedReportAccounts.has(a.id) ? "var(--navy)" : "#fff"};color:${selectedReportAccounts.has(a.id) ? "#fff" : "var(--navy-dim)"};">
              ${selectedReportAccounts.has(a.id) ? icon("check", 12) : ""}${esc(a.name)}
            </button>`).join("")}
        </div>
      </div>
    </div>

    <div id="reportResults">${renderReportResultsHTML()}</div>
  `;
}

function renderReportResultsHTML() {
  const rows = reportRows();
  const received = rows.filter((t) => t.type === "received").reduce((s, t) => s + matchedAmount(t), 0);
  const paid = rows.filter((t) => t.type === "paid").reduce((s, t) => s + matchedAmount(t), 0);
  const bal = balances();
  const shownAccounts = accounts.filter((a) => selectedReportAccounts.has(a.id));

  const byAccount = {};
  shownAccounts.forEach((a) => (byAccount[a.id] = { in: 0, out: 0 }));
  rows.forEach((t) => t.splits.forEach((s) => {
    if (!byAccount[s.accountId]) return;
    if (t.type === "received") byAccount[s.accountId].in += Number(s.amount); else byAccount[s.accountId].out += Number(s.amount);
  }));

  const catMap = {};
  rows.forEach((t) => { const amt = matchedAmount(t); if (!amt) return; const k = (t.category || "Uncategorised") + "||" + t.type; catMap[k] = (catMap[k] || 0) + amt; });
  const byCategory = Object.entries(catMap).map(([k, v]) => { const [name, type] = k.split("||"); return { name, type, amount: v }; }).sort((a, b) => b.amount - a.amount);

  const monthMap = {};
  rows.forEach((t) => { const amt = matchedAmount(t); if (!amt) return; const k = t.date.slice(0, 7); if (!monthMap[k]) monthMap[k] = { in: 0, out: 0 }; if (t.type === "received") monthMap[k].in += amt; else monthMap[k].out += amt; });
  const byMonth = Object.entries(monthMap).sort((a, b) => (a[0] > b[0] ? 1 : -1));

  const nameOf = (id) => (accounts.find((a) => a.id === id) || {}).name || "Deleted account";

  if (shownAccounts.length === 0) {
    return `<div class="empty">${icon("inbox", 30)}<p style="font-weight:600;margin:8px 0 2px;">No accounts selected</p><p style="font-size:13px;">Pick at least one account above to see a statement.</p></div>`;
  }

  const filterBits = [];
  if (reportParty) filterBits.push(esc(reportParty));
  if (reportCategory) filterBits.push(esc(reportCategory));
  const heading = filterBits.length ? filterBits.join(" · ") : "";

  return `
    <div style="margin-bottom:16px;">
      <p class="eyebrow" style="color:#9A8449;">${heading ? "Statement for" : "Statement period"}</p>
      ${heading ? `<p class="serif" style="font-size:22px;font-weight:700;margin:2px 0 0;">${heading}</p>` : ""}
      <p class="serif" style="font-size:${heading ? "15px" : "20px"};font-weight:${heading ? "600" : "700"};margin:2px 0;${heading ? "opacity:.5;" : ""}">${fmtDate(reportFrom)} — ${fmtDate(reportTo)}</p>
      <p style="font-size:13px;opacity:.45;margin:0;">${rows.length} ${rows.length === 1 ? "entry" : "entries"}${shownAccounts.length < accounts.length ? " · " + shownAccounts.length + " of " + accounts.length + " accounts" : ""}</p>
    </div>

    <div class="statgrid" style="margin-bottom:20px;">
      <div class="statbox in" style="padding:12px;"><p class="lbl">Received</p><p class="val" style="font-size:17px;">${inr(received)}</p></div>
      <div class="statbox out" style="padding:12px;"><p class="lbl">Paid</p><p class="val" style="font-size:17px;">${inr(paid)}</p></div>
      <div class="statbox" style="padding:12px;background:var(--navy);"><p class="lbl" style="color:var(--gold);">Net</p><p class="val" style="font-size:17px;color:#fff;">${received - paid >= 0 ? "+" : "−"}${inr(Math.abs(received - paid))}</p></div>
    </div>

    <div class="card">
      <h2 class="serif" style="font-size:17px;margin:0 0 10px;">Account-wise movement</h2>
      <table class="rpt"><thead><tr><th>Account</th><th class="r">In</th><th class="r">Out</th><th class="r">Net</th><th class="r">Balance now</th></tr></thead>
      <tbody>
        ${shownAccounts.map((a) => { const d = byAccount[a.id] || { in: 0, out: 0 }; const net = d.in - d.out;
          return `<tr><td style="font-weight:600;">${esc(a.name)}</td><td class="r" style="color:var(--green)">${d.in ? inr(d.in) : "—"}</td><td class="r" style="color:var(--red)">${d.out ? inr(d.out) : "—"}</td><td class="r" style="font-weight:700;color:${net >= 0 ? "var(--green)" : "var(--red)"}">${net === 0 ? "—" : (net > 0 ? "+" : "−") + inr(Math.abs(net))}</td><td class="r" style="opacity:.6;">${inr(bal[a.id])}</td></tr>`;
        }).join("")}
      </tbody></table>
    </div>

    ${byMonth.length > 1 ? `
    <div class="card">
      <h2 class="serif" style="font-size:17px;margin:0 0 10px;">Month by month</h2>
      <table class="rpt"><thead><tr><th>Month</th><th class="r">Received</th><th class="r">Paid</th><th class="r">Net</th></tr></thead>
      <tbody>
        ${byMonth.map(([k, v]) => { const net = v.in - v.out;
          return `<tr><td style="font-weight:600;">${fmtMonth(k)}</td><td class="r" style="color:var(--green)">${inr(v.in)}</td><td class="r" style="color:var(--red)">${inr(v.out)}</td><td class="r" style="font-weight:700;color:${net >= 0 ? "var(--green)" : "var(--red)"}">${net >= 0 ? "+" : "−"}${inr(Math.abs(net))}</td></tr>`;
        }).join("")}
      </tbody></table>
    </div>` : ""}

    ${byCategory.length > 0 ? `
    <div class="card">
      <h2 class="serif" style="font-size:17px;margin:0 0 10px;">By category</h2>
      ${byCategory.map((c) => `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:4px 0;">
          <div><span class="catbadge ${c.type === "received" ? "in" : "out"}">${c.type === "received" ? "In" : "Out"}</span><span style="font-weight:600;">${esc(c.name)}</span></div>
          <span style="font-weight:700;color:${c.type === "received" ? "var(--green)" : "var(--red)"}">${c.type === "received" ? "+" : "−"}${inr(c.amount)}</span>
        </div>`).join("")}
    </div>` : ""}

    <div class="card">
      <h2 class="serif" style="font-size:17px;margin:0 0 10px;">All entries</h2>
      ${rows.length === 0 ? `<p style="text-align:center;padding:20px 0;opacity:.4;font-size:13px;">No entries in this period.</p>` :
        rows.map((t) => `
          <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--navy-faint);">
            <span class="catbadge ${t.type === "received" ? "in" : "out"}" style="margin-top:2px;">${t.type === "received" ? "In" : "Out"}</span>
            <div style="flex:1;min-width:0;">
              <p style="font-size:13px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(t.party) || "—"}</p>
              <p style="font-size:11px;opacity:.45;margin:2px 0 0;">${fmtDate(t.date)}${t.category ? " · " + esc(t.category) : ""} · ${t.splits.map((s) => esc(nameOf(s.accountId)) + " " + inr(s.amount)).join(" + ")}</p>
            </div>
            <p style="font-size:13px;font-weight:700;margin:0;flex-shrink:0;color:${t.type === "received" ? "var(--green)" : "var(--red)"}">${t.type === "received" ? "+" : "−"}${inr(matchedAmount(t))}</p>
          </div>`).join("")}
    </div>
  `;
}

function downloadCSV() {
  const rows = reportRows();
  const nameOf = (id) => (accounts.find((a) => a.id === id) || {}).name || "Deleted account";
  const csvEsc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [["Date", "Type", "Party", "Category", "Account", "Amount", "Entry total (selected accounts)", "Note"].map(csvEsc).join(",")];
  let received = 0, paid = 0;
  rows.forEach((t) => {
    const tot = matchedAmount(t);
    if (t.type === "received") received += tot; else paid += tot;
    t.splits.filter((s) => selectedReportAccounts.has(s.accountId)).forEach((s) => {
      lines.push([t.date, t.type === "received" ? "Received" : "Paid", t.party, t.category || "Uncategorised", nameOf(s.accountId), Number(s.amount), tot, t.note].map(csvEsc).join(","));
    });
  });
  lines.push("");
  lines.push([csvEsc("Total received"), csvEsc(received)].join(","));
  lines.push([csvEsc("Total paid"), csvEsc(paid)].join(","));
  lines.push([csvEsc("Net"), csvEsc(received - paid)].join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const bits = [];
  if (reportParty) bits.push(reportParty.trim());
  if (reportCategory) bits.push(reportCategory.trim());
  const suffix = bits.length ? "-" + bits.join("-").replace(/[^a-z0-9]+/gi, "-").toLowerCase() : "";
  a.href = url; a.download = `ledger-${reportFrom}-to-${reportTo}${suffix}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ===================== Boot ===================== */
window.__openTxnId = null;
load();
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
