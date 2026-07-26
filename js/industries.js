/* ============================================
   ADMIN INDUSTRY MANAGEMENT PAGE CONTROLLER
   ============================================ */

const ANALYZER_PARAMETER_MAP = {
  gas: {
    label: "Gas Analyzer",
    parameters: [
      { code: "GAS_SO2", category: "gas", name: "Sulfur Dioxide", symbol: "SO₂", unit: "mg/Nm³", minVal: 0, maxVal: 200, thresholdWarning: 80, thresholdExceeded: 120, defaultVal: 38.5 },
      { code: "GAS_NOX", category: "gas", name: "Nitrogen Oxides", symbol: "NOₓ", unit: "mg/Nm³", minVal: 0, maxVal: 300, thresholdWarning: 150, thresholdExceeded: 220, defaultVal: 110.0 },
      { code: "GAS_CO", category: "gas", name: "Carbon Monoxide", symbol: "CO", unit: "mg/Nm³", minVal: 0, maxVal: 100, thresholdWarning: 45, thresholdExceeded: 70, defaultVal: 22.4 },
      { code: "GAS_CO2", category: "gas", name: "Carbon Dioxide", symbol: "CO₂", unit: "% v/v", minVal: 0, maxVal: 25, thresholdWarning: 15, thresholdExceeded: 20, defaultVal: 10.5 },
      { code: "GAS_NH3", category: "gas", name: "Ammonia Slip", symbol: "NH₃", unit: "mg/Nm³", minVal: 0, maxVal: 50, thresholdWarning: 15, thresholdExceeded: 25, defaultVal: 4.8 }
    ]
  },
  water: {
    label: "Water Analyzer",
    parameters: [
      { code: "WATER_PH", category: "water", name: "pH Level", symbol: "pH", unit: "pH", minVal: 0, maxVal: 14, thresholdWarning: 8.5, thresholdExceeded: 9.5, defaultVal: 7.2 },
      { code: "WATER_BOD", category: "water", name: "Biological Oxygen Demand", symbol: "BOD", unit: "mg/L", minVal: 0, maxVal: 100, thresholdWarning: 25, thresholdExceeded: 40, defaultVal: 16.5 },
      { code: "WATER_COD", category: "water", name: "Chemical Oxygen Demand", symbol: "COD", unit: "mg/L", minVal: 0, maxVal: 500, thresholdWarning: 180, thresholdExceeded: 250, defaultVal: 135.0 },
      { code: "WATER_TSS", category: "water", name: "Total Suspended Solids", symbol: "TSS", unit: "mg/L", minVal: 0, maxVal: 200, thresholdWarning: 60, thresholdExceeded: 100, defaultVal: 32.0 },
      { code: "WATER_TURB", category: "water", name: "Turbidity", symbol: "NTU", unit: "NTU", minVal: 0, maxVal: 100, thresholdWarning: 20, thresholdExceeded: 40, defaultVal: 8.0 }
    ]
  },
  spm: {
    label: "SPM Monitor",
    parameters: [
      { code: "SPM_PM25", category: "spm", name: "PM 2.5 Fine Particles", symbol: "PM₂.₅", unit: "µg/m³", minVal: 0, maxVal: 250, thresholdWarning: 60, thresholdExceeded: 90, defaultVal: 45.0 },
      { code: "SPM_PM10", category: "spm", name: "PM 10 Coarse Particles", symbol: "PM₁₀", unit: "µg/m³", minVal: 0, maxVal: 400, thresholdWarning: 100, thresholdExceeded: 150, defaultVal: 85.0 },
      { code: "SPM_DUST", category: "spm", name: "Stack Dust Concentration", symbol: "Dust", unit: "mg/Nm³", minVal: 0, maxVal: 150, thresholdWarning: 30, thresholdExceeded: 50, defaultVal: 18.5 }
    ]
  },
  flow: {
    label: "Flow Meter",
    parameters: [
      { code: "FLOW_GAS", category: "flow", name: "Water Flow", symbol: "Q_gas", unit: "m³/hr", minVal: 0, maxVal: 150000, thresholdWarning: 120000, thresholdExceeded: 140000, defaultVal: 78000.0 },
      { code: "FLOW_WATER", category: "flow", name: "Totalizer", symbol: "Q_eff", unit: "m³/day", minVal: 0, maxVal: 5000, thresholdWarning: 3800, thresholdExceeded: 4500, defaultVal: 2200.0 }
    ]
  }
};

