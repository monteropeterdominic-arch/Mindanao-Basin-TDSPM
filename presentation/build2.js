// Redesigned IOCE 2027 deck + poster, built on the elements of art:
// LINE (the basin's real river network as motif), SHAPE (circles + rounded cards), FORM (3D terrain, soft shadows),
// COLOR (analogous river blues/teals with complementary amber-orange accent), VALUE (dark-light-dark sandwich),
// TEXTURE (hillshade terrain under the hero art), SPACE (asymmetric layouts, generous margins).
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/ca9d6b9a-f83e-4308-b9a7-381bc886a1ae_d1442288-a73e-4e4e-baee-c2f5f21bb454/pptx/scripts/apply_theme.js");
const FIG = "/root/claude-science-work/claude-042486f3/results/";
const D = "/home/claude/work/design/";
const THEME = { name: "River Light", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "1B2730", lt1: "FFFFFF", dk2: "0B2A3C", lt2: "EFF5F5", accent1: "1B998B", accent2: "E4572E", accent3: "F2C14E",
            accent4: "4FD1C5", accent5: "5E7380", accent6: "8AB17D", hlink: "1B998B", folHlink: "5E7380" } };
const HX = THEME.colors;
const shadow = () => ({ type: "outer", color: "0B2A3C", opacity: 0.16, blur: 10, offset: 3, angle: 90 });

