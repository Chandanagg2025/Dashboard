/* ============================================
   MAIN DASHBOARD OVERVIEW CONTROLLER
   ============================================ */

const DashboardPage = {
  render: (container, user) => {
    const isAdmin = user.role === "admin";
    const isEngineer = user.role === "engineer";
    const isElevated = isAdmin || isEngineer;

    const industries = DataService.getIndustries();
    const categories = DataService.getCategories();
    const serviceReports = DataService.getServiceReports(isElevated ? null : user.industryId);

    // Aggregate parameter stats
    let totalParams = 0;
    let normalCount = 0;
    let warningCount = 0;
    let exceededCount = 0;

    categories.forEach(c => {
      c.parameters.forEach(p => {
        totalParams++;
        if (p.currentValue >= p.thresholdExceeded) exceededCount++;
        else if (p.currentValue >= p.thresholdWarning) warningCount++;
        else normalCount++;
      });
    });

    let html = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <h1>${isAdmin ? "Executive Compliance Dashboard" : (isEngineer ? "Field Engineer Telemetry Overview" : `${user.name} — Overview`)}</h1>
            <p class="header-subtitle">
              ${isElevated ? "Real-time Industrial Pollution & Analyzer Telemetry Network" : "Continuous Emission & Effluent Monitoring System (CEMS/EQMS)"}
            </p>
          </div>
          <div class="header-actions">
            <div class="live-indicator">
              <span class="live-dot"></span>
              <span>NETWORK ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-body">
        <!-- Top Stats Row -->
        <div class="stats-grid stagger">
    `;

    if (isElevated) {
      html += `
        <div class="stat-card primary">
          <div class="stat-header">
            <span class="stat-label">Total Connected Industries</span>
            <div class="stat-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
          </div>
          <div class="stat-value">${industries.length}</div>
          <div class="stat-change up">
            <span>5 Active Stacks & Outfalls</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-header">
            <span class="stat-label">Compliant Parameters</span>
            <div class="stat-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            </div>
          </div>
          <div class="stat-value">${normalCount} / ${totalParams}</div>
          <div class="stat-change up">
            <span>${Math.round((normalCount/totalParams)*100)}% Within CPCB Standards</span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-header">
            <span class="stat-label">Warning Thresholds</span>
            <div class="stat-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
            </div>
          </div>
          <div class="stat-value">${warningCount}</div>
          <div class="stat-change text-secondary">
            <span>Approaching Emission Limits</span>
          </div>
        </div>

        <div class="stat-card danger">
          <div class="stat-header">
            <span class="stat-label">Limit Exceeded Alerts</span>
            <div class="stat-icon danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
          </div>
          <div class="stat-value">${exceededCount}</div>
          <div class="stat-change down">
            <span>Requires Automated Field Inspection</span>
          </div>
        </div>
      `;
    } else {
      const indInfo = DataService.getIndustryById(user.industryId) || {};
      html += `
        <div class="stat-card primary">
          <div class="stat-header">
            <span class="stat-label">Plant Compliance Status</span>
            <div class="stat-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
          <div class="stat-value text-success">${indInfo.status || 'Compliant'}</div>
          <div class="stat-change up">
            <span>Environmental Standards Met</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-header">
            <span class="stat-label">Monitored Analyzer Channels</span>
            <div class="stat-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>
          <div class="stat-value">20 Parameters</div>
          <div class="stat-change text-secondary">
            <span>Gas, Water, SPM & Flow</span>
          </div>
        </div>

        <div class="stat-card secondary">
          <div class="stat-header">
            <span class="stat-label">Subscription & Payment</span>
            <div class="stat-icon secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size: 1.5rem;">${indInfo.paymentStatus}</div>
          <div class="stat-change text-secondary">
            <span>Plan: ${indInfo.subscription || 'Standard'}</span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-header">
            <span class="stat-label">Pending Maintenance</span>
            <div class="stat-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
            </div>
          </div>
          <div class="stat-value">${serviceReports.filter(r => r.status !== 'Completed').length} Tickets</div>
          <div class="stat-change text-secondary">
            <span>Field Team Scheduled</span>
          </div>
        </div>
      `;
    }

    html += `
        </div>

        <!-- Middle Section: Gas, Water, SPM, Flow Quick Summary Cards with Parameter IDs -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 style="font-size: 18px;">Integrated Analyzer Parameter Matrix</h3>
              <p class="text-xs text-secondary">Live readings with unique Parameter Deployment IDs</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-goto-analyzers">
              View All 20 Parameters &rarr;
            </button>
          </div>

          <div class="grid grid-4 gap-4">
    `;

    // Pick 1 key parameter from each category to display on main dashboard
    const sampleParams = [
      { catName: "Gas Analyzer", pId: "GAS_SO2_01", bg: "var(--primary-dim)", color: "var(--primary)" },
      { catName: "Water Analyzer", pId: "WATER_PH_01", bg: "rgba(68, 138, 255, 0.12)", color: "var(--info)" },
      { catName: "SPM Monitor", pId: "SPM_PM25_01", bg: "var(--warning-dim)", color: "var(--warning)" },
      { catName: "Flow Meter", pId: "FLOW_GAS_01", bg: "rgba(124, 77, 255, 0.12)", color: "var(--secondary)" }
    ];

    sampleParams.forEach(item => {
      const p = DataService.getParameterById(item.pId);
      if (p) {
        html += `
          <div class="glass-card" style="padding: var(--space-4);">
            <div class="flex justify-between items-center mb-2">
              <span class="badge" style="background: ${item.bg}; color: ${item.color};">${item.catName}</span>
              <span class="param-id">${p.parameterId}</span>
            </div>
            <div class="font-semibold text-sm mb-1">${p.name} (${p.symbol})</div>
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-2xl font-bold font-mono" style="color: ${item.color};">${p.currentValue}</span>
              <span class="text-xs text-secondary">${p.unit}</span>
            </div>
            <div class="progress mb-2">
              <div class="progress-bar" style="width: ${Math.min(100, (p.currentValue / p.maxVal)*100)}%; background: ${item.color};"></div>
            </div>
            <div class="text-xs text-muted flex justify-between">
              <span>Min: ${p.minVal}</span>
              <span>Max: ${p.maxVal}</span>
            </div>
          </div>
        `;
      }
    });

    html += `
          </div>
        </div>
    `;

    if (isElevated) {
      html += `
        <!-- Admin & Engineer View: Industry Compliance Overview Table -->
        <div class="grid grid-2 gap-6 mb-8">
          <div class="widget">
            <div class="widget-header">
              <h4>Industry Environmental Compliance Overview</h4>
              <span class="badge badge-primary">${industries.length} Industries Connected</span>
            </div>
            <div class="widget-body p-0">
              <div class="data-table-wrapper" style="border: none; border-radius: 0;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Industry Name</th>
                      <th>Category</th>
                      <th>Status</th>
                      ${!isEngineer ? '<th>Payment</th>' : ''}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
      `;

      industries.forEach(ind => {
        let statusBadge = `<span class="badge badge-success"><span class="dot"></span> Compliant</span>`;
        if (ind.status === "Warning") statusBadge = `<span class="badge badge-warning"><span class="dot"></span> Warning</span>`;
        else if (ind.status === "Exceeded") statusBadge = `<span class="badge badge-danger"><span class="dot"></span> Exceeded</span>`;

        let payBadge = `<span class="badge badge-success">Paid</span>`;
        if (ind.paymentStatus === "Pending") payBadge = `<span class="badge badge-warning">Pending</span>`;
        else if (ind.paymentStatus === "Overdue") payBadge = `<span class="badge badge-danger">Overdue</span>`;

        html += `
          <tr>
            <td>
              <div class="font-semibold">${ind.name}</div>
              <div class="text-xs text-muted">${ind.location}</div>
            </td>
            <td class="text-secondary">${ind.category}</td>
            <td>${statusBadge}</td>
            ${!isEngineer ? `<td>${payBadge}</td>` : ''}
            <td>
              <button type="button" class="btn btn-primary btn-sm btn-inspect-industry" data-id="${ind.id}" data-name="${ind.name}">
                Monitor Plant
              </button>
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

          <!-- Widget: Recent Maintenance Activity -->
          <div class="widget">
            <div class="widget-header">
              <h4>Recent Service & Calibration Logs</h4>
              <button class="btn btn-ghost btn-sm" id="btn-goto-service">View All &rarr;</button>
            </div>
            <div class="widget-body">
              <div class="flex flex-col gap-4">
      `;

      serviceReports.slice(0, 3).forEach(sr => {
        html += `
          <div class="p-3" style="background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div class="flex justify-between items-start mb-1">
              <span class="font-mono text-xs font-semibold text-primary">${sr.id}</span>
              <span class="badge badge-secondary" style="font-size: 10px;">${sr.status}</span>
            </div>
            <div class="text-xs font-semibold text-bright mb-1">${sr.industryName}</div>
            <div class="text-xs text-secondary mb-2">${sr.serviceType}</div>
            <div class="flex justify-between items-center text-xs text-muted">
              <span>Tech: ${sr.technician}</span>
              <button class="btn btn-ghost btn-sm btn-download-pdf" data-id="${sr.id}" style="padding: 2px 6px; font-size: 11px;">
                PDF Log (.pdf) &rarr;
              </button>
            </div>
          </div>
        `;
      });

      html += `
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += `
      </div>
    `;

    container.innerHTML = html;

    // Navigation buttons inside dashboard
    const gotoAnalyzers = container.querySelector("#btn-goto-analyzers");
    if (gotoAnalyzers) {
      gotoAnalyzers.addEventListener("click", () => App.navigateTo("analyzers"));
    }

    const gotoService = container.querySelector("#btn-goto-service");
    if (gotoService) {
      gotoService.addEventListener("click", () => App.navigateTo("service"));
    }

    // Monitor Plant buttons
    container.querySelectorAll(".btn-inspect-industry").forEach(btn => {
      btn.addEventListener("click", () => {
        const indId = btn.getAttribute("data-id");
        App.selectedIndustryFilter = indId;
        App.navigateTo("analyzers");
      });
    });

    // PDF Download listeners
    container.querySelectorAll(".btn-download-pdf").forEach(btn => {
      btn.addEventListener("click", () => {
        const rId = btn.getAttribute("data-id");
        PDFExportService.downloadServiceReport(rId);
      });
    });
  }
};
