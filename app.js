// ================================================================
// AGRIFORECAST — FULL APP.JS (WITH ADVISORIES)
// ================================================================

var lucide = window.lucide = window.lucide || { createIcons() {} };

// GLOBAL STATE
const state = {
    user: null,
    farmers: [],
    cooperatives: [],
    distributions: [],
    inputs: [],
    programs: [],
    assistance: [],
    foodSupply: [],
    prices: [],
    weatherData: {
        location: "Local Area",
        current: { temp: 28, condition: "Partly Cloudy" },
        forecast: []
    }
};

lucide.createIcons();

state.reportFilter = {
    start: null,
    end: null
};

state.weatherUpdated = null;

const ROLE_PERMISSIONS = {
    ADMIN: {
        views: ["dashboard", "farmers", "distributions", "assistance", "supply", "staple_food", "prices", "weather", "recommendations", "reports", "users"],
        edit: ["farmers", "cooperatives", "inventory", "distributions", "assistance", "supply", "staple_food", "prices", "recommendations", "users"]
    },
    OFFICER: {
        views: ["dashboard", "farmers", "distributions", "assistance", "supply", "staple_food", "prices", "weather", "recommendations", "reports"],
        edit: ["farmers", "inventory", "distributions", "assistance", "supply", "staple_food", "prices", "recommendations"]
    },
    COOPERATIVE: {
        views: ["dashboard", "farmers", "distributions", "assistance", "weather", "recommendations"],
        edit: ["distributions", "assistance"]
    },
    FARMER: {
        views: ["dashboard", "farmers", "distributions", "assistance", "weather", "recommendations"],
        edit: []
    }
};

// app.js - Adaptive API Endpoints
const PYTHON_MICROSERVICE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://analytics-production-YOUR-ID.up.railway.app'; // We will replace this with your actual Railway Python domain later

function currentRole() {
    const role = (state.user?.role || "FARMER").toUpperCase();
    return role === "USER" ? "FARMER" : role;
}

function roleLabel(role) {
    const normalized = String(role || "FARMER").toUpperCase();
    return normalized === "USER" ? "FARMER" : normalized;
}

function canAccess(view) {
    return (ROLE_PERMISSIONS[currentRole()]?.views || []).includes(view);
}

function canEdit(module) {
    return (ROLE_PERMISSIONS[currentRole()]?.edit || []).includes(module);
}

function firstAllowedView() {
    return ROLE_PERMISSIONS[currentRole()]?.views?.[0] || "dashboard";
}

function accessDeniedView(c) {
    c.innerHTML = `
        <div class="empty-state">
            <i data-lucide="shield-alert" class="w-10 h-10 mx-auto mb-3 opacity-50"></i>
            <div class="empty-state-title">Access restricted</div>
            <div class="empty-state-sub">Your account does not have permission to open this module.</div>
        </div>
    `;
    lucide.createIcons();
}

// ================================================================
// MODAL HANDLER
// ================================================================
function openModal(html) {
    document.getElementById("modal-body").innerHTML = html;
    document.getElementById("modal-container").classList.remove("hidden");
    lucide.createIcons();
}

function closeModal() {
    document.getElementById("modal-container").classList.add("hidden");
}

function openConfirmModal(title, message, onConfirm, confirmLabel = "Delete") {
    state.pendingConfirmAction = onConfirm;

    openModal(`
        <h2 class="modal-title mb-4">${title}</h2>
        <p class="text-slate-600">${message}</p>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-danger" onclick="runPendingConfirmAction()">${confirmLabel}</button>
        </div>
    `);
}

function runPendingConfirmAction() {
    const action = state.pendingConfirmAction;
    state.pendingConfirmAction = null;
    closeModal();

    if (typeof action === "function") {
        action();
    }
}

// ================================================================
// LOGIN HANDLER
// ================================================================
const rememberedUsername = localStorage.getItem("agriforecast_remembered_username");
if (rememberedUsername) {
    document.getElementById("username").value = rememberedUsername;
    document.getElementById("remember-me").checked = true;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggle = document.querySelector(".password-toggle");
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";
    toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    toggle.setAttribute("title", isHidden ? "Hide password" : "Show password");
    toggle.innerHTML = `<i data-lucide="${isHidden ? "eye-off" : "eye"}" class="w-4 h-4"></i>`;
    lucide.createIcons();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    let res = await fetch("api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let result = await res.json();

    if (!result.success) {
        alert(result.message);
        return;
    }

    state.user = result.user;

    if (rememberMe) {
        localStorage.setItem("agriforecast_remembered_username", username);
    } else {
        localStorage.removeItem("agriforecast_remembered_username");
    }

    document.getElementById("login-panel").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    setupUserInfo();

    loadDashboardData().then(() => {
        navigate("dashboard");
    });
});

// ================================================================
// SET USER INFO
// ================================================================
function setupUserInfo() {
    document.getElementById("user-name-display").innerText = state.user.fullName;
    document.getElementById("user-role-display").innerText = currentRole();
    document.getElementById("user-avatar").innerText = state.user.fullName.charAt(0).toUpperCase();

    document.getElementById("topbar-date").innerText = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });

    document.querySelectorAll("[data-view]").forEach(item => {
        item.classList.toggle("hidden", !canAccess(item.dataset.view));
    });

    document.querySelectorAll(".nav-section-label").forEach(label => label.classList.remove("hidden"));
    document.getElementById("admin-section-label").classList.toggle("hidden", !canAccess("users"));
    document.querySelectorAll(".nav-section-label").forEach(label => {
        let next = label.nextElementSibling;
        let hasVisibleItem = false;
        while (next && !next.classList.contains("nav-section-label")) {
            if (next.classList?.contains("nav-item") && !next.classList.contains("hidden")) {
                hasVisibleItem = true;
            }
            next = next.nextElementSibling;
        }
        label.classList.toggle("hidden", !hasVisibleItem);
    });
}

// ================================================================
// LOGOUT
// ================================================================
async function logout() {
    await fetch("api/logout.php");
    location.reload();
}


// ================================================================
// NAVIGATION
// ================================================================
function navigate(view) {
    if (!canAccess(view)) {
        view = firstAllowedView();
    }

    const pageTitles = {
        farmers: "Farmers & Cooperatives",
        distributions: "Input Distribution",
        assistance: "Assistance Monitoring",
        supply: "Food Supply",
        staple_food: "Staple Food",
        prices: "Price Monitoring",
        weather: "Weather Forecast",
        recommendations: "Advisories",
        users: "User Management"
    };

    document.getElementById("page-breadcrumb").innerText =
        pageTitles[view] || view.charAt(0).toUpperCase() + view.slice(1);

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active-nav", item.dataset.view === view);
    });

    renderView(view);
}

// ================================================================
// VIEW DISPATCHER
// ================================================================
function renderView(view) {
    const c = document.getElementById("main-content");

    if (!canAccess(view)) {
        accessDeniedView(c);
        return;
    }

    if (view === "dashboard") renderDashboard(c);
    else if (view === "farmers") renderFarmers(c);
    else if (view === "distributions") renderDistributions(c);
    else if (view === "assistance") {
    renderAssistance(c); // render UI shell
    loadAssistance().then(() => renderAssistance(c)); // refresh with new data
    }
    else if (view === "supply") {
    renderSupply(c); // initial shell
    loadSupply().then(() => renderSupply(c)); // refresh with new data
}

else if (view === "staple_food") {
    renderStapleFood(c);
    safeFetch("api/staple_food.php").then(data => {
        state.foodItems = data;
        renderStapleFood(c);
    });
}

    else if (view === "prices") renderPrices(c);
    else if (view === "weather") renderWeather(c);
   else if (view === "recommendations") renderRecommendations(c);
        else if (view === "reports") renderReports(c);
        else if (view === "users") renderUsers(c);

}


// ================================================================
// SAFE FETCH WRAPPER
// ================================================================
async function safeFetch(url, fallback = []) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.warn("API failed:", url, e);
        return fallback;
    }
}

// ================================================================
// LOAD ALL DASHBOARD DATA
// ================================================================
async function loadDashboardData() {
    state.farmers = await safeFetch("api/farmers.php");
   state.cooperatives = await safeFetch("api/cooperatives.php");
    state.distributions = await safeFetch("api/distributions.php");
    state.inputs = await safeFetch("api/inputs.php");
    state.programs = await safeFetch("api/programs.php");
    state.assistance = await safeFetch("api/assistance.php");
    state.foodSupply = await safeFetch("api/supply.php");
    state.prices = await safeFetch("api/prices.php");
   // 2) Load LIVE weather using lat/lon from state
    const lat = state.location?.lat ?? "14.1122";
    const lon = state.location?.lon ?? "122.9553";

    state.weatherData = await safeFetch(`api/weather.php?lat=${lat}&lon=${lon}`);

    // 3) Timestamp for UI
    state.weatherUpdated = new Date().toLocaleString();
    state.users = await safeFetch("api/users.php");
    state.foodItems = await safeFetch("api/food.php");
    state.foodItems = await safeFetch("api/staple_food.php");


}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard(c) {
    const wt = (state.weatherData && state.weatherData.current)
        ? state.weatherData.current
        : { temp: "–", condition: "No data" };

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Dashboard</div>
                <div class="page-subtitle">Welcome back, ${state.user.fullName}</div>
            </div>
        </div>

        <div class="stat-grid">
            ${statCard("Total Farmers", state.farmers.length, "users", "green")}
            ${statCard("Cooperatives", state.cooperatives.length, "building-2", "blue")}
            ${statCard("Distributions", state.distributions.length, "package", "amber")}
            ${statCard("Assistance Cases", state.assistance.length, "hand-helping", "green")}
           ${statCard("Weather Today", wt.temp + "°C", getWeatherIcon(wt.condition), "amber", wt.condition + " • Updated " + state.weatherUpdated)}
        </div>
    `;

    lucide.createIcons();
}

// ================================================================
// STAT CARD COMPONENT
// ================================================================
function statCard(title, value, icon, color, subtitle = "") {
    return `
        <div class="stat-card border-l-4 border-${color}-500">
            <div class="stat-icon ${color}"><i data-lucide="${icon}" class="w-6 h-6"></i></div>
            <div class="stat-info">
                <div class="stat-title">${title}</div>
                <div class="stat-value">${value}</div>
                <div class="stat-sub">${subtitle}</div>
            </div>
        </div>
    `;
}

// ================================================================
// FARMERS & COOPERATIVES MODULE
// ================================================================
function renderFarmers(c) {
    const totalFarmers = state.farmers.length;
    const activeFarmers = state.farmers.filter(f => f.status === "Active").length;
    const totalCoops = state.cooperatives.length;
    const canManageFarmers = canEdit("farmers");
    const canManageCooperatives = canEdit("cooperatives");

    // Compute members per cooperative
    const coopMembers = {};
    state.cooperatives.forEach(coop => coopMembers[coop.cooperative_id] = 0);


    state.farmers.forEach(f => {
        if (f.cooperative_id && coopMembers[f.cooperative_id] !== undefined) {
            coopMembers[f.cooperative_id]++;
        }
    });

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Farmers & Cooperatives</div>
                <div class="page-subtitle">Manage registered beneficiary profiles</div>
            </div>
            ${canManageFarmers ? `<button class="btn-primary" onclick="openRegisterFarmer()">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                Register Farmer
            </button>` : ""}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat-card border-l-4 border-green-500">
                <div class="stat-title">Total Farmers</div>
                <div class="stat-value">${totalFarmers}</div>
            </div>

            <div class="stat-card border-l-4 border-blue-500">
                <div class="stat-title">Active</div>
                <div class="stat-value">${activeFarmers}</div>
            </div>

            <div class="stat-card border-l-4 border-amber-500">
                <div class="stat-title">Cooperatives</div>
                <div class="stat-value">${totalCoops}</div>
            </div>
        </div>

        <div class="card mb-10">
            <div class="card-header flex items-center justify-between">
                <span>Farmers</span>
                <input id="farmerSearch" type="text" placeholder="Search farmers..." 
                    class="search-input" oninput="filterFarmers()">
            </div>

            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Location</th>
                            <th class="px-4 py-2 text-left">Farm Size</th>
                            <th class="px-4 py-2 text-left">Type</th>
                            <th class="px-4 py-2 text-left">Cooperative</th>
                            <th class="px-4 py-2 text-left">Contact</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            ${canManageFarmers ? `<th class="px-4 py-2 text-right">Actions</th>` : ""}
                        </tr>
                    </thead>
                    <tbody id="farmersTableBody">
                        ${renderFarmersRows(state.farmers)}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <div class="card-header flex items-center justify-between">
                <span>Cooperatives</span>
                <div class="toolbar-actions">
                    <input id="coopSearch" type="text" placeholder="Search cooperatives..." 
                        class="search-input" oninput="filterCooperatives()">

                    ${canManageCooperatives ? `<button class="btn-primary" onclick="openAddCoop()">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        Add Cooperative
                    </button>` : ""}
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Location</th>
                            <th class="px-4 py-2 text-left">Members</th>
                            <th class="px-4 py-2 text-left">Contact</th>
                            ${canManageCooperatives ? `<th class="px-4 py-2 text-right">Actions</th>` : ""}
                        </tr>
                    </thead>
                   <tbody id="coopTableBody">
    ${renderCoopRows(state.cooperatives)}
</tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// FARMER ROWS
// ================================================================
function renderFarmersRows(list) {
    const showActions = canEdit("farmers");
    if (!list.length) {
        return `
            <tr>
                <td colspan="8" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="user" class="w-7 h-7 opacity-50"></i>
                        <div>No farmers found</div>
                    </div>
                </td>
            </tr>
        `;
    }

    return list.map((f, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-emerald-50 transition-colors">
            <td class="px-4 py-2 whitespace-nowrap">${f.full_name}</td>
            <td class="px-4 py-2 whitespace-nowrap">${f.farm_location}</td>
            <td class="px-4 py-2 whitespace-nowrap">${f.farm_size_ha || "N/A"} ha</td>
            <td class="px-4 py-2 whitespace-nowrap">${f.farm_type}</td>
            <td class="px-4 py-2 whitespace-nowrap">${f.cooperative || "None"}</td>
            <td class="px-4 py-2 whitespace-nowrap">${f.contact_number}</td>
            <td class="px-4 py-2 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${f.status === "Active" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-600 ring-1 ring-slate-100"}">
                    ${f.status}
                </span>
            </td>
            ${showActions ? `<td class="px-4 py-2 text-right whitespace-nowrap">
    <button class="table-btn text-blue-600 hover:text-blue-800 text-xs font-medium"
        onclick="openEditFarmer(${f.farmer_id})">
        Edit
    </button>

    <button class="table-btn text-red-600 hover:text-red-800 text-xs font-medium ml-2"
        onclick="deleteFarmer(${f.farmer_id})">
        Delete
    </button>
</td>` : ""}
        </tr>
    `).join("");
}

