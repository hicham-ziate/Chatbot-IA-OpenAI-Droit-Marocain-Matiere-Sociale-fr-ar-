const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const PDFS_DIR = path.join(__dirname, "../data/pdfs");
const INDEX_FILE = path.join(__dirname, "../data/index.json");

async function indexPDFs() {
  if (!fs.existsSync(PDFS_DIR)) {
    fs.mkdirSync(PDFS_DIR, { recursive: true });
  }

  // Lire récursivement tous les PDFs dans les sous-dossiers
  function getPDFs(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        results = results.concat(getPDFs(fullPath));
      } else if (item.endsWith(".pdf")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const files = getPDFs(PDFS_DIR);

  if (files.length === 0) {
    console.log("⚠️  Aucun PDF trouvé dans backend/data/pdfs/");
    console.log("   Ajoutez vos PDFs de lois marocaines dans ce dossier.");
    return;
  }

  console.log(`📚 ${files.length} PDF(s) trouvé(s). Indexation en cours...`);

  const chunks = [];

  for (const file of files) {
    const relativePath = path.relative(PDFS_DIR, file);
    console.log(`  → Traitement de : ${relativePath}`);
    try {
      const buffer = fs.readFileSync(file);
      const data = await pdfParse(buffer);

      // Nettoyer le texte
      const text = data.text.replace(/\s+/g, " ").trim();

      // Diviser en chunks de ~400 mots
      const words = text.split(" ");
      const chunkSize = 400;
      const overlap = 50; // chevauchement pour ne pas couper le contexte

      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.length > 100) {
          const relativePath = path.relative(PDFS_DIR, file);
        chunks.push({
            source: relativePath.replace(".pdf", ""),
            text: chunk,
            chunkIndex: Math.floor(i / (chunkSize - overlap)),
          });
        }
      }

      console.log(`     ✅ ${Math.ceil(words.length / chunkSize)} chunks extraits`);
    } catch (err) {
      console.error(`     ❌ Erreur avec ${file}: ${err.message}`);
    }
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(chunks, null, 2), "utf-8");
  console.log(`\n✅ Index créé : ${chunks.length} chunks depuis ${files.length} PDF(s)`);
  console.log(`   Fichier : backend/data/index.json`);
}

indexPDFs().catch(console.error);
