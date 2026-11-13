import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// =========================================================================
// 1. PASTE YOUR FIREBASE PROJECT CONFIG HERE
// =========================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db = null;
let auth = null;
let isAdmin = false;
let allFamilies = [];

// Sample data for instant local preview before Firebase keys are added
let demoFamilies = [
  {
    id: "demo-1",
    houseNumber: "No. 12",
    headOfHousehold: "Haji Zulkifli bin Osman",
    householdMembers: ["Hajah Aminah", "Farid Zulkifli", "Nurul Huda"],
    address: "Jalan SS 4A/4, Kelana Jaya, 47301 Petaling Jaya",
    numDependents: 3,
    phoneNumber: "0123456789"
  },
  {
    id: "demo-2",
    houseNumber: "No. 27",
    headOfHousehold: "Encik Hafizuddin bin Razak",
    householdMembers: ["Puan Mariam", "Aiman Hafiz"],
    address: "Jalan SS 4A/8, Kelana Jaya, 47301 Petaling Jaya",
    numDependents: 2,
    phoneNumber: "0198765432"
  }
];

// DOM References
const tableBody = document.getElementById("familyTableBody");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const adminEditorPanel = document.getElementById("adminEditorPanel");
const adminActionHeader = document.getElementById("adminActionHeader");
const roleBadge = document.getElementById("roleBadge");
const authTriggerBtn = document.getElementById("authTriggerBtn");
const dbConnectionStatus = document.getElementById("dbConnectionStatus");
const recordCountStatus = document.getElementById("recordCountStatus");
const familyForm = document.getElementById("familyForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formLegend = document.getElementById("formLegend");

// =========================================================================
// 2. INITIALIZE FIREBASE OR LOCAL DEMO MODE
// =========================================================================
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);

  dbConnectionStatus.textContent = "🟢 Connected: Firebase Realtime DB";

  onAuthStateChanged(auth, (user) => {
    setAdminState(Boolean(user));
  });

  const familiesRef = ref(db, "families");
  onValue(familiesRef, (snapshot) => {
    const data = snapshot.val() || {};
    allFamilies = Object.entries(data).map(([id, val]) => ({
      id,
      ...val
    }));
    renderTable();
  }, (error) => {
    dbConnectionStatus.textContent = "🔴 DB Error: " + error.message;
  });
} else {
  dbConnectionStatus.textContent = "🟡 Local Preview Mode (Masukkan Firebase Config di app.js)";
  allFamilies = [...demoFamilies];
  renderTable();
}

// =========================================================================
// 3. ROLE & AUTHENTICATION HANDLING
// =========================================================================
function setAdminState(loggedIn) {
  isAdmin = loggedIn;
  if (isAdmin) {
    roleBadge.textContent = "AJK / Admin Masjid (Full Access)";
    roleBadge.className = "badge-admin";
    authTriggerBtn.textContent = "🚪 Logout Admin";
    adminEditorPanel.classList.remove("hidden");
    adminActionHeader.classList.remove("hidden");
  } else {
    roleBadge.textContent = "Jemaah / Penduduk (Read-Only)";
    roleBadge.className = "badge-goer";
    authTriggerBtn.textContent = "🔑 Admin Login";
    adminEditorPanel.classList.add("hidden");
    adminActionHeader.classList.add("hidden");
    resetForm();
  }
  renderTable();
}

authTriggerBtn.addEventListener("click", async () => {
  if (isAdmin) {
    if (isConfigured) {
      await signOut(auth);
    } else {
      setAdminState(false);
    }
  } else {
    document.getElementById("loginModal").classList.remove("hidden");
  }
});

window.closeLoginModal = () => {
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("loginErrorMsg").classList.add("hidden");
};

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const errorEl = document.getElementById("loginErrorMsg");

  if (!isConfigured) {
    // Allow instant demo testing before Firebase is wired
    setAdminState(true);
    closeLoginModal();
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeLoginModal();
  } catch (err) {
    errorEl.textContent = "Log masuk gagal: " + err.message;
    errorEl.classList.remove("hidden");
  }
});

// =========================================================================
// 4. CRUD OPERATIONS (ADD / EDIT / DELETE)
// =========================================================================
familyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isAdmin) return;

  const editId = document.getElementById("editFamilyId").value;
  const membersRaw = document.getElementById("householdMembers").value;
  const membersArray = membersRaw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const payload = {
    headOfHousehold: document.getElementById("headOfHousehold").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    houseNumber: document.getElementById("houseNumber").value.trim(),
    numDependents: Number(document.getElementById("numDependents").value) || 0,
    address: document.getElementById("address").value.trim(),
    householdMembers: membersArray,
    updatedAt: Date.now()
  };

  if (!isConfigured) {
    if (editId) {
      allFamilies = allFamilies.map((f) => (f.id === editId ? { id: editId, ...payload } : f));
    } else {
      allFamilies.unshift({ id: "demo-" + Date.now(), ...payload });
    }
    renderTable();
    resetForm();
    return;
  }

  if (editId) {
    await update(ref(db, `families/${editId}`), payload);
  } else {
    const newRef = push(ref(db, "families"));
    await set(newRef, payload);
  }

  resetForm();
});

