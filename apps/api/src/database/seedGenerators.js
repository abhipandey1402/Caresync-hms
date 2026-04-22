const MEDICINE_PREFIXES = [
  "Ace", "Ami", "Ato", "Beco", "Cefa", "Cipro", "Clari", "Dolo", "Dapa", "Enzo",
  "Fexo", "Gaba", "Glim", "Hydro", "Itra", "Levo", "Lora", "Meto", "Moxi", "Napa",
  "Oflo", "Onda", "Panto", "Para", "Rabi", "Rosi", "Sefa", "Sita", "Telo", "Trama",
  "Uro", "Vala", "Veno", "Xylo", "Zefu", "Brom", "Calc", "Doxi", "Emi", "Fura"
];

const MEDICINE_SUFFIXES = [
  "cet", "mox", "zole", "pril", "tin", "dine", "flox", "mine", "pam", "sone",
  "xime", "navir", "set", "done", "trol", "vast", "press", "zid", "line", "zone"
];

const MEDICINE_STRENGTHS = [
  "50mg", "100mg", "125mg", "200mg", "250mg", "300mg", "400mg", "500mg"
];

const MEDICINE_FORMS = [
  "Tablet", "Capsule", "Syrup", "Injection", "Suspension", "Drops", "Cream", "Gel"
];

const MEDICINE_MANUFACTURERS = [
  "CareSync Labs",
  "Aarogya Pharma",
  "Nexa Remedies",
  "Zenith Healthcare",
  "Shifa Therapeutics"
];

const ICD_CHAPTERS = [
  ["A", "Infectious and parasitic disease"],
  ["B", "Viral and bacterial disorder"],
  ["C", "Neoplasm and growth disorder"],
  ["D", "Blood and immune disorder"],
  ["E", "Endocrine and metabolic disorder"],
  ["F", "Mental and behavioural disorder"],
  ["G", "Neurological disorder"],
  ["H", "Eye and ear disorder"],
  ["I", "Circulatory disorder"],
  ["J", "Respiratory disorder"],
  ["K", "Digestive disorder"],
  ["L", "Skin and connective tissue disorder"],
  ["M", "Musculoskeletal disorder"],
  ["N", "Genitourinary disorder"],
  ["O", "Pregnancy related condition"],
  ["P", "Perinatal condition"],
  ["Q", "Congenital anomaly"],
  ["R", "Abnormal clinical finding"],
  ["S", "Injury and trauma"],
  ["T", "Poisoning and external cause"],
  ["U", "Special purpose condition"],
  ["V", "Transport accident"],
  ["W", "Accidental exposure"],
  ["X", "External cause"],
  ["Y", "Complication of care"],
  ["Z", "Health service and encounter"]
];

const DIAGNOSIS_MODIFIERS = [
  "acute",
  "chronic",
  "recurrent",
  "suspected",
  "unspecified",
  "mild",
  "severe"
];

export const generateMedicineMasterRecords = (minimumCount = 6000) => {
  const records = [];
  let serial = 1;

  outer: for (const prefix of MEDICINE_PREFIXES) {
    for (const suffix of MEDICINE_SUFFIXES) {
      const genericName = `${prefix}${suffix}`;

      for (const strength of MEDICINE_STRENGTHS) {
        for (const form of MEDICINE_FORMS) {
          const code = `MED-${String(serial).padStart(5, "0")}`;
          const manufacturer = MEDICINE_MANUFACTURERS[serial % MEDICINE_MANUFACTURERS.length];

          records.push({
            code,
            genericName,
            medicineName: `${genericName} ${strength} ${form}`,
            strength,
            form,
            manufacturer,
            schedule: serial % 5 === 0 ? "H" : "OTC",
            isActive: true,
            searchTerms: [genericName.toLowerCase(), strength.toLowerCase(), form.toLowerCase()]
          });

          serial += 1;

          if (records.length >= minimumCount) {
            break outer;
          }
        }
      }
    }
  }

  return records;
};

export const generateDiagnosisRecords = (minimumCount = 3500) => {
  const records = [];

  outer: for (const [chapterCode, chapterTitle] of ICD_CHAPTERS) {
    for (let category = 0; category < 20; category += 1) {
      for (let variant = 0; variant < DIAGNOSIS_MODIFIERS.length; variant += 1) {
        const categoryCode = String(category).padStart(2, "0");
        const detailCode = `${chapterCode}${categoryCode}.${variant}`;

        records.push({
          code: detailCode,
          category: `${chapterCode}${categoryCode}`,
          description: `${chapterTitle} - ${DIAGNOSIS_MODIFIERS[variant]} presentation ${category + 1}`,
          chapter: chapterTitle,
          isActive: true
        });

        if (records.length >= minimumCount) {
          break outer;
        }
      }
    }
  }

  return records;
};
