# Mathematical Modeling & Simulation Formulation

This document details the exact mathematical equations, biological kinetics, stochastic simulation procedures, and reproducibility controls used in HarvestIQ.

---

## 1. Spoilage Kinetics Model ($S$)

Fresh horticultural produce deteriorates primarily through cellular respiration and microbial proliferation, which accelerate exponentially with temperature. Rather than an uninterpretable neural network, HarvestIQ uses an **Arrhenius-adjusted first-order kinetic decay model**:

$$\text{SpoilageRate}(t) = 1 - \exp\left( - k_{\text{eff}} \times t_{\text{total}} \right)$$

where total exposure duration is:
$$t_{\text{total}} = t_{\text{storage}} + \frac{t_{\text{transit}}}{24.0} + t_{\text{harvest\_delay}} \quad (\text{days})$$

The effective degradation rate constant $k_{\text{eff}}$ ($\text{day}^{-1}$) is determined by:
$$k_{\text{eff}} = k_0 \times Q_{10}^{\frac{T_{\text{ambient}} - T_{\text{ref}}}{10}} \times \left(1 + \beta_{\text{RH}} \frac{\max(0, RH - RH_{\text{opt}})}{100}\right) \times M_{\text{stage}}$$

### Parameter Provenance Table

| Parameter | Symbol | Value / Range | Unit | Source / Citation | Status | Calibration Needed |
|---|---|---|---|---|---|---|
| Reference Temp | $T_{\text{ref}}$ | $20.0$ | $^\circ\text{C}$ | FAO Postharvest Series; Wills et al. (2007) | Literature-backed | No |
| Respiration Quotient | $Q_{10}$ | $2.15$ ($2.0\text{--}2.5$) | Dimensionless | Kader, A. A. (2002), UC Davis ANR Pub 3311 | Literature-backed | No |
| Tomato Base Rate | $k_{0, \text{tomato}}$ | $0.082$ | $\text{day}^{-1}$ | USDA Agricultural Handbook No. 66 | Literature-backed | Recommended for local cultivars |
| Onion Base Rate | $k_{0, \text{onion}}$ | $0.014$ | $\text{day}^{-1}$ | ICAR-DOGR Postharvest Guidelines | Literature-backed | Recommended for local cultivars |
| Potato Base Rate | $k_{0, \text{potato}}$ | $0.011$ | $\text{day}^{-1}$ | CPRI Shimla Storage Guidelines | Literature-backed | Recommended for local cultivars |
| Mango Base Rate | $k_{0, \text{mango}}$ | $0.095$ | $\text{day}^{-1}$ | FAO Agricultural Services Bulletin 151 | Literature-backed | Recommended for local cultivars |
| Optimal Humidity | $RH_{\text{opt}}$ | Tomato: $90$, Onion: $65$, Potato: $85$, Mango: $85$ | $\%$ | USDA Handbook No. 66 | Literature-backed | No |
| Excess Humidity Coeff | $\beta_{\text{RH}}$ | $0.50$ | Dimensionless | Engineering assumption for mold growth | `ASSUMED — NEEDS CALIBRATION` | **YES (Chamber trial required)** |
| Maturity Multiplier | $M_{\text{stage}}$ | Immature: $0.7$, Optimal: $1.0$, Ripe: $1.45$, Overripe: $2.3$ | Dimensionless | Respiration curve synthesis (Kader 2002) | Literature-guided / Assumed | **YES (Field grading trial)** |
| Transit Vibration Bruise | $D_{\text{transit}}$ | $0.025$ | $\text{per } 100\text{ km}$ | CIPHET-ICAR Post-Harvest Survey ranges | `ASSUMED — NEEDS CALIBRATION` | **YES (Road test trial)** |
| Handling Drop Loss | $D_{\text{handling}}$ | $0.020$ ($2\%$) | Dimensionless | Packhouse observation heuristic | `ASSUMED — NEEDS CALIBRATION` | **YES (Packhouse audit)** |

---

## 2. Empirical Market Price Simulator

For V1, HarvestIQ uses **empirical historical sampling** from APMC Mandi price distributions rather than ungrounded speculative forecasting:

$$P(t) = P_0 \times \left(1 + \Delta_{\text{historical, sampled}}\right)$$

