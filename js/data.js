/* ============================================
   FRONTEND DATA SERVICE (CONNECTED TO EXPRESS REST API)
   ============================================ */

const API_BASE = "/api";

const DataService = {
  cache: {
    industries: [],
    analyzers: [],
    serviceReports: [],
    transactions: []
  },

  init: async () => {
    try {
      const [indRes, paramRes, srRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/industries`).then(r => r.json()),
        fetch(`${API_BASE}/analyzers`).then(r => r.json()),
        fetch(`${API_BASE}/service-reports`).then(r => r.json()),
        fetch(`${API_BASE}/transactions`).then(r => r.json())
      ]);

      DataService.cache.industries = indRes;
      DataService.cache.analyzers = paramRes;
      DataService.cache.serviceReports = srRes;
      DataService.cache.transactions = txRes;
    } catch (e) {
      console.warn("Backend API unavailable, using local mock store:", e);
    }
  },

  getIndustries: () => DataService.cache.industries,
  getIndustryById: (id) => DataService.cache.industries.find(i => i.id === id),

  getCategories: (filterIndustryId = null) => {
    let params = DataService.cache.analyzers;
    if (filterIndustryId) {
      params = params.filter(p => p.industryId === filterIndustryId);
    }

    const catMap = {
      gas: {
        id: "gas",
        name: "Gas Analyzers",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6m0 0a4 4 0 100 8 4 4 0 000-8z"/><path d="M6 12h12M9 16v3m6-3v3M8 21h8"/></svg>`,
        description: "Continuous Emission Monitoring System (CEMS) for gaseous pollutants",
        parameters: []
      },
      water: {
        id: "water",
        name: "Water Analyzers",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
        description: "Continuous Effluent Quality Monitoring System (EQMS) for wastewater",
        parameters: []
      },
      spm: {
        id: "spm",
        name: "SPM Monitors",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="7" r="1.5"/><circle cx="5" cy="17" r="2"/><circle cx="7" cy="7" r="1"/><circle cx="17" cy="17" r="1.5"/></svg>`,
        description: "Suspended Particulate Matter & Dust Density Monitoring",
        parameters: []
      },
      flow: {
        id: "flow",
        name: "Flow Meters",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M12 4v16M8 8l8 8M8 16l8-8"/></svg>`,
        description: "Gas & Effluent Volumetric Flow Rate Measurement",
        parameters: []
      }
    };

    params.forEach(p => {
      if (catMap[p.category]) {
        catMap[p.category].parameters.push(p);
      }
    });

    return Object.values(catMap);
  },

  getParameterById: (paramId) => {
    return DataService.cache.analyzers.find(p => p.parameterId === paramId);
  },

  getServiceReports: (industryId = null) => {
    if (!industryId) return DataService.cache.serviceReports;
    return DataService.cache.serviceReports.filter(sr => sr.industryId === industryId);
  },

  getTransactions: (industryId = null) => {
    if (!industryId) return DataService.cache.transactions;
    return DataService.cache.transactions.filter(t => t.industryId === industryId);
  },

  // API Mutators
  addIndustry: async (industryData) => {
    try {
      const res = await fetch(`${API_BASE}/industries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(industryData)
      });
      const data = await res.json();
      await DataService.init();
      return data;
    } catch (e) {
      console.error(e);
    }
  },

  deleteIndustry: async (id) => {
    // Local optimistic remove
    DataService.cache.industries = DataService.cache.industries.filter(i => i.id !== id);
    DataService.cache.analyzers = DataService.cache.analyzers.filter(a => a.industryId !== id);

    try {
      const res = await fetch(`${API_BASE}/industries/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      await DataService.init();
      return data;
    } catch (e) {
      console.error(e);
    }
  },

  addAnalyzerParameter: async (paramData) => {
    try {
      const res = await fetch(`${API_BASE}/analyzers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paramData)
      });
      const data = await res.json();
      await DataService.init();
      return data;
    } catch (e) {
      console.error(e);
    }
  },

  deleteAnalyzerParameter: async (parameterId) => {
    // Local optimistic remove
    DataService.cache.analyzers = DataService.cache.analyzers.filter(p => p.parameterId !== parameterId);

    try {
      const res = await fetch(`${API_BASE}/analyzers/${encodeURIComponent(parameterId)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      await DataService.init();
      return data;
    } catch (e) {
      console.error(e);
    }
  },

  updateParameterValue: async (parameterId, currentValue) => {
    // Local optimistic update
    const param = DataService.getParameterById(parameterId);
    if (param) {
      param.currentValue = parseFloat(currentValue);
      param.history.shift();
      param.history.push(param.currentValue);
    }

    try {
      await fetch(`${API_BASE}/telemetry/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameterId, currentValue })
      });
    } catch (e) {
      console.error(e);
    }
  },

  saveServiceReport: async (report) => {
    try {
      const res = await fetch(`${API_BASE}/service-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
      });
      const data = await res.json();
      await DataService.init();
      return data;
    } catch (e) {
      console.error(e);
    }
  }
};