function filterCooperatives() {
    const q = document.getElementById("coopSearch").value.toLowerCase();

    const filtered = state.cooperatives.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );

    document.getElementById("coopTableBody").innerHTML =
        renderCoopRows(filtered);
}

// ================================================================
// COOPERATIVE ROWS
// ================================================================
function renderCoopRows(list) {
    const showActions = canEdit("cooperatives");
    if (!list.length) {
        return `
            <tr>
                <td colspan="5" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="users" class="w-7 h-7 opacity-50"></i>
                        <div>No cooperatives found</div>
                    </div>
                </td>
            </tr>
        `;
    }

    return list.map((c, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}">
            <td class="px-4 py-2">${c.name}</td>
            <td class="px-4 py-2">${c.location}</td>
            <td class="px-4 py-2">${c.members_count}</td>
            <td class="px-4 py-2">${c.contact_number}</td>
            ${showActions ? `<td class="px-4 py-2 text-right">
                <button class="table-btn text-blue-600 hover:text-blue-800 text-xs font-medium"
                    onclick="openEditCoop(${c.cooperative_id})">Edit</button>

                <button class="table-btn text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                    onclick="deleteCooperative(${c.cooperative_id})">Delete</button>
            </td>` : ""}
        </tr>
    `).join("");
}

function openEditCoop(id) {
    const c = state.cooperatives.find(x => x.cooperative_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Cooperative</h2>

        <div class="form-grid">
            <div>
                <label class="form-label">Name</label>
                <input id="ec_name" type="text" class="form-input" value="${c.name}">
            </div>

            <div>
                <label class="form-label">Location</label>
                <input id="ec_location" type="text" class="form-input" value="${c.location}">
            </div>

            <div>
                <label class="form-label">Contact</label>
                <input id="ec_contact" type="text" class="form-input" value="${c.contact_number}">
            </div>
        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateCooperative(${id})">Save Changes</button>
        </div>
    `);
}

