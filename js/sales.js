/* ============================================
   SALES & PAYMENT STATUS PAGE CONTROLLER
   ============================================ */

const SalesPage = {
  render: (container, user) => {
    const isAdmin = user.role === "admin";
    const transactions = DataService.getTransactions(isAdmin ? null : user.industryId);
    const industries = DataService.getIndustries();

    // Summary calculations
    let totalRevenue = 0;
    let pendingAmount = 0;
    let overdueCount = 0;

    const allTx = DataService.getTransactions();
    allTx.forEach(t => {
      if (t.status === "Paid") totalRevenue += t.amount;
      else if (t.status === "Pending" || t.status === "Overdue") pendingAmount += t.amount;
      if (t.status === "Overdue") overdueCount++;
    });

    let html = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <h1>Sales & Payment Status</h1>
            <p class="header-subtitle">
              ${isAdmin ? "Billing, Invoices & Subscription Management across all Industries" : `Subscription & Payment History for ${user.name}`}
            </p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary btn-sm" id="btn-export-sales-csv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Export Statement
            </button>
          </div>
        </div>
      </div>

      <div class="page-body">
    `;

    if (isAdmin) {
      html += `
        <!-- Admin Summary Cards -->
        <div class="payment-summary stagger">
          <div class="stat-card success">
            <div class="stat-header">
              <span class="stat-label">Total Collections</span>
              <div class="stat-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
            </div>
            <div class="stat-value">₹${(totalRevenue).toLocaleString('en-IN')}</div>
            <div class="stat-change up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M18 15l-6-6-6 6"/></svg>
              <span>+18% from last quarter</span>
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-header">
              <span class="stat-label">Pending Dues</span>
              <div class="stat-icon warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
            </div>
            <div class="stat-value">₹${(pendingAmount).toLocaleString('en-IN')}</div>
            <div class="stat-change text-secondary">
              <span>Across ${industries.filter(i => i.amountDue > 0).length} Industries</span>
            </div>
          </div>

          <div class="stat-card danger">
            <div class="stat-header">
              <span class="stat-label">Overdue Accounts</span>
              <div class="stat-icon danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
              </div>
            </div>
            <div class="stat-value">${overdueCount}</div>
            <div class="stat-change down">
              <span>Immediate Follow-up Required</span>
            </div>
          </div>

          <div class="stat-card primary">
            <div class="stat-header">
              <span class="stat-label">Active Subscriptions</span>
              <div class="stat-icon primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              </div>
            </div>
            <div class="stat-value">${industries.length}</div>
            <div class="stat-change up">
              <span>100% Analyzer Telemetry Uptime</span>
            </div>
          </div>
        </div>
      `;
    } else {
      // Industry user view summary
      const indInfo = DataService.getIndustryById(user.industryId) || {};
      const isPaid = indInfo.paymentStatus === "Paid";
      const statusBadgeClass = isPaid ? "badge-success" : (indInfo.paymentStatus === "Pending" ? "badge-warning" : "badge-danger");

      html += `
        <div class="glass-card mb-8" style="background: linear-gradient(135deg, rgba(13,19,51,0.8), rgba(20,26,74,0.6)); border-color: rgba(0,212,255,0.2);">
          <div class="flex items-center justify-between flex-wrap gap-6">
            <div>
              <span class="badge ${statusBadgeClass} mb-2"><span class="dot pulse"></span> Payment Status: ${indInfo.paymentStatus}</span>
              <h2>${indInfo.subscription || "CEMS Monitoring Subscription"}</h2>
              <p class="text-secondary text-sm mt-1">Industry Account: <strong>${user.name}</strong> | Category: ${indInfo.category}</p>
            </div>
            <div style="text-align: right;">
              <div class="text-xs text-secondary text-uppercase">Current Amount Due</div>
              <div class="text-3xl font-bold ${indInfo.amountDue > 0 ? 'text-warning' : 'text-success'}">
                ₹${(indInfo.amountDue || 0).toLocaleString('en-IN')}
              </div>
              <div class="text-xs text-muted mt-1">
                ${indInfo.nextBillingDate ? `Next Billing: ${indInfo.nextBillingDate}` : `Due Date: ${indInfo.dueDate || 'N/A'}`}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Filter controls and transactions table
    html += `
        <div class="glass-card">
          <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h3 style="font-size: 16px;">Invoice & Payment History</h3>
              <p class="text-xs text-secondary">Complete breakdown of analyzer billing receipts and compliance payments</p>
            </div>
            <div class="filter-bar" id="sales-filter-bar">
              <button class="filter-chip active" data-status="all">All Invoices</button>
              <button class="filter-chip" data-status="Paid">Paid</button>
              <button class="filter-chip" data-status="Pending">Pending</button>
              <button class="filter-chip" data-status="Overdue">Overdue</button>
            </div>
          </div>

          <div class="data-table-wrapper">
            <table class="data-table" id="transactions-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Industry / Plant</th>
                  <th>Subscription Plan</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
    `;

    transactions.forEach(t => {
      let badgeClass = "badge-neutral";
      if (t.status === "Paid") badgeClass = "badge-success";
      else if (t.status === "Pending") badgeClass = "badge-warning";
      else if (t.status === "Overdue") badgeClass = "badge-danger";

      html += `
        <tr data-status="${t.status}">
          <td class="font-mono font-semibold" style="color: var(--primary);">${t.invoiceId}</td>
          <td>
            <div class="font-medium">${t.industryName}</div>
          </td>
          <td>${t.plan}</td>
          <td class="text-secondary">${t.period}</td>
          <td class="font-mono font-bold">₹${t.amount.toLocaleString('en-IN')}</td>
          <td class="text-secondary">${t.paymentMethod}</td>
          <td><span class="badge ${badgeClass}"><span class="dot"></span> ${t.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm btn-view-invoice" data-inv="${t.invoiceId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              Receipt
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

      <!-- Invoice Receipt Modal -->
      <div class="modal-overlay hidden" id="modal-invoice">
        <div class="modal">
          <div class="modal-header">
            <h3>Official Payment Receipt</h3>
            <button class="modal-close" id="close-invoice-modal">&times;</button>
          </div>
          <div class="modal-body" id="invoice-modal-content">
            <!-- Rendered dynamically -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-print-receipt">Print Receipt</button>
            <button class="btn btn-primary" id="close-invoice-modal-btn">Done</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Filter event listeners
    const filterChips = container.querySelectorAll("#sales-filter-bar .filter-chip");
    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        const targetStatus = chip.getAttribute("data-status");
        const rows = container.querySelectorAll("#transactions-table tbody tr");

        rows.forEach(row => {
          if (targetStatus === "all" || row.getAttribute("data-status") === targetStatus) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      });
    });

    // Invoice View Listeners
    const modal = container.querySelector("#modal-invoice");
    const modalContent = container.querySelector("#invoice-modal-content");

    container.querySelectorAll(".btn-view-invoice").forEach(btn => {
      btn.addEventListener("click", () => {
        const invId = btn.getAttribute("data-inv");
        const tx = DataService.getTransactions().find(t => t.invoiceId === invId);
        if (tx) {
          modalContent.innerHTML = `
            <div style="padding: var(--space-4); background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--border);">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h2 style="font-size: 18px; color: var(--primary);">POLLUTION MONITORING SYSTEM</h2>
                  <p class="text-xs text-muted">Official Payment Receipt & Billing Advice</p>
                </div>
                <div class="text-right">
                  <div class="font-mono text-sm font-bold">${tx.invoiceId}</div>
                  <div class="text-xs text-secondary">Date: ${tx.date}</div>
                </div>
              </div>

              <div class="grid grid-2 gap-4 mb-6">
                <div>
                  <div class="text-xs text-muted">Billed To Industry</div>
                  <div class="font-semibold text-sm">${tx.industryName}</div>
                </div>
                <div>
                  <div class="text-xs text-muted">Payment Status</div>
                  <div class="font-semibold text-sm ${tx.status === 'Paid' ? 'text-success' : 'text-warning'}">${tx.status}</div>
                </div>
              </div>

              <div style="border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 12px 0; margin-bottom: 16px;">
                <div class="flex justify-between text-sm mb-2">
                  <span>Subscription Service Plan</span>
                  <span class="font-semibold">${tx.plan}</span>
                </div>
                <div class="flex justify-between text-sm mb-2">
                  <span>Billing Period</span>
                  <span class="text-secondary">${tx.period}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Payment Channel</span>
                  <span class="text-secondary">${tx.paymentMethod}</span>
                </div>
              </div>

              <div class="flex justify-between items-center text-lg font-bold">
                <span>Total Amount Paid / Due:</span>
                <span class="text-primary font-mono">₹${tx.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          `;
          modal.classList.remove("hidden");
        }
      });
    });

    const closeModal = () => modal.classList.add("hidden");
    container.querySelector("#close-invoice-modal").addEventListener("click", closeModal);
    container.querySelector("#close-invoice-modal-btn").addEventListener("click", closeModal);

    container.querySelector("#btn-print-receipt").addEventListener("click", () => {
      window.print();
    });

    // CSV Export simulation
    const exportBtn = container.querySelector("#btn-export-sales-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        App.showToast("Exporting Sales & Billing Statement as CSV...", "success");
      });
    }
  }
};
