/* ============================================
   PDF REPORT GENERATION SERVICE
   ============================================ */

const PDFExportService = {
  downloadServiceReport: (reportId) => {
    const reports = DataService.getServiceReports() || [];
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      alert("Report not found!");
      return;
    }

    if (window.jspdf && window.jspdf.jsPDF) {
      PDFExportService.generatePDFDoc(report);
    } else {
      PDFExportService.printReportHTML(report);
    }
  },

  printReportHTML: (report) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Report - ${report.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 30px; line-height: 1.5; }
          .header { background: #0c1236; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 20px; color: #00d4ff; }
          .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.8; }
          .box { background: #f8f9fa; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          .val { font-size: 14px; color: #0f172a; margin-bottom: 8px; font-weight: 500; }
          .section-title { font-size: 14px; font-weight: bold; color: #0c1236; border-bottom: 2px solid #00d4ff; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
          .param-badge { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
          .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>POLLUTION MONITORING SYSTEM</h1>
          <p>WORK COMPLETION & SERVICE REPORT — ${report.id}</p>
        </div>

        <div class="box">
          <div class="grid">
            <div>
              <div class="label">Industry Name</div>
              <div class="val">${report.industryName}</div>
              <div class="label">Analyzer Group</div>
              <div class="val">${report.analyzerCategory}</div>
              <div class="label">Parameter Name</div>
              <div class="val">${report.parameterName}</div>
            </div>
            <div>
              <div class="label">Parameter Deployment ID</div>
              <div class="val"><span class="param-badge">${report.parameterId}</span></div>
              <div class="label">Service Date</div>
              <div class="val">${report.date}</div>
              <div class="label">Service Status</div>
              <div class="val" style="color: ${report.status === 'Completed' ? '#16a34a' : '#d97706'}">${report.status}</div>
            </div>
          </div>
        </div>

        <div class="section-title">FIELD TECHNICIAN INFORMATION</div>
        <p><strong>Engineer:</strong> ${report.technician}</p>
        <p><strong>Service Type:</strong> ${report.serviceType}</p>

        <div class="section-title">FIELD OBSERVATIONS & DIAGNOSTICS</div>
        <div class="box">${report.observations || 'N/A'}</div>

        <div class="section-title">ACTIONS TAKEN & CALIBRATION EXECUTED</div>
        <div class="box" style="white-space: pre-line;">${report.actionsTaken || 'N/A'}</div>

        <div class="footer">
          <div>
            <p><strong>Technician Signature</strong></p>
            <br><br>
            <p>___________________________</p>
            <p style="font-size: 11px; color: #666;">Date: ${report.date}</p>
          </div>
          <div>
            <p><strong>Plant Manager Verification</strong></p>
            <br><br>
            <p>___________________________</p>
            <p style="font-size: 11px; color: #666;">Next Due: ${report.nextServiceDue}</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  },
  downloadSampleReport: () => {
    const sampleReport = {
      id: "SR-2026-089",
      industryId: "IND-001",
      industryName: "Apex Steel Industries",
      analyzerCategory: "Gas Analyzers",
      parameterId: "IND01_GAS_SO2",
      parameterName: "Sulfur Dioxide (SO₂)",
      date: "2026-07-20",
      technician: "Rahul Sharma (Senior Field Engineer)",
      status: "Completed",
      serviceType: "Quarterly Span Gas Calibration & Optical Sensor Zeroing",
      observations: "Zero drift observed on SO₂ optical detection cell by +3.2 ppm. Flue gas optics had minor particulate coating due to heavy stack load.",
      actionsTaken: "1. Thoroughly cleaned optical lens and sample probe assembly.\n2. Replaced 5-micron PTFE sample filter cartridge.\n3. Executed zero and 100 ppm certified span gas calibration.\n4. Verified 4-20mA analog telemetry output signal to CPCB gateway.",
      nextServiceDue: "2026-10-20"
    };

    PDFExportService.generatePDFDoc(sampleReport);
  },

  generatePDFDoc: (report) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Colors
      const primaryColor = [37, 99, 235];
      const darkColor = [15, 23, 42];
      const textColor = [51, 65, 85];
      const lightBg = [248, 250, 252];

      // Header Banner
      doc.setFillColor(...darkColor);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("SHREE PRATHAM TELEMETRY NETWORK", 15, 16);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("OFFICIAL SERVICE COMPLETION & CALIBRATION CERTIFICATE", 15, 26);

      // Report ID Tag
      doc.setFillColor(...primaryColor);
      doc.roundedRect(142, 10, 53, 16, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`REPORT: ${report.id}`, 147, 20);

      let y = 46;

      // Section 1: Facility & Analyzer Identification
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, y, 180, 44, 3, 3, 'FD');

      doc.setTextColor(...darkColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. FACILITY & ANALYZER IDENTIFICATION", 20, y + 10);

      doc.setTextColor(...textColor);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Industrial Plant: ${report.industryName}`, 20, y + 19);
      doc.text(`Analyzer Category: ${report.analyzerCategory}`, 20, y + 27);
      doc.text(`Monitored Parameter: ${report.parameterName}`, 20, y + 35);

      doc.text(`Parameter ID: ${report.parameterId}`, 115, y + 19);
      doc.text(`Service Date: ${report.date}`, 115, y + 27);
      doc.text(`Work Status: ${report.status}`, 115, y + 35);

      y += 52;

      // Section 2: Certified Engineer Information
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, y, 180, 26, 3, 3, 'FD');

      doc.setTextColor(...darkColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. FIELD ENGINEER & SERVICE SCOPE", 20, y + 10);

      doc.setTextColor(...textColor);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Engineer Name: ${report.technician}`, 20, y + 19);
      doc.text(`Service Scope: ${report.serviceType}`, 115, y + 19);

      y += 34;

      // Section 3: Diagnostic Observations
      doc.setTextColor(...darkColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. FIELD OBSERVATIONS & ZERO/SPAN DRIFT LOGS", 15, y);
      y += 6;

      const obsLines = doc.splitTextToSize(report.observations || "Standard field inspection completed without drift.", 172);
      const obsHeight = Math.max(16, obsLines.length * 5 + 6);
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, y, 180, obsHeight, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text(obsLines, 19, y + 6);

      y += obsHeight + 8;

      // Section 4: Maintenance & Calibration Executed
      doc.setTextColor(...darkColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("4. ACTIONS EXECUTED & CPCB COMPLIANCE VERIFICATION", 15, y);
      y += 6;

      const actionLines = doc.splitTextToSize(report.actionsTaken || "Routine zero check and optics cleaning executed.", 172);
      const actionHeight = Math.max(22, actionLines.length * 5 + 6);
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, y, 180, actionHeight, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text(actionLines, 19, y + 6);

      y += actionHeight + 10;

      // Signatures
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 14;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkColor);
      doc.text("FIELD SERVICE ENGINEER SIGNATURE", 20, y);
      doc.text("PLANT COMPLIANCE STAMP & SIGNATURE", 115, y);

      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text("____________________________________", 20, y);
      doc.text("____________________________________", 115, y);
      doc.text(report.technician || "Rahul Sharma (ENG-2026-042)", 20, y + 6);
      doc.text(`Authorized Plant Safety Officer`, 115, y + 6);
      doc.text(`Next Service Due: ${report.nextServiceDue}`, 115, y + 12);

      doc.save(`Service_Report_${report.id}_${report.parameterId}.pdf`);
    } else {
      PDFExportService.printReportHTML(report);
    }
  }
};
