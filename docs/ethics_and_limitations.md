# Ethics, Known Limitations & Responsible Deployment

This document outlines the ethical responsibilities, socio-economic considerations, and technical limitations of the HarvestIQ Decision Support System.

---

## 1. Ethical Considerations in Agricultural Procurement

### A. Power Asymmetry Between Processing Units and Smallholder Farmers
- **Risk:** If a food processing unit unilaterally uses automated algorithms to reject farm produce, smallholder farmers may suffer sudden income loss without recourse.
- **HarvestIQ Safeguard:** The system models **Expected Farmer Value (EFV)** from the grower's perspective and provides a `CHANGE_OPTION` recommendation (e.g. rerouting to local Mandis or spot markets) rather than simple rejection, ensuring farmers are advised on alternative monetization channels.

### B. Algorithmic Transparency & Zero Hallucination
- All explanations are deterministic and template-derived from computed metrics (temperatures, degradation rates, freight costs). No generative LLM is permitted to fabricate recommendations or invent agricultural advice.

---

## 2. Technical & Data Limitations

1. **Synthetic Scenario Limitation:**
   - Parameter sweeps and failure test cases are generated computational simulations. While biological decay follows published Arrhenius literature (*Kader 2002*), local cultivar variations (e.g., hybrid tomato varieties vs. country varieties) require on-site packhouse calibration.
2. **Meteorological Grid Granularity:**
   - Satellite reanalysis (NASA POWER) has a spatial resolution of $0.5^\circ \times 0.5^\circ$ ($\approx 50\text{km}$). Microclimates (e.g., inside enclosed tin packhouses) may exceed ambient temperatures by $3\text{--}5^\circ\text{C}$.
3. **Wholesale Price Discontinuities:**
   - Mandi modal prices reflect APMC wholesale auctions. Sudden export bans, transport strikes, or unseasonal rains can cause non-normal price shocks that exceed standard geometric volatility sampling.
4. **Missing-Data Confidence Penalties:**
   - When inputs are missing, the system applies conservative penalties (-15% to -20%). While this prevents overconfidence, it may lead to risk-averse `REJECT` recommendations in data-scarce rural settings.
