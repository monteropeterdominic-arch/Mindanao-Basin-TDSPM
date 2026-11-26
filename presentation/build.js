const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/ca9d6b9a-f83e-4308-b9a7-381bc886a1ae_d1442288-a73e-4e4e-baee-c2f5f21bb454/pptx/scripts/apply_theme.js");
const FIG = "/root/claude-science-work/claude-042486f3/results/";

const THEME = {
  name: "Mindanao River", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "16262B", lt1: "FFFFFF", dk2: "0E3B43", lt2: "EEF4F3",
    accent1: "0E3B43", accent2: "2A9D8F", accent3: "D9622B", accent4: "E9C46A", accent5: "5B6B70", accent6: "8AB17D",
    hlink: "2A9D8F", folHlink: "5B6B70" } };

const AUTH = "Peter Dominic C. Montero & Jay M. Navaluna  |  University of Southern Mindanao  |  IOCE 2027";

// ---------------------------------------------------------------- DECK
async function deck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";            // 13.33 x 7.5 in
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "Can open land-cover and population data predict river TDS?";
  pres.author = "Peter Dominic C. Montero; Jay M. Navaluna";
  const C = pres.SchemeColor;

  pres.defineSlideMaster({ title: "TITLE_DARK", background: { color: THEME.colors.dk2 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.7, w: 11.9, h: 2.2, fontSize: 40, bold: true, color: C.background1, valign: "bottom" }, text: "" } },
              { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 4.1, w: 11.9, h: 2.4, fontSize: 18, color: "CFE3E0", valign: "top" }, text: "" } }] });
  pres.defineSlideMaster({ title: "CONTENT", background: { color: "FFFFFF" },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.text2, valign: "middle" }, text: "" } },
              { text: { text: AUTH, options: { x: 0.6, y: 7.0, w: 10.5, h: 0.3, fontSize: 10, color: "5B6B70" } } }],
    slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: "5B6B70", align: "right" } });

  let n = 0;
  const S = (sec) => { const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec }); return s; };
  const T = (s, t) => s.addText(t, { placeholder: "title" });
  const txt = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, fontSize: 16, color: C.text1, valign: "top", margin: 0 }, o));
  const card = (s, x, y, w, h, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background2 }, line: { color: fill || C.background2 } });
  const stat = (s, x, y, w, big, small, col) => { txt(s, big, { x, y, w, h: 1.0, fontSize: 54, bold: true, color: col || C.accent3, fontFace: "Cambria" });
    txt(s, small, { x, y: y + 1.05, w, h: 0.9, fontSize: 15, color: C.text1 }); };
  const img = (s, f, x, y, w, ar, alt) => s.addImage({ path: FIG + f, x, y, w, h: w / ar, altText: alt });

  // 0 title
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Opening" });
  s.addText("Can open land-cover and population data predict river total dissolved solids?", { placeholder: "title" });
  s.addText([{ text: "An independently validated routed model for the Mindanao River Basin, Philippines", options: { italic: true, breakLine: true } },
             { text: " ", options: { breakLine: true } },
             { text: "Peter Dominic C. Montero (presenter)  ·  Jay M. Navaluna (corresponding)", options: { breakLine: true, color: "FFFFFF" } },
             { text: "Department of Civil Engineering, University of Southern Mindanao  ·  IOCE 2027, Session S2" }], { placeholder: "body" });
  s.addNotes("Introduce yourself and the question: can free global maps of land cover and population tell us how salty (TDS) the rivers of the Mindanao River Basin are?");

  // 1 why
  pres.addSection({ title: "Background" });
  s = S("Background"); T(s, "GIS screening maps of water quality are rarely tested");
  txt(s, [{ text: "Total dissolved solids (TDS) summarise the salts a river carries: weathering, soils, farms and towns all add to them.", options: { bullet: true, breakLine: true } },
          { text: "In data-scarce basins, TDS 'potential' maps are often built by weighted overlay of GIS layers. The weights are judgement, not evidence.", options: { bullet: true, breakLine: true } },
          { text: "Our first version of this study was rejected for exactly that: no validation and no weighting basis.", options: { bullet: true, breakLine: true } },
          { text: "So we asked a testable question: does open data predict measured TDS better than a simple average?", options: { bullet: true, bold: true } }],
      { x: 0.6, y: 1.5, w: 6.6, h: 4.8, fontSize: 18, paraSpaceAfter: 10 });
  card(s, 7.7, 1.5, 5.0, 4.9);
  stat(s, 8.0, 1.75, 4.5, "20,583 km²", "Mindanao River Basin, delineated from the ALOS AW3D30 DEM");
  stat(s, 8.0, 3.95, 4.5, "5.16 million", "people living in the basin (WorldPop 2020)", C.accent2);
  s.addNotes("Why it matters. The basin is the largest in Mindanao, but water-quality data are scattered.");

  // 2 study area
  pres.addSection({ title: "Data and methods" });
  s = S("Data and methods"); T(s, "Study area: 22 published TDS sites on 7 river systems");
  img(s, "fig2_study_area.png", 0.6, 1.35, 8.1, 1.457, "Map of basin elevation, land cover and population with 22 TDS sites");
  txt(s, [{ text: "Open data", options: { bold: true, breakLine: true, color: C.text2 } },
          { text: "ALOS AW3D30 terrain (OpenTopography)", options: { bullet: true, breakLine: true } },
          { text: "ESA WorldCover 2021: 65% tree cover, 15% cropland, 1% built-up", options: { bullet: true, breakLine: true } },
          { text: "WorldPop 2020 population", options: { bullet: true, breakLine: true } },
          { text: "Observations", options: { bold: true, breakLine: true, color: C.text2 } },
          { text: "16 calibration sites (4 surveys, 2017–2024)", options: { bullet: true, breakLine: true } },
          { text: "6 independent test sites, kept aside (Arakan, Mt Apo, Cotabato City)", options: { bullet: true } }],
      { x: 9.0, y: 1.5, w: 3.8, h: 5.2, fontSize: 15, paraSpaceAfter: 6 });

  // 3 workflow
  s = S("Data and methods"); T(s, "From open data to a tested model");
  img(s, "fig1_workflow.png", 0.9, 1.4, 11.5, 2.223, "Workflow from open datasets to flow network, routed model and tests");
  s.addNotes("Walk left to right: data, 90 m flow network, routed model in MATLAB, tests and outputs.");

  // 4 model
  s = S("Data and methods"); T(s, "A routed mass-balance model, written in MATLAB");
  card(s, 0.6, 1.5, 6.2, 2.4);
  txt(s, [{ text: "TDS at a river point = ", options: {} }, { text: "(land solutes + population load) ÷ water", options: { bold: true } }],
      { x: 0.9, y: 1.75, w: 5.7, h: 0.6, fontSize: 18 });
  txt(s, "Every 90 m cell makes runoff and solutes according to its land cover, plus a load per person. Both are carried downstream along the D8 flow network (2.54 million cells, a few seconds per run).",
      { x: 0.9, y: 2.45, w: 5.7, h: 1.4, fontSize: 15 });
  txt(s, [{ text: "Five model structures compared", options: { bold: true, breakLine: true, color: C.text2 } },
          { text: "Tree / non-tree", options: { bullet: true, breakLine: true } },
          { text: "Tree / non-tree + population", options: { bullet: true, breakLine: true } },
          { text: "Tree / cropland / other + population", options: { bullet: true, breakLine: true } },
          { text: "All five land-cover classes + population", options: { bullet: true, breakLine: true } },
          { text: "Uniform land background + population", options: { bullet: true } }],
      { x: 7.3, y: 1.5, w: 5.5, h: 3.2, fontSize: 16, paraSpaceAfter: 4 });
  txt(s, "Fitted by non-negative least squares. Uncertainty: 2000 bootstrap refits; 200 Monte Carlo runs with runoff coefficients varied ±50%.",
      { x: 0.6, y: 4.4, w: 12.1, h: 0.8, fontSize: 15, italic: true, color: "5B6B70" });
  txt(s, "Code and data: github.com/monteropeterdominic-arch/Mindanao-Basin-TDSPM", { x: 0.6, y: 5.4, w: 12.1, h: 0.4, fontSize: 14, color: C.accent2 });

  // 5 validation design
  s = S("Data and methods"); T(s, "Three tests, always against a simple average");
  const tests = [["1", "Independent test", "Fit on 16 calibration sites, predict 6 sites the model never saw"],
                 ["2", "Leave one site out", "Hold out each of the 22 sites in turn"],
                 ["3", "Leave one river out", "Hold out each of the 7 river systems, because sites on one river are not independent"]];
  tests.forEach(([k, h, b], i) => { const x = 0.6 + i * 4.15; card(s, x, 1.6, 3.85, 3.3);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.85, w: 0.75, h: 0.75, fill: { color: C.accent2 }, line: { color: C.accent2 } });
    txt(s, k, { x: x + 0.3, y: 1.85, w: 0.75, h: 0.75, fontSize: 24, bold: true, color: C.background1, align: "center", valign: "middle" });
    txt(s, h, { x: x + 0.3, y: 2.8, w: 3.3, h: 0.5, fontSize: 20, bold: true, color: C.text2 });
    txt(s, b, { x: x + 0.3, y: 3.35, w: 3.3, h: 1.4, fontSize: 15 }); });
  txt(s, [{ text: "The null model ", options: { bold: true } }, { text: "predicts every site as the average of the training sites. A useful model must beat it." }],
      { x: 0.6, y: 5.3, w: 12.1, h: 0.6, fontSize: 18 });

  // 6 result 1
  pres.addSection({ title: "Results" });
  s = S("Results"); T(s, "No model beat the simple average");
  img(s, "fig4_model_validation.png", 0.6, 1.3, 8.6, 2.394, "Bar chart of model errors and scatter of observed vs predicted TDS");
  card(s, 9.5, 1.4, 3.25, 4.6);
  stat(s, 9.75, 1.6, 2.9, "54.1", "mg/L error, best model, river held out");
  stat(s, 9.75, 3.7, 2.9, "52.5", "mg/L error, simple average", C.accent2);
  txt(s, "Every structure under-predicted the independent sites; the largest miss was Mt Apo (300 mg/L observed, about 110 predicted).",
      { x: 0.6, y: 5.0, w: 8.6, h: 0.9, fontSize: 15 });

  // 7 noise floor
  s = S("Results"); T(s, "Why: the same river differs by 44 mg/L between surveys");
  const pairs = [["Kulaman R.", "194 → 144", "2009–10 vs 2026"], ["Tinanan R.", "211 → 190", "2009–10 vs 2026"], ["Below confluence", "206 → 161", "2009–10 vs 2026"], ["Cotabato City", "114 → 166", "2022 vs 2024"]];
  pairs.forEach(([nm, v, yr], i) => { const x = 0.6 + i * 3.1; card(s, x, 1.6, 2.85, 2.2);
    txt(s, nm, { x: x + 0.25, y: 1.8, w: 2.4, h: 0.45, fontSize: 17, bold: true, color: C.text2 });
    txt(s, v, { x: x + 0.25, y: 2.3, w: 2.4, h: 0.7, fontSize: 30, bold: true, color: C.accent3, fontFace: "Calibri" });
    txt(s, yr + " (mg/L)", { x: x + 0.25, y: 3.1, w: 2.4, h: 0.5, fontSize: 13, color: "5B6B70" }); });
  stat(s, 0.6, 4.2, 4.0, "44 mg/L", "root-mean-square difference between repeat surveys");
  txt(s, "That is almost as large as any model's error. With single surveys from different years, seasons and instruments, no spatial model can be judged better than the average. The data, not only the model, set the limit.",
      { x: 5.0, y: 4.35, w: 7.7, h: 1.8, fontSize: 17 });

  // 8 geology
  s = S("Results"); T(s, "Rock type does not explain TDS; Mt Apo may");
  const rows = [["Layer added to the model", "Error, site held out", "Error, river held out"],
                ["None (selected model)", "53.2", "54.1"], ["Mean elevation", "66.3", "74.2"], ["Mean slope", "58.7", "64.4"],
                ["Young volcanic rock (USGS)", "60.0", "68.3"], ["Tertiary sedimentary rock", "56.0", "59.4"], ["Mt Apo proximity", "45.4", "103.6"]];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || (i === 6 && j === 1), color: i === 0 ? "FFFFFF" : (i === 6 && j === 1 ? THEME.colors.accent3 : THEME.colors.dk1),
      fill: { color: i === 0 ? THEME.colors.dk2 : (i % 2 ? "FFFFFF" : THEME.colors.lt2) }, align: j ? "right" : "left", fontSize: 15 } }))),
      { x: 0.6, y: 1.5, w: 7.2, colW: [3.6, 1.8, 1.8], rowH: 0.48, border: { type: "none" } });
  txt(s, "Simple average: 50.2 and 52.5 mg/L", { x: 0.6, y: 5.0, w: 7.2, h: 0.4, fontSize: 13, color: "5B6B70", italic: true });
  card(s, 8.3, 1.5, 4.4, 4.5);
  txt(s, [{ text: "Lowest and highest TDS both drain young volcanic rock", options: { bold: true, breakLine: true, color: C.text2 } },
          { text: "57 mg/L on the Kalatungan highlands, 300 mg/L on Mt Apo.", options: { breakLine: true } },
          { text: " ", options: { breakLine: true } },
          { text: "Mt Apo has solfataras and a geothermal field. Distance to Mt Apo beat the average when sites were held out, but only one sampled river drains it, so it cannot yet be confirmed.", options: {} }],
      { x: 8.6, y: 1.75, w: 3.9, h: 4.1, fontSize: 15 });

  // 9 maps and 3D
  s = S("Results"); T(s, "Where the model puts higher TDS: populated valley floors");
  img(s, "fig8_3d_terrain_TDS.png", 0.6, 1.3, 7.6, 1.515, "3D terrain views coloured by tree cover and population with channels coloured by simulated TDS");
  txt(s, [{ text: "Simulated TDS on channels: median 158 mg/L.", options: { bullet: true, breakLine: true } },
          { text: "Lowest (about 150) in forested upland tributaries.", options: { bullet: true, breakLine: true } },
          { text: "Highest (183–200) on the Cotabato and Allah valley plains: Kabacan, M'lang, Midsayap, Tacurong.", options: { bullet: true, breakLine: true } },
          { text: "Population supplies about 9% of TDS at the river mouth (162.7 mg/L).", options: { bullet: true } }],
      { x: 8.6, y: 1.5, w: 4.2, h: 4.8, fontSize: 16, paraSpaceAfter: 8 });

  // 10 scenarios
  s = S("Results"); T(s, "Scenarios: people matter more than forest cover");
  img(s, "fig6_land_cover_scenarios.png", 0.6, 1.3, 8.9, 2.696, "Bar chart of change in outlet TDS under five scenarios for each model structure");
  card(s, 9.8, 1.4, 2.95, 4.4);
  stat(s, 10.0, 1.6, 2.6, "+7.3", "mg/L if population grows 50% (95% range 0 to 29.6)");
  txt(s, "Forest to cropland: −1 to −24 mg/L depending on the model, because no structure could identify a cropland source. The sign is not evidence that farms lower TDS.",
      { x: 0.6, y: 4.8, w: 8.9, h: 1.2, fontSize: 15 });

  // 11 sampling + web map
  pres.addSection({ title: "Next steps" });
  s = S("Next steps"); T(s, "What would settle it: repeated sampling at 30 sites");
  img(s, "fig7_proposed_sampling.png", 0.6, 1.25, 3.3, 0.619, "Map of 30 proposed sampling sites in five tree-cover strata");
  txt(s, [{ text: "30 sites, 6 in each of 5 forest-cover classes, on small catchments (10–300 km²) far from existing data", options: { bullet: true, breakLine: true } },
          { text: "One calibrated conductivity meter, wet and dry seasons", options: { bullet: true, breakLine: true } },
          { text: "Pairs on Mt Apo and on Kitanglad / Kalatungan with similar land cover, to test the hot-spring idea", options: { bullet: true, breakLine: true } },
          { text: "Record rock type for every catchment", options: { bullet: true } }],
      { x: 4.4, y: 1.5, w: 8.3, h: 2.9, fontSize: 17, paraSpaceAfter: 8 });
  card(s, 4.4, 4.6, 8.3, 1.7);
  txt(s, [{ text: "Try the simulator", options: { bold: true, breakLine: true, color: C.text2 } },
          { text: "monteropeterdominic-arch.github.io/Mindanao-Basin-TDSPM", options: { color: C.accent2, breakLine: true } },
          { text: "Move sliders for forest, farms, built-up area and population; every river reach updates.", options: {} }],
      { x: 4.7, y: 4.8, w: 7.8, h: 1.4, fontSize: 16 });

  // 12 conclusions
  s = S("Next steps"); T(s, "Conclusions");
  const concl = [["Published data cannot yet support land-cover-based TDS maps", "No model beat the average on held-out rivers."],
                 ["Survey noise is as large as model error", "Repeat surveys of the same spot differ by 44 mg/L."],
                 ["Rivers differ more than land cover can explain", "Rock type alone does not help; Mt Apo hot-spring input is the best lead."],
                 ["People are the most consistent driver", "+7.3 mg/L for +50% population, but not yet certain."]];
  concl.forEach(([h, b], i) => { const x = 0.6 + (i % 2) * 6.15, y = 1.5 + Math.floor(i / 2) * 2.45; card(s, x, y, 5.9, 2.2);
    txt(s, h, { x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.9, fontSize: 19, bold: true, color: C.text2 });
    txt(s, b, { x: x + 0.3, y: y + 1.2, w: 5.3, h: 0.8, fontSize: 15 }); });

  // closing
  pres.addSection({ title: "Closing" });
  s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Closing" });
  s.addText("Thank you", { placeholder: "title" });
  s.addText([{ text: "Acknowledgements: DOST Science Education Institute; authors of the published surveys; OpenTopography, ESA, WorldPop, USGS and OpenStreetMap for open data.", options: { breakLine: true } },
             { text: " ", options: { breakLine: true } },
             { text: "Contact: s.pdcmontero@usm.edu.ph  ·  jmnavaluna@usm.edu.ph", options: { breakLine: true, color: "FFFFFF" } },
             { text: "Code, data, paper and web map: github.com/monteropeterdominic-arch/Mindanao-Basin-TDSPM" }], { placeholder: "body" });

  const out = "/home/claude/work/slides/Montero_Navaluna_IOCE2027_slides.pptx";
  await pres.writeFile({ fileName: out }); await applyTheme(out, THEME); console.log("deck ok");
}

