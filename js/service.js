/* ============================================
   SERVICE REPORTS & WORK COMPLETION CONTROLLER
   ============================================ */

const ServicePage = {
  selectedStatusFilter: 'all',
  selectedIndustryFilter: '',
  searchQuery: '',

  render: (container, user) => {
    const isElevated = user.role === "admin" || user.role === "engineer";
    let reports = DataService.getServiceReports(isElevated ? null : user.industryId);
    const industries = DataService.getIndustries();
    const categories = DataService.getCategories();

    // Apply Filters
    if (ServicePage.selectedStatusFilter !== 'all') {
      reports = reports.filter(r => r.status.toLowerCase() === ServicePage.selectedStatusFilter.toLowerCase());
    }
    if (ServicePage.selectedIndustryFilter) {
      reports = reports.filter(r => r.industryId === ServicePage.selectedIndustryFilter);
    }
    if (ServicePage.searchQuery.trim()) {
      const q = ServicePage.searchQuery.toLowerCase();
      reports = reports.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.industryName.toLowerCase().includes(q) ||
        r.parameterName.toLowerCase().includes(q) ||
        r.technician.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q)
      );
    }

    let html = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <h1>Service & Calibration Reports</h1>
            <p class="header-subtitle">
              ${isElevated ? "Manage field maintenance, calibration logs, and issue official PDF service reports" : `Certified Calibration Reports & Service Logs for ${user.name}`}
            </p>
          </div>
          <div class="header-actions" style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-download-sample-report" style="display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Download Sample PDF (.pdf)
            </button>
            ${isElevated ? `
              <button class="btn btn-primary btn-sm" id="btn-create-service-report">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
                + Log New Service Work
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="page-body">
        <!-- Filter & Search Controls -->
        <div class="glass-card mb-6" style="padding: var(--space-4) var(--space-6);">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3 flex-1" style="min-width: 260px;">
              <div class="input-wrapper flex-1" style="position: relative;">
                <input type="text" id="service-search-input" placeholder="Search report ID, plant, engineer, or parameter..." value="${ServicePage.searchQuery}" style="padding-left: 36px; height: 38px; font-size: 13px;" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              ${isElevated ? `
                <select id="service-industry-filter" style="padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: #fff; font-size: 12px; font-weight: 500; height: 38px;">
                  <option value="">-- All Industrial Plants --</option>
                  ${industries.map(i => `<option value="${i.id}" ${ServicePage.selectedIndustryFilter === i.id ? 'selected' : ''}>${i.name}</option>`).join('')}
                </select>
              ` : ''}

              <div class="filter-bar" id="service-status-filter-bar">
                <button class="filter-chip ${ServicePage.selectedStatusFilter === 'all' ? 'active' : ''}" data-status="all">All Logs</button>
                <button class="filter-chip ${ServicePage.selectedStatusFilter === 'completed' ? 'active' : ''}" data-status="completed">Completed</button>
                <button class="filter-chip ${ServicePage.selectedStatusFilter === 'in progress' ? 'active' : ''}" data-status="in progress">In Progress</button>
                <button class="filter-chip ${ServicePage.selectedStatusFilter === 'pending' ? 'active' : ''}" data-status="pending">Pending</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Reports Grid -->
        <div class="grid grid-2 gap-6 stagger" id="service-reports-list">
    `;

    if (reports.length === 0) {
      html += `
        <div class="glass-card grid-col-span-2 empty-state p-8 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="margin: 0 auto 12px; color: var(--text-muted);"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
          <h4 style="font-size: 16px; margin-bottom: 4px;">No Service Reports Found</h4>
          <p class="text-xs text-secondary">No maintenance service logs match your search or filter parameters.</p>
        </div>
      `;
    }

    reports.forEach(report => {
      let statusBadge = `<span class="badge badge-success"><span class="dot"></span> Completed</span>`;
      if (report.status === "In Progress") {
        statusBadge = `<span class="badge badge-warning"><span class="dot pulse"></span> In Progress</span>`;
      } else if (report.status === "Pending") {
        statusBadge = `<span class="badge badge-danger"><span class="dot pulse"></span> Pending</span>`;
      }

      html += `
        <div class="service-card" id="card-service-${report.id}">
          <div class="service-header">
            <div>
              <div class="service-id">${report.id} • ${report.date}</div>
              <h3 class="service-title">${report.parameterName}</h3>
              <div class="text-xs text-secondary mt-1">
                Industry: <strong>${report.industryName}</strong>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="service-meta">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Tech: ${report.technician}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Next Due: ${report.nextServiceDue}</span>
            </div>
            <div class="meta-item">
              <span class="param-id" data-tooltip="Deployment Parameter ID">${report.parameterId}</span>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-muted text-uppercase mb-1">Service Type & Scope</div>
            <p class="text-sm font-medium" style="color: var(--primary);">${report.serviceType}</p>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-muted text-uppercase mb-1">Field Observations</div>
            <p class="text-xs text-secondary" style="line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${report.observations || 'Field check completed standard telemetry inspection.'}
            </p>
          </div>

          <div class="service-actions justify-between items-center">
            <div>
              ${isElevated ? `
                <button class="btn btn-secondary btn-sm btn-update-status" data-id="${report.id}">
                  Update Status
                </button>
              ` : ''}
            </div>
            <button class="btn btn-primary btn-sm btn-download-pdf" data-id="${report.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Download PDF Report (.pdf)
            </button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>

      <!-- Create / Edit Service Log Modal -->
      <div class="modal-overlay hidden" id="modal-service-log">
        <div class="modal">
          <div class="modal-header">
            <h3 id="modal-service-title">Create Work Completion & Service Log</h3>
            <button class="modal-close" id="close-service-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-service-log">
              <input type="hidden" id="service-log-id" />
              
              <div class="form-control">
                <label>Target Industry <span class="required">*</span></label>
                <select id="service-industry-select" required>
                  <option value="">-- Select Industry --</option>
                  ${industries.map(i => `<option value="${i.id}">${i.name} (${i.category})</option>`).join('')}
                </select>
              </div>

              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Analyzer Category <span class="required">*</span></label>
                  <select id="service-cat-select" required>
                    <option value="">-- Select Category --</option>
                    ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                  </select>
                </div>

                <div class="form-control">
                  <label>Parameter ID & Name <span class="required">*</span></label>
                  <select id="service-param-select" required>
                    <option value="">-- Select Parameter --</option>
                    ${categories.flatMap(c => c.parameters).map(p => `
                      <option value="${p.parameterId}" data-name="${p.name} (${p.symbol})">
                        ${p.parameterId} — ${p.name} (${p.symbol})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="grid grid-2 gap-4">
                <div class="form-control">
                  <label>Service Date <span class="required">*</span></label>
                  <input type="date" id="service-date-input" required value="${new Date().toISOString().split('T')[0]}" />
                </div>

                <div class="form-control">
                  <label>Work Status <span class="required">*</span></label>
                  <select id="service-status-select" required>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed" selected>Completed</option>
                  </select>
                </div>
              </div>

              <div class="form-control">
                <label>Technician / Engineer Name <span class="required">*</span></label>
                <input type="text" id="service-tech-input" placeholder="e.g. Rajesh Kumar (Senior Field Engineer)" required />
              </div>

              <div class="form-control">
                <label>Service / Maintenance Type <span class="required">*</span></label>
                <input type="text" id="service-type-input" placeholder="e.g. Quarterly Span Calibration & Sensor Cleaning" required />
              </div>

              <div class="form-control">
                <label>Field Observations & Sensor Condition</label>
                <textarea id="service-obs-input" placeholder="Detail any zero drift, optic fouling, flow blockage, or hardware symptoms..."></textarea>
              </div>

              <div class="form-control">
                <label>Actions Executed & Calibration Details</label>
                <textarea id="service-actions-input" placeholder="Detail actions taken, span gases used, replacement parts installed..."></textarea>
              </div>

              <div class="form-control">
                <label>Next Recommended Maintenance Date</label>
                <input type="date" id="service-next-date-input" />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-service-modal">Cancel</button>
            <button class="btn btn-primary" id="save-service-modal-btn">Save Service Log</button>
          </div>
        </div>
      </div>

      <!-- Update Status Modal -->
      <div class="modal-overlay hidden" id="modal-update-status">
        <div class="modal">
          <div class="modal-header">
            <h3>Update Service Work Status</h3>
            <button class="modal-close" id="close-status-modal">&times;</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="status-report-id" />
            <div class="form-control">
              <label>Select New Status</label>
              <select id="update-status-select">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancel-status-modal">Cancel</button>
            <button class="btn btn-primary" id="save-status-modal-btn">Update Status</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Search Input Listener
    const searchInput = container.querySelector("#service-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        ServicePage.searchQuery = e.target.value;
        ServicePage.render(container, user);
        // Maintain cursor focus
        const newSearch = container.querySelector("#service-search-input");
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
        }
      });
    }

    // Status Filter Chips Listeners
    container.querySelectorAll("#service-status-filter-bar .filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        ServicePage.selectedStatusFilter = chip.getAttribute("data-status");
        ServicePage.render(container, user);
      });
    });

    // Industry Filter Dropdown Listener
    const indFilterSelect = container.querySelector("#service-industry-filter");
    if (indFilterSelect) {
      indFilterSelect.addEventListener("change", (e) => {
        ServicePage.selectedIndustryFilter = e.target.value;
        ServicePage.render(container, user);
      });
    }

    // PDF Download button click handlers
    container.querySelectorAll(".btn-download-pdf").forEach(btn => {
      btn.addEventListener("click", () => {
        const rId = btn.getAttribute("data-id");
        App.showToast(`Generating certified PDF report for ${rId}...`, "info");
        PDFExportService.downloadServiceReport(rId);
      });
    });

    // Sample PDF Download handler
    const sampleDownloadBtn = container.querySelector("#btn-download-sample-report");
    if (sampleDownloadBtn) {
      sampleDownloadBtn.addEventListener("click", () => {
        App.showToast("Generating sample certified PDF report...", "info");
        PDFExportService.downloadSampleReport();
      });
    }

    // Create Log Handler
    const modal = container.querySelector("#modal-service-log");
    const createBtn = container.querySelector("#btn-create-service-report");
    const closeBtn = container.querySelector("#close-service-modal");
    const cancelBtn = container.querySelector("#cancel-service-modal");
    const saveBtn = container.querySelector("#save-service-modal-btn");

    if (createBtn) {
      createBtn.addEventListener("click", () => {
        container.querySelector("#form-service-log").reset();
        container.querySelector("#service-log-id").value = `SR-2026-${Math.floor(100 + Math.random() * 900)}`;
        if (user.role === "engineer") {
          container.querySelector("#service-tech-input").value = user.name || "Chandan Aggarwal (Senior Engineer)";
        }
        modal.classList.remove("hidden");
      });
    }

    const closeModal = () => modal.classList.add("hidden");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const indSelect = container.querySelector("#service-industry-select");
        const catSelect = container.querySelector("#service-cat-select");
        const paramSelect = container.querySelector("#service-param-select");

        const selectedInd = industries.find(i => i.id === indSelect.value);
        const selectedOpt = paramSelect.options[paramSelect.selectedIndex];

        const newReport = {
          id: container.querySelector("#service-log-id").value || `SR-2026-${Math.floor(100 + Math.random() * 900)}`,
          industryId: indSelect.value,
          industryName: selectedInd ? selectedInd.name : "Industrial Site",
          analyzerCategory: catSelect.value,
          parameterId: paramSelect.value,
          parameterName: selectedOpt ? selectedOpt.getAttribute("data-name") : paramSelect.value,
          date: container.querySelector("#service-date-input").value,
          technician: container.querySelector("#service-tech-input").value,
          status: container.querySelector("#service-status-select").value,
          serviceType: container.querySelector("#service-type-input").value,
          observations: container.querySelector("#service-obs-input").value,
          actionsTaken: container.querySelector("#service-actions-input").value,
          nextServiceDue: container.querySelector("#service-next-date-input").value || "2026-10-30"
        };

        if (!newReport.industryId || !newReport.parameterId || !newReport.technician) {
          alert("Please fill in all required fields!");
          return;
        }

        DataService.saveServiceReport(newReport);
        closeModal();
        ServicePage.render(container, user);
        App.showToast(`Service Report ${newReport.id} successfully saved!`, "success");
      });
    }

    // Status Update Modal Logic
    const statusModal = container.querySelector("#modal-update-status");
    const closeStatusBtn = container.querySelector("#close-status-modal");
    const cancelStatusBtn = container.querySelector("#cancel-status-modal");
    const saveStatusBtn = container.querySelector("#save-status-modal-btn");
    const statusReportIdInput = container.querySelector("#status-report-id");
    const statusSelect = container.querySelector("#update-status-select");

    container.querySelectorAll(".btn-update-status").forEach(btn => {
      btn.addEventListener("click", () => {
        const rId = btn.getAttribute("data-id");
        const reports = DataService.getServiceReports() || [];
        const report = reports.find(r => r.id === rId);
        if (report) {
          statusReportIdInput.value = rId;
          statusSelect.value = report.status;
          statusModal.classList.remove("hidden");
        }
      });
    });

    const closeStatusModal = () => statusModal.classList.add("hidden");
    if (closeStatusBtn) closeStatusBtn.addEventListener("click", closeStatusModal);
    if (cancelStatusBtn) cancelStatusBtn.addEventListener("click", closeStatusModal);

    if (saveStatusBtn) {
      saveStatusBtn.addEventListener("click", () => {
        const rId = statusReportIdInput.value;
        const reports = DataService.getServiceReports() || [];
        const report = reports.find(r => r.id === rId);
        if (report) {
          report.status = statusSelect.value;
          closeStatusModal();
          ServicePage.render(container, user);
          App.showToast(`Updated status for ${rId} to ${report.status}`, "success");
        }
      });
    }
  }
};