async function deck() {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "Can open land-cover and population data predict river TDS?"; pres.author = "Peter Dominic C. Montero; Jay M. Navaluna";
  const C = pres.SchemeColor;
  pres.defineSlideMaster({ title: "HERO", background: { path: D + "hero_16x9.png" },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.5, w: 7.2, h: 2.9, fontSize: 40, bold: true, color: C.background1, valign: "bottom", align: "left" }, text: "" } },
              { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 4.6, w: 7.0, h: 2.3, fontSize: 16, color: "BFE3DE", valign: "top", align: "left" }, text: "" } }] });
  pres.defineSlideMaster({ title: "DARK", background: { path: D + "divider_16x9.png" },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.5, w: 8.5, h: 1.1, fontSize: 34, bold: true, color: C.background1, valign: "middle", align: "left" }, text: "" } }] });
  pres.defineSlideMaster({ title: "CONTENT", background: { color: "FFFFFF" },
    objects: [{ image: { x: 11.35, y: 1.6, w: 3.0, h: 5.83, path: D + "river_lines_faint.png" } },
              { placeholder: { options: { name: "kicker", type: "body", x: 0.7, y: 0.38, w: 8, h: 0.35, fontSize: 13, bold: true, color: C.accent1, align: "left", valign: "middle" }, text: "" } },
              { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.72, w: 11.9, h: 0.85, fontSize: 32, bold: true, color: C.text2, align: "left", valign: "middle" }, text: "" } },
              { text: { text: "Montero & Navaluna  ·  University of Southern Mindanao  ·  IOCE 2027", options: { x: 0.7, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: HX.accent5 } } }],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: HX.accent5, align: "right" } });

  const txt = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, fontSize: 16, color: C.text1, valign: "top", margin: 0 }, o));
  const card = (s, x, y, w, h, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: fill || "FFFFFF" }, line: { color: fill || "E3ECEC", width: 0.75 }, shadow: shadow() });
  const icon = (s, name, x, y, d, col) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: col || HX.accent1 }, line: { color: col || HX.accent1 } });
    s.addImage({ path: D + "icon_" + name + ".png", x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5, altText: "" }); };
  const num = (s, k, x, y, d, col) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: col || HX.accent1 }, line: { color: col || HX.accent1 } });
    txt(s, String(k), { x, y, w: d, h: d, fontSize: d * 30, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Cambria" }); };
  const fig = (s, f, x, y, w, ar, alt) => { card(s, x - 0.12, y - 0.12, w + 0.24, w / ar + 0.24); s.addImage({ path: FIG + f, x, y, w, h: w / ar, altText: alt }); };
  const S = (sec, kick, title) => { const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec }); s.addText(kick, { placeholder: "kicker" }); s.addText(title, { placeholder: "title" }); return s; };
  const big = (s, v, lab, x, y, w, col) => { txt(s, v, { x, y, w, h: 0.95, fontSize: 50, bold: true, color: col || C.accent2, fontFace: "Cambria" });
    txt(s, lab, { x, y: y + 0.95, w, h: 0.8, fontSize: 14, color: C.text1 }); };

  // Title
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "HERO", sectionTitle: "Opening" });
  s.addText("Can open land-cover and population data predict river total dissolved solids?", { placeholder: "title" });
  s.addText([{ text: "An independently validated routed model for the Mindanao River Basin, Philippines", options: { italic: true, breakLine: true } },
             { text: " ", options: { breakLine: true, fontSize: 8 } },
             { text: "Peter Dominic C. Montero  ·  Jay M. Navaluna", options: { bold: true, color: "FFFFFF", breakLine: true } },
             { text: "Department of Civil Engineering, University of Southern Mindanao", options: { breakLine: true } },
             { text: "IOCE 2027  ·  Session S2, Marine and Terrestrial Ecosystems" }], { placeholder: "body" });
  s.addNotes("The rivers on the right are the real river network of the Mindanao River Basin, coloured by the TDS our model simulates: teal is lower, amber and orange are higher.");

  // 1 question
  pres.addSection({ title: "Background" });
  s = S("Background", "The problem", "GIS maps of water quality are rarely tested");
  txt(s, [{ text: "Total dissolved solids (TDS) tell us how much salt a river carries. Rock, soil, farms and towns all add to it.", options: { breakLine: true } },
          { text: " ", options: { breakLine: true, fontSize: 8 } },
          { text: "In basins with little data, people often map 'TDS potential' by overlaying GIS layers with chosen weights. Those weights are judgement, not evidence.", options: { breakLine: true } },
          { text: " ", options: { breakLine: true, fontSize: 8 } },
          { text: "Our question: does open data predict measured TDS better than a simple average?", options: { bold: true, color: C.text2 } }],
      { x: 0.7, y: 1.95, w: 5.6, h: 4.6, fontSize: 18 });
  const facts = [["FaGlobeAsia", "20,583 km²", "Mindanao River Basin", HX.accent1], ["FaUsers", "5.16 million", "people (WorldPop 2020)", HX.accent2], ["FaMapMarkerAlt", "22 sites", "published TDS on 7 rivers", "0B2A3C"]];
  facts.forEach(([ic, v, l, col], i) => { const y = 1.95 + i * 1.6; card(s, 6.9, y, 4.6, 1.35); icon(s, ic, 7.15, y + 0.25, 0.85, col);
    txt(s, v, { x: 8.25, y: y + 0.2, w: 3.1, h: 0.6, fontSize: 28, bold: true, color: C.text2, fontFace: "Cambria" });
    txt(s, l, { x: 8.25, y: y + 0.8, w: 3.1, h: 0.4, fontSize: 14, color: HX.accent5 }); });

  // 2 study area
  pres.addSection({ title: "Methods" });
  s = S("Methods", "Study area and data", "Three open datasets and 22 published sites");
  fig(s, "fig2_study_area.png", 0.82, 1.9, 7.4, 1.457, "Maps of elevation with 22 TDS sites, land cover and population");
  const ds = [["FaMountain", "Terrain", "ALOS AW3D30 (OpenTopography), 90 m"], ["FaTree", "Land cover", "ESA WorldCover 2021: 65% tree, 15% cropland, 1% built-up"],
              ["FaUsers", "Population", "WorldPop 2020"], ["FaVial", "TDS measurements", "16 calibration sites + 6 kept aside for an independent test"]];
  ds.forEach(([ic, h, b], i) => { const y = 1.9 + i * 1.22; icon(s, ic, 8.75, y, 0.7, i === 3 ? HX.accent2 : HX.accent1);
    txt(s, h, { x: 9.6, y: y - 0.02, w: 3.2, h: 0.35, fontSize: 16, bold: true, color: C.text2 });
    txt(s, b, { x: 9.6, y: y + 0.33, w: 3.2, h: 0.8, fontSize: 13 }); });

  // 3 workflow + model
  s = S("Methods", "Approach", "A routed model: solutes and people, carried downstream");
  fig(s, "fig1_workflow.png", 0.82, 1.9, 7.3, 2.223, "Workflow diagram");
  card(s, 0.7, 5.35, 7.54, 1.35, HX.lt2);
  txt(s, [{ text: "TDS  =  ", options: { color: C.text2, bold: true } }, { text: "(land solutes + population load)", options: { color: C.accent2, bold: true } }, { text: "  ÷  water", options: { color: C.accent1, bold: true } }],
      { x: 0.95, y: 5.5, w: 7.1, h: 0.5, fontSize: 22, fontFace: "Cambria" });
  txt(s, "Every 90 m cell adds runoff, solutes and a load per person; all of it flows down 2.54 million cells, written in MATLAB.", { x: 0.95, y: 6.05, w: 7.1, h: 0.6, fontSize: 13 });
  txt(s, [{ text: "Five model versions", options: { bold: true, color: C.text2, breakLine: true } },
          { text: "Tree / non-tree", options: { bullet: true, breakLine: true } }, { text: "Tree / non-tree + people", options: { bullet: true, breakLine: true } },
          { text: "Tree / cropland / other + people", options: { bullet: true, breakLine: true } }, { text: "Five land classes + people", options: { bullet: true, breakLine: true } },
          { text: "Uniform land + people", options: { bullet: true, breakLine: true } },
          { text: " ", options: { breakLine: true, fontSize: 8 } },
          { text: "Uncertainty: 2000 bootstrap refits and 200 Monte Carlo runs", options: { italic: true, color: HX.accent5 } }],
      { x: 8.75, y: 1.9, w: 3.9, h: 4.8, fontSize: 15, paraSpaceAfter: 4 });

  // 4 tests
  s = S("Methods", "Validation design", "Three tests, each against a simple average");
  [["1", "Independent test", "Fit on 16 sites, then predict 6 sites the model never saw"], ["2", "Leave one site out", "Hold out each of the 22 sites in turn"],
   ["3", "Leave one river out", "Hold out each of the 7 rivers: sites on one river are not independent"]].forEach(([k, h, b], i) => {
     const x = 0.7 + i * 3.95; card(s, x, 2.0, 3.65, 3.1); num(s, k, x + 0.3, 2.3, 0.8, i === 2 ? HX.accent2 : HX.accent1);
     txt(s, h, { x: x + 0.3, y: 3.3, w: 3.1, h: 0.5, fontSize: 19, bold: true, color: C.text2 });
     txt(s, b, { x: x + 0.3, y: 3.85, w: 3.1, h: 1.1, fontSize: 14 }); });
  icon(s, "FaBalanceScale", 0.7, 5.55, 0.75, "0B2A3C");
  txt(s, [{ text: "The bar to clear: ", options: { bold: true, color: C.text2 } }, { text: "the null model predicts every site as the average of the training sites." }],
      { x: 1.65, y: 5.72, w: 9.5, h: 0.5, fontSize: 17 });

  // 5 result 1
  pres.addSection({ title: "Results" });
  s = S("Results", "Result 1", "No model beat the simple average");
  fig(s, "fig4_model_validation.png", 0.82, 1.9, 8.0, 2.394, "Model errors and observed vs predicted TDS");
  card(s, 9.3, 1.78, 3.3, 4.4, HX.lt2);
  big(s, "54.1", "mg/L error, best model, river held out", 9.6, 2.0, 2.8);
  big(s, "52.5", "mg/L error, simple average", 9.6, 3.95, 2.8, HX.accent1);
  txt(s, "Every version under-predicted the six unseen sites. The biggest miss: Mt Apo, 300 mg/L measured, about 110 predicted.", { x: 0.7, y: 5.6, w: 8.2, h: 0.8, fontSize: 15 });

  // 6 DARK key insight (value contrast mid-deck)
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Results" });
  s.addText("Why: the same river changes by tens of mg/L between surveys", { placeholder: "title" });
  txt(s, "44", { x: 0.7, y: 1.8, w: 3.6, h: 1.9, fontSize: 130, bold: true, color: HX.accent3, fontFace: "Cambria" });
  txt(s, "mg/L between repeat surveys of the same place, almost as large as any model's error", { x: 0.7, y: 3.75, w: 3.9, h: 1.2, fontSize: 17, color: "DCEFEA" });
  [["Kulaman R.", "194 → 144", "2009–10 → 2026"], ["Tinanan R.", "211 → 190", "2009–10 → 2026"], ["Below confluence", "206 → 161", "2009–10 → 2026"], ["Cotabato City", "114 → 166", "2022 → 2024"]].forEach(([n, v, yr], i) => {
    const x = 4.9 + (i % 2) * 2.5, y = 1.9 + Math.floor(i / 2) * 1.75;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.3, h: 1.5, rectRadius: 0.15, fill: { color: "0B2A3C", transparency: 15 }, line: { color: "4FD1C5", width: 1 } });
    txt(s, n, { x: x + 0.2, y: y + 0.15, w: 2.0, h: 0.35, fontSize: 14, bold: true, color: "FFFFFF" });
    txt(s, v, { x: x + 0.2, y: y + 0.5, w: 2.0, h: 0.5, fontSize: 22, bold: true, color: HX.accent4 });
    txt(s, yr, { x: x + 0.2, y: y + 1.05, w: 2.0, h: 0.3, fontSize: 12, color: "BFE3DE" }); });
  txt(s, "With single surveys from different years, seasons and instruments, no map can be proven better than the average. The data set the limit.",
      { x: 0.7, y: 5.6, w: 7.6, h: 0.9, fontSize: 16, italic: true, color: "DCEFEA" });

  // 7 geology
  s = S("Results", "Result 2", "Rock type does not explain TDS; Mt Apo may");
  const rows = [["Layer added", "Site held out", "River held out"], ["None (selected model)", "53.2", "54.1"], ["Elevation", "66.3", "74.2"], ["Slope", "58.7", "64.4"],
                ["Young volcanic rock", "60.0", "68.3"], ["Tertiary sedimentary rock", "56.0", "59.4"], ["Mt Apo proximity", "45.4", "103.6"]];
  card(s, 0.7, 1.9, 6.9, 4.1);
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || (i === 6 && j === 1), fontSize: 14, align: j ? "right" : "left",
      color: i === 0 ? HX.accent5 : (i === 6 && j === 1 ? HX.accent2 : HX.dk1), border: [{ type: "none" }, { type: "none" }, { type: "solid", pt: 0.5, color: "E3ECEC" }, { type: "none" }] } }))),
      { x: 0.95, y: 2.1, w: 6.4, colW: [3.4, 1.5, 1.5], rowH: 0.5 });
  txt(s, "Error in mg/L. Simple average: 50.2 (site) and 52.5 (river).", { x: 0.95, y: 5.6, w: 6.4, h: 0.3, fontSize: 12, italic: true, color: HX.accent5 });
  card(s, 8.0, 1.9, 4.6, 4.1, HX.lt2);
  icon(s, "FaMountain", 8.3, 2.15, 0.8, HX.accent2);
  txt(s, "Same rock, opposite TDS", { x: 9.25, y: 2.3, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: C.text2 });
  txt(s, [{ text: "The lowest (57 mg/L, Kalatungan) and highest (300 mg/L, Mt Apo) sites both drain young volcanic rock.", options: { breakLine: true } },
          { text: " ", options: { breakLine: true, fontSize: 8 } },
          { text: "Mt Apo has steam vents and a geothermal field. Distance to it beat the average when sites were held out, but only one sampled river drains it.", options: {} }],
      { x: 8.3, y: 3.2, w: 4.05, h: 2.7, fontSize: 14 });

  // 8 3D
  s = S("Results", "Result 3", "Higher simulated TDS where people live");
  fig(s, "fig8_3d_terrain_TDS.png", 0.82, 1.85, 7.0, 1.515, "3D terrain coloured by tree cover and population, rivers by simulated TDS");
  [["FaTree", "≈150 mg/L", "forested upland streams", HX.accent1], ["FaCity", "183–200 mg/L", "valley plains: Kabacan, M'lang, Midsayap, Tacurong", HX.accent2], ["FaUsers", "9%", "of TDS at the river mouth comes from population", "0B2A3C"]].forEach(([ic, v, l, col], i) => {
    const y = 1.9 + i * 1.5; icon(s, ic, 8.4, y, 0.8, col);
    txt(s, v, { x: 9.4, y: y - 0.05, w: 3.3, h: 0.5, fontSize: 24, bold: true, color: C.text2, fontFace: "Cambria" });
    txt(s, l, { x: 9.4, y: y + 0.48, w: 3.3, h: 0.8, fontSize: 13 }); });

  // 9 scenarios
  s = S("Results", "Result 4", "People matter more than forest cover");
  fig(s, "fig6_land_cover_scenarios.png", 0.82, 1.9, 8.2, 2.696, "Change in outlet TDS under five scenarios");
  card(s, 9.45, 1.78, 3.15, 3.3, HX.lt2);
  big(s, "+7.3", "mg/L if population grows 50% (95% range 0 to 29.6)", 9.7, 2.0, 2.7);
  txt(s, "Forest to cropland changed TDS by −1 to −24 mg/L depending on the model, because no version could identify a cropland source. That sign is not evidence that farms lower TDS.",
      { x: 0.7, y: 5.3, w: 8.4, h: 1.1, fontSize: 15 });

  // 10 next steps
  pres.addSection({ title: "Next" });
  s = S("Next", "What would settle it", "Repeated sampling at 30 sites");
  fig(s, "fig7_proposed_sampling.png", 0.95, 1.85, 2.75, 0.619, "Map of 30 proposed sampling sites");
  [["FaSearchLocation", "30 sites", "6 in each of 5 forest-cover classes, small catchments far from existing data"], ["FaRedo", "Same meter, two seasons", "one calibrated conductivity meter, wet and dry seasons"],
   ["FaMountain", "Volcano pairs", "Mt Apo vs Kitanglad or Kalatungan with similar land cover"]].forEach(([ic, h, b], i) => {
    const y = 1.9 + i * 1.25; icon(s, ic, 4.3, y, 0.75, i === 2 ? HX.accent2 : HX.accent1);
    txt(s, h, { x: 5.25, y: y - 0.02, w: 6.0, h: 0.4, fontSize: 17, bold: true, color: C.text2 });
    txt(s, b, { x: 5.25, y: y + 0.38, w: 6.0, h: 0.6, fontSize: 14 }); });
  card(s, 4.3, 5.75, 7.0, 0.95, "0B2A3C");
  icon(s, "FaLaptopCode", 4.5, 5.9, 0.65, HX.accent1);
  txt(s, [{ text: "Try the simulator  ", options: { bold: true, color: "FFFFFF" } }, { text: "monteropeterdominic-arch.github.io/Mindanao-Basin-TDSPM", options: { color: HX.accent4 } }],
      { x: 5.35, y: 6.05, w: 5.9, h: 0.4, fontSize: 15 });

  // 11 conclusions
  s = S("Next", "Conclusions", "What the data can and cannot tell us");
  [["FaQuestion", "Land-cover TDS maps are not yet supported", "No model beat the average on unseen rivers."], ["FaRedo", "Survey noise is as big as model error", "Repeat surveys differ by 44 mg/L."],
   ["FaMountain", "Rivers differ more than land cover explains", "Rock type alone does not help; Mt Apo hot-spring input is the best lead."], ["FaUsers", "People are the most consistent driver", "+7.3 mg/L for +50% population, not yet certain."]].forEach(([ic, h, b], i) => {
    const x = 0.7 + (i % 2) * 6.0, y = 1.95 + Math.floor(i / 2) * 2.3; card(s, x, y, 5.7, 2.0);
    icon(s, ic, x + 0.3, y + 0.3, 0.8, i === 3 ? HX.accent2 : HX.accent1);
    txt(s, h, { x: x + 1.35, y: y + 0.28, w: 4.1, h: 0.85, fontSize: 18, bold: true, color: C.text2 });
    txt(s, b, { x: x + 1.35, y: y + 1.15, w: 4.1, h: 0.7, fontSize: 14 }); });

  // Closing
  pres.addSection({ title: "Closing" });
  s = pres.addSlide({ masterName: "HERO", sectionTitle: "Closing" });
  s.addText("Thank you", { placeholder: "title" });
  s.addText([{ text: "Acknowledgements: DOST Science Education Institute; authors of the published surveys; OpenTopography, ESA, WorldPop, USGS and OpenStreetMap.", options: { breakLine: true } },
             { text: " ", options: { breakLine: true, fontSize: 8 } },
             { text: "s.pdcmontero@usm.edu.ph  ·  jmnavaluna@usm.edu.ph", options: { bold: true, color: "FFFFFF", breakLine: true } },
             { text: "Code, data, paper and web map: github.com/monteropeterdominic-arch/Mindanao-Basin-TDSPM" }], { placeholder: "body" });
  const out = "/home/claude/work/slides/Montero_Navaluna_IOCE2027_slides.pptx";
  await pres.writeFile({ fileName: out }); await applyTheme(out, THEME); console.log("deck ok");
}

