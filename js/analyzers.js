/* ============================================
   ANALYZER MONITORING PAGE CONTROLLER
   ============================================ */

const AnalyzersPage = {
  render: (container, user) => {
    const isElevated = user.role === 'admin' || user.role === 'engineer';
    const filterIndustryId = isElevated ? App.selectedIndustryFilter : user.industryId;
    const industries = DataService.getIndustries();
    const categories = DataService.getCategories(filterIndustryId);

    const activeIndObj = filterIndustryId ? DataService.getIndustryById(filterIndustryId) : null;

    let html = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <h1>Analyzer Monitoring Network</h1>
            <p class="header-subtitle">
              ${activeIndObj ? `Inspecting Telemetry for ${activeIndObj.name} (${activeIndObj.category})` : "Real-time Gas, Water, SPM, and Flow Parameter Telemetry"}
            </p>
          </div>
          <div class="header-actions">
            ${isElevated ? `
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-secondary">Plant Filter:</span>
                <select id="analyzer-industry-filter" style="padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: #fff; font-size: var(--font-size-xs); font-weight: 500;">
                  <option value="">-- All Industries --</option>
                  ${industries.map(i => `<option value="${i.id}" ${filterIndustryId === i.id ? 'selected' : ''}>${i.name}</option>`).join('')}
                </select>
              </div>
            ` : ''}

            <div class="live-indicator">
              <span class="live-dot"></span>
              <span>LIVE TELEMETRY</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-body">
        <!-- Top Filter Bar -->
        <div class="glass-card mb-6" style="padding: var(--space-4) var(--space-6);">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <span class="badge badge-primary">MODBUS / RS-485 BUS ONLINE</span>
              <span class="text-xs text-secondary">Match physical responses using exact <strong>Parameter Deployment IDs</strong></span>
            </div>
            <div class="filter-bar" id="category-filter-bar">
              <button class="filter-chip active" data-cat="all">All Categories</button>
              <button class="filter-chip" data-cat="gas">Gas Analyzers</button>
              <button class="filter-chip" data-cat="water">Water Analyzers</button>
              <button class="filter-chip" data-cat="spm">SPM Monitors</button>
              <button class="filter-chip" data-cat="flow">Flow Meters</button>
            </div>
          </div>
        </div>

        <!-- Analyzer Categories -->
        <div id="analyzer-categories-container">
    `;

    let totalRenderedParams = 0;

    categories.forEach(cat => {
      if (cat.parameters.length === 0) return;
      totalRenderedParams += cat.parameters.length;

      html += `
        <div class="analyzer-section" id="cat-section-${cat.id}">
          <div class="section-header">
            <div class="section-title">
              <div class="section-icon ${cat.id}">${cat.icon}</div>
              <div>
                <h3>${cat.name}</h3>
                <span class="section-count">${cat.description}</span>
              </div>
            </div>
            <span class="badge badge-neutral">${cat.parameters.length} Active Parameters</span>
          </div>

          <div class="analyzer-grid">
      `;

      cat.parameters.forEach(param => {
        let statusClass = "normal";
        let statusBadge = `<span class="badge badge-success"><span class="dot pulse"></span> Normal</span>`;

        if (param.currentValue >= param.thresholdExceeded) {
          statusClass = "exceeded";
          statusBadge = `<span class="badge badge-danger"><span class="dot pulse"></span> Exceeded</span>`;
        } else if (param.currentValue >= param.thresholdWarning) {
          statusClass = "warning";
          statusBadge = `<span class="badge badge-warning"><span class="dot pulse"></span> Warning</span>`;
        }

        const maxHist = Math.max(...(param.history || [param.currentValue]), param.maxVal * 0.5);
        let sparklineHtml = '<div class="sparkline">';
        (param.history || [param.currentValue]).forEach(val => {
          const heightPct = Math.min(100, Math.max(15, (val / maxHist) * 100));
          let barBg = "var(--primary)";
          if (val >= param.thresholdExceeded) barBg = "var(--danger)";
          else if (val >= param.thresholdWarning) barBg = "var(--warning)";
          sparklineHtml += `<div class="bar" style="height: ${heightPct}%; background: ${barBg};" title="${val} ${param.unit}"></div>`;
        });
        sparklineHtml += '</div>';

        const indInfo = DataService.getIndustryById(param.industryId);

        html += `
          <div class="analyzer-card ${statusClass}" id="card-param-${param.parameterId}">
            <div class="analyzer-header" style="position: relative; z-index: 5;">
              <div>
                <div class="analyzer-name">${param.name} (${param.symbol})</div>
                <div class="text-xs text-muted mt-1">
                  ID: <span class="param-id">${param.parameterId}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                ${statusBadge}
                ${isElevated ? `
                  <button type="button" class="btn btn-ghost btn-sm btn-delete-param" data-id="${param.parameterId}" data-name="${param.name}" style="color: var(--danger); padding: 4px 6px; border-radius: var(--radius-sm); cursor: pointer; z-index: 10; position: relative;" title="Delete Analyzer Parameter">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="pointer-events: none;"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                ` : ''}
              </div>
            </div>

            ${isElevated && !filterIndustryId && indInfo ? `
              <div class="text-xs font-semibold text-secondary mb-2" style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
                Industry: ${indInfo.name}
              </div>
            ` : ''}

            <div class="analyzer-reading">
              <span class="reading-value">${param.currentValue}</span>
              <span class="reading-unit">${param.unit}</span>
            </div>

            <div class="mb-3">
              <div class="flex justify-between items-center text-xs text-muted mb-1">
                <span>Recent Trend</span>
                <span>Max: ${param.maxVal} ${param.unit}</span>
              </div>
              ${sparklineHtml}
            </div>

            <div class="analyzer-footer">
              <span>Warn: >${param.thresholdWarning} | Limit: >${param.thresholdExceeded}</span>
              <button type="button" class="btn btn-secondary btn-sm btn-simulate-param" data-id="${param.parameterId}" data-name="${param.name}">
                Inject Value
              </button>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    if (totalRenderedParams === 0) {
      html += `
        <div class="glass-card text-center p-8">
          <h4>No Analyzers Configured</h4>
          <p class="text-secondary text-sm mt-1">There are no active parameters configured for the selected industry.</p>
        </div>
      `;
    }

    html += `
        </div>
      </div>

      <!-- Parameter Injection Modal -->
      <div class="modal-overlay hidden" id="modal-inject-param">
        <div class="modal">
          <div class="modal-header">
            <h3>Deploy Real Response / Inject Parameter Reading</h3>
            <button class="modal-close" id="close-inject-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-control">
              <label>Parameter Deployment ID</label>
              <input type="text" id="inject-param-id-input" readonly style="background: #f1f5f9; font-family: var(--font-mono); font-weight: 600;" />
            </div>
            <div class="form-control">
              <label>New Real Response Value <span class="required">*</span></label>
              <input type="number" step="0.1" id="inject-param-val-input" placeholder="e.g. 78.5" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-inject-modal">Cancel</button>
            <button class="btn btn-primary" id="confirm-inject-modal">Deploy Response</button>
          </div>
        </div>
      </div>

      <!-- Custom Confirmation Delete Modal -->
      <div class="modal-overlay hidden" id="modal-confirm-delete-param">
        <div class="modal" style="max-width: 440px;">
          <div class="modal-header" style="background: #fef2f2;">
            <h3 style="color: var(--danger);">Confirm Parameter Deletion</h3>
            <button class="modal-close" id="close-delete-param-modal">&times;</button>
          </div>
          <div class="modal-body text-center p-6">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--danger-dim); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
            </div>
            <p class="text-sm font-semibold mb-1">Delete Analyzer Parameter?</p>
            <p class="text-xs text-secondary mb-4">
              Are you sure you want to permanently delete parameter <strong id="delete-param-target-name" style="color: var(--text-primary);"></strong> (<span id="delete-param-target-id" class="param-id"></span>)?
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-delete-param-btn">Cancel</button>
            <button class="btn btn-danger" id="confirm-delete-param-btn">Yes, Delete Parameter</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Filter by category
    const filterChips = container.querySelectorAll("#category-filter-bar .filter-chip");
    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const targetCat = chip.getAttribute("data-cat");
        container.querySelectorAll(".analyzer-section").forEach(sec => {
          if (targetCat === "all" || sec.id === `cat-section-${targetCat}`) {
            sec.style.display = "block";
          } else {
            sec.style.display = "none";
          }
        });
      });
    });

    // Plant filter dropdown in header (Admin only)
    const indFilterSelect = container.querySelector("#analyzer-industry-filter");
    if (indFilterSelect) {
      indFilterSelect.addEventListener("change", () => {
        App.selectedIndustryFilter = indFilterSelect.value || null;
        AnalyzersPage.render(container, user);
      });
    }

    // Delete Modal Logic
    const deleteModal = container.querySelector("#modal-confirm-delete-param");
    const closeDeleteModalBtn = container.querySelector("#close-delete-param-modal");
    const cancelDeleteModalBtn = container.querySelector("#cancel-delete-param-btn");
    const confirmDeleteModalBtn = container.querySelector("#confirm-delete-param-btn");
    const deleteTargetNameLabel = container.querySelector("#delete-param-target-name");
    const deleteTargetIdLabel = container.querySelector("#delete-param-target-id");

    let pendingDeleteParamId = null;

    container.querySelectorAll(".btn-delete-param").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        pendingDeleteParamId = btn.getAttribute("data-id");
        const pName = btn.getAttribute("data-name");

        deleteTargetIdLabel.textContent = pendingDeleteParamId;
        deleteTargetNameLabel.textContent = pName;

        deleteModal.classList.remove("hidden");
      });
    });

    const closeDeleteModalFunc = () => {
      deleteModal.classList.add("hidden");
      pendingDeleteParamId = null;
    };

    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener("click", closeDeleteModalFunc);
    if (cancelDeleteModalBtn) cancelDeleteModalBtn.addEventListener("click", closeDeleteModalFunc);

    if (confirmDeleteModalBtn) {
      confirmDeleteModalBtn.addEventListener("click", async () => {
        if (pendingDeleteParamId) {
          const targetId = pendingDeleteParamId;
          closeDeleteModalFunc();
          await DataService.deleteAnalyzerParameter(targetId);
          AnalyzersPage.render(container, user);
          App.showToast(`Deleted Analyzer Parameter: ${targetId}`, "error");
        }
      });
    }

    // Modal Injection Handlers
    const modal = container.querySelector("#modal-inject-param");
    const closeBtn = container.querySelector("#close-inject-modal");
    const cancelBtn = container.querySelector("#cancel-inject-modal");
    const confirmBtn = container.querySelector("#confirm-inject-modal");
    const injectInput = container.querySelector("#inject-param-val-input");
    const injectIdInput = container.querySelector("#inject-param-id-input");

    container.querySelectorAll(".btn-simulate-param").forEach(btn => {
      btn.addEventListener("click", () => {
        const pId = btn.getAttribute("data-id");
        const param = DataService.getParameterById(pId);
        injectIdInput.value = pId;
        injectInput.value = param ? param.currentValue : 50;
        modal.classList.remove("hidden");
      });
    });

    const closeModal = () => modal.classList.add("hidden");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        const pId = injectIdInput.value;
        const newVal = parseFloat(injectInput.value);

        if (!isNaN(newVal)) {
          await DataService.updateParameterValue(pId, newVal);
          AnalyzersPage.render(container, user);
          App.showToast(`Updated telemetry for ${pId} to ${newVal}`, "success");
        }
        closeModal();
      });
    }
  }
};