const IndustriesPage = {
  render: (container, user) => {
    const isAdmin = user.role === 'admin';
    const isEngineer = user.role === 'engineer';

    if (!isAdmin && !isEngineer) {
      container.innerHTML = `
        <div class="page-body">
          <div class="glass-card text-center p-8">
            <h3 class="text-danger mb-2">Access Restricted</h3>
            <p class="text-secondary">Only Central Administrators and Field Engineers can access the Industry Management Portal.</p>
          </div>
        </div>
      `;
      return;
    }

    const industries = DataService.getIndustries();

    let html = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <h1>Industry & Plant Account Management</h1>
            <p class="header-subtitle">
              Configure connected industrial plants, default parameters, and telemetry credentials
            </p>
          </div>
          <div class="header-actions">
            ${isAdmin ? `
              <button class="btn btn-primary btn-sm" id="btn-add-industry-modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
                Register New Industry
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="page-body">
        <!-- Stats Summary -->
        <div class="stats-grid mb-6">
          <div class="stat-card primary">
            <div class="stat-header">
              <span class="stat-label">Total Connected Facilities</span>
            </div>
            <div class="stat-value">${industries.length}</div>
            <div class="stat-change text-secondary">Active Monitoring Accounts</div>
          </div>
          <div class="stat-card success">
            <div class="stat-header">
              <span class="stat-label">Compliant Facilities</span>
            </div>
            <div class="stat-value">${industries.filter(i => i.status === 'Compliant').length}</div>
            <div class="stat-change up">100% CPCB Compliance</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-header">
              <span class="stat-label">Exceeded / Action Required</span>
            </div>
            <div class="stat-value">${industries.filter(i => i.status === 'Exceeded' || i.status === 'Warning').length}</div>
            <div class="stat-change down">Automated Inspection Alerts</div>
          </div>
        </div>

        <!-- Industries Table -->
        <div class="widget">
          <div class="widget-header">
            <h4>Connected Industrial Facilities</h4>
            <span class="badge badge-primary">${industries.length} Registered</span>
          </div>
          <div class="widget-body p-0">
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Industry ID</th>
                    <th>Industry Name</th>
                    <th>Login Username</th>
                    <th>Category</th>
                    <th>Compliance</th>
                    ${!isEngineer ? '<th>Payment Status</th>' : ''}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
    `;

    industries.forEach(ind => {
      let statusBadge = `<span class="badge badge-success"><span class="dot"></span> Compliant</span>`;
      if (ind.status === 'Warning') statusBadge = `<span class="badge badge-warning"><span class="dot"></span> Warning</span>`;
      else if (ind.status === 'Exceeded') statusBadge = `<span class="badge badge-danger"><span class="dot"></span> Exceeded</span>`;

      let payBadge = `<span class="badge badge-success">Paid</span>`;
      if (ind.paymentStatus === 'Pending') payBadge = `<span class="badge badge-warning">Pending (₹${ind.amountDue})</span>`;
      else if (ind.paymentStatus === 'Overdue') payBadge = `<span class="badge badge-danger">Overdue (₹${ind.amountDue})</span>`;

      html += `
        <tr>
          <td class="font-mono font-semibold" style="color: var(--primary);">${ind.id}</td>
          <td>
            <div class="font-semibold text-sm">${ind.name}</div>
            <div class="text-xs text-muted">${ind.location}</div>
          </td>
          <td class="font-mono text-xs text-secondary">${ind.username}</td>
          <td class="text-secondary">${ind.category}</td>
          <td>${statusBadge}</td>
          ${!isEngineer ? `<td>${payBadge}</td>` : ''}
          <td>
            <div class="flex gap-2">
              <button type="button" class="btn btn-primary btn-sm btn-inspect-industry" data-id="${ind.id}" data-name="${ind.name}">
                Monitor Plant
              </button>
              <button type="button" class="btn btn-secondary btn-sm btn-add-analyzer" data-id="${ind.id}" data-name="${ind.name}">
                + Analyzer
              </button>
              ${isAdmin ? `
                <button type="button" class="btn btn-ghost btn-sm btn-delete-industry" data-id="${ind.id}" data-name="${ind.name}" style="color: var(--danger); padding: 4px 8px;" title="Delete Industry & Connected Analyzers">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="pointer-events: none;"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Industry Modal with Dependent Analyzer & Parameter Dropdowns -->
      <div class="modal-overlay hidden" id="modal-add-industry">
        <div class="modal" style="max-width: 650px;">
          <div class="modal-header">
            <h3>Register New Industry</h3>
            <button class="modal-close" id="close-ind-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-add-industry">
              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Industry / Plant Name <span class="required">*</span></label>
                  <input type="text" id="ind-name-input" placeholder="e.g. Phoenix Metals Ltd" required />
                </div>
                <div class="form-control">
                  <label>Industry Category <span class="required">*</span></label>
                  <select id="ind-cat-select" required>
                    <option value="Steel & Metallurgy">Steel & Metallurgy</option>
                    <option value="Cement Manufacturing">Cement Manufacturing</option>
                    <option value="Chemicals & Petrochem">Chemicals & Petrochem</option>
                    <option value="Power Generation">Power Generation</option>
                    <option value="Textiles & Processing">Textiles & Processing</option>
                    <option value="Pulp & Paper">Pulp & Paper</option>
                    <option value="Pharmaceuticals">Pharmaceuticals</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Login Username <span class="required">*</span></label>
                  <input type="text" id="ind-user-input" placeholder="e.g. phoenix_metals" required />
                </div>
                <div class="form-control">
                  <label>Login Password <span class="required">*</span></label>
                  <input type="password" id="ind-pass-input" placeholder="Enter plant password" required />
                </div>
              </div>

              <div class="form-control">
                <label>Plant Location / Address</label>
                <input type="text" id="ind-location-input" placeholder="e.g. Sector 12, Industrial Area" />
              </div>

              <!-- Dependent Analyzer & Parameter Selection Row -->
              <div class="mt-3 pt-3" style="border-top: 1px solid var(--border);">
                <label class="text-xs font-bold text-primary text-uppercase mb-2 block">Configure Analyzers & Opt Parameters</label>
                
                <div class="grid grid-2 gap-3 mb-3">
                  <div class="form-control mb-0">
                    <label>Select Analyzer Category</label>
                    <select id="select-analyzer-cat">
                      <option value="">-- Choose Analyzer --</option>
                      <option value="gas">Gas Analyzer</option>
                      <option value="water">Water Analyzer</option>
                      <option value="spm">SPM Monitor</option>
                      <option value="flow">Flow Meter</option>
                    </select>
                  </div>

                  <div class="form-control mb-0">
                    <label>Opt Parameter</label>
                    <select id="select-analyzer-param" disabled>
                      <option value="">-- Select Analyzer First --</option>
                    </select>
                  </div>
                </div>

                <button type="button" class="btn btn-secondary btn-sm w-full mb-3" id="btn-add-opted-param" disabled>
                  + Opt Selected Parameter for Plant
                </button>

                <!-- List of Opted Parameters -->
                <div class="p-3" style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); min-height: 60px;">
                  <div class="text-xs text-muted mb-2 font-medium">Opted Plant Parameters (<span id="opted-count">0</span> selected):</div>
                  <div class="flex flex-wrap gap-2" id="opted-params-badges">
                    <span class="text-xs text-muted italic" id="empty-opted-msg">No parameters opted yet. Pick an analyzer above and click "+ Opt Selected Parameter".</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-ind-modal">Cancel</button>
            <button class="btn btn-primary" id="save-ind-btn">Register Industry & Save Analyzers</button>
          </div>
        </div>
      </div>

      <!-- Add Custom Analyzer Parameter Modal -->
      <div class="modal-overlay hidden" id="modal-add-analyzer">
        <div class="modal">
          <div class="modal-header">
            <h3>Add Analyzer & Parameter ID for <span id="add-analyzer-ind-name"></span></h3>
            <button class="modal-close" id="close-analyzer-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-add-analyzer">
              <input type="hidden" id="add-analyzer-ind-id" />

              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Analyzer Category <span class="required">*</span></label>
                  <select id="param-cat-select" required>
                    <option value="gas">Gas Analyzer</option>
                    <option value="water">Water Analyzer</option>
                    <option value="spm">SPM Monitor</option>
                    <option value="flow">Flow Meter</option>
                  </select>
                </div>
                <div class="form-control">
                  <label>Unique Parameter ID <span class="required">*</span></label>
                  <input type="text" id="param-id-input" placeholder="e.g. IND06_GAS_SO2" required style="font-family: var(--font-mono);" />
                </div>
              </div>

              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Parameter Name <span class="required">*</span></label>
                  <input type="text" id="param-name-input" placeholder="e.g. Carbon Monoxide" required />
                </div>
                <div class="form-control">
                  <label>Chemical Symbol <span class="required">*</span></label>
                  <input type="text" id="param-symbol-input" placeholder="e.g. CO" required />
                </div>
              </div>

              <div class="grid grid-3 gap-4">
                <div class="form-control">
                  <label>Unit <span class="required">*</span></label>
                  <input type="text" id="param-unit-input" placeholder="e.g. mg/Nm³" required />
                </div>
                <div class="form-control">
                  <label>Warning Limit</label>
                  <input type="number" id="param-warn-input" placeholder="50" value="50" />
                </div>
                <div class="form-control">
                  <label>Exceeded Limit</label>
                  <input type="number" id="param-limit-input" placeholder="80" value="80" />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-analyzer-modal">Cancel</button>
            <button class="btn btn-primary" id="save-analyzer-btn">Deploy Parameter ID</button>
          </div>
        </div>
      </div>

      <!-- Delete Industry Confirmation Modal -->
      <div class="modal-overlay hidden" id="modal-confirm-delete-ind">
        <div class="modal" style="max-width: 440px;">
          <div class="modal-header" style="background: #fef2f2;">
            <h3 style="color: var(--danger);">Confirm Industry Deletion</h3>
            <button class="modal-close" id="close-delete-ind-modal">&times;</button>
          </div>
          <div class="modal-body text-center p-6">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--danger-dim); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
            </div>
            <p class="text-sm font-semibold mb-1">Delete Industrial Plant?</p>
            <p class="text-xs text-secondary mb-4">
              Are you sure you want to permanently delete Industry <strong id="delete-ind-target-name" style="color: var(--text-primary);"></strong> (ID: <span id="delete-ind-target-id" class="param-id"></span>) and all its connected analyzers?
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-delete-ind-btn">Cancel</button>
            <button class="btn btn-danger" id="confirm-delete-ind-btn">Yes, Delete Industry</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Dependent Dropdowns Logic
    const analyzerCatSelect = container.querySelector("#select-analyzer-cat");
    const analyzerParamSelect = container.querySelector("#select-analyzer-param");
    const addOptedBtn = container.querySelector("#btn-add-opted-param");
    const optedBadgesContainer = container.querySelector("#opted-params-badges");
    const emptyMsg = container.querySelector("#empty-opted-msg");
    const optedCountSpan = container.querySelector("#opted-count");

    let currentOptedList = [];

    const renderOptedBadges = () => {
      optedCountSpan.textContent = currentOptedList.length;
      if (currentOptedList.length === 0) {
        optedBadgesContainer.innerHTML = `<span class="text-xs text-muted italic" id="empty-opted-msg">No parameters opted yet. Pick an analyzer above and click "+ Opt Selected Parameter".</span>`;
      } else {
        optedBadgesContainer.innerHTML = currentOptedList.map(item => `
          <span class="badge badge-primary flex items-center gap-1" style="padding: 4px 8px; font-size: 11px;">
            <span>${item.name} (${item.symbol})</span>
            <button type="button" class="btn-remove-opted" data-code="${item.code}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px; line-height: 1; padding: 0 2px;">&times;</button>
          </span>
        `).join('');

        // Remove handlers
        optedBadgesContainer.querySelectorAll(".btn-remove-opted").forEach(btn => {
          btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            currentOptedList = currentOptedList.filter(i => i.code !== code);
            renderOptedBadges();
          });
        });
      }
    };

    if (analyzerCatSelect) {
      analyzerCatSelect.addEventListener("change", () => {
        const cat = analyzerCatSelect.value;
        if (cat && ANALYZER_PARAMETER_MAP[cat]) {
          const params = ANALYZER_PARAMETER_MAP[cat].parameters;
          analyzerParamSelect.innerHTML = `<option value="">-- Select Parameter --</option>` +
            params.map(p => `<option value="${p.code}">${p.name} (${p.symbol}) — ${p.unit}</option>`).join('');
          analyzerParamSelect.disabled = false;
        } else {
          analyzerParamSelect.innerHTML = `<option value="">-- Select Analyzer First --</option>`;
          analyzerParamSelect.disabled = true;
          addOptedBtn.disabled = true;
        }
      });
    }

    if (analyzerParamSelect) {
      analyzerParamSelect.addEventListener("change", () => {
        addOptedBtn.disabled = !analyzerParamSelect.value;
      });
    }

    if (addOptedBtn) {
      addOptedBtn.addEventListener("click", () => {
        const cat = analyzerCatSelect.value;
        const code = analyzerParamSelect.value;
        if (cat && code && ANALYZER_PARAMETER_MAP[cat]) {
          const template = ANALYZER_PARAMETER_MAP[cat].parameters.find(p => p.code === code);
          if (template && !currentOptedList.some(i => i.code === code)) {
            currentOptedList.push(template);
            renderOptedBadges();
            App.showToast(`Opted ${template.name} for plant`, "info");
          }
        }
      });
    }

    // Modals Handlers
    const addIndModal = container.querySelector("#modal-add-industry");
    const openAddIndBtn = container.querySelector("#btn-add-industry-modal");
    const closeAddIndBtn = container.querySelector("#close-ind-modal");
    const cancelAddIndBtn = container.querySelector("#cancel-ind-modal");
    const saveIndBtn = container.querySelector("#save-ind-btn");

    if (openAddIndBtn) {
      openAddIndBtn.addEventListener("click", () => {
        currentOptedList = [];
        renderOptedBadges();
        addIndModal.classList.remove("hidden");
      });
    }

    const closeIndModal = () => addIndModal.classList.add("hidden");
    if (closeAddIndBtn) closeAddIndBtn.addEventListener("click", closeIndModal);
    if (cancelAddIndBtn) cancelAddIndBtn.addEventListener("click", closeIndModal);

    if (saveIndBtn) {
      saveIndBtn.addEventListener("click", () => {
        const name = container.querySelector("#ind-name-input").value;
        const category = container.querySelector("#ind-cat-select").value;
        const username = container.querySelector("#ind-user-input").value;
        const password = container.querySelector("#ind-pass-input").value;
        const location = container.querySelector("#ind-location-input").value;

        if (!name || !username) {
          alert("Please fill in industry name and username!");
          return;
        }

        const newInd = {
          name, category, username, password, location,
          initialAnalyzers: currentOptedList
        };

        DataService.addIndustry(newInd)
          .then(() => {
            closeIndModal();
            IndustriesPage.render(container, user);
            App.showToast(`Industry "${name}" registered with ${currentOptedList.length} opted parameters!`, "success");
          })
          .catch(err => alert("Error: " + err));
      });
    }

    // Custom Modal Delete Industry Handlers
    const deleteIndModal = container.querySelector("#modal-confirm-delete-ind");
    const closeDeleteIndBtn = container.querySelector("#close-delete-ind-modal");
    const cancelDeleteIndBtn = container.querySelector("#cancel-delete-ind-btn");
    const confirmDeleteIndBtn = container.querySelector("#confirm-delete-ind-btn");
    const deleteIndTargetName = container.querySelector("#delete-ind-target-name");
    const deleteIndTargetId = container.querySelector("#delete-ind-target-id");

    let pendingDeleteIndId = null;

    container.querySelectorAll(".btn-delete-industry").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        pendingDeleteIndId = btn.getAttribute("data-id");
        const indName = btn.getAttribute("data-name");

        deleteIndTargetId.textContent = pendingDeleteIndId;
        deleteIndTargetName.textContent = indName;

        deleteIndModal.classList.remove("hidden");
      });
    });

    const closeDeleteIndModalFunc = () => {
      deleteIndModal.classList.add("hidden");
      pendingDeleteIndId = null;
    };

    if (closeDeleteIndBtn) closeDeleteIndBtn.addEventListener("click", closeDeleteIndModalFunc);
    if (cancelDeleteIndBtn) cancelDeleteIndBtn.addEventListener("click", closeDeleteIndModalFunc);

    if (confirmDeleteIndBtn) {
      confirmDeleteIndBtn.addEventListener("click", async () => {
        if (pendingDeleteIndId) {
          const targetId = pendingDeleteIndId;
          closeDeleteIndModalFunc();
          await DataService.deleteIndustry(targetId);
          IndustriesPage.render(container, user);
          App.showToast(`Deleted Industry ${targetId}`, "error");
        }
      });
    }

    // Inspect single industry telemetry handler
    container.querySelectorAll(".btn-inspect-industry").forEach(btn => {
      btn.addEventListener("click", () => {
        const indId = btn.getAttribute("data-id");
        App.selectedIndustryFilter = indId;
        App.navigateTo("analyzers");
      });
    });

    // Add Analyzer Parameter Modal Handler
    const addAnalyzerModal = container.querySelector("#modal-add-analyzer");
    const closeAnalyzerBtn = container.querySelector("#close-analyzer-modal");
    const cancelAnalyzerBtn = container.querySelector("#cancel-analyzer-modal");
    const saveAnalyzerBtn = container.querySelector("#save-analyzer-btn");
    const targetIndIdInput = container.querySelector("#add-analyzer-ind-id");
    const targetIndNameLabel = container.querySelector("#add-analyzer-ind-name");

    container.querySelectorAll(".btn-add-analyzer").forEach(btn => {
      btn.addEventListener("click", () => {
        const indId = btn.getAttribute("data-id");
        const indName = btn.getAttribute("data-name");
        targetIndIdInput.value = indId;
        targetIndNameLabel.textContent = indName;

        const code = indId.replace('-', '');
        container.querySelector("#param-id-input").value = `${code}_GAS_NEW`;
        addAnalyzerModal.classList.remove("hidden");
      });
    });

    const closeAnalyzerModalFunc = () => addAnalyzerModal.classList.add("hidden");
    if (closeAnalyzerBtn) closeAnalyzerBtn.addEventListener("click", closeAnalyzerModalFunc);
    if (cancelAnalyzerBtn) cancelAnalyzerBtn.addEventListener("click", closeAnalyzerModalFunc);

    if (saveAnalyzerBtn) {
      saveAnalyzerBtn.addEventListener("click", () => {
        const parameterId = container.querySelector("#param-id-input").value;
        const industryId = targetIndIdInput.value;
        const category = container.querySelector("#param-cat-select").value;
        const name = container.querySelector("#param-name-input").value;
        const symbol = container.querySelector("#param-symbol-input").value;
        const unit = container.querySelector("#param-unit-input").value;
        const thresholdWarning = parseFloat(container.querySelector("#param-warn-input").value);
        const thresholdExceeded = parseFloat(container.querySelector("#param-limit-input").value);

        if (!parameterId || !name || !symbol || !unit) {
          alert("Please fill in parameter ID, name, symbol and unit!");
          return;
        }

        const newParam = {
          parameterId, industryId, category, name, symbol, unit, thresholdWarning, thresholdExceeded
        };

        DataService.addAnalyzerParameter(newParam)
          .then(() => {
            closeAnalyzerModalFunc();
            App.showToast(`Deployed Parameter ID: ${parameterId}`, "success");
          });
      });
    }
  }
};