// ---------------------------------------------------------------- POSTER (A0-ish portrait, 33.1 x 46.8 in)
async function poster() {
  const pres = new pptxgen();
  pres.defineLayout({ name: "A0", width: 33.1, height: 46.8 }); pres.layout = "A0";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const s = pres.addSlide();
  const txt = (t, o) => s.addText(t, Object.assign({ isTextBox: true, fontSize: 30, color: C.text1, valign: "top", margin: 0 }, o));
  const head = (t, x, y, w) => txt(t, { x, y, w, h: 1.2, fontSize: 52, bold: true, color: C.text2, fontFace: "Cambria" });
  const box = (x, y, w, h) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.4, fill: { color: THEME.colors.lt2 }, line: { color: THEME.colors.lt2 } });
  const img = (f, x, y, w, ar, alt) => s.addImage({ path: FIG + f, x, y, w, h: w / ar, altText: alt });
  // header band (dark background block, full width)
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 33.1, h: 6.2, fill: { color: THEME.colors.dk2 }, line: { color: THEME.colors.dk2 } });
  txt("Can open land-cover and population data predict river total dissolved solids?", { x: 1.2, y: 0.4, w: 30.7, h: 3.1, fontSize: 84, bold: true, color: C.background1, fontFace: "Cambria", valign: "middle" });
  txt("An independently validated routed model for the Mindanao River Basin, Philippines", { x: 1.2, y: 3.6, w: 30.7, h: 0.9, fontSize: 44, italic: true, color: "CFE3E0" });
  txt([{ text: "Peter Dominic C. Montero  ·  Jay M. Navaluna*", options: { bold: true, breakLine: true } }, { text: "Department of Civil Engineering, University of Southern Mindanao, Kabacan, Cotabato, Philippines   ·   *jmnavaluna@usm.edu.ph   ·   IOCE 2027, Session S2" }],
      { x: 1.2, y: 4.6, w: 30.7, h: 1.4, fontSize: 28, color: "FFFFFF" });
  const cx = [1.2, 12.0, 22.8], cw = 9.6; let y;
  // column 1
  y = 7.0; head("1  The question", cx[0], y, cw);
  txt([{ text: "GIS 'potential' maps of river water quality are common in data-scarce basins, but their weights are judgement and they are rarely checked against measurements.", options: { breakLine: true } },
       { text: " ", options: { breakLine: true } },
       { text: "We asked: does open data predict measured TDS better than a simple average?", options: { bold: true } }], { x: cx[0], y: y + 1.4, w: cw, h: 5.0 });
  y = 13.2; head("2  Study area and data", cx[0], y, cw);
  img("fig2_study_area.png", cx[0], y + 1.4, cw, 1.457, "Study area maps");
  txt("Basin 20,583 km², 5.16 million people. 22 published TDS sites on 7 rivers: 16 for calibration, 6 kept aside as an independent test.", { x: cx[0], y: y + 8.2, w: cw, h: 2.6, fontSize: 28 });
  y = 24.6; head("3  Routed model (MATLAB)", cx[0], y, cw);
  img("fig1_workflow.png", cx[0], y + 1.4, cw, 2.223, "Workflow");
  txt([{ text: "TDS = (land solutes + population load) ÷ water, carried down a 90 m D8 network of 2.54 million cells.", options: { breakLine: true } },
       { text: " ", options: { breakLine: true } },
       { text: "Five structures (land-cover groups ± population) fitted by non-negative least squares; 2000 bootstrap refits; 200 Monte Carlo runs on runoff coefficients.", options: {} }],
      { x: cx[0], y: y + 6.0, w: cw, h: 6.0, fontSize: 28 });
  y = 37.2; head("4  Three tests", cx[0], y, cw); box(cx[0], y + 1.4, cw, 6.6);
  txt([{ text: "Independent test: fit on 16 sites, predict 6 unseen sites", options: { bullet: true, breakLine: true } },
       { text: "Leave one site out (22 sites)", options: { bullet: true, breakLine: true } },
       { text: "Leave one river out (7 rivers)", options: { bullet: true, breakLine: true } },
       { text: "Always against a null model: the average of the training sites", options: { bullet: true, bold: true } }],
      { x: cx[0] + 0.5, y: y + 1.9, w: cw - 1.0, h: 5.8, fontSize: 30, paraSpaceAfter: 12 });
  // column 2
  y = 7.0; head("5  No model beat the average", cx[1], y, cw);
  img("fig4_model_validation.png", cx[1], y + 1.4, cw, 2.394, "Model errors and observed vs predicted");
  box(cx[1], y + 5.9, cw, 3.4);
  txt([{ text: "54.1 vs 52.5 mg/L", options: { bold: true, fontSize: 60, color: C.accent3, fontFace: "Cambria", breakLine: true } },
       { text: "best model vs simple average, river held out", options: { fontSize: 28 } }], { x: cx[1] + 0.5, y: y + 6.3, w: cw - 1.0, h: 2.8 });
  y = 17.6; head("6  Survey noise sets the limit", cx[1], y, cw);
  txt([{ text: "Four places were surveyed twice, years apart:", options: { breakLine: true } },
       { text: "Kulaman 194 → 144, Tinanan 211 → 190, below confluence 206 → 161 (2009–10 vs 2026); Cotabato City 114 → 166 (2022 vs 2024).", options: { breakLine: true } },
       { text: " ", options: { breakLine: true } },
       { text: "Repeat surveys differ by 44 mg/L (RMSE), about as much as any model's error.", options: { bold: true } }],
      { x: cx[1], y: y + 1.4, w: cw, h: 7.0 });
  y = 26.4; head("7  Rock type and Mt Apo", cx[1], y, cw);
  txt([{ text: "Elevation, slope and five USGS rock-type groups all made predictions worse. The lowest (57 mg/L, Kalatungan) and highest (300 mg/L, Mt Apo) sites both drain young volcanic rock.", options: { breakLine: true } },
       { text: " ", options: { breakLine: true } },
       { text: "Distance to Mt Apo, a volcano with solfataras and a geothermal field, lowered the site-held-out error to 45.4 mg/L (average 50.2), but only one sampled river drains it, so it cannot yet be confirmed.", options: {} }],
      { x: cx[1], y: y + 1.4, w: cw, h: 9.5 });
  y = 37.2; head("8  Scenarios", cx[1], y, cw);
  img("fig6_land_cover_scenarios.png", cx[1], y + 1.4, cw, 2.696, "Scenario changes in outlet TDS");
  txt("Population +50%: +7.3 mg/L at the river mouth (95% range 0–29.6). Forest-to-crop effects depend on the model and are not identifiable.", { x: cx[1], y: y + 5.2, w: cw, h: 3.0, fontSize: 28 });
  // column 3
  y = 7.0; head("9  Simulated TDS in 3D", cx[2], y, cw);
  img("fig8_3d_terrain_TDS.png", cx[2], y + 1.4, cw, 1.515, "3D terrain with simulated TDS");
  txt("Highest simulated TDS (183–200 mg/L) on populated valley floors around Kabacan, M'lang, Midsayap and Tacurong; lowest in forested uplands. Population supplies about 9% of TDS at the mouth.",
      { x: cx[2], y: y + 8.0, w: cw, h: 3.4, fontSize: 28 });
  y = 19.2; head("10  Next: 30-site sampling", cx[2], y, cw);
  img("fig7_proposed_sampling.png", cx[2], y + 1.4, 4.3, 0.619, "Proposed sampling sites");
  txt([{ text: "6 sites in each of 5 forest-cover classes", options: { bullet: true, breakLine: true } },
       { text: "One calibrated meter, wet and dry seasons", options: { bullet: true, breakLine: true } },
       { text: "Mt Apo vs Kitanglad / Kalatungan pairs to test hot-spring input", options: { bullet: true } }],
      { x: cx[2] + 4.7, y: y + 1.6, w: cw - 4.7, h: 7.5, fontSize: 26, paraSpaceAfter: 10 });
  y = 29.6; head("11  Conclusions", cx[2], y, cw); box(cx[2], y + 1.4, cw, 9.4);
  txt([{ text: "Published data cannot yet support land-cover-based TDS mapping in this basin.", options: { bullet: true, breakLine: true } },
       { text: "Survey-to-survey variability (44 mg/L) is as large as model error.", options: { bullet: true, breakLine: true } },
       { text: "Rivers differ more than land cover can explain; Mt Apo hot-spring input is the best lead.", options: { bullet: true, breakLine: true } },
       { text: "Population is the most consistent driver.", options: { bullet: true } }],
      { x: cx[2] + 0.5, y: y + 1.9, w: cw - 1.0, h: 8.6, fontSize: 30, paraSpaceAfter: 14 });
  y = 41.4;
  txt([{ text: "Code, data, paper and interactive web map", options: { bold: true, breakLine: true } },
       { text: "github.com/monteropeterdominic-arch/Mindanao-Basin-TDSPM", options: { color: C.accent2, breakLine: true } },
       { text: "monteropeterdominic-arch.github.io/Mindanao-Basin-TDSPM", options: { color: C.accent2 } }], { x: cx[2], y, w: cw, h: 3.2, fontSize: 27 });
  txt("Data: JAXA ALOS AW3D30 via OpenTopography; ESA WorldCover 2021; WorldPop 2020; USGS OFR 97-470-F geology; published surveys by Brillantes et al., Dimalen et al., Dumago et al., Galarpe et al., Villabeto & Simpol, Quimpang et al., Alombro et al., Wong et al. Acknowledgement: DOST-SEI.",
      { x: 1.2, y: 45.4, w: 30.7, h: 1.0, fontSize: 22, color: "5B6B70" });
  const out = "/home/claude/work/slides/Montero_Navaluna_IOCE2027_poster.pptx";
  await pres.writeFile({ fileName: out }); await applyTheme(out, THEME); console.log("poster ok");
}
deck().then(poster).catch(e => { console.error(e); process.exit(1); });