async function poster() {
  const pres = new pptxgen(); pres.defineLayout({ name: "A0", width: 33.1, height: 46.8 }); pres.layout = "A0";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor; const s = pres.addSlide(); s.background = { color: "F2F7F7" };
  const txt = (t, o) => s.addText(t, Object.assign({ isTextBox: true, fontSize: 30, color: C.text1, valign: "top", margin: 0 }, o));
  const card = (x, y, w, h, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.35, fill: { color: fill || "FFFFFF" }, line: { color: fill || "FFFFFF" }, shadow: shadow() });
  const icon = (name, x, y, d, col) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: col || HX.accent1 }, line: { color: col || HX.accent1 } });
    s.addImage({ path: D + "icon_" + name + ".png", x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5, altText: "" }); };
  const head = (k, t, x, y, w, col) => { s.addShape(pres.shapes.OVAL, { x, y, w: 1.15, h: 1.15, fill: { color: col || HX.accent1 }, line: { color: col || HX.accent1 } });
    txt(String(k), { x, y, w: 1.15, h: 1.15, fontSize: 40, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Cambria" });
    txt(t, { x: x + 1.45, y: y + 0.08, w: w - 1.45, h: 1.0, fontSize: 44, bold: true, color: C.text2, fontFace: "Cambria", valign: "middle" }); };
  const img = (f, x, y, w, ar, alt) => s.addImage({ path: FIG + f, x, y, w, h: w / ar, altText: alt });
  // header: river-line hero art (line + texture + colour)
  s.addImage({ path: D + "poster_header.png", x: 0, y: 0, w: 33.1, h: 9.0, altText: "River network of the Mindanao River Basin coloured by simulated TDS" });
  txt("Can open land-cover and population data predict river total dissolved solids?", { x: 1.4, y: 0.6, w: 23.0, h: 4.4, fontSize: 78, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "middle" });
  txt("An independently validated routed model for the Mindanao River Basin, Philippines", { x: 1.4, y: 5.2, w: 21.5, h: 0.9, fontSize: 40, italic: true, color: "BFE3DE" });
  txt([{ text: "Peter Dominic C. Montero  ·  Jay M. Navaluna*", options: { bold: true, color: "FFFFFF", breakLine: true } },
       { text: "Department of Civil Engineering, University of Southern Mindanao, Kabacan, Cotabato, Philippines  ·  *jmnavaluna@usm.edu.ph", options: { color: "BFE3DE" } }],
      { x: 1.4, y: 6.4, w: 21.5, h: 1.6, fontSize: 30 });
  txt("Rivers coloured by simulated TDS: teal lower, orange higher", { x: 24.5, y: 8.25, w: 8.2, h: 0.5, fontSize: 20, italic: true, color: "BFE3DE", align: "right" });
  // key-numbers band (shape + colour + value)
  const ky = 9.8; card(1.2, ky, 30.7, 4.2);
  [["FaBalanceScale", "54.1 vs 52.5", "mg/L error: best model vs simple average (river held out)", HX.accent2],
   ["FaRedo", "44 mg/L", "difference between repeat surveys of the same river", HX.accent1],
   ["FaUsers", "+7.3 mg/L", "at the river mouth if population grows 50%", "0B2A3C"]].forEach(([ic, v, l, col], i) => {
    const x = 2.0 + i * 10.1; icon(ic, x, ky + 0.85, 2.4, col);
    txt(v, { x: x + 2.85, y: ky + 0.6, w: 6.8, h: 1.5, fontSize: 70, bold: true, color: col, fontFace: "Cambria", valign: "middle" });
    txt(l, { x: x + 2.85, y: ky + 2.15, w: 6.6, h: 1.6, fontSize: 28 }); });
  const cx = [1.2, 11.95, 22.7], cw = 9.2; let y;
  // column 1
  y = 15.0; card(cx[0], y, cw + 0.0, 8.2); head(1, "The question", cx[0] + 0.5, y + 0.5, cw - 1.0);
  txt([{ text: "GIS 'potential' maps of water quality are common where data are scarce, but their weights are judgement and they are rarely checked against measurements.", options: { breakLine: true } },
       { text: " ", options: { breakLine: true, fontSize: 14 } },
       { text: "Does open data predict measured TDS better than a simple average?", options: { bold: true, color: C.accent2 } }], { x: cx[0] + 0.5, y: y + 2.0, w: cw - 1.0, h: 6.0 });
  y = 24.0; card(cx[0], y, cw, 10.6); head(2, "Study area and data", cx[0] + 0.5, y + 0.5, cw - 1.0);
  img("fig2_study_area.png", cx[0] + 0.5, y + 2.0, cw - 1.0, 1.457, "Study area maps");
  txt("Basin 20,583 km², 5.16 million people. 22 published TDS sites on 7 rivers: 16 for calibration, 6 kept aside.", { x: cx[0] + 0.5, y: y + 7.9, w: cw - 1.0, h: 2.5, fontSize: 27 });
  y = 35.4; card(cx[0], y, cw, 9.9); head(3, "Routed model and tests", cx[0] + 0.5, y + 0.5, cw - 1.0);
  img("fig1_workflow.png", cx[0] + 0.5, y + 2.0, cw - 1.0, 2.223, "Workflow");
  txt([{ text: "TDS = (land solutes + population load) ÷ water, carried down 2.54 million 90 m cells in MATLAB.", options: { breakLine: true } },
       { text: "Five versions tested by independent sites, leave-one-site-out and leave-one-river-out, always against the average.", options: {} }],
      { x: cx[0] + 0.5, y: y + 6.0, w: cw - 1.0, h: 3.7, fontSize: 26, paraSpaceAfter: 10 });
  // column 2
  y = 15.0; card(cx[1], y, cw, 10.2); head(4, "Models vs the average", cx[1] + 0.5, y + 0.5, cw - 1.0, HX.accent2);
  img("fig4_model_validation.png", cx[1] + 0.5, y + 2.0, cw - 1.0, 2.394, "Model errors");
  txt("Every version under-predicted the six unseen sites; the biggest miss was Mt Apo (300 mg/L measured, about 110 predicted).", { x: cx[1] + 0.5, y: y + 5.8, w: cw - 1.0, h: 4.0, fontSize: 27 });
  y = 26.0; card(cx[1], y, cw, 8.6, "0B2A3C");
  s.addShape(pres.shapes.OVAL, { x: cx[1] + 0.5, y: y + 0.5, w: 1.15, h: 1.15, fill: { color: HX.accent3 }, line: { color: HX.accent3 } });
  txt("5", { x: cx[1] + 0.5, y: y + 0.5, w: 1.15, h: 1.15, fontSize: 40, bold: true, color: "0B2A3C", align: "center", valign: "middle", fontFace: "Cambria" });
  txt("Survey noise is the limit", { x: cx[1] + 1.95, y: y + 0.58, w: cw - 2.2, h: 1.0, fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "middle" });
  txt([{ text: "Same places, years apart:", options: { breakLine: true, color: "BFE3DE" } },
       { text: "Kulaman 194 → 144  ·  Tinanan 211 → 190", options: { breakLine: true, color: HX.accent4, bold: true } },
       { text: "Below confluence 206 → 161  ·  Cotabato City 114 → 166", options: { breakLine: true, color: HX.accent4, bold: true } },
       { text: " ", options: { breakLine: true, fontSize: 14 } },
       { text: "Repeat surveys differ by 44 mg/L, about as much as any model's error. The data, not only the model, set the limit.", options: { color: "FFFFFF" } }],
      { x: cx[1] + 0.5, y: y + 2.1, w: cw - 1.0, h: 6.3, fontSize: 27 });
  y = 35.4; card(cx[1], y, cw, 9.9); head(6, "Rock type and Mt Apo", cx[1] + 0.5, y + 0.5, cw - 1.0);
  txt([{ text: "Elevation, slope and five USGS rock groups all made predictions worse. The lowest (57 mg/L) and highest (300 mg/L) sites both drain young volcanic rock.", options: { breakLine: true } },
       { text: " ", options: { breakLine: true, fontSize: 14 } },
       { text: "Distance to Mt Apo, with its steam vents and geothermal field, beat the average when sites were held out (45.4 vs 50.2 mg/L), but only one sampled river drains it.", options: { bold: true, color: C.text2 } }],
      { x: cx[1] + 0.5, y: y + 2.0, w: cw - 1.0, h: 7.6, fontSize: 27 });
  // column 3
  y = 15.0; card(cx[2], y, cw, 11.6); head(7, "Simulated TDS in 3D", cx[2] + 0.5, y + 0.5, cw - 1.0);
  img("fig8_3d_terrain_TDS.png", cx[2] + 0.5, y + 2.0, cw - 1.0, 1.515, "3D terrain with simulated TDS");
  txt("Lowest in forested uplands (≈150 mg/L); highest on populated valley plains (183–200 mg/L). Population supplies about 9% of TDS at the river mouth.", { x: cx[2] + 0.5, y: y + 7.75, w: cw - 1.0, h: 3.6, fontSize: 26 });
  y = 27.4; card(cx[2], y, cw, 7.2); head(8, "Next: 30-site sampling", cx[2] + 0.5, y + 0.5, cw - 1.0);
  img("fig7_proposed_sampling.png", cx[2] + 0.5, y + 1.9, 3.0, 0.619, "Proposed sampling sites");
  txt([{ text: "6 sites in each of 5 forest-cover classes", options: { bullet: true, breakLine: true } },
       { text: "One meter, wet and dry seasons", options: { bullet: true, breakLine: true } },
       { text: "Mt Apo vs Kitanglad / Kalatungan pairs", options: { bullet: true } }], { x: cx[2] + 3.85, y: y + 2.1, w: cw - 4.3, h: 4.8, fontSize: 25, paraSpaceAfter: 12 });
  y = 35.4; card(cx[2], y, cw, 9.9, HX.lt2); head(9, "Conclusions", cx[2] + 0.5, y + 0.5, cw - 1.0, HX.accent2);
  txt([{ text: "Published data cannot yet support land-cover-based TDS maps here.", options: { bullet: true, breakLine: true } },
       { text: "Survey noise (44 mg/L) is as large as model error.", options: { bullet: true, breakLine: true } },
       { text: "Rivers differ more than land cover explains; Mt Apo hot-spring input is the best lead.", options: { bullet: true, breakLine: true } },
       { text: "Population is the most consistent driver.", options: { bullet: true } }], { x: cx[2] + 0.5, y: y + 2.0, w: cw - 1.0, h: 7.6, fontSize: 27, paraSpaceAfter: 14 });
  // footer
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 45.9, w: 33.1, h: 0.9, fill: { color: "0B2A3C" }, line: { color: "0B2A3C" } });
  txt([{ text: "Code, data, paper and interactive web map:  ", options: { color: "FFFFFF", bold: true } }, { text: "github.com/monteropeterdominic-arch/Mindanao-Basin-TDSPM", options: { color: HX.accent4 } },
       { text: "   ·   Data: JAXA AW3D30, ESA WorldCover, WorldPop, USGS OFR 97-470-F and eight published surveys   ·   Acknowledgement: DOST-SEI", options: { color: "BFE3DE" } }],
      { x: 1.2, y: 46.08, w: 30.7, h: 0.6, fontSize: 20, valign: "middle" });
  const out = "/home/claude/work/slides/Montero_Navaluna_IOCE2027_poster.pptx";
  await pres.writeFile({ fileName: out }); await applyTheme(out, THEME); console.log("poster ok");
}
deck().then(poster).catch(e => { console.error(e); process.exit(1); });
