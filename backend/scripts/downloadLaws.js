const axios = require("axios");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../data/pdfs");

// Liste des lois marocaines principales avec leurs PDFs
const MOROCCAN_LAWS = [
  // ── DROIT CIVIL ──
  {
    name: "Code_Obligations_Contrats_DOC",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Dahir%20formant%20code%20des%20obligations%20et%20des%20contrats.pdf",
  },
  {
    name: "Code_Famille_Moudawana",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20de%20la%20famille.pdf",
  },

  // ── DROIT PÉNAL ──
  {
    name: "Code_Penal_Maroc",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20p%C3%A9nal.pdf",
  },
  {
    name: "Code_Procedure_Penale",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20de%20proc%C3%A9dure%20p%C3%A9nale.pdf",
  },

  // ── DROIT DU TRAVAIL ──
  {
    name: "Code_du_Travail_Loi_65-99",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20du%20travail.pdf",
  },

  // ── DROIT COMMERCIAL ──
  {
    name: "Code_de_Commerce",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20de%20commerce.pdf",
  },

  // ── PROCÉDURES ──
  {
    name: "Code_Procedure_Civile",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Code%20de%20proc%C3%A9dure%20civile.pdf",
  },

  // ── FISCALITÉ ──
  {
    name: "Code_General_Impots_CGI",
    url: "https://www.tax.gov.ma/wps/wcm/connect/tax/internet/professionnel/documentation/CGI/CGI+2024.pdf",
  },
  {
    name: "Code_Recouvrement_Creances_Publiques",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Recouvrement%20des%20cr%C3%A9ances%20publiques.pdf",
  },

  // ── PROCÉDURES ADMINISTRATIVES ──
  {
    name: "Loi_Tribunaux_Administratifs",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Tribunaux%20administratifs.pdf",
  },
  {
    name: "Charte_Communale",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Charte%20communale.pdf",
  },

  // ── CONSTITUTION ──
  {
    name: "Constitution_Maroc_2011",
    url: "https://adala.justice.gov.ma/production/legislation/fr/Nouveautes/Constitution.pdf",
  },
];

async function downloadPDF(law) {
  const filePath = path.join(OUTPUT_DIR, `${law.name}.pdf`);

  if (fs.existsSync(filePath)) {
    console.log(`  ⏭️  Déjà téléchargé : ${law.name}`);
    return true;
  }

  try {
    console.log(`  ⬇️  Téléchargement : ${law.name}...`);
    const response = await axios.get(law.url, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    fs.writeFileSync(filePath, response.data);
    const sizeMB = (response.data.length / 1024 / 1024).toFixed(2);
    console.log(`  ✅ ${law.name} (${sizeMB} MB)`);
    return true;
  } catch (error) {
    console.log(`  ❌ Échec : ${law.name} - ${error.message}`);
    return false;
  }
}

async function downloadAllLaws() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🇲🇦 Téléchargement des lois marocaines...\n");

  let success = 0;
  let failed = 0;

  for (const law of MOROCCAN_LAWS) {
    const ok = await downloadPDF(law);
    if (ok) success++;
    else failed++;

    // Pause entre les téléchargements
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n📊 Résultat : ${success} téléchargés, ${failed} échoués`);
  console.log(`📁 Dossier : backend/data/pdfs/`);

  if (success > 0) {
    console.log("\n▶️  Maintenant lancez : node scripts/indexer.js");
  } else {
    console.log("\n⚠️  Tous les téléchargements ont échoué.");
    console.log("    Téléchargez manuellement depuis : https://adala.justice.gov.ma");
    console.log("    Et placez les PDFs dans : backend/data/pdfs/");
  }
}

downloadAllLaws().catch(console.error);
