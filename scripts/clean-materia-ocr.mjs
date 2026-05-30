/**
 * Cleans OCR output from Homeopathic materia_medica PDF extract.
 * Run: node scripts/clean-materia-ocr.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "Homeopathic_materia_medica_1_pages_2-20_ocr.txt");
const output = join(root, "Homeopathic_materia_medica_1_pages_2-20_ocr_clean.txt");

let text = readFileSync(input, "utf8");

// --- Whole-document replacements (order matters: longer/specific first) ---
const pairs = [
  ["Ph.D,,", "Ph.D.,"],
  ["D.Litt.", "D.Litt."],
  ["Haemorthoidal", "Haemorrhoidal"],
  ["Haemorthoids", "Haemorrhoids"],
  ["Hyperhydrosis", "Hyperhidrosis"],
  ["Tydropic", "Hydropic"],
  ["Neusasthenia", "Neurasthenia"],
  ["Inflammn.", "Inflamm."],
  ["Stimultg.", "Stimulating"],
  ["DysmenorrheajAmenorr.", "Dysmenorrhoea/Amenorrh."],
  ["Anthrobia", "Anthophobia"],
  ["Anthrophobia", "Anthophobia"],
  ["Assmn.", "Assim."],
  ["Envirmt.", "Environ."],
  ["Vaccn.", "Vacc."],
  ["Catarth", "Catarrh"],
  ["c/i5", "C/15"],
  ["C/i7", "C/17"],
  ["C/i8", "C/18"],
  ["cyi7", "C/17"],
  ["Ciil", "C/11"],
  ["Cji2", "C/12"],
  ["Ci4", "C/14"],
  ["Ci6", "C/16"],
  ["cjl2", "C/12"],
  ["CII3", "C/13"],
  ["Clb", "C/11"],
  ["CA3", "C/3"],
  ["§C/3", "SC/3"],
  ["8C/6", "SC/6"],
  ["SCi2", "SC/12"],
  ["SCj8", "SC/8"],
  ["SCj10", "SC/10"],
  ["SCj/l2", "SC/12"],
  ["scj2", "SC/2"],
  ["Scjl", "SC/1"],
  ["SCjs", "SC/5"],
  ["scj7", "SC/7"],
  ["scj9", "SC/9"],
  ["scji9", "SC/19"],
  ["G/2I", "G/21"],
  ["G)2t", "G/21"],
  ["GJIT", "G/17"],
  ["G/l_", "G/1"],
  ["G/T?", "G/7"],
  ["G/T", "G/7"],
  ["G/i0", "G/10"],
  ["Gi16", "G/16"],
  ["GiB", "G/18"],
  ["Gill", "G/11"],
  ["Gis", "G/18"],
  ["G13 ", "G/13 "],
  ["G6", "G/6"],
  ["G8", "G/8"],
  ["G20", "G/20"],
  ["G21", "G/21"],
  ["G22", "G/22"],
  ["G24", "G/24"],
  ["G25", "G/25"],
  ["G26", "G/26"],
  ["G27", "G/27"],
  ["G/29", "G/29"],
  ["G/30", "G/30"],
  ["G/31", "G/31"],
  ["RiIS", "R/15"],
  ["RIB", "R/18"],
  ["RII2", "R/12"],
  ["RII?", "R/11"],
  ["Rid", "R/11"],
  ["Ril ", "R/11 "],
  ["Ril\n", "R/11\n"],
  ["R21 ", "R/21 "],
  ["R21\n", "R/21\n"],
  ["R24", "R/24"],
  ["R26", "R/26"],
  ["R27", "R/27"],
  ["R31", "R/31"],
  ["R32", "R/32"],
  ["R39", "R/39"],
  ["R46", "R/46"],
  ["R50", "R/50"],
  ["R/53.", "R/53"],
  ["R/S4", "R/54"],
  ["R/S0", "R/50"],
  ["R/S ", "R/5 "],
  ["R/S\n", "R/5\n"],
  ["R34 ", "R/34 "],
  ["R34\n", "R/34\n"],
  ["Rta", "R/18"],
  ["R/IS ", "R/15 "],
  ["R/IS\n", "R/15\n"],
  ["R20", "R/20"],
  ["Lfi5", "L/15"],
  ["L/l2", "L/12"],
  ["LjI", "L/1"],
  ["Lj ", "L/1 "],
  ["Lj\n", "L/1\n"],
  ["LIN", "L/17"],
  ["Lil ", "L/1 "],
  ["LiI7", "L/17"],
  ["LiI8", "L/18"],
  ["L/]0", "L/10"],
  ["L/I]", "L/11"],
  ["L/I2", "L/12"],
  ["L/I6", "L/16"],
  ["LB", "L/8"],
  ["L4", "L/4"],
  ["PIT ", "P/17 "],
  ["PyLS", "P/15"],
  ["Py19", "P/19"],
  ["PITS", "P/19"],
  ["Pid ", "P/4 "],
  ["Pi8", "P/8"],
  ["P10 ", "P/10 "],
  ["P10\n", "P/10\n"],
  ["PIIS", "P/15"],
  ["PS ", "P/5 "],
  ["P39", "P/39"],
  ["PALS", "P/15"],
  ["PAS", "P/15"],
  ["P'45", "P/45"],
  ["PA ", "P/1 "],
  ["PB ", "P/8 "],
  ["p/21", "P/21"],
  ["P/il", "P/11"],
  ["P/IS", "P/15"],
  ["P/IAS", "P/15"],
  ["P/I7", "P/17"],
  ["P/I8", "P/18"],
  ["P/I9", "P/19"],
  ["P/I]", "P/11"],
  ["P/I1", "P/11"],
  ["P/I2", "P/12"],
  ["P/l ", "P/1 "],
  ["Ci ", "C/1 "],
  ["C7", "C/7"],
  ["([rritations)", "(Irritations)"],
  ["iti-xiv", "iii–xiv"],
  ["‘Diabetes", "Diabetes"],
  ["‘6", ""],
  ["~—«", ""],
  ["© ", ""],
  ["rp)", ""],
  ["2B", "78"],
  ["of)", "79"],
  ["1%", "173"],
  ["4]", "47"],
  ["4i", "41"],
  ["H7", "117"],
  ["Wl", "111"],
  ["H5", "115"],
  ["12]", "121"],
  ["15]", "151"],
  ["533", "53"],
  ["17]", "171"],
  ["c/o", "C/10"],
  ["GA", "G/4"],
  ["GR", "G/2"],
  ["Gh", "G/4"],
  ["8/3", "P/3"],
  ["SCIS", "SC/15"],
  ["SC/S", "SC/5"],
  ["SCI ", "SC/1 "],
  ["No,", "No."],
  ["etc,", "etc."],
  ["ete.", "etc."],
  ["efc.", "etc."],
  ["Trauma:accident", "Trauma: accident"],
  ["Cystitis:bladder", "Cystitis: bladder"],
  ["Childrens remedy", "Children’s remedy"],
  ["J8 Climacteric", "R/8 Climacteric"],
  ["/6 Influenza", "R/6 Influenza"],
  ["Hay Fever G19 ", "Hay Fever G/19 "],
  ["Common Cold C2 ", "Common Cold C/2 "],
  ["Throat Ls ", "Throat L/5 "],
  ["1/20", "L/20"],
  ["1/4", "L/4"],
];

for (const [a, b] of pairs) {
  text = text.split(a).join(b);
}

// Standalone OCR tokens (whole line or word boundary)
text = text.replace(/^RI$/gm, "R/1");
text = text.replace(/^Ri$/gm, "R/1");
text = text.replace(/\bGj\b/g, "G/1");
text = text.replace(/\bGi\b/g, "G/1");
text = text.replace(/\bLIS\b/g, "L/5");
text = text.replace(/\bR\/l\b/g, "R/1");
text = text.replace(/\bL\/S\b/g, "L/8");
text = text.replace(/Stomach \[2 /g, "Stomach 12 ");
text = text.replace(/Diarrhoea Ii\b/g, "Diarrhoea 11");
text = text.replace(/G\/28 Varicose Veins 50\b/g, "G/28 Varicose Veins 90");
text = text.replace(
  /L\/18 Colic\n\nL\/9 Asthma\n\nL\/20/g,
  "L/18 Colic\n\nL/19 Asthma\n\nL/20"
);

// R/I0 .. R/I9 → R/10 .. R/19 (capital I as digit 1)
text = text.replace(/\bR\/I(\d)\b/g, (_, d) => `R/1${d}`);
text = text.replace(/\bG\/I(\d)\b/g, (_, d) => `G/1${d}`);
text = text.replace(/\bL\/I(\d)\b/g, (_, d) => `L/1${d}`);
text = text.replace(/\bP\/I(\d)\b/g, (_, d) => `P/1${d}`);
text = text.replace(/\bC\/I(\d)\b/g, (_, d) => `C/1${d}`);

text = text.split("G/14 Asthma 16").join("G/14 Asthma 76");
text = text.replace(/ G\/17 1]/g, " G/17");

// G/7? or corrupted heart disorders line
text = text.replace(/G\/T\?\s*Heart/g, "G/7 Heart");
text = text.replace(/G\/7 Heart Disorders\s+8\b/g, "G/7 Heart Disorders 68");

// Fix "G/9 Heart Weakness 1" → 71 from column alignment
text = text.replace(/G\/9 Heart Weakness 1\b/g, "G/9 Heart Weakness 71");

// Join hyphenated word breaks in introduction (page 20 area)
text = text.replace(/know-\nledge/g, "knowledge");
text = text.replace(/This\nis never/g, "This is never");

// Normalize fancy quotes in one place
text = text.replace(/''/g, "'");

// --- Line filtering ---
const junkLine = (line) => {
  const t = line.trim();
  if (!t) return false;
  if (/^y$/.test(t)) return true;
  if (/^Boo/i.test(t)) return true;
  if (/^Se OO/.test(t)) return true;
  if (t === "wa") return true;
  if (/^=+—?$/.test(t) || t === "—" || t === "=" || t === ">") return true;
  if (/^TOOF/.test(t)) return true;
  if (t === "aN") return true;
  if (t === "is" && line.length < 4) return true;
  if (t === "vel" || t === "NH") return true;
  if (t === "539" || t === "TI") return true;
  if (/^ZEszczee$/.test(t)) return true;
  if (/^BSesiEevpagss$/.test(t)) return true;
  if (t === "Cito") return true;
  if (t === "Co)") return true;
  if (t === "¢") return true;
  if (t === "sci") return true;
  if (t === "LA" || t === "RS") return true;
  if (t === "il" || t === "Hg") return true;
  if (/^No\.?\s*$/i.test(t) && t.length < 5) return false;
  if (/^Page\s*$/i.test(t)) return false;
  return false;
};

const lines = text.split("\n");
const out = [];
for (const line of lines) {
  if (junkLine(line)) continue;
  out.push(line);
}
text = out.join("\n");

// Collapse excessive blank lines (max 2 consecutive)
text = text.replace(/\n{4,}/g, "\n\n\n");

writeFileSync(output, text, "utf8");
console.log("Wrote", output);
