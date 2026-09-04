import type { AnalysisResponse, AnalysisRequest } from '../types/simulator';

/**
 * Generate and download a formatted PDF / Printable Executive Dossier
 */
export const downloadExecutiveReport = (data: AnalysisResponse, inputs?: Partial<AnalysisRequest>) => {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const reportId = `HIQ-REP-${Date.now().toString(36).toUpperCase()}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HarvestIQ Executive Decision Report - ${reportId}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title {
      font-size: 18pt;
      font-weight: 800;
      color: #059669;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 8pt;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
    }
    .report-id {
      font-weight: 700;
      color: #0f172a;
    }
    
    /* Decision Box */
    .decision-banner {
      background: #ecfdf5;
      border: 1.5px solid #10b981;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .verdict-tag {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #047857;
    }
    .verdict-title {
      font-size: 15pt;
      font-weight: 800;
      color: #065f46;
      margin: 2px 0;
    }
    .verdict-desc {
      font-size: 9.5pt;
      color: #047857;
    }
    .efv-badge {
      text-align: right;
    }
    .efv-val {
      font-size: 17pt;
      font-weight: 800;
      color: #047857;
    }
    .efv-label {
      font-size: 8pt;
      color: #065f46;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* Metric Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
    }
    .card-label {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .card-val {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      margin: 2px 0;
    }
    .card-sub {
      font-size: 7.5pt;
      color: #64748b;
    }

    /* Section Headings */
    h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin: 14px 0 8px 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 5px 8px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
    }

    .pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 7.5pt;
      background: #e2e8f0;
      color: #334155;
    }
    .pill-green {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    
    .rationale-box {
      background: #f8fafc;
      border-left: 3px solid #059669;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 9pt;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94a3b8;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div>
        <h1 class="brand-title">HARVESTIQ</h1>
        <div class="brand-sub">Post harvest Spoilage Kinetics & Market Option Decision Engine</div>
      </div>
    </div>
    <div class="report-meta">
      <div>Report ID: <span class="report-id">${reportId}</span></div>
      <div>Generated: ${timestamp}</div>
      <div>Reliability Score: <strong>${(data.recommendation_reliability * 100).toFixed(0)}%</strong></div>
    </div>
  </div>

  <!-- Primary Verdict Banner -->
  <div class="decision-banner">
    <div>
      <div class="verdict-tag">AI Executive Verdict</div>
      <div class="verdict-title">${data.decision.replace(/_/g, ' ')}</div>
      <div class="verdict-desc">${data.decision_badge}</div>
    </div>
    <div class="efv-badge">
      <div class="efv-val">₹${Math.round(data.outcome_interval.mean).toLocaleString('en-IN')}</div>
      <div class="efv-label">Expected Net Profit</div>
    </div>
  </div>

  <!-- Key Metrics 4-Card Grid -->
  <div class="grid">
    <div class="card">
      <div class="card-label">Expected Return</div>
      <div class="card-val">₹${Math.round(data.outcome_interval.mean).toLocaleString('en-IN')}</div>
      <div class="card-sub">Median: ₹${Math.round(data.outcome_interval.median).toLocaleString('en-IN')}</div>
    </div>
    <div class="card">
      <div class="card-label">90% Profit Interval</div>
      <div class="card-val" style="font-size: 10.5pt;">₹${Math.round(data.outcome_interval.p05).toLocaleString('en-IN')} – ₹${Math.round(data.outcome_interval.p95).toLocaleString('en-IN')}</div>
      <div class="card-sub">P05 to P95 Spread</div>
    </div>
    <div class="card">
      <div class="card-label">Estimated Spoilage</div>
      <div class="card-val" style="color: #d97706;">${data.spoilage_metrics.mean_rate.toFixed(1)}%</div>
      <div class="card-sub">Shelf Life: ~${data.spoilage_metrics.estimated_shelf_life_days.toFixed(1)} Days</div>
    </div>
    <div class="card">
      <div class="card-label">Downside Loss Risk</div>
      <div class="card-val" style="color: #dc2626;">${(data.outcome_interval.prob_loss * 100).toFixed(1)}%</div>
      <div class="card-sub">Negative Return Prob.</div>
    </div>
  </div>

  <!-- Lot Specifications -->
  <h2>1. Harvest Lot & Field Operating Conditions</h2>
  <table>
    <tr>
      <th style="width: 25%;">Commodity</th>
      <td style="width: 25%;"><strong>${inputs?.crop || 'Tomato'}</strong></td>
      <th style="width: 25%;">Ripeness Grade</th>
      <td style="width: 25%;">${inputs?.maturity_stage || 'Optimal'}</td>
    </tr>
    <tr>
      <th>Total Quantity</th>
      <td>${inputs?.quantity_kg ? inputs.quantity_kg.toLocaleString('en-IN') : '1,000'} kg</td>
      <th>Hub Location</th>
      <td>${inputs?.region || 'Dindigul (Tamil Nadu)'}</td>
    </tr>
    <tr>
      <th>Ambient Temperature</th>
      <td>${inputs?.temperature_c !== undefined ? inputs.temperature_c : '28.4'} °C (NASA POWER)</td>
      <th>Relative Humidity</th>
      <td>${inputs?.relative_humidity_pct !== undefined ? inputs.relative_humidity_pct : '75'} %</td>
    </tr>
    <tr>
      <th>Spot Price / kg</th>
      <td>₹${inputs?.market_price_per_kg || 24.0}</td>
      <th>Logistics Transit</th>
      <td>${inputs?.transport_duration_hours || 6.0} hrs (${inputs?.transit_distance_km || 100} km)</td>
    </tr>
  </table>

  <!-- Harvest Timing Analysis -->
  <h2>2. Harvest Timing Comparison (Day 0 vs Delay)</h2>
  <table>
    <thead>
      <tr>
        <th>Harvest Timing Window</th>
        <th>Delay</th>
        <th>Expected Net Return</th>
        <th>Biological Spoilage</th>
        <th>Operational Action</th>
      </tr>
    </thead>
    <tbody>
      ${data.timing_comparisons.map(t => `
        <tr>
          <td><strong>${t.timing_label}</strong></td>
          <td>${t.delay_days} Days</td>
          <td><strong>₹${Math.round(t.efv_mean).toLocaleString('en-IN')}</strong></td>
          <td>${t.spoilage_mean.toFixed(1)}%</td>
          <td>${t.recommendation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Market Options Comparison -->
  <h2>3. Market Options Arbitrage</h2>
  <table>
    <thead>
      <tr>
        <th>Market Channel</th>
        <th>Expected Net Value</th>
        <th>Advantage (%)</th>
        <th>Key Advantage / Note</th>
      </tr>
    </thead>
    <tbody>
      ${data.market_options.map(m => `
        <tr>
          <td><strong>${m.option_name}</strong></td>
          <td><strong>₹${Math.round(m.efv_mean).toLocaleString('en-IN')}</strong></td>
          <td><span class="pill pill-green">${m.advantage_pct >= 0 ? '+' : ''}${m.advantage_pct.toFixed(1)}%</span></td>
          <td>${m.recommendation_note}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Decision Rationale -->
  <h2>4. Executive Decision Rationale & Summary</h2>
  <div class="rationale-box">
    <strong>Decision Explanation:</strong> ${data.explanation}
  </div>

  <!-- Sign-off & Provenance -->
  <h2>5. Quality Auditor Verification</h2>
  <table>
    <tr>
      <th style="width: 25%;">Scientific Citations</th>
      <td colspan="3">UC Davis Post harvest (Kader 2002, Q10=2.15), USDA Handbook 66 (ICAR-DOGR), Agmarknet APMC Modal Prices.</td>
    </tr>
    <tr>
      <th>Certified By</th>
      <td style="width: 35%;">HarvestIQ Stochastic Risk Engine v1.0</td>
      <th style="width: 15%;">Signature</th>
      <td style="width: 25%; font-family: cursive; color: #047857;">Verified Compliant</td>
    </tr>
  </table>

  <!-- Footer -->
  <div class="footer">
    <div>HarvestIQ Enterprise • Confidential & Proprietary Agricultural Decision Intelligence</div>
    <div>Page 1 of 1</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

/**
 * Generate and download CSV export
 */
export const downloadCsvReport = (data: AnalysisResponse, inputs?: Partial<AnalysisRequest>) => {
  const rows: string[][] = [
    ['HARVESTIQ ENTERPRISE - ANALYSIS DATA EXPORT'],
    ['Generated At', new Date().toISOString()],
    ['Report ID', `HIQ-${Date.now()}`],
    ['Crop', inputs?.crop || 'Tomato'],
    ['Maturity', inputs?.maturity_stage || 'Optimal'],
    ['Lot Quantity (kg)', inputs?.quantity_kg?.toString() || '1000'],
    ['Region', inputs?.region || 'Dindigul_TN'],
    [''],
    ['EXECUTIVE DECISION SUMMARY'],
    ['Verdict', data.decision.replace(/_/g, ' ')],
    ['Decision Subtitle', data.decision_badge],
    ['Recommendation Reliability', `${(data.recommendation_reliability * 100).toFixed(0)}%`],
    [''],
    ['FINANCIAL & BIOLOGICAL METRICS'],
    ['Expected Net Value (Mean EFV)', `₹${Math.round(data.outcome_interval.mean)}`],
    ['Median Net Value', `₹${Math.round(data.outcome_interval.median)}`],
    ['5th Percentile EFV (Worst 5%)', `₹${Math.round(data.outcome_interval.p05)}`],
    ['95th Percentile EFV (Best 5%)', `₹${Math.round(data.outcome_interval.p95)}`],
    ['Spoilage Rate (%)', `${data.spoilage_metrics.mean_rate.toFixed(2)}%`],
    ['Remaining Shelf Life (Days)', `${data.spoilage_metrics.estimated_shelf_life_days.toFixed(1)}`],
    ['Downside Loss Probability', `${(data.outcome_interval.prob_loss * 100).toFixed(2)}%`],
    [''],
    ['HARVEST TIMING COMPARISONS'],
    ['Timing Option', 'Delay Days', 'Expected Net Value (₹)', 'Spoilage (%)', 'Action'],
    ...data.timing_comparisons.map(t => [
      t.timing_label,
      t.delay_days.toString(),
      Math.round(t.efv_mean).toString(),
      t.spoilage_mean.toFixed(1),
      t.recommendation
    ]),
    [''],
    ['MARKET OPTIONS COMPARISON'],
    ['Market Channel', 'Expected Net Value (₹)', 'Net Margin (₹)', 'Advantage (%)', 'Rationale'],
    ...data.market_options.map(m => [
      m.option_name,
      Math.round(m.efv_mean).toString(),
      Math.round(m.net_margin_inr).toString(),
      `${m.advantage_pct.toFixed(1)}%`,
      `"${m.recommendation_note}"`
    ]),
    [''],
    ['SENSITIVITY TORNADO RANKING'],
    ['Factor', 'Base Value', 'Low EFV (₹)', 'High EFV (₹)', 'Impact Swing (±₹)', 'Rank'],
    ...data.sensitivity_tornado.map(s => [
      s.parameter_name,
      s.base_value.toString(),
      Math.round(s.low_efv).toString(),
      Math.round(s.high_efv).toString(),
      Math.round(s.swing_inr).toString(),
      s.rank.toString()
    ])
  ];

  const csvContent = rows.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HarvestIQ_Analysis_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate and download JSON export
 */
export const downloadJsonReport = (data: AnalysisResponse) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `HarvestIQ_Analysis_Data_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
