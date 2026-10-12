export const apiaryAIExamples = {
  "queen-status-from-sound": [
    {
      "notes": "Fictional planning comparison: explain what a qualified beekeeper should check; do not claim a diagnosis from an example."
    },
    {
      "notes": "Fictional planning comparison: identify limitations and missing acoustic evidence before any colony action."
    },
    {
      "notes": "Fictional planning comparison: request a conservative review checklist; no treatment or hive movement is approved."
    }
  ],
  "varroa-treatment-recommend": [
    {
      "season": "Spring planning"
    },
    {
      "season": "Summer planning"
    },
    {
      "season": "Autumn planning"
    }
  ],
  "swarm-risk-predict": [
    {
      "notes": "Fictional spring planning scenario. Explain uncertainty; no colony status or preventative action has been verified."
    },
    {
      "notes": "Fictional summer planning scenario. Compare monitoring questions, not an approved intervention."
    },
    {
      "notes": "Fictional autumn planning scenario. Identify missing field evidence and qualified review steps."
    }
  ],
  "pollination-route-plan": [
    {
      "stops": "Fictional demonstration stop North, Fictional demonstration stop South",
      "total_hives": 0
    },
    {
      "stops": "Fictional demonstration stop East, Fictional demonstration stop West",
      "total_hives": 40
    },
    {
      "stops": "Fictional demonstration stop Central",
      "total_hives": 80
    }
  ],
  "hive-strength-trend": [
    {},
    {},
    {}
  ],
  "executive-brief": [
    {
      "notes": "Fictional planning focus: record quality, missing evidence and review responsibilities."
    },
    {
      "notes": "Fictional planning focus: staffing and logistics; no completed operation is claimed."
    },
    {
      "notes": "Fictional planning focus: uncertainty, source checks and qualified decisions before action."
    }
  ],
  "harvest-forecast": [
    {
      "horizon_weeks": 2,
      "type": "Fictional clover scenario"
    },
    {
      "horizon_weeks": 4,
      "type": "Fictional wildflower scenario"
    },
    {
      "horizon_weeks": 8,
      "type": "Fictional mixed-bloom scenario"
    }
  ],
  "treatment-efficacy-analyze": [
    {
      "product": "Fictional planning product filter A; select an actual approved product before use"
    },
    {
      "product": "Fictional planning product filter B; no treatment is authorized"
    },
    {
      "product": "Fictional planning product filter C; require label and regulatory review"
    }
  ],
  "customer-quote": [
    {
      "customer": "Fictional demo customer North",
      "crop": "Fictional apple planning",
      "hives": 0,
      "weeks": 1
    },
    {
      "customer": "Fictional demo customer Central",
      "crop": "Fictional berry planning",
      "hives": 40,
      "weeks": 2
    },
    {
      "customer": "Fictional demo customer South",
      "crop": "Fictional almond planning",
      "hives": 80,
      "weeks": 3
    }
  ],
  "weather-impact-brief": [
    {
      "location": "Fictional northern planning location; obtain a verified forecast"
    },
    {
      "location": "Fictional central planning location; no weather observation supplied"
    },
    {
      "location": "Fictional southern planning location; qualify uncertainty"
    }
  ],
  "disease-outbreak-summary": [
    {},
    {},
    {}
  ],
  "supply-resupply-plan": [
    {
      "focus": "Fictional zero-spend review of missing inventory evidence"
    },
    {
      "focus": "Fictional team planning and stock-review priorities"
    },
    {
      "focus": "Fictional detailed planning with qualified human approval before purchases"
    }
  ],
  "beekeeper-schedule": [
    {
      "week_start": "2026-10-12",
      "focus": "Fictional planning: review sources and responsibilities"
    },
    {
      "week_start": "2026-10-19",
      "focus": "Fictional planning: staffing and field-review dependencies"
    },
    {
      "week_start": "2026-10-26",
      "focus": "Fictional planning: contingency and review checkpoints"
    }
  ],
  "plant-source-map": [
    {},
    {},
    {}
  ],
  "equipment-prognostic": [
    {
      "focus": "Fictional inspection planning; equipment condition is unverified"
    },
    {
      "focus": "Fictional maintenance planning; no service was performed"
    },
    {
      "focus": "Fictional contingency review; require authorized equipment checks"
    }
  ],
  "vendor-quote-compare": [
    {
      "item": "Fictional demo supply comparison A; no purchase approval"
    },
    {
      "item": "Fictional demo supply comparison B; no vendor quote supplied"
    },
    {
      "item": "Fictional demo supply comparison C; request actual source quotations"
    }
  ],
  "hive-acoustic-anomaly": [
    {
      "notes": "Fictional planning comparison: source quality and beekeeper review, not a diagnosis."
    },
    {
      "notes": "Fictional planning comparison: missing sound evidence and verification checklist."
    },
    {
      "notes": "Fictional planning comparison: conservative next review steps; no treatment approval."
    }
  ],
  "varroa-risk-score": [
    {
      "narrative": "Fictional hypothetical planning input; no measured inspection findings are supplied. Identify what a qualified beekeeper needs to verify.",
      "drone_count": 0,
      "brood_gap": "false"
    },
    {
      "narrative": "Fictional hypothetical planning comparison; brood metrics are assumptions, not observed facts. Require source review before any treatment.",
      "drone_count": 25,
      "brood_gap": "false"
    },
    {
      "narrative": "Fictional hypothetical planning boundary; compare an assumed brood gap, not a verified observation or diagnosis.",
      "drone_count": 50,
      "brood_gap": "true"
    }
  ],
  "queen-health-assess": [
    {
      "notes": "Fictional planning review of record completeness; no queen diagnosis."
    },
    {
      "notes": "Fictional planning review of uncertainties and source inspection needs."
    },
    {
      "notes": "Fictional planning comparison for a qualified beekeeper; no action is approved."
    }
  ],
  "beekeeper-mentor": [
    {
      "question": "Fictional planning question: which records should a new beekeeper gather for a safe human review? Include optional context: no verified observations or action approval is supplied."
    },
    {
      "question": "Fictional planning question: how should a team organize source checks and beekeeper review before hive work? Optional context: no treatment, disease diagnosis or completed task is asserted."
    },
    {
      "question": "Fictional planning question: compare conservative ways to improve apiary recordkeeping. Optional context: zero extra spending, unverified field conditions and no external action approval."
    }
  ],
  "foraging-optimizer": [
    {
      "notes": "Fictional planning comparison: verify weather, bloom and movement constraints before action."
    },
    {
      "notes": "Fictional planning comparison: identify source limitations; do not claim a live feed."
    },
    {
      "notes": "Fictional planning comparison: qualified review is required before relocation or intervention."
    }
  ]
};
export const apiaryObservationKeys = new Set(['notes', 'narrative', 'captured_at', 'mites_per_100_bees', 'drone_count', 'brood_gap']);