async function updateCooperative(id) {
    const data = {
        cooperative_id: id,
        name: document.getElementById("ec_name").value,
        location: document.getElementById("ec_location").value,
        contact_number: document.getElementById("ec_contact").value
    };

    const res = await fetch("api/cooperatives.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}

async function deleteCooperative(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Cooperative", "Are you sure you want to delete this cooperative?", () => deleteCooperative(id, true));
        return;
    }

    const res = await fetch("api/cooperatives.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cooperative_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}


// ================================================================
// SEARCH FILTER
// ================================================================
function filterFarmers() {
    const q = document.getElementById("farmerSearch").value.toLowerCase();

    const filtered = state.farmers.filter(f =>
        f.full_name.toLowerCase().includes(q) ||
        f.farm_location.toLowerCase().includes(q)
    );

    document.getElementById("farmersTableBody").innerHTML =
        renderFarmersRows(filtered);
}

function openEditFarmer(id) {
    const f = state.farmers.find(x => x.farmer_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Farmer</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Full Name</label>
                <input id="ef_name" type="text" class="form-input" value="${f.full_name}">
            </div>

            <div>
                <label class="form-label">Contact No.</label>
                <input id="ef_contact" type="text" class="form-input" value="${f.contact_number}">
            </div>

            <div>
                <label class="form-label">Location</label>
                <input id="ef_location" type="text" class="form-input" value="${f.farm_location}">
            </div>

            <div>
                <label class="form-label">Farm Size</label>
                <input id="ef_size" type="text" class="form-input" value="${f.farm_size_ha}">
            </div>

            <div>
                <label class="form-label">Farm Type</label>
                <select id="ef_type" class="form-input">
                    <option value="Crop" ${f.farm_type === "Crop" ? "selected" : ""}>Crop</option>
                    <option value="Livestock" ${f.farm_type === "Livestock" ? "selected" : ""}>Livestock</option>
                    <option value="Mixed" ${f.farm_type === "Mixed" ? "selected" : ""}>Mixed</option>
                </select>
            </div>

            <div>
                <label class="form-label">Cooperative</label>
                <select id="ef_coop" class="form-input">
                    <option value="">None</option>
                    ${state.cooperatives.map(c => `
                        <option value="${c.cooperative_id}" 
                            ${f.cooperative_id == c.cooperative_id ? "selected" : ""}>
                            ${c.name}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="ef_status" class="form-input">
                    <option value="Active" ${f.status === "Active" ? "selected" : ""}>Active</option>
                    <option value="Inactive" ${f.status === "Inactive" ? "selected" : ""}>Inactive</option>
                </select>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateFarmer(${id})">Save Changes</button>
        </div>
    `);
}

// ================================================================
// REGISTER FARMER FORM
// ================================================================
function openRegisterFarmer() {
    openModal(`
        <h2 class="modal-title mb-4">Register New Farmer</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Full Name</label>
                <input id="rf_name" type="text" class="form-input" placeholder="Juan Dela Cruz">
            </div>

            <div>
                <label class="form-label">Contact No.</label>
                <input id="rf_contact" type="text" class="form-input" placeholder="09xxxxxxxxx">
            </div>

            <div>
                <label class="form-label">Location (Barangay)</label>
                <input id="rf_location" type="text" class="form-input" placeholder="Barangay Name">
            </div>

            <div>
                <label class="form-label">Farm Size (e.g. 2.5 ha)</label>
                <input id="rf_size" type="text" class="form-input" placeholder="2.5">
            </div>

            <div>
                <label class="form-label">Farm Type</label>
                <select id="rf_type" class="form-input">
                    <option value="Crop">Crop</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Mixed">Mixed</option>
                </select>
            </div>

            <div>
                <label class="form-label">Cooperative</label>
                <select id="rf_coop" class="form-input">
                    <option value="">None</option>
                    ${state.cooperatives.map(c => `<option value="${c.cooperative_id}">${c.name}</option>`).join("")}
                    
                </select>
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="rf_status" class="form-input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveFarmer()">Register Farmer</button>
        </div>
    `);
}

// ================================================================
// SAVE FARMER
// ================================================================
async function saveFarmer() {
    let coop = document.getElementById("rf_coop").value;

    // FIX: convert invalid values to null
    if (coop === "" || coop === "undefined" || coop === undefined || coop === null) {
        coop = null;
    }

    const data = {
        full_name: document.getElementById("rf_name").value,
        contact_number: document.getElementById("rf_contact").value,
        farm_location: document.getElementById("rf_location").value,
        farm_size_ha: document.getElementById("rf_size").value,
        farm_type: document.getElementById("rf_type").value,
        cooperative_id: coop,
        status: document.getElementById("rf_status").value
    };

    const res = await fetch("api/farmers.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}

async function updateFarmer(id) {
    let coop = document.getElementById("ef_coop").value;
    if (coop === "" || coop === "undefined") coop = null;

    const data = {
        farmer_id: id,
        full_name: document.getElementById("ef_name").value,
        contact_number: document.getElementById("ef_contact").value,
        farm_location: document.getElementById("ef_location").value,
        farm_size_ha: document.getElementById("ef_size").value,
        farm_type: document.getElementById("ef_type").value,
        cooperative_id: coop,
        status: document.getElementById("ef_status").value
    };

    const res = await fetch("api/farmers.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}

async function deleteFarmer(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Farmer", "Are you sure you want to delete this farmer?", () => deleteFarmer(id, true));
        return;
    }

    const res = await fetch("api/farmers.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmer_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}

// ================================================================
// ADD COOPERATIVE FORM
// ================================================================
function openAddCoop() {
    openModal(`
        <h2 class="modal-title mb-4">Add Cooperative</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Cooperative Name</label>
                <input id="coop_name" type="text" class="form-input" placeholder="Coop Name">
            </div>

            <div>
                <label class="form-label">Location</label>
                <input id="coop_location" type="text" class="form-input" placeholder="Barangay / Town">
            </div>

            <div>
                <label class="form-label">Members</label>
                <input id="coop_members" type="number" class="form-input" placeholder="0">
            </div>

            <div>
                <label class="form-label">Contact</label>
                <input id="coop_contact" type="text" class="form-input" placeholder="09xxxxxxxxx">
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveCooperative()">Save Cooperative</button>
        </div>
    `);
}

// ================================================================
// SAVE COOPERATIVE
// ================================================================
async function saveCooperative() {
    const data = {
        name: document.getElementById("coop_name").value,
        location: document.getElementById("coop_location").value,
        contact_number: document.getElementById("coop_contact").value
    };

    const res = await fetch("api/cooperatives.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("farmers"));
    } else {
        alert(result.message);
    }
}

// ================================================================
// INPUT DISTRIBUTION MODULE
// ================================================================

// ================================================================
// INVENTORY ROWS
// ================================================================


function renderInventoryRows(list) {
    const showActions = canEdit("inventory");
    if (!list.length) {
        return `
            <tr>
                <td colspan="${showActions ? 8 : 7}" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="package" class="w-7 h-7 opacity-50"></i>
                        <div>No input types defined</div>
                    </div>
                </td>
            </tr>
        `;
    }

    
    return list.map((i, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-emerald-50 transition-colors">

            <td class="px-4 py-2 whitespace-nowrap">${i.name}</td>
             <td class="px-4 py-2 whitespace-nowrap">
                ${i.description ? i.description : "—"}
            </td>
            <td class="px-4 py-2 whitespace-nowrap">${i.category}</td>
            <td class="px-4 py-2 whitespace-nowrap">${i.unit}</td>
            <td class="px-4 py-2 whitespace-nowrap">${i.stock_quantity}</td>
            <td class="px-4 py-2 whitespace-nowrap">${i.supplier || "—"}</td>

           

            <td class="px-4 py-2 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${i.status === "Available" 
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-red-50 text-red-700 ring-1 ring-red-100"}">
                    ${i.status}
                </span>
            </td>

            ${showActions ? `<td class="px-4 py-2 text-right whitespace-nowrap">
                <button class="table-btn text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                    onclick="openEditInput(${i.input_id})">
                    Edit
                </button>
            
                <button class="table-btn text-red-600 hover:text-red-800 text-xs font-medium"
                    onclick="deleteInput(${i.input_id})">
                    Delete
                </button>
            </td>` : ""}

        </tr>
    `).join("");
}


function openEditInput(id) {
    const i = state.inputs.find(x => x.input_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Input Type</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Input Name</label>
                <input id="ei_name" type="text" class="form-input" value="${i.name}">
            </div>

            <div>
                <label class="form-label">Category</label>
                <select id="ei_category" class="form-input">
                    ${inputCategoryOptions(i.category)}
                </select>
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="ei_unit" type="text" class="form-input" value="${i.unit}">
            </div>

            <div>
                <label class="form-label">Stock Quantity</label>
                <input id="ei_stock" type="number" class="form-input" value="${i.stock_quantity}">
            </div>

            <div>
                <label class="form-label">Supplier</label>
                <input id="ei_supplier" type="text" class="form-input" value="${i.supplier || ""}">
            </div>

            <div>
                <label class="form-label">Description</label>
                <textarea id="ei_description" class="form-input">${i.description || ""}</textarea>
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="ei_status" class="form-input">
                    <option value="Available" ${i.status === "Available" ? "selected" : ""}>Available</option>
                    <option value="Out-of-Stock" ${i.status === "Out-of-Stock" ? "selected" : ""}>Out-of-Stock</option>
                </select>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateInput(${id})">Save Changes</button>
        </div>
    `);
}

async function updateInput(id) {
    const data = {
        input_id: id,
        name: document.getElementById("ei_name").value,
        category: document.getElementById("ei_category").value,
        unit: document.getElementById("ei_unit").value,
        stock_quantity: document.getElementById("ei_stock").value,
        supplier: document.getElementById("ei_supplier").value,
        description: document.getElementById("ei_description").value,
        status: document.getElementById("ei_status").value
    };

    const res = await fetch("api/inputs.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert("Failed to update input.");
    }
}

async function deleteInput(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Input Type", "Are you sure you want to delete this input type?", () => deleteInput(id, true));
        return;
    }

    const res = await fetch("api/inputs.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert(result.message || result.error || "Failed to delete input.");
    }
}



// ================================================================
// ADD INPUT TYPE FORM
// ================================================================
function openAddInputType() {
    openModal(`
        <h2 class="modal-title mb-4">Add Input Type</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Input Name</label>
                <input id="input_name" type="text" class="form-input" placeholder="e.g. Hybrid Rice Seeds">
            </div>

            <div>
    <label class="form-label">Description</label>
    <textarea id="input_description" class="form-input" placeholder="Short description"></textarea>
</div>


            <div>
                <label class="form-label">Category</label>
                <select id="input_category" class="form-input">
                    ${inputCategoryOptions("Seeds")}
                </select>
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="input_unit" type="text" class="form-input" placeholder="sacks / bags / kg">
            </div>

            <div>
                <label class="form-label">Stock</label>
                <input id="input_stock" type="number" class="form-input" placeholder="0">
            </div>

            <div>
                <label class="form-label">Supplier</label>
                <input id="input_supplier" type="text" class="form-input" placeholder="Supplier name">
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveInputType()">Save Input Type</button>
        </div>
    `);
}

// ================================================================
// SAVE INPUT TYPE
// ================================================================
async function saveInputType() {
    const data = {
        name: document.getElementById("input_name").value,
        category: document.getElementById("input_category").value,
        unit: document.getElementById("input_unit").value,
        stock_quantity: document.getElementById("input_stock").value, // FIXED
        supplier: document.getElementById("input_supplier").value,
        description: document.getElementById("input_description")?.value || "",
        status: "Available"
    };

    const res = await fetch("api/inputs.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert(result.error || result.message || "Failed to save input.");
    }
}

function filterInventory() {
    const q = document.getElementById("inventorySearch").value.toLowerCase();

    const filtered = state.inputs.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.unit.toLowerCase().includes(q) ||
        String(i.stock_quantity).toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
    );

    document.getElementById("inventoryTableBody").innerHTML =
        renderInventoryRows(filtered);

    lucide.createIcons();
}


function renderDistributions(c) {
    const totalRecords = state.distributions.length;
    const unitsReleased = state.distributions.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const inputTypes = state.inputs.length;
    const programs = state.programs.length;
    const canManageInventory = canEdit("inventory");
    const canManageDistributions = canEdit("distributions");

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Farm Input Distribution</div>
                <div class="page-subtitle">Track and record farm input releases to farmers</div>
            </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="stat-card border-l-4 border-emerald-500">
                <div class="stat-title">Total Records</div>
                <div class="stat-value">${totalRecords}</div>
            </div>
            <div class="stat-card border-l-4 border-blue-500">
                <div class="stat-title">Units Released</div>
                <div class="stat-value">${unitsReleased}</div>
            </div>
            <div class="stat-card border-l-4 border-amber-500">
                <div class="stat-title">Input Types</div>
                <div class="stat-value">${inputTypes} <span class="stat-sub">in inventory</span></div>
            </div>
            <div class="stat-card border-l-4 border-purple-500">
                <div class="stat-title">Programs</div>
                <div class="stat-value">${programs} <span class="stat-sub">active</span></div>
            </div>
        </div>

        ${canManageInventory ? `<!-- ============================
             INPUT INVENTORY TABLE
        ============================= -->
      <div class="card">
      <div class="card-header flex items-center justify-between">
    <span>Input Inventory</span>

    <div class="toolbar-actions">
        <input 
            id="inventorySearch"
            type="text"
            class="search-input"
            placeholder="Search inventory..."
            oninput="filterInventory()"
        >

        ${canManageInventory ? `<button class="btn-primary" onclick="openAddInputType()">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Add Input Type
        </button>` : ""}
    </div>
</div>

            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Input Name</th>
                            <th class="px-4 py-2 text-left">Description</th>
                            <th class="px-4 py-2 text-left">Category</th>
                            <th class="px-4 py-2 text-left">Unit</th>
                            <th class="px-4 py-2 text-left">Stock</th>
                            <th class="px-4 py-2 text-left">Supplier</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            <th class="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="inventoryTableBody">
                        ${renderInventoryRows(state.inputs)}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ""}

        <!-- ============================
             DISTRIBUTION RECORDS TABLE
        ============================= -->
        <div class="card">
           <div class="card-header flex items-center justify-between">
    <span>Distribution Records</span>

    <div class="toolbar-actions">
        <input 
            id="distributionSearch"
            type="text"
            class="search-input"
            placeholder="Search distributions..."
            oninput="filterDistributions()"
        >

        ${canManageDistributions ? `<button class="btn-primary" onclick="openRecordDistribution()">
            <i data-lucide="clipboard-list" class="w-4 h-4"></i>
            Record Distribution
        </button>` : ""}
    </div>
</div>


            

            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Farmer</th>
                            <th class="px-4 py-2 text-left">Input</th>
                            <th class="px-4 py-2 text-left">Qty</th>
                            <th class="px-4 py-2 text-left">Program</th>
                            <th class="px-4 py-2 text-left">Date</th>
                            <th class="px-4 py-2 text-left">Officer</th>
                            <th class="px-4 py-2 text-left">Remarks</th>
                            ${canManageDistributions ? `<th class="px-4 py-2 text-right">Actions</th>` : ""}
                        </tr>
                    </thead>
                    <tbody id="distributionTableBody">
                        ${renderDistributionRows(state.distributions)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}

function inputCategoryOptions(selected = "Other") {
    const categories = ["Seeds", "Fertilizer", "Pesticide", "Equipment", "Other"];
    return categories.map(category => `
        <option value="${category}" ${category === selected ? "selected" : ""}>${category}</option>
    `).join("");
}

function filterDistributions() {
    const q = document.getElementById("distributionSearch").value.toLowerCase();

    const filtered = state.distributions.filter(d =>
        d.farmer_name.toLowerCase().includes(q) ||
        d.input_name.toLowerCase().includes(q) ||
        String(d.quantity).toLowerCase().includes(q) ||
        d.program.toLowerCase().includes(q) ||
        d.distribution_date.toLowerCase().includes(q) ||
        d.officer_name.toLowerCase().includes(q) ||
        (d.remarks || "").toLowerCase().includes(q)
    );

    document.getElementById("distributionTableBody").innerHTML =
        renderDistributionRows(filtered);

    lucide.createIcons();
}

// ================================================================
// DISTRIBUTION ROWS
// ================================================================
function renderDistributionRows(list) {
    const showActions = canEdit("distributions");
    if (!list.length) {
        return `
            <tr>
                <td colspan="7" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="clipboard-list" class="w-7 h-7 opacity-50"></i>
                        <div>No distributions recorded</div>
                    </div>
                </td>
            </tr>
        `;
    }

    return list.map((d, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-emerald-50 transition-colors">
            <td class="px-4 py-2 whitespace-nowrap">${d.farmer_name}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.input_name}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.quantity}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.program}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.distribution_date}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.officer_name || state.user.fullName}</td>
            <td class="px-4 py-2 whitespace-nowrap">${d.remarks || "—"}</td>


            ${showActions ? `<td class="px-4 py-2 text-right whitespace-nowrap">
                <button class="table-btn text-blue-600 hover:text-blue-800 text-xs font-medium"
                    onclick="openEditDistribution(${d.distribution_id})">
                    Edit
                </button>

                <button class="table-btn text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                    onclick="deleteDistribution(${d.distribution_id})">
                    Delete
                </button>
            </td>` : ""}
        </tr>
    `).join("");
}

function openRecordDistribution() {
    const today = new Date().toISOString().slice(0, 10);

    openModal(`
        <h2 class="modal-title mb-4">Record Distribution</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Farmer</label>
                <select id="dist_farmer" class="form-input">
                    <option value="">– Select Farmer –</option>
                    ${state.farmers.map(f => `<option value="${f.farmer_id}">${f.full_name}</option>`).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Input Item</label>
                <select id="dist_input" class="form-input">
                    <option value="">– Select Input –</option>
                    ${state.inputs.map(i => `<option value="${i.input_id}">${i.name}</option>`).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Quantity</label>
                <input id="dist_qty" type="number" class="form-input" placeholder="0">
            </div>

            <div>
                <label class="form-label">Date</label>
                <input id="dist_date" type="date" class="form-input" value="${today}">
            </div>

            <div>
                <label class="form-label">Program</label>
                <input id="dist_program" type="text" class="form-input" placeholder="RCEF">
            </div>

           <div>
    <label class="form-label">Remarks</label>
    <textarea id="dist_remarks" class="form-input" placeholder="Optional notes"></textarea>
</div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveDistribution()">Save Record</button>
        </div>
    `);
}

async function saveDistribution() {
    const data = {
        farmer_id: document.getElementById("dist_farmer").value,
        input_id: document.getElementById("dist_input").value,
        quantity: document.getElementById("dist_qty").value,
        distribution_date: document.getElementById("dist_date").value,
        program: document.getElementById("dist_program").value,
        remarks: document.getElementById("dist_remarks").value,
        distributed_by: state.user?.user_id || 7   // ← FIXED
    };

    console.log("DATA SENT:", data); // debug

    const res = await fetch("api/distributions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("RESULT:", result);

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert(result.message || "Failed to save distribution.");
    }
}



function openEditDistribution(id) {
    const d = state.distributions.find(x => x.distribution_id == id);
    if (!d) return;

    openModal(`
        <h2 class="modal-title mb-4">Edit Distribution</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Quantity</label>
                <input id="edit_qty" type="number" class="form-input" value="${d.quantity}">
            </div>

            <div>
                <label class="form-label">Program</label>
                <input id="edit_program" type="text" class="form-input" value="${d.program}">
            </div>

            <div>
                <label class="form-label">Date</label>
                <input id="edit_date" type="date" class="form-input" value="${d.distribution_date}">
            </div>

            <div>
                <label class="form-label">Remarks</label>
                <textarea id="edit_remarks" class="form-input">${d.remarks || ""}</textarea>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateDistribution(${id})">Update</button>
        </div>
    `);
}

async function updateDistribution(id) {
    const data = {
        distribution_id: id,
        quantity: document.getElementById("edit_qty").value,
        program: document.getElementById("edit_program").value,
        distribution_date: document.getElementById("edit_date").value,
        remarks: document.getElementById("edit_remarks").value
    };

    const res = await fetch("api/distributions.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert("Update failed.");
    }
}

function deleteDistribution(id) {
    openModal(`
        <h2 class="modal-title mb-4">Delete Distribution</h2>
        <p>Are you sure you want to delete this record?</p>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-danger" onclick="confirmDeleteDistribution(${id})">Delete</button>
        </div>
    `);
}

async function confirmDeleteDistribution(id) {
    const res = await fetch("api/distributions.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distribution_id: id })
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("distributions"));
    } else {
        alert("Delete failed.");
    }
}


// ================================================================
// LOAD ASSISTANCE (NEW - REQUIRED FOR AUTO REFRESH)
// ================================================================
async function loadAssistance() {
    const res = await fetch("api/assistance.php");
    state.assistance = await res.json();
}


// ================================================================
// ASSISTANCE MONITORING MODULE
// ================================================================
function renderAssistance(c) {
    const total = state.assistance.length;
    const released = state.assistance.filter(a => a.status === "Released").length;
    const processing = state.assistance.filter(a => a.status === "Processing").length;
    const canManageAssistance = canEdit("assistance");

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Assistance Monitoring</div>
                <div class="page-subtitle">Track agricultural support programs and releases</div>
            </div>

            ${canManageAssistance ? `<button class="btn-primary" onclick="openAddAssistance()">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Add Record
            </button>` : ""}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat-card border-l-4 border-blue-500">
                <div class="stat-title">Total Records</div>
                <div class="stat-value">${total}</div>
            </div>

            <div class="stat-card border-l-4 border-green-500">
                <div class="stat-title">Released</div>
                <div class="stat-value">${released}</div>
            </div>

            <div class="stat-card border-l-4 border-amber-500">
                <div class="stat-title">Processing</div>
                <div class="stat-value">${processing}</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header flex items-center justify-between">
                <span>Assistance Records</span>

                <input 
                    id="assistanceSearch"
                    type="text"
                    class="search-input"
                    placeholder="Search assistance..."
                    oninput="filterAssistance()"
                >
            </div>

            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Beneficiary</th>
                            <th class="px-4 py-2 text-left">Type</th>
                            <th class="px-4 py-2 text-left">Support Type</th>
                            <th class="px-4 py-2 text-left">Description</th>
                            <th class="px-4 py-2 text-left">Program</th>
                            <th class="px-4 py-2 text-left">Value</th>
                            <th class="px-4 py-2 text-left">Date</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            ${canManageAssistance ? `<th class="px-4 py-2 text-right">Actions</th>` : ""}
                        </tr>
                    </thead>

                    <tbody id="assistanceTableBody">
                        ${renderAssistanceRows(state.assistance)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}


// ================================================================
// ASSISTANCE ROWS
// ================================================================
function renderAssistanceRows(list) {
    const showActions = canEdit("assistance");
    if (!list.length) {
        return `
            <tr>
                <td colspan="9" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="hand-helping" class="w-7 h-7 opacity-50"></i>
                        <div>No assistance records</div>
                    </div>
                </td>
            </tr>
        `;
    }

    return list.map((a, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}">

            <td class="px-4 py-2">${a.farmer_name || a.cooperative_name || "Unknown"}</td>

            <td class="px-4 py-2">
                ${a.farmer_id ? "Farmer" : a.cooperative_id ? "Cooperative" : "N/A"}
            </td>

            <td class="px-4 py-2">${a.support_type}</td>

            <td class="px-4 py-2">${a.description || "—"}</td>

            <td class="px-4 py-2">${a.program_name || "—"}</td>

            <td class="px-4 py-2">₱${Number(a.value_amount || 0).toLocaleString()}</td>

            <td class="px-4 py-2">${a.date_given}</td>

            <td class="px-4 py-2">
                <span class="badge 
                    ${a.status === "Released" ? "badge-green" : 
                      a.status === "Processing" ? "badge-amber" : 
                      "badge-red"}">
                    ${a.status}
                </span>
            </td>

            ${showActions ? `<td class="px-4 py-2 text-right">
                <button class="table-btn text-blue-600" onclick="openEditAssistance(${a.assistance_id})">Edit</button>
                <button class="table-btn text-red-600 ml-2" onclick="deleteAssistance(${a.assistance_id})">Delete</button>
            </td>` : ""}

        </tr>
    `).join("");
}


// ================================================================
// SEARCH FILTER
// ================================================================
function filterAssistance() {
    const q = document.getElementById("assistanceSearch").value.toLowerCase();

    const filtered = state.assistance.filter(a =>
        (a.farmer_name || "").toLowerCase().includes(q) ||
        (a.cooperative_name || "").toLowerCase().includes(q) ||
        (a.program_name || "").toLowerCase().includes(q) ||
        (a.support_type || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q) ||
        String(a.value_amount || "").includes(q) ||
        (a.date_given || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
    );

    document.getElementById("assistanceTableBody").innerHTML =
        renderAssistanceRows(filtered);

    lucide.createIcons();
}


// ================================================================
// ADD ASSISTANCE FORM
// ================================================================
async function openAddAssistance() {
    if (!state.farmers?.length) await loadFarmers();
    if (!state.cooperatives?.length) await loadCooperatives();

    openModal(`
        <h2 class="modal-title mb-4">Add Assistance Record</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Beneficiary (Farmer)</label>
                <select id="as_farmer" class="form-input">
                    <option value="">-- Select Farmer --</option>
                    ${state.farmers.map(f => `
                        <option value="${f.farmer_id}">${f.full_name}</option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Cooperative (Optional)</label>
                <select id="as_coop" class="form-input">
                    <option value="">-- None --</option>
                    ${state.cooperatives.map(c => `
                        <option value="${c.cooperative_id}">${c.name}</option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Program Name</label>
                <input id="as_program" class="form-input">
            </div>

            <div>
                <label class="form-label">Support Type</label>
                <input id="as_support" class="form-input">
            </div>

            <div>
                <label class="form-label">Value Amount (₱)</label>
                <input id="as_value" type="number" class="form-input">
            </div>

            <div>
                <label class="form-label">Date Given</label>
                <input id="as_date" type="date" class="form-input">
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="as_status" class="form-input">
                    <option value="Processing">Processing</option>
                    <option value="Released">Released</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div class="col-span-2">
                <label class="form-label">Description</label>
                <textarea id="as_desc" class="form-input" placeholder="Optional notes"></textarea>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveAssistance()">Save Record</button>
        </div>
    `);
}


// ================================================================
// SAVE ASSISTANCE
// ================================================================
async function saveAssistance() {
    let farmer = parseInt(document.getElementById("as_farmer").value) || null;
    let coop = parseInt(document.getElementById("as_coop").value) || null;

    if (farmer && coop) {
        alert("Select ONLY ONE beneficiary: Farmer OR Cooperative.");
        return;
    }

    if (!farmer && !coop) {
        alert("Please select a beneficiary.");
        return;
    }

    const data = {
        farmer_id: farmer,
        cooperative_id: coop,
        program_name: document.getElementById("as_program").value,
        support_type: document.getElementById("as_support").value,
        value_amount: document.getElementById("as_value").value,
        date_given: document.getElementById("as_date").value,
        status: document.getElementById("as_status").value,
        description: document.getElementById("as_desc").value,
        given_by_user_id: state.user.user_id,
        given_by: state.user.fullName
    };

    const res = await fetch("api/assistance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

  if (result.success) {
    closeModal();
    loadDashboardData().then(() => navigate("assistance"));
    }else {
        alert(result.message);
    }
}


// ================================================================
// EDIT ASSISTANCE FORM
// ================================================================
async function openEditAssistance(id) {
    if (!state.farmers?.length) await loadFarmers();
    if (!state.cooperatives?.length) await loadCooperatives();

    const a = state.assistance.find(x => x.assistance_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Assistance Record</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Beneficiary (Farmer)</label>
                <select id="ea_farmer" class="form-input">
                    <option value="">-- Select Farmer --</option>
                    ${state.farmers.map(f => `
                        <option value="${f.farmer_id}" 
                            ${a.farmer_id == f.farmer_id ? "selected" : ""}>
                            ${f.full_name}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Cooperative (Optional)</label>
                <select id="ea_coop" class="form-input">
                    <option value="">-- None --</option>
                    ${state.cooperatives.map(c => `
                        <option value="${c.cooperative_id}" 
                            ${a.cooperative_id == c.cooperative_id ? "selected" : ""}>
                            ${c.name}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Program Name</label>
                <input id="ea_program" class="form-input" value="${a.program_name || ""}">
            </div>

            <div>
                <label class="form-label">Support Type</label>
                <input id="ea_support" class="form-input" value="${a.support_type}">
            </div>

            <div>
                <label class="form-label">Value Amount (₱)</label>
                <input id="ea_value" type="number" class="form-input" value="${a.value_amount}">
            </div>

            <div>
                <label class="form-label">Date Given</label>
                <input id="ea_date" type="date" class="form-input" value="${a.date_given}">
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="ea_status" class="form-input">
                    <option value="Processing" ${a.status === "Processing" ? "selected" : ""}>Processing</option>
                    <option value="Released" ${a.status === "Released" ? "selected" : ""}>Released</option>
                    <option value="Cancelled" ${a.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
            </div>

            <div class="col-span-2">
                <label class="form-label">Description</label>
                <textarea id="ea_desc" class="form-input">${a.description || ""}</textarea>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateAssistance(${id})">Save Changes</button>
        </div>
    `);

    lucide.createIcons();
}


// ================================================================
// UPDATE ASSISTANCE
// ================================================================
async function updateAssistance(id) {
    let farmer = parseInt(document.getElementById("ea_farmer").value) || null;
    let coop = parseInt(document.getElementById("ea_coop").value) || null;

    if (farmer && coop) {
        alert("Select ONLY ONE beneficiary: Farmer OR Cooperative.");
        return;
    }

    if (!farmer && !coop) {
        alert("Please select a beneficiary.");
        return;
    }

    const data = {
        assistance_id: id,
        farmer_id: farmer,
        cooperative_id: coop,
        program_name: document.getElementById("ea_program").value,
        support_type: document.getElementById("ea_support").value,
        value_amount: document.getElementById("ea_value").value,
        date_given: document.getElementById("ea_date").value,
        status: document.getElementById("ea_status").value,
        description: document.getElementById("ea_desc").value,
        given_by_user_id: state.user.user_id,
        given_by: state.user.fullName
    };

    const res = await fetch("api/assistance.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
       loadDashboardData().then(() => navigate("assistance"));
    } else {
        alert(result.message);
    }
}


// ================================================================
// DELETE ASSISTANCE
// ================================================================
async function deleteAssistance(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Assistance Record", "Are you sure you want to delete this assistance record?", () => deleteAssistance(id, true));
        return;
    }

    const res = await fetch("api/assistance.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistance_id: id })
    });

    const result = await res.json();

    if (result.success) {
       loadDashboardData().then(() => navigate("assistance"));
    } else {
        alert(result.message);
    }
}

// ================================================================
// SUPPLY ROWS
// ================================================================

async function loadSupply() {
    const res = await fetch("api/supply.php");
    state.foodSupply = await res.json();
}

function renderSupply(c) {
    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Food Supply Monitoring</div>
                <div class="page-subtitle">Track commodity stocks and storage levels</div>
            </div>

            <div class="flex items-center gap-3">
                <input 
                    id="supplySearch"
                    type="text"
                    class="search-input w-64"
                    placeholder="Search supply..."
                    oninput="filterSupply()"
                >

                <button class="btn-primary" onclick="openAddSupply()">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add Supply
                </button>
            </div>
        </div>

        <div class="card">
            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Commodity</th>
                            <th class="px-4 py-2 text-left">Available</th>
                            <th class="px-4 py-2 text-left">Capacity</th>
                            <th class="px-4 py-2 text-left">Unit</th>
                            <th class="px-4 py-2 text-left">Location</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            <th class="px-4 py-2 text-left">Date</th>
                            <th class="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody id="supplyTableBody">
                        ${renderSupplyRows(state.foodSupply)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}

function filterSupply() {
    const q = document.getElementById("supplySearch").value.toLowerCase();

    const filtered = state.foodSupply.filter(s =>
        (s.food_name || "").toLowerCase().includes(q) ||
        (s.location || "").toLowerCase().includes(q) ||
        (s.status || "").toLowerCase().includes(q) ||
        (s.unit || "").toLowerCase().includes(q) ||
        String(s.quantity_available).includes(q) ||
        String(s.capacity).includes(q)
    );

    document.getElementById("supplyTableBody").innerHTML =
        renderSupplyRows(filtered);
}


function renderSupplyRows(list) {
    if (!list.length) {
        return `
            <tr>
                <td colspan="8" class="empty-row py-10 text-center text-slate-400">
                    <i data-lucide="package" class="w-7 h-7 opacity-50"></i>
                    <div>No supply records found</div>
                </td>
            </tr>
        `;
    }

    return list.map((s, idx) => `
        <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}">
            <td class="px-4 py-2">${s.food_name || "Commodity #" + s.food_id}</td>
            <td class="px-4 py-2">${s.quantity_available}</td>
            <td class="px-4 py-2">${s.capacity}</td>
            <td class="px-4 py-2">${s.unit}</td>
            <td class="px-4 py-2">${s.location}</td>
            <td class="px-4 py-2">
                <span class="badge 
                    ${s.status === "Critical" ? "badge-red" :
                      s.status === "Moderate" ? "badge-amber" :
                      "badge-green"}">
                    ${s.status}
                </span>
            </td>
            <td class="px-4 py-2">${s.record_date}</td>

            <td class="px-4 py-2 text-right">
                <button class="table-btn text-blue-600" onclick="openEditSupply(${s.supply_id})">Edit</button>
                <button class="table-btn text-red-600 ml-2" onclick="deleteSupply(${s.supply_id})">Delete</button>
            </td>
        </tr>
    `).join("");
}


// ================================================================
// ADD SUPPLY FORM
// ================================================================
function openAddSupply() {
    const options = state.foodItems.map(f => `
        <option value="${f.food_id}">${f.name}</option>
    `).join("");

    openModal(`
        <h2 class="modal-title mb-4">Add Commodity Supply</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Commodity</label>
                <select id="fs_food" class="form-input">
                    <option value="">-- Select Commodity --</option>
                    ${options}
                </select>
            </div>

            <div>
                <label class="form-label">Quantity Available</label>
                <input id="fs_qty" type="number" class="form-input">
            </div>

            <div>
                <label class="form-label">Capacity</label>
                <input id="fs_cap" type="number" class="form-input">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="fs_unit" class="form-input" placeholder="e.g. bags (50kg)">
            </div>

            <div>
                <label class="form-label">Location</label>
                <input id="fs_loc" class="form-input">
            </div>

            <div class="col-span-2">
                <label class="form-label">Remarks</label>
                <textarea id="fs_remarks" class="form-input"></textarea>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveSupply()">Save</button>
        </div>
    `);
}


async function saveSupply() {
    const food_id = document.getElementById("fs_food").value;

    if (!food_id) {
        alert("Please select a commodity.");
        return;
    }

    const qty = Number(document.getElementById("fs_qty").value);
    const cap = Number(document.getElementById("fs_cap").value);

    // AUTO STATUS CALCULATION
    let autoStatus = "Adequate";
    const percent = (qty / cap) * 100;

    if (percent < 40) autoStatus = "Critical";
    else if (percent < 70) autoStatus = "Moderate";

    const data = {
        food_id: food_id,
        quantity_available: qty,
        capacity: cap,
        unit: document.getElementById("fs_unit").value,
        location: document.getElementById("fs_loc").value,
        status: autoStatus,
        remarks: document.getElementById("fs_remarks").value
    };

    const res = await fetch("api/supply.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("supply"));
    } else {
        alert(result.message || "Failed to save supply record.");
    }
}


function openEditSupply(id) {
    const s = state.foodSupply.find(x => x.supply_id == id);

    const options = state.foodItems.map(f => `
        <option value="${f.food_id}" ${f.food_id == s.food_id ? "selected" : ""}>
            ${f.name}
        </option>
    `).join("");

    openModal(`
        <h2 class="modal-title mb-4">Edit Commodity Supply</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Commodity</label>
                <select id="es_food" class="form-input">
                    ${options}
                </select>
            </div>

            <div>
                <label class="form-label">Quantity Available</label>
                <input id="es_qty" type="number" class="form-input" value="${s.quantity_available}">
            </div>

            <div>
                <label class="form-label">Capacity</label>
                <input id="es_cap" type="number" class="form-input" value="${s.capacity}">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="es_unit" class="form-input" value="${s.unit}">
            </div>

            <div>
                <label class="form-label">Location</label>
                <input id="es_loc" class="form-input" value="${s.location}">
            </div>

            <div class="col-span-2">
                <label class="form-label">Remarks</label>
                <textarea id="es_remarks" class="form-input">${s.remarks || ""}</textarea>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateSupply(${id})">Save Changes</button>
        </div>
    `);
}

async function updateSupply(id) {
    const qty = Number(document.getElementById("es_qty").value);
    const cap = Number(document.getElementById("es_cap").value);

    // AUTO STATUS CALCULATION
    let autoStatus = "Adequate";
    const percent = (qty / cap) * 100;

    if (percent < 40) autoStatus = "Critical";
    else if (percent < 70) autoStatus = "Moderate";

    const data = {
        supply_id: id,
        food_id: document.getElementById("es_food").value,
        quantity_available: qty,
        capacity: cap,
        unit: document.getElementById("es_unit").value,
        location: document.getElementById("es_loc").value,
        status: autoStatus,
        remarks: document.getElementById("es_remarks").value
    };

    const res = await fetch("api/supply.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("supply"));
    } else {
        alert(result.message || "Failed to update supply record.");
    }
}


async function deleteSupply(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Supply Record", "Are you sure you want to delete this supply record?", () => deleteSupply(id, true));
        return;
    }

    const res = await fetch("api/supply.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supply_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("supply"));
    } else {
        alert(result.message || "Failed to delete supply record.");
    }
}


function renderStapleFood(c) {
    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Staple Food Management</div>
                <div class="page-subtitle">Manage commodities used in supply records</div>
            </div>

            <div class="flex items-center gap-3">
                <input 
                    id="foodSearch"
                    type="text"
                    class="search-input w-64"
                    placeholder="Search food..."
                    oninput="filterFood()"
                >

                <button class="btn-primary" onclick="openAddFood()">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add Food
                </button>
            </div>
        </div>

        <div class="card">
            <table class="data-table w-full text-sm">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-4 py-2 text-left">Name</th>
                        <th class="px-4 py-2 text-left">Category</th>
                        <th class="px-4 py-2 text-left">Unit</th>
                        <th class="px-4 py-2 text-right">Actions</th>
                    </tr>
                </thead>

                <tbody id="foodTableBody">
                    ${renderFoodRows(state.foodItems)}
                </tbody>
            </table>
        </div>
    `;

    lucide.createIcons();
}

function renderFoodRows(list) {
    if (!list.length) {
        return `
            <tr>
                <td colspan="4" class="empty-row py-10 text-center text-slate-400">
                    <i data-lucide="package" class="w-7 h-7 opacity-50"></i>
                    <div>No staple foods found</div>
                </td>
            </tr>
        `;
    }

    return list.map(f => `
        <tr>
            <td class="px-4 py-2">${f.name}</td>
            <td class="px-4 py-2">${f.category}</td>
            <td class="px-4 py-2">${f.unit}</td>

            <td class="px-4 py-2 text-right">
                <button class="table-btn text-blue-600" onclick="openEditFood(${f.food_id})">Edit</button>
                <button class="table-btn text-red-600 ml-2" onclick="deleteFood(${f.food_id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

function filterFood() {
    const q = document.getElementById("foodSearch").value.toLowerCase();

    const filtered = state.foodItems.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.unit.toLowerCase().includes(q)
    );

    document.getElementById("foodTableBody").innerHTML =
        renderFoodRows(filtered);
}

function openAddFood() {
    openModal(`
        <h2 class="modal-title mb-4">Add Staple Food</h2>

        <div class="form-grid">
            <div>
                <label class="form-label">Name</label>
                <input id="sf_name" class="form-input">
            </div>

            <div>
                <label class="form-label">Category</label>
                <input id="sf_category" class="form-input">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="sf_unit" class="form-input">
            </div>
        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="saveFood()">Save</button>
        </div>
    `);
}

async function saveFood() {
    const data = {
        name: document.getElementById("sf_name").value,
        category: document.getElementById("sf_category").value,
        unit: document.getElementById("sf_unit").value
    };

    const res = await fetch("api/staple_food.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        navigate("staple_food");
    } else {
        alert("Failed to save food.");
    }
}

function openEditFood(id) {
    const f = state.foodItems.find(x => x.food_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Staple Food</h2>

        <div class="form-grid">
            <div>
                <label class="form-label">Name</label>
                <input id="ef_name" class="form-input" value="${f.name}">
            </div>

            <div>
                <label class="form-label">Category</label>
                <input id="ef_category" class="form-input" value="${f.category}">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="ef_unit" class="form-input" value="${f.unit}">
            </div>
        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updateFood(${id})">Save Changes</button>
        </div>
    `);
}

async function updateFood(id) {
    const data = {
        food_id: id,
        name: document.getElementById("ef_name").value,
        category: document.getElementById("ef_category").value,
        unit: document.getElementById("ef_unit").value
    };

    const res = await fetch("api/staple_food.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        navigate("staple_food");
    } else {
        alert("Failed to update food.");
    }
}

async function deleteFood(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Staple Food", "Are you sure you want to delete this staple food?", () => deleteFood(id, true));
        return;
    }

    const res = await fetch("api/staple_food.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_id: id })
    });

    const result = await res.json();

    if (result.success) {
        navigate("staple_food");
    } else {
        alert("Failed to delete food.");
    }
}


// ================================================================
// PRICE MONITORING MODULE
// ================================================================
function renderPrices(c) {
    const total = state.prices.length;

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Price Monitoring</div>
                <div class="page-subtitle">Current market prices for key agricultural commodities</div>
            </div>
            <div class="toolbar-actions">
                <input
                    id="priceSearch"
                    type="text"
                    class="search-input"
                    placeholder="Search prices..."
                    oninput="filterPrices()"
                >
                <button class="btn-secondary" onclick="syncPricesFromApi()">
                    <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    Sync API Prices
                </button>
                <button class="btn-primary" onclick="openAddPrice()">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add Price
                </button>
            </div>
        </div>

        ${total === 0 ? `
            <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                <i data-lucide="badge-dollar-sign" class="w-12 h-12 mb-3 opacity-60"></i>
                <div class="text-lg font-medium">No price records found</div>
                <div class="text-sm">Click “Add Price” to create your first record</div>
            </div>
        ` : `
            <div class="card">
                <div class="overflow-x-auto">
                    <table class="data-table w-full text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-2 text-left">Commodity</th>
                                <th class="px-4 py-2 text-left">Price</th>
                                <th class="px-4 py-2 text-left">Prev Price</th>
                                <th class="px-4 py-2 text-left">Unit</th>
                                <th class="px-4 py-2 text-left">Market Area</th>
                                <th class="px-4 py-2 text-left">Date</th>
                                <th class="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="priceTableBody">
                            ${renderPriceRows(state.prices)}
                        </tbody>
                    </table>
                </div>
            </div>
        `}
    `;

    lucide.createIcons();
}

// ================================================================
// PRICE ROWS
// ================================================================
function renderPriceRows(list) {
    if (!list.length) {
        return `
            <tr>
                <td colspan="7" class="empty-row py-10 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="badge-dollar-sign" class="w-7 h-7 opacity-50"></i>
                        <div>No matching price records found</div>
                    </div>
                </td>
            </tr>
        `;
    }

    return list.map((p, idx) => `
        <tr class="border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50 transition-colors">
            <td class="px-4 py-2 whitespace-nowrap">${p.commodity}</td>
            <td class="px-4 py-2 whitespace-nowrap">₱${Number(p.price).toFixed(2)}</td>
            <td class="px-4 py-2 whitespace-nowrap">₱${Number(p.prev_price).toFixed(2)}</td>
            <td class="px-4 py-2 whitespace-nowrap">${p.unit}</td>
            <td class="px-4 py-2 whitespace-nowrap">${p.market_area}</td>
            <td class="px-4 py-2 whitespace-nowrap">${p.record_date}</td>
            <td class="px-4 py-2 text-right">
            <button class="table-btn text-blue-600"
                onclick="openEditPrice(${p.price_id})">
                Edit
            </button>

            <button class="table-btn text-red-600 ml-2"
                onclick="deletePrice(${p.price_id})">
                Delete
            </button>
        </td>
        </tr>
    `).join("");
}

function filterPrices() {
    const q = document.getElementById("priceSearch").value.toLowerCase();
    const filtered = state.prices.filter(p =>
        String(p.commodity || "").toLowerCase().includes(q) ||
        String(p.market_area || "").toLowerCase().includes(q) ||
        String(p.unit || "").toLowerCase().includes(q) ||
        String(p.record_date || "").toLowerCase().includes(q)
    );

    document.getElementById("priceTableBody").innerHTML = renderPriceRows(filtered);
    lucide.createIcons();
}

async function syncPricesFromApi() {
    const res = await fetch("api/price_sync.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });

    const result = await res.json();

    if (result.success) {
        alert(`Price sync complete.\nSource: ${result.source}\nAdded: ${result.created}\nUpdated: ${result.updated}\nSkipped: ${result.skipped}`);
        await loadDashboardData();
        navigate("prices");
    } else {
        alert(result.message || "Failed to sync API prices.");
    }
}

// ================================================================
// ADD PRICE FORM
// ================================================================
function openAddPrice() {
    openModal(`
        <h2 class="modal-title mb-4">Add Price Record</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Commodity</label>
                <input id="pr_commodity" class="form-input" placeholder="e.g. Rice (Regular)">
            </div>

            <div>
                <label class="form-label">Current Price</label>
                <input id="pr_price" type="number" class="form-input" placeholder="0.00">
            </div>

            <div>
                <label class="form-label">Previous Price</label>
                <input id="pr_prev" type="number" class="form-input" placeholder="0.00">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="pr_unit" class="form-input" placeholder="/kg">
            </div>

            <div>
                <label class="form-label">Market Area</label>
                <input id="pr_market" class="form-input" placeholder="Daet Market">
            </div>

            <div>
                <label class="form-label">Date</label>
                <input id="pr_date" type="date" class="form-input">
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="savePrice()">Save</button>
        </div>
    `);
}

// ================================================================
// SAVE PRICE
// ================================================================
async function savePrice() {
    const data = {
        commodity: document.getElementById("pr_commodity").value,
        price: document.getElementById("pr_price").value,
        prev_price: document.getElementById("pr_prev").value,
        unit: document.getElementById("pr_unit").value,
        market_area: document.getElementById("pr_market").value,
        record_date: document.getElementById("pr_date").value
    };

    const res = await fetch("api/prices.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("prices"));
    } else {
        alert(result.message || "Failed to save price record.");
    }
}

function openEditPrice(id) {
    const p = state.prices.find(x => x.price_id == id);

    openModal(`
        <h2 class="modal-title mb-4">Edit Price Record</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Commodity</label>
                <input id="pr_commodity" class="form-input" value="${p.commodity}">
            </div>

            <div>
                <label class="form-label">Current Price</label>
                <input id="pr_price" type="number" class="form-input" value="${p.price}">
            </div>

            <div>
                <label class="form-label">Previous Price</label>
                <input id="pr_prev" type="number" class="form-input" value="${p.prev_price}">
            </div>

            <div>
                <label class="form-label">Unit</label>
                <input id="pr_unit" class="form-input" value="${p.unit}">
            </div>

            <div>
                <label class="form-label">Market Area</label>
                <input id="pr_market" class="form-input" value="${p.market_area}">
            </div>

            <div>
                <label class="form-label">Date</label>
                <input id="pr_date" type="date" class="form-input" value="${p.record_date}">
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn-primary" onclick="updatePrice(${id})">Save Changes</button>
        </div>
    `);
}


async function updatePrice(id) {
    const data = {
        price_id: id,
        commodity: document.getElementById("pr_commodity").value,
        price: document.getElementById("pr_price").value,
        prev_price: document.getElementById("pr_prev").value,
        unit: document.getElementById("pr_unit").value,
        market_area: document.getElementById("pr_market").value,
        record_date: document.getElementById("pr_date").value
    };

    const res = await fetch("api/prices.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("prices"));
    } else {
        alert(result.message || "Failed to update price record.");
    }
}

async function deletePrice(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete Price Record", "Are you sure you want to delete this price record?", () => deletePrice(id, true));
        return;
    }

    const res = await fetch("api/prices.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("prices"));
    } else {
        alert(result.message || "Failed to delete price record.");
    }
}

// ================================================================
// WEATHER FORECAST MODULE
// ================================================================
function renderWeather(c) {
    const w = state.weatherData || {
        location: "Local Area",
        current: { temp: "–", condition: "No data" },
        forecast: []
    };

    c.innerHTML = `
        <div class="page-header flex items-center justify-between">
            <div>
                <div class="page-title">Weather Forecast</div>
                <div class="page-subtitle">Real‑time weather updates for your area</div>
            </div>

            <!-- LOCATION SELECTOR -->
           <select id="locSelect" onchange="updateLocation()" class="form-select w-48">
    <option value="14.0667,122.9167">Basud</option>
    <option value="14.3333,122.5000">Capalonga</option>
    <option value="14.1122,122.9553">Daet (Capital)</option>
    <option value="14.2900,122.7000">Jose Panganiban</option>
    <option value="14.1533,122.8333">Labo</option>
    <option value="14.0667,122.9500">Mercedes</option>
    <option value="14.2833,122.7833">Paracale</option>
    <option value="14.2000,122.4167">San Lorenzo Ruiz</option>
    <option value="14.1333,122.7833">San Vicente</option>
    <option value="14.2000,122.4167">Santa Elena</option>
    <option value="14.1333,122.9833">Talisay</option>
    <option value="14.2833,122.7833">Vinzons</option>
</select>
 </div>

        <!-- CURRENT WEATHER -->
        <div class="card mb-6 p-6 flex items-center gap-6">
            <i data-lucide="${getWeatherIcon(w.current.condition || "")}" class="w-14 h-14 text-emerald-600"></i>
            <div>
                <div class="text-3xl font-semibold">${w.current.temp}°C</div>
                <div class="text-slate-600">${w.current.condition}</div>
                <div class="text-sm text-slate-400 mt-1">${w.location || "Local Area"}</div>
            </div>
        </div>

        <!-- FORECAST -->
        ${w.forecast && w.forecast.length ? `
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                ${w.forecast.map(day => `
                    <div class="card p-4 text-center">
                        <div class="font-medium mb-1">${day.day}</div>
                        <i data-lucide="${getWeatherIcon(day.condition)}" class="w-10 h-10 mx-auto text-emerald-600"></i>
                        <div class="text-xl font-semibold mt-2">${day.temp}°C</div>
                        <div class="text-slate-500 text-sm">${day.condition}</div>
                    </div>
                `).join("")}
            </div>
        ` : `
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
                <i data-lucide="cloud-alert" class="w-10 h-10 mb-3 opacity-60"></i>
                <div class="text-sm">No forecast data available</div>
            </div>
        `}
    `;

    lucide.createIcons();
}


async function loadWeatherData() {
    const lat = state.location.lat;
    const lon = state.location.lon;

    const res = await fetch(`api/weather.php?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    state.weatherData = data;
    state.weatherUpdated = new Date().toLocaleString();
}


async function updateLocation() {
    const [lat, lon] = document.getElementById("locSelect").value.split(",");

    state.location = { lat, lon };

    await loadWeatherData();   // refresh weather
    navigate("weather");       // reload weather page
}



// ================================================================
// WEATHER ICON MAPPER
// ================================================================
function getWeatherIcon(condition) {
    condition = (condition || "").toLowerCase();

    if (condition.includes("rain")) return "cloud-rain";
    if (condition.includes("storm") || condition.includes("thunder")) return "cloud-lightning";
    if (condition.includes("cloud")) return "cloud";
    if (condition.includes("sun") || condition.includes("clear")) return "sun";
    if (condition.includes("wind")) return "wind";

    return "cloud-sun";
}
function getWeatherIcon(condition) {
    const map = {
        "Clear": "sun",
        "Sunny": "sun",
        "Clouds": "cloud",
        "Partly Cloudy": "cloud-sun",
        "Overcast": "cloud",
        "Rain": "cloud-rain",
        "Light Rain": "cloud-rain",
        "Heavy Rain": "cloud-rain",
        "Thunderstorm": "cloud-lightning",
        "Drizzle": "cloud-drizzle",
        "Mist": "cloud-fog",
        "Fog": "cloud-fog",
        "Haze": "cloud-fog"
    };
    return map[condition] || "cloud";
}


async function renderRecommendations(c) {
    const external = await fetchExternalRecommendations();
    const advisories = Array.isArray(external.advisories) ? external.advisories : [];
    const advisoryCards = advisories.length
        ? advisories.map(a =>
            advisoryCard(
                "WEATHER-BASED ADVISORY",
                "alert-triangle",
                "Recommendation",
                a
            )
        ).join("")
        : advisoryCard(
            "NO ADVISORIES AVAILABLE",
            "check-circle",
            "Recommendation",
            "No weather-based advisories are available right now."
        );

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Crop Advisories</div>
                <div class="page-subtitle">Generated using live weather + Python microservice</div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${advisoryCards}
        </div>
    `;

    lucide.createIcons();
}

function renderWeatherTrends(c) {
    const forecast = state.weatherData.forecast;

    const labels = forecast.map(f => f.day);
    const temps = forecast.map(f => f.temp);
    const rain = forecast.map(f => f.condition.includes("Rain") ? 80 : 10);

    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">Weather Trends</div>
                <div class="page-subtitle">5‑day temperature and rainfall outlook</div>
            </div>
        </div>

        <div class="card p-6">
            <canvas id="trendChart" height="120"></canvas>
        </div>
    `;

    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temps,
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245,158,11,0.2)",
                    tension: 0.3
                },
                {
                    label: "Rain Probability (%)",
                    data: rain,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59,130,246,0.2)",
                    tension: 0.3
                }
            ]
        }
    });
}

async function fetchExternalRecommendations() {
    const fallback = { advisories: generateAdvisories(), source: "local" };

    const payload = {
        temp: state.weatherData?.current?.temp,
        condition: state.weatherData?.current?.condition,
        forecast: Array.isArray(state.weatherData?.forecast) ? state.weatherData.forecast : []
    };

    try {
        const res = await fetch("api/recommend.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) return fallback;

        const data = await res.json();
        if (!data || !Array.isArray(data.advisories)) return fallback;

        return data.advisories.length ? data : fallback;
    } catch (e) {
        console.warn("Recommendation service failed, using local advisories.", e);
        return fallback;
    }
}


// ================================================================
// ADVISORY CARD COMPONENT
// ================================================================
function advisoryCard(title, icon, subtitle, body) {
    return `
        <div class="card p-6 border-l-4 border-emerald-500">
            <div class="flex items-center gap-3 mb-3">
                <i data-lucide="${icon}" class="w-6 h-6 text-emerald-600"></i>
                <div class="font-semibold text-lg">${title}</div>
            </div>
            <div class="font-medium text-emerald-700 mb-1">${subtitle}</div>
            <div class="text-slate-600 text-sm leading-relaxed">${body}</div>
        </div>
    `;
}

function generateAdvisories() {
    const w = state.weatherData?.current || {};
    const forecast = Array.isArray(state.weatherData?.forecast) ? state.weatherData.forecast : [];

    let advisories = [];

    // Heat stress
    if (Number(w.temp) >= 33) {
        advisories.push("High temperature detected. Irrigate early morning to reduce heat stress.");
    }

    // Rainfall alert
    if (forecast.some(f => (f.condition || "").includes("Rain"))) {
        advisories.push("Rain expected in the next few days. Delay fertilizer application.");
    }

    // Drying advisory
    const sunnyDays = forecast.filter(f => f.condition === "Clear" || f.condition === "Sunny").length;
    if (sunnyDays >= 2) {
        advisories.push("Multiple sunny days ahead. Ideal for grain drying.");
    }

    // Planting window
    if (sunnyDays >= 2 && !forecast.some(f => (f.condition || "").includes("Rain"))) {
        advisories.push("Stable weather ahead. Good window for planting or transplanting.");
    }

    if (!advisories.length) {
        advisories.push("No critical weather risks detected. Continue regular farm operations.");
    }

    return advisories;
}

// ================================================================
// REPORTS & ANALYTICS MODULE
// ================================================================
// ================================================================
// REPORT FILTER STATE
// ================================================================
state.reportFilter = {
    start: null,
    end: null
};

// ================================================================
// REPORT FILTER FUNCTIONS
// ================================================================
function setReportFilter(type) {
    const today = new Date();
    let start, end;

    if (type === "today") {
        start = end = today.toISOString().split("T")[0];
    }

    if (type === "month") {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
    }

    state.reportFilter.start = start;
    state.reportFilter.end = end;

    navigate("reports");
}

function applyCustomFilter() {
    const start = document.getElementById("filter_start").value;
    const end = document.getElementById("filter_end").value;

    if (!start || !end) {
        alert("Please select both start and end dates.");
        return;
    }

    state.reportFilter.start = start;
    state.reportFilter.end = end;

    navigate("reports");
}

// ================================================================
// REPORTS MODULE
// ================================================================
function renderReports(c) {
    const limitedReports = currentRole() === "OFFICER";

    // FILTERED DATA
    const filterStart = state.reportFilter.start;
    const filterEnd = state.reportFilter.end;

    const filterDate = (date) => {
        if (!filterStart || !filterEnd) return true;
        return date >= filterStart && date <= filterEnd;
    };

    const filteredDistributions = state.distributions.filter(d => filterDate(d.date));
    const filteredAssistance = state.assistance.filter(a => filterDate(a.date_requested));
    const filteredSupply = state.foodSupply.filter(s => filterDate(s.date_recorded || s.date));

    // COMPUTATIONS
    const totalFarmers = state.farmers.length;

    const totalDistributions = filteredDistributions.length;
    const totalUnits = filteredDistributions.reduce((sum, d) => sum + Number(d.quantity || 0), 0);

    const totalAssistance = filteredAssistance.length;
    const releasedAssistance = filteredAssistance.filter(a => a.status === "Released").length;

    const lowSupply = filteredSupply.filter(s => s.status === "Critical" || s.status === "Low").length;

    // FARM TYPE COUNTS
    const farmTypeCounts = {
        Crop: state.farmers.filter(f => f.farm_type === "Crop").length,
        Livestock: state.farmers.filter(f => f.farm_type === "Livestock").length,
        Mixed: state.farmers.filter(f => f.farm_type === "Mixed").length
    };

    // ASSISTANCE STATUS COUNTS
    const assistanceCounts = {
        Pending: filteredAssistance.filter(a => a.status === "Pending").length,
        Released: filteredAssistance.filter(a => a.status === "Released").length,
        Cancelled: filteredAssistance.filter(a => a.status === "Cancelled").length
    };

    // DISTRIBUTION BY PROGRAM
    const programCounts = {};
    filteredDistributions.forEach(d => {
        const p = d.program_name || "Uncategorized";
        programCounts[p] = (programCounts[p] || 0) + Number(d.quantity || 0);
    });

    // FOOD SUPPLY SUMMARY
    const supplyRows = filteredSupply.map(s => `
        <tr>
            <td class="px-4 py-2">${s.food_name || "Unknown"}</td>
            <td class="px-4 py-2">${s.quantity_available}</td>
            <td class="px-4 py-2">${s.status}</td>
        </tr>
    `).join("");

    // RENDER UI
    c.innerHTML = `
        <style>
            @media print {
                canvas { max-height: 220px !important; width: 100% !important; }
                .chart-box { page-break-inside: avoid; }
                .btn-primary, .btn-secondary, .sidebar, .top-bar { display: none !important; }
            }
        </style>

        <div class="page-header">
            <div>
                <div class="page-title">Reports & Analytics</div>
                <div class="page-subtitle">${limitedReports ? "Operational report view for field staff" : "Aggregated data for planning and evaluation"}</div>
            </div>

            <button class="btn-primary" onclick="window.print()">
                <i data-lucide="printer" class="w-4 h-4"></i>
                Print Report
            </button>
        </div>

        ${!limitedReports ? `<button class="btn-secondary" onclick="exportReportExcel()">
    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
    Export Excel
</button>` : ""}

        <!-- FILTER BAR -->
        <div class="card mb-6 p-4 flex flex-wrap gap-3 items-center">
            <button class="btn-secondary" onclick="setReportFilter('today')">Today</button>
            <button class="btn-secondary" onclick="setReportFilter('month')">This Month</button>

            <div class="flex items-center gap-2">
                <input type="date" id="filter_start" class="form-input" value="${filterStart || ""}">
                <span>to</span>
                <input type="date" id="filter_end" class="form-input" value="${filterEnd || ""}">
                <button class="btn-primary" onclick="applyCustomFilter()">Apply</button>
            </div>
        </div>

        <!-- ACTIVE FILTER DISPLAY -->
        <div class="text-sm text-slate-500 mb-4">
            Showing results for:
            <strong>
                ${filterStart ? filterStart : "All Time"}
                ${filterEnd ? " to " + filterEnd : ""}
            </strong>
        </div>

        <!-- SUMMARY CARDS -->
        <div class="stat-grid mb-6">
            ${statCard("Registered Farmers", totalFarmers, "users", "green", "All beneficiaries")}
            ${statCard("Total Distributions", totalDistributions, "package", "amber", totalUnits + " units")}
            ${statCard("Assistance Cases", totalAssistance, "hand-helping", "blue", releasedAssistance + " released")}
            ${statCard("Low Supply Items", lowSupply, "alert-triangle", "red", "Need restock")}
        </div>

        <!-- CHARTS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="card chart-box">
                <div class="card-header">Farmers by Farm Type</div>
                <canvas id="farmTypeChart" style="max-height:260px;"></canvas>
            </div>

            <div class="card chart-box">
                <div class="card-header">Assistance Status Breakdown</div>
                <canvas id="assistChart" style="max-height:260px;"></canvas>
            </div>
        </div>

        <div class="card chart-box mb-6">
            <div class="card-header">Distribution by Program</div>
            <canvas id="programChart" style="max-height:300px;"></canvas>
        </div>

        <!-- SUPPLY SUMMARY -->
        <div class="card">
            <div class="card-header">Food Supply Summary</div>
            <table class="data-table w-full text-sm">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-4 py-2 text-left">Commodity</th>
                        <th class="px-4 py-2 text-left">Stock</th>
                        <th class="px-4 py-2 text-left">Level</th>
                    </tr>
                </thead>
                <tbody>${supplyRows}</tbody>
            </table>
        </div>
    `;

    lucide.createIcons();

    // CHARTS
    setTimeout(() => {
        new Chart(document.getElementById("farmTypeChart"), {
            type: "pie",
            data: {
                labels: ["Crop", "Livestock", "Mixed"],
                datasets: [{
                    data: [
                        farmTypeCounts.Crop,
                        farmTypeCounts.Livestock,
                        farmTypeCounts.Mixed
                    ],
                    backgroundColor: ["#4ade80", "#60a5fa", "#fbbf24"]
                }]
            },
            options: { maintainAspectRatio: false }
        });

        new Chart(document.getElementById("assistChart"), {
            type: "doughnut",
            data: {
                labels: ["Pending", "Released", "Cancelled"],
                datasets: [{
                    data: [
                        assistanceCounts.Pending,
                        assistanceCounts.Released,
                        assistanceCounts.Cancelled
                    ],
                    backgroundColor: ["#fbbf24", "#4ade80", "#f87171"]
                }]
            },
            options: { maintainAspectRatio: false }
        });

        new Chart(document.getElementById("programChart"), {
            type: "bar",
            data: {
                labels: Object.keys(programCounts),
                datasets: [{
                    label: "Units Distributed",
                    data: Object.values(programCounts),
                    backgroundColor: "#60a5fa"
                }]
            },
            options: { maintainAspectRatio: false }
        });
    }, 200);

    // FORCE RESIZE BEFORE PRINT
    window.addEventListener("beforeprint", () => {
        ["farmTypeChart", "assistChart", "programChart"].forEach(id => {
            const chart = Chart.getChart(id);
            if (chart) chart.resize();
        });
    });
}


function setReportFilter(type) {
    const today = new Date();
    let start, end;

    if (type === "today") {
        start = end = today.toISOString().split("T")[0];
    }

    if (type === "month") {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
    }

    state.reportFilter.start = start;
    state.reportFilter.end = end;

    navigate("reports");
}

function applyCustomFilter() {
    const start = document.getElementById("filter_start").value;
    const end = document.getElementById("filter_end").value;

    if (!start || !end) {
        alert("Please select both start and end dates.");
        return;
    }

    state.reportFilter.start = start;
    state.reportFilter.end = end;

    navigate("reports");
}

function exportReportExcel() {

    // APPLY FILTERS
    const filterStart = state.reportFilter.start;
    const filterEnd = state.reportFilter.end;

    const filterDate = (date) => {
        if (!filterStart || !filterEnd) return true;
        return date >= filterStart && date <= filterEnd;
    };

    const filteredDistributions = state.distributions.filter(d => filterDate(d.date));
    const filteredAssistance = state.assistance.filter(a => filterDate(a.date_requested));
    const filteredSupply = state.foodSupply.filter(s => filterDate(s.date_recorded || s.date));

    // SUMMARY SHEET
    const summary = [
        ["Report Range", filterStart ? filterStart + " to " + filterEnd : "All Time"],
        ["Registered Farmers", state.farmers.length],
        ["Total Distributions", filteredDistributions.length],
        ["Total Units Distributed", filteredDistributions.reduce((sum, d) => sum + Number(d.quantity || 0), 0)],
        ["Assistance Cases", filteredAssistance.length],
        ["Released Assistance", filteredAssistance.filter(a => a.status === "Released").length],
        ["Low Supply Items", filteredSupply.filter(s => s.status === "Critical" || s.status === "Low").length]
    ];

    // DISTRIBUTIONS SHEET
    const distributionSheet = [
        ["Program", "Commodity", "Quantity", "Farmer", "Cooperative", "Date"],
        ...filteredDistributions.map(d => [
            d.program_name,
            d.input_name,
            d.quantity,
            d.farmer_name,
            d.cooperative_name,
            d.date
        ])
    ];

    // ASSISTANCE SHEET
    const assistanceSheet = [
        ["Beneficiary", "Type", "Program", "Value", "Status", "Date Requested"],
        ...filteredAssistance.map(a => [
            a.beneficiary_name,
            a.assistance_type,
            a.program,
            a.value,
            a.status,
            a.date_requested
        ])
    ];

    // FOOD SUPPLY SHEET
    const supplySheet = [
        ["Commodity", "Stock", "Level", "Last Updated"],
        ...filteredSupply.map(s => [
            s.food_name || "Unknown",
            s.quantity_available,
            s.status,
            s.date_recorded || s.date
        ])
    ];

    // FARMERS SHEET (full dataset)
    const farmerSheet = [
        ["Name", "Location", "Farm Size", "Type", "Cooperative", "Contact", "Status"],
        ...state.farmers.map(f => [
            f.full_name,
            f.farm_location,
            f.farm_size_ha,
            f.farm_type,
            f.cooperative,
            f.contact_number,
            f.status
        ])
    ];

    // CREATE WORKBOOK
    const wb = XLSX.utils.book_new();

    // ADD SHEETS
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(distributionSheet), "Distributions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(assistanceSheet), "Assistance");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(supplySheet), "Food Supply");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(farmerSheet), "Farmers");

    // EXPORT FILE
    XLSX.writeFile(wb, "AgriForecast_Report.xlsx");
}


function renderSupplySummaryRows(list) {
    if (!list.length) {
        return `
            <tr>
                <td colspan="3" class="py-6 text-center text-slate-400">No supply data</td>
            </tr>
        `;
    }

    return list.map(s => {
        const level = Number(s.quantity_available) / Number(s.capacity);
        let label = "Moderate";
        if (level < 0.25) label = "Low";
        if (level > 0.75) label = "High";

        return `
            <tr class="border-b last:border-0">
                <td class="px-4 py-2">${s.commodity_name}</td>
                <td class="px-4 py-2">${s.quantity_available}</td>
                <td class="px-4 py-2">${label}</td>
            </tr>
        `;
    }).join("");
}

// ================================================================
// USER MANAGEMENT MODULE
// ================================================================
function renderUsers(c) {
    c.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title">User Management</div>
                <div class="page-subtitle">Manage system accounts and access levels</div>
            </div>
            <button class="btn-primary" onclick="openAddUser()">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                Add User
            </button>
        </div>

        <div class="card mt-4">
            <div class="overflow-x-auto">
                <table class="data-table w-full text-sm">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Full Name</th>
                            <th class="px-4 py-2 text-left">Username</th>
                            <th class="px-4 py-2 text-left">Email</th>
                            <th class="px-4 py-2 text-left">Role</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            <th class="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderUserRows(state.users || [])}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}


function renderUserRows(list) {
    if (!list.length) {
        return `
            <tr>
                <td colspan="6" class="py-10 text-center text-slate-400">
                    <i data-lucide="users" class="w-6 h-6 opacity-50"></i>
                    <div>No users found</div>
                </td>
            </tr>
        `;
    }

    return list.map(u => `
        <tr class="border-b last:border-0">
            <td class="px-4 py-2">${u.full_name}</td>
            <td class="px-4 py-2">${u.username}</td>
            <td class="px-4 py-2">${u.email}</td>
            <td class="px-4 py-2">${roleLabel(u.role)}</td>
            <td class="px-4 py-2">${u.status}</td>
            <td class="px-4 py-2 text-right whitespace-nowrap">
                <button class="table-btn text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                    onclick="openEditUser(${u.user_id})">Edit</button>
                <button class="table-btn text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                    onclick="deleteUser(${u.user_id})">Delete</button>
            </td>
        </tr>
    `).join("");
}


function openEditUser(id) {
    const u = (state.users || []).find(x => x.user_id == id);
    if (!u) {
        alert("User not found.");
        return;
    }

    openModal(`
        <h2 class="modal-title mb-4">Edit User</h2>

        <div class="form-grid">
            <div>
                <label class="form-label">Full Name</label>
                <input id="edit_user_fullname" type="text" class="form-input" value="${u.full_name || ""}">
            </div>

            <div>
                <label class="form-label">Username</label>
                <input id="edit_user_username" type="text" class="form-input" value="${u.username || ""}">
            </div>

            <div>
                <label class="form-label">New Password</label>
                <input id="edit_user_password" type="password" class="form-input" placeholder="Leave blank to keep current password">
            </div>

            <div>
                <label class="form-label">Email</label>
                <input id="edit_user_email" type="email" class="form-input" value="${u.email || ""}">
            </div>

            <div>
                <label class="form-label">Role</label>
                <select id="edit_user_role" class="form-input">
                    <option value="ADMIN" ${u.role === "ADMIN" ? "selected" : ""}>Admin</option>
                    <option value="OFFICER" ${u.role === "OFFICER" ? "selected" : ""}>Officer</option>
                    <option value="COOPERATIVE" ${u.role === "COOPERATIVE" ? "selected" : ""}>Cooperative</option>
                    <option value="USER" ${u.role === "USER" || u.role === "FARMER" ? "selected" : ""}>Farmer</option>
                </select>
            </div>

            <div id="edit_coop_user_field" style="${u.role === "COOPERATIVE" ? "" : "display:none;"}">
                <label class="form-label">Assign Cooperative</label>
                <select id="edit_user_cooperative_id" class="form-input">
                    <option value="">-- Select Cooperative --</option>
                    ${state.cooperatives.map(c => `
                        <option value="${c.cooperative_id}" ${String(u.cooperative_id || "") === String(c.cooperative_id) ? "selected" : ""}>${c.name}</option>
                    `).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="edit_user_status" class="form-input">
                    <option value="Active" ${u.status === "Active" ? "selected" : ""}>Active</option>
                    <option value="Inactive" ${u.status === "Inactive" ? "selected" : ""}>Inactive</option>
                </select>
            </div>
        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn-primary" onclick="updateUser(${id})">Save Changes</button>
        </div>
    `);

    document.getElementById("edit_user_role").addEventListener("change", () => {
        const role = document.getElementById("edit_user_role").value;
        document.getElementById("edit_coop_user_field").style.display =
            role === "COOPERATIVE" ? "block" : "none";
    });
}


function openAddUser() {
    openModal(`
        <h2 class="modal-title mb-4">Add New User</h2>

        <div class="form-grid">

            <div>
                <label class="form-label">Full Name</label>
                <input id="u_fullname" type="text" class="form-input" placeholder="Juan Dela Cruz">
            </div>

            <div>
                <label class="form-label">Username</label>
                <input id="u_username" type="text" class="form-input" placeholder="username123">
            </div>

            <div>
    <label class="form-label">Password</label>
    <input id="u_password" type="password" class="form-input" placeholder="Enter password">
</div>


            <div>
                <label class="form-label">Email</label>
                <input id="u_email" type="email" class="form-input" placeholder="email@example.com">
            </div>

            <div>
                <label class="form-label">Role</label>
                <select id="user_role" class="form-input">
    <option value="ADMIN">Admin</option>
    <option value="OFFICER">Officer</option>
    <option value="COOPERATIVE">Cooperative</option>
    <option value="USER">Farmer</option>
</select>
            </div>

            <div id="coop_user_field" style="display:none;">
                <label class="form-label">Assign Cooperative</label>
                <select id="u_cooperative_id" class="form-input">
                    <option value="">-- Select Cooperative --</option>
                    ${state.cooperatives.map(c => `<option value="${c.cooperative_id}">${c.name}</option>`).join("")}
                </select>
            </div>

            <div>
                <label class="form-label">Status</label>
                <select id="u_status" class="form-input">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

        </div>

        <div class="modal-actions mt-6">
            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn-primary" onclick="saveUser()">Create User</button>
        </div>
    `);

    // ADD THIS OUTSIDE THE TEMPLATE
    document.getElementById("user_role").addEventListener("change", () => {
        const role = document.getElementById("user_role").value;
        document.getElementById("coop_user_field").style.display =
            role === "COOPERATIVE" ? "block" : "none";
    });
}


async function saveUser() {
    console.log("SAVE USER CLICKED");

    const data = {
        full_name: document.getElementById("u_fullname").value,
        username: document.getElementById("u_username").value,
        password: document.getElementById("u_password").value,
        email: document.getElementById("u_email").value,
        role: document.getElementById("user_role").value,
        status: document.getElementById("u_status").value,
        cooperative_id: document.getElementById("u_cooperative_id")?.value || null
    };

    const res = await fetch("api/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("users"));
    } else {
        alert(result.message);
    }
}


async function updateUser(id) {
    const data = {
        user_id: id,
        full_name: document.getElementById("edit_user_fullname").value,
        username: document.getElementById("edit_user_username").value,
        password: document.getElementById("edit_user_password").value,
        email: document.getElementById("edit_user_email").value,
        role: document.getElementById("edit_user_role").value,
        status: document.getElementById("edit_user_status").value,
        cooperative_id: document.getElementById("edit_user_cooperative_id")?.value || null
    };

    const res = await fetch("api/users.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        closeModal();
        loadDashboardData().then(() => navigate("users"));
    } else {
        alert(result.message);
    }
}


async function deleteUser(id, confirmed = false) {
    if (!confirmed) {
        openConfirmModal("Delete User", "Are you sure you want to delete this user?", () => deleteUser(id, true));
        return;
    }

    const res = await fetch("api/users.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id })
    });

    const result = await res.json();

    if (result.success) {
        loadDashboardData().then(() => navigate("users"));
    } else {
        alert(result.message);
    }
}





// ================================================================
// AUTO LOGIN (MUST BE AT THE BOTTOM)
// ================================================================
checkSession();

async function checkSession() {
    const res = await fetch("api/session.php");
    const result = await res.json();

    if (result.logged_in) {
        state.user = result.user;

        document.getElementById("login-panel").classList.add("hidden");
        document.getElementById("app-shell").classList.remove("hidden");

        setupUserInfo();
        loadDashboardData().then(() => navigate("dashboard"));
    }
}

setInterval(async () => {
    state.weatherData = await safeFetch("api/weather.php", state.weatherData);
    state.weatherUpdated = new Date().toLocaleString();

    if (document.querySelector("[data-view='dashboard']")) {
        navigate("dashboard");
    }
    if (document.querySelector("[data-view='weather']")) {
        navigate("weather");
    }
}, 1800000); // 30 minutes