where:
- $P_0$: Current spot or cached 7-day modal price (₹/kg).
- $\Delta_{\text{historical, sampled}} \sim \mathcal{N}(0, \sigma_{\text{commodity}}^2 \times \sqrt{t})$: Commodity daily price volatility scaled over horizon $t$ days.
- Bounded by a biological salvage floor: $P(t) \in [0.20 \times P_0, 2.50 \times P_0]$.

---

## 3. Expected Farmer Value (EFV) Formulation (Zero Double-Counting)

To prevent double-counting spoilage, HarvestIQ strictly separates **physical destruction of volume** (spoilage) from **discounted salvageable volume** (cosmetic/mechanical damage):

1. **Usable Physical Weight ($Q_{\text{usable}}$):**
   $$Q_{\text{usable}} = Q_{\text{harvest}} \times (1 - \text{SpoilageRate})$$
   $$Q_{\text{spoiled}} = Q_{\text{harvest}} \times \text{SpoilageRate}$$

2. **Partitioning Usable Weight into Sound vs. Damaged Produce:**
   $$\text{DamageRate} = \min\left(0.50, D_{\text{transit}} \frac{\text{Distance}}{100} + D_{\text{handling}}\right)$$
   $$Q_{\text{sound}} = Q_{\text{usable}} \times (1 - \text{DamageRate})$$
   $$Q_{\text{damaged}} = Q_{\text{usable}} \times \text{DamageRate}$$

3. **Gross Realized Revenue:**
   $$\text{Gross Revenue} = \left( Q_{\text{sound}} \times P_{\text{market}} \times G_{\text{multiplier}} \right) + \left( Q_{\text{damaged}} \times P_{\text{market}} \times G_{\text{multiplier}} \times \gamma_{\text{salvage}} \right)$$
   where $\gamma_{\text{salvage}} = 0.40$ (salvage recovery factor).

4. **Logistics & Operating Costs:**
   $$C_{\text{logistics}} = \left( \frac{Q_{\text{harvest}}}{1000} \times \text{Distance} \times C_{\text{freight}} \right) + \left( Q_{\text{harvest}} \times C_{\text{handling}} \right) + \left( Q_{\text{harvest}} \times t_{\text{storage}} \times C_{\text{storage}} \right)$$
   $$C_{\text{harvest\_total}} = Q_{\text{harvest}} \times C_{\text{harvest\_rate}}$$

5. **Net Expected Farmer Value (EFV):**
   $$\text{EFV} = \text{Gross Revenue} - C_{\text{logistics}} - C_{\text{harvest\_total}}$$

*Mathematical Invariant:* When $\text{SpoilageRate} = 1.0$, $Q_{\text{usable}} = 0 \implies \text{Gross Revenue} = 0$. The net EFV is strictly equal to the negative logistics and harvest costs. Spoilage is never deducted twice.

---

## 4. Monte Carlo Stochastic Simulation & Seed Reproducibility

Each simulation executes $N = 1,000$ iterations:
- Ambient temperature fluctuates around normal: $T \sim \mathcal{N}(\mu_T, \sigma_T^2 = 1.5^2)$.
- Transit transit duration fluctuates around road condition normal: $t_{\text{transit}} \sim \mathcal{N}(\mu_t, (0.20 \mu_t)^2)$.
- Market price fluctuates around historical volatility: $P \sim \mathcal{N}(P_0, \sigma_{\text{price}}^2)$.

### Output Statistical Distributions:
- **Expected EFV:** $\mu_{\text{EFV}} = \frac{1}{N} \sum_{i=1}^N \text{EFV}_i$
- **Median EFV:** $\text{Median}(\text{EFV})$
- **Conservative Downside (5th Percentile):** $P_{05}(\text{EFV})$
- **Optimistic Upside (95th Percentile):** $P_{95}(\text{EFV})$
- **Probability of Loss:** $\text{Prob}(\text{EFV} < 0) = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(\text{EFV}_i < 0)$

### Reproducibility Control:
Every simulation run accepts an optional `simulation_seed: int`. By passing `simulation_seed=42`, NumPy initializes `np.random.default_rng(42)`, ensuring **exact numerical reproducibility across viva evaluations and audits**.