window.startEditFamily = (id) => {
  const fam = allFamilies.find((item) => item.id === id);
  if (!fam) return;

  document.getElementById("editFamilyId").value = fam.id;
  document.getElementById("headOfHousehold").value = fam.headOfHousehold || "";
  document.getElementById("phoneNumber").value = fam.phoneNumber || "";
  document.getElementById("houseNumber").value = fam.houseNumber || "";
  document.getElementById("numDependents").value = fam.numDependents ?? 0;
  document.getElementById("address").value = fam.address || "";
  document.getElementById("householdMembers").value = (fam.householdMembers || []).join(", ");

  formLegend.textContent = `✏️ Kemaskini Rekod: ${fam.headOfHousehold}`;
  cancelEditBtn.classList.remove("hidden");
  adminEditorPanel.scrollIntoView({ behavior: "smooth" });
};

window.deleteFamily = async (id, name) => {
  if (!isAdmin) return;
  if (!confirm(`Padam rekod keluarga "${name}" daripada pangkalan data?`)) return;

  if (!isConfigured) {
    allFamilies = allFamilies.filter((f) => f.id !== id);
    renderTable();
    return;
  }

  await remove(ref(db, `families/${id}`));
};

function resetForm() {
  familyForm.reset();
  document.getElementById("editFamilyId").value = "";
  formLegend.textContent = "➕ Tambah Rekod Keluarga Baru (Admin)";
  cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", resetForm);

// =========================================================================
// 5. RENDER DIRECTORY TABLE & NEIGHBOR CONTACT LINKS
// =========================================================================
function formatWhatsAppUrl(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "6" + digits : digits;
  return `https://wa.me/${intl}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = allFamilies.filter((fam) => {
    const membersStr = (fam.householdMembers || []).join(" ").toLowerCase();
    return (
      (fam.headOfHousehold || "").toLowerCase().includes(query) ||
      (fam.houseNumber || "").toLowerCase().includes(query) ||
      (fam.address || "").toLowerCase().includes(query) ||
      membersStr.includes(query)
    );
  });

  recordCountStatus.textContent = `Jumlah Keluarga: ${filtered.length}`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 6}" class="center-cell">Tiada rekod keluarga dijumpai.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered
    .map((fam) => {
      const membersHtml =
        fam.householdMembers && fam.householdMembers.length
          ? fam.householdMembers.map((m) => `<span class="member-pill">${escapeHtml(m)}</span>`).join("")
          : "<em>Tiada rekod</em>";

      const cleanPhone = escapeHtml(fam.phoneNumber);
      const waLink = formatWhatsAppUrl(fam.phoneNumber);

      const adminCells = isAdmin
        ? `<td>
            <button type="button" onclick="startEditFamily('${fam.id}')">✏️ Edit</button>
            <button type="button" onclick="deleteFamily('${fam.id}', '${escapeHtml(fam.headOfHousehold)}')">🗑️ Padam</button>
          </td>`
        : "";

      return `
        <tr>
          <td><strong>${escapeHtml(fam.houseNumber)}</strong></td>
          <td><strong>${escapeHtml(fam.headOfHousehold)}</strong></td>
          <td>${membersHtml}</td>
          <td>${escapeHtml(fam.address)}</td>
          <td>${escapeHtml(fam.numDependents)} orang</td>
          <td>
            <div style="margin-bottom:4px;">${cleanPhone}</div>
            <div class="contact-links">
              <a href="tel:${cleanPhone}"><button type="button">📞 Call</button></a>
              <a href="${waLink}" target="_blank" rel="noopener"><button type="button">💬 WhatsApp</button></a>
            </div>
          </td>
          ${adminCells}
        </tr>
      `;
    })
    .join("");
}

searchInput.addEventListener("input", renderTable);
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderTable();
});

// =========================================================================
// 6. RETRO UI HELPERS (CLOCK, STANDBY ALERTS, BANNER TOGGLE)
// =========================================================================
window.showStandbyAlert = (featureName) => {
  alert(`[STATUS: STANDBY]\n\nModul "${featureName}" sedang dalam mod simpanan.\nBuat masa ini hanya Direktori Keluarga Kariah diaktifkan.`);
};

window.toggleBannerSection = () => {
  document.getElementById("bannerSection").classList.toggle("hidden");
};

function updateClock() {
  const now = new Date();
  document.getElementById("winClock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
updateClock();
setInterval(updateClock, 15000);