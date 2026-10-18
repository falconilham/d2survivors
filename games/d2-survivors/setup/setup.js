var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = { DEV: false, PROD: true, MODE: "production", BASE_URL: "./" };
  }
});

// node_modules/galmuri/dist/Galmuri11-Bold.woff2?url
var Galmuri11_Bold_default;
var init_Galmuri11_Bold = __esm({
  "node_modules/galmuri/dist/Galmuri11-Bold.woff2?url"() {
    Galmuri11_Bold_default = "./Galmuri11-Bold-DIZAWR6A.woff2?url";
  }
});

// node_modules/galmuri/dist/Galmuri14.woff2?url
var Galmuri14_default;
var init_Galmuri14 = __esm({
  "node_modules/galmuri/dist/Galmuri14.woff2?url"() {
    Galmuri14_default = "./Galmuri14-BTMC4UQL.woff2?url";
  }
});

// src/game/lang/translate.ts
function langKey(text) {
  return text.replace(/\s+/g, " ").trim().toUpperCase();
}
function templateOf(text) {
  const numbers = [];
  const template = text.replace(NUMBER, (n) => {
    numbers.push(n);
    return "#";
  });
  return { template, numbers };
}
function wildOf(key, translated, slot = "(.*?)") {
  const pieces = key.split("*");
  if ((pieces.join("").match(/[A-Z]/g)?.length ?? 0) < WILD_LETTERS) return null;
  const escape = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  const pattern = new RegExp(`^${pieces.map(escape).join(slot)}$`, "iu");
  const clue = pieces.reduce((a, b) => b.trim().length > a.length ? b.trim() : a, "");
  return { pattern, clue, fixed: pieces.join("").replace(/\s/g, "").length, list: key.includes(" \xB7 "), translated };
}
var NUMBER, VALUE, LEADING_VALUE, TRAILING_VALUE, HANGUL, LETTERS, WILD_LETTERS, Translator;
var init_translate = __esm({
  "src/game/lang/translate.ts"() {
    "use strict";
    init_define_import_meta_env();
    NUMBER = /(?<![\p{L}\d.,])\d+(?:[.,]\d+)*/gu;
    VALUE = String.raw`[+-]?(?:\(\d[\d,.]*\s*[-–]\s*\d[\d,.]*\)|\d[\d,.]*(?:\s*[-–]\s*\d[\d,.]*)?)%?`;
    LEADING_VALUE = new RegExp(`^(${VALUE})\\s+(.+)$`, "u");
    TRAILING_VALUE = new RegExp(`^(.+?)\\s+(${VALUE})$`, "u");
    HANGUL = /[가-힣ㄱ-ㆎ]/;
    LETTERS = /[A-Za-z]/;
    WILD_LETTERS = 3;
    Translator = class {
      exact = /* @__PURE__ */ new Map();
      templates = /* @__PURE__ */ new Map();
      /** The `*` templates, those with the most fixed text first. */
      wilds = [];
      cache = /* @__PURE__ */ new Map();
      /** English that found no translation, for the dev console (missingText()). */
      missing = /* @__PURE__ */ new Set();
      /**
       * `tables` from the least to the most trusted: a later table's string wins. An entry whose English has a `#` or a
       * `*` is a template.
       */
      constructor(tables) {
        for (const table of tables) {
          for (const [english, translated] of Object.entries(table)) {
            if (!translated) continue;
            const key = langKey(english);
            if (key.includes("*")) {
              const wild = wildOf(key, translated);
              if (wild) this.wilds.push(wild);
            } else if (key.includes("#")) {
              this.templates.set(key, translated);
              const counted = wildOf(key.replace(/#/g, "*"), translated, "([+-]?\\d.*?)");
              if (counted) this.wilds.push(counted);
            } else this.exact.set(key, translated);
          }
        }
        this.wilds.reverse().sort((a, b) => b.fixed - a.fixed);
      }
      /** How many strings it knows. */
      get size() {
        return this.exact.size + this.templates.size + this.wilds.length;
      }
      translate(text) {
        if (!text || !LETTERS.test(text)) return text;
        const kept = this.cache.get(text);
        if (kept !== void 0) return kept;
        const found2 = this.find(text, 0);
        const result = found2 ?? text;
        if (found2 === null && !HANGUL.test(text)) this.missing.add(text);
        if (this.cache.size > 2e4) this.cache.clear();
        this.cache.set(text, result);
        return result;
      }
      /** `text`'s translation, its outer spacing kept, or null. */
      find(text, depth) {
        const inner = text.trim();
        if (!inner || !LETTERS.test(inner)) return null;
        const found2 = this.lookup(inner, depth);
        if (found2 === null) return null;
        const lines = text.includes("\n") ? found2 : found2.replace(/\s*\n\s*/g, " ");
        return text.slice(0, text.indexOf(inner)) + lines + text.slice(text.indexOf(inner) + inner.length);
      }
      lookup(text, depth) {
        const key = langKey(text);
        const exact = this.exact.get(key);
        if (exact !== void 0) return exact;
        const { template, numbers } = templateOf(text);
        if (numbers.length) {
          const shape = this.templates.get(langKey(template));
          if (shape !== void 0) return shape.replace(/\{(\d+)\}/g, (all, i) => numbers[Number(i)] ?? all);
        }
        if (depth > 3) return null;
        const part = (s) => this.find(s, depth + 1);
        let partly = null;
        for (const wild of this.wilds) {
          if (!key.includes(wild.clue)) continue;
          const match = wild.pattern.exec(text);
          if (!match || !wild.list && match.slice(1).some((slot) => slot.includes(" \xB7 "))) continue;
          let whole = true;
          const translated = wild.translated.replace(/\{(\d+)\}/g, (all, i) => {
            const slot = match[Number(i) + 1];
            if (slot === void 0) return all;
            const words = part(slot);
            if (words === null && LETTERS.test(slot)) whole = false;
            return words ?? slot;
          });
          if (whole) return translated;
          partly ??= translated;
        }
        if (text.includes("\n")) {
          const lines = text.split("\n");
          const translated = lines.map((line) => part(line));
          if (translated.some((t) => t !== null)) return lines.map((line, i) => translated[i] ?? line).join("\n");
        }
        const ending = /^(.*[A-Za-z)])([,.;:!?]+)$/s.exec(text);
        if (ending) {
          const words = part(ending[1]);
          if (words !== null) return words + ending[2];
        }
        for (const separator of [" \xB7 ", " / ", " - "]) {
          if (!text.includes(separator)) continue;
          const parts = text.split(separator);
          const translated = parts.map((p) => part(p));
          if (translated.some((t) => t !== null)) return parts.map((p, i) => translated[i] ?? p).join(separator);
        }
        const colon = text.indexOf(": ");
        if (colon > 0) {
          const label = part(text.slice(0, colon + 1)) ?? part(text.slice(0, colon));
          if (label !== null) {
            const rest = text.slice(colon + 2);
            const value = part(rest) ?? rest;
            return `${label.replace(/:?\s*$/, ":")} ${value}`;
          }
        }
        const to = /^to (.+)$/i.exec(text);
        if (to) {
          const words = part(to[1]);
          if (words !== null) return words;
        }
        const leading = LEADING_VALUE.exec(text);
        if (leading) {
          const words = part(leading[2]);
          if (words !== null) return `${leading[1]} ${words}`;
        }
        const trailing = TRAILING_VALUE.exec(text);
        if (trailing) {
          const words = part(trailing[1]);
          if (words !== null) return `${words} ${trailing[2]}`;
        }
        return partly;
      }
    };
  }
});

// src/game/lang/ko.json
var require_ko = __commonJS({
  "src/game/lang/ko.json"(exports, module) {
    module.exports = {
      "The main menu is down to PLAY, OPTIONS and SAVES, with EXIT below, and WEBSITE, DISCORD and NEWS in its top right corner": "\uBA54\uC778 \uBA54\uB274\uAC00 \uD50C\uB808\uC774, \uC124\uC815, \uC800\uC7A5 \uB370\uC774\uD130\uC640 \uADF8 \uC544\uB798\uC758 \uB098\uAC00\uAE30\uB85C \uC904\uC5C8\uC73C\uBA70, \uC624\uB978\uCABD \uC704 \uBAA8\uC11C\uB9AC\uC5D0 \uC6F9\uC0AC\uC774\uD2B8, \uB514\uC2A4\uCF54\uB4DC, \uC0C8 \uC18C\uC2DD\uC774 \uC788\uC2B5\uB2C8\uB2E4",
      "WEBSITE opens d2survivors.lol, home of the credits, the legal notice and the desktop app's download, in place of CREDITS and GET THE DESKTOP APP": "\uC6F9\uC0AC\uC774\uD2B8\uAC00 \uD06C\uB808\uB527\uACFC \uB370\uC2A4\uD06C\uD1B1 \uC571 \uBC1B\uAE30 \uB300\uC2E0 d2survivors.lol\uC744 \uC5FD\uB2C8\uB2E4: \uD06C\uB808\uB527, \uBC95\uC801 \uACE0\uC9C0, \uB370\uC2A4\uD06C\uD1B1 \uC571 \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uADF8\uACF3\uC5D0 \uC788\uC2B5\uB2C8\uB2E4",
      "Charsi's upgrades are in the campfire's INVENTORY now, beside your hero's gear": "\uCC30\uC2DC\uC758 \uAC15\uD654\uB294 \uC774\uC81C \uBAA8\uB2E5\uBD88\uC758 \uC18C\uC9C0\uD488\uC5D0\uC11C \uC601\uC6C5\uC758 \uC7A5\uBE44 \uC606\uC5D0 \uC788\uC2B5\uB2C8\uB2E4",
      "The campfire's START sits on a stone the size of EXIT and INVENTORY, as in Diablo II": "\uBAA8\uB2E5\uBD88\uC758 \uC2DC\uC791 \uBC84\uD2BC\uC774 \uB514\uC544\uBE14\uB85C II\uCC98\uB7FC \uB098\uAC00\uAE30, \uC18C\uC9C0\uD488\uACFC \uAC19\uC740 \uD06C\uAE30\uC758 \uB3CC \uBC84\uD2BC\uC774 \uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      "The setup warns that the hosted files are going away very soon: D2 Survivors will run only on your own Diablo II or D2R files": "\uC124\uC815 \uD654\uBA74\uC774 \uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C\uC774 \uACE7 \uC0AC\uB77C\uC9C4\uB2E4\uACE0 \uC54C\uB9BD\uB2C8\uB2E4: D2 Survivors\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uD30C\uC77C\uB85C\uB9CC \uC2E4\uD589\uB429\uB2C8\uB2E4",
      "Soon D2 Survivors will run only on your own Diablo II files: a note on the main menu says so once, with USE YOUR OWN FILES": "\uACE7 D2 Survivors\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II \uD30C\uC77C\uB85C\uB9CC \uC2E4\uD589\uB429\uB2C8\uB2E4: \uBA54\uC778 \uBA54\uB274\uC758 \uC548\uB0B4\uAC00 \uC774\uB97C \uD55C \uBC88 \uC54C\uB9AC\uBA70, \uB0B4 \uAC8C\uC784 \uD30C\uC77C \uC0AC\uC6A9 \uBC84\uD2BC\uC774 \uD568\uAED8 \uC788\uC2B5\uB2C8\uB2E4",
      "Soon D2 Survivors will run only on your own Diablo II or Diablo II: Resurrected files, out of respect for Blizzard's work. Get the desktop app, or point the game at your install. Your saves come with you.": "\uACE7 D2 Survivors\uB294 \uBE14\uB9AC\uC790\uB4DC\uC758 \uC791\uD488\uC744 \uC874\uC911\uD558\uC5EC \uB0B4 \uB514\uC544\uBE14\uB85C II \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uD30C\uC77C\uB85C\uB9CC \uC2E4\uD589\uB429\uB2C8\uB2E4. \uB370\uC2A4\uD06C\uD1B1 \uC571\uC744 \uBC1B\uAC70\uB098, \uC124\uCE58\uB41C \uAC8C\uC784\uC744 \uC9C0\uC815\uD558\uC2ED\uC2DC\uC624. \uC800\uC7A5 \uB370\uC774\uD130\uB294 \uADF8\uB300\uB85C \uAC00\uC838\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "USE YOUR OWN FILES": "\uB0B4 \uAC8C\uC784 \uD30C\uC77C \uC0AC\uC6A9",
      "Your own Diablo II files": "\uB0B4 \uB514\uC544\uBE14\uB85C II \uD30C\uC77C",
      "Play with your own Diablo II files: faster, no download.": "\uB0B4 \uB514\uC544\uBE14\uB85C II \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD558\uC2ED\uC2DC\uC624: \uB354 \uBE60\uB974\uACE0, \uB0B4\uB824\uBC1B\uC744 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "The game plays with the hosted files.": "\uAC8C\uC784\uC774 \uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "Hosted files": "\uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C",
      "It works in desktop Chrome, Edge, Firefox and Safari. On a phone the game plays with the hosted files.": "\uB370\uC2A4\uD06C\uD1B1\uC758 Chrome, Edge, Firefox, Safari\uC5D0\uC11C \uC791\uB3D9\uD569\uB2C8\uB2E4. \uD734\uB300\uD3F0\uC5D0\uC11C\uB294 \uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "With the hosted files, the game downloads its art and sound from this site as you play, as before. Switch any time in Options, GAME FILES.": "\uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C\uC744 \uC4F0\uBA74 \uAC8C\uC784\uC774 \uC608\uC804\uCC98\uB7FC \uD50C\uB808\uC774\uD558\uBA74\uC11C \uC774 \uC0AC\uC774\uD2B8\uC5D0\uC11C \uADF8\uB798\uD53D\uACFC \uC0AC\uC6B4\uB4DC\uB97C \uB0B4\uB824\uBC1B\uC2B5\uB2C8\uB2E4. \uC5B8\uC81C\uB4E0 \uC124\uC815\uC758 \uAC8C\uC784 \uD30C\uC77C\uC5D0\uC11C \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "Hosted files are going away very soon: D2 Survivors will only run on your own Diablo II or D2R files.": "\uC0AC\uC774\uD2B8\uC758 \uD30C\uC77C\uC740 \uACE7 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4: D2 Survivors\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uD30C\uC77C\uB85C\uB9CC \uC2E4\uD589\uB429\uB2C8\uB2E4.",
      "Your heroes are safe in this browser, and SAVES works without game files.": "\uC601\uC6C5\uB4E4\uC740 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC548\uC804\uD558\uAC8C \uB0A8\uC544 \uC788\uC73C\uBA70, \uC800\uC7A5 \uB370\uC774\uD130\uB294 \uAC8C\uC784 \uD30C\uC77C\uC774 \uC5C6\uC5B4\uB3C4 \uC791\uB3D9\uD569\uB2C8\uB2E4.",
      WEBSITE: "\uC6F9\uC0AC\uC774\uD2B8",
      "The game now uses your own files": "\uC774\uC81C \uAC8C\uC784\uC740 \uB0B4 \uAC8C\uC784 \uD30C\uC77C\uB85C \uC2E4\uD589\uB429\uB2C8\uB2E4",
      "D2 Survivors now plays from your own Diablo II or Diablo II: Resurrected files.": "\uC774\uC81C D2 Survivors\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "D2 Survivors now needs your own Diablo II files": "\uC774\uC81C D2 Survivors\uC5D0\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II \uD30C\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4",
      "A phone can't read a Diablo II install. Play on a computer: here on the website, or in the desktop app.": "\uD734\uB300\uD3F0\uC740 \uC124\uCE58\uB41C \uB514\uC544\uBE14\uB85C II\uB97C \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uCEF4\uD4E8\uD130\uC5D0\uC11C \uD50C\uB808\uC774\uD558\uC2ED\uC2DC\uC624: \uC774 \uC6F9\uC0AC\uC774\uD2B8\uC5D0\uC11C, \uB610\uB294 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC73C\uB85C.",
      "This browser can't read a Diablo II install. Play in a recent Chrome, Edge, Firefox or Safari, or in the desktop app.": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uB294 \uC124\uCE58\uB41C \uB514\uC544\uBE14\uB85C II\uB97C \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uCD5C\uC2E0 Chrome, Edge, Firefox, Safari \uB610\uB294 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC5D0\uC11C \uD50C\uB808\uC774\uD558\uC2ED\uC2DC\uC624.",
      "Your heroes are safe in this browser. SAVES exports them, to carry to your computer.": "\uC601\uC6C5\uB4E4\uC740 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC548\uC804\uD558\uAC8C \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uC800\uC7A5 \uB370\uC774\uD130\uC5D0\uC11C \uB0B4\uBCF4\uB0B4 \uCEF4\uD4E8\uD130\uB85C \uC62E\uAE30\uC2ED\uC2DC\uC624.",
      "Your heroes stay in this browser, with or without game files. Export them to keep a copy, or to carry them to the desktop app or another browser.": "\uC601\uC6C5\uB4E4\uC740 \uAC8C\uC784 \uD30C\uC77C\uC774 \uC788\uB4E0 \uC5C6\uB4E0 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uC0AC\uBCF8\uC744 \uBCF4\uAD00\uD558\uAC70\uB098 \uB370\uC2A4\uD06C\uD1B1 \uC571 \uB610\uB294 \uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800\uB85C \uC62E\uAE30\uB824\uBA74 \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.",
      "It works in desktop Chrome, Edge, Firefox and Safari. A phone can\u2019t read an install: play on a computer.": "\uB370\uC2A4\uD06C\uD1B1\uC6A9 Chrome, Edge, Firefox, Safari\uC5D0\uC11C \uC791\uB3D9\uD569\uB2C8\uB2E4. \uD734\uB300\uD3F0\uC740 \uC124\uCE58\uB41C \uAC8C\uC784\uC744 \uC77D\uC744 \uC218 \uC5C6\uC73C\uB2C8 \uCEF4\uD4E8\uD130\uC5D0\uC11C \uD50C\uB808\uC774\uD558\uC2ED\uC2DC\uC624.",
      "Your heroes stay in this browser, with or without game files: SAVES exports them. The desktop app plays from your install too.": "\uC601\uC6C5\uB4E4\uC740 \uAC8C\uC784 \uD30C\uC77C\uC774 \uC788\uB4E0 \uC5C6\uB4E0 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uB0A8\uC544 \uC788\uC73C\uBA70, \uC800\uC7A5 \uB370\uC774\uD130\uC5D0\uC11C \uB0B4\uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB370\uC2A4\uD06C\uD1B1 \uC571\uB3C4 \uC124\uCE58\uB41C \uAC8C\uC784\uC73C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "Plays from your own Diablo II or Diablo II: Resurrected files.": "\uB0B4 \uB514\uC544\uBE14\uB85C II \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "Options keeps the sound and music sliders on a SOUND OPTIONS page of their own": "\uC124\uC815\uC758 \uD6A8\uACFC\uC74C\uACFC \uC74C\uC545 \uC2AC\uB77C\uC774\uB354\uAC00 \uBCC4\uB3C4\uC758 \uC0AC\uC6B4\uB4DC \uC124\uC815 \uD398\uC774\uC9C0\uB85C \uC62E\uACA8\uC84C\uC2B5\uB2C8\uB2E4",
      "D2 Survivors has a Discord server: DISCORD on the main menu": "D2 Survivors \uB514\uC2A4\uCF54\uB4DC \uC11C\uBC84\uAC00 \uC5F4\uB838\uC2B5\uB2C8\uB2E4: \uBA54\uC778 \uBA54\uB274\uC758 \uB514\uC2A4\uCF54\uB4DC",
      "- ready to evolve": "- \uC9C4\uD654 \uC900\uBE44 \uC644\uB8CC",
      ", after this difficulty's #": ", \uC774 \uB09C\uC774\uB3C4\uC758 {0} \uC801\uC6A9 \uD6C4",
      ", needs:": ", \uD544\uC694:",
      ", passing through #": ", {0} \uAD00\uD1B5",
      ": stash it": ": \uBCF4\uAD00\uD568\uC5D0 \uB123\uAE30",
      ": stash it at Charsi's": ": \uCC30\uC2DC\uC758 \uBCF4\uAD00\uD568\uC5D0 \uB123\uAE30",
      "(#/# Charges)": "(\uCDA9\uC804 {0}/{1})",
      "(+* from gear)": "(\uC7A5\uBE44 +{0})",
      "(Amazon Only)": "(\uC544\uB9C8\uC874 \uC804\uC6A9)",
      "(Assassin Only)": "(\uC554\uC0B4\uC790 \uC804\uC6A9)",
      "(Barbarian Only)": "(\uC57C\uB9CC\uC6A9\uC0AC \uC804\uC6A9)",
      "(Based on Character Level)": "(\uCE90\uB9AD\uD130 \uB808\uBCA8\uC5D0 \uBE44\uB840)",
      "(Druid Only)": "(\uB4DC\uB8E8\uC774\uB4DC \uC804\uC6A9)",
      "(Necromancer Only)": "(\uAC15\uB839\uC220\uC0AC \uC804\uC6A9)",
      "(Paladin Only)": "(\uC131\uAE30\uC0AC \uC804\uC6A9)",
      "(Sorceress Only)": "(\uC6D0\uC18C\uC220\uC0AC \uC804\uC6A9)",
      "* (Based on Character Level)": "{0} (\uCE90\uB9AD\uD130 \uB808\uBCA8 \uAE30\uC900)",
      "* (Esc)": "{0} (Esc)",
      "* * \xB7 Build *": "{1} {0}\uC77C \xB7 \uBE4C\uB4DC {2}",
      "* a cast, every * s": "\uC2DC\uC804\uB2F9 {0}, {1}\uCD08\uB9C8\uB2E4",
      "* approaches": "{0} \uC811\uADFC",
      "* comes when the bar runs out": "\uAC8C\uC774\uC9C0\uAC00 \uB2E4 \uB5A8\uC5B4\uC9C0\uBA74 {0} \uB4F1\uC7A5",
      "* evolved into *!": "{0}\uC774(\uAC00) {1}(\uC73C)\uB85C \uC9C4\uD654\uD588\uC2B5\uB2C8\uB2E4!",
      "* from the class, * from level-ups and gear": "\uD074\uB798\uC2A4 \uAE30\uBCF8 {0}, \uB808\uBCA8\uC5C5\uACFC \uC7A5\uBE44\uB85C {1}",
      "* has come": "{0} \uB4F1\uC7A5",
      "* hits a second": "\uCD08\uB2F9 {0}\uD68C \uD0C0\uACA9",
      "* into *, needs:": "{0}\uC744(\uB97C) {1}(\uC73C)\uB85C \uC9C4\uD654, \uC870\uAC74:",
      "* is open to the *.": "{1}\uC5D0\uAC8C {0} \uB09C\uC774\uB3C4\uAC00 \uC5F4\uB838\uC2B5\uB2C8\uB2E4.",
      "* of *": "{0}/{1}",
      "* of holy light that * *, * damage (double to the undead)": "\uAD34\uBB3C {2}\uB9C8\uB9AC\uB97C {1} \uC2E0\uC131\uD55C \uBE5B\uC758 {0}, {3} \uD53C\uD574 (\uC5B8\uB370\uB4DC\uC5D0\uAC8C \uB450 \uBC30)",
      "* on Hell": "{0} (\uC9C0\uC625)",
      "* on Nightmare": "{0} (\uC545\uBABD)",
      "* over * seconds": "{0} ({1}\uCD08\uC5D0 \uAC78\uCCD0)",
      "* per Level": "\uB808\uBCA8\uB2F9 {0}",
      "* Receives Bonuses From:": "{0}\uC5D0 \uBCF4\uB108\uC2A4",
      "* shorter cooldowns": "{0} \uC7AC\uC0AC\uC6A9 \uB300\uAE30\uC2DC\uAC04 \uAC10\uC18C",
      "* to reload*": "{0}\uD558\uC5EC \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30{1}",
      "* weakens": "{0} \uC57D\uD654",
      "* won't buy that": "{0}\uC740(\uB294) \uC774\uAC83\uC744 \uC0AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "*: * at character level *": "{0}: \uCE90\uB9AD\uD130 \uB808\uBCA8 {2}\uC5D0 {1}",
      "*: * at level *": "{0}: \uB808\uBCA8 {2}\uC5D0 {1}",
      "*: active": "{0}: \uD65C\uC131\uD654\uB428",
      "*: OFF": "{0}: \uAEBC\uC9D0",
      "*'s Wares": "{0}\uC758 \uBB3C\uD488",
      "*'s wares (B)": "{0}\uC758 \uBB3C\uD488 (B)",
      "*'s wares (G)": "{0}\uC758 \uBB3C\uD488 (G)",
      "*% Better Chance of Getting Magic Items per Level": "{0}% \uB9C8\uBC95 \uC544\uC774\uD15C \uBC1C\uACAC \uD655\uB960 \uC99D\uAC00 (\uB808\uBCA8\uB2F9)",
      "*% Chance to cast level * * *": "{3} {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * on attack": "\uACF5\uACA9 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * on striking": "\uC801\uC911 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * when struck": "\uD53C\uACA9 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * when you Die": "\uC0AC\uB9DD \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * when you Kill an Enemy": "\uC801 \uCC98\uCE58 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Chance to cast level * * when you Level-Up": "\uB808\uBCA8 \uC5C5 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "*% Deadly Strike per Level": "{0}% \uCE58\uBA85\uC801 \uACF5\uACA9 (\uB808\uBCA8\uB2F9)",
      "*T: Charsi's wares - Esc: end the run": "{0}T: \uCC30\uC2DC\uC758 \uBB3C\uD488 - Esc: \uAC8C\uC784 \uB05D\uB0B4\uAE30",
      "# \xB7 Level # \xB7 # kills": "{0} \xB7 \uB808\uBCA8 {1} \xB7 {2} \uCC98\uCE58",
      "# # after monsters, # poison over #s a bite, # life": "{0} {1}: \uAD34\uBB3C\uC744 \uCAD3\uC74C, \uBB3C\uAE30\uB2F9 {3}\uCD08\uAC04 {2} \uB3C5 \uD53C\uD574, \uC0DD\uBA85\uB825 {4}",
      "# # at monsters, # damage, # times each": "{0} {1}: \uAD34\uBB3C\uC5D0\uAC8C {2} \uD53C\uD574, \uAC01 {3}\uD68C",
      "# # fire, cold, lightning or poison bolts, # damage": "{0} {1}: \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB3C5 \uD0C4, {2} \uD53C\uD574",
      "# # out around you, # damage to all #": "{0} {1}: \uC8FC\uC704\uB85C \uB098\uC120\uC744 \uADF8\uB9AC\uBA70 {2} \uD53C\uD574 {3}",
      "# arrow": "\uD654\uC0B4 {0}",
      "# arrows": "\uD654\uC0B4 {0}",
      "# arrows that burst into freezing ice, # damage around what they hit and a #s chill": "\uC5BC\uC74C\uC73C\uB85C \uD3ED\uBC1C\uD558\uB294 \uD654\uC0B4 {0}\uBC1C, \uB9DE\uC740 \uACF3 \uC8FC\uBCC0\uC5D0 {1} \uD53C\uD574, {2}\uCD08\uAC04 \uC624\uD55C",
      "# arrows that explode for # damage and leave the ground burning for #s": "\uD3ED\uBC1C\uD558\uB294 \uD654\uC0B4 {0}\uBC1C, {1} \uD53C\uD574, {2}\uCD08\uAC04 \uB545\uC744 \uBD88\uD0DC\uC6C0",
      "# arrows that freeze what they hit solid for #s, # damage": "\uB9DE\uC740 \uC801\uC744 {1}\uCD08\uAC04 \uBE59\uACB0\uC2DC\uD0A4\uB294 \uD654\uC0B4 {0}\uBC1C, {2} \uD53C\uD574",
      "# at monsters in reach, # damage each": "\uBC94\uC704 \uB0B4 \uAD34\uBB3C\uC5D0\uAC8C \uBE60\uB978 \uACF5\uACA9 {0}\uD68C, \uAC01 {1} \uD53C\uD574",
      "# at the nearest monsters, # damage": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C {0}, {1} \uD53C\uD574",
      "# at the toughest in reach, # damage; the last releases all charges": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC5D0\uAC8C \uBC1C\uCC28\uAE30 {0}\uD68C, {1} \uD53C\uD574; \uB9C8\uC9C0\uB9C9 \uBC1C\uCC28\uAE30\uC5D0 \uBAA8\uB4E0 \uCDA9\uC804 \uBC29\uCD9C",
      "# axes thrown at the monsters around you, # damage each, passing through #": "\uC8FC\uBCC0 \uAD34\uBB3C\uC5D0\uAC8C \uB3C4\uB07C {0}\uAC1C\uB97C \uB358\uC9D0, \uAC01 {1} \uD53C\uD574, {2}\uB9C8\uB9AC \uAD00\uD1B5",
      "# blades thrown at the monsters around you, # damage each, passing through one": "\uC8FC\uBCC0 \uAD34\uBB3C\uC5D0\uAC8C \uCE7C\uB0A0 {0}\uAC1C\uB97C \uB358\uC9D0, \uAC01 {1} \uD53C\uD574, \uD55C \uB9C8\uB9AC \uAD00\uD1B5",
      "# bolt": "\uD0C4 {0}",
      "# bolts": "\uD0C4 {0}",
      "# bolts that jump between up to # monsters, # damage each": "\uCD5C\uB300 {1}\uB9C8\uB9AC\uC758 \uAD34\uBB3C \uC0AC\uC774\uB97C \uD280\uB294 \uD0C4 {0}\uBC1C, \uAC01 {2} \uD53C\uD574",
      "# bone spirits, each hunting down one of the nearest monsters, # damage": "\uBF08 \uC601\uD63C {0}\uAC1C\uAC00 \uAC01\uAC01 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC744 \uCD94\uC801, {1} \uD53C\uD574",
      "# fire arrow": "\uBD88\uD654\uC0B4 {0}",
      "# fire arrows": "\uBD88\uD654\uC0B4 {0}",
      "# fire balls at the nearest monsters, bursting on impact for # damage around": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uB4E4\uC5D0\uAC8C \uD654\uC5FC\uAD6C {0}\uAC1C, \uBA85\uC911 \uC2DC \uD130\uC838 \uC8FC\uBCC0\uC5D0 {1} \uD53C\uD574",
      "# fire trails, # yards, at the nearest monster, burning # damage # times a second": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC744 \uD5A5\uD574 {1}\uC57C\uB4DC\uC758 \uD654\uC5FC \uC790\uAD6D {0}\uC904\uAE30, \uCD08\uB2F9 {3}\uD68C {2} \uD53C\uD574",
      "# frenzied blows over the monsters in a wide reach (every other at a boss), # damage each": "\uB113\uC740 \uBC94\uC704\uC758 \uAD34\uBB3C\uC5D0\uAC8C \uAD11\uBD84\uC758 \uD0C0\uACA9 {0}\uD68C(\uC6B0\uB450\uBA38\uB9AC\uC5D0\uAC90 \uB450 \uBC88\uC5D0 \uD55C \uBC88), \uAC01 {1} \uD53C\uD574",
      "# gold": "{0} \uACE8\uB4DC",
      "# guided arrows that hunt through # monsters each, # damage": "\uC720\uB3C4 \uD654\uC0B4 {0}\uBC1C, \uAC01\uAC01 \uAD34\uBB3C {1}\uB9C8\uB9AC\uB97C \uCD94\uC801, {2} \uD53C\uD574",
      "# hammer": "\uB9DD\uCE58 {0}",
      "# hammers": "\uB9DD\uCE58 {0}",
      "# hits": "{0}\uD68C \uC801\uC911",
      "# item": "\uC544\uC774\uD15C {0}",
      "# items": "\uC544\uC774\uD15C {0}",
      "# javelin": "\uD22C\uCC3D {0}",
      "# javelins": "\uD22C\uCC3D {0}",
      "# javelins that burst into lightning forking to # monsters, # damage each": "\uBC88\uAC1C\uB85C \uD130\uC9C0\uB294 \uD22C\uCC3D {0}\uAC1C, \uAD34\uBB3C {1}\uB9C8\uB9AC\uC5D0\uAC8C \uAC08\uB77C\uC838 \uAC01 {2} \uD53C\uD574",
      "# javelins trailing poison that burst into a spreading cloud, # poison over #s to all within #": "\uB3C5 \uC790\uAD6D\uC744 \uB0A8\uAE30\uB294 \uD22C\uCC3D {0}\uAC1C, \uD37C\uC9C0\uB294 \uB3C5\uAD6C\uB984\uC73C\uB85C \uD3ED\uBC1C, {3} \uC548\uC758 \uBAA8\uB450\uC5D0\uAC8C {2}\uCD08\uAC04 {1} \uB3C5 \uD53C\uD574",
      "# kick": "\uBC1C\uCC28\uAE30 {0}",
      "# kicks": "\uBC1C\uCC28\uAE30 {0}",
      "# kills": "{0} \uCC98\uCE58",
      "# magic arrow": "\uB9C8\uBC95 \uD654\uC0B4 {0}",
      "# magic arrows": "\uB9C8\uBC95 \uD654\uC0B4 {0}",
      "# molten boulders roll through all in their path, # damage, knockback, leaving fire": "\uD0C0\uC624\uB974\uB294 \uBC14\uC704 {0}\uAC1C\uAC00 \uACBD\uB85C\uC758 \uBAA8\uB4E0 \uAC83\uC744 \uB6AB\uACE0 \uAD74\uB7EC\uAC10, {1} \uD53C\uD574, \uBC00\uCCD0\uB0B4\uAE30, \uBD88\uAE38\uC744 \uB0A8\uAE40",
      "# monster": "\uAD34\uBB3C {0}",
      "# monsters": "\uAD34\uBB3C {0}",
      "# of lightning through every monster in line, # damage": "\uC77C\uC9C1\uC120\uC758 \uBAA8\uB4E0 \uAD34\uBB3C\uC744 \uAD00\uD1B5\uD558\uB294 \uBC88\uAC1C {0}, {1} \uD53C\uD574",
      "# of sparks over the nearest pack for #s, # damage # times a second": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC704\uC5D0 {1}\uCD08\uAC04 \uBD88\uAF43 \uADF8\uBB3C {0}\uAC1C, \uCD08\uB2F9 {3}\uD68C {2} \uD53C\uD574",
      "# quick spear thrusts at the nearest monster in reach, # damage each": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uBE60\uB978 \uCC0C\uB974\uAE30 {0}\uD68C, \uAC01 {1} \uD53C\uD574",
      "# skeleton": "\uD574\uACE8 {0}",
      "# skeletons": "\uD574\uACE8 {0}",
      "# spark": "\uBD88\uAF43 {0}",
      "# sparks": "\uBD88\uAF43 {0}",
      "# spears of bone that pierce every monster in their path, # damage": "\uACBD\uB85C\uC0C1 \uBAA8\uB4E0 \uAD34\uBB3C\uC744 \uAD00\uD1B5\uD558\uB294 \uBF08 \uCC3D {0}\uAC1C, {1} \uD53C\uD574",
      "# spikes at the nearest monsters burst for # damage, freezing all in the burst for #s": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uAC00\uC2DC {0}\uAC1C, \uD3ED\uBC1C\uD574 {1} \uD53C\uD574, \uD3ED\uBC1C \uBC94\uC704\uC758 \uBAA8\uB450\uB97C {2}\uCD08\uAC04 \uBE59\uACB0",
      "# swift blow": "\uBE60\uB978 \uACF5\uACA9 {0}",
      "# swift blows": "\uBE60\uB978 \uACF5\uACA9 {0}",
      "# that # # and #, # damage": "{0} {1} {2}, {3}, {4} \uD53C\uD574",
      "# that # for # damage around what #": "{0} {1}: \uC8FC\uBCC0\uC5D0 {2} \uD53C\uD574 {3}",
      "# that # for #s, # damage": "{0} {1} {2}\uCD08\uAC04, {3} \uD53C\uD574",
      "# that # mark, # damage": "{0} {1} \uBAA9\uD45C\uB97C \uCD94\uC801, {2} \uD53C\uD574",
      "# that crackle forward, # damage each": "\uC55E\uC73C\uB85C \uD280\uC5B4 \uB098\uAC00\uB294 \uBD88\uAF43 {0}\uAC1C, \uAC01 {1} \uD53C\uD574",
      "# that seek monsters, # damage and a stun to each they pass through": "\uAD34\uBB3C\uC744 \uCAD3\uB294 \uB3CC\uAC1C\uBC14\uB78C {0}\uAC1C, \uC9C0\uB098\uB294 \uC801\uB9C8\uB2E4 {1} \uD53C\uD574\uC640 \uAE30\uC808",
      "# tornadoes wander the horde, # damage and a stun to each monster they pass": "\uD68C\uC624\uB9AC\uBC14\uB78C {0}\uAC1C\uAC00 \uBB34\uB9AC \uC0AC\uC774\uB97C \uB5A0\uB3CC\uBA70 \uC9C0\uB098\uB294 \uAD34\uBB3C\uB9C8\uB2E4 {1} \uD53C\uD574\uC640 \uAE30\uC808",
      "# toughest monsters": "\uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C {0}\uB9C8\uB9AC",
      "# trailing poison clouds, # damage and # poison over #s to every monster in the clouds": "\uD37C\uC838 \uB098\uAC00\uB294 \uB3C5\uAD6C\uB984 {0}\uAC1C, \uAD6C\uB984 \uC18D \uBAA8\uB4E0 \uAD34\uBB3C\uC5D0\uAC8C {1} \uD53C\uD574\uC640 {3}\uCD08\uAC04 {2} \uB3C5 \uD53C\uD574",
      "# twister": "\uD68C\uC624\uB9AC {0}",
      "# twisters": "\uD68C\uC624\uB9AC {0}",
      "# upgrade": "\uC5C5\uADF8\uB808\uC774\uB4DC {0}",
      "# upgrades": "\uC5C5\uADF8\uB808\uC774\uB4DC {0}",
      "# web": "\uAC70\uBBF8\uC904 {0}",
      "# webs": "\uAC70\uBBF8\uC904 {0}",
      "#% Better Chance of Getting Magic Items": "{0}% \uB9C8\uBC95 \uC544\uC774\uD15C \uBC1C\uACAC \uD655\uB960 \uC99D\uAC00",
      "#% Chance to cast level # # on attack": "\uACF5\uACA9 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "#% Chance to cast level # # on striking": "\uC801\uC911 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "#% Chance to cast level # # when struck": "\uD53C\uACA9 \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "#% Chance to cast level # # when you Die": "\uC0AC\uB9DD \uC2DC {0}% \uD655\uB960\uB85C {1}\uB808\uBCA8 {2} \uC2DC\uC804",
      "#% Extra Gold from Monsters": "\uAD34\uBB3C\uC5D0\uAC8C\uC11C \uC5BB\uB294 \uACE8\uB4DC {0}% \uC99D\uAC00",
      "#% Faster Cast Rate": "{0}% \uC2DC\uC804 \uC18D\uB3C4 \uC99D\uAC00",
      "#% Faster Run/Walk": "{0}% \uB2EC\uB9AC\uAE30/\uAC77\uAE30 \uC18D\uB3C4 \uC99D\uAC00",
      "#% less damage taken": "{0}% \uBC1B\uB294 \uD53C\uD574 \uAC10\uC18C",
      "#% less damage taken per rank": "{0}% \uBC1B\uB294 \uD53C\uD574 \uAC10\uC18C (\uB2E8\uACC4\uB2F9)",
      "A bigger stash, as in Resurrected: a 10\xD710 tab of your own for each hero and three shared ones (your old stash is the first)": "\uB808\uC800\uB809\uC158\uCC98\uB7FC \uB354 \uCEE4\uC9C4 \uBCF4\uAD00\uD568: \uC601\uC6C5\uB9C8\uB2E4 10\xD710 \uAC1C\uC778 \uD0ED \uD558\uB098\uC640 \uACF5\uC720 \uD0ED \uC14B (\uAE30\uC874 \uBCF4\uAD00\uD568\uC740 \uCCAB \uBC88\uC9F8 \uACF5\uC720 \uD0ED)",
      "A Druid shifts only while the spells he has put more levels in than his Werewolf or Werebear recharge, and turns back as soon as one is ready, so a wereform picked late no longer stops his spells; the wereforms' cards say No spells in red": "\uB4DC\uB8E8\uC774\uB4DC\uB294 \uB291\uB300\uC778\uAC04\uC774\uB098 \uACF0\uC778\uAC04\uBCF4\uB2E4 \uB808\uBCA8\uC744 \uB354 \uC62C\uB9B0 \uC8FC\uBB38\uC774 \uC7AC\uC0AC\uC6A9 \uB300\uAE30 \uC911\uC77C \uB54C\uB9CC \uBCC0\uC2E0\uD558\uACE0, \uADF8 \uC8FC\uBB38\uC774 \uC900\uBE44\uB418\uB294 \uC989\uC2DC \uB3CC\uC544\uC635\uB2C8\uB2E4. \uB2A6\uAC8C \uACE0\uB978 \uBCC0\uC2E0\uC774 \uB354 \uC774\uC0C1 \uC8FC\uBB38\uC744 \uB9C9\uC9C0 \uC54A\uC73C\uBA70, \uBCC0\uC2E0 \uCE74\uB4DC\uC5D0\uB294 '\uC8FC\uBB38 \uBD88\uAC00'\uAC00 \uBE68\uAC04\uC0C9\uC73C\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4",
      "A gentler first minute: a handful of Fallen and Zombies, no Quill Rats or Shamans until 0:30 and then two at a time, Corpsefire at 0:55, and the full field by 2:00": "\uB354 \uBD80\uB4DC\uB7EC\uC6B4 \uCCAB 1\uBD84: \uBAB0\uB77D\uC790\uC640 \uC880\uBE44 \uBA87 \uB9C8\uB9AC\uB9CC \uB098\uC624\uACE0, \uAC00\uC2DC \uC950\uC640 \uBAB0\uB77D\uC790 \uC8FC\uC220\uC0AC\uB294 0:30\uBD80\uD130 \uD55C \uBC88\uC5D0 \uB450 \uB9C8\uB9AC\uAE4C\uC9C0, \uBD88\uD0C0\uB294 \uC2DC\uCCB4\uB294 0:55\uC5D0, 2:00\uC5D0\uB294 \uBAA8\uB4E0 \uAD34\uBB3C\uC774 \uB098\uC635\uB2C8\uB2E4",
      "A note from the developer": "\uAC1C\uBC1C\uC790\uAC00 \uB4DC\uB9AC\uB294 \uB9D0\uC500",
      "A one-time note from the developer on the main menu: the game is still a beta, and where to find me on X": "\uBA54\uC778 \uBA54\uB274\uC5D0 \uAC1C\uBC1C\uC790\uAC00 \uB4DC\uB9AC\uB294 \uB9D0\uC500\uC774 \uD55C \uBC88 \uD45C\uC2DC\uB429\uB2C8\uB2E4: \uAC8C\uC784\uC740 \uC544\uC9C1 \uBCA0\uD0C0\uC774\uBA70, X\uC5D0\uC11C \uC800\uB97C \uB9CC\uB098\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      "A save file or code from the desktop app or another browser replaces this browser's save.": "\uB370\uC2A4\uD06C\uD1B1 \uC571\uC774\uB098 \uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800\uC758 \uC800\uC7A5 \uD30C\uC77C \uB610\uB294 \uCF54\uB4DC\uB294 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC758 \uC800\uC7A5 \uB370\uC774\uD130\uB97C \uB300\uCCB4\uD569\uB2C8\uB2E4.",
      "As an act's boss falls, the field falls with him, leaving only experience gems, and the portal opens a few strides from his loot": "\uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uC4F0\uB7EC\uC9C0\uBA74 \uD544\uB4DC\uC758 \uAD34\uBB3C\uB3C4 \uD568\uAED8 \uC4F0\uB7EC\uC838 \uACBD\uD5D8\uCE58 \uBCF4\uC11D\uB9CC \uB0A8\uAE30\uACE0, \uCC28\uC6D0\uBB38\uC740 \uADF8\uC758 \uC804\uB9AC\uD488\uC5D0\uC11C \uBA87 \uAC78\uC74C \uB5A8\uC5B4\uC9C4 \uACF3\uC5D0 \uC5F4\uB9BD\uB2C8\uB2E4",
      CREDITS: "\uD06C\uB808\uB527",
      "Baal's drops that don't fit your inventory go into your stash, not lost on CONTINUE": "\uC778\uBCA4\uD1A0\uB9AC\uC5D0 \uB4E4\uC5B4\uAC00\uC9C0 \uC54A\uB294 \uBC14\uC54C\uC758 \uC804\uB9AC\uD488\uC740 \uACC4\uC18D\uC744 \uB20C\uB7EC\uB3C4 \uC0AC\uB77C\uC9C0\uC9C0 \uC54A\uACE0 \uBCF4\uAD00\uD568\uC5D0 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4",
      "D2 Survivors is still a beta, and it changes all the time. I read your feedback and keep improving the game, so now and then something may break: please bear with me. It's made by one person, in spare time, doing my best to make something you enjoy.": "D2 Survivors\uB294 \uC544\uC9C1 \uBCA0\uD0C0 \uBC84\uC804\uC774\uBA70, \uB298 \uBC14\uB00C\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC5EC\uB7EC\uBD84\uC758 \uC758\uACAC\uC744 \uC77D\uC73C\uBA70 \uAC8C\uC784\uC744 \uAFB8\uC900\uD788 \uB2E4\uB4EC\uACE0 \uC788\uC5B4, \uAC00\uB054 \uBB34\uC5B8\uAC00 \uACE0\uC7A5 \uB0A0 \uC218\uB3C4 \uC788\uC2B5\uB2C8\uB2E4. \uB108\uADF8\uB7EC\uC774 \uC591\uD574\uD574 \uC8FC\uC2ED\uC2DC\uC624. \uD55C \uC0AC\uB78C\uC774 \uB0A8\uB294 \uC2DC\uAC04\uC5D0, \uC5EC\uB7EC\uBD84\uC774 \uC990\uAE38 \uB9CC\uD55C \uAC8C\uC784\uC744 \uB9CC\uB4E4\uACE0\uC790 \uCD5C\uC120\uC744 \uB2E4\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      "Enter to choose - Esc to go back": "Enter: \uC120\uD0DD - Esc: \uB3CC\uC544\uAC00\uAE30",
      Fara: "\uD30C\uB77C",
      "GET THE DESKTOP APP": "\uB370\uC2A4\uD06C\uD1B1 \uC571 \uBC1B\uAE30",
      "Gear you drop stays on the ground until you've walked well away from it, not picked straight back up": "\uBC84\uB9B0 \uC7A5\uBE44\uB294 \uACE7\uBC14\uB85C \uB2E4\uC2DC \uC90D\uC9C0 \uC54A\uACE0, \uCDA9\uBD84\uD788 \uBA40\uC5B4\uC84C\uB2E4\uAC00 \uB3CC\uC544\uC640\uC57C \uB2E4\uC2DC \uC90D\uC2B5\uB2C8\uB2E4",
      "Grim Shield takes 2\xD73 cells, and Swirling Crystal and Dimensional Shard 1\xD73, as in D2": "\uADF8\uB9BC \uC274\uB4DC\uB294 D2\uCC98\uB7FC 2\xD73\uCE78, \uC2A4\uC6D4\uB9C1 \uD06C\uB9AC\uC2A4\uD0C8\uACFC \uB514\uBA58\uC154\uB110 \uC0E4\uB4DC\uB294 1\xD73\uCE78\uC744 \uCC28\uC9C0\uD569\uB2C8\uB2E4",
      Halbu: "\uD560\uBD80",
      Hratli: "\uD750\uB77C\uD2C0\uB9AC",
      "Keep your gold, Charsi's upgrades and gear, or carry them to the desktop app, another browser or another device.": "\uACE8\uB4DC\uC640 \uCC30\uC2DC\uC758 \uC5C5\uADF8\uB808\uC774\uB4DC, \uC7A5\uBE44\uB97C \uBCF4\uAD00\uD558\uAC70\uB098, \uB370\uC2A4\uD06C\uD1B1 \uC571\uC774\uB098 \uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800, \uB2E4\uB978 \uAE30\uAE30\uB85C \uC62E\uAE41\uB2C8\uB2E4.",
      "Into the stash:": "\uBCF4\uAD00\uD568\uC73C\uB85C:",
      Larzuk: "\uB77C\uC8FC\uD06C",
      "Life shows in whole points again with Charsi's Vitality ranks past the maximum": "\uCD5C\uB300\uCE58\uB97C \uB118\uAE34 \uCC30\uC2DC\uC758 \uD65C\uB825 \uB4F1\uAE09\uC774 \uC788\uC5B4\uB3C4 \uC0DD\uBA85\uB825\uC774 \uB2E4\uC2DC \uC815\uC218\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4",
      "Louder at full volume: quiet areas no longer sound faint, and big fights still don't blast": "\uCD5C\uB300 \uC74C\uB7C9\uC774 \uB354 \uCEE4\uC84C\uC2B5\uB2C8\uB2E4: \uC870\uC6A9\uD55C \uC9C0\uC5ED\uB3C4 \uC791\uAC8C \uB4E4\uB9AC\uC9C0 \uC54A\uC73C\uBA70, \uD070 \uC804\uD22C\uB294 \uC5EC\uC804\uD788 \uC2DC\uB044\uB7FD\uAC8C \uC6B8\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "Button *": "\uBC84\uD2BC {0}",
      Circle: "\u25CB\uBC84\uD2BC",
      CONTROLLER: "\uCEE8\uD2B8\uB864\uB7EC",
      "Controller support: play a whole run and every menu with a gamepad, with D2R's layout, rumble, and its buttons rebound in Options": "\uCEE8\uD2B8\uB864\uB7EC \uC9C0\uC6D0: \uAC8C\uC784\uD328\uB4DC\uB85C \uAC8C\uC784 \uC804\uCCB4\uC640 \uBAA8\uB4E0 \uBA54\uB274\uB97C \uD50C\uB808\uC774\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. D2R\uC758 \uBC84\uD2BC \uBC30\uCE58\uC640 \uC9C4\uB3D9\uC744 \uC9C0\uC6D0\uD558\uBA70, \uC635\uC158\uC5D0\uC11C \uBC84\uD2BC\uC744 \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      Create: "\uB9CC\uB4E4\uAE30",
      Cross: "\xD7\uBC84\uD2BC",
      "D-pad Down": "\uBC29\uD5A5 \uBC84\uD2BC \uC544\uB798",
      "D-pad Left": "\uBC29\uD5A5 \uBC84\uD2BC \uC67C\uCABD",
      "D-pad Right": "\uBC29\uD5A5 \uBC84\uD2BC \uC624\uB978\uCABD",
      "D-pad Up": "\uBC29\uD5A5 \uBC84\uD2BC \uC704",
      "Enter to choose, then press a button - Esc to go back": "Enter: \uC120\uD0DD \uD6C4 \uBC84\uD2BC \uB204\uB974\uAE30 - Esc: \uB3CC\uC544\uAC00\uAE30",
      Equip: "\uC7A5\uCC29",
      INTERACT: "\uC0C1\uD638\uC791\uC6A9",
      Menu: "\uBA54\uB274",
      Minus: "\uB9C8\uC774\uB108\uC2A4",
      "No room in this tab": "\uC774 \uD0ED\uC5D0 \uACF5\uAC04\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      "On a slow connection a new act no longer freezes the run, and an act boss whose art comes late takes his real look instead of staying a white shape": "\uC5F0\uACB0\uC774 \uB290\uB9B4 \uB54C \uC0C8 \uB9C9\uC5D0\uC11C \uAC8C\uC784\uC774 \uB354 \uC774\uC0C1 \uBA48\uCD94\uC9C0 \uC54A\uC73C\uBA70, \uADF8\uB9BC\uC774 \uB2A6\uAC8C \uB3C4\uCC29\uD55C \uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uD770 \uB3C4\uD615\uC73C\uB85C \uB0A8\uC9C0 \uC54A\uACE0 \uBCF8\uBAA8\uC2B5\uC73C\uB85C \uBC14\uB01D\uB2C8\uB2E4",
      "On the credits, the X button sits on the right, opposite EXIT": "\uC81C\uC791\uC9C4 \uD654\uBA74\uC758 X \uBC84\uD2BC\uC774 \uB098\uAC00\uAE30 \uBC18\uB300\uD3B8\uC778 \uC624\uB978\uCABD\uC5D0 \uC788\uC2B5\uB2C8\uB2E4",
      "Only this hero can reach it": "\uC774 \uC601\uC6C5\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      "Open a save file": "\uC800\uC7A5 \uD30C\uC77C \uC5F4\uAE30",
      Personal: "\uAC1C\uC778",
      Pick: "\uACE0\uB974\uAE30",
      "PICK SKILL LEFT": "\uAE30\uC220 \uC120\uD0DD (\uC67C\uCABD)",
      "PICK SKILL RIGHT": "\uAE30\uC220 \uC120\uD0DD (\uC624\uB978\uCABD)",
      "Pick up": "\uC90D\uAE30",
      PLAY: "\uD50C\uB808\uC774",
      Plus: "\uD50C\uB7EC\uC2A4",
      "PRESS A BUTTON": "\uBC84\uD2BC\uC744 \uB204\uB974\uC138\uC694",
      "Press the button for it": "\uC9C0\uC815\uD560 \uBC84\uD2BC\uC744 \uB204\uB974\uC138\uC694",
      "Put back": "\uB418\uB3CC\uB9AC\uAE30",
      "Put down": "\uB0B4\uB824\uB193\uAE30",
      "RESET TO DEFAULTS": "\uAE30\uBCF8\uAC12\uC73C\uB85C \uCD08\uAE30\uD654",
      "REST SKILL": "\uAE30\uC220 \uD734\uC2DD",
      RESUME: "\uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      RUMBLE: "\uC9C4\uB3D9",
      "SAVE AND EXIT": "\uC800\uC7A5 \uD6C4 \uB098\uAC00\uAE30",
      "Save as a file": "\uD30C\uC77C\uB85C \uC800\uC7A5",
      SAVES: "\uC800\uC7A5 \uB370\uC774\uD130",
      "SAVES on the main menu keeps your progress as a file or a code, and brings it into the desktop app or another browser.": "\uBA54\uC778 \uBA54\uB274\uC758 \uC800\uC7A5 \uB370\uC774\uD130\uC5D0\uC11C \uC9C4\uD589 \uC0C1\uD669\uC744 \uD30C\uC77C\uC774\uB098 \uCF54\uB4DC\uB85C \uBCF4\uAD00\uD558\uACE0, \uB370\uC2A4\uD06C\uD1B1 \uC571\uC774\uB098 \uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800\uB85C \uAC00\uC838\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "SAVES on the main menu keeps your progress as a file or a code, and imports either one, on the website and in the desktop app": "\uBA54\uC778 \uBA54\uB274\uC758 \uC800\uC7A5 \uB370\uC774\uD130\uC5D0\uC11C \uC9C4\uD589 \uC0C1\uD669\uC744 \uD30C\uC77C\uC774\uB098 \uCF54\uB4DC\uB85C \uBCF4\uAD00\uD558\uACE0, \uC6F9\uC0AC\uC774\uD2B8\uC640 \uB370\uC2A4\uD06C\uD1B1 \uC571 \uBAA8\uB450\uC5D0\uC11C \uB458 \uC911 \uD558\uB098\uB85C \uAC00\uC838\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      Select: "\uC120\uD0DD",
      Shared: "\uACF5\uC720",
      "SOUND OPTIONS": "\uC0AC\uC6B4\uB4DC \uC124\uC815",
      START: "\uC2DC\uC791",
      "Tap a line to choose": "\uC904\uC744 \uB20C\uB7EC \uC120\uD0DD",
      "That file couldn't be read.": "\uD30C\uC77C\uC744 \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "That file is too big to be a save.": "\uC800\uC7A5 \uD30C\uC77C\uC774\uB77C\uAE30\uC5D0\uB294 \uB108\uBB34 \uD070 \uD30C\uC77C\uC785\uB2C8\uB2E4.",
      "The act's blacksmith stands by the portal (Charsi, Fara, Hratli, Halbu): walk up to sell, buy, gamble and use the stash, the game held meanwhile": "\uB9C9\uC758 \uB300\uC7A5\uC7A5\uC774(\uCC30\uC2DC, \uD30C\uB77C, \uD750\uB77C\uD2C0\uB9AC, \uD560\uBD80)\uAC00 \uCC28\uC6D0\uBB38 \uC606\uC5D0 \uC11C \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uAC00\uAC00\uBA74 \uD310\uB9E4, \uAD6C\uB9E4, \uB3C4\uBC15\uACFC \uBCF4\uAD00\uD568\uC744 \uC774\uC6A9\uD560 \uC218 \uC788\uACE0, \uADF8\uB3D9\uC548 \uAC8C\uC784\uC740 \uBA48\uCDA5\uB2C8\uB2E4",
      "The campfire's START waits for a hero: pick one at the fire, then START (or Enter) begins the run": "\uBAA8\uB2E5\uBD88\uC758 \uC2DC\uC791 \uBC84\uD2BC\uC740 \uC601\uC6C5\uC744 \uAE30\uB2E4\uB9BD\uB2C8\uB2E4: \uBAA8\uB2E5\uBD88 \uACC1\uC758 \uC601\uC6C5\uC744 \uACE0\uB978 \uB2E4\uC74C \uC2DC\uC791(\uB610\uB294 Enter)\uC744 \uB204\uB974\uBA74 \uAC8C\uC784\uC774 \uC2DC\uC791\uB429\uB2C8\uB2E4",
      "The Esc menu reads RESUME, OPTIONS, REPORT, SAVE AND EXIT, and Esc resumes": "Esc \uBA54\uB274\uAC00 \uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30, \uC124\uC815, \uC81C\uBCF4, \uC800\uC7A5 \uD6C4 \uB098\uAC00\uAE30 \uC21C\uC11C\uAC00 \uB418\uC5C8\uC73C\uBA70, Esc\uB97C \uB204\uB974\uBA74 \uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4",
      "Your saves": "\uC800\uC7A5 \uB370\uC774\uD130",
      "Increased Speed and Burst of Speed follow D2's curve: a lot at first, then less, no longer a rocket with +skills": "\uC18D\uB3C4 \uC99D\uAC00\uC640 \uD3ED\uBC1C\uC801\uC778 \uC18D\uB3C4\uAC00 D2\uC758 \uACE1\uC120\uC744 \uB530\uB985\uB2C8\uB2E4: \uCC98\uC74C\uC5D4 \uD06C\uAC8C, \uC774\uD6C4\uC5D4 \uC801\uAC8C \uC62C\uB77C +\uAE30\uC220\uB85C\uB3C4 \uB354\uB294 \uB85C\uCF13\uCC98\uB7FC \uB2EC\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "+Life and Life per Level on gear give twice as much, D2's share of your life": "\uC7A5\uBE44\uC758 +\uC0DD\uBA85\uB825\uACFC \uB808\uBCA8\uB2F9 \uC0DD\uBA85\uB825\uC774 \uB450 \uBC30\uB85C, D2\uC5D0\uC11C \uC0DD\uBA85\uB825\uC5D0 \uCC28\uC9C0\uD558\uB294 \uBAAB\uB9CC\uD07C \uB298\uC5B4\uB0A9\uB2C8\uB2E4",
      "Deadly Strike rolls after a critical strike misses, as in D2, instead of adding to its chance": "\uCE58\uBA85\uD0C0\uAC00 \uD130\uC9C0\uC9C0 \uC54A\uC558\uC744 \uB54C \uCE58\uBA85\uC801 \uACF5\uACA9\uC744 \uB530\uB85C \uAD74\uB9BD\uB2C8\uB2E4: \uD655\uB960\uC5D0 \uB354\uD558\uC9C0 \uC54A\uACE0 D2\uCC98\uB7FC",
      "Magic Damage Reduced also takes its points off fire, cold and lightning hits, before your resistance": "\uB9C8\uBC95 \uD53C\uD574 \uAC10\uC18C\uAC00 \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uACF5\uACA9\uC5D0\uB3C4 \uC800\uD56D\uBCF4\uB2E4 \uBA3C\uC800 \uC801\uC6A9\uB429\uB2C8\uB2E4",
      "Faster Block Rate shortens a block as much as in D2": "\uB9C9\uAE30 \uC18D\uB3C4\uAC00 D2\uB9CC\uD07C \uB9C9\uAE30 \uB3D9\uC791\uC744 \uC904\uC785\uB2C8\uB2E4",
      "Life Stolen goes by the damage a monster takes: less from physically resistant ones, none from immunes": "\uC0DD\uBA85\uB825 \uD6D4\uCE58\uAE30\uAC00 \uAD34\uBB3C\uC774 \uBC1B\uC740 \uD53C\uD574\uB97C \uB530\uB985\uB2C8\uB2E4: \uBB3C\uB9AC \uC800\uD56D\uC774 \uC788\uC73C\uBA74 \uC801\uAC8C, \uBA74\uC5ED\uC774\uBA74 \uC5C6\uC74C",
      "-% to Enemy Resistance lowers a monster's resistance, as in D2, instead of adding damage": "\uC801 \uC800\uD56D -%\uAC00 \uD53C\uD574\uB97C \uB354\uD558\uB294 \uB300\uC2E0 D2\uCC98\uB7FC \uAD34\uBB3C\uC758 \uC800\uD56D\uC744 \uB0AE\uCDA5\uB2C8\uB2E4",
      "Damage +N on The Redeemer and Astreon's Iron Ward now works": "\uAD6C\uC6D0\uC790\uC640 \uC544\uC2A4\uD2B8\uB808\uC628\uC758 \uBB34\uC1E0 \uD638\uC2E0\uBD80\uC758 \uD53C\uD574 +N\uC774 \uC774\uC81C \uC801\uC6A9\uB429\uB2C8\uB2E4",
      "Open Wounds and Crushing Blow follow D2 on champions, uniques and past level 60": "\uC0C1\uCC98 \uC545\uD654\uC640 \uAC15\uD0C0\uAC00 \uCC54\uD53C\uC5B8, \uACE0\uC720 \uAD34\uBB3C, 60\uB808\uBCA8 \uC774\uD6C4\uC5D0\uB3C4 D2\uB97C \uB530\uB985\uB2C8\uB2E4",
      "The mana globe counts Increase Maximum Mana on your own mana only, as D2 does": "\uB9C8\uB098 \uAD6C\uC2AC\uC774 \uCD5C\uB300 \uB9C8\uB098 \uC99D\uAC00\uB97C D2\uCC98\uB7FC \uC790\uC2E0\uC758 \uB9C8\uB098\uC5D0\uB9CC \uC801\uC6A9\uD574 \uC149\uB2C8\uB2E4",
      "The game downloads less as you play, so its monsters and music come in sooner": "\uAC8C\uC784\uC774 \uD50C\uB808\uC774 \uC911 \uB0B4\uB824\uBC1B\uB294 \uC591\uC774 \uC904\uC5B4, \uAD34\uBB3C\uACFC \uC74C\uC545\uC774 \uB354 \uBE68\uB9AC \uBD88\uB7EC\uC640\uC9D1\uB2C8\uB2E4",
      "d2survivors.lol opens on a page of its own: what the game is, the desktop app and the news. The game is at d2survivors.lol/play/, where returning players go straight away": "d2survivors.lol\uC774 \uC18C\uAC1C \uD398\uC774\uC9C0\uB85C \uC2DC\uC791\uD569\uB2C8\uB2E4: \uAC8C\uC784 \uC18C\uAC1C, \uB370\uC2A4\uD06C\uD1B1 \uC571, \uC0C8 \uC18C\uC2DD. \uAC8C\uC784\uC740 d2survivors.lol/play/\uC5D0 \uC788\uC73C\uBA70, \uAE30\uC874 \uD50C\uB808\uC774\uC5B4\uB294 \uBC14\uB85C \uAC8C\uC784\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4",
      "\u2190 \u2192 to choose \xB7 Enter to continue \xB7 N for a new run": "\u2190 \u2192: \uC120\uD0DD \xB7 Enter: \uC774\uC5B4\uD558\uAE30 \xB7 N: \uC0C8 \uAC8C\uC784",
      "\u2190 \u2192 to choose \xB7 Enter to play": "\u2190 \u2192: \uC120\uD0DD \xB7 Enter: \uC2DC\uC791",
      "+* starting * per rank *": "\uB2E8\uACC4\uB2F9 \uC2DC\uC791 {1} +{0}\n{2}",
      "+* to *": "+{0} {1}",
      "+* to * (* Only)": "+{0} {1} ({2} \uC804\uC6A9)",
      "+* to * *": "+{0} {1} {2}",
      "+* to * Skill Levels": "+{0} {1} \uAE30\uC220 \uB808\uBCA8",
      "+* to Life per Level": "+{0} \uC0DD\uBA85\uB825 (\uB808\uBCA8\uB2F9)",
      "+* to Mana per Level": "+{0} \uB9C8\uB098 (\uB808\uBCA8\uB2F9)",
      "+* to Maximum Damage per Level": "+{0} \uCD5C\uB300 \uD53C\uD574 (\uB808\uBCA8\uB2F9)",
      "+* to Vitality per Level": "+{0} \uD65C\uB825 (\uB808\uBCA8\uB2F9)",
      "+*% *of *": "{1}{2} \uB808\uBCA8\uB2F9 +{0}%",
      "+*% Attack Rating against Demons": "+{0}% \uC545\uB9C8 \uB300\uC0C1 \uACF5\uACA9 \uB4F1\uAE09",
      "+*% Attack Rating against Undead": "+{0}% \uC5B8\uB370\uB4DC \uB300\uC0C1 \uACF5\uACA9 \uB4F1\uAE09",
      "+*% damage per level of *": "{1} \uB808\uBCA8\uB2F9 \uD53C\uD574 +{0}%",
      "+*% Damage to Demons per Level": "+{0}% \uC545\uB9C8\uC5D0\uAC8C \uC8FC\uB294 \uD53C\uD574 (\uB808\uBCA8\uB2F9)",
      "+*% per level of *": "{1} \uB808\uBCA8\uB2F9 +{0}%",
      "+*% per level of * and * more": "{1} \uC678 {2}\uAC1C \uB808\uBCA8\uB2F9 +{0}%",
      "+*% per level of * skills": "\uAE30\uC220 {1}\uAC1C \uB808\uBCA8\uB2F9 +{0}%",
      "+*% per level of * skills and passives": "\uAE30\uC220\xB7\uC9C0\uC18D \uD6A8\uACFC {1}\uAC1C \uB808\uBCA8\uB2F9 +{0}%",
      "+*% Pickup Radius": "+{0}% \uC90D\uAE30 \uBC18\uACBD",
      "+# cold damage": "+{0} \uB0C9\uAE30 \uD53C\uD574",
      "+# damage": "+{0} \uD53C\uD574",
      "+# fire damage": "+{0} \uD654\uC5FC \uD53C\uD574",
      "+# gold": "+{0} \uACE8\uB4DC",
      "+# life per second": "\uCD08\uB2F9 \uC0DD\uBA85\uB825 +{0}",
      "+# life per second per rank": "\uCD08\uB2F9 \uC0DD\uBA85\uB825 +{0} (\uB2E8\uACC4\uB2F9)",
      "+# lightning damage": "+{0} \uBC88\uAC1C \uD53C\uD574",
      "+# magic damage": "+{0} \uB9C8\uBC95 \uD53C\uD574",
      "+# points": "+{0} \uD3EC\uC778\uD2B8",
      "+# poison damage over # seconds": "+{0} \uB3C5 \uD53C\uD574 ({1}\uCD08\uC5D0 \uAC78\uCCD0)",
      "+# to Bow and Crossbow Skills": "+{0} \uD65C\uACFC \uC11D\uAD81 \uAE30\uC220",
      "+# to Cold Skills": "+{0} \uB0C9\uAE30 \uAE30\uC220",
      "+# to Combat Skills": "+{0} \uC804\uD22C \uAE30\uC220",
      "+# to Curses": "+{0} \uC800\uC8FC",
      "+# to Defensive Auras": "+{0} \uBC29\uC5B4 \uC624\uB77C",
      "+# to Elemental Skills": "+{0} \uC6D0\uC18C \uAE30\uC220",
      "+# to Fire Skills": "+{0} \uD654\uC5FC \uAE30\uC220",
      "+# to Javelin and Spear Skills": "+{0} \uD22C\uCC3D\uACFC \uCC3D \uAE30\uC220",
      "+# to Lightning Skills": "+{0} \uBC88\uAC1C \uAE30\uC220",
      "+# to Martial Arts": "+{0} \uBB34\uC220",
      "+# to Masteries": "+{0} \uC804\uD22C \uC219\uB828",
      "+# to Offensive Auras": "+{0} \uACF5\uACA9 \uC624\uB77C",
      "+# to Passive and Magic Skills": "+{0} \uC9C0\uC18D \uD6A8\uACFC\uC640 \uB9C8\uBC95 \uAE30\uC220",
      "+# to Poison and Bone Skills": "+{0} \uB3C5\uACFC \uBF08 \uAE30\uC220",
      "+# to Shadow Disciplines": "+{0} \uADF8\uB9BC\uC790 \uC218\uB828",
      "+# to Shape Shifting Skills": "+{0} \uBCC0\uC2E0 \uAE30\uC220",
      "+# to Summoning Skills": "+{0} \uC18C\uD658 \uAE30\uC220",
      "+# to Traps": "+{0} \uB36B",
      "+# to Warcries": "+{0} \uD568\uC131",
      "+#, skills +#": "+{0}, \uAE30\uC220 +{1}",
      "+#% better chance of magic items per rank": "+{0}% \uB9C8\uBC95 \uC544\uC774\uD15C \uBC1C\uACAC \uD655\uB960 \uC99D\uAC00 (\uB2E8\uACC4\uB2F9)",
      "+#% chance for arrows and javelins to fly on through what they hit": "\uD654\uC0B4\uACFC \uD22C\uCC3D\uC774 \uC801\uC744 \uAD00\uD1B5\uD560 \uD655\uB960 +{0}%",
      "+#% chance for her attacks (and the Valkyrie's) to deal double damage": "\uADF8\uB140(\uC640 \uBC1C\uD0A4\uB9AC)\uC758 \uACF5\uACA9\uC774 2\uBC30 \uD53C\uD574\uB97C \uC904 \uD655\uB960 +{0}%",
      "+#% chance to block a monster's hit with your claws": "\uC190\uD1B1\uC73C\uB85C \uAD34\uBB3C\uC758 \uACF5\uACA9\uC744 \uB9C9\uC744 \uD655\uB960 +{0}%",
      "+#% chance to sidestep a monster's blow while you stand still": "\uBA48\uCDB0 \uC788\uC744 \uB54C \uAD34\uBB3C\uC758 \uADFC\uC811 \uACF5\uACA9\uC744 \uD53C\uD560 \uD655\uB960 +{0}%",
      "+#% chance to sidestep a monster's hit while you're on the move": "\uC774\uB3D9 \uC911 \uAD34\uBB3C\uC758 \uACF5\uACA9\uC744 \uD53C\uD560 \uD655\uB960 +{0}%",
      "+#% chance to sidestep a monster's missile while you stand still": "\uBA48\uCDB0 \uC788\uC744 \uB54C \uAD34\uBB3C\uC758 \uC6D0\uAC70\uB9AC \uACF5\uACA9\uC744 \uD53C\uD560 \uD655\uB960 +{0}%",
      "+#% cold damage": "+{0}% \uB0C9\uAE30 \uD53C\uD574",
      "+#% cold damage and take #% less damage": "\uB0C9\uAE30 \uD53C\uD574 +{0}%, \uBC1B\uB294 \uD53C\uD574 {1}% \uAC10\uC18C",
      "+#% Faster Cast Rate": "+{0}% \uC2DC\uC804 \uC18D\uB3C4 \uC99D\uAC00",
      "+#% Faster Run/Walk": "+{0}% \uB2EC\uB9AC\uAE30/\uAC77\uAE30 \uC18D\uB3C4 \uC99D\uAC00",
      "+#% fire damage": "+{0}% \uD654\uC5FC \uD53C\uD574",
      "+#% fire damage; wereform claws burn with it": "\uD654\uC5FC \uD53C\uD574 +{0}%; \uBCC0\uC2E0 \uC0C1\uD0DC\uC758 \uBC1C\uD1B1\uC5D0\uB3C4 \uC801\uC6A9",
      "+#% gold": "+{0}% \uACE8\uB4DC",
      "+#% gold per rank": "+{0}% \uACE8\uB4DC (\uB2E8\uACC4\uB2F9)",
      "+#% lightning damage": "+{0}% \uBC88\uAC1C \uD53C\uD574",
      "+#% magic damage (Teeth, Bone Spear, Bone Spirit)": "+{0}% \uB9C8\uBC95 \uD53C\uD574 (\uC774\uBE68, \uBF08 \uCC3D, \uBF08 \uC601\uD63C)",
      "+#% magic find": "+{0}% \uB9C8\uBC95 \uC544\uC774\uD15C \uBC1C\uACAC",
      "+#% maximum life": "+{0}% \uCD5C\uB300 \uC0DD\uBA85\uB825",
      "+#% movement speed": "+{0}% \uC774\uB3D9 \uC18D\uB3C4",
      "+#% movement speed (up to +#%) and #% shorter cooldowns": "+{0}% \uC774\uB3D9 \uC18D\uB3C4 (\uCD5C\uB300 +{1}%), \uC7AC\uC0AC\uC6A9 \uB300\uAE30\uC2DC\uAC04 {2}% \uAC10\uC18C",
      "+#% movement speed, up to +#%": "+{0}% \uC774\uB3D9 \uC18D\uB3C4, \uCD5C\uB300 +{1}%",
      "+#% physical damage and +#% chance of a critical strike": "\uBB3C\uB9AC \uD53C\uD574 +{0}%, \uCE58\uBA85\uD0C0 \uD655\uB960 +{1}%",
      "+#% physical damage; as a werewolf, #% faster run (up to #%)": "\uBB3C\uB9AC \uD53C\uD574 +{0}%; \uB291\uB300\uC778\uAC04 \uC0C1\uD0DC\uC5D0\uC11C \uB2EC\uB9AC\uAE30 \uC18D\uB3C4 {1}% \uC99D\uAC00 (\uCD5C\uB300 {2}%)",
      "+#% poison damage": "+{0}% \uB3C5 \uD53C\uD574",
      "+#% to Maximum Cold Resist": "\uCD5C\uB300 \uB0C9\uAE30 \uC800\uD56D +{0}%",
      "+1 to *": "+1 {0}",
      "+1% chance of a critical strike, +3% Attack Damage": "\uCE58\uBA85\uD0C0 \uD655\uB960 +1%, \uACF5\uACA9 \uD53C\uD574 +3%",
      "+1% critical strike chance +3% Attack Damage": "\uCE58\uBA85\uD0C0 \uD655\uB960 +1%\n\uACF5\uACA9 \uD53C\uD574 +3%",
      "+20 maximum life": "\uCD5C\uB300 \uC0DD\uBA85\uB825 +20",
      "+20 to 40 maximum life": "\uCD5C\uB300 \uC0DD\uBA85\uB825 +20-40",
      "+20 to 40 maximum life, by class": "\uCD5C\uB300 \uC0DD\uBA85\uB825 +20-40 (\uD074\uB798\uC2A4\uBCC4)",
      "+5% fire, cold, lightning, poison and magic damage": "\uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB3C5, \uB9C8\uBC95 \uD53C\uD574 +5%",
      "+5% physical damage": "\uBB3C\uB9AC \uD53C\uD574 +5%",
      "a bash": "\uAC15\uACA9\uB2F9",
      "a blade": "\uCE7C\uB0A0\uB2F9",
      "A blast of the mind over the nearest pack, # damage and a #s stun to all in it": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC\uC5D0 \uC815\uC2E0 \uD3ED\uBC1C, \uBB34\uB9AC \uC804\uCCB4\uC5D0 {0} \uD53C\uD574\uC640 {1}\uCD08 \uAE30\uC808",
      "a blow": "\uD0C0\uACA9\uB2F9",
      "A blow at the toughest monster in reach, # damage, stunning it for #s (bosses less)": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC744 \uACF5\uACA9, {0} \uD53C\uD574, {1}\uCD08\uAC04 \uAE30\uC808 (\uC6B0\uB450\uBA38\uB9AC\uB294 \uC9E7\uAC8C)",
      "A blow at the toughest monster in reach: # fire, cold and lightning each, half to those beside": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC744 \uACF5\uACA9: \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uAC01 {0}, \uC606\uC758 \uC801\uC5D0\uAC8C\uB294 \uC808\uBC18",
      "a blow back": "\uBC18\uACA9\uB2F9",
      "a blow of the mind": "\uC815\uC2E0 \uD0C0\uACA9\uB2F9",
      "A blow of the mind at #, # damage, knocking them back": "\uAD34\uBB3C {0}\uB9C8\uB9AC\uC5D0\uAC8C \uC815\uC2E0\uC758 \uC77C\uACA9, {1} \uD53C\uD574, \uBC00\uCCD0\uB0C4",
      "a blow, on the dash or at its end": "\uB3CC\uC9C4 \uC911 \uB610\uB294 \uB05D\uC758 \uD0C0\uACA9\uB2F9",
      "a bolt": "\uD0C4\uB2F9",
      "a bolt from the sky": "\uD558\uB298\uC5D0\uC11C \uB0B4\uB9AC\uCE58\uB294 \uBCBC\uB77D\uB2F9",
      "a bolt or blow back": "\uD0C4 \uB610\uB294 \uBC18\uACA9\uB2F9",
      "a bomb": "\uD3ED\uD0C4\uB2F9",
      "A bomb thrown at the nearest monster, bursting for # fire damage around it": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uD3ED\uD0C4 \uD22C\uCC99, \uC8FC\uBCC0\uC5D0 {0} \uD654\uC5FC \uD53C\uD574",
      "a boulder": "\uBC14\uC704\uB2F9",
      "a burst": "\uD3ED\uBC1C\uB2F9",
      "a burst of fire, cold or lightning": "\uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uD3ED\uBC1C\uB2F9",
      "A carrion vine eats corpses near you, each healing # life + #% of maximum; # poison creepers": "\uCCAD\uC18C\uBD80 \uB369\uAD74\uC774 \uC8FC\uBCC0 \uC2DC\uCCB4\uB97C \uBA39\uC74C, \uD558\uB098\uB2F9 \uC0DD\uBA85\uB825 {0} + \uCD5C\uB300\uCE58\uC758 {1}% \uD68C\uBCF5; \uB9F9\uB3C5 \uB369\uAD74 {2}",
      "A charged thrust at the toughest monster in reach, # damage; # bolts crackle on from it, # each": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uC804\uB958 \uCC0C\uB974\uAE30, {0} \uD53C\uD574; \uBC88\uAC1C \uC904\uAE30 {1}\uAC1C\uAC00 \uD37C\uC838 \uB098\uAC10, \uAC01 {2}",
      "a claw": "\uD560\uD034\uAE30\uB2F9",
      "a claw blow": "\uC190\uD1B1 \uD0C0\uACA9\uB2F9",
      "A code from another browser replaces this browser's save.": "\uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800\uC758 \uCF54\uB4DC\uB294 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC758 \uC800\uC7A5 \uB370\uC774\uD130\uB97C \uB300\uCCB4\uD569\uB2C8\uB2E4.",
      "A corpse by the nearest monster bursts into poison: # over #s to all within #": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C \uC606\uC758 \uC2DC\uCCB4\uAC00 \uB3C5\uC73C\uB85C \uD3ED\uBC1C: {2} \uC548\uC758 \uBAA8\uB450\uC5D0\uAC8C {1}\uCD08\uAC04 {0} \uB3C5 \uD53C\uD574",
      "A crushing blow at the toughest monster in reach, # damage, knocking it back": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uAC15\uD55C \uD0C0\uACA9, {0} \uD53C\uD574, \uBC00\uCCD0\uB0C4",
      "a cut": "\uBCA0\uAE30\uB2F9",
      "a cut or a thrown blade": "\uBCA0\uAE30 \uB610\uB294 \uB358\uC9C4 \uCE7C\uB0A0\uB2F9",
      "a dire wolf's bite": "\uAD11\uD3EC\uD55C \uB291\uB300\uC758 \uBB3C\uAE30\uB2F9",
      "A fan of # arrows, # damage each": "\uBD80\uCC44\uAF34\uB85C \uD654\uC0B4 {0}\uBC1C, \uAC01 {1} \uD53C\uD574",
      "A fan of # teeth at the nearest monster, # damage each": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uC774\uBE68 {0}\uAC1C\uB97C \uBD80\uCC44\uAF34\uB85C \uBC1C\uC0AC, \uAC01 {1} \uD53C\uD574",
      "a fire ball": "\uD654\uC5FC\uAD6C\uB2F9",
      "a flame": "\uBD88\uAE38\uB2F9",
      "A focused blow at the toughest monster in reach, # damage, splashing # to those beside it": "\uB2FF\uB294 \uBC94\uC704\uC758 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uC9D1\uC911 \uD0C0\uACA9, {0} \uD53C\uD574, \uC606\uC758 \uC801\uC5D0\uAC8C {1}",
      "A fresh Nightmare or Hell run, started without the hero who beat Baal, is harder: its monsters are tougher and hit in full, and its act bosses stand longer": "\uBC14\uC54C\uC744 \uCC98\uCE58\uD55C \uC601\uC6C5 \uC5C6\uC774 \uC0C8\uB85C \uC2DC\uC791\uD55C \uC545\uBABD\uC774\uB098 \uC9C0\uC625 \uAC8C\uC784\uC774 \uB354 \uC5B4\uB824\uC6CC\uC9D1\uB2C8\uB2E4: \uAD34\uBB3C\uC774 \uB354 \uAC15\uC778\uD558\uACE0 \uC628\uC804\uD55C \uD53C\uD574\uB97C \uC8FC\uBA70, \uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uB354 \uC624\uB798 \uBC84\uD301\uB2C8\uB2E4",
      "A fresh Nightmare or Hell run levels up faster again, so the gear you bring comes on within minutes": "\uC0C8\uB85C \uC2DC\uC791\uD55C \uC545\uBABD\uC774\uB098 \uC9C0\uC625 \uAC8C\uC784\uC5D0\uC11C \uB2E4\uC2DC \uB808\uBCA8\uC774 \uB354 \uBE68\uB9AC \uC62C\uB77C, \uAC00\uC838\uC628 \uC7A5\uBE44\uAC00 \uBA87 \uBD84 \uC548\uC5D0 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4",
      "A golem of blood, # life, # damage; every blow it lands heals you for #% of it": "\uD53C \uACE8\uB818, \uC0DD\uBA85\uB825 {0}, \uD53C\uD574 {1}; \uBA85\uC911\uD55C \uD53C\uD574\uC758 {2}%\uB9CC\uD07C \uB2F9\uC2E0\uC758 \uC0DD\uBA85\uB825 \uD68C\uBCF5",
      "A golem of clay holds the horde back and slows what it hits, # life, # damage": "\uC810\uD1A0 \uACE8\uB818\uC774 \uBB34\uB9AC\uB97C \uB9C9\uACE0 \uB9DE\uC740 \uC801\uC744 \uB454\uD654, \uC0DD\uBA85\uB825 {0}, \uD53C\uD574 {1}",
      "A golem of fire, # life, # damage, with a Holy Fire aura that burns everything near it": "\uD654\uC5FC \uACE8\uB818, \uC0DD\uBA85\uB825 {0}, \uD53C\uD574 {1}, \uC8FC\uBCC0 \uBAA8\uB450\uB97C \uD0DC\uC6B0\uB294 \uC2E0\uC131\uD55C \uBD88\uAF43 \uC624\uB77C",
      "A golem of iron, # life, # damage, with a Thorns aura: what strikes it takes back #% of the blow": "\uAC15\uCCA0 \uACE8\uB818, \uC0DD\uBA85\uB825 {0}, \uD53C\uD574 {1}, \uAC00\uC2DC \uC624\uB77C: \uACF5\uACA9\uD55C \uC801\uC774 \uD53C\uD574\uC758 {2}%\uB97C \uB3CC\uB824\uBC1B\uC74C",
      "A grizzly, # damage a swipe, and the pack +#% damage; with # dire wolves, # spirit wolves and # ravens": "\uD68C\uC0C9\uACF0 \uC18C\uD658, \uD560\uD034\uAE30\uB2F9 {0} \uD53C\uD574, \uBB34\uB9AC \uD53C\uD574 +{1}%; \uAD11\uD3EC\uD55C \uB291\uB300 {2}, \uC601\uD63C \uB291\uB300 {3}, \uD070\uAE4C\uB9C8\uADC0 {4} \uB3D9\uBC18",
      "a gust": "\uB3CC\uD48D\uB2F9",
      "a hammer": "\uB9DD\uCE58\uB2F9",
      "A heavy blow at the toughest monster in reach, # damage; each costs you #% of your life, held back below #% life": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uBB35\uC9C1\uD55C \uC77C\uACA9, {0} \uD53C\uD574; \uB9E4\uBC88 \uC0DD\uBA85\uB825 {1}% \uC18C\uBAA8, \uC0DD\uBA85\uB825 {2}% \uBBF8\uB9CC\uC774\uBA74 \uBA48\uCDA4",
      "A heavy spear thrust at the toughest monster in reach, # damage, # to a boss": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uAC15\uD55C \uCC3D \uCC0C\uB974\uAE30, {0} \uD53C\uD574, \uC6B0\uB450\uBA38\uB9AC\uC5D0\uAC8C {1}",
      "a hit of his spin": "\uD68C\uC804 \uD0C0\uACA9\uB2F9",
      "A hit, and a second:": "1\uD68C \uD0C0\uACA9, \uCD08\uB2F9:",
      "a javelin": "\uD22C\uCC3D\uB2F9",
      "a javelin, or its burst's poison over *s": "\uD22C\uCC3D \uB610\uB294 {0}\uCD08\uAC04\uC758 \uD3ED\uBC1C \uB3C5\uB2F9",
      "a javelin, or its poison over *s": "\uD22C\uCC3D \uB610\uB294 {0}\uCD08\uAC04\uC758 \uB3C5\uB2F9",
      "A jet of flame at the nearest monster within #: # flames, # damage each to all in its path": "{0} \uC548\uC758 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uD654\uC5FC \uBD84\uC0AC: \uBD88\uAE38 {1}\uC904\uAE30, \uACBD\uB85C\uC0C1 \uBAA8\uB450\uC5D0\uAC8C \uAC01 {2} \uD53C\uD574",
      "a kick": "\uBC1C\uCC28\uAE30\uB2F9",
      "A kick at the toughest in reach, # damage, exploding in fire for # around, releasing all charges": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC5D0\uAC8C \uBC1C\uCC28\uAE30, {0} \uD53C\uD574, \uD654\uC5FC \uD3ED\uBC1C\uB85C \uC8FC\uBCC0\uC5D0 {1}, \uBAA8\uB4E0 \uCDA9\uC804 \uBC29\uCD9C",
      "a kick or its fire": "\uBC1C\uCC28\uAE30 \uB610\uB294 \uD654\uC5FC\uB2F9",
      "A level past a #'s maximum still adds to it, as in D2": "{0}\uC758 \uCD5C\uB300 \uB808\uBCA8\uC744 \uB118\uC740 \uB808\uBCA8\uB3C4 D2\uCC98\uB7FC \uACC4\uC18D \uC801\uC6A9\uB428",
      "a mage's bolt": "\uD574\uACE8 \uB9C8\uBC95\uD559\uC790\uC758 \uD0C4\uB2F9",
      "a meteor": "\uC6B4\uC11D\uB2F9",
      "a monster around you": "\uC8FC\uC704 \uAD34\uBB3C\uB2F9",
      "a monster in it": "\uBC94\uC704 \uC548\uC758 \uAD34\uBB3C\uB2F9",
      "a monster in the blast": "\uD3ED\uBC1C \uBC94\uC704\uC758 \uAD34\uBB3C\uB2F9",
      "a monster in the ring": "\uACE0\uB9AC \uC548\uC758 \uAD34\uBB3C\uB2F9",
      "a monster it lands among": "\uCC29\uC9C0 \uC9C0\uC810\uC758 \uAD34\uBB3C\uB2F9",
      "a paw": "\uC55E\uBC1C \uD0C0\uACA9\uB2F9",
      "A portal to # has opened": "{0}(\uC73C)\uB85C \uAC00\uB294 \uCC28\uC6D0\uBB38\uC774 \uC5F4\uB838\uC2B5\uB2C8\uB2E4",
      "A portal to Act # has opened": "{0}\uB9C9\uC73C\uB85C \uAC00\uB294 \uCC28\uC6D0\uBB38\uC774 \uC5F4\uB838\uC2B5\uB2C8\uB2E4",
      "A rapid volley of # arrows spread over the monsters around you, # damage each": "\uC8FC\uC704 \uAD34\uBB3C\uC5D0\uAC8C \uD654\uC0B4 {0}\uBC1C\uC744 \uBE60\uB974\uAC8C \uC5F0\uC0AC, \uAC01 {1} \uD53C\uD574",
      "a raven's peck": "\uD070\uAE4C\uB9C8\uADC0\uC758 \uCABC\uAE30\uB2F9",
      "A reckless magic blow at the toughest in reach, # damage; you take #% more for a moment": "\uB2FF\uB294 \uBC94\uC704\uC758 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC5D0\uAC8C \uBB34\uBAA8\uD55C \uB9C8\uBC95 \uD0C0\uACA9, {0} \uD53C\uD574; \uC7A0\uC2DC \uBC1B\uB294 \uD53C\uD574 {1}% \uC99D\uAC00",
      "A ring of frost out to # range, # damage, chilling all it touches for #s": "{0} \uBC94\uC704\uAE4C\uC9C0 \uD37C\uC9C0\uB294 \uC11C\uB9AC \uACE0\uB9AC, {1} \uD53C\uD574, \uB2FF\uC740 \uBAA8\uB450\uC5D0\uAC8C {2}\uCD08\uAC04 \uC624\uD55C",
      "A ring of lightning out to # range, # damage": "{0} \uBC94\uC704\uAE4C\uC9C0 \uD37C\uC9C0\uB294 \uBC88\uAC1C \uACE0\uB9AC, {1} \uD53C\uD574",
      "A ring of poison out to #: # poison over #s to everything it touches": "{0}\uAE4C\uC9C0 \uD37C\uC9C0\uB294 \uB3C5\uC758 \uACE0\uB9AC: \uB2FF\uB294 \uBAA8\uB450\uC5D0\uAC8C {2}\uCD08\uAC04 {1} \uB3C5 \uD53C\uD574",
      "a rock": "\uB3CC\uB369\uC774\uB2F9",
      "A run continued into Nightmare and Hell meets their full strength, and its act bosses stand longer": "\uC545\uBABD\uACFC \uC9C0\uC625\uC73C\uB85C \uC774\uC5B4\uC9C4 \uAC8C\uC784\uC740 \uADF8 \uB09C\uC774\uB3C4\uC758 \uC628\uC804\uD55C \uD798\uC744 \uB9C8\uC8FC\uD558\uBA70, \uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uB354 \uC624\uB798 \uBC84\uD301\uB2C8\uB2E4",
      "A run started on Nightmare or Hell has its skill and passive slots from the start: 8 and 8 on Nightmare, 10 and 10 in Hell": "\uC545\uBABD\uC774\uB098 \uC9C0\uC625\uC5D0\uC11C \uC2DC\uC791\uD55C \uAC8C\uC784\uC740 \uCC98\uC74C\uBD80\uD130 \uADF8 \uB09C\uC774\uB3C4\uC758 \uAE30\uC220 \uCE78\uACFC \uC9C0\uC18D \uD6A8\uACFC \uCE78\uC744 \uAC16\uC2B5\uB2C8\uB2E4: \uC545\uBABD\uC740 8\uAC1C\uC529, \uC9C0\uC625\uC740 10\uAC1C\uC529",
      "A run starts as in D2, with only Attack and your starting weapon, and your first card comes at once: a first skill from each skill tree, so all six skill slots are yours to fill": "\uAC8C\uC784\uC774 D2\uCC98\uB7FC \uC2DC\uC791 \uBB34\uAE30\uB85C \uD558\uB294 \uACF5\uACA9\uB9CC\uC73C\uB85C \uC2DC\uC791\uD558\uACE0, \uCCAB \uCE74\uB4DC\uAC00 \uBC14\uB85C \uB098\uC635\uB2C8\uB2E4: \uAE30\uC220 \uD2B8\uB9AC\uB9C8\uB2E4 \uCCAB \uAE30\uC220 \uD558\uB098\uC529\uC774\uBA70, \uAE30\uC220 \uCE78 \uC5EC\uC12F \uAC1C\uB294 \uBAA8\uB450 \uB2F9\uC2E0\uC774 \uCC44\uC6C1\uB2C8\uB2E4",
      "a second of a bite's poison": "\uBB3C\uAE30 \uB3C5 1\uCD08\uB2F9",
      "a second of its poison": "\uB3C5 1\uCD08\uB2F9",
      "A sentry fires lightning # times, # damage, and blows up a corpse near it each time for # plus #% of its life": "\uD30C\uC218\uAE30\uAC00 \uBC88\uAC1C\uB97C {0}\uD68C \uBC1C\uC0AC, {1} \uD53C\uD574, \uB9E4\uBC88 \uADFC\uCC98 \uC2DC\uCCB4\uB97C \uD3ED\uD30C\uD574 {2} + \uC2DC\uCCB4 \uC0DD\uBA85\uB825\uC758 {3}% \uD53C\uD574",
      "A sentry near the nearest pack fires # bursts of # charged bolts, # damage each": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC606\uC758 \uD30C\uC218\uAE30\uAC00 \uBC88\uAC1C \uC904\uAE30 {1}\uAC1C\uC529 {0}\uD68C \uBC1C\uC0AC, \uAC01 {2} \uD53C\uD574",
      "A sentry near the nearest pack fires lightning through monsters in line # times, # damage": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC606\uC758 \uD30C\uC218\uAE30\uAC00 \uC77C\uC9C1\uC120\uC758 \uAD34\uBB3C\uC744 \uAD00\uD1B5\uD558\uB294 \uBC88\uAC1C\uB97C {0}\uD68C \uBC1C\uC0AC, {1} \uD53C\uD574",
      "a shard": "\uD30C\uD3B8\uB2F9",
      "a skeleton's blow": "\uD574\uACE8\uC758 \uD0C0\uACA9\uB2F9",
      "a skill": "\uAE30\uC220",
      "a smite at what it blocks": "\uB9C9\uC544\uB0B8 \uC801\uC5D0 \uB300\uD55C \uAC15\uD0C0\uB2F9",
      "A solar creeper eats corpses: each speeds recharge #% for #s, up to #%; the vine and # creepers stay": "\uD0DC\uC591\uC758 \uB369\uAD74\uC774 \uC2DC\uCCB4\uB97C \uBA39\uC74C: \uD558\uB098\uB2F9 {1}\uCD08\uAC04 \uC7AC\uC0AC\uC6A9 \uC18D\uB3C4 {0}% \uC99D\uAC00, \uCD5C\uB300 {2}%; \uB369\uAD74 \uBCF8\uCCB4\uC640 \uB369\uAD74 {3}\uAC1C \uC720\uC9C0",
      "a spark": "\uBD88\uAF43\uB2F9",
      "a spear": "\uCC3D\uB2F9",
      "a spear thrust": "\uCC3D \uCC0C\uB974\uAE30\uB2F9",
      "A spear thrust at every monster around you in turn (up to #), # damage each": "\uC8FC\uC704 \uBAA8\uB4E0 \uAD34\uBB3C\uC744 \uCC28\uB840\uB85C \uCC3D\uC73C\uB85C \uCC0C\uB984 (\uCD5C\uB300 {0}), \uAC01 {1} \uD53C\uD574",
      "A spear thrust charged with lightning at the toughest monster in reach, # damage": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uBC88\uAC1C\uB97C \uC2E4\uC740 \uCC3D \uCC0C\uB974\uAE30, {0} \uD53C\uD574",
      "a spike": "\uAC00\uC2DC\uB2F9",
      "A spinning blade shuttles between you and the nearest pack for #s, # damage a cut": "\uD68C\uC804\uD558\uB294 \uCE7C\uB0A0\uC774 {0}\uCD08\uAC04 \uB2F9\uC2E0\uACFC \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC0AC\uC774\uB97C \uC624\uAC10, \uBCA0\uAE30\uB2F9 {1} \uD53C\uD574",
      "a spirit": "\uC601\uD63C\uB2F9",
      "a spirit wolf's bite": "\uC601\uD63C \uB291\uB300\uC758 \uBB3C\uAE30\uB2F9",
      "a spit": "\uBC1C\uC0AC\uB2F9",
      "a stomp or a blow": "\uBC1C\uAD6C\uB974\uAE30 \uB610\uB294 \uD0C0\uACA9\uB2F9",
      "a strike": "\uB099\uB8B0\uB2F9",
      "A three-headed hydra near the nearest pack for #s, spitting fire bolts, # damage each": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC606\uC5D0 {0}\uCD08\uAC04 \uBA38\uB9AC \uC14B\uC758 \uD788\uB4DC\uB77C, \uD654\uC5FC\uD0C4\uC744 \uBC49\uC74C, \uAC01 {1} \uD53C\uD574",
      "a thrust": "\uCC0C\uB974\uAE30\uB2F9",
      "a thrust at each monster around": "\uC8FC\uC704 \uAD34\uBB3C \uAC01\uAC01\uC5D0 \uCC0C\uB974\uAE30\uB2F9",
      "A thrust at the toughest monster in reach, # damage; lightning chains on through # more, # each": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC744 \uCC0C\uB984, {0} \uD53C\uD574; \uBC88\uAC1C\uAC00 {1}\uB9C8\uB9AC\uC5D0\uAC8C \uB354 \uC5F0\uC1C4, \uAC01 {2}",
      "a tick of a fire": "\uBD88\uAE38 \uD0C0\uACA9 1\uD68C\uB2F9",
      "a tick of a flame": "\uBD88\uAE38 \uD0C0\uACA9 1\uD68C\uB2F9",
      "a tick of a web": "\uADF8\uBB3C \uD0C0\uACA9 1\uD68C\uB2F9",
      "a tick of the wall": "\uD654\uC5FC\uBCBD \uD0C0\uACA9 1\uD68C\uB2F9",
      "a tooth": "\uC774\uBE68\uB2F9",
      "a tornado": "\uD68C\uC624\uB9AC\uBC14\uB78C\uB2F9",
      "A trap near the nearest pack breathes fire at monsters # times, # flames of # damage to all in their path": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC606\uC758 \uB36B\uC774 \uBD88\uAE38\uC744 {0}\uD68C \uBFDC\uC74C, \uD654\uC5FC {1}\uC904\uAE30, \uACBD\uB85C\uC0C1 \uBAA8\uB450\uC5D0\uAC8C {2} \uD53C\uD574",
      "A trap near the nearest pack sends out # waves of fire, # damage to all they pass": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC606\uC758 \uB36B\uC774 \uD654\uC5FC\uD30C\uB97C {0}\uD68C \uBC29\uCD9C, \uC9C0\uB098\uB294 \uBAA8\uB450\uC5D0\uAC8C {1} \uD53C\uD574",
      "a twister": "\uB3CC\uAC1C\uBC14\uB78C\uB2F9",
      "A unique's minions no longer teleport or curse, and Nightmare's and Hell's monsters hit with D2's share of fire, cold and lightning": "\uACE0\uC720 \uAD34\uBB3C\uC758 \uD558\uC218\uC778\uC774 \uB354 \uC774\uC0C1 \uC21C\uAC04\uC774\uB3D9\uD558\uAC70\uB098 \uC800\uC8FC\uB97C \uAC78\uC9C0 \uC54A\uC73C\uBA70, \uC545\uBABD\uACFC \uC9C0\uC625\uC758 \uAD34\uBB3C\uC740 D2\uC758 \uBE44\uC728\uB300\uB85C \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uD53C\uD574\uB97C \uC90D\uB2C8\uB2E4",
      "A Valkyrie fights at your side, # damage a spear thrust": "\uBC1C\uD0A4\uB9AC\uAC00 \uACC1\uC5D0\uC11C \uC2F8\uC6C0, \uCC0C\uB974\uAE30\uB2F9 {0} \uD53C\uD574",
      "A volcano under the nearest pack for #s, raining burning rocks, # damage each": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC544\uB798\uC5D0 {0}\uCD08\uAC04 \uD654\uC0B0, \uBD88\uD0C0\uB294 \uBC14\uC704\uB97C \uBFDC\uC74C, \uAC01 {1} \uD53C\uD574",
      "A wall of fire across the path ahead that burns for #s": "\uC55E\uCABD \uAE38\uC744 \uAC00\uB85C\uB9C9\uB294 \uBD88\uC758 \uBCBD, {0}\uCD08\uAC04 \uBD88\uD0D0",
      "a wave": "\uD654\uC5FC\uD30C\uB2F9",
      "Absorbs Cold Damage": "\uB0C9\uAE30 \uD53C\uD574 \uD761\uC218",
      "Absorbs Cold Damage (+* per Character Level)": "\uB0C9\uAE30 \uD53C\uD574 \uD761\uC218 (\uCE90\uB9AD\uD130 \uB808\uBCA8\uB2F9 +{0})",
      "Absorbs Fire Damage": "\uD654\uC5FC \uD53C\uD574 \uD761\uC218",
      "Absorbs Fire Damage (+* per Character Level)": "\uD654\uC5FC \uD53C\uD574 \uD761\uC218 (\uCE90\uB9AD\uD130 \uB808\uBCA8\uB2F9 +{0})",
      "Absorbs Lightning Damage": "\uBC88\uAC1C \uD53C\uD574 \uD761\uC218",
      "Absorbs Lightning Damage (+* per Character Level)": "\uBC88\uAC1C \uD53C\uD574 \uD761\uC218 (\uCE90\uB9AD\uD130 \uB808\uBCA8\uB2F9 +{0})",
      Accursed: "\uC800\uC8FC\uBC1B\uC740",
      "Achmel the Cursed": "\uC800\uC8FC\uBC1B\uC740 \uC790 \uC544\uD06C\uBA5C",
      "Acrobat's": "\uACE1\uC608\uC0AC\uC758",
      "ACT *": "{0}\uB9C9",
      "Act # \xB7 #": "{0}\uB9C9 \xB7 {1}",
      "Act #: #": "{0}\uB9C9: {1}",
      "Act I": "1\uB9C9",
      "Act I is not saved: your next run starts anew. Your items and gold are kept.": "1\uB9C9\uC740 \uC800\uC7A5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: \uB2E4\uC74C \uC2E4\uD589\uC740 \uCC98\uC74C\uBD80\uD130 \uC2DC\uC791\uD569\uB2C8\uB2E4. \uC544\uC774\uD15C\uACFC \uACE8\uB4DC\uB294 \uADF8\uB300\uB85C \uB0A8\uC2B5\uB2C8\uB2E4.",
      "Act II": "2\uB9C9",
      "Act III": "3\uB9C9",
      "Act IV": "4\uB9C9",
      "Act V": "5\uB9C9",
      "Add a point to *": "{0}\uC5D0 \uD3EC\uC778\uD2B8 1 \uCD94\uAC00",
      "Added to every weapon blow: its average goes to Attack Damage": "\uBAA8\uB4E0 \uBB34\uAE30 \uACF5\uACA9\uC5D0 \uCD94\uAC00: \uADF8 \uD3C9\uADE0\uC774 \uACF5\uACA9 \uD53C\uD574\uC5D0 \uBC18\uC601",
      "Added to every weapon blow: its share of the average goes to Attack Damage": "\uBAA8\uB4E0 \uBB34\uAE30 \uACF5\uACA9\uC5D0 \uCD94\uAC00: \uD3C9\uADE0 \uC911 \uADF8 \uBAAB\uB9CC\uD07C \uACF5\uACA9 \uD53C\uD574\uC5D0 \uBC18\uC601",
      "Adds *-* * Damage": "{0} - {1} {2} \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# cold damage": "{0} - {1} \uB0C9\uAE30 \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# damage": "{0} - {1} \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# fire damage": "{0} - {1} \uD654\uC5FC \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# lightning damage": "{0} - {1} \uBC88\uAC1C \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# magic damage": "{0} - {1} \uB9C8\uBC95 \uD53C\uD574 \uCD94\uAC00",
      "Adds #-# poison damage over # seconds": "{0} - {1} \uB3C5 \uD53C\uD574 \uCD94\uAC00 ({2}\uCD08\uC5D0 \uAC78\uCCD0)",
      "Adds #% Attack Damage a percent": "1%\uB2F9 \uACF5\uACA9 \uD53C\uD574 +{0}%",
      Aegis: "\uC774\uC9C0\uC2A4",
      "After Baal, opening Charsi's wares twice no longer hides your globes, skills and gold until you restart the game": "\uBC14\uC54C \uCC98\uCE58 \uD6C4 \uCC30\uC2DC\uC758 \uBB3C\uD488\uC744 \uB450 \uBC88 \uC5F4\uC5B4\uB3C4, \uAC8C\uC784\uC744 \uB2E4\uC2DC \uC2DC\uC791\uD560 \uB54C\uAE4C\uC9C0 \uAD6C\uC2AC\uACFC \uAE30\uC220, \uACE8\uB4DC\uAC00 \uC0AC\uB77C\uC9C0\uB294 \uC77C\uC774 \uB354 \uC774\uC0C1 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Aerin Shield": "\uC5D0\uC5B4\uB9B0 \uC274\uB4DC",
      "Akaran Rondache": "\uC544\uCE74\uB780 \uB860\uB2E4\uC26C",
      "Akaran Targe": "\uC544\uCE74\uB780 \uD0C0\uC544\uC9C0",
      "all Attributes": "\uBAA8\uB4E0 \uB2A5\uB825\uCE58",
      "All Resistances +#": "\uBAA8\uB4E0 \uC800\uD56D +{0}",
      "Alma Negra": "\uC54C\uB9C8 \uB124\uADF8\uB77C",
      "Alpha Helm": "\uC54C\uD30C \uD5EC\uB984",
      Amazon: "\uC544\uB9C8\uC874",
      "The Amazon's Dodge, Avoid and Evade work as in D2: Dodge and Avoid while she stands still, Evade while she moves, never all three at once": "\uC544\uB9C8\uC874\uC758 \uD758\uB9AC\uAE30, \uD68C\uD53C, \uD53C\uD558\uAE30\uAC00 D2\uCC98\uB7FC \uC791\uB3D9\uD569\uB2C8\uB2E4: \uD758\uB9AC\uAE30\uC640 \uD68C\uD53C\uB294 \uBA48\uCDB0 \uC788\uC744 \uB54C, \uD53C\uD558\uAE30\uB294 \uC774\uB3D9 \uC911\uC5D0, \uC14B\uC774 \uD55C\uAEBC\uBC88\uC5D0 \uC791\uB3D9\uD558\uC9C0\uB294 \uC54A\uC2B5\uB2C8\uB2E4",
      Amber: "\uD638\uBC15\uC0C9",
      Ambergris: "\uC6A9\uC5F0\uD5A5",
      "Amplify Damage": "\uD53C\uD574 \uC99D\uD3ED",
      Amulet: "\uBAA9\uAC78\uC774",
      "An act's portal waits for you: pick up the floor, then walk in (the monsters keep coming)": "\uB9C9\uC758 \uCC28\uC6D0\uBB38\uC774 \uAE30\uB2E4\uB824 \uC90D\uB2C8\uB2E4: \uBC14\uB2E5\uC758 \uBB3C\uAC74\uC744 \uC90D\uACE0 \uB4E4\uC5B4\uAC00\uC2ED\uC2DC\uC624 (\uAD34\uBB3C\uC740 \uACC4\uC18D \uBAB0\uB824\uC635\uB2C8\uB2E4)",
      "An army: up to # skeletons, and slain monsters rise to fight for you (up to #, #s)": "\uAD70\uB2E8: \uD574\uACE8 \uCD5C\uB300 {0}, \uCC98\uCE58\uD55C \uAD34\uBB3C\uC774 \uC77C\uC5B4\uB098 \uB2F9\uC2E0\uC744 \uC704\uD574 \uC2F8\uC6C0 (\uCD5C\uB300 {1}, {2}\uCD08)",
      "an arrow": "\uD654\uC0B4\uB2F9",
      "an arrow or its blast": "\uD654\uC0B4 \uB610\uB294 \uD3ED\uBC1C\uB2F9",
      "an arrow or its burst": "\uD654\uC0B4 \uB610\uB294 \uD3ED\uBC1C\uB2F9",
      "an axe": "\uB3C4\uB07C\uB2F9",
      "An orb that sprays chilling ice shards in every direction, # damage each": "\uC0AC\uBC29\uC73C\uB85C \uCC28\uAC00\uC6B4 \uC5BC\uC74C \uD30C\uD3B8\uC744 \uBFCC\uB9AC\uB294 \uAD6C\uCCB4, \uD30C\uD3B8\uB2F9 {0} \uD53C\uD574",
      "Ancient Axe": "\uC5D0\uC778\uC158\uD2B8 \uC561\uC2A4",
      "Ancient Kaa the Soulless": "\uB10B \uB098\uAC04 \uACE0\uB300 \uCE74\uC544",
      "Ancient Shield": "\uC5D0\uC778\uC158\uD2B8 \uC274\uB4DC",
      "Ancient Sword": "\uC5D0\uC778\uC158\uD2B8 \uC18C\uB4DC",
      "Ancients' Way": "\uACE0\uB300\uC778\uC758 \uAE38",
      and: "\uBC0F",
      "and * more.": "\uC678 {0}\uAC1C.",
      "and continue the run": "(\uAC8C\uC784 \uC774\uC5B4\uD558\uAE30)",
      Andariel: "\uC548\uB2E4\uB9AC\uC5D8",
      "Angel's": "\uCC9C\uC0AC\uC758",
      "Another run as the **": "\uC0C8 \uAC8C\uC784: {0}{1}",
      Antimagic: "\uBC18\uB9C8\uBC95",
      Antlers: "\uC564\uD2C0\uB7EC\uC2A4",
      April: "4\uC6D4",
      Arach: "\uAC70\uBBF8",
      "Arachnid Mesh": "\uAC70\uBBF8 \uADF8\uBB3C\uB760",
      Arbalest: "\uC544\uBC1C\uB9AC\uC2A4\uD2B8",
      "Arcane Sanctuary": "\uBE44\uC804\uC758 \uC131\uC5ED (\uC18C\uD658\uC0AC \uC99D\uC624\uC758\uC5F4\uC1E0)",
      "Arch-Angel's": "\uB300\uCC9C\uC0AC\uC758",
      "Archer's": "\uAD81\uC218\uC758",
      "Archon Plate": "\uC544\uCF58 \uD50C\uB808\uC774\uD2B8",
      "Archon Staff": "\uC544\uCF58 \uC2A4\uD0DC\uD504",
      Arcing: "\uBED7\uC5B4\uB098\uAC00\uB294",
      "Arctic Blast": "\uADF9\uC9C0 \uB3CC\uD48D",
      "Arioc's Needle": "\uC544\uB9AC\uC625\uC758 \uBC14\uB298",
      "Arkaine's Valor": "\uC544\uB974\uCF00\uC778\uC758 \uC6A9\uB9F9",
      "Arm of King Leoric": "\uB808\uC624\uB9AD \uC655\uC758 \uD314",
      Armageddon: "\uC544\uB9C8\uAC9F\uB3C8",
      Armet: "\uC544\uBA54\uD2B8",
      Armor: "\uAC11\uC637",
      "Arreat Plateau": "\uC544\uB9AC\uC557 \uACE0\uC6D0",
      "Arreat Summit": "\uC544\uB9AC\uC557 \uC815\uC0C1",
      "Arreat's Face": "\uC544\uB9AC\uC557\uC758 \uC5BC\uAD74",
      arrow: "\uD654\uC0B4",
      "Arrows or drag to adjust - Esc to go back": "\uBC29\uD5A5\uD0A4\uB098 \uB4DC\uB798\uADF8\uB85C \uC870\uC808 - Esc: \uB3CC\uC544\uAC00\uAE30",
      Ash: "\uC7AC",
      "Ashwood Bow": "\uC560\uC26C\uC6B0\uB4DC \uBCF4\uC6B0",
      Assassin: "\uC554\uC0B4\uC790",
      "Assault Helmet": "\uC5B4\uC370\uD2B8 \uD5EC\uBA67",
      "Astreon's Iron Ward": "\uC544\uC2A4\uD2B8\uB808\uC628\uC758 \uBB34\uC1E0 \uD638\uC2E0\uBD80",
      "At most #%, more with +% to Maximum Resist": "\uCD5C\uB300 {0}%, +% \uCD5C\uB300 \uC800\uD56D\uC73C\uB85C \uB354 \uB192\uC544\uC9D0",
      Ataghan: "\uC544\uD0C0\uAC04",
      "Athlete's": "\uC6B4\uB3D9\uC120\uC218\uC758",
      Attack: "\uACF5\uACA9",
      "Attack Damage": "\uACF5\uACA9 \uD53C\uD574",
      "Attack Rating": "\uACF5\uACA9 \uB4F1\uAE09",
      "Attacker Takes Damage of": "\uACF5\uACA9\uC790\uC5D0\uAC8C \uD53C\uD574 \uBC18\uC0AC",
      "Attacker Takes Damage of * per Level": "\uACF5\uACA9\uC790\uC5D0\uAC8C \uD53C\uD574 \uBC18\uC0AC {0} (\uB808\uBCA8\uB2F9)",
      "Attacker Takes Lightning Damage of": "\uACF5\uACA9\uC790\uC5D0\uAC8C \uBC88\uAC1C \uD53C\uD574 \uBC18\uC0AC",
      Attract: "\uC720\uD639",
      August: "8\uC6D4",
      "Aura Enchanted": "\uC624\uB77C \uAC15\uD654",
      "Aura: +#% chance of a critical strike (double damage) with Zeal, Smite, Charge and Sacrifice": "\uC624\uB77C: \uC5F4\uC758, \uAC15\uD0C0, \uB3CC\uC9C4, \uD76C\uC0DD\uC758 \uCE58\uBA85\uD0C0 \uD655\uB960 +{0}% (2\uBC30 \uD53C\uD574)",
      "Aura: +#% cold resistance, and +#% to its maximum (#%) a level; chill wears off #% faster": "\uC624\uB77C: \uB0C9\uAE30 \uC800\uD56D +{0}%, \uB808\uBCA8\uB2F9 \uCD5C\uB300 \uB0C9\uAE30 \uC800\uD56D +{1}% ({2}%); \uC624\uD55C \uC2DC\uAC04 {3}% \uB2E8\uCD95",
      "Aura: +#% fire resistance, and +#% to its maximum (#%) a level": "\uC624\uB77C: \uD654\uC5FC \uC800\uD56D +{0}%, \uB808\uBCA8\uB2F9 \uCD5C\uB300 \uD654\uC5FC \uC800\uD56D +{1}% ({2}%)",
      "Aura: +#% fire, cold and lightning resistance; chill wears off #% faster": "\uC624\uB77C: \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uC800\uD56D +{0}%; \uC624\uD55C \uC2DC\uAC04 {1}% \uB2E8\uCD95",
      "Aura: +#% lightning resistance, and +#% to its maximum (#%) a level": "\uC624\uB77C: \uBC88\uAC1C \uC800\uD56D +{0}%, \uB808\uBCA8\uB2F9 \uCD5C\uB300 \uBC88\uAC1C \uC800\uD56D +{1}% ({2}%)",
      "Aura: +#% magic damage (Blessed Hammer, Holy Bolt, Holy Shield)": "\uC624\uB77C: +{0}% \uB9C8\uBC95 \uD53C\uD574 (\uCD95\uBCF5\uBC1B\uC740 \uB9DD\uCE58, \uC2E0\uC131\uD55C \uBE5B\uC904\uAE30, \uC2E0\uC131\uD55C \uBC29\uD328)",
      "Aura: +#% movement speed, up to +#%; Charge reaches further": "\uC624\uB77C: \uC774\uB3D9 \uC18D\uB3C4 +{0}%, \uCD5C\uB300 +{1}%; \uB3CC\uC9C4 \uAC70\uB9AC \uC99D\uAC00",
      "Aura: +#% physical damage (Zeal, Smite, Charge)": "\uC624\uB77C: +{0}% \uBB3C\uB9AC \uD53C\uD574 (\uC5F4\uC758, \uAC15\uD0C0, \uB3CC\uC9C4)",
      "Aura: burns every monster around you each second": "\uC624\uB77C: \uB9E4\uCD08 \uC8FC\uBCC0\uC758 \uBAA8\uB4E0 \uAD34\uBB3C\uC744 \uBD88\uD0DC\uC6C0",
      "Aura: heal # life a second, up to #": "\uC624\uB77C: \uCD08\uB2F9 \uC0DD\uBA85\uB825 {0} \uD68C\uBCF5, \uCD5C\uB300 {1}",
      "Aura: lightning jolts every monster around you each second": "\uC624\uB77C: \uB9E4\uCD08 \uC8FC\uBCC0\uC758 \uBAA8\uB4E0 \uAD34\uBB3C\uC5D0\uAC8C \uBC88\uAC1C",
      "Aura: monsters around you are slowed by half and chilled each second": "\uC624\uB77C: \uC8FC\uBCC0 \uAD34\uBB3C\uC744 \uC808\uBC18\uC73C\uB85C \uAC10\uC18D, \uB9E4\uCD08 \uC624\uD55C",
      "Aura: monsters around you resist fire, cold and lightning #% less, +#% a level (a fifth of it if immune)": "\uC624\uB77C: \uC8FC\uBCC0 \uAD34\uBB3C\uC758 \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C \uC800\uD56D {0}% \uAC10\uC18C, \uB808\uBCA8\uB2F9 +{1}% (\uBA74\uC5ED\uC774\uBA74 \uADF8 5\uBD84\uC758 1)",
      "Aura: monsters close to you are hurt and thrown out, # damage twice a second, +# a level": "\uC624\uB77C: \uAC00\uAE4C\uC6B4 \uAD34\uBB3C\uC5D0\uAC8C \uD53C\uD574\uB97C \uC8FC\uACE0 \uBC00\uCCD0\uB0C4, \uCD08\uB2F9 2\uD68C {0} \uD53C\uD574, \uB808\uBCA8\uB2F9 +{1}",
      "Aura: monsters slain near you heal you # life, #% of the time, +#% a level": "\uC624\uB77C: \uC8FC\uBCC0\uC5D0\uC11C \uAD34\uBB3C\uC774 \uC8FD\uC73C\uBA74 {1}% \uD655\uB960\uB85C \uC0DD\uBA85\uB825 {0} \uD68C\uBCF5, \uB808\uBCA8\uB2F9 +{2}%",
      "Aura: monsters that strike you in melee take back #% of the blow, +#% a level": "\uC624\uB77C: \uADFC\uC811 \uACF5\uACA9\uD55C \uAD34\uBB3C\uC774 \uD53C\uD574\uC758 {0}%\uB97C \uB3CC\uB824\uBC1B\uC74C, \uB808\uBCA8\uB2F9 +{1}%",
      "Aura: poison and chill wear off #% faster": "\uC624\uB77C: \uB3C5\uACFC \uC624\uD55C \uC2DC\uAC04 {0}% \uB2E8\uCD95",
      "Aura: skills recharge #% faster": "\uC624\uB77C: \uAE30\uC220 \uC7AC\uC0AC\uC6A9 \uC18D\uB3C4 {0}% \uC99D\uAC00",
      "Aura: skills recharge #% faster, +#% physical damage": "\uC624\uB77C: \uAE30\uC220 \uC7AC\uCDA9\uC804 {0}% \uBE68\uB77C\uC9D0, +{1}% \uBB3C\uB9AC \uD53C\uD574",
      "Aura: take #% less damage": "\uC624\uB77C: \uBC1B\uB294 \uD53C\uD574 {0}% \uAC10\uC18C",
      "Auto stats": "\uB2A5\uB825\uCE58 \uC790\uB3D9 \uBC30\uBD84",
      "AUTO STATS: #": "\uB2A5\uB825\uCE58 \uC790\uB3D9 \uBC30\uBD84: {0}",
      Automap: "\uC790\uB3D9 \uC9C0\uB3C4",
      "Avenger Guard": "\uC5B4\uBCA4\uC800 \uAC00\uB4DC",
      "Average Damage": "\uD3C9\uADE0 \uD53C\uD574",
      Avoid: "\uD68C\uD53C",
      Axe: "\uC561\uC2A4",
      "Axe Mastery": "\uB3C4\uB07C \uC219\uB828",
      "Axe of Fechmar": "\uD398\uD06C\uB9C8\uB974\uC758 \uB3C4\uB07C",
      Azure: "\uD558\uB298\uC0C9",
      Azurewrath: "\uD478\uB978 \uC11C\uC2AC",
      Baal: "\uBC14\uC54C",
      "Baal has been slain": "\uBC14\uC54C\uC774 \uCC98\uCE58\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
      "Baal's last wave, the Minions of Destruction, no longer lasts until he falls: it comes as long as his other waves": "\uBC14\uC54C\uC758 \uB9C8\uC9C0\uB9C9 \uBB34\uB9AC\uC778 \uD30C\uAD34\uC758 \uD558\uC218\uC778\uC774 \uB354 \uC774\uC0C1 \uBC14\uC54C\uC774 \uC4F0\uB7EC\uC9C8 \uB54C\uAE4C\uC9C0 \uC774\uC5B4\uC9C0\uC9C0 \uC54A\uACE0, \uB2E4\uB978 \uBB34\uB9AC\uB9CC\uD07C\uB9CC \uBAB0\uB824\uC635\uB2C8\uB2E4",
      BACK: "\uB4A4\uB85C",
      "Back (Esc)": "\uB4A4\uB85C (Esc)",
      "Back to the #": "{0}\uC5D0\uAC8C \uB3CC\uC544\uAC00\uAE30",
      Badge: "\uD718\uC7A5",
      "Bahamut's": "\uBC14\uD558\uBB34\uD2B8\uC758",
      "Balanced Axe": "\uBC38\uB7F0\uC2A4\uB4DC \uC561\uC2A4",
      Ballista: "\uBC1C\uB9AC\uC2A4\uD0C0",
      "Balrog Blade": "\uBC1C\uB85D \uBE14\uB808\uC774\uB4DC",
      "Balrog Skin": "\uBC1C\uB85D \uC2A4\uD0A8",
      "Balrog Spear": "\uBC1C\uB85D \uC2A4\uD53C\uC5B4",
      Band: "\uBC18\uC9C0",
      Bane: "\uC7AC\uC559",
      "Bane Ash": "\uC7AC\uC559\uC758 \uC7AC",
      Bang: "\uAD49\uC74C",
      Banish: "\uC81C\uC678",
      "Banish* \xB7 *": "\uC81C\uC678{0} \xB7 {1}",
      "Baranar's Star": "\uBC14\uB77C\uB098\uB974\uC758 \uBCC4",
      Barb: "\uBBF8\uB298",
      Barbarian: "\uC57C\uB9CC\uC6A9\uC0AC",
      Bardiche: "\uBC14\uB514\uC26C",
      Barrel: "\uD1B5",
      "Bartuc the Bloody": "\uD53C\uD22C\uC131\uC774 \uBC14\uB974\uD22D",
      "Bartuc's Cut-Throat": "\uBC14\uB974\uD22D\uC758 \uBAA9 \uB530\uAC1C",
      "Base Damage Reduction: *%": "\uAE30\uBCF8 \uD53C\uD574 \uAC10\uC18C: {0}%",
      "Base Damage: +*%": "\uAE30\uBCF8 \uD53C\uD574: +{0}%",
      Bash: "\uAC15\uACA9",
      "Bash the toughest monster in reach with your shield, # damage, knocked back and stunned": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC744 \uBC29\uD328\uB85C \uAC00\uACA9, {0} \uD53C\uD574, \uBC00\uCCD0\uB0B4\uACE0 \uAE30\uC808",
      "Battle Axe": "\uBC30\uD2C0 \uC561\uC2A4",
      "Battle Belt": "\uBC30\uD2C0 \uBCA8\uD2B8",
      "Battle Boots": "\uBC30\uD2C0 \uBD80\uCE20",
      "Battle Cestus": "\uBC30\uD2C0 \uC138\uC2A4\uD130\uC2A4",
      "Battle Command": "\uC804\uD22C \uBA85\uB839",
      "Battle Cry": "\uC804\uD22C\uC758 \uD568\uC131",
      "Battle Dart": "\uBC30\uD2C0 \uB2E4\uD2B8",
      "Battle Gauntlets": "\uBC30\uD2C0 \uAC74\uD2C0\uB9BF",
      "Battle Hammer": "\uBC30\uD2C0 \uD574\uBA38",
      "Battle Orders": "\uC804\uD22C \uC9C0\uC2DC",
      "Battle Orders, and +# to all your skills": "\uC804\uD22C \uC9C0\uC2DC\uC640 \uBAA8\uB4E0 \uAE30\uC220 +{0}",
      "Battle Staff": "\uBC30\uD2C0 \uC2A4\uD0DC\uD504",
      "Battle Sword": "\uBC30\uD2C0 \uC18C\uB4DC",
      "Battlemaid Sarina": "\uC5EC\uC804\uC0AC \uC0AC\uB9AC\uB098",
      Beads: "\uAD6C\uC2AC",
      Beast: "\uC57C\uC218",
      "Beast Aegis": "\uC57C\uC218 \uBC29\uD328",
      "Beast Badge": "\uC57C\uC218 \uD718\uC7A5",
      "Beast Band": "\uC57C\uC218 \uBC18\uC9C0",
      "Beast Barb": "\uC57C\uC218 \uBBF8\uB298",
      "Beast Beads": "\uC57C\uC218 \uAD6C\uC2AC",
      "Beast Bite": "\uC57C\uC218 \uC774\uBE68",
      "Beast Blazer": "\uC57C\uC218 \uAC1C\uCC99\uC790",
      "Beast Bludgeon": "\uC57C\uC218 \uACE4\uBD09",
      "Beast Bolt": "\uC57C\uC218 \uD654\uC0B4",
      "Beast Branch": "\uC57C\uC218 \uAC00\uC9C0",
      "Beast Brow": "\uC57C\uC218 \uC774\uB9C8",
      "Beast Buckle": "\uC57C\uC218 \uBC84\uD074",
      "Beast Call": "\uC57C\uC218 \uBD80\uB984",
      "Beast Carapace": "\uC57C\uC218 \uAC11\uAC01",
      "Beast Casque": "\uC57C\uC218 \uD22C\uAD6C",
      "Beast Chant": "\uC57C\uC218 \uCC2C\uAC00",
      "Beast Clasp": "\uC57C\uC218 \uAC78\uC1E0",
      "Beast Claw": "\uC57C\uC218 \uBC1C\uD1B1",
      "Beast Cleaver": "\uC57C\uC218 \uAC00\uB984\uB0A0",
      "Beast Clutches": "\uC57C\uC218 \uB9C8\uC218",
      "Beast Coat": "\uC57C\uC218 \uC678\uD22C",
      "Beast Coil": "\uC57C\uC218 \uACE0\uB9AC",
      "Beast Collar": "\uC57C\uC218 \uBAA9\uD14C",
      "Beast Cord": "\uC57C\uC218 \uB048",
      "Beast Cowl": "\uC57C\uC218 \uC218\uB3C4\uB450\uAC74",
      "Beast Crack": "\uC57C\uC218 \uADE0\uC5F4",
      "Beast Crest": "\uC57C\uC218 \uBB38\uC7A5",
      "Beast Crusher": "\uC57C\uC218 \uBD84\uC1C4\uAE30",
      "Beast Cry": "\uC57C\uC218 \uC6B8\uC74C",
      "Beast Dart": "\uC57C\uC218 \uD22C\uCC3D",
      "Beast Edge": "\uC57C\uC218 \uCE7C\uB0A0",
      "Beast Emblem": "\uC57C\uC218 \uC0C1\uC9D5",
      "Beast Eye": "\uC57C\uC218 \uB208",
      "Beast Fang": "\uC57C\uC218 \uC1A1\uACF3\uB2C8",
      "Beast Finger": "\uC57C\uC218 \uC190\uAC00\uB77D",
      "Beast Fist": "\uC57C\uC218 \uC8FC\uBA39",
      "Beast Fletch": "\uC57C\uC218 \uD654\uC0B4\uAE43",
      "Beast Flight": "\uC57C\uC218 \uBE44\uD589",
      "Beast Glare": "\uC57C\uC218 \uC12C\uAD11",
      "Beast Gnarl": "\uC57C\uC218 \uC639\uC774",
      "Beast Goad": "\uC57C\uC218 \uBAB0\uC774\uB9C9\uB300",
      "Beast Gorget": "\uC57C\uC218 \uBAA9\uAC00\uB9AC\uAC1C",
      "Beast Grip": "\uC57C\uC218 \uC190\uC544\uADC0",
      "Beast Guard": "\uC57C\uC218 \uC218\uD638",
      "Beast Gutter": "\uC57C\uC218 \uC808\uAC1C",
      "Beast Gyre": "\uC57C\uC218 \uC18C\uC6A9\uB3CC\uC774",
      "Beast Hand": "\uC57C\uC218 \uC190",
      "Beast Heart": "\uC57C\uC218 \uC2EC\uC7A5",
      "Beast Hew": "\uC57C\uC218 \uCC0D\uAE30",
      "Beast Hide": "\uC57C\uC218 \uAC00\uC8FD",
      "Beast Hold": "\uC57C\uC218 \uC6C0\uCF1C\uC960",
      "Beast Hood": "\uC57C\uC218 \uB450\uAC74",
      "Beast Horn": "\uC57C\uC218 \uBFD4",
      "Beast Impaler": "\uC57C\uC218 \uAD00\uD1B5\uC790",
      "Beast Jack": "\uC57C\uC218 \uC6C3\uC637",
      "Beast Knell": "\uC57C\uC218 \uC870\uC885",
      "Beast Knot": "\uC57C\uC218 \uB9E4\uB4ED",
      "Beast Knuckle": "\uC57C\uC218 \uC190\uB9C8\uB514",
      "Beast Lance": "\uC57C\uC218 \uCC3D",
      "Beast Lash": "\uC57C\uC218 \uCC44\uCC0D",
      "Beast Lock": "\uC57C\uC218 \uC790\uBB3C\uC1E0",
      "Beast Loop": "\uC57C\uC218 \uD14C",
      "Beast Mallet": "\uC57C\uC218 \uB9DD\uCE58",
      "Beast Mangler": "\uC57C\uC218 \uB09C\uB3C4\uC9C8",
      "Beast Mantle": "\uC57C\uC218 \uB9DD\uD1A0",
      "Beast Mark": "\uC57C\uC218 \uD45C\uC2DD",
      "Beast Mask": "\uC57C\uC218 \uAC00\uBA74",
      "Beast Mauler": "\uC57C\uC218 \uD30C\uAD34\uC790",
      "Beast Nails": "\uC57C\uC218 \uBABB",
      "Beast Necklace": "\uC57C\uC218 \uBAA9\uAC78\uC774",
      "Beast Needle": "\uC57C\uC218 \uBC14\uB298",
      "Beast Nock": "\uC57C\uC218 \uC2DC\uC704\uD648",
      "Beast Noose": "\uC57C\uC218 \uC62C\uAC00\uBBF8",
      "Beast Orb": "\uC57C\uC218 \uBCF4\uC8FC",
      "Beast Pelt": "\uC57C\uC218 \uBAA8\uD53C",
      "Beast Prod": "\uC57C\uC218 \uCC0C\uB974\uAE30",
      "Beast Quarrel": "\uC57C\uC218 \uC1E0\uB1CC\uC0B4",
      "Beast Quill": "\uC57C\uC218 \uAE43",
      "Beast Razor": "\uC57C\uC218 \uBA74\uB3C4\uB0A0",
      "Beast Rend": "\uC57C\uC218 \uCC22\uAE40",
      "Beast Road": "\uC57C\uC218 \uAE38",
      "Beast Saw": "\uC57C\uC218 \uD1B1",
      "Beast Scalpel": "\uC57C\uC218 \uD574\uBD80\uCE7C",
      "Beast Scarab": "\uC57C\uC218 \uD48D\uB385\uC774",
      "Beast Scourge": "\uC57C\uC218 \uC7AC\uC559",
      "Beast Scratch": "\uC57C\uC218 \uD560\uD034\uAE30",
      "Beast Scythe": "\uC57C\uC218 \uB0AB",
      "Beast Shard": "\uC57C\uC218 \uD30C\uD3B8",
      "Beast Shroud": "\uC57C\uC218 \uC218\uC758",
      "Beast Slippers": "\uC57C\uC218 \uB367\uC2E0",
      "Beast Smasher": "\uC57C\uC218 \uBD84\uC1C4\uC790",
      "Beast Song": "\uC57C\uC218 \uB178\uB798",
      "Beast Spell": "\uC57C\uC218 \uC8FC\uBB38",
      "Beast Sphere": "\uC57C\uC218 \uAD6C\uCCB4",
      "Beast Spike": "\uC57C\uC218 \uAC00\uC2DC",
      "Beast Spiral": "\uC57C\uC218 \uB098\uC120",
      "Beast Spire": "\uC57C\uC218 \uCCA8\uD0D1",
      "Beast Splitter": "\uC57C\uC218 \uCABC\uAC1C\uB294\uC790",
      "Beast Spur": "\uC57C\uC218 \uBC15\uCC28",
      "Beast Stake": "\uC57C\uC218 \uB9D0\uB69D",
      "Beast Stalk": "\uC57C\uC218 \uCD94\uC801",
      "Beast Star": "\uC57C\uC218 \uBCC4",
      "Beast Stinger": "\uC57C\uC218 \uB3C5\uCE68",
      "Beast Strap": "\uC57C\uC218 \uB760",
      "Beast Suit": "\uC57C\uC218 \uAC11\uC637",
      "Beast Sunder": "\uC57C\uC218 \uC808\uB2E8",
      "Beast Talisman": "\uC57C\uC218 \uBD80\uC801",
      "Beast Thirst": "\uC57C\uC218 \uAC08\uC99D",
      "Beast Torc": "\uC57C\uC218 \uBAA9\uACE0\uB9AC",
      "Beast Tower": "\uC57C\uC218 \uD0D1",
      "Beast Track": "\uC57C\uC218 \uBC1C\uC790\uAD6D",
      "Beast Trample": "\uC57C\uC218 \uC9D3\uBC1F\uAE30",
      "Beast Turn": "\uC57C\uC218 \uD68C\uC804",
      "Beast Veil": "\uC57C\uC218 \uC7A5\uB9C9",
      "Beast Visage": "\uC57C\uC218 \uC5BC\uAD74",
      "Beast Ward": "\uC57C\uC218 \uBCF4\uD638",
      "Beast Weaver": "\uC57C\uC218 \uC9C1\uC870\uC790",
      "Beast Wing": "\uC57C\uC218 \uB0A0\uAC1C",
      "Beast Wrack": "\uC57C\uC218 \uACE0\uBB38",
      "Bec-de-Corbin": "\uBCA1\uB4DC\uCF54\uBC29",
      Beetleburst: "\uBE44\uD2C0\uBC84\uC2A4\uD2B8",
      Belt: "\uBCA8\uD2B8",
      Bender: "\uBE44\uD2C0\uAC1C",
      Berserk: "\uAD11\uD3ED\uD654",
      Berserker: "\uAD11\uC804\uC0AC",
      "Berserker Axe": "\uBC84\uC11C\uCEE4 \uC561\uC2A4",
      "Berserker's": "\uAD11\uC804\uC0AC\uC758",
      Beryl: "\uB179\uC8FC\uC0C9",
      "best #": "\uCD5C\uACE0 {0}",
      "Best time": "\uCD5C\uACE0 \uAE30\uB85D",
      "Best time: #": "\uCD5C\uACE0 \uAE30\uB85D: {0}",
      "Better Chance of Getting Magic Items": "\uB9C8\uBC95 \uC544\uC774\uD15C \uBC1C\uACAC \uD655\uB960 \uC99D\uAC00",
      "Better chance that items dropped are magic, rare or unique": "\uB5A8\uC5B4\uC9C0\uB294 \uC544\uC774\uD15C\uC774 \uB9C8\uBC95, \uD76C\uADC0, \uACE0\uC720 \uC544\uC774\uD15C\uC77C \uD655\uB960 \uC99D\uAC00",
      "Biggin's Bonnet": "\uBE44\uAE34\uC758 \uBAA8\uC790",
      Bile: "\uB2F4\uC999",
      Bishibosh: "\uBE44\uC2DC\uBCF4\uC2DC",
      Bite: "\uC774\uBE68",
      Black: "\uCE60\uD751",
      "Black Marsh": "\uAC80\uC740 \uC2B5\uC9C0",
      "Blackhand Key": "\uAC80\uC740\uC190 \uC5F4\uC1E0",
      Blade: "\uBE14\uB808\uC774\uB4DC",
      "Blade Bow": "\uBE14\uB808\uC774\uB4DC \uBCF4\uC6B0",
      "Blade Fury": "\uBD84\uB178\uC758 \uCE7C\uB0A0",
      "Blade Sentinel": "\uD30C\uC218\uAFBC\uC758 \uCE7C\uB0A0",
      "Blade Shield": "\uCE7C\uB0A0 \uBC29\uD328",
      "Blade Talons": "\uBE14\uB808\uC774\uB4DC \uD0E4\uB7F0",
      Bladebone: "\uCE7C\uB0A0\uBF08",
      Bladebuckle: "\uCE7C\uB0A0 \uC8D4\uC1E0",
      "Blades of Ice": "\uC5BC\uC74C \uCE7C\uB0A0",
      "Blades spin around you, # damage to all beside you # times a second, and fly off at monsters for #": "\uCE7C\uB0A0\uC774 \uC8FC\uC704\uB97C \uB3CC\uBA70 \uADFC\uC811\uD55C \uBAA8\uB450\uC5D0\uAC8C \uCD08\uB2F9 {1}\uD68C {0} \uD53C\uD574, \uAD34\uBB3C\uC5D0\uAC8C \uB0A0\uC544\uAC00 {2} \uD53C\uD574",
      Blanched: "\uD45C\uBC31\uB41C",
      Blastbark: "\uD3ED\uBC1C\uAECD\uC9C8",
      Blaze: "\uBD88\uAE38",
      Blazer: "\uAC1C\uCC99\uC790",
      Blazing: "\uD65C\uD65C \uD0C0\uB294",
      "Bless your shield for #s: +#% Chance to Block, +#% Defense; smite what you block for #, and Smite hits harder": "{0}\uCD08\uAC04 \uBC29\uD328\uC5D0 \uCD95\uBCF5: \uB9C9\uAE30 \uD655\uB960 +{1}%, \uBC29\uC5B4\uB825 +{2}%; \uB9C9\uC740 \uC801\uC5D0\uAC8C {3} \uAC15\uD0C0, \uAC15\uD0C0 \uAC15\uD654",
      Blessed: "\uCD95\uBCF5\uBC1B\uC740",
      "Blessed Aim": "\uCD95\uBCF5\uBC1B\uC740 \uC870\uC900",
      "Blessed Hammer": "\uCD95\uBCF5\uBC1B\uC740 \uB9DD\uCE58",
      Blight: "\uB9C8\uB984\uBCD1",
      Blighting: "\uB9C8\uB984\uBCD1\uC758",
      "Blink to the toughest monster ahead and kick it, # damage, releasing all charges": "\uC55E\uCABD\uC758 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC5D0\uAC8C \uC21C\uAC04\uC774\uB3D9\uD574 \uBC1C\uCC28\uAE30, {0} \uD53C\uD574, \uBAA8\uB4E0 \uCDA9\uC804 \uBC29\uCD9C",
      "Blinkbat's Form": "\uC810\uBA78\uBC15\uC950\uC758 \uD615\uC0C1",
      Blister: "\uBB3C\uC9D1",
      Blizzard: "\uB208\uBCF4\uB77C",
      "Blocking with a shield goes by it too": "\uBC29\uD328 \uB9C9\uAE30\uB3C4 \uC774\uC5D0 \uB530\uB984",
      Blood: "\uD53C",
      "Blood Aegis": "\uD53C \uBC29\uD328",
      "Blood Badge": "\uD53C \uD718\uC7A5",
      "Blood Band": "\uD53C \uBC18\uC9C0",
      "Blood Barb": "\uD53C \uBBF8\uB298",
      "Blood Beads": "\uD53C \uAD6C\uC2AC",
      "Blood Bite": "\uD53C \uC774\uBE68",
      "Blood Blazer": "\uD53C \uAC1C\uCC99\uC790",
      "Blood Bludgeon": "\uD53C \uACE4\uBD09",
      "Blood Bolt": "\uD53C \uD654\uC0B4",
      "Blood Branch": "\uD53C \uAC00\uC9C0",
      "Blood Brow": "\uD53C \uC774\uB9C8",
      "Blood Buckle": "\uD53C \uBC84\uD074",
      "Blood Call": "\uD53C \uBD80\uB984",
      "Blood Carapace": "\uD53C \uAC11\uAC01",
      "Blood Casque": "\uD53C \uD22C\uAD6C",
      "Blood Chant": "\uD53C \uCC2C\uAC00",
      "Blood Clasp": "\uD53C \uAC78\uC1E0",
      "Blood Claw": "\uD53C \uBC1C\uD1B1",
      "Blood Cleaver": "\uD53C \uAC00\uB984\uB0A0",
      "Blood Clutches": "\uD53C \uB9C8\uC218",
      "Blood Coat": "\uD53C \uC678\uD22C",
      "Blood Coil": "\uD53C \uACE0\uB9AC",
      "Blood Collar": "\uD53C \uBAA9\uD14C",
      "Blood Cord": "\uD53C \uB048",
      "Blood Cowl": "\uD53C \uC218\uB3C4\uB450\uAC74",
      "Blood Crack": "\uD53C \uADE0\uC5F4",
      "Blood Crescent": "\uD53C\uC758 \uCD08\uC2B9\uB2EC",
      "Blood Crest": "\uD53C \uBB38\uC7A5",
      "Blood Crusher": "\uD53C \uBD84\uC1C4\uAE30",
      "Blood Cry": "\uD53C \uC6B8\uC74C",
      "Blood Dart": "\uD53C \uD22C\uCC3D",
      "Blood Edge": "\uD53C \uCE7C\uB0A0",
      "Blood Emblem": "\uD53C \uC0C1\uC9D5",
      "Blood Eye": "\uD53C \uB208",
      "Blood Fang": "\uD53C \uC1A1\uACF3\uB2C8",
      "Blood Finger": "\uD53C \uC190\uAC00\uB77D",
      "Blood Fist": "\uD53C \uC8FC\uBA39",
      "Blood Fletch": "\uD53C \uD654\uC0B4\uAE43",
      "Blood Flight": "\uD53C \uBE44\uD589",
      "Blood Glare": "\uD53C \uC12C\uAD11",
      "Blood Gnarl": "\uD53C \uC639\uC774",
      "Blood Goad": "\uD53C \uBAB0\uC774\uB9C9\uB300",
      "Blood Golem": "\uD53C \uACE8\uB818",
      "Blood Gorget": "\uD53C \uBAA9\uAC00\uB9AC\uAC1C",
      "Blood Grip": "\uD53C \uC190\uC544\uADC0",
      "Blood Guard": "\uD53C \uC218\uD638",
      "Blood Gutter": "\uD53C \uC808\uAC1C",
      "Blood Gyre": "\uD53C \uC18C\uC6A9\uB3CC\uC774",
      "Blood Hand": "\uD53C \uC190",
      "Blood Hawk": "\uD54F\uBE5B\uB9E4",
      "Blood Heart": "\uD53C \uC2EC\uC7A5",
      "Blood Hew": "\uD53C \uCC0D\uAE30",
      "Blood Hide": "\uD53C \uAC00\uC8FD",
      "Blood Hold": "\uD53C \uC6C0\uCF1C\uC960",
      "Blood Hood": "\uD53C \uB450\uAC74",
      "Blood Horn": "\uD53C \uBFD4",
      "Blood Impaler": "\uD53C \uAD00\uD1B5\uC790",
      "Blood Jack": "\uD53C \uC6C3\uC637",
      "Blood Knell": "\uD53C \uC870\uC885",
      "Blood Knot": "\uD53C \uB9E4\uB4ED",
      "Blood Knuckle": "\uD53C \uC190\uB9C8\uB514",
      "Blood Lance": "\uD53C \uCC3D",
      "Blood Lash": "\uD53C \uCC44\uCC0D",
      "Blood Lock": "\uD53C \uC790\uBB3C\uC1E0",
      "Blood Loop": "\uD53C \uD14C",
      "Blood Mallet": "\uD53C \uB9DD\uCE58",
      "Blood Mangler": "\uD53C \uB09C\uB3C4\uC9C8",
      "Blood Mantle": "\uD53C \uB9DD\uD1A0",
      "Blood Mark": "\uD53C \uD45C\uC2DD",
      "Blood Mask": "\uD53C \uAC00\uBA74",
      "Blood Mauler": "\uD53C \uD30C\uAD34\uC790",
      "Blood Moor": "\uD54F\uBE5B \uD669\uBB34\uC9C0",
      "Blood Nails": "\uD53C \uBABB",
      "Blood Necklace": "\uD53C \uBAA9\uAC78\uC774",
      "Blood Needle": "\uD53C \uBC14\uB298",
      "Blood Nock": "\uD53C \uC2DC\uC704\uD648",
      "Blood Noose": "\uD53C \uC62C\uAC00\uBBF8",
      "Blood Orb": "\uD53C \uBCF4\uC8FC",
      "Blood Pelt": "\uD53C \uBAA8\uD53C",
      "Blood Prod": "\uD53C \uCC0C\uB974\uAE30",
      "Blood Quarrel": "\uD53C \uC1E0\uB1CC\uC0B4",
      "Blood Quill": "\uD53C \uAE43",
      "Blood Raven": "\uD54F\uBE5B \uD070\uAE4C\uB9C8\uADC0",
      "Blood Raven's Charge": "\uD54F\uBE5B \uD070\uAE4C\uB9C8\uADC0\uC758 \uB3CC\uC9C4",
      "Blood Razor": "\uD53C \uBA74\uB3C4\uB0A0",
      "Blood Rend": "\uD53C \uCC22\uAE40",
      "Blood Road": "\uD53C \uAE38",
      "Blood Saw": "\uD53C \uD1B1",
      "Blood Scalpel": "\uD53C \uD574\uBD80\uCE7C",
      "Blood Scarab": "\uD53C \uD48D\uB385\uC774",
      "Blood Scourge": "\uD53C \uC7AC\uC559",
      "Blood Scratch": "\uD53C \uD560\uD034\uAE30",
      "Blood Scythe": "\uD53C \uB0AB",
      "Blood Shard": "\uD53C \uD30C\uD3B8",
      "Blood Shroud": "\uD53C \uC218\uC758",
      "Blood Slippers": "\uD53C \uB367\uC2E0",
      "Blood Smasher": "\uD53C \uBD84\uC1C4\uC790",
      "Blood Song": "\uD53C \uB178\uB798",
      "Blood Spell": "\uD53C \uC8FC\uBB38",
      "Blood Sphere": "\uD53C \uAD6C\uCCB4",
      "Blood Spike": "\uD53C \uAC00\uC2DC",
      "Blood Spiral": "\uD53C \uB098\uC120",
      "Blood Spire": "\uD53C \uCCA8\uD0D1",
      "Blood Spirit": "\uBE14\uB7EC\uB4DC \uC2A4\uD53C\uB9AC\uD2B8",
      "Blood Splitter": "\uD53C \uCABC\uAC1C\uB294\uC790",
      "Blood Spur": "\uD53C \uBC15\uCC28",
      "Blood Stake": "\uD53C \uB9D0\uB69D",
      "Blood Stalk": "\uD53C \uCD94\uC801",
      "Blood Star": "\uD53C \uBCC4",
      "Blood Stinger": "\uD53C \uB3C5\uCE68",
      "Blood Strap": "\uD53C \uB760",
      "Blood Suit": "\uD53C \uAC11\uC637",
      "Blood Sunder": "\uD53C \uC808\uB2E8",
      "Blood Talisman": "\uD53C \uBD80\uC801",
      "Blood Thirst": "\uD53C \uAC08\uC99D",
      "Blood Torc": "\uD53C \uBAA9\uACE0\uB9AC",
      "Blood Tower": "\uD53C \uD0D1",
      "Blood Track": "\uD53C \uBC1C\uC790\uAD6D",
      "Blood Trample": "\uD53C \uC9D3\uBC1F\uAE30",
      "Blood Turn": "\uD53C \uD68C\uC804",
      "Blood Veil": "\uD53C \uC7A5\uB9C9",
      "Blood Visage": "\uD53C \uC5BC\uAD74",
      "Blood Ward": "\uD53C \uBCF4\uD638",
      "Blood Weaver": "\uD53C \uC9C1\uC870\uC790",
      "Blood Wing": "\uD53C \uB0A0\uAC1C",
      "Blood Wrack": "\uD53C \uACE0\uBB38",
      Bloodfist: "\uD53C\uC8FC\uBA39",
      "Bloodlord Skull": "\uBE14\uB7EC\uB4DC\uB85C\uB4DC \uC2A4\uCEEC",
      Bloodrise: "\uD53C\uC624\uB984",
      "Bloodwitch the Wild": "\uC57C\uC0DD\uC758 \uBE14\uB7EC\uB4DC\uC704\uCE58",
      Bloody: "\uD54F\uBE5B",
      "Bloody Foothills": "\uD54F\uBE5B \uC5B8\uB355",
      "Blow up a corpse near monsters: # damage plus #% of its life, radius #. Its own dead don't blow up": "\uAD34\uBB3C \uADFC\uCC98\uC758 \uC2DC\uCCB4\uB97C \uD3ED\uD30C: {0} + \uC2DC\uCCB4 \uC0DD\uBA85\uB825\uC758 {1}% \uD53C\uD574, \uBC18\uACBD {2}. \uC774 \uD3ED\uBC1C\uB85C \uC8FD\uC740 \uC801\uC740 \uD130\uC9C0\uC9C0 \uC54A\uC74C",
      Bludgeon: "\uACE4\uBD09",
      bolt: "\uD0C4\uD658",
      Bone: "\uBF08\uC758",
      "Bone Aegis": "\uBF08 \uBC29\uD328",
      "Bone Armor": "\uBF08 \uAC11\uC637",
      "Bone Badge": "\uBF08 \uD718\uC7A5",
      "Bone Band": "\uBF08 \uBC18\uC9C0",
      "Bone Barb": "\uBF08 \uBBF8\uB298",
      "Bone Beads": "\uBF08 \uAD6C\uC2AC",
      "Bone Bite": "\uBF08 \uC774\uBE68",
      "Bone Blazer": "\uBF08 \uAC1C\uCC99\uC790",
      "Bone Bludgeon": "\uBF08 \uACE4\uBD09",
      "Bone Bolt": "\uBF08 \uD654\uC0B4",
      "Bone Branch": "\uBF08 \uAC00\uC9C0",
      "Bone Brow": "\uBF08 \uC774\uB9C8",
      "Bone Buckle": "\uBF08 \uBC84\uD074",
      "Bone Call": "\uBF08 \uBD80\uB984",
      "Bone Carapace": "\uBF08 \uAC11\uAC01",
      "Bone Casque": "\uBF08 \uD22C\uAD6C",
      "Bone Chant": "\uBF08 \uCC2C\uAC00",
      "Bone Clasp": "\uBF08 \uAC78\uC1E0",
      "Bone Claw": "\uBF08 \uBC1C\uD1B1",
      "Bone Cleaver": "\uBF08 \uAC00\uB984\uB0A0",
      "Bone Clutches": "\uBF08 \uB9C8\uC218",
      "Bone Coat": "\uBF08 \uC678\uD22C",
      "Bone Coil": "\uBF08 \uACE0\uB9AC",
      "Bone Collar": "\uBF08 \uBAA9\uD14C",
      "Bone Cord": "\uBF08 \uB048",
      "Bone Cowl": "\uBF08 \uC218\uB3C4\uB450\uAC74",
      "Bone Crack": "\uBF08 \uADE0\uC5F4",
      "Bone Crest": "\uBF08 \uBB38\uC7A5",
      "Bone Crusher": "\uBF08 \uBD84\uC1C4\uAE30",
      "Bone Cry": "\uBF08 \uC6B8\uC74C",
      "Bone Dart": "\uBF08 \uD22C\uCC3D",
      "Bone Edge": "\uBF08 \uCE7C\uB0A0",
      "Bone Emblem": "\uBF08 \uC0C1\uC9D5",
      "Bone Eye": "\uBF08 \uB208",
      "Bone Fang": "\uBF08 \uC1A1\uACF3\uB2C8",
      "Bone Finger": "\uBF08 \uC190\uAC00\uB77D",
      "Bone Fist": "\uBF08 \uC8FC\uBA39",
      "Bone Fletch": "\uBF08 \uD654\uC0B4\uAE43",
      "Bone Flight": "\uBF08 \uBE44\uD589",
      "Bone Glare": "\uBF08 \uC12C\uAD11",
      "Bone Gnarl": "\uBF08 \uC639\uC774",
      "Bone Goad": "\uBF08 \uBAB0\uC774\uB9C9\uB300",
      "Bone Gorget": "\uBF08 \uBAA9\uAC00\uB9AC\uAC1C",
      "Bone Grip": "\uBF08 \uC190\uC544\uADC0",
      "Bone Guard": "\uBF08 \uC218\uD638",
      "Bone Gutter": "\uBF08 \uC808\uAC1C",
      "Bone Gyre": "\uBF08 \uC18C\uC6A9\uB3CC\uC774",
      "Bone Hand": "\uBF08 \uC190",
      "Bone Heart": "\uBF08 \uC2EC\uC7A5",
      "Bone Hew": "\uBF08 \uCC0D\uAE30",
      "Bone Hide": "\uBF08 \uAC00\uC8FD",
      "Bone Hold": "\uBF08 \uC6C0\uCF1C\uC960",
      "Bone Hood": "\uBF08 \uB450\uAC74",
      "Bone Horn": "\uBF08 \uBFD4",
      "Bone Impaler": "\uBF08 \uAD00\uD1B5\uC790",
      "Bone Jack": "\uBF08 \uC6C3\uC637",
      "Bone Knell": "\uBF08 \uC870\uC885",
      "Bone Knife": "\uBCF8 \uB098\uC774\uD504",
      "Bone Knot": "\uBF08 \uB9E4\uB4ED",
      "Bone Knuckle": "\uBF08 \uC190\uB9C8\uB514",
      "Bone Lance": "\uBF08 \uCC3D",
      "Bone Lash": "\uBF08 \uCC44\uCC0D",
      "Bone Lock": "\uBF08 \uC790\uBB3C\uC1E0",
      "Bone Loop": "\uBF08 \uD14C",
      "Bone Mallet": "\uBF08 \uB9DD\uCE58",
      "Bone Mangler": "\uBF08 \uB09C\uB3C4\uC9C8",
      "Bone Mantle": "\uBF08 \uB9DD\uD1A0",
      "Bone Mark": "\uBF08 \uD45C\uC2DD",
      "Bone Mask": "\uBF08 \uAC00\uBA74",
      "Bone Mauler": "\uBF08 \uD30C\uAD34\uC790",
      "Bone Nails": "\uBF08 \uBABB",
      "Bone Necklace": "\uBF08 \uBAA9\uAC78\uC774",
      "Bone Needle": "\uBF08 \uBC14\uB298",
      "Bone Nock": "\uBF08 \uC2DC\uC704\uD648",
      "Bone Noose": "\uBF08 \uC62C\uAC00\uBBF8",
      "Bone Orb": "\uBF08 \uBCF4\uC8FC",
      "Bone Pelt": "\uBF08 \uBAA8\uD53C",
      "Bone Prison": "\uBF08 \uAC10\uC625",
      "Bone Prod": "\uBF08 \uCC0C\uB974\uAE30",
      "Bone Quarrel": "\uBF08 \uC1E0\uB1CC\uC0B4",
      "Bone Quill": "\uBF08 \uAE43",
      "Bone Razor": "\uBF08 \uBA74\uB3C4\uB0A0",
      "Bone Rend": "\uBF08 \uCC22\uAE40",
      "Bone Road": "\uBF08 \uAE38",
      "Bone Saw": "\uBF08 \uD1B1",
      "Bone Scalpel": "\uBF08 \uD574\uBD80\uCE7C",
      "Bone Scarab": "\uBF08 \uD48D\uB385\uC774",
      "Bone Scourge": "\uBF08 \uC7AC\uC559",
      "Bone Scratch": "\uBF08 \uD560\uD034\uAE30",
      "Bone Scythe": "\uBF08 \uB0AB",
      "Bone Shard": "\uBF08 \uD30C\uD3B8",
      "Bone Shield": "\uBCF8 \uC274\uB4DC",
      "Bone Shroud": "\uBF08 \uC218\uC758",
      "Bone Slippers": "\uBF08 \uB367\uC2E0",
      "Bone Smasher": "\uBF08 \uBD84\uC1C4\uC790",
      "Bone Song": "\uBF08 \uB178\uB798",
      "Bone Spear": "\uBF08 \uCC3D",
      "Bone Spell": "\uBF08 \uC8FC\uBB38",
      "Bone Sphere": "\uBF08 \uAD6C\uCCB4",
      "Bone Spike": "\uBF08 \uAC00\uC2DC",
      "Bone Spiral": "\uBF08 \uB098\uC120",
      "Bone Spire": "\uBF08 \uCCA8\uD0D1",
      "Bone Spirit": "\uBF08 \uC601\uD63C",
      "Bone Splitter": "\uBF08 \uCABC\uAC1C\uB294\uC790",
      "Bone Spur": "\uBF08 \uBC15\uCC28",
      "Bone Stake": "\uBF08 \uB9D0\uB69D",
      "Bone Stalk": "\uBF08 \uCD94\uC801",
      "Bone Star": "\uBF08 \uBCC4",
      "Bone Stinger": "\uBF08 \uB3C5\uCE68",
      "Bone Strap": "\uBF08 \uB760",
      "Bone Suit": "\uBF08 \uAC11\uC637",
      "Bone Sunder": "\uBF08 \uC808\uB2E8",
      "Bone Talisman": "\uBF08 \uBD80\uC801",
      "Bone Thirst": "\uBF08 \uAC08\uC99D",
      "Bone Torc": "\uBF08 \uBAA9\uACE0\uB9AC",
      "Bone Tower": "\uBF08 \uD0D1",
      "Bone Track": "\uBF08 \uBC1C\uC790\uAD6D",
      "Bone Trample": "\uBF08 \uC9D3\uBC1F\uAE30",
      "Bone Turn": "\uBF08 \uD68C\uC804",
      "Bone Veil": "\uBF08 \uC7A5\uB9C9",
      "Bone Visage": "\uBF08 \uC5BC\uAD74",
      "Bone Wall": "\uBF08\uC758 \uBCBD",
      "Bone walls cage the # near you for #s, bosses too (act bosses half as long)": "\uBF08 \uBCBD\uC774 \uC8FC\uBCC0 {0}\uC744(\uB97C) {1}\uCD08\uAC04 \uAC00\uB460, \uC6B0\uB450\uBA38\uB9AC \uD3EC\uD568 (\uB9C9 \uC6B0\uB450\uBA38\uB9AC\uB294 \uC808\uBC18)",
      "Bone Wand": "\uBCF8 \uC6D0\uB4DC",
      "Bone Ward": "\uBF08 \uBCF4\uD638",
      "Bone Weaver": "\uBF08 \uC9C1\uC870\uC790",
      "Bone Wing": "\uBF08 \uB0A0\uAC1C",
      "Bone Wrack": "\uBF08 \uACE0\uBB38",
      "Bone, poison, curses and the raised dead": "\uBF08, \uB3C5, \uC800\uC8FC, \uB418\uC0B4\uB9B0 \uB9DD\uC790",
      Bonebreaker: "\uBCF8\uBE0C\uB808\uC774\uCEE4",
      Boneflame: "\uBF08\uBD88\uAE38",
      Bonehew: "\uBF08\uC790\uB974\uAC1C",
      "Bonesaw Breaker": "\uBF08\uD1B1 \uD30C\uAD34\uC790",
      Boneshade: "\uBF08\uADF8\uB298",
      Boneweave: "\uBCF8\uC704\uBE0C",
      "Boneweave Boots": "\uBCF8\uC704\uBE0C \uBD80\uCE20",
      "Bonus to Attack Rating": "\uBA85\uC911\uB960 \uBCF4\uB108\uC2A4",
      Boots: "\uBD80\uCE20",
      Boreal: "\uBD81\uB158\uC758",
      Boss: "\uC6B0\uB450\uBA38\uB9AC",
      "Bow and Crossbow Skills": "\uD65C\uACFC \uC11D\uAD81 \uAE30\uC220",
      "Bows, javelins and a warrior\u2019s reflexes": "\uD65C, \uD22C\uCC3D, \uC804\uC0AC\uC758 \uBC18\uC0AC\uC2E0\uACBD",
      "Bowyer's": "\uD65C\uC7A1\uC774\uC758",
      Brainhew: "\uB1CC\uC808\uB2E8\uAE30",
      "Bramble Mitts": "\uBE0C\uB7A8\uBE14 \uBBF8\uD2B8",
      Branch: "\uAC00\uC9C0",
      Brazier: "\uD654\uB85C",
      Break: "\uAE68\uBD80\uC228",
      "Bremm Sparkfist": "\uBE0C\uB818 \uC2A4\uD30C\uD06C\uD53C\uC2A4\uD2B8",
      Brimstone: "\uC720\uD669",
      "Brimstone Aegis": "\uC720\uD669 \uBC29\uD328",
      "Brimstone Badge": "\uC720\uD669 \uD718\uC7A5",
      "Brimstone Band": "\uC720\uD669 \uBC18\uC9C0",
      "Brimstone Barb": "\uC720\uD669 \uBBF8\uB298",
      "Brimstone Beads": "\uC720\uD669 \uAD6C\uC2AC",
      "Brimstone Bite": "\uC720\uD669 \uC774\uBE68",
      "Brimstone Blazer": "\uC720\uD669 \uAC1C\uCC99\uC790",
      "Brimstone Bludgeon": "\uC720\uD669 \uACE4\uBD09",
      "Brimstone Bolt": "\uC720\uD669 \uD654\uC0B4",
      "Brimstone Branch": "\uC720\uD669 \uAC00\uC9C0",
      "Brimstone Brow": "\uC720\uD669 \uC774\uB9C8",
      "Brimstone Buckle": "\uC720\uD669 \uBC84\uD074",
      "Brimstone Call": "\uC720\uD669 \uBD80\uB984",
      "Brimstone Carapace": "\uC720\uD669 \uAC11\uAC01",
      "Brimstone Casque": "\uC720\uD669 \uD22C\uAD6C",
      "Brimstone Chant": "\uC720\uD669 \uCC2C\uAC00",
      "Brimstone Clasp": "\uC720\uD669 \uAC78\uC1E0",
      "Brimstone Claw": "\uC720\uD669 \uBC1C\uD1B1",
      "Brimstone Cleaver": "\uC720\uD669 \uAC00\uB984\uB0A0",
      "Brimstone Clutches": "\uC720\uD669 \uB9C8\uC218",
      "Brimstone Coat": "\uC720\uD669 \uC678\uD22C",
      "Brimstone Coil": "\uC720\uD669 \uACE0\uB9AC",
      "Brimstone Collar": "\uC720\uD669 \uBAA9\uD14C",
      "Brimstone Cord": "\uC720\uD669 \uB048",
      "Brimstone Cowl": "\uC720\uD669 \uC218\uB3C4\uB450\uAC74",
      "Brimstone Crack": "\uC720\uD669 \uADE0\uC5F4",
      "Brimstone Crest": "\uC720\uD669 \uBB38\uC7A5",
      "Brimstone Crusher": "\uC720\uD669 \uBD84\uC1C4\uAE30",
      "Brimstone Cry": "\uC720\uD669 \uC6B8\uC74C",
      "Brimstone Dart": "\uC720\uD669 \uD22C\uCC3D",
      "Brimstone Edge": "\uC720\uD669 \uCE7C\uB0A0",
      "Brimstone Emblem": "\uC720\uD669 \uC0C1\uC9D5",
      "Brimstone Eye": "\uC720\uD669 \uB208",
      "Brimstone Fang": "\uC720\uD669 \uC1A1\uACF3\uB2C8",
      "Brimstone Finger": "\uC720\uD669 \uC190\uAC00\uB77D",
      "Brimstone Fist": "\uC720\uD669 \uC8FC\uBA39",
      "Brimstone Fletch": "\uC720\uD669 \uD654\uC0B4\uAE43",
      "Brimstone Flight": "\uC720\uD669 \uBE44\uD589",
      "Brimstone Glare": "\uC720\uD669 \uC12C\uAD11",
      "Brimstone Gnarl": "\uC720\uD669 \uC639\uC774",
      "Brimstone Goad": "\uC720\uD669 \uBAB0\uC774\uB9C9\uB300",
      "Brimstone Gorget": "\uC720\uD669 \uBAA9\uAC00\uB9AC\uAC1C",
      "Brimstone Grip": "\uC720\uD669 \uC190\uC544\uADC0",
      "Brimstone Guard": "\uC720\uD669 \uC218\uD638",
      "Brimstone Gutter": "\uC720\uD669 \uC808\uAC1C",
      "Brimstone Gyre": "\uC720\uD669 \uC18C\uC6A9\uB3CC\uC774",
      "Brimstone Hand": "\uC720\uD669 \uC190",
      "Brimstone Heart": "\uC720\uD669 \uC2EC\uC7A5",
      "Brimstone Hew": "\uC720\uD669 \uCC0D\uAE30",
      "Brimstone Hide": "\uC720\uD669 \uAC00\uC8FD",
      "Brimstone Hold": "\uC720\uD669 \uC6C0\uCF1C\uC960",
      "Brimstone Hood": "\uC720\uD669 \uB450\uAC74",
      "Brimstone Horn": "\uC720\uD669 \uBFD4",
      "Brimstone Impaler": "\uC720\uD669 \uAD00\uD1B5\uC790",
      "Brimstone Jack": "\uC720\uD669 \uC6C3\uC637",
      "Brimstone Knell": "\uC720\uD669 \uC870\uC885",
      "Brimstone Knot": "\uC720\uD669 \uB9E4\uB4ED",
      "Brimstone Knuckle": "\uC720\uD669 \uC190\uB9C8\uB514",
      "Brimstone Lance": "\uC720\uD669 \uCC3D",
      "Brimstone Lash": "\uC720\uD669 \uCC44\uCC0D",
      "Brimstone Lock": "\uC720\uD669 \uC790\uBB3C\uC1E0",
      "Brimstone Loop": "\uC720\uD669 \uD14C",
      "Brimstone Mallet": "\uC720\uD669 \uB9DD\uCE58",
      "Brimstone Mangler": "\uC720\uD669 \uB09C\uB3C4\uC9C8",
      "Brimstone Mantle": "\uC720\uD669 \uB9DD\uD1A0",
      "Brimstone Mark": "\uC720\uD669 \uD45C\uC2DD",
      "Brimstone Mask": "\uC720\uD669 \uAC00\uBA74",
      "Brimstone Mauler": "\uC720\uD669 \uD30C\uAD34\uC790",
      "Brimstone Nails": "\uC720\uD669 \uBABB",
      "Brimstone Necklace": "\uC720\uD669 \uBAA9\uAC78\uC774",
      "Brimstone Needle": "\uC720\uD669 \uBC14\uB298",
      "Brimstone Nock": "\uC720\uD669 \uC2DC\uC704\uD648",
      "Brimstone Noose": "\uC720\uD669 \uC62C\uAC00\uBBF8",
      "Brimstone Orb": "\uC720\uD669 \uBCF4\uC8FC",
      "Brimstone Pelt": "\uC720\uD669 \uBAA8\uD53C",
      "Brimstone Prod": "\uC720\uD669 \uCC0C\uB974\uAE30",
      "Brimstone Quarrel": "\uC720\uD669 \uC1E0\uB1CC\uC0B4",
      "Brimstone Quill": "\uC720\uD669 \uAE43",
      "Brimstone Razor": "\uC720\uD669 \uBA74\uB3C4\uB0A0",
      "Brimstone Rend": "\uC720\uD669 \uCC22\uAE40",
      "Brimstone Road": "\uC720\uD669 \uAE38",
      "Brimstone Saw": "\uC720\uD669 \uD1B1",
      "Brimstone Scalpel": "\uC720\uD669 \uD574\uBD80\uCE7C",
      "Brimstone Scarab": "\uC720\uD669 \uD48D\uB385\uC774",
      "Brimstone Scourge": "\uC720\uD669 \uC7AC\uC559",
      "Brimstone Scratch": "\uC720\uD669 \uD560\uD034\uAE30",
      "Brimstone Scythe": "\uC720\uD669 \uB0AB",
      "Brimstone Shard": "\uC720\uD669 \uD30C\uD3B8",
      "Brimstone Shroud": "\uC720\uD669 \uC218\uC758",
      "Brimstone Slippers": "\uC720\uD669 \uB367\uC2E0",
      "Brimstone Smasher": "\uC720\uD669 \uBD84\uC1C4\uC790",
      "Brimstone Song": "\uC720\uD669 \uB178\uB798",
      "Brimstone Spell": "\uC720\uD669 \uC8FC\uBB38",
      "Brimstone Sphere": "\uC720\uD669 \uAD6C\uCCB4",
      "Brimstone Spike": "\uC720\uD669 \uAC00\uC2DC",
      "Brimstone Spiral": "\uC720\uD669 \uB098\uC120",
      "Brimstone Spire": "\uC720\uD669 \uCCA8\uD0D1",
      "Brimstone Splitter": "\uC720\uD669 \uCABC\uAC1C\uB294\uC790",
      "Brimstone Spur": "\uC720\uD669 \uBC15\uCC28",
      "Brimstone Stake": "\uC720\uD669 \uB9D0\uB69D",
      "Brimstone Stalk": "\uC720\uD669 \uCD94\uC801",
      "Brimstone Star": "\uC720\uD669 \uBCC4",
      "Brimstone Stinger": "\uC720\uD669 \uB3C5\uCE68",
      "Brimstone Strap": "\uC720\uD669 \uB760",
      "Brimstone Suit": "\uC720\uD669 \uAC11\uC637",
      "Brimstone Sunder": "\uC720\uD669 \uC808\uB2E8",
      "Brimstone Talisman": "\uC720\uD669 \uBD80\uC801",
      "Brimstone Thirst": "\uC720\uD669 \uAC08\uC99D",
      "Brimstone Torc": "\uC720\uD669 \uBAA9\uACE0\uB9AC",
      "Brimstone Tower": "\uC720\uD669 \uD0D1",
      "Brimstone Track": "\uC720\uD669 \uBC1C\uC790\uAD6D",
      "Brimstone Trample": "\uC720\uD669 \uC9D3\uBC1F\uAE30",
      "Brimstone Turn": "\uC720\uD669 \uD68C\uC804",
      "Brimstone Veil": "\uC720\uD669 \uC7A5\uB9C9",
      "Brimstone Visage": "\uC720\uD669 \uC5BC\uAD74",
      "Brimstone Ward": "\uC720\uD669 \uBCF4\uD638",
      "Brimstone Weaver": "\uC720\uD669 \uC9C1\uC870\uC790",
      "Brimstone Wing": "\uC720\uD669 \uB0A0\uAC1C",
      "Brimstone Wrack": "\uC720\uD669 \uACE0\uBB38",
      "Bring it back to Tristram, in a harder world.": "\uB354 \uD5D8\uB09C\uD55C \uC138\uACC4\uC5D0\uC11C, \uD2B8\uB9AC\uC2A4\uD2B8\uB7FC\uC73C\uB85C \uAC00\uC838\uAC00\uB77C.",
      "Broad Sword": "\uBE0C\uB85C\uB4DC\uC18C\uB4DC",
      Bronze: "\uCCAD\uB3D9\uC758",
      Brow: "\uC774\uB9C8",
      Brutal: "\uC794\uC778\uD55C",
      Brute: "\uAC70\uC218",
      Buckle: "\uBC84\uD074",
      Buckler: "\uBC84\uD074\uB7EC",
      "Build *": "\uBE4C\uB4DC {0}",
      "Build # is ready": "\uBE4C\uB4DC {0} \uC900\uBE44 \uC644\uB8CC",
      "Build # is ready: see the main menu": "\uBE4C\uB4DC {0} \uC900\uBE44 \uC644\uB8CC: \uBA54\uC778 \uBA54\uB274\uB97C \uD655\uC778\uD558\uC138\uC694",
      "Build complete": "\uBE4C\uB4DC \uC644\uC131",
      "Bul-Kathos' Wedding Band": "\uBD88\uCE74\uD1A0\uC2A4\uC758 \uACB0\uD63C\uBC18\uC9C0",
      "Buriza-Do Kyanon": "\uB208\uBCF4\uB77C \uD3EC",
      Burn: "\uD654\uC0C1",
      Burning: "\uBD88\uD0C0\uB294",
      "Burnt Wand": "\uBC88\uD2B8 \uC6D0\uB4DC",
      "Burst of Speed": "\uD3ED\uBC1C\uC801\uC778 \uC18D\uB3C4",
      Buy: "\uAD6C\uB9E4",
      "Buy Back": "\uB418\uC0AC\uAE30",
      "Buy back (B)": "\uB418\uC0AC\uAE30 (B)",
      Buzzing: "\uC6C5\uC6C5\uAC70\uB9AC\uB294",
      "Bverrit Keep": "\uBE0C\uBCA0\uB9AC\uD2B8 \uC131\uCC44",
      Caduceus: "\uCE74\uB450\uC138\uC6B0\uC2A4",
      Call: "\uBD80\uB984",
      Calling: "\uBD80\uB974\uB294",
      "Campfire (Enter)": "\uBAA8\uB2E5\uBD88 (Enter)",
      Camphor: "\uC7A5\uB1CC",
      CANCEL: "\uCDE8\uC18C",
      "Cancel (Esc)": "\uCDE8\uC18C (Esc)",
      "Cannot Be Frozen": "\uBE59\uACB0\uB418\uC9C0 \uC54A\uC74C",
      "Cantor Trophy": "\uCE94\uD130 \uD2B8\uB85C\uD53C",
      Cap: "\uCEA1",
      "Captain's": "\uB300\uC7A5\uC758",
      Carapace: "\uAC11\uAC01",
      Carbuncle: "\uC11D\uB958\uC0C9",
      "Caretaker's": "\uAD00\uB9AC\uC778\uC758",
      "Carin Shard": "\uCE74\uB9B0 \uD30C\uD3B8",
      Carmine: "\uB2E8\uD64D\uC0C9",
      "Carnage Helm": "\uCE74\uB2C8\uC9C0 \uD5EC\uB984",
      "Carrion Vine": "\uCCAD\uC18C\uBD80 \uB369\uAD74",
      "Carry your gold, Charsi's upgrades and gear to D2 Survivors in another browser or on another device.": "\uACE8\uB4DC\uC640 \uCC30\uC2DC\uC758 \uC5C5\uADF8\uB808\uC774\uB4DC, \uC7A5\uBE44\uB97C \uB2E4\uB978 \uBE0C\uB77C\uC6B0\uC800\uB098 \uAE30\uAE30\uC758 D2 Survivors\uB85C \uC62E\uAE41\uB2C8\uB2E4.",
      Casque: "\uCE90\uC2A4\uD06C",
      cast: "\uC2DC\uC804",
      casts: "\uC2DC\uC804\uD574",
      Catacombs: "\uC9C0\uD558 \uBB18\uC9C0",
      "Catacombs Level 4": "\uC9C0\uD558 \uBB18\uC9C0 4\uCE35",
      "Cedar Bow": "\uC2DC\uB354 \uBCF4\uC6B0",
      "Cedar Staff": "\uC2DC\uB354 \uC2A4\uD0DC\uD504",
      Celestial: "\uCC9C\uACF5\uC758",
      "Cerebus' Bite": "\uC138\uB808\uBD80\uC2A4\uC758 \uC774\uBE68",
      "Ceremonial Bow": "\uC138\uB7EC\uBAA8\uB2C8\uC5BC \uBCF4\uC6B0",
      "Ceremonial Javelin": "\uC138\uB7EC\uBAA8\uB2C8\uC5BC \uC7AC\uBC8C\uB9B0",
      "Ceremonial Pike": "\uC138\uB7EC\uBAA8\uB2C8\uC5BC \uD30C\uC774\uD06C",
      "Ceremonial Spear": "\uC138\uB7EC\uBAA8\uB2C8\uC5BC \uC2A4\uD53C\uC5B4",
      Cestus: "\uC138\uC2A4\uD130\uC2A4",
      "Chain Boots": "\uCCB4\uC778 \uBD80\uCE20",
      "Chain Gloves": "\uCCB4\uC778 \uAE00\uB7EC\uBE0C",
      "Chain Lightning": "\uC5F0\uC1C4 \uBC88\uAC1C",
      "Chain Mail": "\uCCB4\uC778 \uBA54\uC77C",
      Champion: "\uC815\uC608 \uAD34\uBB3C",
      "Champion Axe": "\uCC54\uD53C\uC5B8 \uC561\uC2A4",
      "Chance a physical hit makes the monster bleed for # seconds": "\uBB3C\uB9AC \uACF5\uACA9 \uC2DC \uAD34\uBB3C\uC744 {0}\uCD08\uAC04 \uCD9C\uD608\uC2DC\uD0AC \uD655\uB960",
      "Chance a physical hit takes a quarter of the monster's life, an eighth of a boss's; half that for missiles": "\uBB3C\uB9AC \uACF5\uACA9 \uC2DC \uAD34\uBB3C \uC0DD\uBA85\uB825\uC758 1/4(\uC6B0\uB450\uBA38\uB9AC\uB294 1/8)\uC744 \uAE4E\uC744 \uD655\uB960, \uC6D0\uAC70\uB9AC \uACF5\uACA9\uC740 \uADF8 \uC808\uBC18",
      "Chance Guards": "\uD589\uC6B4\uC758 \uC7A5\uAC11",
      "Chance of a critical strike: double damage": "\uCE58\uBA85\uD0C0 \uD655\uB960: 2\uBC30 \uD53C\uD574",
      "Chance of Crushing Blow": "\uAC15\uD0C0 \uD655\uB960",
      "Chance of Open Wounds": "\uC0C1\uCC98 \uC545\uD654 \uD655\uB960",
      "Chance to Block: ": "\uB9C9\uAE30 \uD655\uB960:",
      Chant: "\uCC2C\uAC00",
      Chaos: "\uD63C\uB3C8",
      "Chaos Sanctuary": "\uD63C\uB3C8\uC758 \uC131\uC5ED",
      Character: "\uCE90\uB9AD\uD130",
      Charge: "\uB3CC\uC9C4",
      "Charge # times along your path, # damage in the way, a holy burst at each stop": "\uC9C4\uD589 \uBC29\uD5A5\uC73C\uB85C {0}\uD68C \uB3CC\uC9C4, \uAE38\uBAA9\uC5D0 {1} \uD53C\uD574, \uBA48\uCD9C \uB54C\uB9C8\uB2E4 \uC2E0\uC131\uD55C \uD3ED\uBC1C",
      Charged: "\uCDA9\uC804\uB41C",
      "Charged Bolt": "\uBC88\uAC1C \uC904\uAE30",
      "Charged Bolt Sentry": "\uBC88\uAC1C \uC904\uAE30 \uD30C\uC218\uAE30",
      "Charged Strike": "\uC804\uB958\uC758 \uC77C\uACA9",
      Charsi: "\uCC30\uC2DC",
      "Charsi won't buy that": "\uCC30\uC2DC\uB294 \uC774\uAC83\uC744 \uC0AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "Charsi's Wares": "\uCC30\uC2DC\uC758 \uBB3C\uD488",
      "Charsi's wares (B)": "\uCC30\uC2DC\uC758 \uBB3C\uD488 (B)",
      "Charsi's wares (G)": "\uCC30\uC2DC\uC758 \uBB3C\uD488 (G)",
      "Checking for updates...": "\uC5C5\uB370\uC774\uD2B8 \uD655\uC778 \uC911...",
      chill: "\uC624\uD55C",
      Chilling: "\uB0C9\uAE30\uC758",
      "Chilling Armor": "\uB0C9\uAE30 \uAC11\uC637",
      "Chilling Armor, #s: melee attackers take # cold, chilled #s; shooters a # ice bolt; #% miss": "\uB0C9\uAE30 \uAC11\uC637, {0}\uCD08: \uADFC\uC811 \uACF5\uACA9\uC790\uB294 {1} \uB0C9\uAE30 \uD53C\uD574, {2}\uCD08 \uC624\uD55C; \uC6D0\uAC70\uB9AC \uACF5\uACA9\uC790\uC5D0\uAC90 {3} \uC5BC\uC74C\uC0B4; {4}% \uBE57\uB098\uAC10",
      chills: "\uC624\uD55C\uC744 \uBD80\uC5EC\uD574",
      "Chipped Gem": "\uC870\uC7A1\uD55C \uBCF4\uC11D",
      Choose: "\uC120\uD0DD",
      "Choose class": "\uC9C1\uC5C5 \uC120\uD0DD",
      Chromatic: "\uB2E4\uCC44\uB85C\uC6B4",
      Cinnabar: "\uC120\uD64D\uC0C9",
      Circlet: "\uC368\uD074\uB9BF",
      "City of the Damned": "\uC800\uC8FC\uBC1B\uC740 \uC790\uB4E4\uC758 \uB3C4\uC2DC",
      Clasp: "\uAC78\uC1E0",
      "Clasped Orb": "\uD074\uB798\uC2A4\uD504\uB4DC \uC624\uBE0C",
      Claw: "\uBC1C\uD1B1",
      "Claw Mastery": "\uC190\uD1B1 \uC219\uB828",
      "Claw Viper Temple": "\uBC1C\uD1B1 \uB3C5\uC0AC \uC0AC\uC6D0",
      Claws: "\uD074\uB7EC",
      "Claws at the toughest in reach, # damage; every fourth blow bursts in fire, # around it": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC744 \uC190\uD1B1\uC73C\uB85C \uACF5\uACA9, {0} \uD53C\uD574; \uB124 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uD654\uC5FC \uD3ED\uBC1C, \uC8FC\uBCC0\uC5D0 {1}",
      "Claws at the toughest in reach, # damage; every fourth blow drains # more, healing #% of it": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC744 \uC190\uD1B1\uC73C\uB85C \uACF5\uACA9, {0} \uD53C\uD574; \uB124 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 {1} \uCD94\uAC00 \uD761\uC218, \uADF8 {2}% \uD68C\uBCF5",
      "Claws at the toughest in reach, # damage; every fourth blow releases # charges, +#% each": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC744 \uC190\uD1B1\uC73C\uB85C \uACF5\uACA9, {0} \uD53C\uD574; \uB124 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uCDA9\uC804 {1}\uAC1C \uBC29\uCD9C, \uAC01 +{2}%",
      "Claws of Thunder": "\uCC9C\uB465\uC758 \uC190\uD1B1",
      "Claws, # damage; every fourth blow a thunder nova, # damage, and charged bolts": "\uC190\uD1B1 \uACF5\uACA9, {0} \uD53C\uD574; \uB124 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uCC9C\uB465 \uD30C\uC7A5, {1} \uD53C\uD574\uC640 \uBC88\uAC1C \uC904\uAE30",
      "Claws, # damage; every fourth blow shatters ice, # damage around and a long chill": "\uC190\uD1B1 \uACF5\uACA9, {0} \uD53C\uD574; \uB124 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uC5BC\uC74C \uD30C\uC1C4, \uC8FC\uBCC0\uC5D0 {1} \uD53C\uD574\uC640 \uAE34 \uC624\uD55C",
      "Claws, # damage: a meteor (#), chain lightning (#), then chaos ice; every fourth all three": "\uC190\uD1B1 \uACF5\uACA9, {0} \uD53C\uD574: \uC6B4\uC11D \uB099\uD558({1}), \uC5F0\uC1C4 \uBC88\uAC1C({2}), \uADF8\uB2E4\uC74C \uD63C\uB3C8\uC758 \uC5BC\uC74C; \uB124 \uBC88\uC9F8\uB9C8\uB2E4 \uC14B \uBAA8\uB450",
      "Clay Golem": "\uC810\uD1A0 \uACE8\uB818",
      Claymore: "\uD074\uB808\uC774\uBAA8\uC5B4",
      Cleansing: "\uC815\uD654",
      Cleaver: "\uD074\uB9AC\uBC84",
      Click: "\uD074\uB9AD",
      "Click a ware to buy it": "\uBB3C\uAC74\uC744 \uD074\uB9AD\uD558\uC5EC \uAD6C\uB9E4",
      "Click an item to buy it back": "\uC544\uC774\uD15C\uC744 \uD074\uB9AD\uD558\uC5EC \uB418\uC0AC\uAE30",
      "Click an item to gamble": "\uC544\uC774\uD15C\uC744 \uD074\uB9AD\uD558\uC5EC \uB3C4\uBC15",
      "Click for every skill (T)": "\uD074\uB9AD: \uBAA8\uB4E0 \uAE30\uC220 (T)",
      "Click or press any key": "\uD074\uB9AD\uD558\uAC70\uB098 \uC544\uBB34 \uD0A4\uB098 \uB204\uB974\uC2ED\uC2DC\uC624",
      "Click to pick up \xB7 Ctrl-click to move across \xB7 Right-click to equip": "\uD074\uB9AD: \uC90D\uAE30 \xB7 Ctrl+\uD074\uB9AD: \uC62E\uAE30\uAE30 \xB7 \uC6B0\uD074\uB9AD: \uC7A5\uCC29",
      "Click to pick up \xB7 Right-click to equip \xB7 Shift-click to sell \xB7 Esc to close": "\uD074\uB9AD: \uC90D\uAE30 \xB7 \uC6B0\uD074\uB9AD: \uC7A5\uCC29 \xB7 Shift+\uD074\uB9AD: \uD310\uB9E4 \xB7 Esc: \uB2EB\uAE30",
      "Cloak of Shadows": "\uADF8\uB9BC\uC790 \uB9DD\uD1A0",
      Close: "\uB2EB\uAE30",
      "Close (Esc)": "\uB2EB\uAE30 (Esc)",
      Cloud: "\uAD6C\uB984",
      "Cloudy Sphere": "\uD074\uB77C\uC6B0\uB514 \uC2A4\uD53C\uC5B4",
      Club: "\uD074\uB7FD",
      Clutches: "\uB9C8\uC218",
      Coat: "\uC678\uD22C",
      Cobalt: "\uAD70\uCCAD\uC0C9",
      "Cobra Strike": "\uCF54\uBE0C\uB77C \uC77C\uACA9",
      Coil: "\uACE0\uB9AC",
      cold: "\uB0C9\uAE30",
      "Cold Absorb": "\uB0C9\uAE30 \uD761\uC218",
      "Cold Arrow": "\uB0C9\uAE30 \uD654\uC0B4",
      "Cold Damage": "\uB0C9\uAE30 \uD53C\uD574",
      "Cold Enchanted": "\uB0C9\uAE30 \uAC15\uD654",
      "Cold Mastery": "\uB0C9\uAE30 \uC219\uB828",
      "Cold Plains": "\uCC28\uAC00\uC6B4 \uD3C9\uC57C",
      "Cold Resist": "\uB0C9\uAE30 \uC800\uD56D",
      "Cold Resistance": "\uB0C9\uAE30 \uC800\uD56D",
      "Cold Skill Damage": "\uB0C9\uAE30 \uAE30\uC220 \uD53C\uD574",
      "Cold Skills": "\uB0C9\uAE30 \uAE30\uC220",
      "Cold Spells": "\uB0C9\uAE30 \uC8FC\uBB38",
      Coldcrow: "\uCF5C\uB4DC\uD06C\uB85C\uC6B0",
      "Coldworm the Burrower": "\uB545\uAD74\uAFBC \uCF5C\uB4DC\uC6DC",
      "Colenzo the Annihilator": "\uC885\uACB0\uC790 \uCF5C\uB80C\uC870",
      Collar: "\uBAA9\uD14C",
      "Colossus Blade": "\uCF5C\uB85C\uC11C\uC2A4 \uBE14\uB808\uC774\uB4DC",
      "Colossus Crossbow": "\uCF5C\uB85C\uC11C\uC2A4 \uD06C\uB85C\uC2A4\uBCF4\uC6B0",
      "Colossus Girdle": "\uCF5C\uB85C\uC11C\uC2A4 \uAC70\uB4E4",
      "Combat Masteries": "\uC804\uD22C \uC219\uB828",
      "Combat Skills": "\uC804\uD22C \uAE30\uC220",
      "Come back at half life once more per run, per rank": "\uB2E8\uACC4\uB9C8\uB2E4 \uAC8C\uC784\uB2F9 1\uD68C \uB354 \uC0DD\uBA85\uB825 \uC808\uBC18\uC73C\uB85C \uBD80\uD65C",
      "Coming soon": "\uC900\uBE44 \uC911",
      "Commander's": "\uC0AC\uB839\uAD00\uC758",
      "Commanding the forces of nature, he summons wild beasts and raging storms to his side.": "\uC790\uC5F0\uC758 \uD798\uC744 \uB2E4\uC2A4\uB824 \uC57C\uC218\uC640 \uAC70\uC13C \uD3ED\uD48D\uC744 \uACC1\uC5D0 \uBD88\uB7EC\uB0C5\uB2C8\uB2E4.",
      Communal: "\uACF5\uB3D9\uC758",
      "Composite Bow": "\uCEF4\uD3EC\uC9C0\uD2B8 \uBCF4\uC6B0",
      Concentrate: "\uC9D1\uC911 \uACF5\uACA9",
      Concentration: "\uC9D1\uC911",
      Confuse: "\uD63C\uB780",
      "Conqueror Crown": "\uCEE8\uCEE4\uB7EC \uD06C\uB77C\uC6B4",
      "Conquest Sword": "\uCEE8\uD018\uC2A4\uD2B8 \uC18C\uB4DC",
      CONTINUE: "\uACC4\uC18D",
      "CONTINUE starts Act * over from its start, at level *. Your items and gold are kept.": "\uACC4\uC18D\uC744 \uB204\uB974\uBA74 {0}\uB9C9\uC744 \uCC98\uC74C\uBD80\uD130 \uB808\uBCA8 {1}(\uC73C)\uB85C \uB2E4\uC2DC \uC2DC\uC791\uD569\uB2C8\uB2E4. \uC544\uC774\uD15C\uACFC \uACE8\uB4DC\uB294 \uADF8\uB300\uB85C \uB0A8\uC2B5\uB2C8\uB2E4.",
      "CONTINUE TO #": "{0}(\uC73C)\uB85C \uACC4\uC18D",
      "CONTINUE TO NIGHTMARE": "\uC545\uBABD\uC73C\uB85C \uACC4\uC18D",
      "CONTINUE TO HELL": "\uC9C0\uC625\uC73C\uB85C \uACC4\uC18D",
      Conversion: "\uC804\uD5A5",
      Conviction: "\uC120\uACE0",
      COPIED: "\uBCF5\uC0AC\uB428",
      "Copy code": "\uCF54\uB4DC \uBCF5\uC0AC",
      "COPY DIAGNOSTICS": "\uC9C4\uB2E8 \uC815\uBCF4 \uBCF5\uC0AC",
      "COPY FAILED": "\uBCF5\uC0AC \uC2E4\uD328",
      Coral: "\uC0B0\uD638\uC0C9",
      Cord: "\uB048",
      Corona: "\uCF54\uB85C\uB098",
      Coronet: "\uCF54\uB85C\uB2C8\uD2B8",
      Corosive: "\uBD80\uC2DD\uC131",
      Corpse: "\uC2DC\uCCB4",
      "Corpse Aegis": "\uC2DC\uCCB4 \uBC29\uD328",
      "Corpse Badge": "\uC2DC\uCCB4 \uD718\uC7A5",
      "Corpse Band": "\uC2DC\uCCB4 \uBC18\uC9C0",
      "Corpse Barb": "\uC2DC\uCCB4 \uBBF8\uB298",
      "Corpse Beads": "\uC2DC\uCCB4 \uAD6C\uC2AC",
      "Corpse Bite": "\uC2DC\uCCB4 \uC774\uBE68",
      "Corpse Blazer": "\uC2DC\uCCB4 \uAC1C\uCC99\uC790",
      "Corpse Bludgeon": "\uC2DC\uCCB4 \uACE4\uBD09",
      "Corpse Bolt": "\uC2DC\uCCB4 \uD654\uC0B4",
      "Corpse Branch": "\uC2DC\uCCB4 \uAC00\uC9C0",
      "Corpse Brow": "\uC2DC\uCCB4 \uC774\uB9C8",
      "Corpse Buckle": "\uC2DC\uCCB4 \uBC84\uD074",
      "Corpse Call": "\uC2DC\uCCB4 \uBD80\uB984",
      "Corpse Carapace": "\uC2DC\uCCB4 \uAC11\uAC01",
      "Corpse Casque": "\uC2DC\uCCB4 \uD22C\uAD6C",
      "Corpse Chant": "\uC2DC\uCCB4 \uCC2C\uAC00",
      "Corpse Clasp": "\uC2DC\uCCB4 \uAC78\uC1E0",
      "Corpse Claw": "\uC2DC\uCCB4 \uBC1C\uD1B1",
      "Corpse Cleaver": "\uC2DC\uCCB4 \uAC00\uB984\uB0A0",
      "Corpse Clutches": "\uC2DC\uCCB4 \uB9C8\uC218",
      "Corpse Coat": "\uC2DC\uCCB4 \uC678\uD22C",
      "Corpse Coil": "\uC2DC\uCCB4 \uACE0\uB9AC",
      "Corpse Collar": "\uC2DC\uCCB4 \uBAA9\uD14C",
      "Corpse Cord": "\uC2DC\uCCB4 \uB048",
      "Corpse Cowl": "\uC2DC\uCCB4 \uC218\uB3C4\uB450\uAC74",
      "Corpse Crack": "\uC2DC\uCCB4 \uADE0\uC5F4",
      "Corpse Crest": "\uC2DC\uCCB4 \uBB38\uC7A5",
      "Corpse Crusher": "\uC2DC\uCCB4 \uBD84\uC1C4\uAE30",
      "Corpse Cry": "\uC2DC\uCCB4 \uC6B8\uC74C",
      "Corpse Dart": "\uC2DC\uCCB4 \uD22C\uCC3D",
      "Corpse Edge": "\uC2DC\uCCB4 \uCE7C\uB0A0",
      "Corpse Emblem": "\uC2DC\uCCB4 \uC0C1\uC9D5",
      "Corpse Explosion": "\uC2DC\uCCB4 \uD3ED\uBC1C",
      "Corpse Eye": "\uC2DC\uCCB4 \uB208",
      "Corpse Fang": "\uC2DC\uCCB4 \uC1A1\uACF3\uB2C8",
      "Corpse Finger": "\uC2DC\uCCB4 \uC190\uAC00\uB77D",
      "Corpse Fist": "\uC2DC\uCCB4 \uC8FC\uBA39",
      "Corpse Fletch": "\uC2DC\uCCB4 \uD654\uC0B4\uAE43",
      "Corpse Flight": "\uC2DC\uCCB4 \uBE44\uD589",
      "Corpse Glare": "\uC2DC\uCCB4 \uC12C\uAD11",
      "Corpse Gnarl": "\uC2DC\uCCB4 \uC639\uC774",
      "Corpse Goad": "\uC2DC\uCCB4 \uBAB0\uC774\uB9C9\uB300",
      "Corpse Gorget": "\uC2DC\uCCB4 \uBAA9\uAC00\uB9AC\uAC1C",
      "Corpse Grip": "\uC2DC\uCCB4 \uC190\uC544\uADC0",
      "Corpse Guard": "\uC2DC\uCCB4 \uC218\uD638",
      "Corpse Gutter": "\uC2DC\uCCB4 \uC808\uAC1C",
      "Corpse Gyre": "\uC2DC\uCCB4 \uC18C\uC6A9\uB3CC\uC774",
      "Corpse Hand": "\uC2DC\uCCB4 \uC190",
      "Corpse Heart": "\uC2DC\uCCB4 \uC2EC\uC7A5",
      "Corpse Hew": "\uC2DC\uCCB4 \uCC0D\uAE30",
      "Corpse Hide": "\uC2DC\uCCB4 \uAC00\uC8FD",
      "Corpse Hold": "\uC2DC\uCCB4 \uC6C0\uCF1C\uC960",
      "Corpse Hood": "\uC2DC\uCCB4 \uB450\uAC74",
      "Corpse Horn": "\uC2DC\uCCB4 \uBFD4",
      "Corpse Impaler": "\uC2DC\uCCB4 \uAD00\uD1B5\uC790",
      "Corpse Jack": "\uC2DC\uCCB4 \uC6C3\uC637",
      "Corpse Knell": "\uC2DC\uCCB4 \uC870\uC885",
      "Corpse Knot": "\uC2DC\uCCB4 \uB9E4\uB4ED",
      "Corpse Knuckle": "\uC2DC\uCCB4 \uC190\uB9C8\uB514",
      "Corpse Lance": "\uC2DC\uCCB4 \uCC3D",
      "Corpse Lash": "\uC2DC\uCCB4 \uCC44\uCC0D",
      "Corpse Lock": "\uC2DC\uCCB4 \uC790\uBB3C\uC1E0",
      "Corpse Loop": "\uC2DC\uCCB4 \uD14C",
      "Corpse Mallet": "\uC2DC\uCCB4 \uB9DD\uCE58",
      "Corpse Mangler": "\uC2DC\uCCB4 \uB09C\uB3C4\uC9C8",
      "Corpse Mantle": "\uC2DC\uCCB4 \uB9DD\uD1A0",
      "Corpse Mark": "\uC2DC\uCCB4 \uD45C\uC2DD",
      "Corpse Mask": "\uC2DC\uCCB4 \uAC00\uBA74",
      "Corpse Mauler": "\uC2DC\uCCB4 \uD30C\uAD34\uC790",
      "Corpse Nails": "\uC2DC\uCCB4 \uBABB",
      "Corpse Necklace": "\uC2DC\uCCB4 \uBAA9\uAC78\uC774",
      "Corpse Needle": "\uC2DC\uCCB4 \uBC14\uB298",
      "Corpse Nock": "\uC2DC\uCCB4 \uC2DC\uC704\uD648",
      "Corpse Noose": "\uC2DC\uCCB4 \uC62C\uAC00\uBBF8",
      "Corpse Orb": "\uC2DC\uCCB4 \uBCF4\uC8FC",
      "Corpse Pelt": "\uC2DC\uCCB4 \uBAA8\uD53C",
      "Corpse Prod": "\uC2DC\uCCB4 \uCC0C\uB974\uAE30",
      "Corpse Quarrel": "\uC2DC\uCCB4 \uC1E0\uB1CC\uC0B4",
      "Corpse Quill": "\uC2DC\uCCB4 \uAE43",
      "Corpse Razor": "\uC2DC\uCCB4 \uBA74\uB3C4\uB0A0",
      "Corpse Rend": "\uC2DC\uCCB4 \uCC22\uAE40",
      "Corpse Road": "\uC2DC\uCCB4 \uAE38",
      "Corpse Saw": "\uC2DC\uCCB4 \uD1B1",
      "Corpse Scalpel": "\uC2DC\uCCB4 \uD574\uBD80\uCE7C",
      "Corpse Scarab": "\uC2DC\uCCB4 \uD48D\uB385\uC774",
      "Corpse Scourge": "\uC2DC\uCCB4 \uC7AC\uC559",
      "Corpse Scratch": "\uC2DC\uCCB4 \uD560\uD034\uAE30",
      "Corpse Scythe": "\uC2DC\uCCB4 \uB0AB",
      "Corpse Shard": "\uC2DC\uCCB4 \uD30C\uD3B8",
      "Corpse Shroud": "\uC2DC\uCCB4 \uC218\uC758",
      "Corpse Slippers": "\uC2DC\uCCB4 \uB367\uC2E0",
      "Corpse Smasher": "\uC2DC\uCCB4 \uBD84\uC1C4\uC790",
      "Corpse Song": "\uC2DC\uCCB4 \uB178\uB798",
      "Corpse Spell": "\uC2DC\uCCB4 \uC8FC\uBB38",
      "Corpse Sphere": "\uC2DC\uCCB4 \uAD6C\uCCB4",
      "Corpse Spike": "\uC2DC\uCCB4 \uAC00\uC2DC",
      "Corpse Spiral": "\uC2DC\uCCB4 \uB098\uC120",
      "Corpse Spire": "\uC2DC\uCCB4 \uCCA8\uD0D1",
      "Corpse Splitter": "\uC2DC\uCCB4 \uCABC\uAC1C\uB294\uC790",
      "Corpse Spur": "\uC2DC\uCCB4 \uBC15\uCC28",
      "Corpse Stake": "\uC2DC\uCCB4 \uB9D0\uB69D",
      "Corpse Stalk": "\uC2DC\uCCB4 \uCD94\uC801",
      "Corpse Star": "\uC2DC\uCCB4 \uBCC4",
      "Corpse Stinger": "\uC2DC\uCCB4 \uB3C5\uCE68",
      "Corpse Strap": "\uC2DC\uCCB4 \uB760",
      "Corpse Suit": "\uC2DC\uCCB4 \uAC11\uC637",
      "Corpse Sunder": "\uC2DC\uCCB4 \uC808\uB2E8",
      "Corpse Talisman": "\uC2DC\uCCB4 \uBD80\uC801",
      "Corpse Thirst": "\uC2DC\uCCB4 \uAC08\uC99D",
      "Corpse Torc": "\uC2DC\uCCB4 \uBAA9\uACE0\uB9AC",
      "Corpse Tower": "\uC2DC\uCCB4 \uD0D1",
      "Corpse Track": "\uC2DC\uCCB4 \uBC1C\uC790\uAD6D",
      "Corpse Trample": "\uC2DC\uCCB4 \uC9D3\uBC1F\uAE30",
      "Corpse Turn": "\uC2DC\uCCB4 \uD68C\uC804",
      "Corpse Veil": "\uC2DC\uCCB4 \uC7A5\uB9C9",
      "Corpse Visage": "\uC2DC\uCCB4 \uC5BC\uAD74",
      "Corpse Ward": "\uC2DC\uCCB4 \uBCF4\uD638",
      "Corpse Weaver": "\uC2DC\uCCB4 \uC9C1\uC870\uC790",
      "Corpse Wing": "\uC2DC\uCCB4 \uB0A0\uAC1C",
      "Corpse Wrack": "\uC2DC\uCCB4 \uACE0\uBB38",
      Corpsefire: "\uBD88\uD0C0\uB294 \uC2DC\uCCB4",
      "Corrupt Rogue": "\uD0C0\uB77D\uD55C \uB3C4\uC801",
      "Cost: #": "\uBE44\uC6A9: {0}",
      "Could not resume the saved run": "\uC800\uC7A5\uB41C \uAC8C\uC784\uC744 \uC774\uC5B4\uAC08 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Could not start as the hero who beat Baal": "\uBC14\uC54C\uC744 \uCC98\uCE58\uD55C \uC601\uC6C5\uC73C\uB85C \uC2DC\uC791\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
      Cowl: "\uC218\uB3C4\uB450\uAC74",
      Crack: "\uADE0\uC5F4",
      crawl: "\uAE30\uC5B4\uAC00",
      Crawler: "\uD3EC\uBCF5\uC790",
      crawls: "\uAE30\uC5B4\uAC00",
      "CREATE NEW HERO": "\uC0C8 \uC601\uC6C5 \uB9CC\uB4E4\uAE30",
      "CREDITS / LEGAL": "\uD06C\uB808\uB527 / \uBC95\uC801 \uACE0\uC9C0",
      "Champions' and uniques' chests give level-ups through Act II and now and then in Act III, then stat points or +1 to a skill tree: the build fills in Acts IV-V": "\uC815\uC608 \uAD34\uBB3C\uACFC \uACE0\uC720 \uAD34\uBB3C\uC758 \uC0C1\uC790\uB294 2\uB9C9\uAE4C\uC9C0 \uB808\uBCA8 \uC5C5\uC744 \uC8FC\uACE0 3\uB9C9\uC5D0\uC11C\uB294 \uAC00\uB054 \uC8FC\uBA70, \uADF8 \uB4A4\uB85C\uB294 \uB2A5\uB825\uCE58 \uD3EC\uC778\uD2B8\uB098 \uAE30\uC220 \uD2B8\uB9AC +1\uC744 \uC90D\uB2C8\uB2E4: \uBE4C\uB4DC\uB294 4~5\uB9C9\uC5D0\uC11C \uC644\uC131\uB429\uB2C8\uB2E4",
      creeper: "\uB369\uAD74",
      "Creeping Feature": "\uD06C\uB9AC\uD551 \uD53C\uCCD0",
      Crest: "\uBB38\uC7A5",
      Crimson: "\uC2EC\uD64D\uC0C9",
      "Critical Strike": "\uCE58\uBA85\uD0C0",
      Crow: "\uAE4C\uB9C8\uADC0",
      Crown: "\uD06C\uB77C\uC6B4",
      "Crown of Ages": "\uC2DC\uB300\uC758 \uC655\uAD00",
      "Crown of Thieves": "\uB3C4\uB451\uC758 \uC655\uAD00",
      "Crown Shield": "\uD06C\uB77C\uC6B4 \uC274\uB4DC",
      Cruel: "\uC794\uD639\uD55C",
      "Crusader Gauntlets": "\uD06C\uB8E8\uC138\uC774\uB354 \uAC74\uD2C0\uB9BF",
      Crusher: "\uBD84\uC1C4\uAE30",
      Crushflange: "\uBD84\uC1C4\uD14C",
      "Crushing Blow": "\uAC15\uD0C0",
      Cry: "\uC6B8\uC74C",
      "Cryptic Sword": "\uD06C\uB9BD\uD2F1 \uC18C\uB4DC",
      "Crystal Sword": "\uD06C\uB9AC\uC2A4\uD0C8 \uC18C\uB4DC",
      "Crystalline Globe": "\uD06C\uB9AC\uC2A4\uD0C8\uB77C\uC778 \uAE00\uB85C\uBE0C",
      "Crystalline Passage": "\uC218\uC815 \uB3D9\uAD74",
      Cudgel: "\uCEE4\uC808",
      "Culwen's Point": "\uCEEC\uC6EC\uC758 \uB0A0\uBD99\uC774",
      Cunning: "\uC57D\uC0AD\uBE60\uB978",
      "Curse the toughest of the nearest pack, #s: those within # turn on it, passing on when it falls": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC911 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC5D0\uAC8C \uC800\uC8FC, {0}\uCD08: {1} \uC548\uC758 \uC801\uC774 \uADF8\uB97C \uACF5\uACA9, \uC4F0\uB7EC\uC9C0\uBA74 \uB2E4\uC74C \uC801\uC73C\uB85C \uC62E\uACA8\uAC10",
      "Curse, #s: damage you and summons deal monsters within # of the nearest heals you #%": "\uC800\uC8FC, {0}\uCD08: \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC801 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC5D0\uAC8C \uB2F9\uC2E0\uACFC \uC18C\uD658\uC218\uAC00 \uC900 \uD53C\uD574\uC758 {2}%\uB9CC\uD07C \uC0DD\uBA85\uB825 \uD68C\uBCF5",
      "Curse, #s: monsters within # of a target deal #% less damage": "\uC800\uC8FC, {0}\uCD08: \uB300\uC0C1 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uC8FC\uB294 \uD53C\uD574 {2}% \uAC10\uC18C",
      "Curse, #s: monsters within # of a target slow by half, deal #% less damage and lose #% physical resistance (a fifth of it if immune)": "\uC800\uC8FC, {0}\uCD08: \uB300\uC0C1 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uC808\uBC18\uC73C\uB85C \uB454\uD654, \uC8FC\uB294 \uD53C\uD574 {2}% \uAC10\uC18C, \uBB3C\uB9AC \uC800\uD56D {3}% \uAC10\uC18C (\uBA74\uC5ED\uC774\uBA74 \uADF8 5\uBD84\uC758 1)",
      "Curse, #s: monsters within # of a target lose #% physical resistance (a fifth of it if immune)": "\uC800\uC8FC, {0}\uCD08: \uB300\uC0C1 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC758 \uBB3C\uB9AC \uC800\uD56D {2}% \uAC10\uC18C (\uBA74\uC5ED\uC774\uBA74 \uADF8 5\uBD84\uC758 1)",
      "Curse, #s: monsters within # of a target, ranged first, only see you beside them (not act bosses)": "\uC800\uC8FC, {0}\uCD08: \uB300\uC0C1 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C(\uC6D0\uAC70\uB9AC \uC6B0\uC120)\uC774 \uBC14\uB85C \uC606\uC5D0\uC11C\uB9CC \uB2F9\uC2E0\uC744 \uBD04 (\uB9C9 \uC6B0\uB450\uBA38\uB9AC \uC81C\uC678)",
      "Curse, #s: monsters within # of the nearest flee and don't attack (not act bosses)": "\uC800\uC8FC, {0}\uCD08: \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC801 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uB2EC\uC544\uB098\uBA70 \uACF5\uACA9\uD558\uC9C0 \uC54A\uC74C (\uB9C9 \uC6B0\uB450\uBA38\uB9AC \uC81C\uC678)",
      "Curse, #s: monsters within # of the nearest take back #% of their blows on you and summons": "\uC800\uC8FC, {0}\uCD08: \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC801 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uB2F9\uC2E0\uACFC \uC18C\uD658\uC218\uC5D0\uAC8C \uC900 \uD53C\uD574\uC758 {2}%\uB97C \uB3CC\uB824\uBC1B\uC74C",
      "Curse, #s: monsters within # of the nearest turn on each other with their own blows (not act bosses)": "\uC800\uC8FC, {0}\uCD08: \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC801 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uC11C\uB85C\uB97C \uACF5\uACA9 (\uB9C9 \uC6B0\uB450\uBA38\uB9AC \uC81C\uC678)",
      Cursed: "\uC800\uC8FC",
      Curses: "\uC800\uC8FC",
      Cutlass: "\uCEE4\uD2C0\uB7EC\uC2A4",
      "Cyclone Armor": "\uD68C\uC624\uB9AC \uAC11\uC637",
      "D2 Survivors is open in another tab": "D2 Survivors\uAC00 \uB2E4\uB978 \uD0ED\uC5D0\uC11C \uC5F4\uB824 \uC788\uC2B5\uB2C8\uB2E4",
      "Dac Farren": "\uB2E5 \uD30C\uB80C",
      "Dacian Falx": "\uB2E4\uD0A4\uC548 \uD314\uD06C\uC2A4",
      Dagger: "\uB300\uAC70",
      Damage: "\uD53C\uD574",
      "Damage Reduced": "\uD53C\uD574 \uAC10\uC18C",
      "Damage Reduced by": "\uD53C\uD574 \uAC10\uC18C",
      "Damage Taken Goes To Mana": "\uBC1B\uB294 \uD53C\uD574\uC758 \uB9CC\uD07C \uB9C8\uB098 \uD68C\uBCF5",
      "Damage to Demons": "\uC545\uB9C8\uC5D0\uAC8C \uC8FC\uB294 \uD53C\uD574",
      "Damage to Undead": "\uC5B8\uB370\uB4DC\uC5D0\uAC8C \uC8FC\uB294 \uD53C\uD574",
      Dancer: "\uCDA4\uAFBC",
      "Dark Elder": "\uC0AC\uC545\uD55C \uC7A5\uB85C",
      "Dark Wood": "\uC5B4\uB460\uC232",
      "Darkforce Spawn": "\uC5B4\uB460\uC758 \uC885\uC790",
      Dart: "\uD22C\uCC3D",
      "Dash through the monsters in your path, # damage to each and a blow at the end": "\uACBD\uB85C\uC0C1 \uAD34\uBB3C\uC744 \uB6AB\uACE0 \uB3CC\uC9C4, \uAC01\uAC01 {0} \uD53C\uD574, \uB9C8\uC9C0\uB9C9\uC5D0 \uC77C\uACA9",
      Deadly: "\uCE58\uBA85\uC801\uC778",
      "Deadly Strike": "\uCE58\uBA85\uC801 \uACF5\uACA9",
      Death: "\uC8FD\uC74C",
      "Death Cleaver": "\uC8FD\uC74C \uAC00\uB974\uAC1C",
      "Death Mask": "\uB370\uC2A4 \uB9C8\uC2A4\uD06C",
      "Death Sentry": "\uC8FD\uC74C \uD30C\uC218\uAE30",
      "Death's Fathom": "\uC8FD\uC74C\uC758 \uAE4A\uC774",
      "Death's Web": "\uC8FD\uC74C\uC758 \uAC70\uBBF8\uC904",
      Deathbit: "\uC8FD\uC74C\uC870\uAC01",
      Deathspade: "\uC8FD\uC74C\uC758 \uB0A0",
      Decapitator: "\uB514\uCE90\uD53C\uD14C\uC774\uD130",
      December: "12\uC6D4",
      Decoy: "\uBBF8\uB07C",
      Decrepify: "\uB178\uD654",
      Defender: "\uB514\uD39C\uB354",
      Defense: "\uBC29\uC5B4\uB825",
      "Defense vs. Missile": "\uBBF8\uC0AC\uC77C \uBC29\uC5B4\uB825",
      "Defense:": "\uBC29\uC5B4\uB825:",
      "Defensive Auras": "\uBC29\uC5B4 \uC624\uB77C",
      Defiance: "\uC778\uB0B4",
      DELETE: "\uC0AD\uC81C",
      "Demon Head": "\uB370\uBAAC \uD5E4\uB4DC",
      "Demon Heart": "\uB370\uBAAC \uD558\uD2B8",
      Demonhead: "\uB370\uBAAC\uD5E4\uB4DC",
      "Demonhide Boots": "\uB370\uBAAC\uD558\uC774\uB4DC \uBD80\uCE20",
      "Demonhide Gloves": "\uB370\uBAAC\uD558\uC774\uB4DC \uAE00\uB7EC\uBE0C",
      "Demonhide Sash": "\uB370\uBAAC\uD558\uC774\uB4DC \uC0C8\uC2DC",
      "Demonhorn's Edge": "\uC545\uB9C8\uBFD4\uC758 \uB0A0",
      "DESKTOP APP": "\uB370\uC2A4\uD06C\uD1B1 \uC571",
      "Desktop app: the game's art loads sooner": "\uB370\uC2A4\uD06C\uD1B1 \uC571: \uAC8C\uC784 \uADF8\uB798\uD53D\uC744 \uB354 \uBE68\uB9AC \uBD88\uB7EC\uC635\uB2C8\uB2E4",
      "Destroyer Helm": "\uB514\uC2A4\uD2B8\uB85C\uC774\uC5B4 \uD5EC\uB984",
      Devil: "\uC545\uB9C8",
      "Devil Star": "\uB370\uBE4C \uC2A4\uD0C0",
      Devious: "\uAC04\uC545\uD55C",
      dexterity: "\uBBFC\uCCA9",
      Diablo: "\uB514\uC544\uBE14\uB85C",
      Diadem: "\uB2E4\uC774\uC5B4\uB380",
      "Diamond Bow": "\uB2E4\uC774\uC544\uBAAC\uB4DC \uBCF4\uC6B0",
      "Dim Vision": "\uC2DC\uC57C \uD750\uB9AC\uAE30",
      "Dimensional Blade": "\uB514\uBA58\uC154\uB110 \uBE14\uB808\uC774\uB4DC",
      "Dimensional Shard": "\uB514\uBA58\uC154\uB110 \uC0E4\uB4DC",
      "Diminishing for rares and uniques, as in D2": "D2\uCC98\uB7FC \uD76C\uADC0 \uBC0F \uACE0\uC720 \uC544\uC774\uD15C\uC740 \uD6A8\uACFC\uAC00 \uCCB4\uAC10\uB428",
      "Dimoak's Hew": "\uB514\uBAA8\uC545\uC758 \uC808\uB2E8",
      Dire: "\uAD11\uD3EC",
      "Divine Scepter": "\uB514\uBC14\uC778 \uC149\uD130",
      Dodge: "\uD758\uB9AC\uAE30",
      Doom: "\uD30C\uBA78",
      "Doom Aegis": "\uD30C\uBA78 \uBC29\uD328",
      "Doom Badge": "\uD30C\uBA78 \uD718\uC7A5",
      "Doom Band": "\uD30C\uBA78 \uBC18\uC9C0",
      "Doom Barb": "\uD30C\uBA78 \uBBF8\uB298",
      "Doom Beads": "\uD30C\uBA78 \uAD6C\uC2AC",
      "Doom Bite": "\uD30C\uBA78 \uC774\uBE68",
      "Doom Blazer": "\uD30C\uBA78 \uAC1C\uCC99\uC790",
      "Doom Bludgeon": "\uD30C\uBA78 \uACE4\uBD09",
      "Doom Bolt": "\uD30C\uBA78 \uD654\uC0B4",
      "Doom Branch": "\uD30C\uBA78 \uAC00\uC9C0",
      "Doom Brow": "\uD30C\uBA78 \uC774\uB9C8",
      "Doom Buckle": "\uD30C\uBA78 \uBC84\uD074",
      "Doom Call": "\uD30C\uBA78 \uBD80\uB984",
      "Doom Carapace": "\uD30C\uBA78 \uAC11\uAC01",
      "Doom Casque": "\uD30C\uBA78 \uD22C\uAD6C",
      "Doom Chant": "\uD30C\uBA78 \uCC2C\uAC00",
      "Doom Clasp": "\uD30C\uBA78 \uAC78\uC1E0",
      "Doom Claw": "\uD30C\uBA78 \uBC1C\uD1B1",
      "Doom Cleaver": "\uD30C\uBA78 \uAC00\uB984\uB0A0",
      "Doom Clutches": "\uD30C\uBA78 \uB9C8\uC218",
      "Doom Coat": "\uD30C\uBA78 \uC678\uD22C",
      "Doom Coil": "\uD30C\uBA78 \uACE0\uB9AC",
      "Doom Collar": "\uD30C\uBA78 \uBAA9\uD14C",
      "Doom Cord": "\uD30C\uBA78 \uB048",
      "Doom Cowl": "\uD30C\uBA78 \uC218\uB3C4\uB450\uAC74",
      "Doom Crack": "\uD30C\uBA78 \uADE0\uC5F4",
      "Doom Crest": "\uD30C\uBA78 \uBB38\uC7A5",
      "Doom Crusher": "\uD30C\uBA78 \uBD84\uC1C4\uAE30",
      "Doom Cry": "\uD30C\uBA78 \uC6B8\uC74C",
      "Doom Dart": "\uD30C\uBA78 \uD22C\uCC3D",
      "Doom Edge": "\uD30C\uBA78 \uCE7C\uB0A0",
      "Doom Emblem": "\uD30C\uBA78 \uC0C1\uC9D5",
      "Doom Eye": "\uD30C\uBA78 \uB208",
      "Doom Fang": "\uD30C\uBA78 \uC1A1\uACF3\uB2C8",
      "Doom Finger": "\uD30C\uBA78 \uC190\uAC00\uB77D",
      "Doom Fist": "\uD30C\uBA78 \uC8FC\uBA39",
      "Doom Fletch": "\uD30C\uBA78 \uD654\uC0B4\uAE43",
      "Doom Flight": "\uD30C\uBA78 \uBE44\uD589",
      "Doom Glare": "\uD30C\uBA78 \uC12C\uAD11",
      "Doom Gnarl": "\uD30C\uBA78 \uC639\uC774",
      "Doom Goad": "\uD30C\uBA78 \uBAB0\uC774\uB9C9\uB300",
      "Doom Gorget": "\uD30C\uBA78 \uBAA9\uAC00\uB9AC\uAC1C",
      "Doom Grip": "\uD30C\uBA78 \uC190\uC544\uADC0",
      "Doom Guard": "\uD30C\uBA78 \uC218\uD638",
      "Doom Gutter": "\uD30C\uBA78 \uC808\uAC1C",
      "Doom Gyre": "\uD30C\uBA78 \uC18C\uC6A9\uB3CC\uC774",
      "Doom Hand": "\uD30C\uBA78 \uC190",
      "Doom Heart": "\uD30C\uBA78 \uC2EC\uC7A5",
      "Doom Hew": "\uD30C\uBA78 \uCC0D\uAE30",
      "Doom Hide": "\uD30C\uBA78 \uAC00\uC8FD",
      "Doom Hold": "\uD30C\uBA78 \uC6C0\uCF1C\uC960",
      "Doom Hood": "\uD30C\uBA78 \uB450\uAC74",
      "Doom Horn": "\uD30C\uBA78 \uBFD4",
      "Doom Impaler": "\uD30C\uBA78 \uAD00\uD1B5\uC790",
      "Doom Jack": "\uD30C\uBA78 \uC6C3\uC637",
      "Doom Knell": "\uD30C\uBA78 \uC870\uC885",
      "Doom Knot": "\uD30C\uBA78 \uB9E4\uB4ED",
      "Doom Knuckle": "\uD30C\uBA78 \uC190\uB9C8\uB514",
      "Doom Lance": "\uD30C\uBA78 \uCC3D",
      "Doom Lash": "\uD30C\uBA78 \uCC44\uCC0D",
      "Doom Lock": "\uD30C\uBA78 \uC790\uBB3C\uC1E0",
      "Doom Loop": "\uD30C\uBA78 \uD14C",
      "Doom Mallet": "\uD30C\uBA78 \uB9DD\uCE58",
      "Doom Mangler": "\uD30C\uBA78 \uB09C\uB3C4\uC9C8",
      "Doom Mantle": "\uD30C\uBA78 \uB9DD\uD1A0",
      "Doom Mark": "\uD30C\uBA78 \uD45C\uC2DD",
      "Doom Mask": "\uD30C\uBA78 \uAC00\uBA74",
      "Doom Mauler": "\uD30C\uBA78 \uD30C\uAD34\uC790",
      "Doom Nails": "\uD30C\uBA78 \uBABB",
      "Doom Necklace": "\uD30C\uBA78 \uBAA9\uAC78\uC774",
      "Doom Needle": "\uD30C\uBA78 \uBC14\uB298",
      "Doom Nock": "\uD30C\uBA78 \uC2DC\uC704\uD648",
      "Doom Noose": "\uD30C\uBA78 \uC62C\uAC00\uBBF8",
      "Doom Orb": "\uD30C\uBA78 \uBCF4\uC8FC",
      "Doom Pelt": "\uD30C\uBA78 \uBAA8\uD53C",
      "Doom Prod": "\uD30C\uBA78 \uCC0C\uB974\uAE30",
      "Doom Quarrel": "\uD30C\uBA78 \uC1E0\uB1CC\uC0B4",
      "Doom Quill": "\uD30C\uBA78 \uAE43",
      "Doom Razor": "\uD30C\uBA78 \uBA74\uB3C4\uB0A0",
      "Doom Rend": "\uD30C\uBA78 \uCC22\uAE40",
      "Doom Road": "\uD30C\uBA78 \uAE38",
      "Doom Saw": "\uD30C\uBA78 \uD1B1",
      "Doom Scalpel": "\uD30C\uBA78 \uD574\uBD80\uCE7C",
      "Doom Scarab": "\uD30C\uBA78 \uD48D\uB385\uC774",
      "Doom Scourge": "\uD30C\uBA78 \uC7AC\uC559",
      "Doom Scratch": "\uD30C\uBA78 \uD560\uD034\uAE30",
      "Doom Scythe": "\uD30C\uBA78 \uB0AB",
      "Doom Shard": "\uD30C\uBA78 \uD30C\uD3B8",
      "Doom Shroud": "\uD30C\uBA78 \uC218\uC758",
      "Doom Slippers": "\uD30C\uBA78 \uB367\uC2E0",
      "Doom Smasher": "\uD30C\uBA78 \uBD84\uC1C4\uC790",
      "Doom Song": "\uD30C\uBA78 \uB178\uB798",
      "Doom Spell": "\uD30C\uBA78 \uC8FC\uBB38",
      "Doom Sphere": "\uD30C\uBA78 \uAD6C\uCCB4",
      "Doom Spike": "\uD30C\uBA78 \uAC00\uC2DC",
      "Doom Spiral": "\uD30C\uBA78 \uB098\uC120",
      "Doom Spire": "\uD30C\uBA78 \uCCA8\uD0D1",
      "Doom Splitter": "\uD30C\uBA78 \uCABC\uAC1C\uB294\uC790",
      "Doom Spur": "\uD30C\uBA78 \uBC15\uCC28",
      "Doom Stake": "\uD30C\uBA78 \uB9D0\uB69D",
      "Doom Stalk": "\uD30C\uBA78 \uCD94\uC801",
      "Doom Star": "\uD30C\uBA78 \uBCC4",
      "Doom Stinger": "\uD30C\uBA78 \uB3C5\uCE68",
      "Doom Strap": "\uD30C\uBA78 \uB760",
      "Doom Suit": "\uD30C\uBA78 \uAC11\uC637",
      "Doom Sunder": "\uD30C\uBA78 \uC808\uB2E8",
      "Doom Talisman": "\uD30C\uBA78 \uBD80\uC801",
      "Doom Thirst": "\uD30C\uBA78 \uAC08\uC99D",
      "Doom Torc": "\uD30C\uBA78 \uBAA9\uACE0\uB9AC",
      "Doom Tower": "\uD30C\uBA78 \uD0D1",
      "Doom Track": "\uD30C\uBA78 \uBC1C\uC790\uAD6D",
      "Doom Trample": "\uD30C\uBA78 \uC9D3\uBC1F\uAE30",
      "Doom Turn": "\uD30C\uBA78 \uD68C\uC804",
      "Doom Veil": "\uD30C\uBA78 \uC7A5\uB9C9",
      "Doom Visage": "\uD30C\uBA78 \uC5BC\uAD74",
      "Doom Ward": "\uD30C\uBA78 \uBCF4\uD638",
      "Doom Weaver": "\uD30C\uBA78 \uC9C1\uC870\uC790",
      "Doom Wing": "\uD30C\uBA78 \uB0A0\uAC1C",
      "Doom Wrack": "\uD30C\uBA78 \uACE0\uBB38",
      "Double Axe": "\uB354\uBE14 \uC561\uC2A4",
      "Double Bow": "\uB354\uBE14 \uBCF4\uC6B0",
      "Double Swing": "\uC774\uC911 \uD0C0\uACA9",
      "Double Throw": "\uC774\uC911 \uD22C\uCC99",
      "Downloading update *%": "\uC5C5\uB370\uC774\uD2B8 \uB2E4\uC6B4\uB85C\uB4DC \uC911 {0}%",
      "Drag a slider to adjust": "\uC2AC\uB77C\uC774\uB354\uB97C \uB04C\uC5B4\uC11C \uC870\uC808",
      Dragon: "\uC6A9",
      "Dragon Aegis": "\uC6A9 \uBC29\uD328",
      "Dragon Badge": "\uC6A9 \uD718\uC7A5",
      "Dragon Band": "\uC6A9 \uBC18\uC9C0",
      "Dragon Barb": "\uC6A9 \uBBF8\uB298",
      "Dragon Beads": "\uC6A9 \uAD6C\uC2AC",
      "Dragon Bite": "\uC6A9 \uC774\uBE68",
      "Dragon Blazer": "\uC6A9 \uAC1C\uCC99\uC790",
      "Dragon Bludgeon": "\uC6A9 \uACE4\uBD09",
      "Dragon Bolt": "\uC6A9 \uD654\uC0B4",
      "Dragon Branch": "\uC6A9 \uAC00\uC9C0",
      "Dragon Brow": "\uC6A9 \uC774\uB9C8",
      "Dragon Buckle": "\uC6A9 \uBC84\uD074",
      "Dragon Call": "\uC6A9 \uBD80\uB984",
      "Dragon Carapace": "\uC6A9 \uAC11\uAC01",
      "Dragon Casque": "\uC6A9 \uD22C\uAD6C",
      "Dragon Chant": "\uC6A9 \uCC2C\uAC00",
      "Dragon Clasp": "\uC6A9 \uAC78\uC1E0",
      "Dragon Claw": "\uC6A9\uC758 \uC190\uD1B1",
      "Dragon Cleaver": "\uC6A9 \uAC00\uB984\uB0A0",
      "Dragon Clutches": "\uC6A9 \uB9C8\uC218",
      "Dragon Coat": "\uC6A9 \uC678\uD22C",
      "Dragon Coil": "\uC6A9 \uACE0\uB9AC",
      "Dragon Collar": "\uC6A9 \uBAA9\uD14C",
      "Dragon Cord": "\uC6A9 \uB048",
      "Dragon Cowl": "\uC6A9 \uC218\uB3C4\uB450\uAC74",
      "Dragon Crack": "\uC6A9 \uADE0\uC5F4",
      "Dragon Crest": "\uC6A9 \uBB38\uC7A5",
      "Dragon Crusher": "\uC6A9 \uBD84\uC1C4\uAE30",
      "Dragon Cry": "\uC6A9 \uC6B8\uC74C",
      "Dragon Dart": "\uC6A9 \uD22C\uCC3D",
      "Dragon Edge": "\uC6A9 \uCE7C\uB0A0",
      "Dragon Emblem": "\uC6A9 \uC0C1\uC9D5",
      "Dragon Eye": "\uC6A9 \uB208",
      "Dragon Fang": "\uC6A9 \uC1A1\uACF3\uB2C8",
      "Dragon Finger": "\uC6A9 \uC190\uAC00\uB77D",
      "Dragon Fist": "\uC6A9 \uC8FC\uBA39",
      "Dragon Fletch": "\uC6A9 \uD654\uC0B4\uAE43",
      "Dragon Flight": "\uC6A9\uC758 \uBE44\uC0C1",
      "Dragon Glare": "\uC6A9 \uC12C\uAD11",
      "Dragon Gnarl": "\uC6A9 \uC639\uC774",
      "Dragon Goad": "\uC6A9 \uBAB0\uC774\uB9C9\uB300",
      "Dragon Gorget": "\uC6A9 \uBAA9\uAC00\uB9AC\uAC1C",
      "Dragon Grip": "\uC6A9 \uC190\uC544\uADC0",
      "Dragon Guard": "\uC6A9 \uC218\uD638",
      "Dragon Gutter": "\uC6A9 \uC808\uAC1C",
      "Dragon Gyre": "\uC6A9 \uC18C\uC6A9\uB3CC\uC774",
      "Dragon Hand": "\uC6A9 \uC190",
      "Dragon Heart": "\uC6A9 \uC2EC\uC7A5",
      "Dragon Hew": "\uC6A9 \uCC0D\uAE30",
      "Dragon Hide": "\uC6A9 \uAC00\uC8FD",
      "Dragon Hold": "\uC6A9 \uC6C0\uCF1C\uC960",
      "Dragon Hood": "\uC6A9 \uB450\uAC74",
      "Dragon Horn": "\uC6A9 \uBFD4",
      "Dragon Impaler": "\uC6A9 \uAD00\uD1B5\uC790",
      "Dragon Jack": "\uC6A9 \uC6C3\uC637",
      "Dragon Knell": "\uC6A9 \uC870\uC885",
      "Dragon Knot": "\uC6A9 \uB9E4\uB4ED",
      "Dragon Knuckle": "\uC6A9 \uC190\uB9C8\uB514",
      "Dragon Lance": "\uC6A9 \uCC3D",
      "Dragon Lash": "\uC6A9 \uCC44\uCC0D",
      "Dragon Lock": "\uC6A9 \uC790\uBB3C\uC1E0",
      "Dragon Loop": "\uC6A9 \uD14C",
      "Dragon Mallet": "\uC6A9 \uB9DD\uCE58",
      "Dragon Mangler": "\uC6A9 \uB09C\uB3C4\uC9C8",
      "Dragon Mantle": "\uC6A9 \uB9DD\uD1A0",
      "Dragon Mark": "\uC6A9 \uD45C\uC2DD",
      "Dragon Mask": "\uC6A9 \uAC00\uBA74",
      "Dragon Mauler": "\uC6A9 \uD30C\uAD34\uC790",
      "Dragon Nails": "\uC6A9 \uBABB",
      "Dragon Necklace": "\uC6A9 \uBAA9\uAC78\uC774",
      "Dragon Needle": "\uC6A9 \uBC14\uB298",
      "Dragon Nock": "\uC6A9 \uC2DC\uC704\uD648",
      "Dragon Noose": "\uC6A9 \uC62C\uAC00\uBBF8",
      "Dragon Orb": "\uC6A9 \uBCF4\uC8FC",
      "Dragon Pelt": "\uC6A9 \uBAA8\uD53C",
      "Dragon Prod": "\uC6A9 \uCC0C\uB974\uAE30",
      "Dragon Quarrel": "\uC6A9 \uC1E0\uB1CC\uC0B4",
      "Dragon Quill": "\uC6A9 \uAE43",
      "Dragon Razor": "\uC6A9 \uBA74\uB3C4\uB0A0",
      "Dragon Rend": "\uC6A9 \uCC22\uAE40",
      "Dragon Road": "\uC6A9 \uAE38",
      "Dragon Saw": "\uC6A9 \uD1B1",
      "Dragon Scalpel": "\uC6A9 \uD574\uBD80\uCE7C",
      "Dragon Scarab": "\uC6A9 \uD48D\uB385\uC774",
      "Dragon Scourge": "\uC6A9 \uC7AC\uC559",
      "Dragon Scratch": "\uC6A9 \uD560\uD034\uAE30",
      "Dragon Scythe": "\uC6A9 \uB0AB",
      "Dragon Shard": "\uC6A9 \uD30C\uD3B8",
      "Dragon Shield": "\uB4DC\uB798\uACE4 \uC274\uB4DC",
      "Dragon Shroud": "\uC6A9 \uC218\uC758",
      "Dragon Slippers": "\uC6A9 \uB367\uC2E0",
      "Dragon Smasher": "\uC6A9 \uBD84\uC1C4\uC790",
      "Dragon Song": "\uC6A9 \uB178\uB798",
      "Dragon Spell": "\uC6A9 \uC8FC\uBB38",
      "Dragon Sphere": "\uC6A9 \uAD6C\uCCB4",
      "Dragon Spike": "\uC6A9 \uAC00\uC2DC",
      "Dragon Spiral": "\uC6A9 \uB098\uC120",
      "Dragon Spire": "\uC6A9 \uCCA8\uD0D1",
      "Dragon Splitter": "\uC6A9 \uCABC\uAC1C\uB294\uC790",
      "Dragon Spur": "\uC6A9 \uBC15\uCC28",
      "Dragon Stake": "\uC6A9 \uB9D0\uB69D",
      "Dragon Stalk": "\uC6A9 \uCD94\uC801",
      "Dragon Star": "\uC6A9 \uBCC4",
      "Dragon Stinger": "\uC6A9 \uB3C5\uCE68",
      "Dragon Strap": "\uC6A9 \uB760",
      "Dragon Suit": "\uC6A9 \uAC11\uC637",
      "Dragon Sunder": "\uC6A9 \uC808\uB2E8",
      "Dragon Tail": "\uC6A9\uC758 \uAF2C\uB9AC",
      "Dragon Talisman": "\uC6A9 \uBD80\uC801",
      "Dragon Talon": "\uC6A9\uC758 \uBC1C\uD1B1",
      "Dragon Thirst": "\uC6A9 \uAC08\uC99D",
      "Dragon Torc": "\uC6A9 \uBAA9\uACE0\uB9AC",
      "Dragon Tower": "\uC6A9 \uD0D1",
      "Dragon Track": "\uC6A9 \uBC1C\uC790\uAD6D",
      "Dragon Trample": "\uC6A9 \uC9D3\uBC1F\uAE30",
      "Dragon Turn": "\uC6A9 \uD68C\uC804",
      "Dragon Veil": "\uC6A9 \uC7A5\uB9C9",
      "Dragon Visage": "\uC6A9 \uC5BC\uAD74",
      "Dragon Ward": "\uC6A9 \uBCF4\uD638",
      "Dragon Weaver": "\uC6A9 \uC9C1\uC870\uC790",
      "Dragon Wing": "\uC6A9 \uB0A0\uAC1C",
      "Dragon Wrack": "\uC6A9 \uACE0\uBB38",
      "Dragon's": "\uC6A9\uC758",
      Dragonscale: "\uC6A9\uBE44\uB298",
      "Drain Life": "\uC0DD\uBA85\uB825 \uD761\uC218",
      "Drake's": "\uBE44\uB8E1\uC758",
      Dread: "\uACF5\uD3EC",
      "Dread Aegis": "\uACF5\uD3EC \uBC29\uD328",
      "Dread Badge": "\uACF5\uD3EC \uD718\uC7A5",
      "Dread Band": "\uACF5\uD3EC \uBC18\uC9C0",
      "Dread Barb": "\uACF5\uD3EC \uBBF8\uB298",
      "Dread Beads": "\uACF5\uD3EC \uAD6C\uC2AC",
      "Dread Bite": "\uACF5\uD3EC \uC774\uBE68",
      "Dread Blazer": "\uACF5\uD3EC \uAC1C\uCC99\uC790",
      "Dread Bludgeon": "\uACF5\uD3EC \uACE4\uBD09",
      "Dread Bolt": "\uACF5\uD3EC \uD654\uC0B4",
      "Dread Branch": "\uACF5\uD3EC \uAC00\uC9C0",
      "Dread Brow": "\uACF5\uD3EC \uC774\uB9C8",
      "Dread Buckle": "\uACF5\uD3EC \uBC84\uD074",
      "Dread Call": "\uACF5\uD3EC \uBD80\uB984",
      "Dread Carapace": "\uACF5\uD3EC \uAC11\uAC01",
      "Dread Casque": "\uACF5\uD3EC \uD22C\uAD6C",
      "Dread Chant": "\uACF5\uD3EC \uCC2C\uAC00",
      "Dread Clasp": "\uACF5\uD3EC \uAC78\uC1E0",
      "Dread Claw": "\uACF5\uD3EC \uBC1C\uD1B1",
      "Dread Cleaver": "\uACF5\uD3EC \uAC00\uB984\uB0A0",
      "Dread Clutches": "\uACF5\uD3EC \uB9C8\uC218",
      "Dread Coat": "\uACF5\uD3EC \uC678\uD22C",
      "Dread Coil": "\uACF5\uD3EC \uACE0\uB9AC",
      "Dread Collar": "\uACF5\uD3EC \uBAA9\uD14C",
      "Dread Cord": "\uACF5\uD3EC \uB048",
      "Dread Cowl": "\uACF5\uD3EC \uC218\uB3C4\uB450\uAC74",
      "Dread Crack": "\uACF5\uD3EC \uADE0\uC5F4",
      "Dread Crest": "\uACF5\uD3EC \uBB38\uC7A5",
      "Dread Crusher": "\uACF5\uD3EC \uBD84\uC1C4\uAE30",
      "Dread Cry": "\uACF5\uD3EC \uC6B8\uC74C",
      "Dread Dart": "\uACF5\uD3EC \uD22C\uCC3D",
      "Dread Edge": "\uACF5\uD3EC \uCE7C\uB0A0",
      "Dread Emblem": "\uACF5\uD3EC \uC0C1\uC9D5",
      "Dread Eye": "\uACF5\uD3EC \uB208",
      "Dread Fang": "\uACF5\uD3EC \uC1A1\uACF3\uB2C8",
      "Dread Finger": "\uACF5\uD3EC \uC190\uAC00\uB77D",
      "Dread Fist": "\uACF5\uD3EC \uC8FC\uBA39",
      "Dread Fletch": "\uACF5\uD3EC \uD654\uC0B4\uAE43",
      "Dread Flight": "\uACF5\uD3EC \uBE44\uD589",
      "Dread Glare": "\uACF5\uD3EC \uC12C\uAD11",
      "Dread Gnarl": "\uACF5\uD3EC \uC639\uC774",
      "Dread Goad": "\uACF5\uD3EC \uBAB0\uC774\uB9C9\uB300",
      "Dread Gorget": "\uACF5\uD3EC \uBAA9\uAC00\uB9AC\uAC1C",
      "Dread Grip": "\uACF5\uD3EC \uC190\uC544\uADC0",
      "Dread Guard": "\uACF5\uD3EC \uC218\uD638",
      "Dread Gutter": "\uACF5\uD3EC \uC808\uAC1C",
      "Dread Gyre": "\uACF5\uD3EC \uC18C\uC6A9\uB3CC\uC774",
      "Dread Hand": "\uACF5\uD3EC \uC190",
      "Dread Heart": "\uACF5\uD3EC \uC2EC\uC7A5",
      "Dread Hew": "\uACF5\uD3EC \uCC0D\uAE30",
      "Dread Hide": "\uACF5\uD3EC \uAC00\uC8FD",
      "Dread Hold": "\uACF5\uD3EC \uC6C0\uCF1C\uC960",
      "Dread Hood": "\uACF5\uD3EC \uB450\uAC74",
      "Dread Horn": "\uACF5\uD3EC \uBFD4",
      "Dread Impaler": "\uACF5\uD3EC \uAD00\uD1B5\uC790",
      "Dread Jack": "\uACF5\uD3EC \uC6C3\uC637",
      "Dread Knell": "\uACF5\uD3EC \uC870\uC885",
      "Dread Knot": "\uACF5\uD3EC \uB9E4\uB4ED",
      "Dread Knuckle": "\uACF5\uD3EC \uC190\uB9C8\uB514",
      "Dread Lance": "\uACF5\uD3EC \uCC3D",
      "Dread Lash": "\uACF5\uD3EC \uCC44\uCC0D",
      "Dread Lock": "\uACF5\uD3EC \uC790\uBB3C\uC1E0",
      "Dread Loop": "\uACF5\uD3EC \uD14C",
      "Dread Mallet": "\uACF5\uD3EC \uB9DD\uCE58",
      "Dread Mangler": "\uACF5\uD3EC \uB09C\uB3C4\uC9C8",
      "Dread Mantle": "\uACF5\uD3EC \uB9DD\uD1A0",
      "Dread Mark": "\uACF5\uD3EC \uD45C\uC2DD",
      "Dread Mask": "\uACF5\uD3EC \uAC00\uBA74",
      "Dread Mauler": "\uACF5\uD3EC \uD30C\uAD34\uC790",
      "Dread Nails": "\uACF5\uD3EC \uBABB",
      "Dread Necklace": "\uACF5\uD3EC \uBAA9\uAC78\uC774",
      "Dread Needle": "\uACF5\uD3EC \uBC14\uB298",
      "Dread Nock": "\uACF5\uD3EC \uC2DC\uC704\uD648",
      "Dread Noose": "\uACF5\uD3EC \uC62C\uAC00\uBBF8",
      "Dread Orb": "\uACF5\uD3EC \uBCF4\uC8FC",
      "Dread Pelt": "\uACF5\uD3EC \uBAA8\uD53C",
      "Dread Prod": "\uACF5\uD3EC \uCC0C\uB974\uAE30",
      "Dread Quarrel": "\uACF5\uD3EC \uC1E0\uB1CC\uC0B4",
      "Dread Quill": "\uACF5\uD3EC \uAE43",
      "Dread Razor": "\uACF5\uD3EC \uBA74\uB3C4\uB0A0",
      "Dread Rend": "\uACF5\uD3EC \uCC22\uAE40",
      "Dread Road": "\uACF5\uD3EC \uAE38",
      "Dread Saw": "\uACF5\uD3EC \uD1B1",
      "Dread Scalpel": "\uACF5\uD3EC \uD574\uBD80\uCE7C",
      "Dread Scarab": "\uACF5\uD3EC \uD48D\uB385\uC774",
      "Dread Scourge": "\uACF5\uD3EC \uC7AC\uC559",
      "Dread Scratch": "\uACF5\uD3EC \uD560\uD034\uAE30",
      "Dread Scythe": "\uACF5\uD3EC \uB0AB",
      "Dread Shard": "\uACF5\uD3EC \uD30C\uD3B8",
      "Dread Shroud": "\uACF5\uD3EC \uC218\uC758",
      "Dread Slippers": "\uACF5\uD3EC \uB367\uC2E0",
      "Dread Smasher": "\uACF5\uD3EC \uBD84\uC1C4\uC790",
      "Dread Song": "\uACF5\uD3EC \uB178\uB798",
      "Dread Spell": "\uACF5\uD3EC \uC8FC\uBB38",
      "Dread Sphere": "\uACF5\uD3EC \uAD6C\uCCB4",
      "Dread Spike": "\uACF5\uD3EC \uAC00\uC2DC",
      "Dread Spiral": "\uACF5\uD3EC \uB098\uC120",
      "Dread Spire": "\uACF5\uD3EC \uCCA8\uD0D1",
      "Dread Splitter": "\uACF5\uD3EC \uCABC\uAC1C\uB294\uC790",
      "Dread Spur": "\uACF5\uD3EC \uBC15\uCC28",
      "Dread Stake": "\uACF5\uD3EC \uB9D0\uB69D",
      "Dread Stalk": "\uACF5\uD3EC \uCD94\uC801",
      "Dread Star": "\uACF5\uD3EC \uBCC4",
      "Dread Stinger": "\uACF5\uD3EC \uB3C5\uCE68",
      "Dread Strap": "\uACF5\uD3EC \uB760",
      "Dread Suit": "\uACF5\uD3EC \uAC11\uC637",
      "Dread Sunder": "\uACF5\uD3EC \uC808\uB2E8",
      "Dread Talisman": "\uACF5\uD3EC \uBD80\uC801",
      "Dread Thirst": "\uACF5\uD3EC \uAC08\uC99D",
      "Dread Torc": "\uACF5\uD3EC \uBAA9\uACE0\uB9AC",
      "Dread Tower": "\uACF5\uD3EC \uD0D1",
      "Dread Track": "\uACF5\uD3EC \uBC1C\uC790\uAD6D",
      "Dread Trample": "\uACF5\uD3EC \uC9D3\uBC1F\uAE30",
      "Dread Turn": "\uACF5\uD3EC \uD68C\uC804",
      "Dread Veil": "\uACF5\uD3EC \uC7A5\uB9C9",
      "Dread Visage": "\uACF5\uD3EC \uC5BC\uAD74",
      "Dread Ward": "\uACF5\uD3EC \uBCF4\uD638",
      "Dread Weaver": "\uACF5\uD3EC \uC9C1\uC870\uC790",
      "Dread Wing": "\uACF5\uD3EC \uB0A0\uAC1C",
      "Dread Wrack": "\uACF5\uD3EC \uACE0\uBB38",
      "Dream Spirit": "\uB4DC\uB9BC \uC2A4\uD53C\uB9AC\uD2B8",
      Drinker: "\uD761\uC785\uC790",
      Drool: "\uCE68",
      Drop: "\uBC84\uB9AC\uAE30",
      "Drop *?": "{0} \uBC84\uB9AC\uAE30?",
      Druid: "\uB4DC\uB8E8\uC774\uB4DC",
      "Dry Hills": "\uBA54\uB9C8\uB978 \uC5B8\uB355",
      "Durance of Hate": "\uC99D\uC624\uC758 \uC5B5\uB958\uC9C0",
      "Durance of Hate Level 3": "\uC99D\uC624\uC758 \uC5B5\uB958\uC9C0 3\uCE35",
      Duriel: "\uB450\uB9AC\uC5D8",
      "Duriel's Lair": "\uB450\uB9AC\uC5D8\uC758 \uC740\uC2E0\uCC98",
      "Dusk Shroud": "\uB354\uC2A4\uD06C \uC288\uB77C\uC6B0\uB4DC",
      "Dwarf Star": "\uC65C\uC131",
      "Dying after going on past Baal, or as the hero who beat him, shows the best time of such runs on that difficulty, no longer the fresh run's": "\uBC14\uC54C \uCC98\uCE58 \uD6C4 \uC774\uC5B4\uAC04 \uAC8C\uC784\uC774\uB098 \uBC14\uC54C\uC744 \uCC98\uCE58\uD55C \uC601\uC6C5\uC73C\uB85C \uC2DC\uC791\uD55C \uAC8C\uC784\uC5D0\uC11C \uC0AC\uB9DD\uD558\uBA74, \uC774\uC81C \uC0C8 \uAC8C\uC784\uC758 \uAE30\uB85D\uC774 \uC544\uB2C8\uB77C \uADF8 \uB09C\uC774\uB3C4\uC5D0\uC11C \uADF8\uB807\uAC8C \uC774\uC5B4\uAC04 \uAC8C\uC784\uC758 \uCD5C\uACE0 \uAE30\uB85D\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4",
      "Each point past the class's: +# maximum life": "\uC9C1\uC5C5 \uAE30\uBCF8\uCE58\uB97C \uB118\uB294 1\uD3EC\uC778\uD2B8\uB2F9: \uCD5C\uB300 \uC0DD\uBA85\uB825 +{0}",
      "Each point past the class's: +#% critical strike chance, +#% Attack Damage": "\uC9C1\uC5C5 \uAE30\uBCF8\uCE58\uB97C \uB118\uB294 \uD3EC\uC778\uD2B8\uB2F9: \uCE58\uBA85\uD0C0 \uD655\uB960 +{0}%, \uACF5\uACA9 \uD53C\uD574 +{1}%",
      "Each point past the class's: +#% physical damage": "\uC9C1\uC5C5 \uAE30\uBCF8\uCE58\uB97C \uB118\uB294 \uD3EC\uC778\uD2B8\uB2F9: \uBB3C\uB9AC \uD53C\uD574 +{0}%",
      Eagle: "\uB3C5\uC218\uB9AC",
      "Eagle Aegis": "\uB3C5\uC218\uB9AC \uBC29\uD328",
      "Eagle Badge": "\uB3C5\uC218\uB9AC \uD718\uC7A5",
      "Eagle Band": "\uB3C5\uC218\uB9AC \uBC18\uC9C0",
      "Eagle Barb": "\uB3C5\uC218\uB9AC \uBBF8\uB298",
      "Eagle Beads": "\uB3C5\uC218\uB9AC \uAD6C\uC2AC",
      "Eagle Bite": "\uB3C5\uC218\uB9AC \uC774\uBE68",
      "Eagle Blazer": "\uB3C5\uC218\uB9AC \uAC1C\uCC99\uC790",
      "Eagle Bludgeon": "\uB3C5\uC218\uB9AC \uACE4\uBD09",
      "Eagle Bolt": "\uB3C5\uC218\uB9AC \uD654\uC0B4",
      "Eagle Branch": "\uB3C5\uC218\uB9AC \uAC00\uC9C0",
      "Eagle Brow": "\uB3C5\uC218\uB9AC \uC774\uB9C8",
      "Eagle Buckle": "\uB3C5\uC218\uB9AC \uBC84\uD074",
      "Eagle Call": "\uB3C5\uC218\uB9AC \uBD80\uB984",
      "Eagle Carapace": "\uB3C5\uC218\uB9AC \uAC11\uAC01",
      "Eagle Casque": "\uB3C5\uC218\uB9AC \uD22C\uAD6C",
      "Eagle Chant": "\uB3C5\uC218\uB9AC \uCC2C\uAC00",
      "Eagle Clasp": "\uB3C5\uC218\uB9AC \uAC78\uC1E0",
      "Eagle Claw": "\uB3C5\uC218\uB9AC \uBC1C\uD1B1",
      "Eagle Cleaver": "\uB3C5\uC218\uB9AC \uAC00\uB984\uB0A0",
      "Eagle Clutches": "\uB3C5\uC218\uB9AC \uB9C8\uC218",
      "Eagle Coat": "\uB3C5\uC218\uB9AC \uC678\uD22C",
      "Eagle Coil": "\uB3C5\uC218\uB9AC \uACE0\uB9AC",
      "Eagle Collar": "\uB3C5\uC218\uB9AC \uBAA9\uD14C",
      "Eagle Cord": "\uB3C5\uC218\uB9AC \uB048",
      "Eagle Cowl": "\uB3C5\uC218\uB9AC \uC218\uB3C4\uB450\uAC74",
      "Eagle Crack": "\uB3C5\uC218\uB9AC \uADE0\uC5F4",
      "Eagle Crest": "\uB3C5\uC218\uB9AC \uBB38\uC7A5",
      "Eagle Crusher": "\uB3C5\uC218\uB9AC \uBD84\uC1C4\uAE30",
      "Eagle Cry": "\uB3C5\uC218\uB9AC \uC6B8\uC74C",
      "Eagle Dart": "\uB3C5\uC218\uB9AC \uD22C\uCC3D",
      "Eagle Edge": "\uB3C5\uC218\uB9AC \uCE7C\uB0A0",
      "Eagle Emblem": "\uB3C5\uC218\uB9AC \uC0C1\uC9D5",
      "Eagle Eye": "\uB3C5\uC218\uB9AC \uB208",
      "Eagle Fang": "\uB3C5\uC218\uB9AC \uC1A1\uACF3\uB2C8",
      "Eagle Finger": "\uB3C5\uC218\uB9AC \uC190\uAC00\uB77D",
      "Eagle Fist": "\uB3C5\uC218\uB9AC \uC8FC\uBA39",
      "Eagle Fletch": "\uB3C5\uC218\uB9AC \uD654\uC0B4\uAE43",
      "Eagle Flight": "\uB3C5\uC218\uB9AC \uBE44\uD589",
      "Eagle Glare": "\uB3C5\uC218\uB9AC \uC12C\uAD11",
      "Eagle Gnarl": "\uB3C5\uC218\uB9AC \uC639\uC774",
      "Eagle Goad": "\uB3C5\uC218\uB9AC \uBAB0\uC774\uB9C9\uB300",
      "Eagle Gorget": "\uB3C5\uC218\uB9AC \uBAA9\uAC00\uB9AC\uAC1C",
      "Eagle Grip": "\uB3C5\uC218\uB9AC \uC190\uC544\uADC0",
      "Eagle Guard": "\uB3C5\uC218\uB9AC \uC218\uD638",
      "Eagle Gutter": "\uB3C5\uC218\uB9AC \uC808\uAC1C",
      "Eagle Gyre": "\uB3C5\uC218\uB9AC \uC18C\uC6A9\uB3CC\uC774",
      "Eagle Hand": "\uB3C5\uC218\uB9AC \uC190",
      "Eagle Heart": "\uB3C5\uC218\uB9AC \uC2EC\uC7A5",
      "Eagle Hew": "\uB3C5\uC218\uB9AC \uCC0D\uAE30",
      "Eagle Hide": "\uB3C5\uC218\uB9AC \uAC00\uC8FD",
      "Eagle Hold": "\uB3C5\uC218\uB9AC \uC6C0\uCF1C\uC960",
      "Eagle Hood": "\uB3C5\uC218\uB9AC \uB450\uAC74",
      "Eagle Horn": "\uB3C5\uC218\uB9AC \uBFD4",
      "Eagle Impaler": "\uB3C5\uC218\uB9AC \uAD00\uD1B5\uC790",
      "Eagle Jack": "\uB3C5\uC218\uB9AC \uC6C3\uC637",
      "Eagle Knell": "\uB3C5\uC218\uB9AC \uC870\uC885",
      "Eagle Knot": "\uB3C5\uC218\uB9AC \uB9E4\uB4ED",
      "Eagle Knuckle": "\uB3C5\uC218\uB9AC \uC190\uB9C8\uB514",
      "Eagle Lance": "\uB3C5\uC218\uB9AC \uCC3D",
      "Eagle Lash": "\uB3C5\uC218\uB9AC \uCC44\uCC0D",
      "Eagle Lock": "\uB3C5\uC218\uB9AC \uC790\uBB3C\uC1E0",
      "Eagle Loop": "\uB3C5\uC218\uB9AC \uD14C",
      "Eagle Mallet": "\uB3C5\uC218\uB9AC \uB9DD\uCE58",
      "Eagle Mangler": "\uB3C5\uC218\uB9AC \uB09C\uB3C4\uC9C8",
      "Eagle Mantle": "\uB3C5\uC218\uB9AC \uB9DD\uD1A0",
      "Eagle Mark": "\uB3C5\uC218\uB9AC \uD45C\uC2DD",
      "Eagle Mask": "\uB3C5\uC218\uB9AC \uAC00\uBA74",
      "Eagle Mauler": "\uB3C5\uC218\uB9AC \uD30C\uAD34\uC790",
      "Eagle Nails": "\uB3C5\uC218\uB9AC \uBABB",
      "Eagle Necklace": "\uB3C5\uC218\uB9AC \uBAA9\uAC78\uC774",
      "Eagle Needle": "\uB3C5\uC218\uB9AC \uBC14\uB298",
      "Eagle Nock": "\uB3C5\uC218\uB9AC \uC2DC\uC704\uD648",
      "Eagle Noose": "\uB3C5\uC218\uB9AC \uC62C\uAC00\uBBF8",
      "Eagle Orb": "\uC774\uAE00 \uC624\uBE0C",
      "Eagle Pelt": "\uB3C5\uC218\uB9AC \uBAA8\uD53C",
      "Eagle Prod": "\uB3C5\uC218\uB9AC \uCC0C\uB974\uAE30",
      "Eagle Quarrel": "\uB3C5\uC218\uB9AC \uC1E0\uB1CC\uC0B4",
      "Eagle Quill": "\uB3C5\uC218\uB9AC \uAE43",
      "Eagle Razor": "\uB3C5\uC218\uB9AC \uBA74\uB3C4\uB0A0",
      "Eagle Rend": "\uB3C5\uC218\uB9AC \uCC22\uAE40",
      "Eagle Road": "\uB3C5\uC218\uB9AC \uAE38",
      "Eagle Saw": "\uB3C5\uC218\uB9AC \uD1B1",
      "Eagle Scalpel": "\uB3C5\uC218\uB9AC \uD574\uBD80\uCE7C",
      "Eagle Scarab": "\uB3C5\uC218\uB9AC \uD48D\uB385\uC774",
      "Eagle Scourge": "\uB3C5\uC218\uB9AC \uC7AC\uC559",
      "Eagle Scratch": "\uB3C5\uC218\uB9AC \uD560\uD034\uAE30",
      "Eagle Scythe": "\uB3C5\uC218\uB9AC \uB0AB",
      "Eagle Shard": "\uB3C5\uC218\uB9AC \uD30C\uD3B8",
      "Eagle Shroud": "\uB3C5\uC218\uB9AC \uC218\uC758",
      "Eagle Slippers": "\uB3C5\uC218\uB9AC \uB367\uC2E0",
      "Eagle Smasher": "\uB3C5\uC218\uB9AC \uBD84\uC1C4\uC790",
      "Eagle Song": "\uB3C5\uC218\uB9AC \uB178\uB798",
      "Eagle Spell": "\uB3C5\uC218\uB9AC \uC8FC\uBB38",
      "Eagle Sphere": "\uB3C5\uC218\uB9AC \uAD6C\uCCB4",
      "Eagle Spike": "\uB3C5\uC218\uB9AC \uAC00\uC2DC",
      "Eagle Spiral": "\uB3C5\uC218\uB9AC \uB098\uC120",
      "Eagle Spire": "\uB3C5\uC218\uB9AC \uCCA8\uD0D1",
      "Eagle Splitter": "\uB3C5\uC218\uB9AC \uCABC\uAC1C\uB294\uC790",
      "Eagle Spur": "\uB3C5\uC218\uB9AC \uBC15\uCC28",
      "Eagle Stake": "\uB3C5\uC218\uB9AC \uB9D0\uB69D",
      "Eagle Stalk": "\uB3C5\uC218\uB9AC \uCD94\uC801",
      "Eagle Star": "\uB3C5\uC218\uB9AC \uBCC4",
      "Eagle Stinger": "\uB3C5\uC218\uB9AC \uB3C5\uCE68",
      "Eagle Strap": "\uB3C5\uC218\uB9AC \uB760",
      "Eagle Suit": "\uB3C5\uC218\uB9AC \uAC11\uC637",
      "Eagle Sunder": "\uB3C5\uC218\uB9AC \uC808\uB2E8",
      "Eagle Talisman": "\uB3C5\uC218\uB9AC \uBD80\uC801",
      "Eagle Thirst": "\uB3C5\uC218\uB9AC \uAC08\uC99D",
      "Eagle Torc": "\uB3C5\uC218\uB9AC \uBAA9\uACE0\uB9AC",
      "Eagle Tower": "\uB3C5\uC218\uB9AC \uD0D1",
      "Eagle Track": "\uB3C5\uC218\uB9AC \uBC1C\uC790\uAD6D",
      "Eagle Trample": "\uB3C5\uC218\uB9AC \uC9D3\uBC1F\uAE30",
      "Eagle Turn": "\uB3C5\uC218\uB9AC \uD68C\uC804",
      "Eagle Veil": "\uB3C5\uC218\uB9AC \uC7A5\uB9C9",
      "Eagle Visage": "\uB3C5\uC218\uB9AC \uC5BC\uAD74",
      "Eagle Ward": "\uB3C5\uC218\uB9AC \uBCF4\uD638",
      "Eagle Weaver": "\uB3C5\uC218\uB9AC \uC9C1\uC870\uC790",
      "Eagle Wing": "\uB3C5\uC218\uB9AC \uB0A0\uAC1C",
      "Eagle Wrack": "\uB3C5\uC218\uB9AC \uACE0\uBB38",
      Eagleeye: "\uB3C5\uC218\uB9AC\uB208\uC758",
      Earlier: "\uC774\uC804",
      "Earth Spirit": "\uC5B4\uC2A4 \uC2A4\uD53C\uB9AC\uD2B8",
      Eater: "\uD3EC\uC2DD\uC790",
      Eburin: "\uC5D0\uBD80\uB9B0",
      Echoing: "\uBA54\uC544\uB9AC\uCE58\uB294",
      Edge: "\uCE7C\uB0A0",
      "Edge Bow": "\uC5E3\uC9C0 \uBCF4\uC6B0",
      "Elder Staff": "\uC5D8\uB354 \uC2A4\uD0DC\uD504",
      "Eldritch Orb": "\uC5D8\uB4DC\uB9AC\uCE58 \uC624\uBE0C",
      "Eldritch the Rectifier": "\uBC14\uB85C\uC7A1\uB294 \uC790 \uC5D8\uB4DC\uB9AC\uCE58",
      Elemental: "\uC6D0\uC18C",
      "Elemental Skills": "\uC6D0\uC18C \uAE30\uC220",
      "Elemental storms, summoned beasts and shape shifting": "\uC6D0\uC18C \uD3ED\uD48D, \uC57C\uC218 \uC18C\uD658, \uBCC0\uC2E0",
      Elysian: "\uCC9C\uAD6D\uC758",
      Ember: "\uBD88\uC528",
      Emblem: "\uC0C1\uC9D5",
      Emerald: "\uC5D0\uBA54\uB784\uB4DC\uC0C9",
      "Empty passive slot": "\uBE48 \uC9C0\uC18D \uD6A8\uACFC \uCE78",
      "Empty skill slot": "\uBE48 \uAE30\uC220 \uCE78",
      Enchant: "\uB9C8\uBC95\uBD80\uC5EC",
      "END THE RUN": "\uC2E4\uD589 \uC885\uB8CC",
      energy: "\uC5D0\uB108\uC9C0",
      "Energy Shield": "\uB9C8\uB825 \uBCF4\uD638\uB9C9",
      "Enhanced Damage": "\uD53C\uD574 \uC99D\uAC00",
      "Enhanced Defense": "\uBC29\uC5B4\uB825 \uC99D\uAC00",
      "Enhanced Maximum Damage": "\uCD5C\uB300 \uD53C\uD574 \uC99D\uAC00",
      "Enhanced Minimum Damage": "\uCD5C\uC18C \uD53C\uD574 \uC99D\uAC00",
      "Enter: * -": "Enter: {0}(\uC73C)\uB85C \uACC4\uC18D -",
      "Enter: play again - T: Charsi's wares - Esc: main menu": "Enter: \uB2E4\uC2DC \uD558\uAE30 - T: \uCC30\uC2DC\uC758 \uBB3C\uD488 - Esc: \uBA54\uC778 \uBA54\uB274",
      Entrapping: "\uD568\uC815\uC758",
      Envenomed: "\uB9F9\uB3C5\uC758",
      Eocene: "\uC5D0\uC624\uC138",
      "Eschuta's Temper": "\uC5D0\uC288\uD0C0\uC758 \uC131\uBBF8",
      Espandon: "\uC5D0\uC2A4\uD32C\uB3C8",
      "Ettin Axe": "\uC5D0\uD2F4 \uC561\uC2A4",
      Evade: "\uD53C\uD558\uAE30",
      "Every blow lands here: Attack Rating is critical strike chance instead": "\uC5EC\uAE30\uC120 \uBAA8\uB4E0 \uACF5\uACA9\uC774 \uBA85\uC911: \uACF5\uACA9 \uB4F1\uAE09\uC740 \uB300\uC2E0 \uCE58\uBA85\uD0C0 \uD655\uB960\uC774 \uB428",
      "Every few seconds a double of you appears nearby, drawing monsters (more often, for longer)": "\uBA87 \uCD08\uB9C8\uB2E4 \uADFC\uCC98\uC5D0 \uB2F9\uC2E0\uC758 \uBD84\uC2E0\uC774 \uB098\uD0C0\uB098 \uAD34\uBB3C\uC744 \uC720\uC778 (\uB354 \uC790\uC8FC, \uB354 \uC624\uB798)",
      "Every hero can reach it": "\uBAA8\uB4E0 \uC601\uC6C5\uC774 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      "Every skill recharges in # of its time": "\uBAA8\uB4E0 \uAE30\uC220\uC758 \uC7AC\uC0AC\uC6A9 \uC2DC\uAC04 {0}",
      "Everything is maxed": "\uBAA8\uB450 \uCD5C\uB300 \uB808\uBCA8",
      "Evolved from **": "\uC9C4\uD654: {0}{1}",
      "Evolves * into *, also needs:": "{0}\uC744(\uB97C) {1}(\uC73C)\uB85C \uC9C4\uD654, \uCD94\uAC00 \uC870\uAC74:",
      "Evolves from * with *": "\uC9C4\uD654: {0} + {1}",
      "Evolves into *:": "{0}(\uC73C)\uB85C \uC9C4\uD654 \uC870\uAC74:",
      "Executioner Sword": "\uC5D1\uC2DC\uD050\uC154\uB108 \uC18C\uB4DC",
      Exile: "\uCD94\uBC29",
      EXIT: "\uB098\uAC00\uAE30",
      Experience: "\uACBD\uD5D8\uCE58",
      "Experience works as in D2: monsters well below your level give less, so you level close to them instead of racing far ahead": "\uACBD\uD5D8\uCE58\uAC00 D2\uC640 \uAC19\uC2B5\uB2C8\uB2E4: \uB808\uBCA8\uC774 \uD55C\uCC38 \uB0AE\uC740 \uAD34\uBB3C\uC740 \uACBD\uD5D8\uCE58\uB97C \uB35C \uC8FC\uBBC0\uB85C, \uAD34\uBB3C\uBCF4\uB2E4 \uD6E8\uC52C \uC55E\uC11C \uB098\uAC00\uC9C0 \uC54A\uACE0 \uADF8 \uAC00\uAE4C\uC774\uC5D0\uC11C \uB808\uBCA8\uC774 \uC624\uB985\uB2C8\uB2E4",
      "Experience: # / #": "\uACBD\uD5D8\uCE58: {0} / {1}",
      "Expert's": "\uC804\uBB38\uAC00\uC758",
      explode: "\uD3ED\uBC1C",
      explodes: "\uD3ED\uBC1C\uD574",
      "Exploding Arrow": "\uD3ED\uBC1C \uD654\uC0B4",
      Export: "\uB0B4\uBCF4\uB0B4\uAE30",
      "Extra Fast": "\uB9E4\uC6B0 \uBE60\uB984",
      "Extra Gold from Monsters": "\uAD34\uBB3C\uC5D0\uAC8C\uC11C \uC5BB\uB294 \uACE8\uB4DC \uC99D\uAC00",
      "Extra Strong": "\uB9E4\uC6B0 \uAC15\uD568",
      Eye: "\uB208",
      "Eyeback the Unleashed": "\uD480\uB824\uB09C \uC790 \uC544\uC774\uBC31",
      Fade: "\uD750\uB9AC\uAE30",
      Falcata: "\uD314\uCE74\uD0C0",
      "Falcon Mask": "\uD314\uCF58 \uB9C8\uC2A4\uD06C",
      Falconeye: "\uC1A1\uACE8\uB208\uC758",
      Fallen: "\uBAB0\uB77D\uC790",
      Fanatic: "\uAD11\uC2E0\uB3C4",
      Fanaticism: "\uAD11\uC2E0",
      Fang: "\uC1A1\uACF3\uB2C8",
      "Fanged Helm": "\uD33D\uB4DC \uD5EC\uB984",
      Fangskin: "\uD33D\uC2A4\uD0A8",
      "Far Oasis": "\uBA38\uB098\uBA3C \uC624\uC544\uC2DC\uC2A4",
      Fascia: "\uD328\uC2DC\uC544",
      "Faster Block Rate": "\uB9C9\uAE30 \uC18D\uB3C4",
      "Faster Cast Rate": "\uC2DC\uC804 \uC18D\uB3C4",
      "Faster Hit Recovery": "\uD0C0\uACA9 \uD68C\uBCF5 \uC18D\uB3C4",
      "Faster Run/Walk": "\uB2EC\uB9AC\uAE30/\uAC77\uAE30 \uC18D\uB3C4",
      Feast: "\uB9CC\uCC2C",
      February: "2\uC6D4",
      Felicitous: "\uD589\uBCF5\uD55C",
      Felloak: "\uC4F0\uB7EC\uC9C4 \uCC38\uB098\uBB34",
      Fend: "\uB09C\uACA9",
      Feral: "\uD749\uD3EC\uD55C",
      "Feral Axe": "\uD398\uB7F4 \uC561\uC2A4",
      "Feral Claws": "\uD398\uB7F4 \uD074\uB7EC",
      "Feral Rage": "\uD749\uD3EC\uD55C \uACA9\uB178",
      Ferocious: "\uD3EC\uC545\uD55C",
      Fester: "\uACEA\uC74C",
      "Fetish Trophy": "\uD398\uD2F0\uC26C \uD2B8\uB85C\uD53C",
      "Field Plate": "\uD544\uB4DC \uD50C\uB808\uC774\uD2B8",
      "Find Item": "\uC544\uC774\uD15C \uBC1C\uACAC",
      "Find Potion": "\uBB3C\uC57D \uBC1C\uACAC",
      Fine: "\uD6CC\uB96D\uD55C",
      Finger: "\uC190\uAC00\uB77D",
      fire: "\uD654\uC5FC",
      "Fire Absorb": "\uD654\uC5FC \uD761\uC218",
      "Fire Arrow": "\uBD88\uAF43 \uD654\uC0B4",
      "Fire Ball": "\uD654\uC5FC\uAD6C",
      "Fire Blast": "\uD654\uC5FC \uC791\uB82C",
      "Fire Bolt": "\uD654\uC5FC\uD0C4",
      "Fire Claws": "\uD654\uC5FC \uBC1C\uD1B1",
      "Fire Damage": "\uD654\uC5FC \uD53C\uD574",
      "Fire Enchanted": "\uD654\uC5FC \uAC15\uD654",
      "Fire Eye": "\uD30C\uC774\uC5B4 \uC544\uC774",
      "Fire Golem": "\uD654\uC5FC \uACE8\uB818",
      "Fire Mastery": "\uD654\uC5FC \uC219\uB828",
      "Fire Resist": "\uD654\uC5FC \uC800\uD56D",
      "Fire Resistance": "\uD654\uC5FC \uC800\uD56D",
      "Fire Skill Damage": "\uD654\uC5FC \uAE30\uC220 \uD53C\uD574",
      "Fire Skills": "\uD654\uC5FC \uAE30\uC220",
      "Fire Spells": "\uD654\uC5FC \uC8FC\uBB38",
      "Fire Wall": "\uD654\uC5FC\uBCBD",
      "Fire, cold and lightning": "\uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C",
      "Firelizard's Talons": "\uBD88\uB3C4\uB9C8\uBC40\uC758 \uBC1C\uD1B1",
      "Fires Explosive Arrows or Bolts": "\uD3ED\uBC1C\uD558\uB294 \uD654\uC0B4 \uBC1C\uC0AC",
      "Fires Magic Arrows": "\uB9C8\uBC95 \uD654\uC0B4 \uBC1C\uC0AC",
      Firestorm: "\uD654\uC5FC\uD3ED\uD48D",
      "First launch on Windows (beta)": "Windows\uC5D0\uC11C \uCC98\uC74C \uC2E4\uD589\uD558\uAE30 (\uBCA0\uD0C0)",
      Fissure: "\uADE0\uC5F4",
      Fist: "\uC8FC\uBA39",
      "Fist of the Heavens": "\uCC9C\uC0C1\uC758 \uC8FC\uBA39",
      "Fists of Fire": "\uD654\uC5FC\uC758 \uC8FC\uBA39",
      Flail: "\uD504\uB808\uC77C",
      Flame: "\uBD88\uAF43",
      Flaming: "\uBD88\uD0C0\uC624\uB974\uB294",
      "Flanged Mace": "\uD50C\uB79C\uC9C0\uB4DC \uBA54\uC774\uC2A4",
      "Flawed Gem": "\uD760\uC9D1 \uB09C \uBCF4\uC11D",
      "Flawless Gem": "\uC644\uBCBD\uD55C \uBCF4\uC11D",
      "Flayer Jungle": "\uC57D\uD0C8\uC790 \uBC00\uB9BC",
      Flesh: "\uC0B4\uC810",
      Fletch: "\uD654\uC0B4\uAE43",
      "Fletcher's": "\uD654\uC0B4 \uC7A5\uC778\uC758",
      Flight: "\uBE44\uD589",
      "Flying Axe": "\uD50C\uB77C\uC789 \uC561\uC2A4",
      "Flying Knife": "\uD50C\uB77C\uC789 \uB098\uC774\uD504",
      "For #s a storm rages within # yards: # cold damage # times a second, chilling": "{0}\uCD08\uAC04 {1}\uC57C\uB4DC \uC548\uC5D0 \uD3ED\uD48D: \uCD08\uB2F9 {3}\uD68C {2} \uB0C9\uAE30 \uD53C\uD574, \uC624\uD55C",
      "For #s burning rocks fall around you, the toughest monsters most, # damage each": "{0}\uCD08\uAC04 \uC8FC\uC704\uC5D0 \uBD88\uD0C0\uB294 \uBC14\uC704\uAC00 \uB5A8\uC5B4\uC9D0, \uAC15\uD55C \uAD34\uBB3C\uC5D0 \uC9D1\uC911, \uAC01 {1} \uD53C\uD574",
      "For #s you take #% less damage": "{0}\uCD08\uAC04 \uBC1B\uB294 \uD53C\uD574 {1}% \uAC10\uC18C",
      Forked: "\uAC08\uB9B0",
      Fortified: "\uAC15\uD654\uB41C",
      Fortuitous: "\uC6B4 \uC88B\uC740",
      Foul: "\uC545\uCDE8",
      Francisca: "\uD504\uB780\uC2DC\uC2A4\uCE74",
      "freeze what they hit": "\uBE59\uACB0 \uC801\uC911\uD55C \uB300\uC0C1",
      "Freezes target": "\uB300\uC0C1 \uBE59\uACB0",
      "freezes what it hits": "\uBE59\uACB0\uC2DC\uCF1C \uC801\uC911\uD55C \uB300\uC0C1",
      Freezing: "\uBE59\uACB0\uC758",
      "Freezing Arrow": "\uBE59\uACB0 \uD654\uC0B4",
      Frenzy: "\uAD11\uBD84",
      "Frigid Highlands": "\uD639\uD55C\uC758 \uACE0\uC0B0\uC9C0",
      "from level *": "\uB808\uBCA8 {0}\uBD80\uD130",
      "Frost Nova": "\uC11C\uB9BF\uBC1C",
      Frostburn: "\uC11C\uB9AC\uBD88\uAF43",
      Froth: "\uAC70\uD488",
      "Frozen Armor": "\uC5BC\uC5B4\uBD99\uC740 \uAC11\uC637",
      "Frozen Armor and Shiver Armor turn aside monsters' missiles too, as D2's Defense does": "\uC5BC\uC5B4\uBD99\uC740 \uAC11\uC637\uACFC \uC624\uD55C \uAC11\uC637\uC774 D2\uC758 \uBC29\uC5B4\uB825\uCC98\uB7FC \uAD34\uBB3C\uC758 \uC6D0\uAC70\uB9AC \uACF5\uACA9\uB3C4 \uBE57\uB098\uAC00\uAC8C \uD569\uB2C8\uB2E4",
      "Frozen Armor for #s: melee attackers get a #s chill; #% of blows and missiles miss her": "{0}\uCD08\uAC04 \uC5BC\uC5B4\uBD99\uC740 \uAC11\uC637: \uADFC\uC811 \uACF5\uACA9\uD55C \uC801 {1}\uCD08\uAC04 \uC624\uD55C; \uADFC\uC811 \uACF5\uACA9\uACFC \uC6D0\uAC70\uB9AC \uACF5\uACA9\uC758 {2}%\uAC00 \uBE57\uB098\uAC10",
      "Frozen Orb": "\uC5BC\uC74C \uBCF4\uC8FC",
      "Frozen River": "\uC5BC\uC5B4\uBD99\uC740 \uAC15",
      "Frozen Tundra": "\uC5BC\uC5B4\uBD99\uC740 \uB3D9\uD1A0",
      Frozenstein: "\uD504\uB85C\uC98C\uC288\uD0C0\uC778",
      "Full Rejuvenation Potion": "\uC644\uC804 \uD68C\uBCF5 \uBB3C\uC57D",
      Fungal: "\uADE0\uB958\uC758",
      Furious: "\uACA9\uC2EC\uD55C",
      Fury: "\uBD84\uB178",
      "Fury Visor": "\uD4E8\uB9AC \uBC14\uC774\uC800",
      "Gaea's": "\uAC00\uC774\uC544\uC758",
      Gale: "\uC9C8\uD48D",
      "Gale Aegis": "\uC9C8\uD48D \uBC29\uD328",
      "Gale Badge": "\uC9C8\uD48D \uD718\uC7A5",
      "Gale Band": "\uC9C8\uD48D \uBC18\uC9C0",
      "Gale Barb": "\uC9C8\uD48D \uBBF8\uB298",
      "Gale Beads": "\uC9C8\uD48D \uAD6C\uC2AC",
      "Gale Bite": "\uC9C8\uD48D \uC774\uBE68",
      "Gale Blazer": "\uC9C8\uD48D \uAC1C\uCC99\uC790",
      "Gale Bludgeon": "\uC9C8\uD48D \uACE4\uBD09",
      "Gale Bolt": "\uC9C8\uD48D \uD654\uC0B4",
      "Gale Branch": "\uC9C8\uD48D \uAC00\uC9C0",
      "Gale Brow": "\uC9C8\uD48D \uC774\uB9C8",
      "Gale Buckle": "\uC9C8\uD48D \uBC84\uD074",
      "Gale Call": "\uC9C8\uD48D \uBD80\uB984",
      "Gale Carapace": "\uC9C8\uD48D \uAC11\uAC01",
      "Gale Casque": "\uC9C8\uD48D \uD22C\uAD6C",
      "Gale Chant": "\uC9C8\uD48D \uCC2C\uAC00",
      "Gale Clasp": "\uC9C8\uD48D \uAC78\uC1E0",
      "Gale Claw": "\uC9C8\uD48D \uBC1C\uD1B1",
      "Gale Cleaver": "\uC9C8\uD48D \uAC00\uB984\uB0A0",
      "Gale Clutches": "\uC9C8\uD48D \uB9C8\uC218",
      "Gale Coat": "\uC9C8\uD48D \uC678\uD22C",
      "Gale Coil": "\uC9C8\uD48D \uACE0\uB9AC",
      "Gale Collar": "\uC9C8\uD48D \uBAA9\uD14C",
      "Gale Cord": "\uC9C8\uD48D \uB048",
      "Gale Cowl": "\uC9C8\uD48D \uC218\uB3C4\uB450\uAC74",
      "Gale Crack": "\uC9C8\uD48D \uADE0\uC5F4",
      "Gale Crest": "\uC9C8\uD48D \uBB38\uC7A5",
      "Gale Crusher": "\uC9C8\uD48D \uBD84\uC1C4\uAE30",
      "Gale Cry": "\uC9C8\uD48D \uC6B8\uC74C",
      "Gale Dart": "\uC9C8\uD48D \uD22C\uCC3D",
      "Gale Edge": "\uC9C8\uD48D \uCE7C\uB0A0",
      "Gale Emblem": "\uC9C8\uD48D \uC0C1\uC9D5",
      "Gale Eye": "\uC9C8\uD48D \uB208",
      "Gale Fang": "\uC9C8\uD48D \uC1A1\uACF3\uB2C8",
      "Gale Finger": "\uC9C8\uD48D \uC190\uAC00\uB77D",
      "Gale Fist": "\uC9C8\uD48D \uC8FC\uBA39",
      "Gale Fletch": "\uC9C8\uD48D \uD654\uC0B4\uAE43",
      "Gale Flight": "\uC9C8\uD48D \uBE44\uD589",
      "Gale Glare": "\uC9C8\uD48D \uC12C\uAD11",
      "Gale Gnarl": "\uC9C8\uD48D \uC639\uC774",
      "Gale Goad": "\uC9C8\uD48D \uBAB0\uC774\uB9C9\uB300",
      "Gale Gorget": "\uC9C8\uD48D \uBAA9\uAC00\uB9AC\uAC1C",
      "Gale Grip": "\uC9C8\uD48D \uC190\uC544\uADC0",
      "Gale Guard": "\uC9C8\uD48D \uC218\uD638",
      "Gale Gutter": "\uC9C8\uD48D \uC808\uAC1C",
      "Gale Gyre": "\uC9C8\uD48D \uC18C\uC6A9\uB3CC\uC774",
      "Gale Hand": "\uC9C8\uD48D \uC190",
      "Gale Heart": "\uC9C8\uD48D \uC2EC\uC7A5",
      "Gale Hew": "\uC9C8\uD48D \uCC0D\uAE30",
      "Gale Hide": "\uC9C8\uD48D \uAC00\uC8FD",
      "Gale Hold": "\uC9C8\uD48D \uC6C0\uCF1C\uC960",
      "Gale Hood": "\uC9C8\uD48D \uB450\uAC74",
      "Gale Horn": "\uC9C8\uD48D \uBFD4",
      "Gale Impaler": "\uC9C8\uD48D \uAD00\uD1B5\uC790",
      "Gale Jack": "\uC9C8\uD48D \uC6C3\uC637",
      "Gale Knell": "\uC9C8\uD48D \uC870\uC885",
      "Gale Knot": "\uC9C8\uD48D \uB9E4\uB4ED",
      "Gale Knuckle": "\uC9C8\uD48D \uC190\uB9C8\uB514",
      "Gale Lance": "\uC9C8\uD48D \uCC3D",
      "Gale Lash": "\uC9C8\uD48D \uCC44\uCC0D",
      "Gale Lock": "\uC9C8\uD48D \uC790\uBB3C\uC1E0",
      "Gale Loop": "\uC9C8\uD48D \uD14C",
      "Gale Mallet": "\uC9C8\uD48D \uB9DD\uCE58",
      "Gale Mangler": "\uC9C8\uD48D \uB09C\uB3C4\uC9C8",
      "Gale Mantle": "\uC9C8\uD48D \uB9DD\uD1A0",
      "Gale Mark": "\uC9C8\uD48D \uD45C\uC2DD",
      "Gale Mask": "\uC9C8\uD48D \uAC00\uBA74",
      "Gale Mauler": "\uC9C8\uD48D \uD30C\uAD34\uC790",
      "Gale Nails": "\uC9C8\uD48D \uBABB",
      "Gale Necklace": "\uC9C8\uD48D \uBAA9\uAC78\uC774",
      "Gale Needle": "\uC9C8\uD48D \uBC14\uB298",
      "Gale Nock": "\uC9C8\uD48D \uC2DC\uC704\uD648",
      "Gale Noose": "\uC9C8\uD48D \uC62C\uAC00\uBBF8",
      "Gale Orb": "\uC9C8\uD48D \uBCF4\uC8FC",
      "Gale Pelt": "\uC9C8\uD48D \uBAA8\uD53C",
      "Gale Prod": "\uC9C8\uD48D \uCC0C\uB974\uAE30",
      "Gale Quarrel": "\uC9C8\uD48D \uC1E0\uB1CC\uC0B4",
      "Gale Quill": "\uC9C8\uD48D \uAE43",
      "Gale Razor": "\uC9C8\uD48D \uBA74\uB3C4\uB0A0",
      "Gale Rend": "\uC9C8\uD48D \uCC22\uAE40",
      "Gale Road": "\uC9C8\uD48D \uAE38",
      "Gale Saw": "\uC9C8\uD48D \uD1B1",
      "Gale Scalpel": "\uC9C8\uD48D \uD574\uBD80\uCE7C",
      "Gale Scarab": "\uC9C8\uD48D \uD48D\uB385\uC774",
      "Gale Scourge": "\uC9C8\uD48D \uC7AC\uC559",
      "Gale Scratch": "\uC9C8\uD48D \uD560\uD034\uAE30",
      "Gale Scythe": "\uC9C8\uD48D \uB0AB",
      "Gale Shard": "\uC9C8\uD48D \uD30C\uD3B8",
      "Gale Shroud": "\uC9C8\uD48D \uC218\uC758",
      "Gale Slippers": "\uC9C8\uD48D \uB367\uC2E0",
      "Gale Smasher": "\uC9C8\uD48D \uBD84\uC1C4\uC790",
      "Gale Song": "\uC9C8\uD48D \uB178\uB798",
      "Gale Spell": "\uC9C8\uD48D \uC8FC\uBB38",
      "Gale Sphere": "\uC9C8\uD48D \uAD6C\uCCB4",
      "Gale Spike": "\uC9C8\uD48D \uAC00\uC2DC",
      "Gale Spiral": "\uC9C8\uD48D \uB098\uC120",
      "Gale Spire": "\uC9C8\uD48D \uCCA8\uD0D1",
      "Gale Splitter": "\uC9C8\uD48D \uCABC\uAC1C\uB294\uC790",
      "Gale Spur": "\uC9C8\uD48D \uBC15\uCC28",
      "Gale Stake": "\uC9C8\uD48D \uB9D0\uB69D",
      "Gale Stalk": "\uC9C8\uD48D \uCD94\uC801",
      "Gale Star": "\uC9C8\uD48D \uBCC4",
      "Gale Stinger": "\uC9C8\uD48D \uB3C5\uCE68",
      "Gale Strap": "\uC9C8\uD48D \uB760",
      "Gale Suit": "\uC9C8\uD48D \uAC11\uC637",
      "Gale Sunder": "\uC9C8\uD48D \uC808\uB2E8",
      "Gale Talisman": "\uC9C8\uD48D \uBD80\uC801",
      "Gale Thirst": "\uC9C8\uD48D \uAC08\uC99D",
      "Gale Torc": "\uC9C8\uD48D \uBAA9\uACE0\uB9AC",
      "Gale Tower": "\uC9C8\uD48D \uD0D1",
      "Gale Track": "\uC9C8\uD48D \uBC1C\uC790\uAD6D",
      "Gale Trample": "\uC9C8\uD48D \uC9D3\uBC1F\uAE30",
      "Gale Turn": "\uC9C8\uD48D \uD68C\uC804",
      "Gale Veil": "\uC9C8\uD48D \uC7A5\uB9C9",
      "Gale Visage": "\uC9C8\uD48D \uC5BC\uAD74",
      "Gale Ward": "\uC9C8\uD48D \uBCF4\uD638",
      "Gale Weaver": "\uC9C8\uD48D \uC9C1\uC870\uC790",
      "Gale Wing": "\uC9C8\uD48D \uB0A0\uAC1C",
      "Gale Wrack": "\uC9C8\uD48D \uACE0\uBB38",
      Gamble: "\uB3C4\uBC15",
      "Gamble (G)": "\uB3C4\uBC15 (G)",
      "Game Menu": "\uAC8C\uC784 \uBA54\uB274",
      "Gargoyle Head": "\uAC00\uACE0\uC77C \uD5E4\uB4DC",
      "Gargoyle's Bite": "\uAC00\uACE0\uC77C\uC758 \uC774\uBE68",
      Garnet: "\uC11D\uB958\uC11D",
      Gauntlets: "\uAC74\uD2C0\uB9BF",
      "The desktop app keeps your save on disk as you play: a saved run no longer comes back an act behind after the app closes, and the Esc menu says where CONTINUE starts again": "\uB370\uC2A4\uD06C\uD1B1 \uC571\uC774 \uD50C\uB808\uC774\uD558\uB294 \uB3D9\uC548 \uC800\uC7A5\uC744 \uB514\uC2A4\uD06C\uC5D0 \uBC14\uB85C \uAE30\uB85D\uD569\uB2C8\uB2E4: \uC571\uC744 \uB2EB\uC740 \uB4A4 \uC800\uC7A5\uB41C \uC2E4\uD589\uC774 \uD55C \uB9C9 \uC774\uC804\uC73C\uB85C \uB3CC\uC544\uAC00\uC9C0 \uC54A\uC73C\uBA70, Esc \uBA54\uB274\uC5D0\uC11C \uACC4\uC18D\uC744 \uB204\uB974\uBA74 \uC5B4\uB514\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD558\uB294\uC9C0 \uC54C\uB824 \uC90D\uB2C8\uB2E4",
      "Gear works at any level again: an item's Required Level is shown, but it no longer holds the item back": "\uC7A5\uBE44\uAC00 \uB2E4\uC2DC \uB808\uBCA8\uACFC \uAD00\uACC4\uC5C6\uC774 \uC791\uB3D9\uD569\uB2C8\uB2E4: \uC544\uC774\uD15C\uC758 \uD544\uC694 \uB808\uBCA8\uC740 \uD45C\uC2DC\uB418\uC9C0\uB9CC \uB354 \uC774\uC0C1 \uC544\uC774\uD15C\uC744 \uB9C9\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "Gear asks its D2 Required Level again: wear it at any level, but above yours it shows red and gives nothing until you reach it": "\uC7A5\uBE44\uC5D0 D2\uC758 \uD544\uC694 \uB808\uBCA8\uC774 \uB2E4\uC2DC \uC801\uC6A9\uB429\uB2C8\uB2E4: \uC5B4\uB290 \uB808\uBCA8\uC5D0\uC11C\uB098 \uCC29\uC6A9\uD560 \uC218 \uC788\uC9C0\uB9CC, \uB808\uBCA8\uC774 \uBAA8\uC790\uB77C\uBA74 \uBD89\uAC8C \uD45C\uC2DC\uB418\uACE0 \uADF8 \uB808\uBCA8\uC5D0 \uB3C4\uB2EC\uD560 \uB54C\uAE4C\uC9C0 \uC544\uBB34 \uD6A8\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Geleb Flamefinger": "\uAC94\uB808\uBE0C \uD50C\uB808\uC784\uD551\uAC70",
      Gem: "\uBCF4\uC11D",
      "Gerke's Sanctuary": "\uAC8C\uB974\uCF00\uC758 \uC131\uC5ED",
      "Ghost Armor": "\uACE0\uC2A4\uD2B8 \uC544\uBA38",
      "Ghost Glaive": "\uACE0\uC2A4\uD2B8 \uAE00\uB808\uC774\uBE0C",
      "Ghost Wand": "\uACE0\uC2A4\uD2B8 \uC6D0\uB4DC",
      Ghostflame: "\uC720\uB839\uBD88\uAF43",
      Ghostly: "\uC720\uB839",
      Ghoul: "\uAD6C\uC6B8",
      "Ghoul Aegis": "\uAD6C\uC6B8 \uBC29\uD328",
      "Ghoul Badge": "\uAD6C\uC6B8 \uD718\uC7A5",
      "Ghoul Band": "\uAD6C\uC6B8 \uBC18\uC9C0",
      "Ghoul Barb": "\uAD6C\uC6B8 \uBBF8\uB298",
      "Ghoul Beads": "\uAD6C\uC6B8 \uAD6C\uC2AC",
      "Ghoul Bite": "\uAD6C\uC6B8 \uC774\uBE68",
      "Ghoul Blazer": "\uAD6C\uC6B8 \uAC1C\uCC99\uC790",
      "Ghoul Bludgeon": "\uAD6C\uC6B8 \uACE4\uBD09",
      "Ghoul Bolt": "\uAD6C\uC6B8 \uD654\uC0B4",
      "Ghoul Branch": "\uAD6C\uC6B8 \uAC00\uC9C0",
      "Ghoul Brow": "\uAD6C\uC6B8 \uC774\uB9C8",
      "Ghoul Buckle": "\uAD6C\uC6B8 \uBC84\uD074",
      "Ghoul Call": "\uAD6C\uC6B8 \uBD80\uB984",
      "Ghoul Carapace": "\uAD6C\uC6B8 \uAC11\uAC01",
      "Ghoul Casque": "\uAD6C\uC6B8 \uD22C\uAD6C",
      "Ghoul Chant": "\uAD6C\uC6B8 \uCC2C\uAC00",
      "Ghoul Clasp": "\uAD6C\uC6B8 \uAC78\uC1E0",
      "Ghoul Claw": "\uAD6C\uC6B8 \uBC1C\uD1B1",
      "Ghoul Cleaver": "\uAD6C\uC6B8 \uAC00\uB984\uB0A0",
      "Ghoul Clutches": "\uAD6C\uC6B8 \uB9C8\uC218",
      "Ghoul Coat": "\uAD6C\uC6B8 \uC678\uD22C",
      "Ghoul Coil": "\uAD6C\uC6B8 \uACE0\uB9AC",
      "Ghoul Collar": "\uAD6C\uC6B8 \uBAA9\uD14C",
      "Ghoul Cord": "\uAD6C\uC6B8 \uB048",
      "Ghoul Cowl": "\uAD6C\uC6B8 \uC218\uB3C4\uB450\uAC74",
      "Ghoul Crack": "\uAD6C\uC6B8 \uADE0\uC5F4",
      "Ghoul Crest": "\uAD6C\uC6B8 \uBB38\uC7A5",
      "Ghoul Crusher": "\uAD6C\uC6B8 \uBD84\uC1C4\uAE30",
      "Ghoul Cry": "\uAD6C\uC6B8 \uC6B8\uC74C",
      "Ghoul Dart": "\uAD6C\uC6B8 \uD22C\uCC3D",
      "Ghoul Edge": "\uAD6C\uC6B8 \uCE7C\uB0A0",
      "Ghoul Emblem": "\uAD6C\uC6B8 \uC0C1\uC9D5",
      "Ghoul Eye": "\uAD6C\uC6B8 \uB208",
      "Ghoul Fang": "\uAD6C\uC6B8 \uC1A1\uACF3\uB2C8",
      "Ghoul Finger": "\uAD6C\uC6B8 \uC190\uAC00\uB77D",
      "Ghoul Fist": "\uAD6C\uC6B8 \uC8FC\uBA39",
      "Ghoul Fletch": "\uAD6C\uC6B8 \uD654\uC0B4\uAE43",
      "Ghoul Flight": "\uAD6C\uC6B8 \uBE44\uD589",
      "Ghoul Glare": "\uAD6C\uC6B8 \uC12C\uAD11",
      "Ghoul Gnarl": "\uAD6C\uC6B8 \uC639\uC774",
      "Ghoul Goad": "\uAD6C\uC6B8 \uBAB0\uC774\uB9C9\uB300",
      "Ghoul Gorget": "\uAD6C\uC6B8 \uBAA9\uAC00\uB9AC\uAC1C",
      "Ghoul Grip": "\uAD6C\uC6B8 \uC190\uC544\uADC0",
      "Ghoul Guard": "\uAD6C\uC6B8 \uC218\uD638",
      "Ghoul Gutter": "\uAD6C\uC6B8 \uC808\uAC1C",
      "Ghoul Gyre": "\uAD6C\uC6B8 \uC18C\uC6A9\uB3CC\uC774",
      "Ghoul Hand": "\uAD6C\uC6B8 \uC190",
      "Ghoul Heart": "\uAD6C\uC6B8 \uC2EC\uC7A5",
      "Ghoul Hew": "\uAD6C\uC6B8 \uCC0D\uAE30",
      "Ghoul Hide": "\uAD6C\uC6B8 \uAC00\uC8FD",
      "Ghoul Hold": "\uAD6C\uC6B8 \uC6C0\uCF1C\uC960",
      "Ghoul Hood": "\uAD6C\uC6B8 \uB450\uAC74",
      "Ghoul Horn": "\uAD6C\uC6B8 \uBFD4",
      "Ghoul Impaler": "\uAD6C\uC6B8 \uAD00\uD1B5\uC790",
      "Ghoul Jack": "\uAD6C\uC6B8 \uC6C3\uC637",
      "Ghoul Knell": "\uAD6C\uC6B8 \uC870\uC885",
      "Ghoul Knot": "\uAD6C\uC6B8 \uB9E4\uB4ED",
      "Ghoul Knuckle": "\uAD6C\uC6B8 \uC190\uB9C8\uB514",
      "Ghoul Lance": "\uAD6C\uC6B8 \uCC3D",
      "Ghoul Lash": "\uAD6C\uC6B8 \uCC44\uCC0D",
      "Ghoul Lock": "\uAD6C\uC6B8 \uC790\uBB3C\uC1E0",
      "Ghoul Loop": "\uAD6C\uC6B8 \uD14C",
      "Ghoul Mallet": "\uAD6C\uC6B8 \uB9DD\uCE58",
      "Ghoul Mangler": "\uAD6C\uC6B8 \uB09C\uB3C4\uC9C8",
      "Ghoul Mantle": "\uAD6C\uC6B8 \uB9DD\uD1A0",
      "Ghoul Mark": "\uAD6C\uC6B8 \uD45C\uC2DD",
      "Ghoul Mask": "\uAD6C\uC6B8 \uAC00\uBA74",
      "Ghoul Mauler": "\uAD6C\uC6B8 \uD30C\uAD34\uC790",
      "Ghoul Nails": "\uAD6C\uC6B8 \uBABB",
      "Ghoul Necklace": "\uAD6C\uC6B8 \uBAA9\uAC78\uC774",
      "Ghoul Needle": "\uAD6C\uC6B8 \uBC14\uB298",
      "Ghoul Nock": "\uAD6C\uC6B8 \uC2DC\uC704\uD648",
      "Ghoul Noose": "\uAD6C\uC6B8 \uC62C\uAC00\uBBF8",
      "Ghoul Orb": "\uAD6C\uC6B8 \uBCF4\uC8FC",
      "Ghoul Pelt": "\uAD6C\uC6B8 \uBAA8\uD53C",
      "Ghoul Prod": "\uAD6C\uC6B8 \uCC0C\uB974\uAE30",
      "Ghoul Quarrel": "\uAD6C\uC6B8 \uC1E0\uB1CC\uC0B4",
      "Ghoul Quill": "\uAD6C\uC6B8 \uAE43",
      "Ghoul Razor": "\uAD6C\uC6B8 \uBA74\uB3C4\uB0A0",
      "Ghoul Rend": "\uAD6C\uC6B8 \uCC22\uAE40",
      "Ghoul Road": "\uAD6C\uC6B8 \uAE38",
      "Ghoul Saw": "\uAD6C\uC6B8 \uD1B1",
      "Ghoul Scalpel": "\uAD6C\uC6B8 \uD574\uBD80\uCE7C",
      "Ghoul Scarab": "\uAD6C\uC6B8 \uD48D\uB385\uC774",
      "Ghoul Scourge": "\uAD6C\uC6B8 \uC7AC\uC559",
      "Ghoul Scratch": "\uAD6C\uC6B8 \uD560\uD034\uAE30",
      "Ghoul Scythe": "\uAD6C\uC6B8 \uB0AB",
      "Ghoul Shard": "\uAD6C\uC6B8 \uD30C\uD3B8",
      "Ghoul Shroud": "\uAD6C\uC6B8 \uC218\uC758",
      "Ghoul Slippers": "\uAD6C\uC6B8 \uB367\uC2E0",
      "Ghoul Smasher": "\uAD6C\uC6B8 \uBD84\uC1C4\uC790",
      "Ghoul Song": "\uAD6C\uC6B8 \uB178\uB798",
      "Ghoul Spell": "\uAD6C\uC6B8 \uC8FC\uBB38",
      "Ghoul Sphere": "\uAD6C\uC6B8 \uAD6C\uCCB4",
      "Ghoul Spike": "\uAD6C\uC6B8 \uAC00\uC2DC",
      "Ghoul Spiral": "\uAD6C\uC6B8 \uB098\uC120",
      "Ghoul Spire": "\uAD6C\uC6B8 \uCCA8\uD0D1",
      "Ghoul Splitter": "\uAD6C\uC6B8 \uCABC\uAC1C\uB294\uC790",
      "Ghoul Spur": "\uAD6C\uC6B8 \uBC15\uCC28",
      "Ghoul Stake": "\uAD6C\uC6B8 \uB9D0\uB69D",
      "Ghoul Stalk": "\uAD6C\uC6B8 \uCD94\uC801",
      "Ghoul Star": "\uAD6C\uC6B8 \uBCC4",
      "Ghoul Stinger": "\uAD6C\uC6B8 \uB3C5\uCE68",
      "Ghoul Strap": "\uAD6C\uC6B8 \uB760",
      "Ghoul Suit": "\uAD6C\uC6B8 \uAC11\uC637",
      "Ghoul Sunder": "\uAD6C\uC6B8 \uC808\uB2E8",
      "Ghoul Talisman": "\uAD6C\uC6B8 \uBD80\uC801",
      "Ghoul Thirst": "\uAD6C\uC6B8 \uAC08\uC99D",
      "Ghoul Torc": "\uAD6C\uC6B8 \uBAA9\uACE0\uB9AC",
      "Ghoul Tower": "\uAD6C\uC6B8 \uD0D1",
      "Ghoul Track": "\uAD6C\uC6B8 \uBC1C\uC790\uAD6D",
      "Ghoul Trample": "\uAD6C\uC6B8 \uC9D3\uBC1F\uAE30",
      "Ghoul Turn": "\uAD6C\uC6B8 \uD68C\uC804",
      "Ghoul Veil": "\uAD6C\uC6B8 \uC7A5\uB9C9",
      "Ghoul Visage": "\uAD6C\uC6B8 \uC5BC\uAD74",
      "Ghoul Ward": "\uAD6C\uC6B8 \uBCF4\uD638",
      "Ghoul Weaver": "\uAD6C\uC6B8 \uC9C1\uC870\uC790",
      "Ghoul Wing": "\uAD6C\uC6B8 \uB0A0\uAC1C",
      "Ghoul Wrack": "\uAD6C\uC6B8 \uACE0\uBB38",
      "Giant Axe": "\uC790\uC774\uC5B8\uD2B8 \uC561\uC2A4",
      "Giant Sword": "\uC790\uC774\uC5B8\uD2B8 \uC18C\uB4DC",
      "Gilded Shield": "\uAE38\uB514\uB4DC \uC274\uB4DC",
      Glacial: "\uBE59\uD558",
      "Glacial Spike": "\uBE59\uD558 \uAC00\uC2DC",
      "Glacial Trail": "\uBE59\uD558\uC758 \uAE38",
      Gladius: "\uAE00\uB798\uB514\uC6B0\uC2A4",
      Glaive: "\uAE00\uB808\uC774\uBE0C",
      Glare: "\uC12C\uAD11",
      Glimmering: "\uAC00\uBB3C\uAC70\uB9AC\uB294",
      Gloom: "\uC5B4\uC2A4\uB984",
      "Gloom's Trap": "\uC5B4\uC2A4\uB984\uC758 \uB36B",
      Glorious: "\uC601\uAD11\uC2A4\uB7EC\uC6B4",
      "Glorious Axe": "\uAE00\uB85C\uB9AC\uC5B4\uC2A4 \uC561\uC2A4",
      Gloves: "\uC7A5\uAC11",
      Glowing: "\uC774\uCC44\uB85C\uC6B4",
      "Glowing Orb": "\uAE00\uB85C\uC789 \uC624\uBE0C",
      Gnarl: "\uC639\uC774",
      "Gnarled Staff": "\uB098\uC54C\uB4DC \uC2A4\uD0DC\uD504",
      Goad: "\uBAB0\uC774\uB9C9\uB300",
      Goatman: "\uC5FC\uC18C\uC778\uAC04",
      Godly: "\uC2E0\uC758",
      Gold: "\uACE8\uB4DC",
      "Gold banked for Charsi": "\uCC30\uC2DC\uC5D0\uAC8C \uB9E1\uACA8 \uB454 \uACE8\uB4DC\uC785\uB2C8\uB2E4.",
      "Gold Find": "\uACE8\uB4DC \uD68D\uB4DD",
      Goldwrap: "\uAE08\uBC15 \uD5C8\uB9AC\uB760",
      "Golem Mastery": "\uACE8\uB818 \uC219\uB828",
      "Golemlord's": "\uACE8\uB818\uAD70\uC8FC\uC758",
      "Golems get +#% life, +#% damage and +#% speed": "\uACE8\uB818\uC758 \uC0DD\uBA85\uB825 +{0}%, \uD53C\uD574 +{1}%, \uC18D\uB3C4 +{2}%",
      Gore: "\uC120\uD608",
      "Gore Rider": "\uC120\uD608 \uAE30\uC218",
      Gorefoot: "\uD54F\uB369\uC774\uBC1C",
      Gorget: "\uBAA9\uAC00\uB9AC\uAC1C",
      "Gothic Axe": "\uACE0\uB515 \uC561\uC2A4",
      "Gothic Bow": "\uACE0\uB515 \uBCF4\uC6B0",
      "Gothic Shield": "\uACE0\uB515 \uC274\uB4DC",
      "Gothic Staff": "\uACE0\uB515 \uC2A4\uD0DC\uD504",
      "Grand Crown": "\uADF8\uB79C\uB4DC \uD06C\uB77C\uC6B4",
      "Grand Matron Bow": "\uADF8\uB79C\uB4DC \uBA54\uC774\uD2B8\uB7F0 \uBCF4\uC6B0",
      "Grand Scepter": "\uADF8\uB79C\uB4DC \uC149\uD130",
      "Grand Vizier of Chaos": "\uD63C\uB3C8\uC758 \uB300\uC7A5\uB85C",
      "Grandmaster's": "\uAC70\uC7A5\uC758",
      "Grave Wand": "\uADF8\uB808\uC774\uBE0C \uC6D0\uB4DC",
      Gravenspine: "\uC0C8\uAE40\uB4F1\uBF08",
      "Graverobber's": "\uB3C4\uAD74\uAFBC\uC758",
      Gray: "\uC7BF\uBE5B",
      "Great Axe": "\uADF8\uB808\uC774\uD2B8 \uC561\uC2A4",
      "Great Bow": "\uADF8\uB808\uC774\uD2B8 \uBCF4\uC6B0",
      "Great Helm": "\uADF8\uB808\uC774\uD2B8 \uD5EC\uB984",
      "Great Marsh": "\uAC70\uB300 \uC2B5\uC9C0",
      "Great Pilum": "\uADF8\uB808\uC774\uD2B8 \uD544\uB7FC",
      "Great Poleaxe": "\uADF8\uB808\uC774\uD2B8 \uD3F4\uC561\uC2A4",
      "Great Sword": "\uADF8\uB808\uC774\uD2B8 \uC18C\uB4DC",
      "Great Wyrm's": "\uB300\uACE0\uB8E1\uC758",
      "Greater Claws": "\uADF8\uB808\uC774\uD130 \uD074\uB7EC",
      "Greater Talons": "\uADF8\uB808\uC774\uD130 \uD0E4\uB7F0",
      Greaves: "\uADF8\uB9AC\uBE0C",
      Greyform: "\uD68C\uC0C9 \uD615\uCCB4",
      Grief: "\uBE44\uD0C4",
      "Griffon Headdress": "\uADF8\uB9AC\uD3F0 \uD5E4\uB4DC\uB808\uC2A4",
      "Griffon's Eye": "\uADF8\uB9AC\uD3F0\uC758 \uB208",
      Grim: "\uB0C9\uD639",
      "Grim Aegis": "\uB0C9\uD639 \uBC29\uD328",
      "Grim Badge": "\uB0C9\uD639 \uD718\uC7A5",
      "Grim Band": "\uB0C9\uD639 \uBC18\uC9C0",
      "Grim Barb": "\uB0C9\uD639 \uBBF8\uB298",
      "Grim Beads": "\uB0C9\uD639 \uAD6C\uC2AC",
      "Grim Bite": "\uB0C9\uD639 \uC774\uBE68",
      "Grim Blazer": "\uB0C9\uD639 \uAC1C\uCC99\uC790",
      "Grim Bludgeon": "\uB0C9\uD639 \uACE4\uBD09",
      "Grim Bolt": "\uB0C9\uD639 \uD654\uC0B4",
      "Grim Branch": "\uB0C9\uD639 \uAC00\uC9C0",
      "Grim Brow": "\uB0C9\uD639 \uC774\uB9C8",
      "Grim Buckle": "\uB0C9\uD639 \uBC84\uD074",
      "Grim Call": "\uB0C9\uD639 \uBD80\uB984",
      "Grim Carapace": "\uB0C9\uD639 \uAC11\uAC01",
      "Grim Casque": "\uB0C9\uD639 \uD22C\uAD6C",
      "Grim Chant": "\uB0C9\uD639 \uCC2C\uAC00",
      "Grim Clasp": "\uB0C9\uD639 \uAC78\uC1E0",
      "Grim Claw": "\uB0C9\uD639 \uBC1C\uD1B1",
      "Grim Cleaver": "\uB0C9\uD639 \uAC00\uB984\uB0A0",
      "Grim Clutches": "\uB0C9\uD639 \uB9C8\uC218",
      "Grim Coat": "\uB0C9\uD639 \uC678\uD22C",
      "Grim Coil": "\uB0C9\uD639 \uACE0\uB9AC",
      "Grim Collar": "\uB0C9\uD639 \uBAA9\uD14C",
      "Grim Cord": "\uB0C9\uD639 \uB048",
      "Grim Cowl": "\uB0C9\uD639 \uC218\uB3C4\uB450\uAC74",
      "Grim Crack": "\uB0C9\uD639 \uADE0\uC5F4",
      "Grim Crest": "\uB0C9\uD639 \uBB38\uC7A5",
      "Grim Crusher": "\uB0C9\uD639 \uBD84\uC1C4\uAE30",
      "Grim Cry": "\uB0C9\uD639 \uC6B8\uC74C",
      "Grim Dart": "\uB0C9\uD639 \uD22C\uCC3D",
      "Grim Edge": "\uB0C9\uD639 \uCE7C\uB0A0",
      "Grim Emblem": "\uB0C9\uD639 \uC0C1\uC9D5",
      "Grim Eye": "\uB0C9\uD639 \uB208",
      "Grim Fang": "\uB0C9\uD639 \uC1A1\uACF3\uB2C8",
      "Grim Finger": "\uB0C9\uD639 \uC190\uAC00\uB77D",
      "Grim Fist": "\uB0C9\uD639 \uC8FC\uBA39",
      "Grim Fletch": "\uB0C9\uD639 \uD654\uC0B4\uAE43",
      "Grim Flight": "\uB0C9\uD639 \uBE44\uD589",
      "Grim Glare": "\uB0C9\uD639 \uC12C\uAD11",
      "Grim Gnarl": "\uB0C9\uD639 \uC639\uC774",
      "Grim Goad": "\uB0C9\uD639 \uBAB0\uC774\uB9C9\uB300",
      "Grim Gorget": "\uB0C9\uD639 \uBAA9\uAC00\uB9AC\uAC1C",
      "Grim Grip": "\uB0C9\uD639 \uC190\uC544\uADC0",
      "Grim Guard": "\uB0C9\uD639 \uC218\uD638",
      "Grim Gutter": "\uB0C9\uD639 \uC808\uAC1C",
      "Grim Gyre": "\uB0C9\uD639 \uC18C\uC6A9\uB3CC\uC774",
      "Grim Hand": "\uB0C9\uD639 \uC190",
      "Grim Heart": "\uB0C9\uD639 \uC2EC\uC7A5",
      "Grim Hew": "\uB0C9\uD639 \uCC0D\uAE30",
      "Grim Hide": "\uB0C9\uD639 \uAC00\uC8FD",
      "Grim Hold": "\uB0C9\uD639 \uC6C0\uCF1C\uC960",
      "Grim Hood": "\uB0C9\uD639 \uB450\uAC74",
      "Grim Horn": "\uB0C9\uD639 \uBFD4",
      "Grim Impaler": "\uB0C9\uD639 \uAD00\uD1B5\uC790",
      "Grim Jack": "\uB0C9\uD639 \uC6C3\uC637",
      "Grim Knell": "\uB0C9\uD639 \uC870\uC885",
      "Grim Knot": "\uB0C9\uD639 \uB9E4\uB4ED",
      "Grim Knuckle": "\uB0C9\uD639 \uC190\uB9C8\uB514",
      "Grim Lance": "\uB0C9\uD639 \uCC3D",
      "Grim Lash": "\uB0C9\uD639 \uCC44\uCC0D",
      "Grim Lock": "\uB0C9\uD639 \uC790\uBB3C\uC1E0",
      "Grim Loop": "\uB0C9\uD639 \uD14C",
      "Grim Mallet": "\uB0C9\uD639 \uB9DD\uCE58",
      "Grim Mangler": "\uB0C9\uD639 \uB09C\uB3C4\uC9C8",
      "Grim Mantle": "\uB0C9\uD639 \uB9DD\uD1A0",
      "Grim Mark": "\uB0C9\uD639 \uD45C\uC2DD",
      "Grim Mask": "\uB0C9\uD639 \uAC00\uBA74",
      "Grim Mauler": "\uB0C9\uD639 \uD30C\uAD34\uC790",
      "Grim Nails": "\uB0C9\uD639 \uBABB",
      "Grim Necklace": "\uB0C9\uD639 \uBAA9\uAC78\uC774",
      "Grim Needle": "\uB0C9\uD639 \uBC14\uB298",
      "Grim Nock": "\uB0C9\uD639 \uC2DC\uC704\uD648",
      "Grim Noose": "\uB0C9\uD639 \uC62C\uAC00\uBBF8",
      "Grim Orb": "\uB0C9\uD639 \uBCF4\uC8FC",
      "Grim Pelt": "\uB0C9\uD639 \uBAA8\uD53C",
      "Grim Prod": "\uB0C9\uD639 \uCC0C\uB974\uAE30",
      "Grim Quarrel": "\uB0C9\uD639 \uC1E0\uB1CC\uC0B4",
      "Grim Quill": "\uB0C9\uD639 \uAE43",
      "Grim Razor": "\uB0C9\uD639 \uBA74\uB3C4\uB0A0",
      "Grim Rend": "\uB0C9\uD639 \uCC22\uAE40",
      "Grim Road": "\uB0C9\uD639 \uAE38",
      "Grim Saw": "\uB0C9\uD639 \uD1B1",
      "Grim Scalpel": "\uB0C9\uD639 \uD574\uBD80\uCE7C",
      "Grim Scarab": "\uB0C9\uD639 \uD48D\uB385\uC774",
      "Grim Scourge": "\uB0C9\uD639 \uC7AC\uC559",
      "Grim Scratch": "\uB0C9\uD639 \uD560\uD034\uAE30",
      "Grim Scythe": "\uB0C9\uD639 \uB0AB",
      "Grim Shard": "\uB0C9\uD639 \uD30C\uD3B8",
      "Grim Shield": "\uADF8\uB9BC \uC274\uB4DC",
      "Grim Shroud": "\uB0C9\uD639 \uC218\uC758",
      "Grim Slippers": "\uB0C9\uD639 \uB367\uC2E0",
      "Grim Smasher": "\uB0C9\uD639 \uBD84\uC1C4\uC790",
      "Grim Song": "\uB0C9\uD639 \uB178\uB798",
      "Grim Spell": "\uB0C9\uD639 \uC8FC\uBB38",
      "Grim Sphere": "\uB0C9\uD639 \uAD6C\uCCB4",
      "Grim Spike": "\uB0C9\uD639 \uAC00\uC2DC",
      "Grim Spiral": "\uB0C9\uD639 \uB098\uC120",
      "Grim Spire": "\uB0C9\uD639 \uCCA8\uD0D1",
      "Grim Splitter": "\uB0C9\uD639 \uCABC\uAC1C\uB294\uC790",
      "Grim Spur": "\uB0C9\uD639 \uBC15\uCC28",
      "Grim Stake": "\uB0C9\uD639 \uB9D0\uB69D",
      "Grim Stalk": "\uB0C9\uD639 \uCD94\uC801",
      "Grim Star": "\uB0C9\uD639 \uBCC4",
      "Grim Stinger": "\uB0C9\uD639 \uB3C5\uCE68",
      "Grim Strap": "\uB0C9\uD639 \uB760",
      "Grim Suit": "\uB0C9\uD639 \uAC11\uC637",
      "Grim Sunder": "\uB0C9\uD639 \uC808\uB2E8",
      "Grim Talisman": "\uB0C9\uD639 \uBD80\uC801",
      "Grim Thirst": "\uB0C9\uD639 \uAC08\uC99D",
      "Grim Torc": "\uB0C9\uD639 \uBAA9\uACE0\uB9AC",
      "Grim Tower": "\uB0C9\uD639 \uD0D1",
      "Grim Track": "\uB0C9\uD639 \uBC1C\uC790\uAD6D",
      "Grim Trample": "\uB0C9\uD639 \uC9D3\uBC1F\uAE30",
      "Grim Turn": "\uB0C9\uD639 \uD68C\uC804",
      "Grim Veil": "\uB0C9\uD639 \uC7A5\uB9C9",
      "Grim Visage": "\uB0C9\uD639 \uC5BC\uAD74",
      "Grim Wand": "\uADF8\uB9BC \uC6D0\uB4DC",
      "Grim Ward": "\uC12C\uB729\uD55C \uD638\uC2E0\uBD80",
      "Grim Weaver": "\uB0C9\uD639 \uC9C1\uC870\uC790",
      "Grim Wing": "\uB0C9\uD639 \uB0A0\uAC1C",
      "Grim Wrack": "\uB0C9\uD639 \uACE0\uBB38",
      Grin: "\uBBF8\uC18C",
      Grip: "\uC190\uC544\uADC0",
      Griswold: "\uADF8\uB9AC\uC2A4\uC6D4\uB4DC",
      "Griswold's Edge": "\uADF8\uB9AC\uC2A4\uC6D4\uB4DC\uC758 \uB0A0",
      Gritty: "\uAC70\uCE5C",
      Growler: "\uC73C\uB974\uB801\uC774",
      Grumble: "\uD22C\uB35C\uC774",
      Guard: "\uC218\uD638",
      "Guardian Crown": "\uAC00\uB514\uC5B8 \uD06C\uB77C\uC6B4",
      "Guardian's": "\uC218\uD638\uC790\uC758",
      "Guided Arrow": "\uC720\uB3C4 \uD654\uC0B4",
      Gull: "\uC18D\uC784\uC218",
      Gut: "\uB0B4\uC7A5",
      Gutter: "\uC808\uAC1C",
      "Gymnast's": "\uCCB4\uC870\uAC00\uC758",
      Gyre: "\uC18C\uC6A9\uB3CC\uC774",
      Hack: "\uBCA0\uAE30",
      "Halaberd's Reign": "\uD560\uB77C\uBC84\uB4DC\uC758 \uD1B5\uCE58",
      Halberd: "\uD5EC\uBC84\uB4DC",
      "Half as much Faster Cast Rate: attacks here recharge as spells do": "\uC2DC\uC804 \uC18D\uB3C4\uC758 \uC808\uBC18\uC73C\uB85C \uC801\uC6A9: \uC5EC\uAE30\uC120 \uACF5\uACA9\uB3C4 \uC8FC\uBB38\uCC98\uB7FC \uC7AC\uCDA9\uC804\uB428",
      "Half Freeze Duration": "\uBE59\uACB0 \uC9C0\uC18D\uC2DC\uAC04 \uC808\uBC18\uC73C\uB85C \uAC10\uC18C",
      "Halls of Vaught": "\uBCF4\uD2B8\uC758 \uC804\uB2F9",
      hammer: "\uB9DD\uCE58",
      Hand: "\uC190",
      "hand #": "\uC190 {0}",
      "Hand Axe": "\uD578\uB4DC \uC561\uC2A4",
      "Hand of Blessed Light": "\uCD95\uBCF5\uBC1B\uC740 \uBE5B\uC758 \uC190",
      "Hand Scythe": "\uD578\uB4DC \uC0AC\uC774\uB4DC",
      "Harlequin Crest": "\uD560\uB9AC\uD038 \uAD00\uBAA8",
      Harpoon: "\uD558\uD47C",
      "Harpoonist's": "\uC791\uC0B4\uC7A1\uC774\uC758",
      Hatchet: "\uD574\uCE6B",
      "Hatchet Hands": "\uD574\uCE6B \uD578\uC988",
      Havoc: "\uB300\uD63C\uB780",
      "Havoc Aegis": "\uB300\uD63C\uB780 \uBC29\uD328",
      "Havoc Badge": "\uB300\uD63C\uB780 \uD718\uC7A5",
      "Havoc Band": "\uB300\uD63C\uB780 \uBC18\uC9C0",
      "Havoc Barb": "\uB300\uD63C\uB780 \uBBF8\uB298",
      "Havoc Beads": "\uB300\uD63C\uB780 \uAD6C\uC2AC",
      "Havoc Bite": "\uB300\uD63C\uB780 \uC774\uBE68",
      "Havoc Blazer": "\uB300\uD63C\uB780 \uAC1C\uCC99\uC790",
      "Havoc Bludgeon": "\uB300\uD63C\uB780 \uACE4\uBD09",
      "Havoc Bolt": "\uB300\uD63C\uB780 \uD654\uC0B4",
      "Havoc Branch": "\uB300\uD63C\uB780 \uAC00\uC9C0",
      "Havoc Brow": "\uB300\uD63C\uB780 \uC774\uB9C8",
      "Havoc Buckle": "\uB300\uD63C\uB780 \uBC84\uD074",
      "Havoc Call": "\uB300\uD63C\uB780 \uBD80\uB984",
      "Havoc Carapace": "\uB300\uD63C\uB780 \uAC11\uAC01",
      "Havoc Casque": "\uB300\uD63C\uB780 \uD22C\uAD6C",
      "Havoc Chant": "\uB300\uD63C\uB780 \uCC2C\uAC00",
      "Havoc Clasp": "\uB300\uD63C\uB780 \uAC78\uC1E0",
      "Havoc Claw": "\uB300\uD63C\uB780 \uBC1C\uD1B1",
      "Havoc Cleaver": "\uB300\uD63C\uB780 \uAC00\uB984\uB0A0",
      "Havoc Clutches": "\uB300\uD63C\uB780 \uB9C8\uC218",
      "Havoc Coat": "\uB300\uD63C\uB780 \uC678\uD22C",
      "Havoc Coil": "\uB300\uD63C\uB780 \uACE0\uB9AC",
      "Havoc Collar": "\uB300\uD63C\uB780 \uBAA9\uD14C",
      "Havoc Cord": "\uB300\uD63C\uB780 \uB048",
      "Havoc Cowl": "\uB300\uD63C\uB780 \uC218\uB3C4\uB450\uAC74",
      "Havoc Crack": "\uB300\uD63C\uB780 \uADE0\uC5F4",
      "Havoc Crest": "\uB300\uD63C\uB780 \uBB38\uC7A5",
      "Havoc Crusher": "\uB300\uD63C\uB780 \uBD84\uC1C4\uAE30",
      "Havoc Cry": "\uB300\uD63C\uB780 \uC6B8\uC74C",
      "Havoc Dart": "\uB300\uD63C\uB780 \uD22C\uCC3D",
      "Havoc Edge": "\uB300\uD63C\uB780 \uCE7C\uB0A0",
      "Havoc Emblem": "\uB300\uD63C\uB780 \uC0C1\uC9D5",
      "Havoc Eye": "\uB300\uD63C\uB780 \uB208",
      "Havoc Fang": "\uB300\uD63C\uB780 \uC1A1\uACF3\uB2C8",
      "Havoc Finger": "\uB300\uD63C\uB780 \uC190\uAC00\uB77D",
      "Havoc Fist": "\uB300\uD63C\uB780 \uC8FC\uBA39",
      "Havoc Fletch": "\uB300\uD63C\uB780 \uD654\uC0B4\uAE43",
      "Havoc Flight": "\uB300\uD63C\uB780 \uBE44\uD589",
      "Havoc Glare": "\uB300\uD63C\uB780 \uC12C\uAD11",
      "Havoc Gnarl": "\uB300\uD63C\uB780 \uC639\uC774",
      "Havoc Goad": "\uB300\uD63C\uB780 \uBAB0\uC774\uB9C9\uB300",
      "Havoc Gorget": "\uB300\uD63C\uB780 \uBAA9\uAC00\uB9AC\uAC1C",
      "Havoc Grip": "\uB300\uD63C\uB780 \uC190\uC544\uADC0",
      "Havoc Guard": "\uB300\uD63C\uB780 \uC218\uD638",
      "Havoc Gutter": "\uB300\uD63C\uB780 \uC808\uAC1C",
      "Havoc Gyre": "\uB300\uD63C\uB780 \uC18C\uC6A9\uB3CC\uC774",
      "Havoc Hand": "\uB300\uD63C\uB780 \uC190",
      "Havoc Heart": "\uB300\uD63C\uB780 \uC2EC\uC7A5",
      "Havoc Hew": "\uB300\uD63C\uB780 \uCC0D\uAE30",
      "Havoc Hide": "\uB300\uD63C\uB780 \uAC00\uC8FD",
      "Havoc Hold": "\uB300\uD63C\uB780 \uC6C0\uCF1C\uC960",
      "Havoc Hood": "\uB300\uD63C\uB780 \uB450\uAC74",
      "Havoc Horn": "\uB300\uD63C\uB780 \uBFD4",
      "Havoc Impaler": "\uB300\uD63C\uB780 \uAD00\uD1B5\uC790",
      "Havoc Jack": "\uB300\uD63C\uB780 \uC6C3\uC637",
      "Havoc Knell": "\uB300\uD63C\uB780 \uC870\uC885",
      "Havoc Knot": "\uB300\uD63C\uB780 \uB9E4\uB4ED",
      "Havoc Knuckle": "\uB300\uD63C\uB780 \uC190\uB9C8\uB514",
      "Havoc Lance": "\uB300\uD63C\uB780 \uCC3D",
      "Havoc Lash": "\uB300\uD63C\uB780 \uCC44\uCC0D",
      "Havoc Lock": "\uB300\uD63C\uB780 \uC790\uBB3C\uC1E0",
      "Havoc Loop": "\uB300\uD63C\uB780 \uD14C",
      "Havoc Mallet": "\uB300\uD63C\uB780 \uB9DD\uCE58",
      "Havoc Mangler": "\uB300\uD63C\uB780 \uB09C\uB3C4\uC9C8",
      "Havoc Mantle": "\uB300\uD63C\uB780 \uB9DD\uD1A0",
      "Havoc Mark": "\uB300\uD63C\uB780 \uD45C\uC2DD",
      "Havoc Mask": "\uB300\uD63C\uB780 \uAC00\uBA74",
      "Havoc Mauler": "\uB300\uD63C\uB780 \uD30C\uAD34\uC790",
      "Havoc Nails": "\uB300\uD63C\uB780 \uBABB",
      "Havoc Necklace": "\uB300\uD63C\uB780 \uBAA9\uAC78\uC774",
      "Havoc Needle": "\uB300\uD63C\uB780 \uBC14\uB298",
      "Havoc Nock": "\uB300\uD63C\uB780 \uC2DC\uC704\uD648",
      "Havoc Noose": "\uB300\uD63C\uB780 \uC62C\uAC00\uBBF8",
      "Havoc Orb": "\uB300\uD63C\uB780 \uBCF4\uC8FC",
      "Havoc Pelt": "\uB300\uD63C\uB780 \uBAA8\uD53C",
      "Havoc Prod": "\uB300\uD63C\uB780 \uCC0C\uB974\uAE30",
      "Havoc Quarrel": "\uB300\uD63C\uB780 \uC1E0\uB1CC\uC0B4",
      "Havoc Quill": "\uB300\uD63C\uB780 \uAE43",
      "Havoc Razor": "\uB300\uD63C\uB780 \uBA74\uB3C4\uB0A0",
      "Havoc Rend": "\uB300\uD63C\uB780 \uCC22\uAE40",
      "Havoc Road": "\uB300\uD63C\uB780 \uAE38",
      "Havoc Saw": "\uB300\uD63C\uB780 \uD1B1",
      "Havoc Scalpel": "\uB300\uD63C\uB780 \uD574\uBD80\uCE7C",
      "Havoc Scarab": "\uB300\uD63C\uB780 \uD48D\uB385\uC774",
      "Havoc Scourge": "\uB300\uD63C\uB780 \uC7AC\uC559",
      "Havoc Scratch": "\uB300\uD63C\uB780 \uD560\uD034\uAE30",
      "Havoc Scythe": "\uB300\uD63C\uB780 \uB0AB",
      "Havoc Shard": "\uB300\uD63C\uB780 \uD30C\uD3B8",
      "Havoc Shroud": "\uB300\uD63C\uB780 \uC218\uC758",
      "Havoc Slippers": "\uB300\uD63C\uB780 \uB367\uC2E0",
      "Havoc Smasher": "\uB300\uD63C\uB780 \uBD84\uC1C4\uC790",
      "Havoc Song": "\uB300\uD63C\uB780 \uB178\uB798",
      "Havoc Spell": "\uB300\uD63C\uB780 \uC8FC\uBB38",
      "Havoc Sphere": "\uB300\uD63C\uB780 \uAD6C\uCCB4",
      "Havoc Spike": "\uB300\uD63C\uB780 \uAC00\uC2DC",
      "Havoc Spiral": "\uB300\uD63C\uB780 \uB098\uC120",
      "Havoc Spire": "\uB300\uD63C\uB780 \uCCA8\uD0D1",
      "Havoc Splitter": "\uB300\uD63C\uB780 \uCABC\uAC1C\uB294\uC790",
      "Havoc Spur": "\uB300\uD63C\uB780 \uBC15\uCC28",
      "Havoc Stake": "\uB300\uD63C\uB780 \uB9D0\uB69D",
      "Havoc Stalk": "\uB300\uD63C\uB780 \uCD94\uC801",
      "Havoc Star": "\uB300\uD63C\uB780 \uBCC4",
      "Havoc Stinger": "\uB300\uD63C\uB780 \uB3C5\uCE68",
      "Havoc Strap": "\uB300\uD63C\uB780 \uB760",
      "Havoc Suit": "\uB300\uD63C\uB780 \uAC11\uC637",
      "Havoc Sunder": "\uB300\uD63C\uB780 \uC808\uB2E8",
      "Havoc Talisman": "\uB300\uD63C\uB780 \uBD80\uC801",
      "Havoc Thirst": "\uB300\uD63C\uB780 \uAC08\uC99D",
      "Havoc Torc": "\uB300\uD63C\uB780 \uBAA9\uACE0\uB9AC",
      "Havoc Tower": "\uB300\uD63C\uB780 \uD0D1",
      "Havoc Track": "\uB300\uD63C\uB780 \uBC1C\uC790\uAD6D",
      "Havoc Trample": "\uB300\uD63C\uB780 \uC9D3\uBC1F\uAE30",
      "Havoc Turn": "\uB300\uD63C\uB780 \uD68C\uC804",
      "Havoc Veil": "\uB300\uD63C\uB780 \uC7A5\uB9C9",
      "Havoc Visage": "\uB300\uD63C\uB780 \uC5BC\uAD74",
      "Havoc Ward": "\uB300\uD63C\uB780 \uBCF4\uD638",
      "Havoc Weaver": "\uB300\uD63C\uB780 \uC9C1\uC870\uC790",
      "Havoc Wing": "\uB300\uD63C\uB780 \uB0A0\uAC1C",
      "Havoc Wrack": "\uB300\uD63C\uB780 \uACE0\uBB38",
      Hawk: "\uB9E4",
      "Hawk Branded": "\uB9E4 \uB099\uC778\uC758",
      "Hawk Helm": "\uD638\uD06C \uD5EC\uB984",
      Hawkeye: "\uB9E4\uB208\uC758",
      Haze: "\uC5F0\uBB34",
      "He is a natural party leader, holy man, and blessed warrior.": "\uD0C0\uACE0\uB09C \uD30C\uD2F0\uC758 \uB9AC\uB354\uC774\uC790 \uC131\uC9C1\uC790\uC774\uBA70, \uCD95\uBCF5\uBC1B\uC740 \uC804\uC0AC\uC785\uB2C8\uB2E4.",
      "He is unequaled in close-quarters combat and mastery of weapons.": "\uADFC\uC811 \uC804\uD22C\uC640 \uBB34\uAE30 \uB2E4\uB8E8\uB294 \uC19C\uC528\uC5D0\uC11C \uADF8\uB97C \uB530\uB97C \uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      Head: "\uBA38\uB9AC",
      "Heal Stamina Plus": "\uC9C0\uAD6C\uB825 \uD68C\uBCF5 \uC18D\uB3C4 \uC99D\uAC00",
      "Healing Potion": "\uCE58\uC720 \uBB3C\uC57D",
      "Skills never run out of mana here": "\uC5EC\uAE30\uC11C\uB294 \uAE30\uC220\uC758 \uB9C8\uB098\uAC00 \uBC14\uB2E5\uB098\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "Heals * Life": "\uC0DD\uBA85\uB825 {0} \uD68C\uBCF5",
      Heart: "\uC2EC\uC7A5",
      "Heart of Wolverine": "\uC6B8\uBC84\uB9B0\uC758 \uC2EC\uC7A5",
      "Heart of Wolverine: +#% damage to your blows and your summons', +#% Attack Rating; Oak Sage's +#% life": "\uC6B8\uBC84\uB9B0\uC758 \uC2EC\uC7A5: \uC790\uC2E0\uACFC \uC18C\uD658\uC218\uC758 \uD53C\uD574 +{0}%, \uACF5\uACA9 \uB4F1\uAE09 +{1}%; \uCC38\uB098\uBB34 \uD604\uC790\uC758 \uC0DD\uBA85\uB825 +{2}%",
      Heater: "\uD788\uD130",
      "Heaven's Light": "\uCC9C\uC0C1\uC758 \uBE5B",
      "Heavenly Stone": "\uD5E4\uBE10\uB9AC \uC2A4\uD1A4",
      "Heavy Belt": "\uD5E4\uBE44 \uBCA8\uD2B8",
      "Heavy Boots": "\uD5E4\uBE44 \uBD80\uCE20",
      "Heavy Bracers": "\uD5E4\uBE44 \uBE0C\uB808\uC774\uC11C",
      "Heavy Crossbow": "\uD5E4\uBE44 \uD06C\uB85C\uC2A4\uBCF4\uC6B0",
      "Heavy Gloves": "\uD5E4\uBE44 \uAE00\uB7EC\uBE0C",
      HELL: "\uC9C0\uC625",
      Hellcast: "\uC9C0\uC625\uBC1C\uC0AC\uAE30",
      Hellclap: "\uC9C0\uC625\uB9DE\uC774",
      Hellmouth: "\uC9C0\uC625\uC5B4\uADC0",
      Hellplague: "\uC9C0\uC625\uC5ED\uBCD1",
      Hellrack: "\uC9C0\uC625\uD3EC",
      "Hellspawn Skull": "\uD5EC\uC2A4\uD3F0 \uC2A4\uCEEC",
      Helm: "\uD5EC\uB984",
      "Hephasto the Armorer": "\uB300\uC7A5\uC7A5\uC774 \uD5E4\uD30C\uC2A4\uD1A0",
      "Her attacks deal #% more damage": "\uADF8\uB140\uC758 \uACF5\uACA9 \uD53C\uD574 {0}% \uC99D\uAC00",
      "Herald of Zakarum": "\uC790\uCE74\uB8F8\uC758 \uC804\uB839",
      "Heraldic Shield": "\uD5E4\uB7F4\uB515 \uC274\uB4DC",
      Hew: "\uCC0D\uAE30",
      Hexing: "\uC800\uC8FC\uD558\uB294",
      Hibernal: "\uB3D9\uC808\uC758",
      Hide: "\uAC00\uC8FD",
      "Hierophant Trophy": "\uD558\uC774\uC5B4\uB7EC\uD32C\uD2B8 \uD2B8\uB85C\uD53C",
      "Hierophant's": "\uB300\uBCC0\uC778\uC758",
      "Highland Blade": "\uD558\uC774\uB79C\uB4DC \uBE14\uB808\uC774\uB4DC",
      "Highlord's Wrath": "\uB300\uAD70\uC8FC\uC758 \uC9C4\uB178",
      "Hit Blinds Target": "\uC801\uC911 \uC2DC \uB300\uC0C1 \uC2E4\uBA85",
      "Hit Causes Monster to Flee": "\uC801\uC911 \uC2DC \uAD34\uBB3C \uB3C4\uC8FC",
      Hold: "\uC6C0\uCF1C\uC960",
      Holy: "\uC131\uC2A4\uB7EC\uC6B4",
      "Holy auras, combat skills and the Blessed Hammer": "\uC2E0\uC131\uD55C \uC624\uB77C, \uC804\uD22C \uAE30\uC220, \uCD95\uBCF5\uBC1B\uC740 \uB9DD\uCE58",
      "Holy Bolt": "\uC2E0\uC131\uD55C \uBE5B\uC904\uAE30",
      "Holy Fire": "\uC2E0\uC131\uD55C \uBD88\uAF43",
      "Holy Freeze": "\uC2E0\uC131\uD55C \uBE59\uACB0",
      "Holy Shield": "\uC2E0\uC131\uD55C \uBC29\uD328",
      "Holy Shield at its height for good, +#% Chance to Block, smiting back; a holy blast every #s throws monsters back, # damage": "\uC2E0\uC131\uD55C \uBC29\uD328\uAC00 \uCD5C\uB300 \uC704\uB825\uC73C\uB85C \uC601\uAD6C \uC9C0\uC18D, \uB9C9\uAE30 \uD655\uB960 +{0}%, \uB9C9\uC73C\uBA74 \uBC18\uACA9; {1}\uCD08\uB9C8\uB2E4 \uC2E0\uC131\uD55C \uD3ED\uBC1C\uB85C \uAD34\uBB3C\uC744 \uBC00\uCCD0\uB0C4, {2} \uD53C\uD574",
      "Holy Shock": "\uC2E0\uC131\uD55C \uCDA9\uACA9",
      "Holy Water Sprinkler": "\uD640\uB9AC \uC6CC\uD130 \uC2A4\uD504\uB9C1\uD074\uB7EC",
      Homunculus: "\uD638\uBB38\uCFE8\uB8E8\uC2A4",
      Hood: "\uB450\uAC74",
      Horn: "\uBFD4",
      "Horned Helm": "\uD63C\uB4DC \uD5EC\uB984",
      Hotspur: "\uB2E4\uD608\uC9C8",
      "How much faster the hero runs": "\uC601\uC6C5\uC758 \uB2EC\uB9AC\uAE30 \uC18D\uB3C4 \uC99D\uAC00\uB7C9",
      Howl: "\uD3EC\uD6A8",
      Howling: "\uC6B8\uBD80\uC9D6\uB294",
      Howltusk: "\uC6B8\uBD80\uC9D6\uB294 \uC5C4\uB2C8",
      Humongous: "\uBB34\uC9C0\uB9C9\uC9C0",
      Hunger: "\uAD76\uC8FC\uB9BC",
      "hunt down their": "\uCD94\uC801\uD574 \uC544\uB798\uB85C \uADF8\uB4E4\uC758",
      "Hunter's Bow": "\uD5CC\uD130\uBCF4\uC6B0",
      "Hunter's Guise": "\uD5CC\uD130\uC2A4 \uAC00\uC774\uC988",
      "hunts down its": "\uCD94\uC801\uD574 \uADF8",
      Hurlbat: "\uD5D0\uBC30\uD2B8",
      Hurricane: "\uD5C8\uB9AC\uCF00\uC778",
      "Hurts every monster around you for # damage and stuns them for #s": "\uC8FC\uC704 \uBAA8\uB4E0 \uAD34\uBB3C\uC5D0\uAC8C {0} \uD53C\uD574, {1}\uCD08\uAC04 \uAE30\uC808",
      "Husoldal Evo": "\uD6C4\uC194\uB2EC \uC5D0\uBCF4",
      Hydra: "\uD788\uB4DC\uB77C",
      "Hydra Bow": "\uD788\uB4DC\uB77C \uBCF4\uC6B0",
      Hydraskull: "\uD788\uB4DC\uB77C\uC2A4\uCEEC",
      Hyperion: "\uD558\uC774\uD398\uB9AC\uC628",
      "Hyperion Javelin": "\uD558\uC774\uD398\uB9AC\uC628 \uC7AC\uBC8C\uB9B0",
      "Hyperion Spear": "\uD558\uC774\uD398\uB9AC\uC628 \uC2A4\uD53C\uC5B4",
      "I: inventory": "I: \uC778\uBCA4\uD1A0\uB9AC",
      Ice: "\uC5BC\uC74C",
      "Ice Arrow": "\uC5BC\uC74C \uD654\uC0B4",
      "Ice Blast": "\uC5BC\uC74C \uC791\uB82C",
      "Ice Bolt": "\uC5BC\uC74C\uC0B4",
      "Ice shards rain on the nearest pack for #s, # shards of # damage each, chilling what they hit": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC\uC5D0 {0}\uCD08\uAC04 \uC5BC\uC74C \uD30C\uD3B8\uC774 \uC3DF\uC544\uC9D0, \uD30C\uD3B8 {1}\uAC1C, \uAC01 {2} \uD53C\uD574, \uB9DE\uC740 \uC801\uC5D0\uAC8C \uC624\uD55C",
      Iceblink: "\uC5BC\uC74C\uBE5B",
      "Icehawk Riftwing": "\uC544\uC774\uC2A4\uD638\uD06C \uB9AC\uD504\uD2B8\uC719",
      "If worn: *": "\uCC29\uC6A9 \uC2DC: {0}",
      "If worn: **% damage a second": "\uCC29\uC6A9 \uC2DC: \uCD08\uB2F9 \uD53C\uD574 {0}{1}%",
      "Ignore Target's Defense": "\uB300\uC0C1\uC758 \uBC29\uC5B4\uB825 \uBB34\uC2DC",
      "Imbue it into a rare": "\uD76C\uADC0 \uC544\uC774\uD15C\uC5D0 \uB9C8\uBC95 \uBD80\uC5EC",
      "Immolation Arrow": "\uC810\uD654 \uD654\uC0B4",
      "Immune to Cold": "\uB0C9\uAE30 \uBA74\uC5ED",
      "Immune to Fire": "\uD654\uC5FC \uBA74\uC5ED",
      "Immune to Lightning": "\uBC88\uAC1C \uBA74\uC5ED",
      "Immune to Magic": "\uB9C8\uBC95 \uBA74\uC5ED",
      "Immune to Physical": "\uBB3C\uB9AC \uBA74\uC5ED",
      "Immune to Poison": "\uB3C5 \uBA74\uC5ED",
      Impale: "\uAFF0\uB6AB\uAE30",
      Impaler: "\uAD00\uD1B5\uC790",
      Import: "\uAC00\uC838\uC624\uAE30",
      "In Brave the hero and the world no longer vanish under a grey haze, and on older phones big sprites no longer draw as solid boxes": "Brave\uC5D0\uC11C \uC601\uC6C5\uACFC \uC138\uACC4\uAC00 \uB354 \uC774\uC0C1 \uD68C\uC0C9 \uC548\uAC1C \uC544\uB798\uB85C \uC0AC\uB77C\uC9C0\uC9C0 \uC54A\uC73C\uBA70, \uAD6C\uD615 \uD734\uB300\uD3F0\uC5D0\uC11C \uD070 \uC2A4\uD504\uB77C\uC774\uD2B8\uAC00 \uB354 \uC774\uC0C1 \uAF49 \uCC2C \uC0AC\uAC01\uD615\uC73C\uB85C \uADF8\uB824\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "Increase Maximum Mana": "\uCD5C\uB300 \uB9C8\uB098 \uC99D\uAC00",
      "Increased Attack Speed": "\uACF5\uACA9 \uC18D\uB3C4",
      "Increased Chance of Blocking": "\uB9C9\uAE30 \uD655\uB960 \uC99D\uAC00",
      "Increased Speed": "\uC18D\uB3C4 \uC99D\uAC00",
      "Increased Stack Size": "\uC911\uCCA9 \uC218\uB7C9 \uC99D\uAC00",
      "Increased Stamina": "\uC9C0\uAD6C\uB825 \uC99D\uAC00",
      "Infector of Souls": "\uC601\uD63C\uC758 \uC7A0\uC2DD\uC790",
      Inferno: "\uC9C0\uC625\uBD88",
      "Inner Sight": "\uB0B4\uBA74\uC758 \uC2DC\uC57C",
      Into: "\uC9C4\uD654",
      "Into *:": "{0}(\uC73C)\uB85C \uC9C4\uD654:",
      INVENTORY: "\uC778\uBCA4\uD1A0\uB9AC",
      "Inventory (I)": "\uC778\uBCA4\uD1A0\uB9AC (I)",
      Iron: "\uCCA0\uC758",
      "Iron Golem": "\uAC15\uCCA0 \uACE8\uB818",
      "Iron Maiden": "\uAC00\uC2DC \uBC15\uD78C \uCCA0\uAD00",
      "Iron Pelt": "\uBB34\uC1E0 \uD138\uAC00\uC8FD",
      "Iron Skin": "\uCCA0\uAC11 \uD53C\uBD80",
      Ironstone: "\uBB34\uC1E0\uB3CC",
      "Ismail Vilehand": "\uC774\uC2A4\uB9C8\uC77C \uBC14\uC77C\uD578\uB4DC",
      "it hits": "\uADF8\uAC83\uC744 \uC801\uC911",
      "it passes": "\uADF8\uAC83\uC744 \uD1B5\uACFC\uD574",
      "It takes you when the bar runs out": "\uAC8C\uC774\uC9C0\uAC00 \uB2E4 \uB5A8\uC5B4\uC9C0\uBA74 \uC790\uB3D9\uC73C\uB85C \uC774\uB3D9",
      "Item boxes show D2's own text again, without the damage comparison": "\uC544\uC774\uD15C \uC0C1\uC790\uAC00 \uD53C\uD574 \uBE44\uAD50 \uC5C6\uC774 \uB2E4\uC2DC D2 \uBCF8\uB798\uC758 \uBB38\uAD6C\uB97C \uBCF4\uC5EC \uC90D\uB2C8\uB2E4",
      Items: "\uC544\uC774\uD15C",
      "Its dose added to every weapon blow: its average goes to Attack Damage": "\uBAA8\uB4E0 \uBB34\uAE30 \uACF5\uACA9\uC5D0 \uB3C5\uC774 \uCD94\uAC00: \uADF8 \uD3C9\uADE0\uC774 \uACF5\uACA9 \uD53C\uD574\uC5D0 \uBC18\uC601",
      "Its hits come as monsters strike you": "\uAD34\uBB3C\uC5D0\uAC8C \uACF5\uACA9\uBC1B\uC744 \uB54C\uB9C8\uB2E4 \uD0C0\uACA9",
      Ivory: "\uC0C1\uC544\uC0C9",
      Izual: "\uC774\uC8FC\uC54C",
      Jab: "\uCC0C\uB974\uAE30",
      Jacinth: "\uC801\uD669\uC0C9",
      Jack: "\uC6C3\uC637",
      "Jack's": "\uC0AC\uB0B4\uC758",
      Jade: "\uBE44\uCDE8\uC0C9",
      "Jade Talon": "\uBE44\uCDE8 \uBC1C\uD1B1",
      Jagged: "\uD1B1\uB0A0\uC758",
      "Jagged Star": "\uC7AC\uAE30\uB4DC \uC2A4\uD0C0",
      "Jalal's Mane": "\uC798\uB784\uC758 \uAC08\uAE30",
      January: "1\uC6D4",
      "Jared's Stone": "\uC790\uB808\uB4DC \uC2A4\uD1A4",
      javelin: "\uD22C\uCC3D",
      "Javelin and Spear Skills": "\uD22C\uCC3D\uACFC \uCC3D \uAE30\uC220",
      "Jawbone Cap": "\uC870\uC6B0\uBCF8 \uCEA1",
      "Jawbone Visor": "\uC870\uC6B0\uBCF8 \uBC14\uC774\uC800",
      "Jester's": "\uC5B4\uB9BF\uAD11\uB300\uC758",
      "Jo Staff": "\uC870 \uC2A4\uD0DC\uD504",
      "Joker's": "\uC775\uC0B4\uAFBC\uC758",
      July: "7\uC6D4",
      June: "6\uC6D4",
      Katar: "\uCE74\uD0C0\uB974",
      "Keeper's": "\uC9C0\uD0B4\uC774\uC758",
      "Keeps level *": "\uB808\uBCA8 {0} \uC720\uC9C0",
      "Kenshi's": "\uAC80\uC0AC\uC758",
      kick: "\uBC1C\uCC28\uAE30",
      Kill: "\uC0B4\uD574",
      Killer: "\uC0B4\uD574\uC790",
      "Kinemil's Awl": "\uD0A4\uB124\uBC00\uC758 \uC1A1\uACF3",
      "King's": "\uC655\uC758",
      "Kira's Guardian": "\uD0A4\uB77C\uC758 \uC218\uD638\uC790",
      "Kite Shield": "\uCE74\uC774\uD2B8 \uC274\uB4DC",
      "Knave's": "\uC545\uD55C\uC758",
      Knell: "\uC870\uC885",
      "Knell Striker": "\uC885\uC744 \uC6B8\uB9AC\uB294 \uC790",
      "Knight's": "\uAE30\uC0AC\uC758",
      Knockback: "\uBC00\uCCD0\uB0B4\uAE30",
      Knot: "\uB9E4\uB4ED",
      Knout: "\uB098\uC6B0\uD2B8",
      Knuckle: "\uC190\uB9C8\uB514",
      "Korean speaks Diablo II: Resurrected's words, and much more of the game is in Korean": "\uD55C\uAD6D\uC5B4\uAC00 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uC6A9\uC5B4\uB97C \uC4F0\uACE0, \uD6E8\uC52C \uB354 \uB9CE\uC740 \uBD80\uBD84\uC774 \uBC88\uC5ED\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      "Korean translation": "\uD55C\uAD6D\uC5B4 \uBC88\uC5ED",
      "Korlic the Protector": "\uBCF4\uD638\uC790 \uCF5C\uB9AD",
      "Kraken Shell": "\uD06C\uB77C\uCF04 \uC258",
      "Kurast Bazaar": "\uCFE0\uB77C\uC2A4\uD2B8 \uC2DC\uC7A5",
      "Kurast Causeway": "\uCFE0\uB77C\uC2A4\uD2B8 \uB451\uAE38",
      "Kurast Shield": "\uCFE0\uB77C\uC2A4\uD2B8 \uC274\uB4DC",
      Lacerator: "\uC5F4\uC0C1\uC790",
      Lance: "\uB79C\uC2A4",
      "Lancer's": "\uCC3D\uAE30\uBCD1\uC758",
      "Langer Briser": "\uB791\uAC70 \uBE0C\uB9AC\uC800",
      LANGUAGE: "\uC5B8\uC5B4",
      "LANGUAGE: *": "\uC5B8\uC5B4: {0}",
      Lapis: "\uCCAD\uAE08\uC0C9",
      "Lapis Lazuli": "\uCCAD\uAE08\uC11D",
      "Large Axe": "\uB77C\uC9C0 \uC561\uC2A4",
      "Large Shield": "\uB77C\uC9C0 \uC274\uB4DC",
      Lash: "\uCC44\uCC0D",
      Latest: "\uCD5C\uC2E0",
      Leadcrow: "\uB0A9\uAE4C\uB9C8\uADC0",
      Leap: "\uB3C4\uC57D",
      "Leap Attack": "\uB3C4\uC57D \uACF5\uACA9",
      "Leap the way you run (at a pack when still); the landing knocks back, # damage": "\uB2EC\uB9AC\uB294 \uBC29\uD5A5\uC73C\uB85C \uB3C4\uC57D (\uBA48\uCDB0 \uC788\uC73C\uBA74 \uBB34\uB9AC\uB97C \uD5A5\uD574); \uCC29\uC9C0 \uC2DC \uBC00\uCCD0\uB0C4, {0} \uD53C\uD574",
      "Leap where you run (at a foe when still) and strike: # damage, # around": "\uB2EC\uB9AC\uB294 \uBC29\uD5A5\uC73C\uB85C(\uBA48\uCDC4\uC744 \uB550 \uC801\uC5D0\uAC8C) \uB3C4\uC57D\uD558\uC5EC \uAC15\uD0C0: {0} \uD53C\uD574, \uC8FC\uBCC0 {1}",
      "Leather Armor": "\uB808\uB354 \uC544\uBA38",
      "Leather Gloves": "\uB808\uB354 \uAE00\uB7EC\uBE0C",
      Leave: "\uB5A0\uB098\uAE30",
      "Leave a trail of fire behind you for #s, # damage per tick": "{0}\uCD08\uAC04 \uC9C0\uB098\uAC04 \uC790\uB9AC\uC5D0 \uBD88\uAE38\uC744 \uB0A8\uAE40, \uD2F1\uB2F9 {1} \uD53C\uD574",
      "Legend Spike": "\uB808\uC804\uB4DC \uC2A4\uD30C\uC774\uD06C",
      "Legend Sword": "\uB808\uC804\uB4DC \uC18C\uB4DC",
      "Legendary Mallet": "\uB808\uC804\uB354\uB9AC \uB9EC\uB9BF",
      "Less * damage taken*": "\uBC1B\uB294 {0} \uD53C\uD574 \uAC10\uC18C{1}",
      "Less # damage taken#": "\uBC1B\uB294 {0} \uD53C\uD574 \uAC10\uC18C{1}",
      "Less damage from every hit taken": "\uBC1B\uB294 \uBAA8\uB4E0 \uACF5\uACA9\uC758 \uD53C\uD574 \uAC10\uC18C",
      Level: "\uB808\uBCA8",
      "Level * * (*/* Charges)": "\uB808\uBCA8 {0} {1} ({2}/{3} \uCDA9\uC804)",
      "Level * * Aura When Equipped": "\uC7A5\uCC29 \uC2DC {0}\uB808\uBCA8 {1} \uC624\uB77C",
      "Level * now and * at level *": "\uC9C0\uAE08 \uB808\uBCA8 {0}, \uB808\uBCA8 {2}\uC5D0 {1}",
      "Level * to **": "\uB808\uBCA8 {0}\uC5D0\uC11C {1}{2}",
      "Level #": "\uB808\uBCA8 {0}",
      "Level # # Aura When Equipped": "\uC7A5\uCC29 \uC2DC {0}\uB808\uBCA8 {1} \uC624\uB77C \uD6A8\uACFC \uC801\uC6A9",
      "Level Up": "\uB808\uBCA8 \uC5C5",
      "Levels gear adds to every # #": "\uC7A5\uBE44\uC758 \uAE30\uC220 \uB808\uBCA8 \uBCF4\uB108\uC2A4\uAC00 \uBAA8\uB4E0 {0} {1}\uC5D0 \uC801\uC6A9",
      Leviathan: "\uAC70\uB300\uAD34\uC218",
      "Lich Wand": "\uB9AC\uCE58 \uC6D0\uB4DC",
      "Lidless Wall": "\uAC01\uC131\uC758 \uBCBD",
      Life: "\uC0DD\uBA85\uB825",
      "Life after each Demon Kill": "\uC545\uB9C8 \uCC98\uCE58 \uC2DC \uC0DD\uBA85\uB825",
      "Life after each Kill": "\uCC98\uCE58 \uC2DC \uC0DD\uBA85\uB825",
      "Life now, and its maximum": "\uD604\uC7AC \uC0DD\uBA85\uB825\uACFC \uCD5C\uB300 \uC0DD\uBA85\uB825",
      "Life regained every second": "\uB9E4\uCD08 \uD68C\uBCF5\uB418\uB294 \uC0DD\uBA85\uB825\uC785\uB2C8\uB2E4.",
      "Life stolen per hit": "\uC801\uC911\uB2F9 \uC0DD\uBA85\uB825 \uD6D4\uCE68",
      "Life Tap": "\uC0DD\uBA85\uB825 \uCD94\uCD9C",
      "Light Belt": "\uB77C\uC774\uD2B8 \uBCA8\uD2B8",
      "Light Crossbow": "\uB77C\uC774\uD2B8 \uD06C\uB85C\uC2A4\uBCF4\uC6B0",
      "Light Gauntlets": "\uB77C\uC774\uD2B8 \uAC74\uD2C0\uB9BF",
      "Light Plate": "\uB77C\uC774\uD2B8 \uD50C\uB808\uC774\uD2B8",
      "Light Plated Boots": "\uB77C\uC774\uD2B8 \uD50C\uB808\uC774\uD2B8 \uBD80\uCE20",
      Lightning: "\uBC88\uAC1C",
      "Lightning Absorb": "\uBC88\uAC1C \uD761\uC218",
      "Lightning Bolt": "\uBC88\uAC2F\uBD88",
      "Lightning Damage": "\uBC88\uAC1C \uD53C\uD574",
      "Lightning Enchanted": "\uBC88\uAC1C \uAC15\uD654",
      "Lightning Fury": "\uBC88\uAC1C\uC758 \uACA9\uB178",
      "Lightning keeps striking monsters around you, # damage": "\uC8FC\uBCC0 \uAD34\uBB3C\uC5D0\uAC8C \uBC88\uAC1C\uAC00 \uACC4\uC18D \uB0B4\uB9AC\uCE68, {0} \uD53C\uD574",
      "Lightning Mastery": "\uBC88\uAC1C \uC219\uB828",
      "Lightning Resist": "\uBC88\uAC1C \uC800\uD56D",
      "Lightning Resist *% per Level": "\uBC88\uAC1C \uC800\uD56D {0}% (\uB808\uBCA8\uB2F9)",
      "Lightning Resistance": "\uBC88\uAC1C \uC800\uD56D",
      "Lightning Sentry": "\uBC88\uAC1C \uD30C\uC218\uAE30",
      "Lightning Skill Damage": "\uBC88\uAC1C \uAE30\uC220 \uD53C\uD574",
      "Lightning Skills": "\uBC88\uAC1C \uAE30\uC220",
      "Lightning Spells": "\uBC88\uAC1C \uC8FC\uBB38",
      "Lightning Strike": "\uBC88\uAC1C\uC758 \uC77C\uACA9",
      "Lightning strikes the toughest monster nearby and one more, # damage; holy bolts burst, # each": "\uADFC\uCC98\uC758 \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uACFC \uD55C \uB9C8\uB9AC \uB354\uC5D0\uAC8C \uBC88\uAC1C, {0} \uD53C\uD574; \uC2E0\uC131\uD55C \uBE5B\uC904\uAE30\uAC00 \uD130\uC838 \uB098\uAC10, \uAC01 {1}",
      Lightsabre: "\uB77C\uC774\uD2B8\uC138\uC774\uBC84",
      "Lion Branded": "\uC0AC\uC790 \uB099\uC778",
      "Lion Helm": "\uB77C\uC774\uC628 \uD5EC\uB984",
      "Lister the Tormentor": "\uACE0\uBB38\uC790 \uB9AC\uC2A4\uD130",
      "Lizard's": "\uB3C4\uB9C8\uBC40\uC758",
      "Loading the *\u2026": "{0} \uBD88\uB7EC\uC624\uB294 \uC911\u2026",
      "Loading\u2026": "\uBD88\uB7EC\uC624\uB294 \uC911\u2026",
      "Lochaber Axe": "\uB85C\uCE74\uBC84 \uC561\uC2A4",
      Lock: "\uC790\uBB3C\uC1E0",
      "Long Bow": "\uB871\uBCF4\uC6B0",
      "Long Staff": "\uB871\uC2A4\uD0DC\uD504",
      "Long Sword": "\uB871\uC18C\uB4DC",
      "Long War Bow": "\uB871 \uC6CC \uBCF4\uC6B0",
      Loop: "\uD14C",
      "Lord De Seis": "\uAD70\uC8FC \uC0AC\uC774\uC2A4",
      "Lord of Destruction": "\uD30C\uAD34\uC758 \uAD70\uC8FC",
      "Lord's": "\uAD70\uC8FC\uC758",
      "Lost City": "\uC78A\uD78C \uB3C4\uC2DC",
      Loud: "\uC6B0\uB801\uCC2C",
      "Lower Kurast": "\uD558\uBD80 \uCFE0\uB77C\uC2A4\uD2B8",
      "Lower Resist": "\uC800\uD56D \uAC10\uC18C",
      Luna: "\uB8E8\uB098",
      Lust: "\uC695\uC815",
      "Lycander's Aim": "\uB77C\uC774\uCE78\uB354\uC758 \uC870\uC900",
      "Lycander's Flank": "\uB77C\uC774\uCE78\uB354\uC758 \uCE21\uBC29",
      Lycanthropy: "\uBCC0\uC2E0\uC220",
      Mace: "\uBA54\uC774\uC2A4",
      "Mace Mastery": "\uCCA0\uD1F4 \uC219\uB828",
      "Madawc the Guardian": "\uC218\uD638\uC790 \uB9C8\uB3C4\uD06C",
      Maelstrom: "\uC18C\uC6A9\uB3CC\uC774",
      "Maffer Dragonhand": "\uB9E4\uD37C \uB4DC\uB798\uACE4\uD578\uB4DC",
      "Mage Plate": "\uBA54\uC774\uC9C0 \uD50C\uB808\uC774\uD2B8",
      Magefist: "\uB9C8\uC218",
      "Magekiller's": "\uB9C8\uBC95\uC0AC \uC0B4\uD574\uC790\uC758",
      Maggot: "\uAD6C\uB354\uAE30",
      "Magic Arrow": "\uB9C8\uBC95 \uD654\uC0B4",
      "Magic Damage": "\uB9C8\uBC95 \uD53C\uD574",
      "Magic Damage Reduced by": "\uB9C8\uBC95 \uD53C\uD574 \uAC10\uC18C",
      Magic: "\uB9C8\uBC95",
      "Magic Find": "\uB9C8\uBC95 \uBC1C\uACAC",
      "Magic Resistant": "\uB9C8\uBC95 \uC800\uD56D",
      "Maiden Javelin": "\uBA54\uC774\uB4E0 \uC7AC\uBC8C\uB9B0",
      "Maiden Pike": "\uBA54\uC774\uB4E0 \uD30C\uC774\uD06C",
      "Maiden Spear": "\uBA54\uC774\uB4E0 \uC2A4\uD53C\uC5B4",
      "Maiden's": "\uC5EC\uC804\uC0AC\uC758",
      Maim: "\uBD88\uAD6C",
      "MAIN MENU": "\uBA54\uC778 \uBA54\uB274",
      "Main menu (Enter)": "\uBA54\uC778 \uBA54\uB274 (Enter)",
      "Main menu (Esc)": "\uBA54\uC778 \uBA54\uB274 (Esc)",
      "Making the code\u2026": "\uCF54\uB4DC \uC0DD\uC131 \uC911\u2026",
      Mallet: "\uB9DD\uCE58",
      Mana: "\uB9C8\uB098",
      "Mana from items, leech and kills speeds up casting:": "\uC544\uC774\uD15C, \uD6D4\uCE68, \uCC98\uCE58\uB85C \uC5BB\uB294 \uB9C8\uB098\uB294 \uC2DC\uC804 \uC18D\uB3C4\uB97C \uC62C\uB9BD\uB2C8\uB2E4:",
      "Mana Burn": "\uB9C8\uB098 \uC5F0\uC18C",
      "Mana stolen per hit": "\uC801\uC911\uB2F9 \uB9C8\uB098 \uD6D4\uCE68",
      "Manald Heal": "\uB9C8\uB0A0\uB4DC \uCE58\uC720 \uBC18\uC9C0",
      Mangler: "\uB09C\uB3C4\uC9C8",
      Mantle: "\uB9DD\uD1A0",
      "Mara's Kaleidoscope": "\uB9C8\uB77C\uC758 \uB9CC\uD654\uACBD",
      March: "3\uC6D4",
      Mark: "\uD45C\uC2DD",
      "Marshal's": "\uB300\uC6D0\uC218\uC758",
      "Martial Arts": "\uBB34\uC220",
      "Martial arts, traps and shadow disciplines": "\uBB34\uC220, \uD568\uC815, \uADF8\uB9BC\uC790 \uC218\uB828",
      Mask: "\uB9C8\uC2A4\uD06C",
      Massive: "\uC721\uC911\uD55C",
      "Master's": "\uB2EC\uC778\uC758",
      Masteries: "\uC219\uB828",
      "Matriarchal Bow": "\uBA54\uC774\uD2B8\uB9AC\uC5B4\uCEEC \uBCF4\uC6B0",
      "Matriarchal Javelin": "\uBA54\uC774\uD2B8\uB9AC\uC5B4\uCEEC \uC7AC\uBC8C\uB9B0",
      "Matriarchal Pike": "\uBA54\uC774\uD2B8\uB9AC\uC5B4\uCEEC \uD30C\uC774\uD06C",
      "Matriarchal Spear": "\uBA54\uC774\uD2B8\uB9AC\uC5B4\uCEEC \uC2A4\uD53C\uC5B4",
      Maul: "\uD6C4\uB824\uCE58\uAE30",
      "Maul as a werebear for #s; every #rd swing a stomp, # damage within # yards, stunning": "{0}\uCD08\uAC04 \uACF0\uC778\uAC04\uC73C\uB85C \uD6C4\uB824\uCE58\uAE30; {1}\uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uBC1C\uAD6C\uB974\uAE30, {3}\uC57C\uB4DC \uC548\uC5D0 {2} \uD53C\uD574\uC640 \uAE30\uC808",
      Mauler: "\uD30C\uAD34\uC790",
      Maw: "\uC544\uAC00\uB9AC",
      "max */*": "\uCD5C\uB300 {0}/{1}",
      Maxed: "\uCD5C\uB300",
      "Maximum Damage": "\uCD5C\uB300 \uD53C\uD574",
      "Maximum Stamina": "\uCD5C\uB300 \uC9C0\uAD6C\uB825",
      May: "5\uC6D4",
      Meditation: "\uBA85\uC0C1",
      "Medusa's Gaze": "\uBA54\uB450\uC0AC\uC758 \uB208\uAE38",
      "Mentalist's": "\uB3C5\uC2EC\uC220\uC0AC\uC758",
      Mephisto: "\uBA54\uD53C\uC2A4\uD1A0",
      Merciless: "\uC0AC\uC815\uC5C6\uB294",
      "Mesh Armor": "\uBA54\uC26C \uC544\uBA38",
      "Mesh Belt": "\uBA54\uC26C \uBCA8\uD2B8",
      "Mesh Boots": "\uBA54\uC26C \uBD80\uCE20",
      "Message Log": "\uBA54\uC2DC\uC9C0 \uAE30\uB85D",
      Metalgrid: "\uAE08\uC18D \uACA9\uC790",
      Meteor: "\uC6B4\uC11D \uB099\uD558",
      Meteoric: "\uC6B4\uC11D\uC758",
      "Meteors crash onto # monsters, # damage, and leave the ground burning": "\uAD34\uBB3C {0}\uB9C8\uB9AC\uC5D0\uAC8C \uC6B4\uC11D \uB099\uD558, {1} \uD53C\uD574, \uB545\uC744 \uBD88\uD0DC\uC6C0",
      Might: "\uC704\uC138",
      "Mighty Scepter": "\uB9C8\uC774\uD2F0 \uC149\uD130",
      "Military Axe": "\uBC00\uB9AC\uD130\uB9AC \uC561\uC2A4",
      Mind: "\uC815\uC2E0",
      "Mind Blast": "\uC815\uC2E0 \uD3ED\uBC1C",
      "Minimum Damage": "\uCD5C\uC18C \uD53C\uD574",
      Minion: "\uD558\uC218\uC778",
      "Minion Skull": "\uBBF8\uB2C8\uC5B8 \uC2A4\uCEEC",
      Miocene: "\uB9C8\uC774\uC624\uC138",
      "Mirrored Boots": "\uBBF8\uB7EC\uB4DC \uBD80\uCE20",
      "Missile Damage Reduced by *%": "\uD22C\uC0AC\uCCB4 \uD53C\uD574 {0}% \uAC10\uC18C",
      "Mithril Coil": "\uBBF8\uC2A4\uB9B4 \uCF54\uC77C",
      Mnemonic: "\uAE30\uC5B5\uB825\uC758",
      Mold: "\uACF0\uD321\uC774",
      "Molten Boulder": "\uD0C0\uC624\uB974\uB294 \uBC14\uC704",
      Monarch: "\uBAA8\uB108\uD06C",
      "Monastery Gate": "\uC218\uB3C4\uC6D0 \uC815\uBB38",
      "Monk's": "\uC218\uB3C4\uC0AC\uC758",
      monster: "\uAD34\uBB3C",
      "Monsters around you, bosses too, take #% more damage for #s": "\uC8FC\uC704 \uAD34\uBB3C(\uC6B0\uB450\uBA38\uB9AC \uD3EC\uD568)\uC774 {1}\uCD08\uAC04 \uBC1B\uB294 \uD53C\uD574 {0}% \uC99D\uAC00",
      "Monsters near her take #% more damage (it breaks no immunity)": "\uADF8\uB140 \uADFC\uCC98\uC758 \uAD34\uBB3C\uC774 \uBC1B\uB294 \uD53C\uD574 {0}% \uC99D\uAC00 (\uBA74\uC5ED\uC740 \uAE68\uC9C0 \uC54A\uC74C)",
      "Monsters resist each element by D2's numbers, and immunities break only as D2's do: Amplify Damage, Decrepify, Lower Resist and Conviction lower resistances, a fifth as much on an immune": "\uAD34\uBB3C\uC774 D2\uC758 \uC218\uCE58\uB300\uB85C \uAC01 \uC6D0\uC18C\uC5D0 \uC800\uD56D\uD558\uBA70, \uBA74\uC5ED\uC740 D2\uCC98\uB7FC\uB9CC \uAE68\uC9D1\uB2C8\uB2E4: \uD53C\uD574 \uC99D\uD3ED, \uB178\uD654, \uC800\uD56D \uAC10\uC18C, \uC120\uACE0\uAC00 \uC800\uD56D\uC744 \uB0AE\uCD94\uACE0, \uBA74\uC5ED\uC778 \uAD34\uBB3C\uC5D0\uAC8C\uB294 \uADF8 5\uBD84\uC758 1\uB9CC \uB0AE\uCDA5\uB2C8\uB2E4",
      "Monsters resist fire, cold, lightning and poison #% less, up to #% (a fifth of it if immune)": "\uAD34\uBB3C\uC758 \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB3C5 \uC800\uD56D {0}% \uAC10\uC18C, \uCD5C\uB300 {1}% (\uBA74\uC5ED\uC774\uBA74 \uADF8 5\uBD84\uC758 1)",
      "Monsters slain: #": "\uCC98\uCE58\uD55C \uAD34\uBB3C: {0}",
      "Monsters within # lose #% of their life (a third of that for elites)": "{0} \uC548\uC758 \uAD34\uBB3C\uC774 \uC0DD\uBA85\uB825 {1}%\uB97C \uC783\uC74C (\uC815\uC608\uB294 \uADF8 3\uBD84\uC758 1)",
      "Monsters' missiles fly #% slower": "\uAD34\uBB3C\uC758 \uD22C\uC0AC\uCCB4 \uC18D\uB3C4 {0}% \uAC10\uC18C",
      Moon: "\uB2EC",
      "More damage from every skill: gear's +% Damage and shrines": "\uBAA8\uB4E0 \uAE30\uC220\uC758 \uD53C\uD574 \uC99D\uAC00: \uC7A5\uBE44\uC758 +% \uD53C\uD574\uC640 \uC81C\uB2E8",
      "More damage from weapon skills (arrows, javelins, blows, throws): the weapon's damage, Dexterity, gear's +% Attack Damage": "\uBB34\uAE30 \uAE30\uC220(\uD654\uC0B4, \uD22C\uCC3D, \uD0C0\uACA9, \uD22C\uCC99)\uC758 \uD53C\uD574 \uC99D\uAC00: \uBB34\uAE30 \uD53C\uD574, \uBBFC\uCCA9, \uC7A5\uBE44\uC758 +% \uACF5\uACA9 \uD53C\uD574",
      "More gold from what monsters drop": "\uAD34\uBB3C\uB85C\uBD80\uD130 \uC5BB\uB294 \uACE8\uB4DC \uC99D\uAC00",
      "Morning Star": "\uBAA8\uB2DD\uC2A4\uD0C0",
      "Multiple Shot": "\uB2E4\uBC1C \uC0AC\uACA9",
      "Multiple Shots": "\uB2E4\uBC1C \uC0AC\uACA9",
      "Mummified Trophy": "\uBA38\uBBF8\uD30C\uC774\uB4DC \uD2B8\uB85C\uD53C",
      Music: "\uC74C\uC545",
      Mute: "\uC74C\uC18C\uAC70",
      "Myrmidon Greaves": "\uBB88\uB974\uBBF8\uB3C8 \uADF8\uB9AC\uBE0C",
      "Mythical Sword": "\uBBF8\uC2DC\uCEEC \uC18C\uB4DC",
      Naga: "\uB098\uAC00",
      Nagelring: "\uB098\uAC94\uB9C1 \uBC18\uC9C0",
      Nails: "\uBABB",
      "Natural Resistance": "\uD0C0\uACE0\uB09C \uC800\uD56D",
      "Nature's": "\uC790\uC5F0\uC758",
      "Nature's Peace": "\uC790\uC5F0\uC758 \uD3C9\uD654",
      "Nature's Peace's Oak Sage no longer grows your life without end: its life and Battle Orders' are each a share of your own, added together as in D2": "\uC790\uC5F0\uC758 \uD3C9\uD654\uC758 \uCC38\uB098\uBB34 \uD604\uC790\uAC00 \uB354 \uC774\uC0C1 \uC0DD\uBA85\uB825\uC744 \uB05D\uC5C6\uC774 \uB298\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: \uCC38\uB098\uBB34 \uD604\uC790\uC640 \uC804\uD22C \uC9C0\uC2DC\uC758 \uC0DD\uBA85\uB825\uC740 D2\uCC98\uB7FC \uAC01\uAC01 \uC790\uC2E0\uC758 \uC0DD\uBA85\uB825\uC5D0 \uB300\uD55C \uBE44\uC728\uB85C \uD569\uC0B0\uB429\uB2C8\uB2E4",
      "Near a crowd or boss, blind all around you #s: they take #% more damage (act bosses unblinded)": "\uBB34\uB9AC\uB098 \uC6B0\uB450\uBA38\uB9AC \uADFC\uCC98\uC5D0\uC11C \uC8FC\uC704 \uBAA8\uB450\uB97C {0}\uCD08\uAC04 \uC2E4\uBA85: \uBC1B\uB294 \uD53C\uD574 {1}% \uC99D\uAC00 (\uB9C9 \uC6B0\uB450\uBA38\uB9AC \uC81C\uC678)",
      Necklace: "\uBAA9\uAC78\uC774",
      Necromancer: "\uAC15\uB839\uC220\uC0AC",
      "Necromancer's": "\uAC15\uB839\uC220\uC0AC\uC758",
      Needle: "\uBC14\uB298",
      "New * */*": "\uC0C8 {0} {1}/{2}",
      "New passive": "\uC0C8 \uC9C0\uC18D \uD6A8\uACFC",
      "New passive #/#": "\uC0C8 \uC9C0\uC18D \uD6A8\uACFC {0}/{1}",
      "NEW RUN": "\uC0C8 \uC2E4\uD589",
      "New run (Enter)": "\uC0C8\uB85C\uC6B4 \uC2E4\uD589 (Enter)",
      "New skill": "\uC0C8\uB85C\uC6B4 \uAE30\uC220",
      "New skill #/#": "\uC0C8 \uAE30\uC220 {0}/{1}",
      "New Stats": "\uC0C8\uB85C\uC6B4 \uB2A5\uB825\uCE58",
      NEWS: "\uC0C8 \uC18C\uC2DD",
      DISCORD: "\uB514\uC2A4\uCF54\uB4DC",
      "Next * at character level *": "\uB2E4\uC74C {0}: \uCE90\uB9AD\uD130 \uB808\uBCA8 {1}",
      "NEXT HERO": "\uB2E4\uC74C \uC601\uC6C5",
      "next level": "\uB2E4\uC74C \uB808\uBCA8",
      "Next rank": "\uB2E4\uC74C \uB2E8\uACC4",
      "Next rank:": "\uB2E4\uC74C \uB2E8\uACC4:",
      Night: "\uBC24",
      NIGHTMARE: "\uC545\uBABD",
      "Nightmare and Hell experience gems look their worth, even to a hero far above the monsters": "\uC545\uBABD\uACFC \uC9C0\uC625\uC758 \uACBD\uD5D8\uCE58 \uBCF4\uC11D\uC774 \uC81C \uAC00\uCE58\uB300\uB85C \uBCF4\uC785\uB2C8\uB2E4. \uAD34\uBB3C\uBCF4\uB2E4 \uB808\uBCA8\uC774 \uD6E8\uC52C \uB192\uC740 \uC601\uC6C5\uC5D0\uAC8C\uB3C4",
      "Nightmare and Hell shorten your chills, freezes, Terror, Dim Vision, Confuse and Attract on monsters to a half and a quarter, as D2 does, and no longer the monsters' chills and curses on you": "\uC545\uBABD\uACFC \uC9C0\uC625\uC740 D2\uCC98\uB7FC \uAD34\uBB3C\uC5D0\uAC8C \uAC70\uB294 \uC624\uD55C, \uBE59\uACB0, \uACF5\uD3EC, \uC2DC\uC57C \uD750\uB9AC\uAE30, \uD63C\uB780, \uC720\uD639\uC744 2\uBD84\uC758 1\uACFC 4\uBD84\uC758 1\uB85C \uC904\uC774\uBA70, \uAD34\uBB3C\uC774 \uAC70\uB294 \uC624\uD55C\uACFC \uC800\uC8FC\uB294 \uB354 \uC774\uC0C1 \uC904\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      Nightsmoke: "\uBC24\uC5F0\uAE30",
      "Nightwing's Veil": "\uBC24\uB0A0\uAC1C\uC758 \uB108\uC6B8",
      Nihlathak: "\uB2C8\uD758\uB77C\uD0C1",
      "Nihlathak's Temple": "\uB2C8\uD758\uB77C\uD0C1\uC758 \uC0AC\uC6D0",
      "no best time": "\uCD5C\uACE0 \uAE30\uB85D \uC5C6\uC74C",
      "Each point past the class's is +#% fire, cold, lightning, poison and magic damage": "\uC9C1\uC5C5 \uAE30\uBCF8\uCE58\uB97C \uB118\uB294 \uD3EC\uC778\uD2B8\uB2F9 \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB3C5, \uB9C8\uBC95 \uD53C\uD574 +{0}%",
      "Speeds up casting: a quarter of a percent Faster Cast Rate a point": "\uC2DC\uC804 \uC18D\uB3C4 \uC99D\uAC00: \uD3EC\uC778\uD2B8\uB2F9 \uC2DC\uC804 \uC18D\uB3C4 0.25%",
      "Speeds up casting: Faster Cast Rate, as what fighting pours in": "\uC2DC\uC804 \uC18D\uB3C4 \uC99D\uAC00: \uC804\uD22C\uB85C \uC5BB\uB294 \uB9CC\uD07C \uC2DC\uC804 \uC18D\uB3C4\uB85C \uC801\uC6A9",
      "No one can use that": "\uC544\uBB34\uB3C4 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
      "No room for that with the # or in the stash": "{0}\uC5D0\uAC8C\uB3C4 \uBCF4\uAD00\uD568\uC5D0\uB3C4 \uC790\uB9AC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
      "No room to swap that": "\uBC14\uAFC0 \uACF5\uAC04\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      "No spells": "\uC8FC\uBB38 \uBD88\uAC00",
      Nock: "\uC2DC\uC704\uD648",
      Noose: "\uC62C\uAC00\uBBF8",
      NORMAL: "\uBCF4\uD1B5",
      "Nosferatu's Coil": "\uB178\uC2A4\uD398\uB77C\uD22C\uC758 \uACE0\uB9AC",
      "Not learned": "\uBC30\uC6B0\uC9C0 \uC54A\uC74C",
      "Nothing new since your last visit": "\uC9C0\uB09C \uBC29\uBB38 \uC774\uD6C4 \uC0C8\uB85C\uC6B4 \uC18C\uC2DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Nothing of yours needs repair": "\uC218\uB9AC\uD560 \uBB3C\uAC74\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Nothing sold to buy back": "\uB418\uC0B4 \uBB3C\uAC74\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      Nova: "\uBC88\uAC1C \uD30C\uC7A5",
      November: "11\uC6D4",
      "Now +*% damage": "\uD604\uC7AC \uD53C\uD574 +{0}%",
      Noxious: "\uC720\uB3C5\uD55C",
      Null: "\uACF5\uBC31\uC758",
      "Oak Sage": "\uCC38\uB098\uBB34 \uD604\uC790",
      Ocher: "\uD669\uD1A0\uC0C9",
      October: "10\uC6D4",
      "of Absorption": "\uD761\uC218\uC758",
      "of Acceleration": "\uAC00\uC18D\uC758",
      "of Accuracy": "\uC815\uD655\uC131\uC758",
      "of Alacrity": "\uB0A0\uB835\uD568\uC758",
      "of Amelioration": "\uC644\uD654\uC758",
      "of Anima": "\uC0DD\uAE30\uC758",
      "of Anthrax": "\uD0C4\uC800\uBCD1\uC758",
      "of Atlus": "\uC544\uD2C0\uB77C\uC2A4\uC758",
      "of Attraction": "\uC720\uD639\uC758",
      "of Balance": "\uADE0\uD615\uC758",
      "of Blight": "\uB9C8\uB984\uBCD1\uC758",
      "of Bliss": "\uC9C0\uBCF5\uC758",
      "of Blocking": "\uB9C9\uAE30\uC758",
      "of Brilliance": "\uBA85\uC11D\uD568\uC758",
      "of Burning": "\uC791\uC5F4\uC758",
      "of Butchery": "\uC0B4\uC721\uC758",
      "of Carnage": "\uB300\uD559\uC0B4\uC758",
      "of Chance": "\uAE30\uD68C\uC758",
      "of Craftsmanship": "\uC7A5\uC778 \uC815\uC2E0\uC758",
      "of Defiance": "\uBC18\uBC1C\uC758",
      "of Deflecting": "\uBE57\uACA8\uB0B4\uAE30\uC758",
      "of Dexterity": "\uBBFC\uCCA9\uC758",
      "of Energy": "\uC5D0\uB108\uC9C0\uC758",
      "of Enlightenment": "\uACC4\uBABD\uC758",
      "of Ennui": "\uAD8C\uD0DC\uC758",
      "of Envy": "\uC2DC\uC0D8\uC758",
      "of Evisceration": "\uB3C4\uCD95\uC758",
      "of Excellence": "\uD0C1\uC6D4\uD568\uC758",
      "of Fire": "\uBD88\uC758",
      "of Flame": "\uBD88\uAE38\uC758",
      "of Fortune": "\uD589\uC6B4\uC758",
      "of Frigidity": "\uB0C9\uB2F4\uC758",
      "of Frost": "\uC11C\uB9AC\uC758",
      "of Frost Shield": "\uC11C\uB9AC \uBC29\uD328\uC758",
      "of Gore": "\uC120\uD608\uC758",
      "of Grace": "\uC740\uCD1D\uC758",
      "of Grace and Power": "\uC740\uCD1D\uACFC \uD798\uC758",
      "of Greed": "\uD0D0\uC695\uC758",
      "of Guarding": "\uACBD\uACC4\uC758",
      "of Haste": "\uAC00\uC18D\uC758",
      "of Health": "\uAC74\uAC15\uC758",
      "of Hydra Shield": "\uD788\uB4DC\uB77C \uBC29\uD328\uC758",
      "of Icebolt": "\uC5BC\uC74C\uD654\uC0B4\uC758",
      "of Incineration": "\uC18C\uAC01\uC758",
      "of Joyfulness": "\uB099\uC758",
      "of Life": "\uC0DD\uBA85\uB825\uC758",
      "of Life Everlasting": "\uC601\uC6D0\uD55C \uC0DD\uBA85\uC758",
      "of Light": "\uBE5B\uC758",
      "of Lightning": "\uBC88\uAC1C\uC758",
      "of Luck": "\uC6B4\uC758",
      "of Maiming": "\uC0C1\uD574\uC758",
      "of Measure": "\uCC99\uB3C4\uC758",
      "of Memory": "\uAE30\uC5B5\uC758",
      "of Might": "\uC644\uB825\uC758",
      "of Negation": "\uBB34\uD6A8\uD654\uC758",
      "of Nirvana": "\uC5F4\uBC18\uC758",
      "of Nova": "\uBC88\uAC1C \uD30C\uC7A5\uC758",
      "of Nova Shield": "\uD68C\uC624\uB9AC \uBC29\uD328\uC758",
      "of Pacing": "\uBCF4\uD3ED\uC758",
      "of Passion": "\uC5F4\uC815\uC758",
      "of Perfection": "\uC644\uBCBD\uD568\uC758",
      "of Performance": "\uC131\uB2A5\uC758",
      "of Pestilence": "\uD574\uCDA9\uC758",
      "of Power": "\uC704\uB825\uC758",
      "of Precision": "\uC815\uBC00\uB3C4\uC758",
      "of Protection": "\uBCF4\uD638\uC758",
      "of Quality": "\uD488\uC9C8\uC758",
      "of Quickness": "\uAE30\uBBFC\uC758",
      "of Radiance": "\uAD11\uD718\uC758",
      "of Razors": "\uC11C\uC2AC\uC758",
      "of Readiness": "\uC900\uBE44\uC758",
      "of Regeneration": "\uC7AC\uC0DD\uC758",
      "of Regrowth": "\uC7AC\uC131\uC7A5\uC758",
      "of Remedy": "\uCE58\uB8CC\uC758",
      "of Revivification": "\uC18C\uC0DD\uC758",
      "of Shock": "\uCDA9\uACA9\uC758",
      "of Skill": "\uAE30\uC220\uC758",
      "of Slaughter": "\uB3C4\uC0B4\uC758",
      "of Slaying": "\uC0B4\uD574\uC758",
      "of Sorcery": "\uB9C8\uC220\uC758",
      "of Speed": "\uC18D\uB3C4\uC758",
      "of Spikes": "\uC410\uAE30\uC758",
      "of Stability": "\uC548\uC815\uC131\uC758",
      "of Storms": "\uD3ED\uD48D\uC758",
      "of Strength": "\uD798\uC758",
      "of Swiftness": "\uC2E0\uC18D\uD568\uC758",
      "of Swords": "\uAC80\uC758",
      "of Teleport Shield": "\uC21C\uAC04\uC774\uB3D9 \uBC29\uD328\uC758",
      "of the Apprentice": "\uACAC\uC2B5\uC0DD\uC758",
      "of the Bat": "\uBC15\uC950\uC758",
      "of the Cobra": "\uCF54\uBE0C\uB77C\uC758",
      "of the Colosuss": "\uAC70\uC0C1\uC758",
      "of the Efreeti": "\uC5D0\uD504\uB9AC\uD2F0\uC758",
      "of the Elements": "\uC6D0\uC18C\uC758",
      "of the Elephant": "\uCF54\uB07C\uB9AC\uC758",
      "of the Fox": "\uC5EC\uC6B0\uC758",
      "of the Giant": "\uAC70\uC778\uC758",
      "of the Glacier": "\uBE59\uD558\uC758",
      "of the Icicle": "\uACE0\uB4DC\uB984\uC758",
      "of the Jackal": "\uC790\uCE7C\uC758",
      "of the Kraken": "\uD06C\uB77C\uCF04\uC758",
      "of the Lamprey": "\uBE68\uD310\uAD6C\uB354\uAE30\uC758",
      "of the Leech": "\uAC70\uBA38\uB9AC\uC758",
      "of the Locust": "\uBA54\uB69C\uAE30 \uB5BC\uC758",
      "of the Magus": "\uB9C8\uB3C4\uC0AC\uC758",
      "of the Mammoth": "\uB9E4\uBA38\uB4DC\uC758",
      "of the Mind": "\uC815\uC2E0\uC758",
      "of the Ox": "\uD669\uC18C\uC758",
      "of the Phoenix": "\uBD88\uC0AC\uC870\uC758",
      "of the Sentinel": "\uBCF4\uCD08\uC758",
      "of the Squid": "\uC624\uC9D5\uC5B4\uC758",
      "of the Sun": "\uD0DC\uC591\uC758",
      "of the Tiger": "\uD638\uB791\uC774\uC758",
      "of the Titan": "\uAC70\uD55C\uC758",
      "of the Vampire": "\uD761\uD608\uADC0\uC758",
      "of the Whale": "\uACE0\uB798\uC758",
      "of the Wolf": "\uB291\uB300\uC758",
      "of the Wraith": "\uB9DD\uB839\uC758",
      "of the Yeti": "\uC124\uC778\uC758",
      "of Thorns": "\uAC00\uC2DC\uC758",
      "of Thunder": "\uCC9C\uB465\uC758",
      "of Transcendence": "\uCD08\uC6D4\uC758",
      "of Traveling": "\uC5EC\uD589\uC758",
      "of Venom": "\uB9F9\uB3C5\uC758",
      "of Warding": "\uBC29\uD638\uC758",
      "of Wealth": "\uBD80\uC758",
      "of Winter": "\uACA8\uC6B8\uC758",
      "of Wizardry": "\uB9C8\uBC95\uC758",
      "of Worth": "\uAC00\uCE58\uC758",
      "of Wrath": "\uC9C4\uB178\uC758",
      OFF: "\uAEBC\uC9D0",
      "Offensive Auras": "\uACF5\uACA9 \uC624\uB77C",
      "Ogre Axe": "\uC624\uC6B0\uAC70 \uC561\uC2A4",
      "Ogre Gauntlets": "\uC624\uC6B0\uAC70 \uAC74\uD2C0\uB9BF",
      OK: "\uD655\uC778",
      Oligocene: "\uC62C\uB9AC\uACE0\uC138",
      ON: "\uCF1C\uC9D0",
      "On a Mac": "Mac\uC5D0\uC11C",
      "on attack": "\uACF5\uACA9 \uC2DC",
      "on Hell": "\uC9C0\uC625",
      "on Nightmare": "\uC545\uBABD",
      "on striking": "(\uACF5\uACA9\uC774 \uBA85\uC911\uD55C \uACBD\uC6B0)",
      "Once a hero kills Baal, the menu starts her Nightmare (or Hell) as that hero, at her level, with her build and gear, as in D2": "\uC601\uC6C5\uC774 \uBC14\uC54C\uC744 \uCC98\uCE58\uD558\uBA74, \uBA54\uB274\uC5D0\uC11C \uC2DC\uC791\uD558\uB294 \uC545\uBABD(\uB610\uB294 \uC9C0\uC625)\uC740 D2\uCC98\uB7FC \uADF8 \uC601\uC6C5\uC73C\uB85C \uC2DC\uC791\uD569\uB2C8\uB2E4. \uADF8 \uB808\uBCA8\uACFC \uBE4C\uB4DC, \uC7A5\uBE44 \uADF8\uB300\uB85C\uC785\uB2C8\uB2E4",
      "One hit": "1\uD68C \uD0C0\uACA9",
      "One more level-up banish per run, per rank": "\uB2E8\uACC4\uB9C8\uB2E4 \uAC8C\uC784\uB2F9 \uB808\uBCA8 \uC5C5 \uC81C\uC678 1\uD68C \uCD94\uAC00",
      "One more level-up reroll per run, per rank": "\uB2E8\uACC4\uB9C8\uB2E4 \uAC8C\uC784\uB2F9 \uB808\uBCA8 \uC5C5 \uB9AC\uB864 1\uD68C \uCD94\uAC00",
      "One more level-up skip per run, per rank": "\uB2E8\uACC4\uB9C8\uB2E4 \uAC8C\uC784\uB2F9 \uB808\uBCA8 \uC5C5 \uC2A4\uD0B5 1\uD68C \uCD94\uAC00",
      "One-Hand Damage:": "\uD55C\uC190 \uD53C\uD574:",
      "One-Hand Damage: * to *": "\uD55C\uC190 \uD53C\uD574: {0} - {1}",
      "Only the * can use that*": "{0}\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4{1}",
      "Only the # can use that#": "{0}\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4{1}",
      Ooze: "\uC9C4\uBB3C",
      "Open Mini Panel": "\uBBF8\uB2C8 \uD328\uB110 \uC5F4\uAE30",
      "Open the .dmg and drag D2 Survivors into Applications. It keeps itself up to date.": ".dmg\uB97C \uC5F4\uACE0 D2 Survivors\uB97C \uC751\uC6A9 \uD504\uB85C\uADF8\uB7A8 \uD3F4\uB354\uB85C \uB04C\uC5B4 \uB193\uC73C\uC2ED\uC2DC\uC624. \uC5C5\uB370\uC774\uD2B8\uB294 \uC790\uB3D9\uC73C\uB85C \uC774\uB8E8\uC5B4\uC9D1\uB2C8\uB2E4.",
      "Open Wounds": "\uC0C1\uCC98 \uC545\uD654",
      Options: "\uC124\uC815",
      or: "\uB610\uB294",
      Orb: "\uBCF4\uC8FC",
      "Ormus' Robes": "\uC624\uB974\uBB34\uC2A4\uC758 \uC7A5\uD3EC",
      "Outer Steppes": "\uD3C9\uC6D0 \uC678\uACFD",
      "Overseer Skull": "\uC624\uBC84\uC2DC\uC5B4 \uC2A4\uCEEC",
      Pain: "\uACE0\uD1B5",
      "Pain Aegis": "\uACE0\uD1B5 \uBC29\uD328",
      "Pain Badge": "\uACE0\uD1B5 \uD718\uC7A5",
      "Pain Band": "\uACE0\uD1B5 \uBC18\uC9C0",
      "Pain Barb": "\uACE0\uD1B5 \uBBF8\uB298",
      "Pain Beads": "\uACE0\uD1B5 \uAD6C\uC2AC",
      "Pain Bite": "\uACE0\uD1B5 \uC774\uBE68",
      "Pain Blazer": "\uACE0\uD1B5 \uAC1C\uCC99\uC790",
      "Pain Bludgeon": "\uACE0\uD1B5 \uACE4\uBD09",
      "Pain Bolt": "\uACE0\uD1B5 \uD654\uC0B4",
      "Pain Branch": "\uACE0\uD1B5 \uAC00\uC9C0",
      "Pain Brow": "\uACE0\uD1B5 \uC774\uB9C8",
      "Pain Buckle": "\uACE0\uD1B5 \uBC84\uD074",
      "Pain Call": "\uACE0\uD1B5 \uBD80\uB984",
      "Pain Carapace": "\uACE0\uD1B5 \uAC11\uAC01",
      "Pain Casque": "\uACE0\uD1B5 \uD22C\uAD6C",
      "Pain Chant": "\uACE0\uD1B5 \uCC2C\uAC00",
      "Pain Clasp": "\uACE0\uD1B5 \uAC78\uC1E0",
      "Pain Claw": "\uACE0\uD1B5 \uBC1C\uD1B1",
      "Pain Cleaver": "\uACE0\uD1B5 \uAC00\uB984\uB0A0",
      "Pain Clutches": "\uACE0\uD1B5 \uB9C8\uC218",
      "Pain Coat": "\uACE0\uD1B5 \uC678\uD22C",
      "Pain Coil": "\uACE0\uD1B5 \uACE0\uB9AC",
      "Pain Collar": "\uACE0\uD1B5 \uBAA9\uD14C",
      "Pain Cord": "\uACE0\uD1B5 \uB048",
      "Pain Cowl": "\uACE0\uD1B5 \uC218\uB3C4\uB450\uAC74",
      "Pain Crack": "\uACE0\uD1B5 \uADE0\uC5F4",
      "Pain Crest": "\uACE0\uD1B5 \uBB38\uC7A5",
      "Pain Crusher": "\uACE0\uD1B5 \uBD84\uC1C4\uAE30",
      "Pain Cry": "\uACE0\uD1B5 \uC6B8\uC74C",
      "Pain Dart": "\uACE0\uD1B5 \uD22C\uCC3D",
      "Pain Edge": "\uACE0\uD1B5 \uCE7C\uB0A0",
      "Pain Emblem": "\uACE0\uD1B5 \uC0C1\uC9D5",
      "Pain Eye": "\uACE0\uD1B5 \uB208",
      "Pain Fang": "\uACE0\uD1B5 \uC1A1\uACF3\uB2C8",
      "Pain Finger": "\uACE0\uD1B5 \uC190\uAC00\uB77D",
      "Pain Fist": "\uACE0\uD1B5 \uC8FC\uBA39",
      "Pain Fletch": "\uACE0\uD1B5 \uD654\uC0B4\uAE43",
      "Pain Flight": "\uACE0\uD1B5 \uBE44\uD589",
      "Pain Glare": "\uACE0\uD1B5 \uC12C\uAD11",
      "Pain Gnarl": "\uACE0\uD1B5 \uC639\uC774",
      "Pain Goad": "\uACE0\uD1B5 \uBAB0\uC774\uB9C9\uB300",
      "Pain Gorget": "\uACE0\uD1B5 \uBAA9\uAC00\uB9AC\uAC1C",
      "Pain Grip": "\uACE0\uD1B5 \uC190\uC544\uADC0",
      "Pain Guard": "\uACE0\uD1B5 \uC218\uD638",
      "Pain Gutter": "\uACE0\uD1B5 \uC808\uAC1C",
      "Pain Gyre": "\uACE0\uD1B5 \uC18C\uC6A9\uB3CC\uC774",
      "Pain Hand": "\uACE0\uD1B5 \uC190",
      "Pain Heart": "\uACE0\uD1B5 \uC2EC\uC7A5",
      "Pain Hew": "\uACE0\uD1B5 \uCC0D\uAE30",
      "Pain Hide": "\uACE0\uD1B5 \uAC00\uC8FD",
      "Pain Hold": "\uACE0\uD1B5 \uC6C0\uCF1C\uC960",
      "Pain Hood": "\uACE0\uD1B5 \uB450\uAC74",
      "Pain Horn": "\uACE0\uD1B5 \uBFD4",
      "Pain Impaler": "\uACE0\uD1B5 \uAD00\uD1B5\uC790",
      "Pain Jack": "\uACE0\uD1B5 \uC6C3\uC637",
      "Pain Knell": "\uACE0\uD1B5 \uC870\uC885",
      "Pain Knot": "\uACE0\uD1B5 \uB9E4\uB4ED",
      "Pain Knuckle": "\uACE0\uD1B5 \uC190\uB9C8\uB514",
      "Pain Lance": "\uACE0\uD1B5 \uCC3D",
      "Pain Lash": "\uACE0\uD1B5 \uCC44\uCC0D",
      "Pain Lock": "\uACE0\uD1B5 \uC790\uBB3C\uC1E0",
      "Pain Loop": "\uACE0\uD1B5 \uD14C",
      "Pain Mallet": "\uACE0\uD1B5 \uB9DD\uCE58",
      "Pain Mangler": "\uACE0\uD1B5 \uB09C\uB3C4\uC9C8",
      "Pain Mantle": "\uACE0\uD1B5 \uB9DD\uD1A0",
      "Pain Mark": "\uACE0\uD1B5 \uD45C\uC2DD",
      "Pain Mask": "\uACE0\uD1B5 \uAC00\uBA74",
      "Pain Mauler": "\uACE0\uD1B5 \uD30C\uAD34\uC790",
      "Pain Nails": "\uACE0\uD1B5 \uBABB",
      "Pain Necklace": "\uACE0\uD1B5 \uBAA9\uAC78\uC774",
      "Pain Needle": "\uACE0\uD1B5 \uBC14\uB298",
      "Pain Nock": "\uACE0\uD1B5 \uC2DC\uC704\uD648",
      "Pain Noose": "\uACE0\uD1B5 \uC62C\uAC00\uBBF8",
      "Pain Orb": "\uACE0\uD1B5 \uBCF4\uC8FC",
      "Pain Pelt": "\uACE0\uD1B5 \uBAA8\uD53C",
      "Pain Prod": "\uACE0\uD1B5 \uCC0C\uB974\uAE30",
      "Pain Quarrel": "\uACE0\uD1B5 \uC1E0\uB1CC\uC0B4",
      "Pain Quill": "\uACE0\uD1B5 \uAE43",
      "Pain Razor": "\uACE0\uD1B5 \uBA74\uB3C4\uB0A0",
      "Pain Rend": "\uACE0\uD1B5 \uCC22\uAE40",
      "Pain Road": "\uACE0\uD1B5 \uAE38",
      "Pain Saw": "\uACE0\uD1B5 \uD1B1",
      "Pain Scalpel": "\uACE0\uD1B5 \uD574\uBD80\uCE7C",
      "Pain Scarab": "\uACE0\uD1B5 \uD48D\uB385\uC774",
      "Pain Scourge": "\uACE0\uD1B5 \uC7AC\uC559",
      "Pain Scratch": "\uACE0\uD1B5 \uD560\uD034\uAE30",
      "Pain Scythe": "\uACE0\uD1B5 \uB0AB",
      "Pain Shard": "\uACE0\uD1B5 \uD30C\uD3B8",
      "Pain Shroud": "\uACE0\uD1B5 \uC218\uC758",
      "Pain Slippers": "\uACE0\uD1B5 \uB367\uC2E0",
      "Pain Smasher": "\uACE0\uD1B5 \uBD84\uC1C4\uC790",
      "Pain Song": "\uACE0\uD1B5 \uB178\uB798",
      "Pain Spell": "\uACE0\uD1B5 \uC8FC\uBB38",
      "Pain Sphere": "\uACE0\uD1B5 \uAD6C\uCCB4",
      "Pain Spike": "\uACE0\uD1B5 \uAC00\uC2DC",
      "Pain Spiral": "\uACE0\uD1B5 \uB098\uC120",
      "Pain Spire": "\uACE0\uD1B5 \uCCA8\uD0D1",
      "Pain Splitter": "\uACE0\uD1B5 \uCABC\uAC1C\uB294\uC790",
      "Pain Spur": "\uACE0\uD1B5 \uBC15\uCC28",
      "Pain Stake": "\uACE0\uD1B5 \uB9D0\uB69D",
      "Pain Stalk": "\uACE0\uD1B5 \uCD94\uC801",
      "Pain Star": "\uACE0\uD1B5 \uBCC4",
      "Pain Stinger": "\uACE0\uD1B5 \uB3C5\uCE68",
      "Pain Strap": "\uACE0\uD1B5 \uB760",
      "Pain Suit": "\uACE0\uD1B5 \uAC11\uC637",
      "Pain Sunder": "\uACE0\uD1B5 \uC808\uB2E8",
      "Pain Talisman": "\uACE0\uD1B5 \uBD80\uC801",
      "Pain Thirst": "\uACE0\uD1B5 \uAC08\uC99D",
      "Pain Torc": "\uACE0\uD1B5 \uBAA9\uACE0\uB9AC",
      "Pain Tower": "\uACE0\uD1B5 \uD0D1",
      "Pain Track": "\uACE0\uD1B5 \uBC1C\uC790\uAD6D",
      "Pain Trample": "\uACE0\uD1B5 \uC9D3\uBC1F\uAE30",
      "Pain Turn": "\uACE0\uD1B5 \uD68C\uC804",
      "Pain Veil": "\uACE0\uD1B5 \uC7A5\uB9C9",
      "Pain Visage": "\uACE0\uD1B5 \uC5BC\uAD74",
      "Pain Ward": "\uACE0\uD1B5 \uBCF4\uD638",
      "Pain Weaver": "\uACE0\uD1B5 \uC9C1\uC870\uC790",
      "Pain Wing": "\uACE0\uD1B5 \uB0A0\uAC1C",
      "Pain Wrack": "\uACE0\uD1B5 \uACE0\uBB38",
      Paladin: "\uC131\uAE30\uC0AC",
      Paleocene: "\uD314\uB808\uC624\uC138",
      Paradox: "\uBAA8\uC21C\uC758",
      "Party Screen": "\uD30C\uD2F0 \uD654\uBA74",
      Passion: "\uC5F4\uC815",
      passive: "\uC9C0\uC18D \uD6A8\uACFC",
      "Passive and Magic Skills": "\uC9C0\uC18D \uD6A8\uACFC \uBC0F \uB9C8\uBC95 \uAE30\uC220",
      Passives: "\uC9C0\uC18D \uD6A8\uACFC",
      "Passives */*": "\uC9C0\uC18D \uD6A8\uACFC {0}/{1}",
      "Past rank *": "{0}\uB2E8\uACC4 \uCD08\uACFC",
      "Past rank *:": "{0}\uB2E8\uACC4 \uCD08\uACFC:",
      "Paste a save code first.": "\uBA3C\uC800 \uC800\uC7A5 \uCF54\uB4DC\uB97C \uBD99\uC5EC \uB123\uC73C\uC2ED\uC2DC\uC624.",
      "Paste a save code here": "\uC5EC\uAE30\uC5D0 \uC800\uC7A5 \uCF54\uB4DC\uB97C \uBD99\uC5EC \uB123\uC73C\uC2ED\uC2DC\uC624",
      Pause: "\uC77C\uC2DC\uC815\uC9C0",
      Paused: "\uC77C\uC2DC\uC815\uC9C0",
      Pavise: "\uD30C\uBE44\uC2A4",
      peck: "\uCABC\uC544",
      pecks: "\uCABC\uC544",
      "Pellet Bow": "\uD330\uB9AC\uD2B8 \uBCF4\uC6B0",
      Pelt: "\uBAA8\uD53C",
      "Pelta Lunata": "\uD3A0\uD0C0 \uB8E8\uB098\uD0C0",
      Penetrate: "\uAC04\uD30C",
      "Per second: #": "\uCD08\uB2F9: {0}",
      Pestilent: "\uC9C8\uBCD1\uC758",
      "Petrified Wand": "\uD398\uD2B8\uB9AC\uD30C\uC774\uB4DC \uC6D0\uB4DC",
      "Phase Blade": "\uD398\uC774\uC988 \uBE14\uB808\uC774\uB4DC",
      "Phoenix Strike": "\uBD88\uC0AC\uC870 \uC77C\uACA9",
      "Physical hits heal you by a share of their damage, less from monsters D2 drains less": "\uBB3C\uB9AC \uACF5\uACA9 \uC2DC \uD53C\uD574 \uC77C\uBD80\uB9CC\uD07C \uC0DD\uBA85\uB825 \uD68C\uBCF5, D2\uC5D0\uC11C \uB35C \uD761\uC218\uB418\uB294 \uAD34\uBB3C\uC5D0\uAC90 \uC801\uAC8C",
      "Pick a card to banish it for this run": "\uC774\uBC88 \uAC8C\uC784\uC5D0\uC11C \uC81C\uC678\uD560 \uCE74\uB4DC\uB97C \uACE0\uB974\uC2ED\uC2DC\uC624",
      "Pick things up from #% farther away": "{0}% \uB354 \uBA3C \uACF3\uC758 \uBB3C\uAC74\uB3C4 \uC8FC\uC6C0",
      "Pick with 1\u20133 or click": "1\u20133 \uD0A4\uB098 \uD074\uB9AD\uC73C\uB85C \uC120\uD0DD",
      Pierce: "\uAD00\uD1B5",
      pierces: "\uAD00\uD1B5\uD574",
      "Piercing Attack": "\uAD00\uD1B5 \uACF5\uACA9",
      Pike: "\uD30C\uC774\uD06C",
      Pilum: "\uD544\uB7FC",
      Pindleskin: "\uD540\uB4E4\uC2A4\uD0A8",
      Pit: "\uAD6C\uB369\uC774",
      Plague: "\uC5ED\uBCD1",
      "Plague Aegis": "\uC5ED\uBCD1 \uBC29\uD328",
      "Plague Badge": "\uC5ED\uBCD1 \uD718\uC7A5",
      "Plague Band": "\uC5ED\uBCD1 \uBC18\uC9C0",
      "Plague Barb": "\uC5ED\uBCD1 \uBBF8\uB298",
      "Plague Beads": "\uC5ED\uBCD1 \uAD6C\uC2AC",
      "Plague Bite": "\uC5ED\uBCD1 \uC774\uBE68",
      "Plague Blazer": "\uC5ED\uBCD1 \uAC1C\uCC99\uC790",
      "Plague Bludgeon": "\uC5ED\uBCD1 \uACE4\uBD09",
      "Plague Bolt": "\uC5ED\uBCD1 \uD654\uC0B4",
      "Plague Branch": "\uC5ED\uBCD1 \uAC00\uC9C0",
      "Plague Brow": "\uC5ED\uBCD1 \uC774\uB9C8",
      "Plague Buckle": "\uC5ED\uBCD1 \uBC84\uD074",
      "Plague Call": "\uC5ED\uBCD1 \uBD80\uB984",
      "Plague Carapace": "\uC5ED\uBCD1 \uAC11\uAC01",
      "Plague Casque": "\uC5ED\uBCD1 \uD22C\uAD6C",
      "Plague Chant": "\uC5ED\uBCD1 \uCC2C\uAC00",
      "Plague Clasp": "\uC5ED\uBCD1 \uAC78\uC1E0",
      "Plague Claw": "\uC5ED\uBCD1 \uBC1C\uD1B1",
      "Plague Cleaver": "\uC5ED\uBCD1 \uAC00\uB984\uB0A0",
      "Plague Clutches": "\uC5ED\uBCD1 \uB9C8\uC218",
      "Plague Coat": "\uC5ED\uBCD1 \uC678\uD22C",
      "Plague Coil": "\uC5ED\uBCD1 \uACE0\uB9AC",
      "Plague Collar": "\uC5ED\uBCD1 \uBAA9\uD14C",
      "Plague Cord": "\uC5ED\uBCD1 \uB048",
      "Plague Cowl": "\uC5ED\uBCD1 \uC218\uB3C4\uB450\uAC74",
      "Plague Crack": "\uC5ED\uBCD1 \uADE0\uC5F4",
      "Plague Crest": "\uC5ED\uBCD1 \uBB38\uC7A5",
      "Plague Crusher": "\uC5ED\uBCD1 \uBD84\uC1C4\uAE30",
      "Plague Cry": "\uC5ED\uBCD1 \uC6B8\uC74C",
      "Plague Dart": "\uC5ED\uBCD1 \uD22C\uCC3D",
      "Plague Edge": "\uC5ED\uBCD1 \uCE7C\uB0A0",
      "Plague Emblem": "\uC5ED\uBCD1 \uC0C1\uC9D5",
      "Plague Eye": "\uC5ED\uBCD1 \uB208",
      "Plague Fang": "\uC5ED\uBCD1 \uC1A1\uACF3\uB2C8",
      "Plague Finger": "\uC5ED\uBCD1 \uC190\uAC00\uB77D",
      "Plague Fist": "\uC5ED\uBCD1 \uC8FC\uBA39",
      "Plague Fletch": "\uC5ED\uBCD1 \uD654\uC0B4\uAE43",
      "Plague Flight": "\uC5ED\uBCD1 \uBE44\uD589",
      "Plague Glare": "\uC5ED\uBCD1 \uC12C\uAD11",
      "Plague Gnarl": "\uC5ED\uBCD1 \uC639\uC774",
      "Plague Goad": "\uC5ED\uBCD1 \uBAB0\uC774\uB9C9\uB300",
      "Plague Gorget": "\uC5ED\uBCD1 \uBAA9\uAC00\uB9AC\uAC1C",
      "Plague Grip": "\uC5ED\uBCD1 \uC190\uC544\uADC0",
      "Plague Guard": "\uC5ED\uBCD1 \uC218\uD638",
      "Plague Gutter": "\uC5ED\uBCD1 \uC808\uAC1C",
      "Plague Gyre": "\uC5ED\uBCD1 \uC18C\uC6A9\uB3CC\uC774",
      "Plague Hand": "\uC5ED\uBCD1 \uC190",
      "Plague Heart": "\uC5ED\uBCD1 \uC2EC\uC7A5",
      "Plague Hew": "\uC5ED\uBCD1 \uCC0D\uAE30",
      "Plague Hide": "\uC5ED\uBCD1 \uAC00\uC8FD",
      "Plague Hold": "\uC5ED\uBCD1 \uC6C0\uCF1C\uC960",
      "Plague Hood": "\uC5ED\uBCD1 \uB450\uAC74",
      "Plague Horn": "\uC5ED\uBCD1 \uBFD4",
      "Plague Impaler": "\uC5ED\uBCD1 \uAD00\uD1B5\uC790",
      "Plague Jack": "\uC5ED\uBCD1 \uC6C3\uC637",
      "Plague Javelin": "\uC5ED\uBCD1 \uD22C\uCC3D",
      "Plague Knell": "\uC5ED\uBCD1 \uC870\uC885",
      "Plague Knot": "\uC5ED\uBCD1 \uB9E4\uB4ED",
      "Plague Knuckle": "\uC5ED\uBCD1 \uC190\uB9C8\uB514",
      "Plague Lance": "\uC5ED\uBCD1 \uCC3D",
      "Plague Lash": "\uC5ED\uBCD1 \uCC44\uCC0D",
      "Plague Lock": "\uC5ED\uBCD1 \uC790\uBB3C\uC1E0",
      "Plague Loop": "\uC5ED\uBCD1 \uD14C",
      "Plague Mallet": "\uC5ED\uBCD1 \uB9DD\uCE58",
      "Plague Mangler": "\uC5ED\uBCD1 \uB09C\uB3C4\uC9C8",
      "Plague Mantle": "\uC5ED\uBCD1 \uB9DD\uD1A0",
      "Plague Mark": "\uC5ED\uBCD1 \uD45C\uC2DD",
      "Plague Mask": "\uC5ED\uBCD1 \uAC00\uBA74",
      "Plague Mauler": "\uC5ED\uBCD1 \uD30C\uAD34\uC790",
      "Plague Nails": "\uC5ED\uBCD1 \uBABB",
      "Plague Necklace": "\uC5ED\uBCD1 \uBAA9\uAC78\uC774",
      "Plague Needle": "\uC5ED\uBCD1 \uBC14\uB298",
      "Plague Nock": "\uC5ED\uBCD1 \uC2DC\uC704\uD648",
      "Plague Noose": "\uC5ED\uBCD1 \uC62C\uAC00\uBBF8",
      "Plague Orb": "\uC5ED\uBCD1 \uBCF4\uC8FC",
      "Plague Pelt": "\uC5ED\uBCD1 \uBAA8\uD53C",
      "Plague Prod": "\uC5ED\uBCD1 \uCC0C\uB974\uAE30",
      "Plague Quarrel": "\uC5ED\uBCD1 \uC1E0\uB1CC\uC0B4",
      "Plague Quill": "\uC5ED\uBCD1 \uAE43",
      "Plague Razor": "\uC5ED\uBCD1 \uBA74\uB3C4\uB0A0",
      "Plague Rend": "\uC5ED\uBCD1 \uCC22\uAE40",
      "Plague Road": "\uC5ED\uBCD1 \uAE38",
      "Plague Saw": "\uC5ED\uBCD1 \uD1B1",
      "Plague Scalpel": "\uC5ED\uBCD1 \uD574\uBD80\uCE7C",
      "Plague Scarab": "\uC5ED\uBCD1 \uD48D\uB385\uC774",
      "Plague Scourge": "\uC5ED\uBCD1 \uC7AC\uC559",
      "Plague Scratch": "\uC5ED\uBCD1 \uD560\uD034\uAE30",
      "Plague Scythe": "\uC5ED\uBCD1 \uB0AB",
      "Plague Shard": "\uC5ED\uBCD1 \uD30C\uD3B8",
      "Plague Shroud": "\uC5ED\uBCD1 \uC218\uC758",
      "Plague Slippers": "\uC5ED\uBCD1 \uB367\uC2E0",
      "Plague Smasher": "\uC5ED\uBCD1 \uBD84\uC1C4\uC790",
      "Plague Song": "\uC5ED\uBCD1 \uB178\uB798",
      "Plague Spell": "\uC5ED\uBCD1 \uC8FC\uBB38",
      "Plague Sphere": "\uC5ED\uBCD1 \uAD6C\uCCB4",
      "Plague Spike": "\uC5ED\uBCD1 \uAC00\uC2DC",
      "Plague Spiral": "\uC5ED\uBCD1 \uB098\uC120",
      "Plague Spire": "\uC5ED\uBCD1 \uCCA8\uD0D1",
      "Plague Splitter": "\uC5ED\uBCD1 \uCABC\uAC1C\uB294\uC790",
      "Plague Spur": "\uC5ED\uBCD1 \uBC15\uCC28",
      "Plague Stake": "\uC5ED\uBCD1 \uB9D0\uB69D",
      "Plague Stalk": "\uC5ED\uBCD1 \uCD94\uC801",
      "Plague Star": "\uC5ED\uBCD1 \uBCC4",
      "Plague Stinger": "\uC5ED\uBCD1 \uB3C5\uCE68",
      "Plague Strap": "\uC5ED\uBCD1 \uB760",
      "Plague Suit": "\uC5ED\uBCD1 \uAC11\uC637",
      "Plague Sunder": "\uC5ED\uBCD1 \uC808\uB2E8",
      "Plague Talisman": "\uC5ED\uBCD1 \uBD80\uC801",
      "Plague Thirst": "\uC5ED\uBCD1 \uAC08\uC99D",
      "Plague Torc": "\uC5ED\uBCD1 \uBAA9\uACE0\uB9AC",
      "Plague Tower": "\uC5ED\uBCD1 \uD0D1",
      "Plague Track": "\uC5ED\uBCD1 \uBC1C\uC790\uAD6D",
      "Plague Trample": "\uC5ED\uBCD1 \uC9D3\uBC1F\uAE30",
      "Plague Turn": "\uC5ED\uBCD1 \uD68C\uC804",
      "Plague Veil": "\uC5ED\uBCD1 \uC7A5\uB9C9",
      "Plague Visage": "\uC5ED\uBCD1 \uC5BC\uAD74",
      "Plague Ward": "\uC5ED\uBCD1 \uBCF4\uD638",
      "Plague Weaver": "\uC5ED\uBCD1 \uC9C1\uC870\uC790",
      "Plague Wing": "\uC5ED\uBCD1 \uB0A0\uAC1C",
      "Plague Wrack": "\uC5ED\uBCD1 \uACE0\uBB38",
      "Plains of Despair": "\uC808\uB9DD\uC758 \uD3C9\uC6D0",
      "Plant a totem among the nearest pack, and howl: for #s monsters within # of it flee in terror": "\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC18D\uC5D0 \uD1A0\uD15C\uC744 \uC138\uC6B0\uACE0 \uD3EC\uD6A8: {0}\uCD08\uAC04 \uC8FC\uC704 {1} \uC548\uC758 \uAD34\uBB3C\uC774 \uAC81\uC5D0 \uC9C8\uB824 \uB2EC\uC544\uB0A8",
      "Plated Belt": "\uD50C\uB808\uC774\uD2B8 \uBCA8\uD2B8",
      Platinum: "\uBC31\uAE08\uC758",
      "PLAY AGAIN": "\uB2E4\uC2DC \uD50C\uB808\uC774",
      "Play again (Enter)": "\uB2E4\uC2DC \uD50C\uB808\uC774 (Enter)",
      Pluckeye: "\uB208\uC0B4",
      Poignard: "\uD3EC\uC774\uB098\uB4DC",
      poison: "\uB3C5",
      "Poison and Bone Skills": "\uB3C5\uACFC \uBF08 \uAE30\uC220",
      "Poison Creeper": "\uB9F9\uB3C5 \uB369\uAD74",
      "Poison Dagger": "\uB9F9\uB3C5 \uB2E8\uB3C4",
      "Poison Damage": "\uB3C5 \uD53C\uD574",
      "Poison Explosion": "\uB9F9\uB3C5 \uD3ED\uBC1C",
      "Poison Javelin": "\uB9F9\uB3C5 \uD22C\uCC3D",
      "Poison Length Reduced by": "\uB3C5 \uC9C0\uC18D\uC2DC\uAC04 \uAC10\uC18C",
      "Poison Nova": "\uB9F9\uB3C5 \uD655\uC0B0",
      "Poison Resist": "\uB3C5 \uC800\uD56D",
      "Poison Resistance": "\uB3C5 \uC800\uD56D",
      "Poison Skill Damage": "\uB3C5 \uAE30\uC220 \uD53C\uD574",
      "Pole Arm Mastery": "\uC7A5\uBCD1\uAE30 \uC219\uB828",
      "Polished Wand": "\uD3F4\uB9AC\uC2DC\uB4DC \uC6D0\uB4DC",
      Possessed: "\uBE59\uC758\uB41C",
      "Power Strike": "\uC804\uAE30\uC758 \uC77C\uACA9",
      Powered: "\uAC15\uD55C",
      Pox: "\uB9C8\uB9C8",
      Prayer: "\uAE30\uB3C4",
      "Preparing update...": "\uC5C5\uB370\uC774\uD2B8 \uC900\uBE44 \uC911...",
      "Preserved Head": "\uD504\uB9AC\uC800\uBE0C\uB4DC \uD5E4\uB4DC",
      "Preserver's": "\uBCF4\uC874\uC790\uC758",
      "Press * or click to drink": "{0} \uD0A4 \uB610\uB294 \uD074\uB9AD: \uB9C8\uC2DC\uAE30",
      "Prevent Monster Heal": "\uAD34\uBB3C \uD68C\uBCF5 \uC800\uC9C0",
      "PREVIOUS HERO": "\uC774\uC804 \uC601\uC6C5",
      "PREVIOUS MENU": "\uC774\uC804 \uBA54\uB274",
      "Previous menu (Esc)": "\uC774\uC804 \uBA54\uB274 (Esc)",
      "Priest's": "\uC0AC\uC81C\uC758",
      Prismatic: "\uD718\uD669\uD55C",
      Prod: "\uCC0C\uB974\uAE30",
      "Protector Shield": "\uD504\uB85C\uD14D\uD130 \uC274\uB4DC",
      Psychic: "\uC2EC\uB839\uC758",
      "Psychic Hammer": "\uC815\uC2E0\uC758 \uB9DD\uCE58",
      Puke: "\uAD6C\uD1A0",
      Pulse: "\uB9E5\uB3D9",
      Pus: "\uACE0\uB984",
      "Put an item down on this panel": "\uC774 \uD328\uB110\uC5D0 \uC544\uC774\uD15C\uC744 \uB0B4\uB824\uB193\uAE30",
      Quarrel: "\uC1E0\uB1CC\uC0B4",
      Quarterstaff: "\uCFFC\uD130\uC2A4\uD0DC\uD504",
      "Que-Hegan's Wisdom": "\uCFE0\uC5D0 \uD788\uAC04\uC758 \uC9C0\uD61C",
      "Quest Log": "\uD018\uC2A4\uD2B8 \uAE30\uB85D",
      Quhab: "\uCFE0\uD558\uBE0C",
      "Quieter sound: the volume sliders turn down smoothly to silence, and big fights no longer blast": "\uB354 \uC870\uC6A9\uD55C \uC18C\uB9AC: \uC74C\uB7C9 \uB9C9\uB300\uAC00 \uBB34\uC74C\uAE4C\uC9C0 \uBD80\uB4DC\uB7FD\uAC8C \uC904\uC5B4\uB4E4\uACE0, \uD070 \uC804\uD22C\uB3C4 \uB354 \uC774\uC0C1 \uC2DC\uB044\uB7FD\uAC8C \uC6B8\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      Quill: "\uAE43",
      "Quill Rat": "\uAC00\uC2DC \uC950",
      "Quilted Armor": "\uD03C\uD2F0\uB4DC \uC544\uBA38",
      Rabies: "\uAD11\uACAC\uBCD1",
      Radament: "\uB77C\uB2E4\uBA3C\uD2B8",
      "Radament's Sphere": "\uB77C\uB2E4\uBA3C\uD2B8\uC758 \uBA85\uC8FC",
      "Rage Mask": "\uB808\uC774\uC9C0 \uB9C8\uC2A4\uD06C",
      Raging: "\uACA9\uB178\uD55C",
      Rainbow: "\uBB34\uC9C0\uAC1C",
      "Raise Skeletal Mage": "\uD574\uACE8 \uB9C8\uBC95\uD559\uC790 \uB418\uC0B4\uB9AC\uAE30",
      "Raise Skeleton": "\uD574\uACE8 \uB418\uC0B4\uB9AC\uAE30",
      "Raises each armour's own Damage Reduction: counted in Damage Reduced": "\uAC01 \uBC29\uC5B4\uAD6C\uC758 \uC790\uCCB4 \uD53C\uD574 \uAC10\uC18C\uB97C \uB192\uC784: \uD53C\uD574 \uAC10\uC18C\uC5D0 \uD569\uC0B0",
      Rakanishu: "\uB77C\uCE74\uB2C8\uC288",
      Rakescar: "\uAC08\uD034\uD749\uD130",
      "Rank *": "{0}\uB2E8\uACC4",
      Raven: "\uD070\uAE4C\uB9C8\uADC0",
      "Raven Aegis": "\uD070\uAE4C\uB9C8\uADC0 \uBC29\uD328",
      "Raven Badge": "\uD070\uAE4C\uB9C8\uADC0 \uD718\uC7A5",
      "Raven Band": "\uD070\uAE4C\uB9C8\uADC0 \uBC18\uC9C0",
      "Raven Barb": "\uD070\uAE4C\uB9C8\uADC0 \uBBF8\uB298",
      "Raven Beads": "\uD070\uAE4C\uB9C8\uADC0 \uAD6C\uC2AC",
      "Raven Bite": "\uD070\uAE4C\uB9C8\uADC0 \uC774\uBE68",
      "Raven Blazer": "\uD070\uAE4C\uB9C8\uADC0 \uAC1C\uCC99\uC790",
      "Raven Bludgeon": "\uD070\uAE4C\uB9C8\uADC0 \uACE4\uBD09",
      "Raven Bolt": "\uD070\uAE4C\uB9C8\uADC0 \uD654\uC0B4",
      "Raven Branch": "\uD070\uAE4C\uB9C8\uADC0 \uAC00\uC9C0",
      "Raven Brow": "\uD070\uAE4C\uB9C8\uADC0 \uC774\uB9C8",
      "Raven Buckle": "\uD070\uAE4C\uB9C8\uADC0 \uBC84\uD074",
      "Raven Call": "\uD070\uAE4C\uB9C8\uADC0 \uBD80\uB984",
      "Raven Carapace": "\uD070\uAE4C\uB9C8\uADC0 \uAC11\uAC01",
      "Raven Casque": "\uD070\uAE4C\uB9C8\uADC0 \uD22C\uAD6C",
      "Raven Chant": "\uD070\uAE4C\uB9C8\uADC0 \uCC2C\uAC00",
      "Raven Clasp": "\uD070\uAE4C\uB9C8\uADC0 \uAC78\uC1E0",
      "Raven Claw": "\uD070\uAE4C\uB9C8\uADC0 \uBC1C\uD1B1",
      "Raven Cleaver": "\uD070\uAE4C\uB9C8\uADC0 \uAC00\uB984\uB0A0",
      "Raven Clutches": "\uD070\uAE4C\uB9C8\uADC0 \uB9C8\uC218",
      "Raven Coat": "\uD070\uAE4C\uB9C8\uADC0 \uC678\uD22C",
      "Raven Coil": "\uD070\uAE4C\uB9C8\uADC0 \uACE0\uB9AC",
      "Raven Collar": "\uD070\uAE4C\uB9C8\uADC0 \uBAA9\uD14C",
      "Raven Cord": "\uD070\uAE4C\uB9C8\uADC0 \uB048",
      "Raven Cowl": "\uD070\uAE4C\uB9C8\uADC0 \uC218\uB3C4\uB450\uAC74",
      "Raven Crack": "\uD070\uAE4C\uB9C8\uADC0 \uADE0\uC5F4",
      "Raven Crest": "\uD070\uAE4C\uB9C8\uADC0 \uBB38\uC7A5",
      "Raven Crusher": "\uD070\uAE4C\uB9C8\uADC0 \uBD84\uC1C4\uAE30",
      "Raven Cry": "\uD070\uAE4C\uB9C8\uADC0 \uC6B8\uC74C",
      "Raven Dart": "\uD070\uAE4C\uB9C8\uADC0 \uD22C\uCC3D",
      "Raven Edge": "\uD070\uAE4C\uB9C8\uADC0 \uCE7C\uB0A0",
      "Raven Emblem": "\uD070\uAE4C\uB9C8\uADC0 \uC0C1\uC9D5",
      "Raven Eye": "\uD070\uAE4C\uB9C8\uADC0 \uB208",
      "Raven Fang": "\uD070\uAE4C\uB9C8\uADC0 \uC1A1\uACF3\uB2C8",
      "Raven Finger": "\uD070\uAE4C\uB9C8\uADC0 \uC190\uAC00\uB77D",
      "Raven Fist": "\uD070\uAE4C\uB9C8\uADC0 \uC8FC\uBA39",
      "Raven Fletch": "\uD070\uAE4C\uB9C8\uADC0 \uD654\uC0B4\uAE43",
      "Raven Flight": "\uD070\uAE4C\uB9C8\uADC0 \uBE44\uD589",
      "Raven Frost": "\uCE60\uD751 \uC11C\uB9AC",
      "Raven Glare": "\uD070\uAE4C\uB9C8\uADC0 \uC12C\uAD11",
      "Raven Gnarl": "\uD070\uAE4C\uB9C8\uADC0 \uC639\uC774",
      "Raven Goad": "\uD070\uAE4C\uB9C8\uADC0 \uBAB0\uC774\uB9C9\uB300",
      "Raven Gorget": "\uD070\uAE4C\uB9C8\uADC0 \uBAA9\uAC00\uB9AC\uAC1C",
      "Raven Grip": "\uD070\uAE4C\uB9C8\uADC0 \uC190\uC544\uADC0",
      "Raven Guard": "\uD070\uAE4C\uB9C8\uADC0 \uC218\uD638",
      "Raven Gutter": "\uD070\uAE4C\uB9C8\uADC0 \uC808\uAC1C",
      "Raven Gyre": "\uD070\uAE4C\uB9C8\uADC0 \uC18C\uC6A9\uB3CC\uC774",
      "Raven Hand": "\uD070\uAE4C\uB9C8\uADC0 \uC190",
      "Raven Heart": "\uD070\uAE4C\uB9C8\uADC0 \uC2EC\uC7A5",
      "Raven Hew": "\uD070\uAE4C\uB9C8\uADC0 \uCC0D\uAE30",
      "Raven Hide": "\uD070\uAE4C\uB9C8\uADC0 \uAC00\uC8FD",
      "Raven Hold": "\uD070\uAE4C\uB9C8\uADC0 \uC6C0\uCF1C\uC960",
      "Raven Hood": "\uD070\uAE4C\uB9C8\uADC0 \uB450\uAC74",
      "Raven Horn": "\uD070\uAE4C\uB9C8\uADC0 \uBFD4",
      "Raven Impaler": "\uD070\uAE4C\uB9C8\uADC0 \uAD00\uD1B5\uC790",
      "Raven Jack": "\uD070\uAE4C\uB9C8\uADC0 \uC6C3\uC637",
      "Raven Knell": "\uD070\uAE4C\uB9C8\uADC0 \uC870\uC885",
      "Raven Knot": "\uD070\uAE4C\uB9C8\uADC0 \uB9E4\uB4ED",
      "Raven Knuckle": "\uD070\uAE4C\uB9C8\uADC0 \uC190\uB9C8\uB514",
      "Raven Lance": "\uD070\uAE4C\uB9C8\uADC0 \uCC3D",
      "Raven Lash": "\uD070\uAE4C\uB9C8\uADC0 \uCC44\uCC0D",
      "Raven Lock": "\uD070\uAE4C\uB9C8\uADC0 \uC790\uBB3C\uC1E0",
      "Raven Loop": "\uD070\uAE4C\uB9C8\uADC0 \uD14C",
      "Raven Mallet": "\uD070\uAE4C\uB9C8\uADC0 \uB9DD\uCE58",
      "Raven Mangler": "\uD070\uAE4C\uB9C8\uADC0 \uB09C\uB3C4\uC9C8",
      "Raven Mantle": "\uD070\uAE4C\uB9C8\uADC0 \uB9DD\uD1A0",
      "Raven Mark": "\uD070\uAE4C\uB9C8\uADC0 \uD45C\uC2DD",
      "Raven Mask": "\uD070\uAE4C\uB9C8\uADC0 \uAC00\uBA74",
      "Raven Mauler": "\uD070\uAE4C\uB9C8\uADC0 \uD30C\uAD34\uC790",
      "Raven Nails": "\uD070\uAE4C\uB9C8\uADC0 \uBABB",
      "Raven Necklace": "\uD070\uAE4C\uB9C8\uADC0 \uBAA9\uAC78\uC774",
      "Raven Needle": "\uD070\uAE4C\uB9C8\uADC0 \uBC14\uB298",
      "Raven Nock": "\uD070\uAE4C\uB9C8\uADC0 \uC2DC\uC704\uD648",
      "Raven Noose": "\uD070\uAE4C\uB9C8\uADC0 \uC62C\uAC00\uBBF8",
      "Raven Orb": "\uD070\uAE4C\uB9C8\uADC0 \uBCF4\uC8FC",
      "Raven Pelt": "\uD070\uAE4C\uB9C8\uADC0 \uBAA8\uD53C",
      "Raven Prod": "\uD070\uAE4C\uB9C8\uADC0 \uCC0C\uB974\uAE30",
      "Raven Quarrel": "\uD070\uAE4C\uB9C8\uADC0 \uC1E0\uB1CC\uC0B4",
      "Raven Quill": "\uD070\uAE4C\uB9C8\uADC0 \uAE43",
      "Raven Razor": "\uD070\uAE4C\uB9C8\uADC0 \uBA74\uB3C4\uB0A0",
      "Raven Rend": "\uD070\uAE4C\uB9C8\uADC0 \uCC22\uAE40",
      "Raven Road": "\uD070\uAE4C\uB9C8\uADC0 \uAE38",
      "Raven Saw": "\uD070\uAE4C\uB9C8\uADC0 \uD1B1",
      "Raven Scalpel": "\uD070\uAE4C\uB9C8\uADC0 \uD574\uBD80\uCE7C",
      "Raven Scarab": "\uD070\uAE4C\uB9C8\uADC0 \uD48D\uB385\uC774",
      "Raven Scourge": "\uD070\uAE4C\uB9C8\uADC0 \uC7AC\uC559",
      "Raven Scratch": "\uD070\uAE4C\uB9C8\uADC0 \uD560\uD034\uAE30",
      "Raven Scythe": "\uD070\uAE4C\uB9C8\uADC0 \uB0AB",
      "Raven Shard": "\uD070\uAE4C\uB9C8\uADC0 \uD30C\uD3B8",
      "Raven Shroud": "\uD070\uAE4C\uB9C8\uADC0 \uC218\uC758",
      "Raven Slippers": "\uD070\uAE4C\uB9C8\uADC0 \uB367\uC2E0",
      "Raven Smasher": "\uD070\uAE4C\uB9C8\uADC0 \uBD84\uC1C4\uC790",
      "Raven Song": "\uD070\uAE4C\uB9C8\uADC0 \uB178\uB798",
      "Raven Spell": "\uD070\uAE4C\uB9C8\uADC0 \uC8FC\uBB38",
      "Raven Sphere": "\uD070\uAE4C\uB9C8\uADC0 \uAD6C\uCCB4",
      "Raven Spike": "\uD070\uAE4C\uB9C8\uADC0 \uAC00\uC2DC",
      "Raven Spiral": "\uD070\uAE4C\uB9C8\uADC0 \uB098\uC120",
      "Raven Spire": "\uD070\uAE4C\uB9C8\uADC0 \uCCA8\uD0D1",
      "Raven Splitter": "\uD070\uAE4C\uB9C8\uADC0 \uCABC\uAC1C\uB294\uC790",
      "Raven Spur": "\uD070\uAE4C\uB9C8\uADC0 \uBC15\uCC28",
      "Raven Stake": "\uD070\uAE4C\uB9C8\uADC0 \uB9D0\uB69D",
      "Raven Stalk": "\uD070\uAE4C\uB9C8\uADC0 \uCD94\uC801",
      "Raven Star": "\uD070\uAE4C\uB9C8\uADC0 \uBCC4",
      "Raven Stinger": "\uD070\uAE4C\uB9C8\uADC0 \uB3C5\uCE68",
      "Raven Strap": "\uD070\uAE4C\uB9C8\uADC0 \uB760",
      "Raven Suit": "\uD070\uAE4C\uB9C8\uADC0 \uAC11\uC637",
      "Raven Sunder": "\uD070\uAE4C\uB9C8\uADC0 \uC808\uB2E8",
      "Raven Talisman": "\uD070\uAE4C\uB9C8\uADC0 \uBD80\uC801",
      "Raven Thirst": "\uD070\uAE4C\uB9C8\uADC0 \uAC08\uC99D",
      "Raven Torc": "\uD070\uAE4C\uB9C8\uADC0 \uBAA9\uACE0\uB9AC",
      "Raven Tower": "\uD070\uAE4C\uB9C8\uADC0 \uD0D1",
      "Raven Track": "\uD070\uAE4C\uB9C8\uADC0 \uBC1C\uC790\uAD6D",
      "Raven Trample": "\uD070\uAE4C\uB9C8\uADC0 \uC9D3\uBC1F\uAE30",
      "Raven Turn": "\uD070\uAE4C\uB9C8\uADC0 \uD68C\uC804",
      "Raven Veil": "\uD070\uAE4C\uB9C8\uADC0 \uC7A5\uB9C9",
      "Raven Visage": "\uD070\uAE4C\uB9C8\uADC0 \uC5BC\uAD74",
      "Raven Ward": "\uD070\uAE4C\uB9C8\uADC0 \uBCF4\uD638",
      "Raven Weaver": "\uD070\uAE4C\uB9C8\uADC0 \uC9C1\uC870\uC790",
      "Raven Wing": "\uD070\uAE4C\uB9C8\uADC0 \uB0A0\uAC1C",
      "Raven Wrack": "\uD070\uAE4C\uB9C8\uADC0 \uACE0\uBB38",
      Ravenlore: "\uAE4C\uB9C8\uADC0\uC804\uC2B9",
      "Ravens, wolves, the grizzly and creepers get +#% life and damage": "\uD070\uAE4C\uB9C8\uADC0, \uB291\uB300, \uD68C\uC0C9\uACF0, \uB369\uAD74\uC758 \uC0DD\uBA85\uB825\uACFC \uD53C\uD574 +{0}%",
      Razor: "\uBA74\uB3C4\uB0A0",
      "Razor Bow": "\uB808\uC774\uC800 \uBCF4\uC6B0",
      Razortail: "\uC11C\uC2AC\uAF2C\uB9AC",
      "Ready: a chest evolves * into *": "\uC900\uBE44 \uC644\uB8CC: \uC0C1\uC790\uB97C \uC5F4\uBA74 {0}\uC774(\uAC00) {1}(\uC73C)\uB85C \uC9C4\uD654",
      "Ready: a chest evolves it into *": "\uC900\uBE44 \uC644\uB8CC: \uC0C1\uC790\uB97C \uC5F4\uBA74 {0}(\uC73C)\uB85C \uC9C4\uD654",
      Realgar: "\uACC4\uAD00\uC11D",
      Red: "\uBD89\uC740\uC0C9",
      Redemption: "\uC18D\uC8C4",
      "Reflex Bow": "\uB9AC\uD50C\uB809\uC2A4 \uBCF4\uC6B0",
      "Regenerate 1 life per second": "\uCD08\uB2F9 \uC0DD\uBA85\uB825 1 \uD68C\uBCF5",
      "Regenerate Mana": "\uB9C8\uB098 \uC7AC\uC0DD",
      "Reinforced Mace": "\uB9AC\uC778\uD3EC\uC2A4\uB4DC \uBA54\uC774\uC2A4",
      Remaining: "\uD3EC\uC778\uD2B8",
      Rend: "\uCC22\uAE40",
      Repair: "\uC218\uB9AC",
      "Repairs # durability per second": "\uCD08\uB2F9 \uB0B4\uAD6C\uB3C4 {0} \uC218\uB9AC",
      Replace: "\uAD50\uCCB4",
      "Replace Your Save?": "\uC800\uC7A5 \uB370\uC774\uD130\uB97C \uB300\uCCB4\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?",
      "Replaces *": "{0} \uB300\uCCB4",
      "Replenish Life": "\uC0DD\uBA85\uB825 \uD68C\uBCF5",
      "Replenishes quantity": "\uC218\uB7C9 \uC790\uB3D9 \uD68C\uBCF5",
      "Required Dexterity:": "\uD544\uC694 \uBBFC\uCCA9:",
      "Required Level:": "\uD544\uC694 \uB808\uBCA8:",
      "Required Strength:": "\uD544\uC694 \uD798:",
      Requirements: "\uCC29\uC6A9 \uC870\uAC74",
      Reroll: "\uB9AC\uB864",
      "Reroll* \xB7 *": "\uB9AC\uB864{0} \xB7 {1}",
      "Resist Cold": "\uB0C9\uAE30 \uC800\uD56D",
      "Resist Fire": "\uD654\uC5FC \uC800\uD56D",
      "Resist Lightning": "\uBC88\uAC1C \uC800\uD56D",
      Resonant: "\uACF5\uBA85\uD558\uB294",
      "RESTART TO UPDATE": "\uC5C5\uB370\uC774\uD2B8\uB97C \uC704\uD574 \uC7AC\uC2DC\uC791",
      "Restores all life": "\uC0DD\uBA85\uB825 \uC644\uC804 \uD68C\uBCF5",
      Resurrect: "\uBD80\uD65C",
      Resurrected: "\uBD80\uD65C\uD588\uC2B5\uB2C8\uB2E4",
      "RETURN TO GAME": "\uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      "Return to game (Esc)": "\uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30 (Esc)",
      Revive: "\uBD80\uD65C",
      "Right hand / left hand: each weapon strikes with its own damage": "\uC624\uB978\uC190 / \uC67C\uC190: \uBB34\uAE30\uB9C8\uB2E4 \uC790\uCCB4 \uD53C\uD574\uB85C \uACF5\uACA9",
      Ring: "\uBC18\uC9C0",
      Ripper: "\uCC22\uAC1C",
      "River of Flame": "\uBD88\uAE38\uC758 \uAC15",
      "Rixot's Keen": "\uB9AD\uC18C\uD2B8\uC758 \uB0A0\uCE74\uB85C\uC6C0",
      Road: "\uAE38",
      Robineye: "\uC6B8\uC0C8\uB208\uC758",
      Rockfleece: "\uBC14\uC704\uD138\uAC00\uC8FD",
      "Rocky Waste": "\uBC14\uC704\uD22C\uC131\uC774 \uD669\uBB34\uC9C0",
      "Rogue Encampment": "\uB3C4\uC801 \uC57C\uC601\uC9C0",
      "Rogue's Bow": "\uB3C4\uC801\uC758 \uD65C",
      Rondache: "\uB860\uB2E4\uC26C",
      "Rose Branded": "\uC7A5\uBBF8 \uB099\uC778\uC758",
      Rot: "\uBD80\uD328",
      "Round Shield": "\uB77C\uC6B4\uB4DC \uC274\uB4DC",
      "Royal Shield": "\uB85C\uC584 \uC274\uB4DC",
      Ruby: "\uB8E8\uBE44\uC0C9",
      Rune: "\uB8EC",
      "Rune Aegis": "\uB8EC \uBC29\uD328",
      "Rune Badge": "\uB8EC \uD718\uC7A5",
      "Rune Band": "\uB8EC \uBC18\uC9C0",
      "Rune Barb": "\uB8EC \uBBF8\uB298",
      "Rune Beads": "\uB8EC \uAD6C\uC2AC",
      "Rune Bite": "\uB8EC \uC774\uBE68",
      "Rune Blazer": "\uB8EC \uAC1C\uCC99\uC790",
      "Rune Bludgeon": "\uB8EC \uACE4\uBD09",
      "Rune Bolt": "\uB8EC \uD654\uC0B4",
      "Rune Bow": "\uB8EC \uBCF4\uC6B0",
      "Rune Branch": "\uB8EC \uAC00\uC9C0",
      "Rune Brow": "\uB8EC \uC774\uB9C8",
      "Rune Buckle": "\uB8EC \uBC84\uD074",
      "Rune Call": "\uB8EC \uBD80\uB984",
      "Rune Carapace": "\uB8EC \uAC11\uAC01",
      "Rune Casque": "\uB8EC \uD22C\uAD6C",
      "Rune Chant": "\uB8EC \uCC2C\uAC00",
      "Rune Clasp": "\uB8EC \uAC78\uC1E0",
      "Rune Claw": "\uB8EC \uBC1C\uD1B1",
      "Rune Cleaver": "\uB8EC \uAC00\uB984\uB0A0",
      "Rune Clutches": "\uB8EC \uB9C8\uC218",
      "Rune Coat": "\uB8EC \uC678\uD22C",
      "Rune Coil": "\uB8EC \uACE0\uB9AC",
      "Rune Collar": "\uB8EC \uBAA9\uD14C",
      "Rune Cord": "\uB8EC \uB048",
      "Rune Cowl": "\uB8EC \uC218\uB3C4\uB450\uAC74",
      "Rune Crack": "\uB8EC \uADE0\uC5F4",
      "Rune Crest": "\uB8EC \uBB38\uC7A5",
      "Rune Crusher": "\uB8EC \uBD84\uC1C4\uAE30",
      "Rune Cry": "\uB8EC \uC6B8\uC74C",
      "Rune Dart": "\uB8EC \uD22C\uCC3D",
      "Rune Edge": "\uB8EC \uCE7C\uB0A0",
      "Rune Emblem": "\uB8EC \uC0C1\uC9D5",
      "Rune Eye": "\uB8EC \uB208",
      "Rune Fang": "\uB8EC \uC1A1\uACF3\uB2C8",
      "Rune Finger": "\uB8EC \uC190\uAC00\uB77D",
      "Rune Fist": "\uB8EC \uC8FC\uBA39",
      "Rune Fletch": "\uB8EC \uD654\uC0B4\uAE43",
      "Rune Flight": "\uB8EC \uBE44\uD589",
      "Rune Glare": "\uB8EC \uC12C\uAD11",
      "Rune Gnarl": "\uB8EC \uC639\uC774",
      "Rune Goad": "\uB8EC \uBAB0\uC774\uB9C9\uB300",
      "Rune Gorget": "\uB8EC \uBAA9\uAC00\uB9AC\uAC1C",
      "Rune Grip": "\uB8EC \uC190\uC544\uADC0",
      "Rune Guard": "\uB8EC \uC218\uD638",
      "Rune Gutter": "\uB8EC \uC808\uAC1C",
      "Rune Gyre": "\uB8EC \uC18C\uC6A9\uB3CC\uC774",
      "Rune Hand": "\uB8EC \uC190",
      "Rune Heart": "\uB8EC \uC2EC\uC7A5",
      "Rune Hew": "\uB8EC \uCC0D\uAE30",
      "Rune Hide": "\uB8EC \uAC00\uC8FD",
      "Rune Hold": "\uB8EC \uC6C0\uCF1C\uC960",
      "Rune Hood": "\uB8EC \uB450\uAC74",
      "Rune Horn": "\uB8EC \uBFD4",
      "Rune Impaler": "\uB8EC \uAD00\uD1B5\uC790",
      "Rune Jack": "\uB8EC \uC6C3\uC637",
      "Rune Knell": "\uB8EC \uC870\uC885",
      "Rune Knot": "\uB8EC \uB9E4\uB4ED",
      "Rune Knuckle": "\uB8EC \uC190\uB9C8\uB514",
      "Rune Lance": "\uB8EC \uCC3D",
      "Rune Lash": "\uB8EC \uCC44\uCC0D",
      "Rune Lock": "\uB8EC \uC790\uBB3C\uC1E0",
      "Rune Loop": "\uB8EC \uD14C",
      "Rune Mallet": "\uB8EC \uB9DD\uCE58",
      "Rune Mangler": "\uB8EC \uB09C\uB3C4\uC9C8",
      "Rune Mantle": "\uB8EC \uB9DD\uD1A0",
      "Rune Mark": "\uB8EC \uD45C\uC2DD",
      "Rune Mask": "\uB8EC \uAC00\uBA74",
      "Rune Mauler": "\uB8EC \uD30C\uAD34\uC790",
      "Rune Nails": "\uB8EC \uBABB",
      "Rune Necklace": "\uB8EC \uBAA9\uAC78\uC774",
      "Rune Needle": "\uB8EC \uBC14\uB298",
      "Rune Nock": "\uB8EC \uC2DC\uC704\uD648",
      "Rune Noose": "\uB8EC \uC62C\uAC00\uBBF8",
      "Rune Orb": "\uB8EC \uBCF4\uC8FC",
      "Rune Pelt": "\uB8EC \uBAA8\uD53C",
      "Rune Prod": "\uB8EC \uCC0C\uB974\uAE30",
      "Rune Quarrel": "\uB8EC \uC1E0\uB1CC\uC0B4",
      "Rune Quill": "\uB8EC \uAE43",
      "Rune Razor": "\uB8EC \uBA74\uB3C4\uB0A0",
      "Rune Rend": "\uB8EC \uCC22\uAE40",
      "Rune Road": "\uB8EC \uAE38",
      "Rune Saw": "\uB8EC \uD1B1",
      "Rune Scalpel": "\uB8EC \uD574\uBD80\uCE7C",
      "Rune Scarab": "\uB8EC \uD48D\uB385\uC774",
      "Rune Scepter": "\uB8EC \uC149\uD130",
      "Rune Scourge": "\uB8EC \uC7AC\uC559",
      "Rune Scratch": "\uB8EC \uD560\uD034\uAE30",
      "Rune Scythe": "\uB8EC \uB0AB",
      "Rune Shard": "\uB8EC \uD30C\uD3B8",
      "Rune Shroud": "\uB8EC \uC218\uC758",
      "Rune Slippers": "\uB8EC \uB367\uC2E0",
      "Rune Smasher": "\uB8EC \uBD84\uC1C4\uC790",
      "Rune Song": "\uB8EC \uB178\uB798",
      "Rune Spell": "\uB8EC \uC8FC\uBB38",
      "Rune Sphere": "\uB8EC \uAD6C\uCCB4",
      "Rune Spike": "\uB8EC \uAC00\uC2DC",
      "Rune Spiral": "\uB8EC \uB098\uC120",
      "Rune Spire": "\uB8EC \uCCA8\uD0D1",
      "Rune Splitter": "\uB8EC \uCABC\uAC1C\uB294\uC790",
      "Rune Spur": "\uB8EC \uBC15\uCC28",
      "Rune Staff": "\uB8EC \uC2A4\uD0DC\uD504",
      "Rune Stake": "\uB8EC \uB9D0\uB69D",
      "Rune Stalk": "\uB8EC \uCD94\uC801",
      "Rune Star": "\uB8EC \uBCC4",
      "Rune Stinger": "\uB8EC \uB3C5\uCE68",
      "Rune Strap": "\uB8EC \uB760",
      "Rune Suit": "\uB8EC \uAC11\uC637",
      "Rune Sunder": "\uB8EC \uC808\uB2E8",
      "Rune Sword": "\uB8EC \uC18C\uB4DC",
      "Rune Talisman": "\uB8EC \uBD80\uC801",
      "Rune Thirst": "\uB8EC \uAC08\uC99D",
      "Rune Torc": "\uB8EC \uBAA9\uACE0\uB9AC",
      "Rune Tower": "\uB8EC \uD0D1",
      "Rune Track": "\uB8EC \uBC1C\uC790\uAD6D",
      "Rune Trample": "\uB8EC \uC9D3\uBC1F\uAE30",
      "Rune Turn": "\uB8EC \uD68C\uC804",
      "Rune Veil": "\uB8EC \uC7A5\uB9C9",
      "Rune Visage": "\uB8EC \uC5BC\uAD74",
      "Rune Ward": "\uB8EC \uBCF4\uD638",
      "Rune Weaver": "\uB8EC \uC9C1\uC870\uC790",
      "Rune Wing": "\uB8EC \uB0A0\uAC1C",
      "Rune Wrack": "\uB8EC \uACE0\uBB38",
      "Runic Talons": "\uB8E8\uB2C9 \uD0E4\uB7F0",
      Russet: "\uC801\uAC08\uC0C9",
      "Russet Armor": "\uB7EC\uC14B \uC544\uBA38",
      Rust: "\uB179",
      Rusthandle: "\uB179\uC2A8\uC190\uC7A1\uC774",
      Rusty: "\uB179\uC2A8",
      "Sacred Feathers": "\uC138\uC774\uD06C\uB9AC\uB4DC \uD398\uB354\uC2A4",
      "Sacred Globe": "\uC138\uC774\uD06C\uB9AC\uB4DC \uAE00\uB85C\uBE0C",
      "Sacred Rondache": "\uC138\uC774\uD06C\uB9AC\uB4DC \uB860\uB2E4\uC26C",
      "Sacred Targe": "\uC138\uC774\uD06C\uB9AC\uB4DC \uD0C0\uC544\uC9C0",
      Sacrifice: "\uD76C\uC0DD",
      Saintly: "\uC131\uC778\uC758",
      Sallet: "\uC0D0\uB9BF",
      Salvation: "\uAD6C\uC6D0",
      Sanctuary: "\uC131\uC5ED",
      Sanguinary: "\uC720\uD608\uC758",
      Sapphire: "\uC0AC\uD30C\uC774\uC5B4\uC0C9",
      "Saracen's Chance": "\uC0AC\uB77C\uC13C\uC758 \uAE30\uD68C",
      Sash: "\uC0C8\uC2DC",
      Savage: "\uB9F9\uB82C\uD55C",
      "Savage Helmet": "\uC138\uBE44\uC9C0 \uD5EC\uBA67",
      "Save and exit game": "\uAC8C\uC784 \uC800\uC7A5 \uD6C4 \uB098\uAC00\uAE30",
      "Save imported.": "\uC800\uC7A5 \uB370\uC774\uD130\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.",
      "Save too large": "\uC800\uC7A5 \uB370\uC774\uD130\uAC00 \uB108\uBB34 \uD07D\uB2C8\uB2E4",
      "Saved at the start of Act **": "{0}\uB9C9{1} \uC2DC\uC791 \uC2DC\uC810\uC5D0 \uC800\uC7A5\uB428",
      Saw: "\uD1B1",
      Scalpel: "\uD574\uBD80\uCE7C",
      Scarab: "\uD48D\uB385\uC774",
      "Scarabshell Boots": "\uC2A4\uCE90\uB7FD\uC258 \uBD80\uCE20",
      Scarlet: "\uC9C4\uD64D\uC0C9",
      Scepter: "\uC149\uD130",
      "Schooled in the Martial Arts, her mind and body are deadly weapons.": "\uBB34\uC220\uC744 \uC218\uB828\uD558\uC5EC \uC815\uC2E0\uACFC \uC721\uCCB4\uAC00 \uACE7 \uCE58\uBA85\uC801\uC778 \uBB34\uAE30\uC785\uB2C8\uB2E4.",
      Scimitar: "\uC2DC\uBBF8\uD130",
      Scintillating: "\uC815\uCC44\uB85C\uC6B4",
      "Scissors Katar": "\uC2DC\uC800\uC2A4 \uCE74\uD0C0\uB974",
      "Scissors Quhab": "\uC2DC\uC800\uC2A4 \uCFE0\uD558\uBE0C",
      "Scissors Suwayyah": "\uC2DC\uC800\uC2A4 \uC218\uC6E8\uC774\uC57C",
      Scorching: "\uBD88\uD0C0\uB294",
      Scourge: "\uC2A4\uCEEC\uC9C0",
      Scratch: "\uD560\uD034\uAE30",
      Screaming: "\uBE44\uBA85\uC758",
      "Scroll of Town Portal": "\uB9C8\uC744 \uCC28\uC6D0\uBB38 \uB450\uB8E8\uB9C8\uB9AC",
      Scutum: "\uC2A4\uD050\uD140",
      Scythe: "\uB0AB",
      Seethe: "\uB4E4\uB053\uC74C",
      "SELECT HERO": "\uC601\uC6C5 \uC120\uD0DD",
      "Select Hero Class": "\uC601\uC6C5 \uC9C1\uC5C5 \uC120\uD0DD",
      "Select the code and copy it": "\uCF54\uB4DC\uB97C \uC120\uD0DD\uD574\uC11C \uBCF5\uC0AC\uD558\uC2ED\uC2DC\uC624",
      Sell: "\uD310\uB9E4",
      "Sells for * gold": "\uD310\uB9E4 \uAC00\uACA9: {0} \uACE8\uB4DC",
      "Sensei's": "\uC120\uC0DD\uC758",
      September: "9\uC6D4",
      Septic: "\uD328\uD608\uC131\uC758",
      "Seraph Rod": "\uC138\uB77C\uD504 \uB85C\uB4DC",
      "Seraph's Hymn": "\uCC9C\uC0AC\uC758 \uCC2C\uC1A1\uAC00",
      "Serpent's": "\uD070\uBC40\uC758",
      "Serpentskin Armor": "\uC11C\uD380\uD2B8\uC2A4\uD0A8 \uC544\uBA38",
      Serrated: "\uD1B1\uB2C8",
      "Sexton Trophy": "\uC139\uC2A4\uD134 \uD2B8\uB85C\uD53C",
      Shadow: "\uADF8\uB9BC\uC790\uC758",
      "Shadow Aegis": "\uADF8\uB9BC\uC790 \uBC29\uD328",
      "Shadow Badge": "\uADF8\uB9BC\uC790 \uD718\uC7A5",
      "Shadow Band": "\uADF8\uB9BC\uC790 \uBC18\uC9C0",
      "Shadow Barb": "\uADF8\uB9BC\uC790 \uBBF8\uB298",
      "Shadow Beads": "\uADF8\uB9BC\uC790 \uAD6C\uC2AC",
      "Shadow Bite": "\uADF8\uB9BC\uC790 \uC774\uBE68",
      "Shadow Blazer": "\uADF8\uB9BC\uC790 \uAC1C\uCC99\uC790",
      "Shadow Bludgeon": "\uADF8\uB9BC\uC790 \uACE4\uBD09",
      "Shadow Bolt": "\uADF8\uB9BC\uC790 \uD654\uC0B4",
      "Shadow Bow": "\uC250\uB3C4\uC6B0 \uBCF4\uC6B0",
      "Shadow Branch": "\uADF8\uB9BC\uC790 \uAC00\uC9C0",
      "Shadow Brow": "\uADF8\uB9BC\uC790 \uC774\uB9C8",
      "Shadow Buckle": "\uADF8\uB9BC\uC790 \uBC84\uD074",
      "Shadow Call": "\uADF8\uB9BC\uC790 \uBD80\uB984",
      "Shadow Carapace": "\uADF8\uB9BC\uC790 \uAC11\uAC01",
      "Shadow Casque": "\uADF8\uB9BC\uC790 \uD22C\uAD6C",
      "Shadow Chant": "\uADF8\uB9BC\uC790 \uCC2C\uAC00",
      "Shadow Clasp": "\uADF8\uB9BC\uC790 \uAC78\uC1E0",
      "Shadow Claw": "\uADF8\uB9BC\uC790 \uBC1C\uD1B1",
      "Shadow Cleaver": "\uADF8\uB9BC\uC790 \uAC00\uB984\uB0A0",
      "Shadow Clutches": "\uADF8\uB9BC\uC790 \uB9C8\uC218",
      "Shadow Coat": "\uADF8\uB9BC\uC790 \uC678\uD22C",
      "Shadow Coil": "\uADF8\uB9BC\uC790 \uACE0\uB9AC",
      "Shadow Collar": "\uADF8\uB9BC\uC790 \uBAA9\uD14C",
      "Shadow Cord": "\uADF8\uB9BC\uC790 \uB048",
      "Shadow Cowl": "\uADF8\uB9BC\uC790 \uC218\uB3C4\uB450\uAC74",
      "Shadow Crack": "\uADF8\uB9BC\uC790 \uADE0\uC5F4",
      "Shadow Crest": "\uADF8\uB9BC\uC790 \uBB38\uC7A5",
      "Shadow Crusher": "\uADF8\uB9BC\uC790 \uBD84\uC1C4\uAE30",
      "Shadow Cry": "\uADF8\uB9BC\uC790 \uC6B8\uC74C",
      "Shadow Dancer": "\uADF8\uB9BC\uC790 \uCDA4\uAFBC",
      "Shadow Dart": "\uADF8\uB9BC\uC790 \uD22C\uCC3D",
      "Shadow Disciplines": "\uADF8\uB9BC\uC790 \uC218\uB828",
      "Shadow Edge": "\uADF8\uB9BC\uC790 \uCE7C\uB0A0",
      "Shadow Emblem": "\uADF8\uB9BC\uC790 \uC0C1\uC9D5",
      "Shadow Eye": "\uADF8\uB9BC\uC790 \uB208",
      "Shadow Fang": "\uADF8\uB9BC\uC790 \uC1A1\uACF3\uB2C8",
      "Shadow Finger": "\uADF8\uB9BC\uC790 \uC190\uAC00\uB77D",
      "Shadow Fist": "\uADF8\uB9BC\uC790 \uC8FC\uBA39",
      "Shadow Fletch": "\uADF8\uB9BC\uC790 \uD654\uC0B4\uAE43",
      "Shadow Flight": "\uADF8\uB9BC\uC790 \uBE44\uD589",
      "Shadow Glare": "\uADF8\uB9BC\uC790 \uC12C\uAD11",
      "Shadow Gnarl": "\uADF8\uB9BC\uC790 \uC639\uC774",
      "Shadow Goad": "\uADF8\uB9BC\uC790 \uBAB0\uC774\uB9C9\uB300",
      "Shadow Gorget": "\uADF8\uB9BC\uC790 \uBAA9\uAC00\uB9AC\uAC1C",
      "Shadow Grip": "\uADF8\uB9BC\uC790 \uC190\uC544\uADC0",
      "Shadow Guard": "\uADF8\uB9BC\uC790 \uC218\uD638",
      "Shadow Gutter": "\uADF8\uB9BC\uC790 \uC808\uAC1C",
      "Shadow Gyre": "\uADF8\uB9BC\uC790 \uC18C\uC6A9\uB3CC\uC774",
      "Shadow Hand": "\uADF8\uB9BC\uC790 \uC190",
      "Shadow Heart": "\uADF8\uB9BC\uC790 \uC2EC\uC7A5",
      "Shadow Hew": "\uADF8\uB9BC\uC790 \uCC0D\uAE30",
      "Shadow Hide": "\uADF8\uB9BC\uC790 \uAC00\uC8FD",
      "Shadow Hold": "\uADF8\uB9BC\uC790 \uC6C0\uCF1C\uC960",
      "Shadow Hood": "\uADF8\uB9BC\uC790 \uB450\uAC74",
      "Shadow Horn": "\uADF8\uB9BC\uC790 \uBFD4",
      "Shadow Impaler": "\uADF8\uB9BC\uC790 \uAD00\uD1B5\uC790",
      "Shadow Jack": "\uADF8\uB9BC\uC790 \uC6C3\uC637",
      "Shadow Killer": "\uC8FD\uC74C\uC758 \uADF8\uB9BC\uC790",
      "Shadow Knell": "\uADF8\uB9BC\uC790 \uC870\uC885",
      "Shadow Knot": "\uADF8\uB9BC\uC790 \uB9E4\uB4ED",
      "Shadow Knuckle": "\uADF8\uB9BC\uC790 \uC190\uB9C8\uB514",
      "Shadow Lance": "\uADF8\uB9BC\uC790 \uCC3D",
      "Shadow Lash": "\uADF8\uB9BC\uC790 \uCC44\uCC0D",
      "Shadow Lock": "\uADF8\uB9BC\uC790 \uC790\uBB3C\uC1E0",
      "Shadow Loop": "\uADF8\uB9BC\uC790 \uD14C",
      "Shadow Mallet": "\uADF8\uB9BC\uC790 \uB9DD\uCE58",
      "Shadow Mangler": "\uADF8\uB9BC\uC790 \uB09C\uB3C4\uC9C8",
      "Shadow Mantle": "\uADF8\uB9BC\uC790 \uB9DD\uD1A0",
      "Shadow Mark": "\uADF8\uB9BC\uC790 \uD45C\uC2DD",
      "Shadow Mask": "\uADF8\uB9BC\uC790 \uAC00\uBA74",
      "Shadow Master": "\uADF8\uB9BC\uC790 \uB2EC\uC778",
      "Shadow Mauler": "\uADF8\uB9BC\uC790 \uD30C\uAD34\uC790",
      "Shadow Nails": "\uADF8\uB9BC\uC790 \uBABB",
      "Shadow Necklace": "\uADF8\uB9BC\uC790 \uBAA9\uAC78\uC774",
      "Shadow Needle": "\uADF8\uB9BC\uC790 \uBC14\uB298",
      "Shadow Nock": "\uADF8\uB9BC\uC790 \uC2DC\uC704\uD648",
      "Shadow Noose": "\uADF8\uB9BC\uC790 \uC62C\uAC00\uBBF8",
      "Shadow Orb": "\uADF8\uB9BC\uC790 \uBCF4\uC8FC",
      "Shadow Pelt": "\uADF8\uB9BC\uC790 \uBAA8\uD53C",
      "Shadow Prod": "\uADF8\uB9BC\uC790 \uCC0C\uB974\uAE30",
      "Shadow Quarrel": "\uADF8\uB9BC\uC790 \uC1E0\uB1CC\uC0B4",
      "Shadow Quill": "\uADF8\uB9BC\uC790 \uAE43",
      "Shadow Razor": "\uADF8\uB9BC\uC790 \uBA74\uB3C4\uB0A0",
      "Shadow Rend": "\uADF8\uB9BC\uC790 \uCC22\uAE40",
      "Shadow Road": "\uADF8\uB9BC\uC790 \uAE38",
      "Shadow Saw": "\uADF8\uB9BC\uC790 \uD1B1",
      "Shadow Scalpel": "\uADF8\uB9BC\uC790 \uD574\uBD80\uCE7C",
      "Shadow Scarab": "\uADF8\uB9BC\uC790 \uD48D\uB385\uC774",
      "Shadow Scourge": "\uADF8\uB9BC\uC790 \uC7AC\uC559",
      "Shadow Scratch": "\uADF8\uB9BC\uC790 \uD560\uD034\uAE30",
      "Shadow Scythe": "\uADF8\uB9BC\uC790 \uB0AB",
      "Shadow Shard": "\uADF8\uB9BC\uC790 \uD30C\uD3B8",
      "Shadow Shroud": "\uADF8\uB9BC\uC790 \uC218\uC758",
      "Shadow Slippers": "\uADF8\uB9BC\uC790 \uB367\uC2E0",
      "Shadow Smasher": "\uADF8\uB9BC\uC790 \uBD84\uC1C4\uC790",
      "Shadow Song": "\uADF8\uB9BC\uC790 \uB178\uB798",
      "Shadow Spell": "\uADF8\uB9BC\uC790 \uC8FC\uBB38",
      "Shadow Sphere": "\uADF8\uB9BC\uC790 \uAD6C\uCCB4",
      "Shadow Spike": "\uADF8\uB9BC\uC790 \uAC00\uC2DC",
      "Shadow Spiral": "\uADF8\uB9BC\uC790 \uB098\uC120",
      "Shadow Spire": "\uADF8\uB9BC\uC790 \uCCA8\uD0D1",
      "Shadow Splitter": "\uADF8\uB9BC\uC790 \uCABC\uAC1C\uB294\uC790",
      "Shadow Spur": "\uADF8\uB9BC\uC790 \uBC15\uCC28",
      "Shadow Stake": "\uADF8\uB9BC\uC790 \uB9D0\uB69D",
      "Shadow Stalk": "\uADF8\uB9BC\uC790 \uCD94\uC801",
      "Shadow Star": "\uADF8\uB9BC\uC790 \uBCC4",
      "Shadow Stinger": "\uADF8\uB9BC\uC790 \uB3C5\uCE68",
      "Shadow Strap": "\uADF8\uB9BC\uC790 \uB760",
      "Shadow Suit": "\uADF8\uB9BC\uC790 \uAC11\uC637",
      "Shadow Sunder": "\uADF8\uB9BC\uC790 \uC808\uB2E8",
      "Shadow Talisman": "\uADF8\uB9BC\uC790 \uBD80\uC801",
      "Shadow Thirst": "\uADF8\uB9BC\uC790 \uAC08\uC99D",
      "Shadow Torc": "\uADF8\uB9BC\uC790 \uBAA9\uACE0\uB9AC",
      "Shadow Tower": "\uADF8\uB9BC\uC790 \uD0D1",
      "Shadow Track": "\uADF8\uB9BC\uC790 \uBC1C\uC790\uAD6D",
      "Shadow Trample": "\uADF8\uB9BC\uC790 \uC9D3\uBC1F\uAE30",
      "Shadow Turn": "\uADF8\uB9BC\uC790 \uD68C\uC804",
      "Shadow Veil": "\uADF8\uB9BC\uC790 \uC7A5\uB9C9",
      "Shadow Visage": "\uADF8\uB9BC\uC790 \uC5BC\uAD74",
      "Shadow Ward": "\uADF8\uB9BC\uC790 \uBCF4\uD638",
      "Shadow Warrior": "\uADF8\uB9BC\uC790 \uC804\uC0AC",
      "Shadow Weaver": "\uADF8\uB9BC\uC790 \uC9C1\uC870\uC790",
      "Shadow Wing": "\uADF8\uB9BC\uC790 \uB0A0\uAC1C",
      "Shadow Wrack": "\uADF8\uB9BC\uC790 \uACE0\uBB38",
      Shadowfang: "\uADF8\uB9BC\uC790\uC1A1\uACF3\uB2C8",
      Shako: "\uC0E4\uCF54",
      "Shaman's": "\uC8FC\uC220\uC0AC\uC758",
      Shank: "\uC815\uAC15\uC774",
      "Shape Shifting": "\uBCC0\uC2E0",
      "Shape Shifting Skills": "\uBCC0\uC2E0 \uAE30\uC220",
      Shard: "\uD30C\uD3B8",
      "Shared Stash": "\uACF5\uC720 \uBCF4\uAD00\uD568",
      "Sharkskin Belt": "\uC0E4\uD06C\uC2A4\uD0A8 \uBCA8\uD2B8",
      "Sharkskin Boots": "\uC0E4\uD06C\uC2A4\uD0A8 \uBD80\uCE20",
      "Sharkskin Gloves": "\uC0E4\uD06C\uC2A4\uD0A8 \uAE00\uB7EC\uBE0C",
      "Sharktooth Armor": "\uC0E4\uD06C\uD22C\uC2A4 \uC544\uBA38",
      Sharp: "\uB0A0\uCE74\uB85C\uC6B4",
      "Sharptooth Slayer": "\uC0E4\uD504\uD22C\uC2A4 \uC2AC\uB808\uC774\uC5B4",
      "She has mastered the elemental magicks -- fire, lightning, and ice.": "\uD654\uC5FC, \uBC88\uAC1C, \uC5BC\uC74C\uC758 \uC6D0\uC18C \uB9C8\uBC95\uC744 \uD130\uB4DD\uD588\uC2B5\uB2C8\uB2E4.",
      "Shenk the Overseer": "\uAC10\uB3C5\uAD00 \uC254\uD06C",
      Shield: "\uBC29\uD328",
      "Shift-click an item, or put it down here": "\uC544\uC774\uD15C\uC744 Shift+\uD074\uB9AD\uD558\uAC70\uB098 \uC5EC\uAE30\uC5D0 \uB0B4\uB824\uB193\uAE30",
      "Shift: all points": "Shift: \uBAA8\uB4E0 \uD3EC\uC778\uD2B8",
      Shifter: "\uBCC0\uC2E0\uC790",
      Shillelagh: "\uC274\uB808\uC77C\uB9AC",
      Shimmering: "\uBC18\uC791\uC774\uB294",
      "Shiver Armor": "\uC624\uD55C \uAC11\uC637",
      "Shiver Armor for #s: melee attackers take # cold and a #s chill; #% of blows and missiles miss her": "\uC624\uD55C \uAC11\uC637 {0}\uCD08: \uADFC\uC811 \uACF5\uACA9\uC790\uB294 {1} \uB0C9\uAE30 \uD53C\uD574\uC640 {2}\uCD08 \uC624\uD55C; \uADFC\uC811 \uACF5\uACA9\uACFC \uC6D0\uAC70\uB9AC \uACF5\uACA9 {3}% \uBE57\uB098\uAC10",
      Shivering: "\uC624\uD55C\uC758",
      "Shock Wave": "\uCDA9\uACA9\uD30C",
      "Shock Web": "\uAC10\uC804 \uADF8\uBB3C",
      Shocking: "\uCDA9\uACA9\uC801\uC778",
      "Shogukusha's": "\uC1FC\uAD6C\uCFE0\uC0E4\uC758",
      "Short Battle Bow": "\uC20F \uBC30\uD2C0 \uBCF4\uC6B0",
      "Short Bow": "\uC20F\uBCF4\uC6B0",
      "Short Siege Bow": "\uC20F \uC2DC\uC988 \uBCF4\uC6B0",
      "Short Spear": "\uC20F\uC2A4\uD53C\uC5B4",
      "Short Staff": "\uC20F\uC2A4\uD0DC\uD504",
      "Short Sword": "\uC20F\uC18C\uB4DC",
      "Short War Bow": "\uC20F \uC6CC \uBCF4\uC6B0",
      Shout: "\uC678\uCE68",
      Shouting: "\uC678\uCE58\uB294",
      Shroud: "\uC218\uC758",
      Silver: "\uC740\uC758",
      Simbilan: "\uC2EC\uBE4C\uB780",
      Sin: "\uC8C4\uC545",
      "Since your last visit": "\uB9C8\uC9C0\uB9C9 \uBC29\uBB38 \uC774\uD6C4",
      "SINGLE PLAYER": "\uC2F1\uAE00 \uD50C\uB808\uC774",
      "skeletal mage": "\uD574\uACE8 \uB9C8\uBC95\uC0AC",
      skeleton: "\uD574\uACE8",
      "Skeleton Mastery": "\uD574\uACE8 \uC219\uB828",
      "Skeletons, mages and revives get +#% life and damage": "\uD574\uACE8, \uD574\uACE8 \uB9C8\uBC95\uD559\uC790, \uBD80\uD65C\uC2DC\uD0A8 \uAD34\uBB3C\uC758 \uC0DD\uBA85\uB825\uACFC \uD53C\uD574 +{0}%",
      skill: "\uAE30\uC220",
      "SKILL LIST": "\uAE30\uC220 \uBAA9\uB85D",
      "Skill Tree": "\uAE30\uC220 \uD2B8\uB9AC",
      "Skilled with the spear and the bow, she is a very versatile fighter.": "\uCC3D\uACFC \uD65C\uC5D0 \uB2A5\uC219\uD55C, \uB9E4\uC6B0 \uB2E4\uC7AC\uB2E4\uB2A5\uD55C \uC804\uC0AC\uC785\uB2C8\uB2E4.",
      Skills: "\uAE30\uC220",
      "Skills */*": "\uAE30\uC220 {0}/{1}",
      "Skills recharge #% faster": "\uAE30\uC220 \uC7AC\uC0AC\uC6A9 \uC18D\uB3C4 {0}% \uC99D\uAC00",
      Skin: "\uD53C\uBD80",
      "Skin of the Vipermagi": "\uB3C5\uC0AC\uB9C8\uC220\uC0AC\uC758 \uAC00\uC8FD",
      Skip: "\uC2A4\uD0B5",
      "Skip* \xB7 *": "\uC2A4\uD0B5{0} \xB7 {1}",
      Skull: "\uD574\uACE8",
      "Skull Aegis": "\uD574\uACE8 \uBC29\uD328",
      "Skull Badge": "\uD574\uACE8 \uD718\uC7A5",
      "Skull Band": "\uD574\uACE8 \uBC18\uC9C0",
      "Skull Barb": "\uD574\uACE8 \uBBF8\uB298",
      "Skull Beads": "\uD574\uACE8 \uAD6C\uC2AC",
      "Skull Bite": "\uD574\uACE8 \uC774\uBE68",
      "Skull Blazer": "\uD574\uACE8 \uAC1C\uCC99\uC790",
      "Skull Bludgeon": "\uD574\uACE8 \uACE4\uBD09",
      "Skull Bolt": "\uD574\uACE8 \uD654\uC0B4",
      "Skull Branch": "\uD574\uACE8 \uAC00\uC9C0",
      "Skull Brow": "\uD574\uACE8 \uC774\uB9C8",
      "Skull Buckle": "\uD574\uACE8 \uBC84\uD074",
      "Skull Call": "\uD574\uACE8 \uBD80\uB984",
      "Skull Cap": "\uC2A4\uCEEC \uCEA1",
      "Skull Carapace": "\uD574\uACE8 \uAC11\uAC01",
      "Skull Casque": "\uD574\uACE8 \uD22C\uAD6C",
      "Skull Chant": "\uD574\uACE8 \uCC2C\uAC00",
      "Skull Clasp": "\uD574\uACE8 \uAC78\uC1E0",
      "Skull Claw": "\uD574\uACE8 \uBC1C\uD1B1",
      "Skull Cleaver": "\uD574\uACE8 \uAC00\uB984\uB0A0",
      "Skull Clutches": "\uD574\uACE8 \uB9C8\uC218",
      "Skull Coat": "\uD574\uACE8 \uC678\uD22C",
      "Skull Coil": "\uD574\uACE8 \uACE0\uB9AC",
      "Skull Collar": "\uD574\uACE8 \uBAA9\uD14C",
      "Skull Cord": "\uD574\uACE8 \uB048",
      "Skull Cowl": "\uD574\uACE8 \uC218\uB3C4\uB450\uAC74",
      "Skull Crack": "\uD574\uACE8 \uADE0\uC5F4",
      "Skull Crest": "\uD574\uACE8 \uBB38\uC7A5",
      "Skull Crusher": "\uD574\uACE8 \uBD84\uC1C4\uAE30",
      "Skull Cry": "\uD574\uACE8 \uC6B8\uC74C",
      "Skull Dart": "\uD574\uACE8 \uD22C\uCC3D",
      "Skull Edge": "\uD574\uACE8 \uCE7C\uB0A0",
      "Skull Emblem": "\uD574\uACE8 \uC0C1\uC9D5",
      "Skull Eye": "\uD574\uACE8 \uB208",
      "Skull Fang": "\uD574\uACE8 \uC1A1\uACF3\uB2C8",
      "Skull Finger": "\uD574\uACE8 \uC190\uAC00\uB77D",
      "Skull Fist": "\uD574\uACE8 \uC8FC\uBA39",
      "Skull Fletch": "\uD574\uACE8 \uD654\uC0B4\uAE43",
      "Skull Flight": "\uD574\uACE8 \uBE44\uD589",
      "Skull Glare": "\uD574\uACE8 \uC12C\uAD11",
      "Skull Gnarl": "\uD574\uACE8 \uC639\uC774",
      "Skull Goad": "\uD574\uACE8 \uBAB0\uC774\uB9C9\uB300",
      "Skull Gorget": "\uD574\uACE8 \uBAA9\uAC00\uB9AC\uAC1C",
      "Skull Grip": "\uD574\uACE8 \uC190\uC544\uADC0",
      "Skull Guard": "\uD574\uACE8 \uC218\uD638",
      "Skull Gutter": "\uD574\uACE8 \uC808\uAC1C",
      "Skull Gyre": "\uD574\uACE8 \uC18C\uC6A9\uB3CC\uC774",
      "Skull Hand": "\uD574\uACE8 \uC190",
      "Skull Heart": "\uD574\uACE8 \uC2EC\uC7A5",
      "Skull Hew": "\uD574\uACE8 \uCC0D\uAE30",
      "Skull Hide": "\uD574\uACE8 \uAC00\uC8FD",
      "Skull Hold": "\uD574\uACE8 \uC6C0\uCF1C\uC960",
      "Skull Hood": "\uD574\uACE8 \uB450\uAC74",
      "Skull Horn": "\uD574\uACE8 \uBFD4",
      "Skull Impaler": "\uD574\uACE8 \uAD00\uD1B5\uC790",
      "Skull Jack": "\uD574\uACE8 \uC6C3\uC637",
      "Skull Knell": "\uD574\uACE8 \uC870\uC885",
      "Skull Knot": "\uD574\uACE8 \uB9E4\uB4ED",
      "Skull Knuckle": "\uD574\uACE8 \uC190\uB9C8\uB514",
      "Skull Lance": "\uD574\uACE8 \uCC3D",
      "Skull Lash": "\uD574\uACE8 \uCC44\uCC0D",
      "Skull Lock": "\uD574\uACE8 \uC790\uBB3C\uC1E0",
      "Skull Loop": "\uD574\uACE8 \uD14C",
      "Skull Mallet": "\uD574\uACE8 \uB9DD\uCE58",
      "Skull Mangler": "\uD574\uACE8 \uB09C\uB3C4\uC9C8",
      "Skull Mantle": "\uD574\uACE8 \uB9DD\uD1A0",
      "Skull Mark": "\uD574\uACE8 \uD45C\uC2DD",
      "Skull Mask": "\uD574\uACE8 \uAC00\uBA74",
      "Skull Mauler": "\uD574\uACE8 \uD30C\uAD34\uC790",
      "Skull Nails": "\uD574\uACE8 \uBABB",
      "Skull Necklace": "\uD574\uACE8 \uBAA9\uAC78\uC774",
      "Skull Needle": "\uD574\uACE8 \uBC14\uB298",
      "Skull Nock": "\uD574\uACE8 \uC2DC\uC704\uD648",
      "Skull Noose": "\uD574\uACE8 \uC62C\uAC00\uBBF8",
      "Skull Orb": "\uD574\uACE8 \uBCF4\uC8FC",
      "Skull Pelt": "\uD574\uACE8 \uBAA8\uD53C",
      "Skull Prod": "\uD574\uACE8 \uCC0C\uB974\uAE30",
      "Skull Quarrel": "\uD574\uACE8 \uC1E0\uB1CC\uC0B4",
      "Skull Quill": "\uD574\uACE8 \uAE43",
      "Skull Razor": "\uD574\uACE8 \uBA74\uB3C4\uB0A0",
      "Skull Rend": "\uD574\uACE8 \uCC22\uAE40",
      "Skull Road": "\uD574\uACE8 \uAE38",
      "Skull Saw": "\uD574\uACE8 \uD1B1",
      "Skull Scalpel": "\uD574\uACE8 \uD574\uBD80\uCE7C",
      "Skull Scarab": "\uD574\uACE8 \uD48D\uB385\uC774",
      "Skull Scourge": "\uD574\uACE8 \uC7AC\uC559",
      "Skull Scratch": "\uD574\uACE8 \uD560\uD034\uAE30",
      "Skull Scythe": "\uD574\uACE8 \uB0AB",
      "Skull Shard": "\uD574\uACE8 \uD30C\uD3B8",
      "Skull Shroud": "\uD574\uACE8 \uC218\uC758",
      "Skull Slippers": "\uD574\uACE8 \uB367\uC2E0",
      "Skull Smasher": "\uD574\uACE8 \uBD84\uC1C4\uC790",
      "Skull Song": "\uD574\uACE8 \uB178\uB798",
      "Skull Spell": "\uD574\uACE8 \uC8FC\uBB38",
      "Skull Sphere": "\uD574\uACE8 \uAD6C\uCCB4",
      "Skull Spike": "\uD574\uACE8 \uAC00\uC2DC",
      "Skull Spiral": "\uD574\uACE8 \uB098\uC120",
      "Skull Spire": "\uD574\uACE8 \uCCA8\uD0D1",
      "Skull Splitter": "\uD574\uACE8 \uCABC\uAC1C\uB294\uC790",
      "Skull Spur": "\uD574\uACE8 \uBC15\uCC28",
      "Skull Stake": "\uD574\uACE8 \uB9D0\uB69D",
      "Skull Stalk": "\uD574\uACE8 \uCD94\uC801",
      "Skull Star": "\uD574\uACE8 \uBCC4",
      "Skull Stinger": "\uD574\uACE8 \uB3C5\uCE68",
      "Skull Strap": "\uD574\uACE8 \uB760",
      "Skull Suit": "\uD574\uACE8 \uAC11\uC637",
      "Skull Sunder": "\uD574\uACE8 \uC808\uB2E8",
      "Skull Talisman": "\uD574\uACE8 \uBD80\uC801",
      "Skull Thirst": "\uD574\uACE8 \uAC08\uC99D",
      "Skull Torc": "\uD574\uACE8 \uBAA9\uACE0\uB9AC",
      "Skull Tower": "\uD574\uACE8 \uD0D1",
      "Skull Track": "\uD574\uACE8 \uBC1C\uC790\uAD6D",
      "Skull Trample": "\uD574\uACE8 \uC9D3\uBC1F\uAE30",
      "Skull Turn": "\uD574\uACE8 \uD68C\uC804",
      "Skull Veil": "\uD574\uACE8 \uC7A5\uB9C9",
      "Skull Visage": "\uD574\uACE8 \uC5BC\uAD74",
      "Skull Ward": "\uD574\uACE8 \uBCF4\uD638",
      "Skull Weaver": "\uD574\uACE8 \uC9C1\uC870\uC790",
      "Skull Wing": "\uD574\uACE8 \uB0A0\uAC1C",
      "Skull Wrack": "\uD574\uACE8 \uACE0\uBB38",
      "Skullder's Ire": "\uC2A4\uCFE8\uB354\uC758 \uBD84\uB178",
      "Sky Spirit": "\uC2A4\uCE74\uC774 \uC2A4\uD53C\uB9AC\uD2B8",
      "Slain monsters have a #% chance to leave a healing potion": "\uCC98\uCE58\uD55C \uAD34\uBB3C\uC774 {0}% \uD655\uB960\uB85C \uCE58\uC720 \uBB3C\uC57D\uC744 \uB0A8\uAE40",
      "Slain monsters have a #% chance to leave gold (champions #%), and now and then an item": "\uCC98\uCE58\uD55C \uAD34\uBB3C\uC774 {0}% \uD655\uB960\uB85C \uACE8\uB4DC\uB97C \uB0A8\uAE40 (\uC815\uC608 \uAD34\uBB3C {1}%), \uAC00\uB054 \uC544\uC774\uD15C\uB3C4",
      "Slain Monsters Rest in Peace": "\uCC98\uCE58\uD55C \uAD34\uBB3C\uC774 \uC548\uC2DD\uC5D0 \uB4E6",
      "Slay the act boss to reach the next act": "\uB9C9 \uC6B0\uB450\uBA38\uB9AC\uB97C \uCC98\uCE58\uD558\uBA74 \uB2E4\uC74C \uB9C9\uC73C\uB85C \uC774\uB3D9",
      "Slayer Guard": "\uC2AC\uB808\uC774\uC5B4 \uAC00\uB4DC",
      "Slayer's": "\uD559\uC0B4\uC790\uC758",
      Slime: "\uC810\uC561",
      Slippers: "\uB367\uC2E0",
      "Slow Missiles": "\uD22C\uC0AC\uCCB4 \uAC10\uC18D",
      "Slower Stamina Drain": "\uC9C0\uAD6C\uB825 \uACE0\uAC08 \uC18D\uB3C4 \uAC10\uC18C",
      "Slows Target by": "\uB300\uC0C1 \uAC10\uC18D",
      Sludge: "\uC9C4\uCC3D",
      "Small Charm": "\uC18C\uD615 \uBD80\uC801",
      "Small Crescent": "\uC2A4\uBAB0 \uD06C\uB808\uC13C\uD2B8",
      "Small Shield": "\uC2A4\uBAB0 \uC274\uB4DC",
      Smasher: "\uBD84\uC1C4\uC790",
      Smite: "\uAC15\uD0C0",
      "Smite strikes as in D2: your sword's and your shield's damage together, at your shield bash's pace": "\uAC15\uD0C0\uAC00 D2\uCC98\uB7FC \uCE69\uB2C8\uB2E4: \uAC80\uACFC \uBC29\uD328\uC758 \uD53C\uD574\uB97C \uD569\uCCD0, \uBC29\uD328 \uAC00\uACA9 \uC18D\uB3C4\uB85C",
      "Smoked Sphere": "\uC2A4\uBAA8\uD06C\uB4DC \uC2A4\uD53C\uC5B4",
      Smoking: "\uC5F0\uAE30 \uB098\uB294",
      Smoldering: "\uD0C0\uC624\uB974\uB294",
      "Snake's": "\uBC40\uC758",
      Snakecord: "\uBC40\uB178\uB048",
      "Snapchip Shatter": "\uC2A4\uB0C5\uCE69 \uC100\uD130",
      Snarl: "\uC73C\uB974\uB801",
      Snot: "\uCF67\uBB3C",
      Snowflake: "\uB208\uC1A1\uC774",
      "Software rendering: update your graphics driver": "\uC18C\uD504\uD2B8\uC6E8\uC5B4 \uB80C\uB354\uB9C1 \uC911: \uADF8\uB798\uD53D \uB4DC\uB77C\uC774\uBC84\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uC2ED\uC2DC\uC624",
      "Solar Creeper": "\uD0DC\uC591\uC758 \uB369\uAD74",
      "Sold # for # gold": "{0} \uD310\uB9E4: {1} \uACE8\uB4DC",
      "Sold by the #": "\uD310\uB9E4: {0}",
      "Soldier's": "\uBCD1\uC0AC\uC758",
      Song: "\uB178\uB798",
      Sorceress: "\uC6D0\uC18C\uC220\uC0AC",
      Soul: "\uC601\uD63C",
      "Soul Aegis": "\uC601\uD63C \uBC29\uD328",
      "Soul Badge": "\uC601\uD63C \uD718\uC7A5",
      "Soul Band": "\uC601\uD63C \uBC18\uC9C0",
      "Soul Barb": "\uC601\uD63C \uBBF8\uB298",
      "Soul Beads": "\uC601\uD63C \uAD6C\uC2AC",
      "Soul Bite": "\uC601\uD63C \uC774\uBE68",
      "Soul Blazer": "\uC601\uD63C \uAC1C\uCC99\uC790",
      "Soul Bludgeon": "\uC601\uD63C \uACE4\uBD09",
      "Soul Bolt": "\uC601\uD63C \uD654\uC0B4",
      "Soul Branch": "\uC601\uD63C \uAC00\uC9C0",
      "Soul Brow": "\uC601\uD63C \uC774\uB9C8",
      "Soul Buckle": "\uC601\uD63C \uBC84\uD074",
      "Soul Call": "\uC601\uD63C \uBD80\uB984",
      "Soul Carapace": "\uC601\uD63C \uAC11\uAC01",
      "Soul Casque": "\uC601\uD63C \uD22C\uAD6C",
      "Soul Chant": "\uC601\uD63C \uCC2C\uAC00",
      "Soul Clasp": "\uC601\uD63C \uAC78\uC1E0",
      "Soul Claw": "\uC601\uD63C \uBC1C\uD1B1",
      "Soul Cleaver": "\uC601\uD63C \uAC00\uB984\uB0A0",
      "Soul Clutches": "\uC601\uD63C \uB9C8\uC218",
      "Soul Coat": "\uC601\uD63C \uC678\uD22C",
      "Soul Coil": "\uC601\uD63C \uACE0\uB9AC",
      "Soul Collar": "\uC601\uD63C \uBAA9\uD14C",
      "Soul Cord": "\uC601\uD63C \uB048",
      "Soul Cowl": "\uC601\uD63C \uC218\uB3C4\uB450\uAC74",
      "Soul Crack": "\uC601\uD63C \uADE0\uC5F4",
      "Soul Crest": "\uC601\uD63C \uBB38\uC7A5",
      "Soul Crusher": "\uC601\uD63C \uBD84\uC1C4\uAE30",
      "Soul Cry": "\uC601\uD63C \uC6B8\uC74C",
      "Soul Dart": "\uC601\uD63C \uD22C\uCC3D",
      "Soul Edge": "\uC601\uD63C \uCE7C\uB0A0",
      "Soul Emblem": "\uC601\uD63C \uC0C1\uC9D5",
      "Soul Eye": "\uC601\uD63C \uB208",
      "Soul Fang": "\uC601\uD63C \uC1A1\uACF3\uB2C8",
      "Soul Finger": "\uC601\uD63C \uC190\uAC00\uB77D",
      "Soul Fist": "\uC601\uD63C \uC8FC\uBA39",
      "Soul Fletch": "\uC601\uD63C \uD654\uC0B4\uAE43",
      "Soul Flight": "\uC601\uD63C \uBE44\uD589",
      "Soul Glare": "\uC601\uD63C \uC12C\uAD11",
      "Soul Gnarl": "\uC601\uD63C \uC639\uC774",
      "Soul Goad": "\uC601\uD63C \uBAB0\uC774\uB9C9\uB300",
      "Soul Gorget": "\uC601\uD63C \uBAA9\uAC00\uB9AC\uAC1C",
      "Soul Grip": "\uC601\uD63C \uC190\uC544\uADC0",
      "Soul Guard": "\uC601\uD63C \uC218\uD638",
      "Soul Gutter": "\uC601\uD63C \uC808\uAC1C",
      "Soul Gyre": "\uC601\uD63C \uC18C\uC6A9\uB3CC\uC774",
      "Soul Hand": "\uC601\uD63C \uC190",
      "Soul Heart": "\uC601\uD63C \uC2EC\uC7A5",
      "Soul Hew": "\uC601\uD63C \uCC0D\uAE30",
      "Soul Hide": "\uC601\uD63C \uAC00\uC8FD",
      "Soul Hold": "\uC601\uD63C \uC6C0\uCF1C\uC960",
      "Soul Hood": "\uC601\uD63C \uB450\uAC74",
      "Soul Horn": "\uC601\uD63C \uBFD4",
      "Soul Impaler": "\uC601\uD63C \uAD00\uD1B5\uC790",
      "Soul Jack": "\uC601\uD63C \uC6C3\uC637",
      "Soul Knell": "\uC601\uD63C \uC870\uC885",
      "Soul Knot": "\uC601\uD63C \uB9E4\uB4ED",
      "Soul Knuckle": "\uC601\uD63C \uC190\uB9C8\uB514",
      "Soul Lance": "\uC601\uD63C \uCC3D",
      "Soul Lash": "\uC601\uD63C \uCC44\uCC0D",
      "Soul Lock": "\uC601\uD63C \uC790\uBB3C\uC1E0",
      "Soul Loop": "\uC601\uD63C \uD14C",
      "Soul Mallet": "\uC601\uD63C \uB9DD\uCE58",
      "Soul Mangler": "\uC601\uD63C \uB09C\uB3C4\uC9C8",
      "Soul Mantle": "\uC601\uD63C \uB9DD\uD1A0",
      "Soul Mark": "\uC601\uD63C \uD45C\uC2DD",
      "Soul Mask": "\uC601\uD63C \uAC00\uBA74",
      "Soul Mauler": "\uC601\uD63C \uD30C\uAD34\uC790",
      "Soul Nails": "\uC601\uD63C \uBABB",
      "Soul Necklace": "\uC601\uD63C \uBAA9\uAC78\uC774",
      "Soul Needle": "\uC601\uD63C \uBC14\uB298",
      "Soul Nock": "\uC601\uD63C \uC2DC\uC704\uD648",
      "Soul Noose": "\uC601\uD63C \uC62C\uAC00\uBBF8",
      "Soul Orb": "\uC601\uD63C \uBCF4\uC8FC",
      "Soul Pelt": "\uC601\uD63C \uBAA8\uD53C",
      "Soul Prod": "\uC601\uD63C \uCC0C\uB974\uAE30",
      "Soul Quarrel": "\uC601\uD63C \uC1E0\uB1CC\uC0B4",
      "Soul Quill": "\uC601\uD63C \uAE43",
      "Soul Razor": "\uC601\uD63C \uBA74\uB3C4\uB0A0",
      "Soul Rend": "\uC601\uD63C \uCC22\uAE40",
      "Soul Road": "\uC601\uD63C \uAE38",
      "Soul Saw": "\uC601\uD63C \uD1B1",
      "Soul Scalpel": "\uC601\uD63C \uD574\uBD80\uCE7C",
      "Soul Scarab": "\uC601\uD63C \uD48D\uB385\uC774",
      "Soul Scourge": "\uC601\uD63C \uC7AC\uC559",
      "Soul Scratch": "\uC601\uD63C \uD560\uD034\uAE30",
      "Soul Scythe": "\uC601\uD63C \uB0AB",
      "Soul Shard": "\uC601\uD63C \uD30C\uD3B8",
      "Soul Shroud": "\uC601\uD63C \uC218\uC758",
      "Soul Slippers": "\uC601\uD63C \uB367\uC2E0",
      "Soul Smasher": "\uC601\uD63C \uBD84\uC1C4\uC790",
      "Soul Song": "\uC601\uD63C \uB178\uB798",
      "Soul Spell": "\uC601\uD63C \uC8FC\uBB38",
      "Soul Sphere": "\uC601\uD63C \uAD6C\uCCB4",
      "Soul Spike": "\uC601\uD63C \uAC00\uC2DC",
      "Soul Spiral": "\uC601\uD63C \uB098\uC120",
      "Soul Spire": "\uC601\uD63C \uCCA8\uD0D1",
      "Soul Splitter": "\uC601\uD63C \uCABC\uAC1C\uB294\uC790",
      "Soul Spur": "\uC601\uD63C \uBC15\uCC28",
      "Soul Stake": "\uC601\uD63C \uB9D0\uB69D",
      "Soul Stalk": "\uC601\uD63C \uCD94\uC801",
      "Soul Star": "\uC601\uD63C \uBCC4",
      "Soul Stinger": "\uC601\uD63C \uB3C5\uCE68",
      "Soul Strap": "\uC601\uD63C \uB760",
      "Soul Suit": "\uC601\uD63C \uAC11\uC637",
      "Soul Sunder": "\uC601\uD63C \uC808\uB2E8",
      "Soul Talisman": "\uC601\uD63C \uBD80\uC801",
      "Soul Thirst": "\uC601\uD63C \uAC08\uC99D",
      "Soul Torc": "\uC601\uD63C \uBAA9\uACE0\uB9AC",
      "Soul Tower": "\uC601\uD63C \uD0D1",
      "Soul Track": "\uC601\uD63C \uBC1C\uC790\uAD6D",
      "Soul Trample": "\uC601\uD63C \uC9D3\uBC1F\uAE30",
      "Soul Turn": "\uC601\uD63C \uD68C\uC804",
      "Soul Veil": "\uC601\uD63C \uC7A5\uB9C9",
      "Soul Visage": "\uC601\uD63C \uC5BC\uAD74",
      "Soul Ward": "\uC601\uD63C \uBCF4\uD638",
      "Soul Weaver": "\uC601\uD63C \uC9C1\uC870\uC790",
      "Soul Wing": "\uC601\uD63C \uB0A0\uAC1C",
      "Soul Wrack": "\uC601\uD63C \uACE0\uBB38",
      Soulflay: "\uC601\uD63C\uB09C\uB3C4",
      Sound: "\uD6A8\uACFC\uC74C",
      "Sound off": "\uC18C\uB9AC \uB054",
      "Sound on": "\uC18C\uB9AC \uCF2C",
      Sounding: "\uC6B8\uB9AC\uB294",
      spark: "\uBD88\uAF43",
      Sparking: "\uBD88\uAF43 \uD280\uB294",
      "Sparking Mail": "\uBD88\uAF43 \uD280\uB294 \uC0AC\uC2AC \uAC11\uC637",
      "Sparkling Ball": "\uC2A4\uD30C\uD074\uB9C1 \uBCFC",
      Sparroweye: "\uCC38\uC0C8\uB208\uC758",
      Spawn: "\uC885\uC790",
      Spear: "\uC2A4\uD53C\uC5B4",
      "Spear Mastery": "\uCC3D \uC219\uB828",
      "Spearmaiden's": "\uCC3D \uC5EC\uC804\uC0AC\uC758",
      "Spectral Hit": "\uD63C\uB839 \uD0C0\uACA9",
      "Spectral Shard": "\uD63C\uB839 \uD30C\uD3B8",
      Spell: "\uC8FC\uBB38",
      Spells: "\uC8FC\uBB38",
      "Spells, auras and summons don't use it": "\uC8FC\uBB38, \uC624\uB77C, \uC18C\uD658\uC218\uC5D0\uB294 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC74C",
      Sphere: "\uAD6C\uCCB4",
      Spiculum: "\uC2A4\uD53C\uD058\uB7FC",
      "Spider Bow": "\uC2A4\uD30C\uC774\uB354 \uBCF4\uC6B0",
      "Spider Forest": "\uAC70\uBBF8 \uC232",
      "Spiderweb Sash": "\uC2A4\uD30C\uC774\uB354\uC6F9 \uC0C8\uC2DC",
      Spike: "\uAC00\uC2DC",
      Spine: "\uCC99\uCD94",
      Spineripper: "\uCC99\uCD94\uC801\uCD9C\uC790",
      spiral: "\uD68C\uC804\uD574",
      spirals: "\uD68C\uC804\uD574",
      Spire: "\uCCA8\uD0D1",
      "Spire of Honor": "\uBA85\uC608\uC758 \uCCA8\uD0D1",
      "Spire of Lazarus": "\uB77C\uC790\uB8E8\uC2A4\uC758 \uCCA8\uD0D1",
      "Spired Helm": "\uC2A4\uD30C\uC774\uC5B4\uB4DC \uD5EC\uB984",
      Spirit: "\uD63C\uB839",
      "Spirit Aegis": "\uD63C\uB839 \uBC29\uD328",
      "Spirit Badge": "\uD63C\uB839 \uD718\uC7A5",
      "Spirit Band": "\uD63C\uB839 \uBC18\uC9C0",
      "Spirit Barb": "\uD63C\uB839 \uBBF8\uB298",
      "Spirit Beads": "\uD63C\uB839 \uAD6C\uC2AC",
      "Spirit Bite": "\uD63C\uB839 \uC774\uBE68",
      "Spirit Blazer": "\uD63C\uB839 \uAC1C\uCC99\uC790",
      "Spirit Bludgeon": "\uD63C\uB839 \uACE4\uBD09",
      "Spirit Bolt": "\uD63C\uB839 \uD654\uC0B4",
      "Spirit Branch": "\uD63C\uB839 \uAC00\uC9C0",
      "Spirit Brow": "\uD63C\uB839 \uC774\uB9C8",
      "Spirit Buckle": "\uD63C\uB839 \uBC84\uD074",
      "Spirit Call": "\uD63C\uB839 \uBD80\uB984",
      "Spirit Carapace": "\uD63C\uB839 \uAC11\uAC01",
      "Spirit Casque": "\uD63C\uB839 \uD22C\uAD6C",
      "Spirit Chant": "\uD63C\uB839 \uCC2C\uAC00",
      "Spirit Clasp": "\uD63C\uB839 \uAC78\uC1E0",
      "Spirit Claw": "\uD63C\uB839 \uBC1C\uD1B1",
      "Spirit Cleaver": "\uD63C\uB839 \uAC00\uB984\uB0A0",
      "Spirit Clutches": "\uD63C\uB839 \uB9C8\uC218",
      "Spirit Coat": "\uD63C\uB839 \uC678\uD22C",
      "Spirit Coil": "\uD63C\uB839 \uACE0\uB9AC",
      "Spirit Collar": "\uD63C\uB839 \uBAA9\uD14C",
      "Spirit Cord": "\uD63C\uB839 \uB048",
      "Spirit Cowl": "\uD63C\uB839 \uC218\uB3C4\uB450\uAC74",
      "Spirit Crack": "\uD63C\uB839 \uADE0\uC5F4",
      "Spirit Crest": "\uD63C\uB839 \uBB38\uC7A5",
      "Spirit Crusher": "\uD63C\uB839 \uBD84\uC1C4\uAE30",
      "Spirit Cry": "\uD63C\uB839 \uC6B8\uC74C",
      "Spirit Dart": "\uD63C\uB839 \uD22C\uCC3D",
      "Spirit Edge": "\uD63C\uB839 \uCE7C\uB0A0",
      "Spirit Emblem": "\uD63C\uB839 \uC0C1\uC9D5",
      "Spirit Eye": "\uD63C\uB839 \uB208",
      "Spirit Fang": "\uD63C\uB839 \uC1A1\uACF3\uB2C8",
      "Spirit Finger": "\uD63C\uB839 \uC190\uAC00\uB77D",
      "Spirit Fist": "\uD63C\uB839 \uC8FC\uBA39",
      "Spirit Fletch": "\uD63C\uB839 \uD654\uC0B4\uAE43",
      "Spirit Flight": "\uD63C\uB839 \uBE44\uD589",
      "Spirit Glare": "\uD63C\uB839 \uC12C\uAD11",
      "Spirit Gnarl": "\uD63C\uB839 \uC639\uC774",
      "Spirit Goad": "\uD63C\uB839 \uBAB0\uC774\uB9C9\uB300",
      "Spirit Gorget": "\uD63C\uB839 \uBAA9\uAC00\uB9AC\uAC1C",
      "Spirit Grip": "\uD63C\uB839 \uC190\uC544\uADC0",
      "Spirit Guard": "\uD63C\uB839 \uC218\uD638",
      "Spirit Gutter": "\uD63C\uB839 \uC808\uAC1C",
      "Spirit Gyre": "\uD63C\uB839 \uC18C\uC6A9\uB3CC\uC774",
      "Spirit Hand": "\uD63C\uB839 \uC190",
      "Spirit Heart": "\uD63C\uB839 \uC2EC\uC7A5",
      "Spirit Hew": "\uD63C\uB839 \uCC0D\uAE30",
      "Spirit Hide": "\uD63C\uB839 \uAC00\uC8FD",
      "Spirit Hold": "\uD63C\uB839 \uC6C0\uCF1C\uC960",
      "Spirit Hood": "\uD63C\uB839 \uB450\uAC74",
      "Spirit Horn": "\uD63C\uB839 \uBFD4",
      "Spirit Impaler": "\uD63C\uB839 \uAD00\uD1B5\uC790",
      "Spirit Jack": "\uD63C\uB839 \uC6C3\uC637",
      "Spirit Keeper": "\uC601\uD63C \uC218\uD638\uC790",
      "Spirit Knell": "\uD63C\uB839 \uC870\uC885",
      "Spirit Knot": "\uD63C\uB839 \uB9E4\uB4ED",
      "Spirit Knuckle": "\uD63C\uB839 \uC190\uB9C8\uB514",
      "Spirit Lance": "\uD63C\uB839 \uCC3D",
      "Spirit Lash": "\uD63C\uB839 \uCC44\uCC0D",
      "Spirit Lock": "\uD63C\uB839 \uC790\uBB3C\uC1E0",
      "Spirit Loop": "\uD63C\uB839 \uD14C",
      "Spirit Mallet": "\uD63C\uB839 \uB9DD\uCE58",
      "Spirit Mangler": "\uD63C\uB839 \uB09C\uB3C4\uC9C8",
      "Spirit Mantle": "\uD63C\uB839 \uB9DD\uD1A0",
      "Spirit Mark": "\uD63C\uB839 \uD45C\uC2DD",
      "Spirit Mask": "\uC2A4\uD53C\uB9AC\uD2B8 \uB9C8\uC2A4\uD06C",
      "Spirit Mauler": "\uD63C\uB839 \uD30C\uAD34\uC790",
      "Spirit Nails": "\uD63C\uB839 \uBABB",
      "Spirit Necklace": "\uD63C\uB839 \uBAA9\uAC78\uC774",
      "Spirit Needle": "\uD63C\uB839 \uBC14\uB298",
      "Spirit Nock": "\uD63C\uB839 \uC2DC\uC704\uD648",
      "Spirit Noose": "\uD63C\uB839 \uC62C\uAC00\uBBF8",
      "Spirit of Barbs": "\uAC00\uC2DC\uC758 \uC601\uD63C",
      "Spirit of Barbs: monsters that strike you take back #% of the damage, plus Wolverine's boons": "\uAC00\uC2DC\uC758 \uC601\uD63C: \uB2F9\uC2E0\uC744 \uACF5\uACA9\uD55C \uAD34\uBB3C\uC774 \uD53C\uD574\uC758 {0}%\uB97C \uB3CC\uB824\uBC1B\uC74C, \uC6B8\uBC84\uB9B0\uC758 \uC2EC\uC7A5 \uD6A8\uACFC \uD3EC\uD568",
      "Spirit Orb": "\uD63C\uB839 \uBCF4\uC8FC",
      "Spirit Pelt": "\uD63C\uB839 \uBAA8\uD53C",
      "Spirit Prod": "\uD63C\uB839 \uCC0C\uB974\uAE30",
      "Spirit Quarrel": "\uD63C\uB839 \uC1E0\uB1CC\uC0B4",
      "Spirit Quill": "\uD63C\uB839 \uAE43",
      "Spirit Razor": "\uD63C\uB839 \uBA74\uB3C4\uB0A0",
      "Spirit Rend": "\uD63C\uB839 \uCC22\uAE40",
      "Spirit Road": "\uD63C\uB839 \uAE38",
      "Spirit Saw": "\uD63C\uB839 \uD1B1",
      "Spirit Scalpel": "\uD63C\uB839 \uD574\uBD80\uCE7C",
      "Spirit Scarab": "\uD63C\uB839 \uD48D\uB385\uC774",
      "Spirit Scourge": "\uD63C\uB839 \uC7AC\uC559",
      "Spirit Scratch": "\uD63C\uB839 \uD560\uD034\uAE30",
      "Spirit Scythe": "\uD63C\uB839 \uB0AB",
      "Spirit Shard": "\uD63C\uB839 \uD30C\uD3B8",
      "Spirit Shroud": "\uD63C\uB839 \uC218\uC758",
      "Spirit Slippers": "\uD63C\uB839 \uB367\uC2E0",
      "Spirit Smasher": "\uD63C\uB839 \uBD84\uC1C4\uC790",
      "Spirit Song": "\uD63C\uB839 \uB178\uB798",
      "Spirit Spell": "\uD63C\uB839 \uC8FC\uBB38",
      "Spirit Sphere": "\uD63C\uB839 \uAD6C\uCCB4",
      "Spirit Spike": "\uD63C\uB839 \uAC00\uC2DC",
      "Spirit Spiral": "\uD63C\uB839 \uB098\uC120",
      "Spirit Spire": "\uD63C\uB839 \uCCA8\uD0D1",
      "Spirit Splitter": "\uD63C\uB839 \uCABC\uAC1C\uB294\uC790",
      "Spirit Spur": "\uD63C\uB839 \uBC15\uCC28",
      "Spirit Stake": "\uD63C\uB839 \uB9D0\uB69D",
      "Spirit Stalk": "\uD63C\uB839 \uCD94\uC801",
      "Spirit Star": "\uD63C\uB839 \uBCC4",
      "Spirit Stinger": "\uD63C\uB839 \uB3C5\uCE68",
      "Spirit Strap": "\uD63C\uB839 \uB760",
      "Spirit Suit": "\uD63C\uB839 \uAC11\uC637",
      "Spirit Sunder": "\uD63C\uB839 \uC808\uB2E8",
      "Spirit Talisman": "\uD63C\uB839 \uBD80\uC801",
      "Spirit Thirst": "\uD63C\uB839 \uAC08\uC99D",
      "Spirit Torc": "\uD63C\uB839 \uBAA9\uACE0\uB9AC",
      "Spirit Tower": "\uD63C\uB839 \uD0D1",
      "Spirit Track": "\uD63C\uB839 \uBC1C\uC790\uAD6D",
      "Spirit Trample": "\uD63C\uB839 \uC9D3\uBC1F\uAE30",
      "Spirit Turn": "\uD63C\uB839 \uD68C\uC804",
      "Spirit Veil": "\uD63C\uB839 \uC7A5\uB9C9",
      "Spirit Visage": "\uD63C\uB839 \uC5BC\uAD74",
      "Spirit Ward": "\uD63C\uB839 \uD638\uC2E0\uBD80",
      "Spirit Weaver": "\uD63C\uB839 \uC9C1\uC870\uC790",
      "Spirit Wing": "\uD63C\uB839 \uB0A0\uAC1C",
      "Spirit Wrack": "\uD63C\uB839 \uACE0\uBB38",
      "Spirits' boons and vines' meals are #% stronger, creepers' poison too": "\uC601\uD63C\uC758 \uD6A8\uACFC\uC640 \uB369\uAD74\uC758 \uD68C\uBCF5\uC774 {0}% \uAC15\uD574\uC9D0, \uB9F9\uB3C5 \uB369\uAD74\uC758 \uB3C5\uB3C4",
      Spiritual: "\uC601\uC801\uC778",
      "Splint Mail": "\uC2A4\uD50C\uB9B0\uD2B8 \uBA54\uC77C",
      Splitter: "\uCABC\uAC1C\uB294\uC790",
      Spur: "\uBC15\uCC28",
      Square: "\u25A1\uBC84\uD2BC",
      "Sszark the Burning": "\uBD88\uD0C0\uB294 \uC2A4\uC790\uD06C",
      "Stab # within reach, # damage and # poison over #s": "\uBC94\uC704 \uB0B4 \uAD34\uBB3C {0}\uB9C8\uB9AC\uB97C \uCC0C\uB984, {1} \uD53C\uD574\uC640 {3}\uCD08\uAC04 {2} \uB3C5 \uD53C\uD574",
      "Stag Bow": "\uC2A4\uD0DC\uADF8 \uBCF4\uC6B0",
      Stake: "\uB9D0\uB69D",
      Stalagmite: "\uC2A4\uD0C8\uB77C\uADF8\uB9C8\uC774\uD2B8",
      Stalk: "\uCD94\uC801",
      Star: "\uBCC4",
      "Start a new run (Enter)": "\uC0C8 \uAC8C\uC784 \uC2DC\uC791 (Enter)",
      Stash: "\uBCF4\uAD00\uD568",
      "Stat Points": "\uB0A8\uC740 \uB2A5\uB825\uCE58",
      "Stat points remaining: *": "\uB0A8\uC740 \uB2A5\uB825\uCE58: {0}",
      Static: "\uC815\uC804\uAE30\uC758",
      "Static Field": "\uC804\uC790\uAE30\uC7A5",
      Stealskull: "\uB450\uAC1C\uACE8 \uB3C4\uB451",
      Steel: "\uAC15\uCCA0\uC758",
      "Steel Pillar": "\uAC15\uCCA0 \uAE30\uB465",
      Steelclash: "\uAC15\uCCA0\uACA9\uB3CC",
      Steelrend: "\uAC15\uCCA0\uCC22\uAC1C",
      "STICK DEAD ZONE": "\uC2A4\uD2F1 \uB370\uB4DC\uC874",
      Stiletto: "\uC2A4\uD2F8\uB808\uD1A0",
      Stinger: "\uB3C5\uCE68",
      Stone: "\uB3CC",
      "Stone Skin": "\uB3CC \uD53C\uBD80",
      Stoneraven: "\uB3CC\uAE4C\uB9C8\uADC0",
      "Stony Field": "\uBC14\uC704 \uBC8C\uD310",
      Storm: "\uD3ED\uD48D",
      "Storm Aegis": "\uD3ED\uD48D \uBC29\uD328",
      "Storm Badge": "\uD3ED\uD48D \uD718\uC7A5",
      "Storm Band": "\uD3ED\uD48D \uBC18\uC9C0",
      "Storm Barb": "\uD3ED\uD48D \uBBF8\uB298",
      "Storm Beads": "\uD3ED\uD48D \uAD6C\uC2AC",
      "Storm Bite": "\uD3ED\uD48D \uC774\uBE68",
      "Storm Blazer": "\uD3ED\uD48D \uAC1C\uCC99\uC790",
      "Storm Bludgeon": "\uD3ED\uD48D \uACE4\uBD09",
      "Storm Bolt": "\uD3ED\uD48D \uD654\uC0B4",
      "Storm Branch": "\uD3ED\uD48D \uAC00\uC9C0",
      "Storm Brow": "\uD3ED\uD48D \uC774\uB9C8",
      "Storm Buckle": "\uD3ED\uD48D \uBC84\uD074",
      "Storm Call": "\uD3ED\uD48D \uBD80\uB984",
      "Storm Carapace": "\uD3ED\uD48D \uAC11\uAC01",
      "Storm Casque": "\uD3ED\uD48D \uD22C\uAD6C",
      "Storm Chant": "\uD3ED\uD48D \uCC2C\uAC00",
      "Storm Clasp": "\uD3ED\uD48D \uAC78\uC1E0",
      "Storm Claw": "\uD3ED\uD48D \uBC1C\uD1B1",
      "Storm Cleaver": "\uD3ED\uD48D \uAC00\uB984\uB0A0",
      "Storm Clutches": "\uD3ED\uD48D \uB9C8\uC218",
      "Storm Coat": "\uD3ED\uD48D \uC678\uD22C",
      "Storm Coil": "\uD3ED\uD48D \uACE0\uB9AC",
      "Storm Collar": "\uD3ED\uD48D \uBAA9\uD14C",
      "Storm Cord": "\uD3ED\uD48D \uB048",
      "Storm Cowl": "\uD3ED\uD48D \uC218\uB3C4\uB450\uAC74",
      "Storm Crack": "\uD3ED\uD48D \uADE0\uC5F4",
      "Storm Crest": "\uD3ED\uD48D \uBB38\uC7A5",
      "Storm Crusher": "\uD3ED\uD48D \uBD84\uC1C4\uAE30",
      "Storm Cry": "\uD3ED\uD48D \uC6B8\uC74C",
      "Storm Dart": "\uD3ED\uD48D \uD22C\uCC3D",
      "Storm Edge": "\uD3ED\uD48D \uCE7C\uB0A0",
      "Storm Emblem": "\uD3ED\uD48D \uC0C1\uC9D5",
      "Storm Eye": "\uD3ED\uD48D \uB208",
      "Storm Fang": "\uD3ED\uD48D \uC1A1\uACF3\uB2C8",
      "Storm Finger": "\uD3ED\uD48D \uC190\uAC00\uB77D",
      "Storm Fist": "\uD3ED\uD48D \uC8FC\uBA39",
      "Storm Fletch": "\uD3ED\uD48D \uD654\uC0B4\uAE43",
      "Storm Flight": "\uD3ED\uD48D \uBE44\uD589",
      "Storm Glare": "\uD3ED\uD48D \uC12C\uAD11",
      "Storm Gnarl": "\uD3ED\uD48D \uC639\uC774",
      "Storm Goad": "\uD3ED\uD48D \uBAB0\uC774\uB9C9\uB300",
      "Storm Gorget": "\uD3ED\uD48D \uBAA9\uAC00\uB9AC\uAC1C",
      "Storm Grip": "\uD3ED\uD48D \uC190\uC544\uADC0",
      "Storm Guard": "\uD3ED\uD48D \uC218\uD638",
      "Storm Gutter": "\uD3ED\uD48D \uC808\uAC1C",
      "Storm Gyre": "\uD3ED\uD48D \uC18C\uC6A9\uB3CC\uC774",
      "Storm Hand": "\uD3ED\uD48D \uC190",
      "Storm Heart": "\uD3ED\uD48D \uC2EC\uC7A5",
      "Storm Hew": "\uD3ED\uD48D \uCC0D\uAE30",
      "Storm Hide": "\uD3ED\uD48D \uAC00\uC8FD",
      "Storm Hold": "\uD3ED\uD48D \uC6C0\uCF1C\uC960",
      "Storm Hood": "\uD3ED\uD48D \uB450\uAC74",
      "Storm Horn": "\uD3ED\uD48D \uBFD4",
      "Storm Impaler": "\uD3ED\uD48D \uAD00\uD1B5\uC790",
      "Storm Jack": "\uD3ED\uD48D \uC6C3\uC637",
      "Storm Knell": "\uD3ED\uD48D \uC870\uC885",
      "Storm Knot": "\uD3ED\uD48D \uB9E4\uB4ED",
      "Storm Knuckle": "\uD3ED\uD48D \uC190\uB9C8\uB514",
      "Storm Lance": "\uD3ED\uD48D \uCC3D",
      "Storm Lash": "\uD3ED\uD48D \uCC44\uCC0D",
      "Storm Lock": "\uD3ED\uD48D \uC790\uBB3C\uC1E0",
      "Storm Loop": "\uD3ED\uD48D \uD14C",
      "Storm Mallet": "\uD3ED\uD48D \uB9DD\uCE58",
      "Storm Mangler": "\uD3ED\uD48D \uB09C\uB3C4\uC9C8",
      "Storm Mantle": "\uD3ED\uD48D \uB9DD\uD1A0",
      "Storm Mark": "\uD3ED\uD48D \uD45C\uC2DD",
      "Storm Mask": "\uD3ED\uD48D \uAC00\uBA74",
      "Storm Mauler": "\uD3ED\uD48D \uD30C\uAD34\uC790",
      "Storm Nails": "\uD3ED\uD48D \uBABB",
      "Storm Necklace": "\uD3ED\uD48D \uBAA9\uAC78\uC774",
      "Storm Needle": "\uD3ED\uD48D \uBC14\uB298",
      "Storm Nock": "\uD3ED\uD48D \uC2DC\uC704\uD648",
      "Storm Noose": "\uD3ED\uD48D \uC62C\uAC00\uBBF8",
      "Storm Orb": "\uD3ED\uD48D \uBCF4\uC8FC",
      "Storm Pelt": "\uD3ED\uD48D \uBAA8\uD53C",
      "Storm Prod": "\uD3ED\uD48D \uCC0C\uB974\uAE30",
      "Storm Quarrel": "\uD3ED\uD48D \uC1E0\uB1CC\uC0B4",
      "Storm Quill": "\uD3ED\uD48D \uAE43",
      "Storm Razor": "\uD3ED\uD48D \uBA74\uB3C4\uB0A0",
      "Storm Rend": "\uD3ED\uD48D \uCC22\uAE40",
      "Storm Road": "\uD3ED\uD48D \uAE38",
      "Storm Saw": "\uD3ED\uD48D \uD1B1",
      "Storm Scalpel": "\uD3ED\uD48D \uD574\uBD80\uCE7C",
      "Storm Scarab": "\uD3ED\uD48D \uD48D\uB385\uC774",
      "Storm Scourge": "\uD3ED\uD48D \uC7AC\uC559",
      "Storm Scratch": "\uD3ED\uD48D \uD560\uD034\uAE30",
      "Storm Scythe": "\uD3ED\uD48D \uB0AB",
      "Storm Shard": "\uD3ED\uD48D \uD30C\uD3B8",
      "Storm Shroud": "\uD3ED\uD48D \uC218\uC758",
      "Storm Slippers": "\uD3ED\uD48D \uB367\uC2E0",
      "Storm Smasher": "\uD3ED\uD48D \uBD84\uC1C4\uC790",
      "Storm Song": "\uD3ED\uD48D \uB178\uB798",
      "Storm Spell": "\uD3ED\uD48D \uC8FC\uBB38",
      "Storm Sphere": "\uD3ED\uD48D \uAD6C\uCCB4",
      "Storm Spike": "\uD3ED\uD48D \uAC00\uC2DC",
      "Storm Spiral": "\uD3ED\uD48D \uB098\uC120",
      "Storm Spire": "\uD3ED\uD48D \uCCA8\uD0D1",
      "Storm Splitter": "\uD3ED\uD48D \uCABC\uAC1C\uB294\uC790",
      "Storm Spur": "\uD3ED\uD48D \uBC15\uCC28",
      "Storm Stake": "\uD3ED\uD48D \uB9D0\uB69D",
      "Storm Stalk": "\uD3ED\uD48D \uCD94\uC801",
      "Storm Star": "\uD3ED\uD48D \uBCC4",
      "Storm Stinger": "\uD3ED\uD48D \uB3C5\uCE68",
      "Storm Strap": "\uD3ED\uD48D \uB760",
      "Storm Suit": "\uD3ED\uD48D \uAC11\uC637",
      "Storm Sunder": "\uD3ED\uD48D \uC808\uB2E8",
      "Storm Talisman": "\uD3ED\uD48D \uBD80\uC801",
      "Storm Thirst": "\uD3ED\uD48D \uAC08\uC99D",
      "Storm Torc": "\uD3ED\uD48D \uBAA9\uACE0\uB9AC",
      "Storm Tower": "\uD3ED\uD48D \uD0D1",
      "Storm Track": "\uD3ED\uD48D \uBC1C\uC790\uAD6D",
      "Storm Trample": "\uD3ED\uD48D \uC9D3\uBC1F\uAE30",
      "Storm Turn": "\uD3ED\uD48D \uD68C\uC804",
      "Storm Veil": "\uD3ED\uD48D \uC7A5\uB9C9",
      "Storm Visage": "\uD3ED\uD48D \uC5BC\uAD74",
      "Storm Ward": "\uD3ED\uD48D \uBCF4\uD638",
      "Storm Weaver": "\uD3ED\uD48D \uC9C1\uC870\uC790",
      "Storm Wing": "\uD3ED\uD48D \uB0A0\uAC1C",
      "Storm Wrack": "\uD3ED\uD48D \uACE0\uBB38",
      Stormeye: "\uD3ED\uD48D\uB208",
      Stormguild: "\uD3ED\uD48D\uAE38\uB4DC",
      Stormspike: "\uD3ED\uD48D\uC410\uAE30",
      Stormstrike: "\uD3ED\uD48D\uACA9",
      Stormtree: "\uC2A4\uD1B0\uD2B8\uB9AC",
      Strafe: "\uC18D\uC0AC",
      Strange: "\uC774\uC0C1\uD55C",
      Strap: "\uB760",
      strength: "\uD798",
      Strong: "\uAC15\uC778\uD55C",
      "Studded Leather": "\uC2A4\uD130\uB514\uB4DC \uB808\uB354",
      Stun: "\uAE30\uC808",
      Sturdy: "\uD2BC\uD2BC\uD55C",
      "Stygian Pilum": "\uC2A4\uD2F0\uC9C0\uC5B8 \uD544\uB7FC",
      "Succubus Skull": "\uC368\uD050\uBC84\uC2A4 \uC2A4\uCEEC",
      "Suicide Branch": "\uC790\uD574\uC758 \uAC00\uC9C0",
      Suit: "\uAC11\uC637",
      "Summon Dire Wolf": "\uAD11\uD3EC\uD55C \uB291\uB300 \uC18C\uD658",
      "Summon Grizzly": "\uD68C\uC0C9\uACF0 \uC18C\uD658",
      "Summon Resist": "\uC18C\uD658\uC218 \uC800\uD56D",
      "Summon Spirit Wolf": "\uC601\uD63C \uB291\uB300 \uC18C\uD658",
      "Summoner's": "\uC18C\uD658\uC0AC\uC758",
      Summoning: "\uC18C\uD658",
      "Summoning Skills": "\uC18C\uD658 \uAE30\uC220",
      "Summoning undead minions and cursing his enemies are his specialties.": "\uC5B8\uB370\uB4DC \uD558\uC218\uC778\uC744 \uC18C\uD658\uD558\uACE0 \uC801\uC5D0\uAC8C \uC800\uC8FC\uB97C \uAC70\uB294 \uB370 \uB2A5\uD569\uB2C8\uB2E4.",
      "Summons take #% less damage from monsters whose blows carry fire, cold, lightning or poison": "\uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB3C5 \uACF5\uACA9\uC744 \uD558\uB294 \uAD34\uBB3C\uC5D0\uAC8C\uC11C \uC18C\uD658\uC218\uAC00 \uBC1B\uB294 \uD53C\uD574 {0}% \uAC10\uC18C",
      "Sun Spirit": "\uC120 \uC2A4\uD53C\uB9AC\uD2B8",
      Sunder: "\uC808\uB2E8",
      Survivor: "\uC0DD\uC874\uC790",
      Suwayyah: "\uC218\uC6E8\uC774\uC57C",
      "swift blow": "\uC2E0\uC18D\uD55C \uD0C0\uACA9",
      "Swirling Crystal": "\uC2A4\uC6D4\uB9C1 \uD06C\uB9AC\uC2A4\uD0C8",
      "Sword Mastery": "\uAC80 \uC219\uB828",
      "Synergies: +*% damage": "\uC2DC\uB108\uC9C0: \uD53C\uD574 +{0}%",
      Tabar: "\uD0C0\uBC14",
      "Take #% less damage": "\uBC1B\uB294 \uD53C\uD574 {0}% \uAC10\uC18C",
      "Take #% less damage; poison and chill wear off #% faster": "\uBC1B\uB294 \uD53C\uD574 {0}% \uAC10\uC18C; \uB3C5\uACFC \uC624\uD55C \uC2DC\uAC04 {1}% \uB2E8\uCD95",
      "Taken:": "\uD68C\uC218:",
      "Tal Rasha's Tomb": "\uD0C8 \uB77C\uC0E4\uC758 \uBB34\uB364",
      "Talic the Defender": "\uC218\uD638\uC790 \uD0C8\uB9AD",
      Talisman: "\uBD80\uC801",
      "Tamoe Highland": "\uD0C0\uBAA8 \uACE0\uC6D0",
      Tangerine: "\uADE4\uC0C9",
      Tap: "\uD130\uCE58",
      "Tap a card to pick it": "\uCE74\uB4DC\uB97C \uD130\uCE58\uD558\uC5EC \uC120\uD0DD",
      "Tap a ware to see it": "\uBB3C\uAC74\uC744 \uD130\uCE58\uD558\uC5EC \uBCF4\uAE30",
      "Tap a ware, then tap it again": "\uBB3C\uAC74\uC744 \uD130\uCE58\uD55C \uB4A4 \uB2E4\uC2DC \uD130\uCE58",
      "Tap again for every skill": "\uB2E4\uC2DC \uD0ED\uD558\uBA74 \uBAA8\uB4E0 \uAE30\uC220",
      "Tap again to buy": "\uB2E4\uC2DC \uD130\uCE58\uD558\uC5EC \uAD6C\uB9E4",
      "Tap again to buy it back": "\uB2E4\uC2DC \uD130\uCE58\uD558\uC5EC \uB418\uC0AC\uAE30",
      "Tap again to drop": "\uB2E4\uC2DC \uD0ED\uD558\uBA74 \uBC84\uB9BD\uB2C8\uB2E4",
      "Tap again to gamble": "\uB2E4\uC2DC \uD130\uCE58\uD558\uC5EC \uB3C4\uBC15",
      "Tap again to pick it": "\uB2E4\uC2DC \uD0ED\uD558\uBA74 \uC120\uD0DD",
      "Tap an item to see it": "\uC544\uC774\uD15C\uC744 \uD130\uCE58\uD558\uC5EC \uBCF4\uAE30",
      "Tap an item, then tap it again": "\uC544\uC774\uD15C\uC744 \uD130\uCE58\uD55C \uB4A4 \uB2E4\uC2DC \uD130\uCE58",
      "Tap to continue": "\uD130\uCE58\uD558\uC5EC \uACC4\uC18D",
      "Tap to pick up an item, tap again to put it down \xB7 Hold to equip or take off": "\uD130\uCE58: \uC544\uC774\uD15C \uC90D\uAE30, \uB2E4\uC2DC \uD130\uCE58: \uB0B4\uB824\uB193\uAE30 \xB7 \uAE38\uAC8C \uB204\uB974\uAE30: \uC7A5\uCC29/\uD574\uC81C",
      "Tap to pick up an item, tap the stash or inventory to put it down": "\uD130\uCE58: \uC544\uC774\uD15C \uC90D\uAE30 \xB7 \uBCF4\uAD00\uD568\uC774\uB098 \uC778\uBCA4\uD1A0\uB9AC\uB97C \uD130\uCE58: \uB0B4\uB824\uB193\uAE30",
      Targe: "\uD0C0\uC544\uC9C0",
      "Target Defense": "\uB300\uC0C1 \uBC29\uC5B4\uB825",
      Tarnhelm: "\uD0C0\uB978\uD5EC\uB984",
      Taunt: "\uB3C4\uBC1C",
      Tearhaunch: "\uB454\uBD80\uCC22\uAC1C",
      Teeth: "\uC774\uBE68",
      Telekinesis: "\uC5FC\uB825",
      Teleport: "\uC21C\uAC04\uC774\uB3D9",
      Teleportation: "\uC21C\uAC04\uC774\uB3D9",
      "Terra's": "\uD14C\uB77C\uC758",
      Terror: "\uACF5\uD3EC",
      "That code comes from a newer version of D2 Survivors. Reload this page to update, then try again.": "\uB354 \uC0C8\uB85C\uC6B4 \uBC84\uC804\uC758 D2 Survivors\uC5D0\uC11C \uB9CC\uB4E0 \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCCD0 \uC5C5\uB370\uC774\uD2B8\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "That code doesn't hold a save D2 Survivors can use.": "D2 Survivors\uC5D0\uC11C \uC4F8 \uC218 \uC788\uB294 \uC800\uC7A5 \uB370\uC774\uD130\uAC00 \uC5C6\uB294 \uCF54\uB4DC\uC785\uB2C8\uB2E4.",
      "That code holds gear this version of D2 Survivors doesn't know. Reload this page to update, then try again.": "\uC774 \uBC84\uC804\uC758 D2 Survivors\uAC00 \uBAA8\uB974\uB294 \uC7A5\uBE44\uAC00 \uB4E0 \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCCD0 \uC5C5\uB370\uC774\uD2B8\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "That code is damaged. Copy all of it again and paste it here.": "\uC190\uC0C1\uB41C \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uC804\uCCB4\uB97C \uB2E4\uC2DC \uBCF5\uC0AC\uD574\uC11C \uC5EC\uAE30\uC5D0 \uBD99\uC5EC \uB123\uC73C\uC2ED\uC2DC\uC624.",
      "That isn't a D2 Survivors save code.": "D2 Survivors \uC800\uC7A5 \uCF54\uB4DC\uAC00 \uC544\uB2D9\uB2C8\uB2E4.",
      "That's too long to be a save code.": "\uC800\uC7A5 \uCF54\uB4DC\uB77C\uAE30\uC5D4 \uB108\uBB34 \uAE41\uB2C8\uB2E4.",
      "The * is coming soon": "{0}: \uC900\uBE44 \uC911",
      "The Ancients awaken": "\uACE0\uB300\uC778\uB4E4\uC774 \uAE68\uC5B4\uB0A9\uB2C8\uB2E4",
      "the Axe": "\uB3C4\uB07C",
      "The blue globe no longer shows experience: always full, it shows your hero's mana as D2 counts it, and its box says what mana does here. Experience fills the experience bar, as in D2, with its numbers when you point at it": "\uD30C\uB780 \uAD6C\uC2AC\uC5D0 \uB354 \uC774\uC0C1 \uACBD\uD5D8\uCE58\uAC00 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uAD6C\uC2AC\uC740 \uD56D\uC0C1 \uAC00\uB4DD \uCC28 \uC788\uC73C\uBA70 D2 \uBC29\uC2DD\uC73C\uB85C \uACC4\uC0B0\uD55C \uC601\uC6C5\uC758 \uB9C8\uB098\uB97C \uBCF4\uC5EC \uC8FC\uACE0, \uC124\uBA85 \uC0C1\uC790\uC5D0\uC11C \uC5EC\uAE30\uC11C \uB9C8\uB098\uAC00 \uD558\uB294 \uC77C\uC744 \uC54C\uB824 \uC90D\uB2C8\uB2E4. \uACBD\uD5D8\uCE58\uB294 D2\uCC98\uB7FC \uACBD\uD5D8\uCE58 \uB9C9\uB300\uC5D0 \uCC28\uC624\uB974\uBA70, \uB9C9\uB300\uB97C \uAC00\uB9AC\uD0A4\uBA74 \uC218\uCE58\uAC00 \uBCF4\uC785\uB2C8\uB2E4",
      "The Cat's Eye": "\uACE0\uC591\uC774 \uB208",
      "The Chieftain": "\uC871\uC7A5",
      "The code": "\uCF54\uB4DC",
      "the Cold": "\uCC28\uAC00\uC6B4 \uC790",
      "The Countess": "\uBC31\uC791",
      "The Cow King": "\uCE74\uC6B0\uD0B9",
      "the Dark": "\uC0AC\uC545\uD55C \uC790",
      "the Dead": "\uC8FD\uC740 \uC790",
      "the Destroyer": "\uC12C\uBA78\uC790",
      "The display was lost": "\uD654\uBA74 \uCD9C\uB825\uC774 \uB04A\uACBC\uC2B5\uB2C8\uB2E4",
      "The Dragon Chang": "\uC6A9\uCC3D",
      "The Eye of Etlich": "\uC5D0\uD2C0\uB9AC\uD06C\uC758 \uB208",
      "The Face of Horror": "\uC12C\uB729\uD55C \uC5BC\uAD74",
      "The Fetid Sprinkler": "\uC369\uC740 \uBFCC\uB9AC\uAC1C",
      "The first gear you can wear points you to the inventory, once": "\uCC98\uC74C \uCC29\uC6A9\uD560 \uC218 \uC788\uB294 \uC7A5\uBE44\uB97C \uC5BB\uC73C\uBA74 \uD55C \uBC88 \uC778\uBCA4\uD1A0\uB9AC\uB97C \uC54C\uB824 \uC90D\uB2C8\uB2E4",
      "the Flayer": "\uAC00\uC8FD \uBC97\uAE30\uB294 \uC790",
      "The game in Korean: pick it in Options, or a Korean browser picks it": "\uD55C\uAD6D\uC5B4 \uC9C0\uC6D0: \uC124\uC815\uC5D0\uC11C \uC120\uD0DD\uD558\uAC70\uB098, \uD55C\uAD6D\uC5B4 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uC790\uB3D9\uC73C\uB85C \uC801\uC6A9",
      "THE GENERAL'S TAN DO LI GA": "\uCE58\uC6B0\uCC9C\uC655\uC758 \uCCA0\uD1F4",
      "The Gladiator's Bane": "\uAC80\uD22C\uC0AC\uC758 \uC7AC\uC559",
      "The Gnasher": "\uAC09\uC544\uBA39\uB294 \uC790",
      "the golem's blow": "\uACE8\uB818\uC758 \uD0C0\uACA9\uB2F9",
      "the Grim": "\uB0C9\uD639\uD55C \uC790",
      "the grizzly's swipe": "\uD68C\uC0C9\uACF0\uC758 \uD560\uD034\uAE30\uB2F9",
      "The ground erupts under the nearest pack for #s, across # yards, # damage a burst": "{0}\uCD08\uAC04 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uBB34\uB9AC \uC544\uB798 {1}\uC57C\uB4DC\uC5D0 \uAC78\uCCD0 \uB545\uC774 \uBD84\uCD9C, \uBD84\uCD9C\uB2F9 {2} \uD53C\uD574",
      "the Hammer": "\uB9DD\uCE58",
      "The Hammerdin: # blessed hammers at once, whirling faster and wider, # damage to all they pass": "\uD574\uBA38\uB518: \uCD95\uBCF5\uBC1B\uC740 \uB9DD\uCE58 {0}\uAC1C\uB97C \uD55C \uBC88\uC5D0, \uB354 \uBE60\uB974\uACE0 \uB113\uAC8C \uD68C\uC804, \uC9C0\uB098\uB294 \uBAA8\uB4E0 \uC801\uC5D0\uAC8C {1} \uD53C\uD574",
      "The Hand of Broc": "\uBE0C\uB85D\uC758 \uC190",
      "The Harrowing": "\uCC38\uD639\uD55C \uC2DC\uB828",
      "the Howler": "\uC6B8\uBD80\uC9D6\uB294 \uC790",
      "the Hungry": "\uAD76\uC8FC\uB9B0 \uC790",
      "the Hunter": "\uC0AC\uB0E5\uAFBC",
      "The Impaler": "\uAFF0\uB6AB\uB294 \uC790",
      "The Infernal Gate": "\uC9C0\uC625\uBB38",
      "The Iron Jang Bong": "\uBB34\uC1E0 \uC7A5\uBD09",
      "the Jagged": "\uB4E4\uCB49\uB0A0\uCB49\uD55C \uC790",
      "the landing or the strike": "\uCC29\uC9C0 \uB610\uB294 \uD0C0\uACA9\uB2F9",
      "the Mad": "\uBBF8\uCE58\uAD11\uC774",
      "The Mahim-Oak Curio": "\uB9C8\uD798\uC624\uD06C \uC218\uC9D1\uD488",
      "the Mauler": "\uD30C\uAD34\uC790",
      "The Meat Scraper": "\uACE0\uAE30 \uAE01\uAC1C",
      "The menu and the credits say plainly that this is an unofficial fan project": "\uBA54\uB274\uC640 \uD06C\uB808\uB527\uC5D0 \uBE44\uACF5\uC2DD \uD32C \uD504\uB85C\uC81D\uD2B8\uC784\uC744 \uBD84\uBA85\uD788 \uC801\uC5C8\uC2B5\uB2C8\uB2E4",
      "The Oak Sage follows you: +#% maximum life": "\uCC38\uB098\uBB34 \uD604\uC790\uAC00 \uB530\uB77C\uB2E4\uB2D8: \uCD5C\uB300 \uC0DD\uBA85\uB825 +{0}%",
      "The Oculus": "\uB9DD\uC6B8",
      "The Patriarch": "\uC7A5\uB85C",
      "The portal takes you in #\u2026": "{0} \uD6C4 \uCC28\uC6D0\uBB38\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4\u2026",
      "the Quick": "\uB0A0\uC318 \uC790",
      "The Redeemer": "\uAD6C\uC6D0\uC790",
      "The Rising Sun": "\uB5A0\uC624\uB974\uB294 \uD0DC\uC591",
      "The run's gold visibly goes into Charsi's purse as the run ends, and at her wares after Baal": "\uAC8C\uC784\uC774 \uB05D\uB0A0 \uB54C\uC640 \uBC14\uC54C \uCC98\uCE58 \uD6C4 \uCC30\uC2DC\uC758 \uBB3C\uD488\uC5D0\uC11C, \uAC8C\uC784\uC758 \uACE8\uB4DC\uAC00 \uCC30\uC2DC\uC758 \uC9C0\uAC11\uC73C\uB85C \uB4E4\uC5B4\uAC00\uB294 \uBAA8\uC2B5\uC774 \uBCF4\uC785\uB2C8\uB2E4",
      "The Salamander": "\uBD88\uB3C4\uB9C8\uBC40",
      "The Scalper": "\uBB34\uB450\uB3C4\uB07C",
      "The Secret Cow Level": "\uBE44\uBC00 \uC816\uC18C \uB808\uBCA8",
      "The Secret of the Vizjerei": "\uBE44\uC81C\uB808\uC774\uC758 \uBE44\uBC00",
      "the Shade": "\uADF8\uB9BC\uC790",
      "the Sharp": "\uB0A0\uCE74\uB85C\uC6B4 \uC790",
      "The Sightless Eye": "\uB208\uBA3C \uC790\uC758 \uB208",
      "the Slasher": "\uB09C\uB3C4\uC9C8\uD558\uB294 \uC790",
      "the Slayer": "\uD559\uC0B4\uC790",
      "The credits no longer have a tip button: the game is entirely non-commercial": "\uC81C\uC791\uC9C4 \uD654\uBA74\uC758 \uD6C4\uC6D0 \uBC84\uD2BC\uC744 \uC5C6\uC574\uC2B5\uB2C8\uB2E4: \uC774 \uAC8C\uC784\uC740 \uC644\uC804\uD788 \uBE44\uC0C1\uC5C5\uC801\uC785\uB2C8\uB2E4",
      "The developer's note no longer repeats the X handle above its X button": "\uAC1C\uBC1C\uC790\uAC00 \uB4DC\uB9AC\uB294 \uB9D0\uC500\uC5D0\uC11C X \uBC84\uD2BC \uC704\uC5D0 X \uACC4\uC815\uC744 \uBC18\uBCF5\uD574 \uBCF4\uC5EC \uC8FC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "The Smith": "\uB300\uC7A5\uC7A5\uC774",
      "The stamina bar is drawn as D2 draws it: a flat gold over the panel's stone, turning red with under a quarter left": "\uC2A4\uD0DC\uBBF8\uB098 \uAC8C\uC774\uC9C0\uB97C D2\uCC98\uB7FC \uADF8\uB9BD\uB2C8\uB2E4: \uD328\uB110\uC758 \uB3CC \uC704\uC5D0 \uB2E8\uC0C9 \uAE08\uBE5B\uC73C\uB85C, 4\uBD84\uC758 1 \uBBF8\uB9CC\uC774 \uB0A8\uC73C\uBA74 \uBD89\uAC8C \uBC14\uB01D\uB2C8\uB2E4",
      "The Stone of Jordan": "\uC694\uB974\uB2E8\uC758 \uBC18\uC9C0",
      "The strongest monster near you fights for you for #s, harder; up to #, no champions or bosses": "\uC8FC\uBCC0\uC5D0\uC11C \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC774 {0}\uCD08\uAC04 \uB2F9\uC2E0\uC744 \uC704\uD574 \uB354 \uAC15\uD558\uAC8C \uC2F8\uC6C0; \uCD5C\uB300 {1}\uB9C8\uB9AC, \uC815\uC608 \uAD34\uBB3C\xB7\uC6B0\uB450\uBA38\uB9AC \uC81C\uC678",
      "The Summoner": "\uC18C\uD658\uC0AC",
      "the Tainted": "\uC624\uC5FC\uB41C \uC790",
      "The Tannr Gorerod": "\uD0C4\uB974 \uACE0\uC5B4\uB85C\uB4DC",
      "The toughest monster nearby charges you for #s, blows #% weaker (act bosses only weakened)": "\uC8FC\uBCC0\uC5D0\uC11C \uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C\uC774 {0}\uCD08\uAC04 \uB2F9\uC2E0\uC5D0\uAC8C \uB3CC\uC9C4, \uACF5\uACA9 {1}% \uC57D\uD654 (\uB9C9 \uC6B0\uB450\uBA38\uB9AC\uB294 \uC57D\uD654\uB9CC)",
      "the Unclean": "\uBD88\uACB0\uD55C \uC790",
      "the Unholy": "\uBD80\uC815\uD55C \uC790",
      "The Ward": "\uD638\uC2E0\uBD80",
      "the Witch": "\uB9C8\uB140",
      "The Worldstone is safe.": "\uC138\uACC4\uC11D\uC740 \uC548\uC804\uD569\uB2C8\uB2E4.",
      "The Worldstone is safe. You cleared all five acts* in *, at level *, having slain * monsters. +* gold.**": "\uC138\uACC4\uC11D\uC740 \uC548\uC804\uD569\uB2C8\uB2E4. {0} \uB2E4\uC12F \uB9C9\uC744 {1} \uB9CC\uC5D0 \uBAA8\uB450 \uD074\uB9AC\uC5B4, \uB808\uBCA8 {2}, \uCC98\uCE58\uD55C \uAD34\uBB3C {3}. +{4} \uACE8\uB4DC.{5}{6}",
      "the Wraith": "\uB9DD\uB839",
      "they hit": "\uC801\uB4E4 \uC801\uC911",
      "they pass": "\uC801\uB4E4 \uD1B5\uACFC\uD574",
      Thirst: "\uAC08\uC99D",
      "This browser": "\uC774 \uBE0C\uB77C\uC6B0\uC800",
      "This browser can't make a save code.": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB294 \uC800\uC7A5 \uCF54\uB4DC\uB97C \uB9CC\uB4E4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "This browser's gold, upgrades and gear give way to the code's. Export them first to keep a copy.": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC758 \uACE8\uB4DC, \uC5C5\uADF8\uB808\uC774\uB4DC, \uC7A5\uBE44\uAC00 \uCF54\uB4DC\uC758 \uAC83\uC73C\uB85C \uBC14\uB01D\uB2C8\uB2E4. \uC0AC\uBCF8\uC744 \uB0A8\uAE30\uB824\uBA74 \uBA3C\uC800 \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.",
      Thorn: "\uAC00\uC2DC",
      Thorns: "\uAC00\uC2DC",
      "Thresh Socket": "\uC4F0\uB808\uC26C \uC18C\uCF13",
      "Throne of Destruction": "\uD30C\uAD34\uC758 \uC655\uC88C",
      "Throw an axe from each hand, * damage*": "\uC591\uC190\uC5D0\uC11C \uB3C4\uB07C\uB97C \uD558\uB098\uC529 \uB358\uC9D0, {0} \uD53C\uD574{1}",
      "Throw an axe from each hand, # damage#": "\uC591\uC190\uC5D0\uC11C \uB3C4\uB07C\uB97C \uD558\uB098\uC529 \uB358\uC9D0, {0} \uD53C\uD574{1}",
      "Throwing Axe": "\uC2A4\uB85C\uC789 \uC561\uC2A4",
      "Throwing Knife": "\uC2A4\uB85C\uC789 \uB098\uC774\uD504",
      "Throwing Mastery": "\uD22C\uCC99 \uC219\uB828",
      "Throwing Spear": "\uC2A4\uB85C\uC789 \uC2A4\uD53C\uC5B4",
      "Thrown axes deal #% more damage and have +#% chance to fly on through what they hit": "\uB358\uC9C4 \uB3C4\uB07C\uC758 \uD53C\uD574 {0}% \uC99D\uAC00, \uB9DE\uC740 \uC801\uC744 \uAD00\uD1B5\uD560 \uD655\uB960 +{1}%",
      "Thunder Storm": "\uB1CC\uC6B0",
      "Thundergod's Vigor": "\uCC9C\uB465\uC2E0\uC758 \uBC15\uB825",
      Thunderstroke: "\uCC9C\uB465\uC77C\uACA9",
      Tiara: "\uD2F0\uC544\uB77C",
      "Tiger Strike": "\uD638\uB791\uC774 \uC77C\uACA9",
      "Titan's Revenge": "\uAC70\uC778\uC758 \uBCF5\uC218",
      "to All Skills": "\uBAA8\uB4E0 \uAE30\uC220",
      "to Amazon Skill Levels": "\uC544\uB9C8\uC874 \uAE30\uC220 \uB808\uBCA8",
      "to Assassin Skills": "\uC554\uC0B4\uC790 \uAE30\uC220",
      "to Attack Rating": "\uACF5\uACA9 \uB4F1\uAE09",
      "to Attack Rating against Demons": "\uC545\uB9C8 \uB300\uC0C1 \uACF5\uACA9 \uB4F1\uAE09",
      "to Attack Rating against Undead": "\uC5B8\uB370\uB4DC \uB300\uC0C1 \uACF5\uACA9 \uB4F1\uAE09",
      "to Barbarian Skill Levels": "\uC57C\uB9CC\uC6A9\uC0AC \uAE30\uC220 \uB808\uBCA8",
      "to Cold Skill Damage": "\uB0C9\uAE30 \uAE30\uC220 \uD53C\uD574",
      "to Dexterity": "\uBBFC\uCCA9",
      "to Druid Skills": "\uB4DC\uB8E8\uC774\uB4DC \uAE30\uC220",
      "to Enemy Cold Resistance": "\uC801 \uB0C9\uAE30 \uC800\uD56D \uAC10\uC18C",
      "to Enemy Fire Resistance": "\uC801 \uD654\uC5FC \uC800\uD56D \uAC10\uC18C",
      "to Enemy Lightning Resistance": "\uC801 \uBC88\uAC1C \uC800\uD56D \uAC10\uC18C",
      "to Enemy Poison Resistance": "\uC801 \uB3C5 \uC800\uD56D \uAC10\uC18C",
      "to Energy": "\uC5D0\uB108\uC9C0",
      "to Fire Skill Damage": "\uD654\uC5FC \uAE30\uC220 \uD53C\uD574",
      "to Fire Skills": "\uD654\uC5FC \uAE30\uC220 \uC0C1\uC2B9",
      "to Life": "\uC0DD\uBA85\uB825",
      "to Light Radius": "\uBE5B\uC758 \uBC18\uACBD",
      "to Lightning Skill Damage": "\uBC88\uAC1C \uAE30\uC220 \uD53C\uD574",
      "to Mana": "\uB9C8\uB098",
      "to Mana after each Kill": "\uCC98\uCE58 \uC2DC \uB9C8\uB098",
      "to Maximum Cold Damage": "\uCD5C\uB300 \uB0C9\uAE30 \uD53C\uD574",
      "to Maximum Damage": "\uCD5C\uB300 \uD53C\uD574",
      "to Maximum Fire Damage": "\uCD5C\uB300 \uD654\uC5FC \uD53C\uD574",
      "to Maximum Fire Resist": "\uCD5C\uB300 \uD654\uC5FC \uC800\uD56D",
      "to Maximum Lightning Damage": "\uCD5C\uB300 \uBC88\uAC1C \uD53C\uD574",
      "to Maximum Magic Damage": "\uCD5C\uB300 \uB9C8\uBC95 \uD53C\uD574",
      "to Maximum Lightning Resist": "\uCD5C\uB300 \uBC88\uAC1C \uC800\uD56D",
      "to Maximum Poison Damage": "\uCD5C\uB300 \uB3C5 \uD53C\uD574",
      "to Maximum Poison Resist": "\uCD5C\uB300 \uB3C5 \uC800\uD56D",
      "to Minimum Cold Damage": "\uCD5C\uC18C \uB0C9\uAE30 \uD53C\uD574",
      "to Minimum Damage": "\uCD5C\uC18C \uD53C\uD574",
      "to Minimum Fire Damage": "\uCD5C\uC18C \uD654\uC5FC \uD53C\uD574",
      "to Minimum Lightning Damage": "\uCD5C\uC18C \uBC88\uAC1C \uD53C\uD574",
      "to Minimum Magic Damage": "\uCD5C\uC18C \uB9C8\uBC95 \uD53C\uD574",
      "to Minimum Poison Damage": "\uCD5C\uC18C \uB3C5 \uD53C\uD574",
      "to Monster Defense Per Hit": "\uC801\uC911 \uC2DC \uAD34\uBB3C \uBC29\uC5B4\uB825 \uAC10\uC18C",
      "to Necromancer Skill Levels": "\uAC15\uB839\uC220\uC0AC \uAE30\uC220 \uB808\uBCA8",
      "to Paladin Skill Levels": "\uC131\uAE30\uC0AC \uAE30\uC220 \uB808\uBCA8",
      "to Sorceress Skill Levels": "\uC6D0\uC18C\uC220\uC0AC \uAE30\uC220 \uB808\uBCA8",
      "to Strength": "\uD798",
      "to Vitality": "\uD65C\uB825",
      Tomahawk: "\uD1A0\uB9C8\uD638\uD06C",
      "Tomb Wand": "\uD23C \uC6D0\uB4DC",
      "Tome of Town Portal": "\uB9C8\uC744 \uCC28\uC6D0\uBB38 \uC804\uC11C",
      Tongue: "\uD600",
      "Toorc Icefist": "\uD22C\uB974\uD06C \uC544\uC774\uC2A4\uD53C\uC2A4\uD2B8",
      Toothrow: "\uAC15\uCCA0\uB2C8",
      Torc: "\uBAA9\uACE0\uB9AC",
      "Torch of Iro": "\uC774\uB85C\uC758 \uD683\uBD88",
      Tornado: "\uD68C\uC624\uB9AC\uBC14\uB78C",
      "Totemic Mask": "\uD1A0\uD14C\uBBF9 \uB9C8\uC2A4\uD06C",
      Touch: "\uC190\uAE38",
      "toughest monster": "\uAC00\uC7A5 \uAC15\uD55C \uAD34\uBB3C",
      Tower: "\uD0D1",
      "Tower Shield": "\uD0C0\uC6CC \uC274\uB4DC",
      Toxic: "\uB3C5\uC131\uC758",
      Track: "\uBC1C\uC790\uAD6D",
      "Trainer's": "\uC870\uB828\uC0AC\uC758",
      Trample: "\uC9D3\uBC1F\uAE30",
      "TRANSFER SAVE": "\uC800\uC7A5 \uB370\uC774\uD130 \uC804\uC1A1",
      Traps: "\uD568\uC815",
      Travincal: "\uD2B8\uB77C\uBE48\uCE7C",
      "Treads of Cthon": "\uD06C\uD1A4\uC758 \uBC1C \uBCF4\uD638\uB300",
      "Treehead WoodFist": "\uD2B8\uB9AC\uD5E4\uB4DC \uC6B0\uB4DC\uD53C\uC2A4\uD2B8",
      "Trellised Armor": "\uD2B8\uB810\uB9AC\uC2A4\uB4DC \uC544\uBA38",
      Triangle: "\u25B3\uBC84\uD2BC",
      "Trickster's": "\uB9D0\uC37D\uAFBC\uC758",
      "Troll Belt": "\uD2B8\uB864 \uBCA8\uD2B8",
      "Troll Nest": "\uD2B8\uB864 \uB124\uC2A4\uD2B8",
      Trump: "\uC73C\uB738",
      Truncheon: "\uD2B8\uB7F0\uCC9C",
      Turn: "\uD68C\uC804",
      Turquoise: "\uD130\uD0A4\uC11D",
      "Tusk Sword": "\uD130\uC2A4\uD06C \uC18C\uB4DC",
      "Twin Axe": "\uD2B8\uC708 \uC561\uC2A4",
      Twister: "\uB3CC\uAC1C\uBC14\uB78C",
      Twitchthroe: "\uB4A4\uD2C0\uB9B0 \uB2E8\uB9D0\uB9C8",
      "Two blasts of cold in a fan before you, # damage each, chilling what they touch": "\uC55E\uCABD \uBD80\uCC44\uAF34\uB85C \uB0C9\uAE30\uB97C 2\uD68C \uBD84\uC0AC, \uAC01 {0} \uD53C\uD574, \uB2FF\uC740 \uC801\uC5D0\uAC8C \uC624\uD55C",
      "Two blows in a wide reach, # damage each; hits speed your swings and steps, up to # times": "\uB113\uC740 \uBC94\uC704\uC5D0 2\uD68C \uACF5\uACA9, \uAC01 {0} \uD53C\uD574; \uBA85\uC911\uD560 \uB54C\uB9C8\uB2E4 \uACF5\uACA9\xB7\uC774\uB3D9 \uC18D\uB3C4 \uC99D\uAC00, \uCD5C\uB300 {1}\uD68C",
      "Two claw blows at the toughest in reach, # damage each, releasing all charges": "\uBC94\uC704 \uB0B4 \uAC00\uC7A5 \uAC15\uD55C \uC801\uC5D0\uAC8C \uC190\uD1B1 2\uD68C \uACF5\uACA9, \uAC01 {0} \uD53C\uD574, \uBAA8\uB4E0 \uCDA9\uC804 \uBC29\uCD9C",
      "Two swift blows at the monsters in reach, # damage each": "\uBC94\uC704 \uB0B4 \uAD34\uBB3C\uC5D0\uAC8C \uBE60\uB978 2\uD68C \uACF5\uACA9, \uAC01 {0} \uD53C\uD574",
      "Two-Hand Damage:": "\uC591\uC190 \uD53C\uD574:",
      "Two-Hand Damage: * to *": "\uC591\uC190 \uD53C\uD574: {0} - {1}",
      "Two-Handed Sword": "\uD22C\uD578\uB4DC \uC18C\uB4DC",
      "Two-weapon skills swing or throw with both in turn": "\uC591\uC190 \uBB34\uAE30 \uAE30\uC220\uC740 \uB450 \uBB34\uAE30\uB85C \uBC88\uAC08\uC544 \uD718\uB450\uB974\uAC70\uB098 \uB358\uC9D0",
      "Umbral Disk": "\uADF8\uB9BC\uC790 \uC6D0\uBC18",
      "Ume's Lament": "\uC6B0\uBA54\uC758 \uD0C4\uC2DD",
      "Undead Crown": "\uC5B8\uB370\uB4DC \uC655\uAD00",
      "Unearthed Wand": "\uC5B8\uC5B4\uC2A4\uB4DC \uC6D0\uB4DC",
      "Unofficial fan project, not affiliated with Blizzard Entertainment. Diablo II\xAE is a trademark of Blizzard Entertainment, Inc.": "\uBE44\uACF5\uC2DD \uD32C \uD504\uB85C\uC81D\uD2B8\uB85C, Blizzard Entertainment\uC640 \uBB34\uAD00\uD569\uB2C8\uB2E4. Diablo II\xAE\uB294 Blizzard Entertainment, Inc.\uC758 \uC0C1\uD45C\uC785\uB2C8\uB2E4.",
      "Unraveller Head": "\uC5B8\uB808\uC774\uBE14\uB7EC \uD5E4\uB4DC",
      "until that hero's next run": "\uADF8 \uC601\uC6C5\uC758 \uB2E4\uC74C \uAC8C\uC784\uAE4C\uC9C0",
      "Up to *": "\uCD5C\uB300 {0}",
      "Up to # dire wolves, # damage a bite, and the pack +#% life; with # spirit wolves and # ravens": "\uAD11\uD3EC\uD55C \uB291\uB300 \uCD5C\uB300 {0}\uB9C8\uB9AC, \uBB3C\uAE30\uB2F9 {1} \uD53C\uD574, \uBB34\uB9AC \uC0DD\uBA85\uB825 +{2}%; \uC601\uD63C \uB291\uB300 {3}, \uD070\uAE4C\uB9C8\uADC0 {4} \uB3D9\uBC18",
      "Up to # fight beside you, # life, # damage": "\uCD5C\uB300 {0}\uAE4C\uC9C0 \uACC1\uC5D0\uC11C \uC2F8\uC6C0, \uC0DD\uBA85\uB825 {1}, \uD53C\uD574 {2}",
      "Up to # spirit wolves fight beside you, # damage a bite; and # ravens": "\uC601\uD63C \uB291\uB300 \uCD5C\uB300 {0}\uB9C8\uB9AC\uAC00 \uACC1\uC5D0\uC11C \uC2F8\uC6C0, \uBB3C\uAE30\uB2F9 {1} \uD53C\uD574; \uD070\uAE4C\uB9C8\uADC0 {2}",
      "Up to date": "\uCD5C\uC2E0 \uBC84\uC804\uC785\uB2C8\uB2E4",
      "Update ready: click to restart": "\uC5C5\uB370\uC774\uD2B8 \uC900\uBE44 \uC644\uB8CC: \uD074\uB9AD\uD558\uC5EC \uC7AC\uC2DC\uC791",
      UPDATES: "\uC5C5\uB370\uC774\uD2B8",
      "UPDATES: *": "\uC5C5\uB370\uC774\uD2B8: {0}",
      Upgrades: "\uC5C5\uADF8\uB808\uC774\uB4DC",
      "Upper Kurast": "\uC0C1\uBD80 \uCFE0\uB77C\uC2A4\uD2B8",
      Urn: "\uD56D\uC544\uB9AC",
      Valkyrie: "\uBC1C\uD0A4\uB9AC",
      "Valkyrie Wing": "\uBC1C\uD0A4\uB9AC \uB0A0\uAC1C",
      "Valkyrie's": "\uBC1C\uD0A4\uB9AC\uC758",
      "Valley of Snakes": "\uBC40\uC758 \uACE8\uC9DC\uAE30",
      Vambraces: "\uBC40\uBE0C\uB808\uC774\uC2A4",
      "Vampirebone Gloves": "\uBC40\uD30C\uC774\uC5B4\uBCF8 \uAE00\uB7EC\uBE0C",
      "Vampirefang Belt": "\uBC40\uD30C\uC774\uC5B4\uD33D \uBCA8\uD2B8",
      Veil: "\uC7A5\uB9C9",
      "Veil of Steel": "\uAC15\uCCA0\uC758 \uBCA0\uC77C",
      Vengeance: "\uBCF5\uC218",
      "Vengeance Aegis": "\uBCF5\uC218 \uBC29\uD328",
      "Vengeance Badge": "\uBCF5\uC218 \uD718\uC7A5",
      "Vengeance Band": "\uBCF5\uC218 \uBC18\uC9C0",
      "Vengeance Barb": "\uBCF5\uC218 \uBBF8\uB298",
      "Vengeance Beads": "\uBCF5\uC218 \uAD6C\uC2AC",
      "Vengeance Bite": "\uBCF5\uC218 \uC774\uBE68",
      "Vengeance Blazer": "\uBCF5\uC218 \uAC1C\uCC99\uC790",
      "Vengeance Bludgeon": "\uBCF5\uC218 \uACE4\uBD09",
      "Vengeance Bolt": "\uBCF5\uC218 \uD654\uC0B4",
      "Vengeance Branch": "\uBCF5\uC218 \uAC00\uC9C0",
      "Vengeance Brow": "\uBCF5\uC218 \uC774\uB9C8",
      "Vengeance Buckle": "\uBCF5\uC218 \uBC84\uD074",
      "Vengeance Call": "\uBCF5\uC218 \uBD80\uB984",
      "Vengeance Carapace": "\uBCF5\uC218 \uAC11\uAC01",
      "Vengeance Casque": "\uBCF5\uC218 \uD22C\uAD6C",
      "Vengeance Chant": "\uBCF5\uC218 \uCC2C\uAC00",
      "Vengeance Clasp": "\uBCF5\uC218 \uAC78\uC1E0",
      "Vengeance Claw": "\uBCF5\uC218 \uBC1C\uD1B1",
      "Vengeance Cleaver": "\uBCF5\uC218 \uAC00\uB984\uB0A0",
      "Vengeance Clutches": "\uBCF5\uC218 \uB9C8\uC218",
      "Vengeance Coat": "\uBCF5\uC218 \uC678\uD22C",
      "Vengeance Coil": "\uBCF5\uC218 \uACE0\uB9AC",
      "Vengeance Collar": "\uBCF5\uC218 \uBAA9\uD14C",
      "Vengeance Cord": "\uBCF5\uC218 \uB048",
      "Vengeance Cowl": "\uBCF5\uC218 \uC218\uB3C4\uB450\uAC74",
      "Vengeance Crack": "\uBCF5\uC218 \uADE0\uC5F4",
      "Vengeance Crest": "\uBCF5\uC218 \uBB38\uC7A5",
      "Vengeance Crusher": "\uBCF5\uC218 \uBD84\uC1C4\uAE30",
      "Vengeance Cry": "\uBCF5\uC218 \uC6B8\uC74C",
      "Vengeance Dart": "\uBCF5\uC218 \uD22C\uCC3D",
      "Vengeance Edge": "\uBCF5\uC218 \uCE7C\uB0A0",
      "Vengeance Emblem": "\uBCF5\uC218 \uC0C1\uC9D5",
      "Vengeance Eye": "\uBCF5\uC218 \uB208",
      "Vengeance Fang": "\uBCF5\uC218 \uC1A1\uACF3\uB2C8",
      "Vengeance Finger": "\uBCF5\uC218 \uC190\uAC00\uB77D",
      "Vengeance Fist": "\uBCF5\uC218 \uC8FC\uBA39",
      "Vengeance Fletch": "\uBCF5\uC218 \uD654\uC0B4\uAE43",
      "Vengeance Flight": "\uBCF5\uC218 \uBE44\uD589",
      "Vengeance Glare": "\uBCF5\uC218 \uC12C\uAD11",
      "Vengeance Gnarl": "\uBCF5\uC218 \uC639\uC774",
      "Vengeance Goad": "\uBCF5\uC218 \uBAB0\uC774\uB9C9\uB300",
      "Vengeance Gorget": "\uBCF5\uC218 \uBAA9\uAC00\uB9AC\uAC1C",
      "Vengeance Grip": "\uBCF5\uC218 \uC190\uC544\uADC0",
      "Vengeance Guard": "\uBCF5\uC218 \uC218\uD638",
      "Vengeance Gutter": "\uBCF5\uC218 \uC808\uAC1C",
      "Vengeance Gyre": "\uBCF5\uC218 \uC18C\uC6A9\uB3CC\uC774",
      "Vengeance Hand": "\uBCF5\uC218 \uC190",
      "Vengeance Heart": "\uBCF5\uC218 \uC2EC\uC7A5",
      "Vengeance Hew": "\uBCF5\uC218 \uCC0D\uAE30",
      "Vengeance Hide": "\uBCF5\uC218 \uAC00\uC8FD",
      "Vengeance Hold": "\uBCF5\uC218 \uC6C0\uCF1C\uC960",
      "Vengeance Hood": "\uBCF5\uC218 \uB450\uAC74",
      "Vengeance Horn": "\uBCF5\uC218 \uBFD4",
      "Vengeance Impaler": "\uBCF5\uC218 \uAD00\uD1B5\uC790",
      "Vengeance Jack": "\uBCF5\uC218 \uC6C3\uC637",
      "Vengeance Knell": "\uBCF5\uC218 \uC870\uC885",
      "Vengeance Knot": "\uBCF5\uC218 \uB9E4\uB4ED",
      "Vengeance Knuckle": "\uBCF5\uC218 \uC190\uB9C8\uB514",
      "Vengeance Lance": "\uBCF5\uC218 \uCC3D",
      "Vengeance Lash": "\uBCF5\uC218 \uCC44\uCC0D",
      "Vengeance Lock": "\uBCF5\uC218 \uC790\uBB3C\uC1E0",
      "Vengeance Loop": "\uBCF5\uC218 \uD14C",
      "Vengeance Mallet": "\uBCF5\uC218 \uB9DD\uCE58",
      "Vengeance Mangler": "\uBCF5\uC218 \uB09C\uB3C4\uC9C8",
      "Vengeance Mantle": "\uBCF5\uC218 \uB9DD\uD1A0",
      "Vengeance Mark": "\uBCF5\uC218 \uD45C\uC2DD",
      "Vengeance Mask": "\uBCF5\uC218 \uAC00\uBA74",
      "Vengeance Mauler": "\uBCF5\uC218 \uD30C\uAD34\uC790",
      "Vengeance Nails": "\uBCF5\uC218 \uBABB",
      "Vengeance Necklace": "\uBCF5\uC218 \uBAA9\uAC78\uC774",
      "Vengeance Needle": "\uBCF5\uC218 \uBC14\uB298",
      "Vengeance Nock": "\uBCF5\uC218 \uC2DC\uC704\uD648",
      "Vengeance Noose": "\uBCF5\uC218 \uC62C\uAC00\uBBF8",
      "Vengeance Orb": "\uBCF5\uC218 \uBCF4\uC8FC",
      "Vengeance Pelt": "\uBCF5\uC218 \uBAA8\uD53C",
      "Vengeance Prod": "\uBCF5\uC218 \uCC0C\uB974\uAE30",
      "Vengeance Quarrel": "\uBCF5\uC218 \uC1E0\uB1CC\uC0B4",
      "Vengeance Quill": "\uBCF5\uC218 \uAE43",
      "Vengeance Razor": "\uBCF5\uC218 \uBA74\uB3C4\uB0A0",
      "Vengeance Rend": "\uBCF5\uC218 \uCC22\uAE40",
      "Vengeance Road": "\uBCF5\uC218 \uAE38",
      "Vengeance Saw": "\uBCF5\uC218 \uD1B1",
      "Vengeance Scalpel": "\uBCF5\uC218 \uD574\uBD80\uCE7C",
      "Vengeance Scarab": "\uBCF5\uC218 \uD48D\uB385\uC774",
      "Vengeance Scourge": "\uBCF5\uC218 \uC7AC\uC559",
      "Vengeance Scratch": "\uBCF5\uC218 \uD560\uD034\uAE30",
      "Vengeance Scythe": "\uBCF5\uC218 \uB0AB",
      "Vengeance Shard": "\uBCF5\uC218 \uD30C\uD3B8",
      "Vengeance Shroud": "\uBCF5\uC218 \uC218\uC758",
      "Vengeance Slippers": "\uBCF5\uC218 \uB367\uC2E0",
      "Vengeance Smasher": "\uBCF5\uC218 \uBD84\uC1C4\uC790",
      "Vengeance Song": "\uBCF5\uC218 \uB178\uB798",
      "Vengeance Spell": "\uBCF5\uC218 \uC8FC\uBB38",
      "Vengeance Sphere": "\uBCF5\uC218 \uAD6C\uCCB4",
      "Vengeance Spike": "\uBCF5\uC218 \uAC00\uC2DC",
      "Vengeance Spiral": "\uBCF5\uC218 \uB098\uC120",
      "Vengeance Spire": "\uBCF5\uC218 \uCCA8\uD0D1",
      "Vengeance Splitter": "\uBCF5\uC218 \uCABC\uAC1C\uB294\uC790",
      "Vengeance Spur": "\uBCF5\uC218 \uBC15\uCC28",
      "Vengeance Stake": "\uBCF5\uC218 \uB9D0\uB69D",
      "Vengeance Stalk": "\uBCF5\uC218 \uCD94\uC801",
      "Vengeance Star": "\uBCF5\uC218 \uBCC4",
      "Vengeance Stinger": "\uBCF5\uC218 \uB3C5\uCE68",
      "Vengeance Strap": "\uBCF5\uC218 \uB760",
      "Vengeance Suit": "\uBCF5\uC218 \uAC11\uC637",
      "Vengeance Sunder": "\uBCF5\uC218 \uC808\uB2E8",
      "Vengeance Talisman": "\uBCF5\uC218 \uBD80\uC801",
      "Vengeance Thirst": "\uBCF5\uC218 \uAC08\uC99D",
      "Vengeance Torc": "\uBCF5\uC218 \uBAA9\uACE0\uB9AC",
      "Vengeance Tower": "\uBCF5\uC218 \uD0D1",
      "Vengeance Track": "\uBCF5\uC218 \uBC1C\uC790\uAD6D",
      "Vengeance Trample": "\uBCF5\uC218 \uC9D3\uBC1F\uAE30",
      "Vengeance Turn": "\uBCF5\uC218 \uD68C\uC804",
      "Vengeance Veil": "\uBCF5\uC218 \uC7A5\uB9C9",
      "Vengeance Visage": "\uBCF5\uC218 \uC5BC\uAD74",
      "Vengeance Ward": "\uBCF5\uC218 \uBCF4\uD638",
      "Vengeance Weaver": "\uBCF5\uC218 \uC9C1\uC870\uC790",
      "Vengeance Wing": "\uBCF5\uC218 \uB0A0\uAC1C",
      "Vengeance Wrack": "\uBCF5\uC218 \uACE0\uBB38",
      Venom: "\uB9F9\uB3C5",
      Venomous: "\uB9F9\uB3C5",
      "Ventar the Unholy": "\uBD80\uC815\uD55C \uC790 \uBCA4\uD0C0\uB974",
      "Verdungo's Hearty Cord": "\uBCA0\uB974\uB454\uACE0\uC758 \uD2BC\uD2BC\uD55C \uB178\uB048",
      Vermillion: "\uC8FC\uD64D\uC0C9",
      "Veteran's": "\uBC31\uC804\uB178\uC7A5\uC758",
      Vex: "\uAD34\uB86D\uD798",
      Vicious: "\uC0AC\uB098\uC6B4",
      View: "\uBCF4\uAE30",
      Vigor: "\uC6D0\uAE30",
      Vile: "\uBE44\uC5F4",
      Viper: "\uB3C5\uC0AC",
      "Viper Aegis": "\uB3C5\uC0AC \uBC29\uD328",
      "Viper Badge": "\uB3C5\uC0AC \uD718\uC7A5",
      "Viper Band": "\uB3C5\uC0AC \uBC18\uC9C0",
      "Viper Barb": "\uB3C5\uC0AC \uBBF8\uB298",
      "Viper Beads": "\uB3C5\uC0AC \uAD6C\uC2AC",
      "Viper Bite": "\uB3C5\uC0AC \uC774\uBE68",
      "Viper Blazer": "\uB3C5\uC0AC \uAC1C\uCC99\uC790",
      "Viper Bludgeon": "\uB3C5\uC0AC \uACE4\uBD09",
      "Viper Bolt": "\uB3C5\uC0AC \uD654\uC0B4",
      "Viper Branch": "\uB3C5\uC0AC \uAC00\uC9C0",
      "Viper Brow": "\uB3C5\uC0AC \uC774\uB9C8",
      "Viper Buckle": "\uB3C5\uC0AC \uBC84\uD074",
      "Viper Call": "\uB3C5\uC0AC \uBD80\uB984",
      "Viper Carapace": "\uB3C5\uC0AC \uAC11\uAC01",
      "Viper Casque": "\uB3C5\uC0AC \uD22C\uAD6C",
      "Viper Chant": "\uB3C5\uC0AC \uCC2C\uAC00",
      "Viper Clasp": "\uB3C5\uC0AC \uAC78\uC1E0",
      "Viper Claw": "\uB3C5\uC0AC \uBC1C\uD1B1",
      "Viper Cleaver": "\uB3C5\uC0AC \uAC00\uB984\uB0A0",
      "Viper Clutches": "\uB3C5\uC0AC \uB9C8\uC218",
      "Viper Coat": "\uB3C5\uC0AC \uC678\uD22C",
      "Viper Coil": "\uB3C5\uC0AC \uACE0\uB9AC",
      "Viper Collar": "\uB3C5\uC0AC \uBAA9\uD14C",
      "Viper Cord": "\uB3C5\uC0AC \uB048",
      "Viper Cowl": "\uB3C5\uC0AC \uC218\uB3C4\uB450\uAC74",
      "Viper Crack": "\uB3C5\uC0AC \uADE0\uC5F4",
      "Viper Crest": "\uB3C5\uC0AC \uBB38\uC7A5",
      "Viper Crusher": "\uB3C5\uC0AC \uBD84\uC1C4\uAE30",
      "Viper Cry": "\uB3C5\uC0AC \uC6B8\uC74C",
      "Viper Dart": "\uB3C5\uC0AC \uD22C\uCC3D",
      "Viper Edge": "\uB3C5\uC0AC \uCE7C\uB0A0",
      "Viper Emblem": "\uB3C5\uC0AC \uC0C1\uC9D5",
      "Viper Eye": "\uB3C5\uC0AC \uB208",
      "Viper Fang": "\uB3C5\uC0AC \uC1A1\uACF3\uB2C8",
      "Viper Finger": "\uB3C5\uC0AC \uC190\uAC00\uB77D",
      "Viper Fist": "\uB3C5\uC0AC \uC8FC\uBA39",
      "Viper Fletch": "\uB3C5\uC0AC \uD654\uC0B4\uAE43",
      "Viper Flight": "\uB3C5\uC0AC \uBE44\uD589",
      "Viper Glare": "\uB3C5\uC0AC \uC12C\uAD11",
      "Viper Gnarl": "\uB3C5\uC0AC \uC639\uC774",
      "Viper Goad": "\uB3C5\uC0AC \uBAB0\uC774\uB9C9\uB300",
      "Viper Gorget": "\uB3C5\uC0AC \uBAA9\uAC00\uB9AC\uAC1C",
      "Viper Grip": "\uB3C5\uC0AC \uC190\uC544\uADC0",
      "Viper Guard": "\uB3C5\uC0AC \uC218\uD638",
      "Viper Gutter": "\uB3C5\uC0AC \uC808\uAC1C",
      "Viper Gyre": "\uB3C5\uC0AC \uC18C\uC6A9\uB3CC\uC774",
      "Viper Hand": "\uB3C5\uC0AC \uC190",
      "Viper Heart": "\uB3C5\uC0AC \uC2EC\uC7A5",
      "Viper Hew": "\uB3C5\uC0AC \uCC0D\uAE30",
      "Viper Hide": "\uB3C5\uC0AC \uAC00\uC8FD",
      "Viper Hold": "\uB3C5\uC0AC \uC6C0\uCF1C\uC960",
      "Viper Hood": "\uB3C5\uC0AC \uB450\uAC74",
      "Viper Horn": "\uB3C5\uC0AC \uBFD4",
      "Viper Impaler": "\uB3C5\uC0AC \uAD00\uD1B5\uC790",
      "Viper Jack": "\uB3C5\uC0AC \uC6C3\uC637",
      "Viper Knell": "\uB3C5\uC0AC \uC870\uC885",
      "Viper Knot": "\uB3C5\uC0AC \uB9E4\uB4ED",
      "Viper Knuckle": "\uB3C5\uC0AC \uC190\uB9C8\uB514",
      "Viper Lance": "\uB3C5\uC0AC \uCC3D",
      "Viper Lash": "\uB3C5\uC0AC \uCC44\uCC0D",
      "Viper Lock": "\uB3C5\uC0AC \uC790\uBB3C\uC1E0",
      "Viper Loop": "\uB3C5\uC0AC \uD14C",
      "Viper Mallet": "\uB3C5\uC0AC \uB9DD\uCE58",
      "Viper Mangler": "\uB3C5\uC0AC \uB09C\uB3C4\uC9C8",
      "Viper Mantle": "\uB3C5\uC0AC \uB9DD\uD1A0",
      "Viper Mark": "\uB3C5\uC0AC \uD45C\uC2DD",
      "Viper Mask": "\uB3C5\uC0AC \uAC00\uBA74",
      "Viper Mauler": "\uB3C5\uC0AC \uD30C\uAD34\uC790",
      "Viper Nails": "\uB3C5\uC0AC \uBABB",
      "Viper Necklace": "\uB3C5\uC0AC \uBAA9\uAC78\uC774",
      "Viper Needle": "\uB3C5\uC0AC \uBC14\uB298",
      "Viper Nock": "\uB3C5\uC0AC \uC2DC\uC704\uD648",
      "Viper Noose": "\uB3C5\uC0AC \uC62C\uAC00\uBBF8",
      "Viper Orb": "\uB3C5\uC0AC \uBCF4\uC8FC",
      "Viper Pelt": "\uB3C5\uC0AC \uBAA8\uD53C",
      "Viper Prod": "\uB3C5\uC0AC \uCC0C\uB974\uAE30",
      "Viper Quarrel": "\uB3C5\uC0AC \uC1E0\uB1CC\uC0B4",
      "Viper Quill": "\uB3C5\uC0AC \uAE43",
      "Viper Razor": "\uB3C5\uC0AC \uBA74\uB3C4\uB0A0",
      "Viper Rend": "\uB3C5\uC0AC \uCC22\uAE40",
      "Viper Road": "\uB3C5\uC0AC \uAE38",
      "Viper Saw": "\uB3C5\uC0AC \uD1B1",
      "Viper Scalpel": "\uB3C5\uC0AC \uD574\uBD80\uCE7C",
      "Viper Scarab": "\uB3C5\uC0AC \uD48D\uB385\uC774",
      "Viper Scourge": "\uB3C5\uC0AC \uC7AC\uC559",
      "Viper Scratch": "\uB3C5\uC0AC \uD560\uD034\uAE30",
      "Viper Scythe": "\uB3C5\uC0AC \uB0AB",
      "Viper Shard": "\uB3C5\uC0AC \uD30C\uD3B8",
      "Viper Shroud": "\uB3C5\uC0AC \uC218\uC758",
      "Viper Slippers": "\uB3C5\uC0AC \uB367\uC2E0",
      "Viper Smasher": "\uB3C5\uC0AC \uBD84\uC1C4\uC790",
      "Viper Song": "\uB3C5\uC0AC \uB178\uB798",
      "Viper Spell": "\uB3C5\uC0AC \uC8FC\uBB38",
      "Viper Sphere": "\uB3C5\uC0AC \uAD6C\uCCB4",
      "Viper Spike": "\uB3C5\uC0AC \uAC00\uC2DC",
      "Viper Spiral": "\uB3C5\uC0AC \uB098\uC120",
      "Viper Spire": "\uB3C5\uC0AC \uCCA8\uD0D1",
      "Viper Splitter": "\uB3C5\uC0AC \uCABC\uAC1C\uB294\uC790",
      "Viper Spur": "\uB3C5\uC0AC \uBC15\uCC28",
      "Viper Stake": "\uB3C5\uC0AC \uB9D0\uB69D",
      "Viper Stalk": "\uB3C5\uC0AC \uCD94\uC801",
      "Viper Star": "\uB3C5\uC0AC \uBCC4",
      "Viper Stinger": "\uB3C5\uC0AC \uB3C5\uCE68",
      "Viper Strap": "\uB3C5\uC0AC \uB760",
      "Viper Suit": "\uB3C5\uC0AC \uAC11\uC637",
      "Viper Sunder": "\uB3C5\uC0AC \uC808\uB2E8",
      "Viper Talisman": "\uB3C5\uC0AC \uBD80\uC801",
      "Viper Thirst": "\uB3C5\uC0AC \uAC08\uC99D",
      "Viper Torc": "\uB3C5\uC0AC \uBAA9\uACE0\uB9AC",
      "Viper Tower": "\uB3C5\uC0AC \uD0D1",
      "Viper Track": "\uB3C5\uC0AC \uBC1C\uC790\uAD6D",
      "Viper Trample": "\uB3C5\uC0AC \uC9D3\uBC1F\uAE30",
      "Viper Turn": "\uB3C5\uC0AC \uD68C\uC804",
      "Viper Veil": "\uB3C5\uC0AC \uC7A5\uB9C9",
      "Viper Visage": "\uB3C5\uC0AC \uC5BC\uAD74",
      "Viper Ward": "\uB3C5\uC0AC \uBCF4\uD638",
      "Viper Weaver": "\uB3C5\uC0AC \uC9C1\uC870\uC790",
      "Viper Wing": "\uB3C5\uC0AC \uB0A0\uAC1C",
      "Viper Wrack": "\uB3C5\uC0AC \uACE0\uBB38",
      Viridian: "\uCCAD\uB85D\uC0C9",
      Visage: "\uC5BC\uAD74",
      Visionary: "\uC120\uACAC\uC9C0\uBA85\uC758",
      "Visit Charsi (T)": "\uCC30\uC2DC \uBC29\uBB38 (T)",
      vitality: "\uD65C\uB825",
      Vodoun: "\uBD80\uB450\uAD50",
      Volcanic: "\uD654\uC0B0\uC758",
      Volcano: "\uD654\uC0B0",
      "Vortex Orb": "\uBCFC\uD14D\uC2A4 \uC624\uBE0C",
      "Vortex Shield": "\uBCFC\uD14D\uC2A4 \uC274\uB4DC",
      Vulpine: "\uAC04\uC0AC\uD55C",
      Wailing: "\uD1B5\uACE1\uD558\uB294",
      "Wake of Fire": "\uBD88\uC758 \uD30C\uB3D9",
      "Wake of Inferno": "\uC9C0\uC625\uBD88\uC758 \uD30C\uB3D9",
      "Walk into the portal to *": "\uCC28\uC6D0\uBB38\uC73C\uB85C \uB4E4\uC5B4\uAC00\uBA74 {0}(\uC73C)\uB85C \uC774\uB3D9",
      "Walk into the portal to Act #": "\uCC28\uC6D0\uBB38\uC73C\uB85C \uB4E4\uC5B4\uAC00\uBA74 {0}\uB9C9\uC73C\uB85C \uC774\uB3D9",
      "Walking Stick": "\uC6CC\uD0B9 \uC2A4\uD2F1",
      Wand: "\uC6D0\uB4DC",
      "War Axe": "\uC6CC \uC561\uC2A4",
      "War Belt": "\uC6CC \uBCA8\uD2B8",
      "War Boots": "\uC6CC \uBD80\uCE20",
      "War Cry": "\uC804\uC7A5\uC758 \uD568\uC131",
      "War Fist": "\uC6CC \uD53C\uC2A4\uD2B8",
      "War Gauntlets": "\uC6CC \uAC74\uD2C0\uB9BF",
      "War Hammer": "\uC6CC \uD574\uBA38",
      "War Hat": "\uC6CC \uD587",
      "War Javelin": "\uC6CC \uC7AC\uBC8C\uB9B0",
      "War Pike": "\uC6CC \uD30C\uC774\uD06C",
      "War Scepter": "\uC6CC \uC149\uD130",
      "War Spear": "\uC6CC \uC2A4\uD53C\uC5B4",
      "War Staff": "\uC6CC \uC2A4\uD0DC\uD504",
      "War Sword": "\uC6CC \uC18C\uB4DC",
      "War Traveler": "\uC804\uC7C1 \uC5EC\uD589\uC790",
      Warcries: "\uD568\uC131",
      Ward: "\uC6CC\uB4DC",
      "Ward Bow": "\uC6CC\uB4DC \uBCF4\uC6B0",
      "Warder's": "\uD30C\uC218\uAFBC\uC758",
      Warmth: "\uC628\uAE30",
      Warp: "\uC65C\uACE1",
      "Warrior's": "\uC804\uC0AC\uC758",
      Weaken: "\uC57D\uD654",
      Weapon: "\uBB34\uAE30",
      "Weapon Block": "\uBB34\uAE30 \uB9C9\uAE30",
      "Weapon masteries, war cries and Whirlwind": "\uBB34\uAE30 \uC219\uB828, \uD568\uC131, \uC18C\uC6A9\uB3CC\uC774",
      wearwolf: "\uB291\uB300\uC778\uAC04",
      Weaver: "\uC9C1\uC870\uC790",
      web: "\uAC70\uBBF8\uC904",
      Weird: "\uAE30\uBB18\uD55C",
      Werebear: "\uACF0\uC778\uAC04",
      "Werebear for #s near monsters: #% less damage taken, +#% life, splashing blows of #": "\uAD34\uBB3C \uADFC\uCC98\uC5D0\uC11C {0}\uCD08\uAC04 \uACF0\uC778\uAC04: \uBC1B\uB294 \uD53C\uD574 {1}% \uAC10\uC18C, \uC0DD\uBA85\uB825 +{2}%, \uBC94\uC704 \uACF5\uACA9 {3}",
      "Werebear for #s: blows of #, each # more a charge up to # (the last stuns)": "{0}\uCD08\uAC04 \uACF0\uC778\uAC04: \uACF5\uACA9 {1}, \uCDA9\uC804\uB2F9 {2} \uC99D\uAC00, \uCD5C\uB300 {3} (\uB9C8\uC9C0\uB9C9 \uCDA9\uC804\uC740 \uAE30\uC808)",
      "Wereform blows add # poison over #s; a bitten monster that dies passes it to # near it": "\uBCC0\uC2E0 \uC0C1\uD0DC\uC758 \uACF5\uACA9\uC5D0 {1}\uCD08\uAC04 {0} \uB3C5 \uD53C\uD574 \uCD94\uAC00; \uBB3C\uB9B0 \uAD34\uBB3C\uC774 \uC8FD\uC73C\uBA74 \uC8FC\uBCC0 {2}\uB9C8\uB9AC\uC5D0\uAC8C \uC804\uC5FC",
      "Wereforms last #s longer, #s more a level, and give +#% more life, +#% a level": "\uBCC0\uC2E0 \uC9C0\uC18D\uC2DC\uAC04 {0}\uCD08 \uC99D\uAC00, \uB808\uBCA8\uB2F9 {1}\uCD08; \uC0DD\uBA85\uB825 +{2}%, \uB808\uBCA8\uB2F9 +{3}%",
      Werewolf: "\uB291\uB300\uC778\uAC04",
      "Werewolf and werebear blows heal #% of their damage": "\uB291\uB300\uC778\uAC04\xB7\uACF0\uC778\uAC04 \uACF5\uACA9 \uD53C\uD574\uC758 {0}%\uB9CC\uD07C \uC0DD\uBA85\uB825 \uD68C\uBCF5",
      "Werewolf for #s near monsters: +#% life, claws of # every #s, +#% crit": "\uAD34\uBB3C \uADFC\uCC98\uC5D0\uC11C {0}\uCD08\uAC04 \uB291\uB300\uC778\uAC04: \uC0DD\uBA85\uB825 +{1}%, {3}\uCD08\uB9C8\uB2E4 {2} \uC190\uD1B1 \uACF5\uACA9, \uCE58\uBA85\uD0C0 +{4}%",
      "Werewolf for #s: a flurry of # blows at all in reach, # damage each, every #s": "{0}\uCD08\uAC04 \uB291\uB300\uC778\uAC04: {3}\uCD08\uB9C8\uB2E4 \uBC94\uC704 \uB0B4 \uBAA8\uB450\uC5D0\uAC8C {1}\uD68C \uC5F0\uD0C0, \uAC01 {2} \uD53C\uD574",
      "What a hero sells stays here": "\uC601\uC6C5\uC774 \uD310 \uBB3C\uAC74\uC740 \uC5EC\uAE30 \uB0A8\uC2B5\uB2C8\uB2E4",
      "When monsters close in, blink on ahead where they're fewest; ready again after #s": "\uAD34\uBB3C\uC774 \uB2E4\uAC00\uC624\uBA74 \uAC00\uC7A5 \uC801\uC740 \uCABD \uC55E\uC73C\uB85C \uC21C\uAC04\uC774\uB3D9; {0}\uCD08 \uD6C4 \uC7AC\uC0AC\uC6A9",
      "When monsters crowd and hurt you, those around you flee in terror for #s (bosses less, act bosses never)": "\uAD34\uBB3C\uC774 \uBAB0\uB824\uB4E4\uC5B4 \uACF5\uACA9\uD558\uBA74 \uC8FC\uBCC0 \uC801\uC774 {0}\uCD08\uAC04 \uAC81\uC5D0 \uC9C8\uB824 \uB2EC\uC544\uB0A8 (\uC6B0\uB450\uBA38\uB9AC\uB294 \uC9E7\uAC8C, \uB9C9 \uC6B0\uB450\uBA38\uB9AC\uB294 \uC81C\uC678)",
      "when struck": "(\uACF5\uACA9\uC744 \uBC1B\uC740 \uACBD\uC6B0)",
      "Whirl # yards through the horde, # damage to each monster # times a second": "\uBB34\uB9AC \uC18D\uC744 {0}\uC57C\uB4DC \uD68C\uC804\uD558\uBA70 \uB3CC\uC9C4, \uAD34\uBB3C\uB9C8\uB2E4 \uCD08\uB2F9 {2}\uD68C {1} \uD53C\uD574",
      Whirlwind: "\uC18C\uC6A9\uB3CC\uC774",
      Widow: "\uACFC\uBD80",
      Widowmaker: "\uACFC\uBD80 \uC81C\uC870\uC790",
      Wight: "\uB9DD\uC790",
      Wind: "\uBC14\uB78C",
      "WINDOWS (BETA)": "WINDOWS (\uBCA0\uD0C0)",
      Wing: "\uB0A0\uAC1C",
      "Winged Axe": "\uC719\uB4DC \uC561\uC2A4",
      "Winged Harpoon": "\uC719\uB4DC \uD558\uD47C",
      "Winged Helm": "\uC719\uB4DC \uD5EC\uB984",
      "Wire Fleece": "\uC640\uC774\uC5B4 \uD50C\uB9AC\uC2A4",
      "Wirt's Leg": "\uC6CC\uD2B8\uC758 \uC758\uC871",
      "Wisp Projector": "\uC704\uC2B5 \uD22C\uC0AC\uAE30",
      "Witch Doctor Endugu": "\uBD80\uB450\uC220\uC0AC \uC5D4\uB450\uAD6C",
      "Witch-hunter's": "\uB9C8\uB140\uC0AC\uB0E5\uAFBC\uC758",
      Witherstring: "\uB9C8\uB978\uC2DC\uC704",
      Wizardspike: "\uB9C8\uBC95\uC0AC\uC758 \uC410\uAE30\uAC80",
      Woestave: "\uC7AC\uC559\uC758 \uC9C0\uD321\uC774",
      Wolf: "\uB291\uB300",
      "Wolf Head": "\uC6B8\uD504 \uD5E4\uB4DC",
      Wolfhowl: "\uC6B8\uBD80\uC9D6\uB294 \uB291\uB300",
      "Worldstone Chamber": "\uC138\uACC4\uC11D \uBCF4\uAD00\uC2E4",
      "Worldstone Keep": "\uC138\uACC4\uC11D \uC131\uCC44",
      Wound: "\uC0C1\uCC98",
      Wrack: "\uACE0\uBB38",
      Wraith: "\uB9DD\uB839",
      "Wraith Aegis": "\uB9DD\uB839 \uBC29\uD328",
      "Wraith Badge": "\uB9DD\uB839 \uD718\uC7A5",
      "Wraith Band": "\uB9DD\uB839 \uBC18\uC9C0",
      "Wraith Barb": "\uB9DD\uB839 \uBBF8\uB298",
      "Wraith Beads": "\uB9DD\uB839 \uAD6C\uC2AC",
      "Wraith Bite": "\uB9DD\uB839 \uC774\uBE68",
      "Wraith Blazer": "\uB9DD\uB839 \uAC1C\uCC99\uC790",
      "Wraith Bludgeon": "\uB9DD\uB839 \uACE4\uBD09",
      "Wraith Bolt": "\uB9DD\uB839 \uD654\uC0B4",
      "Wraith Branch": "\uB9DD\uB839 \uAC00\uC9C0",
      "Wraith Brow": "\uB9DD\uB839 \uC774\uB9C8",
      "Wraith Buckle": "\uB9DD\uB839 \uBC84\uD074",
      "Wraith Call": "\uB9DD\uB839 \uBD80\uB984",
      "Wraith Carapace": "\uB9DD\uB839 \uAC11\uAC01",
      "Wraith Casque": "\uB9DD\uB839 \uD22C\uAD6C",
      "Wraith Chant": "\uB9DD\uB839 \uCC2C\uAC00",
      "Wraith Clasp": "\uB9DD\uB839 \uAC78\uC1E0",
      "Wraith Claw": "\uB9DD\uB839 \uBC1C\uD1B1",
      "Wraith Cleaver": "\uB9DD\uB839 \uAC00\uB984\uB0A0",
      "Wraith Clutches": "\uB9DD\uB839 \uB9C8\uC218",
      "Wraith Coat": "\uB9DD\uB839 \uC678\uD22C",
      "Wraith Coil": "\uB9DD\uB839 \uACE0\uB9AC",
      "Wraith Collar": "\uB9DD\uB839 \uBAA9\uD14C",
      "Wraith Cord": "\uB9DD\uB839 \uB048",
      "Wraith Cowl": "\uB9DD\uB839 \uC218\uB3C4\uB450\uAC74",
      "Wraith Crack": "\uB9DD\uB839 \uADE0\uC5F4",
      "Wraith Crest": "\uB9DD\uB839 \uBB38\uC7A5",
      "Wraith Crusher": "\uB9DD\uB839 \uBD84\uC1C4\uAE30",
      "Wraith Cry": "\uB9DD\uB839 \uC6B8\uC74C",
      "Wraith Dart": "\uB9DD\uB839 \uD22C\uCC3D",
      "Wraith Edge": "\uB9DD\uB839 \uCE7C\uB0A0",
      "Wraith Emblem": "\uB9DD\uB839 \uC0C1\uC9D5",
      "Wraith Eye": "\uB9DD\uB839 \uB208",
      "Wraith Fang": "\uB9DD\uB839 \uC1A1\uACF3\uB2C8",
      "Wraith Finger": "\uB9DD\uB839 \uC190\uAC00\uB77D",
      "Wraith Fist": "\uB9DD\uB839 \uC8FC\uBA39",
      "Wraith Fletch": "\uB9DD\uB839 \uD654\uC0B4\uAE43",
      "Wraith Flight": "\uB9DD\uB839 \uBE44\uD589",
      "Wraith Glare": "\uB9DD\uB839 \uC12C\uAD11",
      "Wraith Gnarl": "\uB9DD\uB839 \uC639\uC774",
      "Wraith Goad": "\uB9DD\uB839 \uBAB0\uC774\uB9C9\uB300",
      "Wraith Gorget": "\uB9DD\uB839 \uBAA9\uAC00\uB9AC\uAC1C",
      "Wraith Grip": "\uB9DD\uB839 \uC190\uC544\uADC0",
      "Wraith Guard": "\uB9DD\uB839 \uC218\uD638",
      "Wraith Gutter": "\uB9DD\uB839 \uC808\uAC1C",
      "Wraith Gyre": "\uB9DD\uB839 \uC18C\uC6A9\uB3CC\uC774",
      "Wraith Hand": "\uB9DD\uB839 \uC190",
      "Wraith Heart": "\uB9DD\uB839 \uC2EC\uC7A5",
      "Wraith Hew": "\uB9DD\uB839 \uCC0D\uAE30",
      "Wraith Hide": "\uB9DD\uB839 \uAC00\uC8FD",
      "Wraith Hold": "\uB9DD\uB839 \uC6C0\uCF1C\uC960",
      "Wraith Hood": "\uB9DD\uB839 \uB450\uAC74",
      "Wraith Horn": "\uB9DD\uB839 \uBFD4",
      "Wraith Impaler": "\uB9DD\uB839 \uAD00\uD1B5\uC790",
      "Wraith Jack": "\uB9DD\uB839 \uC6C3\uC637",
      "Wraith Knell": "\uB9DD\uB839 \uC870\uC885",
      "Wraith Knot": "\uB9DD\uB839 \uB9E4\uB4ED",
      "Wraith Knuckle": "\uB9DD\uB839 \uC190\uB9C8\uB514",
      "Wraith Lance": "\uB9DD\uB839 \uCC3D",
      "Wraith Lash": "\uB9DD\uB839 \uCC44\uCC0D",
      "Wraith Lock": "\uB9DD\uB839 \uC790\uBB3C\uC1E0",
      "Wraith Loop": "\uB9DD\uB839 \uD14C",
      "Wraith Mallet": "\uB9DD\uB839 \uB9DD\uCE58",
      "Wraith Mangler": "\uB9DD\uB839 \uB09C\uB3C4\uC9C8",
      "Wraith Mantle": "\uB9DD\uB839 \uB9DD\uD1A0",
      "Wraith Mark": "\uB9DD\uB839 \uD45C\uC2DD",
      "Wraith Mask": "\uB9DD\uB839 \uAC00\uBA74",
      "Wraith Mauler": "\uB9DD\uB839 \uD30C\uAD34\uC790",
      "Wraith Nails": "\uB9DD\uB839 \uBABB",
      "Wraith Necklace": "\uB9DD\uB839 \uBAA9\uAC78\uC774",
      "Wraith Needle": "\uB9DD\uB839 \uBC14\uB298",
      "Wraith Nock": "\uB9DD\uB839 \uC2DC\uC704\uD648",
      "Wraith Noose": "\uB9DD\uB839 \uC62C\uAC00\uBBF8",
      "Wraith Orb": "\uB9DD\uB839 \uBCF4\uC8FC",
      "Wraith Pelt": "\uB9DD\uB839 \uBAA8\uD53C",
      "Wraith Prod": "\uB9DD\uB839 \uCC0C\uB974\uAE30",
      "Wraith Quarrel": "\uB9DD\uB839 \uC1E0\uB1CC\uC0B4",
      "Wraith Quill": "\uB9DD\uB839 \uAE43",
      "Wraith Razor": "\uB9DD\uB839 \uBA74\uB3C4\uB0A0",
      "Wraith Rend": "\uB9DD\uB839 \uCC22\uAE40",
      "Wraith Road": "\uB9DD\uB839 \uAE38",
      "Wraith Saw": "\uB9DD\uB839 \uD1B1",
      "Wraith Scalpel": "\uB9DD\uB839 \uD574\uBD80\uCE7C",
      "Wraith Scarab": "\uB9DD\uB839 \uD48D\uB385\uC774",
      "Wraith Scourge": "\uB9DD\uB839 \uC7AC\uC559",
      "Wraith Scratch": "\uB9DD\uB839 \uD560\uD034\uAE30",
      "Wraith Scythe": "\uB9DD\uB839 \uB0AB",
      "Wraith Shard": "\uB9DD\uB839 \uD30C\uD3B8",
      "Wraith Shroud": "\uB9DD\uB839 \uC218\uC758",
      "Wraith Slippers": "\uB9DD\uB839 \uB367\uC2E0",
      "Wraith Smasher": "\uB9DD\uB839 \uBD84\uC1C4\uC790",
      "Wraith Song": "\uB9DD\uB839 \uB178\uB798",
      "Wraith Spell": "\uB9DD\uB839 \uC8FC\uBB38",
      "Wraith Sphere": "\uB9DD\uB839 \uAD6C\uCCB4",
      "Wraith Spike": "\uB9DD\uB839 \uAC00\uC2DC",
      "Wraith Spiral": "\uB9DD\uB839 \uB098\uC120",
      "Wraith Spire": "\uB9DD\uB839 \uCCA8\uD0D1",
      "Wraith Splitter": "\uB9DD\uB839 \uCABC\uAC1C\uB294\uC790",
      "Wraith Spur": "\uB9DD\uB839 \uBC15\uCC28",
      "Wraith Stake": "\uB9DD\uB839 \uB9D0\uB69D",
      "Wraith Stalk": "\uB9DD\uB839 \uCD94\uC801",
      "Wraith Star": "\uB9DD\uB839 \uBCC4",
      "Wraith Stinger": "\uB9DD\uB839 \uB3C5\uCE68",
      "Wraith Strap": "\uB9DD\uB839 \uB760",
      "Wraith Suit": "\uB9DD\uB839 \uAC11\uC637",
      "Wraith Sunder": "\uB9DD\uB839 \uC808\uB2E8",
      "Wraith Talisman": "\uB9DD\uB839 \uBD80\uC801",
      "Wraith Thirst": "\uB9DD\uB839 \uAC08\uC99D",
      "Wraith Torc": "\uB9DD\uB839 \uBAA9\uACE0\uB9AC",
      "Wraith Tower": "\uB9DD\uB839 \uD0D1",
      "Wraith Track": "\uB9DD\uB839 \uBC1C\uC790\uAD6D",
      "Wraith Trample": "\uB9DD\uB839 \uC9D3\uBC1F\uAE30",
      "Wraith Turn": "\uB9DD\uB839 \uD68C\uC804",
      "Wraith Veil": "\uB9DD\uB839 \uC7A5\uB9C9",
      "Wraith Visage": "\uB9DD\uB839 \uC5BC\uAD74",
      "Wraith Ward": "\uB9DD\uB839 \uBCF4\uD638",
      "Wraith Weaver": "\uB9DD\uB839 \uC9C1\uC870\uC790",
      "Wraith Wing": "\uB9DD\uB839 \uB0A0\uAC1C",
      "Wraith Wrack": "\uB9DD\uB839 \uACE0\uBB38",
      Wrath: "\uC9C4\uB178",
      "Wrist Blade": "\uB9AC\uC2A4\uD2B8 \uBE14\uB808\uC774\uB4DC",
      "Wrist Spike": "\uB9AC\uC2A4\uD2B8 \uC2A4\uD30C\uC774\uD06C",
      "Wrist Sword": "\uB9AC\uC2A4\uD2B8 \uC18C\uB4DC",
      "Wyand Voidbringer": "\uC640\uC774\uC564\uB4DC \uBCF4\uC774\uB4DC\uBE0C\uB9C1\uC5B4",
      "Wyrm's": "\uACE0\uB8E1\uC758",
      Wyrmhide: "\uC6DC\uD558\uC774\uB4DC",
      "Wyrmhide Boots": "\uC6DC\uD558\uC774\uB4DC \uBD80\uCE20",
      Yelling: "\uACE0\uD568\uCE58\uB294",
      "Yew Wand": "\uC720 \uC6D0\uB4DC",
      "You cleared all five acts* in *, at level *.": "{0} \uB2E4\uC12F \uB9C9\uC744 {1} \uB9CC\uC5D0 \uBAA8\uB450 \uD074\uB9AC\uC5B4, \uB808\uBCA8 {2}.",
      "You cleared all five acts# in #, at level #.": "{0} \uB2E4\uC12F \uB9C9\uC744 {1} \uB9CC\uC5D0 \uBAA8\uB450 \uD074\uB9AC\uC5B4, \uB808\uBCA8 {2}.",
      "You do not have enough gold": "\uACE8\uB4DC\uAC00 \uCDA9\uBD84\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "You fell in ** after *, at level *, having slain * monsters. +* gold (best: *).": "{0}{1}\uC5D0\uC11C {2} \uB9CC\uC5D0 \uC4F0\uB7EC\uC84C\uC2B5\uB2C8\uB2E4. \uB808\uBCA8 {3}, \uCC98\uCE58\uD55C \uAD34\uBB3C {4}. +{5} \uACE8\uB4DC (\uCD5C\uACE0 \uAE30\uB85D: {6}).",
      "You fell in ** after *, at level *.": "{0}{1}\uC5D0\uC11C {2} \uB9CC\uC5D0 \uC4F0\uB7EC\uC84C\uC2B5\uB2C8\uB2E4. \uB808\uBCA8 {3}.",
      "You gambled": "\uB3C4\uBC15 \uACB0\uACFC",
      "You have * gold": "\uBCF4\uC720 \uACE8\uB4DC: {0}",
      "You have * gold \xB7 What a hero sells stays here until that hero's next run": "\uBCF4\uC720 \uACE8\uB4DC: {0} \xB7 \uC601\uC6C5\uC774 \uD310 \uBB3C\uAC74\uC740 \uADF8 \uC601\uC6C5\uC758 \uB2E4\uC74C \uAC8C\uC784\uAE4C\uC9C0 \uC5EC\uAE30 \uB0A8\uC2B5\uB2C8\uB2E4",
      "You have died": "\uC0AC\uB9DD\uD588\uC2B5\uB2C8\uB2E4",
      "You have no room for that": "\uACF5\uAC04\uC774 \uBD80\uC871\uD569\uB2C8\uB2E4",
      "You take #% less damage and have #% more life, renewed every #s": "\uBC1B\uB294 \uD53C\uD574 {0}% \uAC10\uC18C, \uC0DD\uBA85\uB825 {1}% \uC99D\uAC00, {2}\uCD08\uB9C8\uB2E4 \uAC31\uC2E0",
      "Your * one level higher, past their max": "{0} \uB808\uBCA8 +1, \uCD5C\uB300 \uB808\uBCA8 \uCD08\uACFC",
      "Your class can't use this": "\uC774 \uC9C1\uC5C5\uC740 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Your claws and blades poison, # damage a second for #s": "\uC190\uD1B1\uACFC \uCE7C\uB0A0\uC5D0 \uB3C5, {1}\uCD08\uAC04 \uCD08\uB2F9 {0} \uD53C\uD574",
      "Your fire skills burn #% harder, the Hydra's bolts #%": "\uD654\uC5FC \uAE30\uC220 \uD53C\uD574 {0}% \uC99D\uAC00, \uD788\uB4DC\uB77C\uC758 \uD654\uC5FC\uD0C4\uC740 {1}%",
      "Your inventory is full": "\uC778\uBCA4\uD1A0\uB9AC\uAC00 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4",
      "Your inventory is full (C to make room)": "\uC778\uBCA4\uD1A0\uB9AC\uAC00 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4 (C: \uACF5\uAC04 \uD655\uBCF4)",
      "Your inventory is full (tap Character to make room)": "\uC778\uBCA4\uD1A0\uB9AC\uAC00 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4 (\uCE90\uB9AD\uD130\uB97C \uB20C\uB7EC \uACF5\uAC04 \uD655\uBCF4)",
      "Your shadow fights beside you, # damage a blow, # life; every third blow is a kick": "\uADF8\uB9BC\uC790\uAC00 \uACC1\uC5D0\uC11C \uC2F8\uC6C0, \uACF5\uACA9\uB2F9 {0} \uD53C\uD574, \uC0DD\uBA85\uB825 {1}; \uC138 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uBC1C\uCC28\uAE30",
      "Your shadow master, # damage, # life; every third blow a fire, lightning or ice kick": "\uADF8\uB9BC\uC790 \uB2EC\uC778 \uC18C\uD658, \uD53C\uD574 {0}, \uC0DD\uBA85\uB825 {1}; \uC138 \uBC88\uC9F8 \uACF5\uACA9\uB9C8\uB2E4 \uD654\uC5FC\xB7\uBC88\uAC1C\xB7\uC5BC\uC74C \uBC1C\uCC28\uAE30",
      "Your stash is full": "\uBCF4\uAD00\uD568\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4",
      "Zakarum Shield": "\uC790\uCE74\uB8F8 \uC274\uB4DC",
      "Zakarum's Hand": "\uC790\uCE74\uB8F8\uC758 \uC190",
      Zeal: "\uC5F4\uC758",
      Zircon: "\uC9C0\uB974\uCF58",
      Zombie: "\uC880\uBE44",
      "Zombie Head": "\uC880\uBE44 \uD5E4\uB4DC",
      Report: "\uC81C\uBCF4",
      Bug: "\uBC84\uADF8",
      Balance: "\uBC38\uB7F0\uC2A4",
      Idea: "\uC544\uC774\uB514\uC5B4",
      Send: "\uBCF4\uB0B4\uAE30",
      "Sending\u2026": "\uBCF4\uB0B4\uB294 \uC911\u2026",
      "Thanks, sent.": "\uAC10\uC0AC\uD569\uB2C8\uB2E4. \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4.",
      "Couldn't reach the server: it will be sent the next time the game opens.": "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C\uC5D0 \uAC8C\uC784\uC744 \uC5F4 \uB54C \uBCF4\uB0C5\uB2C8\uB2E4.",
      "The report was refused. Shorten the text, or leave the screenshot out, and try again.": "\uC81C\uBCF4\uAC00 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAE00\uC744 \uC904\uC774\uAC70\uB098 \uC2A4\uD06C\uB9B0\uC0F7\uC744 \uBE7C\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
      "Couldn't send it, and there's no room to keep it for later.": "\uBCF4\uB0BC \uC218 \uC5C6\uACE0, \uB098\uC911\uC5D0 \uBCF4\uB0B4\uB3C4\uB85D \uC800\uC7A5\uD560 \uACF5\uAC04\uB3C4 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "What happened, or what would you change? Any language is fine.": "\uBB34\uC2A8 \uC77C\uC774 \uC788\uC5C8\uB098\uC694, \uB610\uB294 \uBB34\uC5C7\uC744 \uBC14\uAFB8\uACE0 \uC2F6\uB098\uC694? \uC5B4\uB5A4 \uC5B8\uC5B4\uB85C \uC368\uB3C4 \uB429\uB2C8\uB2E4.",
      "X (@name) or Reddit (u/name), only if you want a reply": "\uB2F5\uBCC0\uC744 \uC6D0\uD560 \uB54C\uB9CC: X (@\uC774\uB984) \uB610\uB294 Reddit (u/\uC774\uB984)",
      Screenshot: "\uC2A4\uD06C\uB9B0\uC0F7",
      "Include the screenshot": "\uC2A4\uD06C\uB9B0\uC0F7 \uD3EC\uD568",
      "What's sent": "\uBCF4\uB0B4\uB294 \uB0B4\uC6A9",
      "A bug, a balance note or an idea, with your run attached.": "\uBC84\uADF8, \uBC38\uB7F0\uC2A4 \uC758\uACAC, \uC544\uC774\uB514\uC5B4\uB97C \uC9C0\uAE08 \uAC8C\uC784 \uC815\uBCF4\uC640 \uD568\uAED8 \uBCF4\uB0C5\uB2C8\uB2E4.",
      "Write a few words first.": "\uBA3C\uC800 \uBA87 \uB9C8\uB514 \uC801\uC5B4 \uC8FC\uC138\uC694.",
      "A contact is @name (X) or u/name (Reddit).": "\uC5F0\uB77D\uCC98\uB294 @\uC774\uB984 (X) \uB610\uB294 u/\uC774\uB984 (Reddit) \uD615\uC2DD\uC785\uB2C8\uB2E4.",
      "Report a bug, a balance note or an idea from the Esc menu, the death and victory screens or Options: your run, build and gear and a screenshot go with it": "Esc \uBA54\uB274, \uC0AC\uB9DD\xB7\uC2B9\uB9AC \uD654\uBA74, \uC124\uC815\uC5D0\uC11C \uBC84\uADF8, \uBC38\uB7F0\uC2A4 \uC758\uACAC, \uC544\uC774\uB514\uC5B4\uB97C \uC81C\uBCF4\uD558\uC138\uC694. \uAC8C\uC784 \uC9C4\uD589, \uBE4C\uB4DC, \uC7A5\uBE44\uC640 \uC2A4\uD06C\uB9B0\uC0F7\uC774 \uD568\uAED8 \uC804\uC1A1\uB429\uB2C8\uB2E4",
      "EXIT on the main menu no longer freezes the game: the desktop app quits, and the website goes back to the title at once": "\uBA54\uC778 \uBA54\uB274\uC758 \uB098\uAC00\uAE30\uAC00 \uB354 \uC774\uC0C1 \uAC8C\uC784\uC744 \uBA48\uCD94\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: \uB370\uC2A4\uD06C\uD1B1 \uC571\uC740 \uC885\uB8CC\uB418\uBA70, \uC6F9\uC0AC\uC774\uD2B8\uB294 \uC989\uC2DC \uD0C0\uC774\uD2C0 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4",
      "The death screen of a continued run counts its time from where it went on, the same clock as the best time beside it": "\uC774\uC5B4\uC9C4 \uAC8C\uC784\uC758 \uC0AC\uB9DD \uD654\uBA74\uC740 \uC774\uC5B4\uC9C4 \uC2DC\uC810\uBD80\uD130 \uC2DC\uAC04\uC744 \uC149\uB2C8\uB2E4. \uC606\uC758 \uCD5C\uACE0 \uAE30\uB85D\uACFC \uAC19\uC740 \uAE30\uC900\uC785\uB2C8\uB2E4",
      "Weapon skills and some spells can critically strike: a skill's hover shows its chance": "\uBB34\uAE30 \uAE30\uC220\uACFC \uC77C\uBD80 \uC8FC\uBB38\uC5D0\uB9CC \uCE58\uBA85\uD0C0 \uC801\uC6A9: \uAE30\uC220 \uC124\uBA85\uC5D0 \uD655\uB960 \uD45C\uC2DC",
      "Dexterity and every critical strike chance now say which hits can crit: weapon skills and some spells, as each skill's hover shows": "\uBBFC\uCCA9\uACFC \uBAA8\uB4E0 \uCE58\uBA85\uD0C0 \uD655\uB960\uC5D0 \uCE58\uBA85\uD0C0\uAC00 \uC801\uC6A9\uB418\uB294 \uACF5\uACA9\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4: \uBB34\uAE30 \uAE30\uC220\uACFC \uC77C\uBD80 \uC8FC\uBB38\uC774\uBA70, \uAC01 \uAE30\uC220 \uC124\uBA85\uC5D0\uC11C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      "Going on to Nightmare or Hell straight after Baal no longer drops a frame": "\uBC14\uC54C \uCC98\uCE58 \uC9C1\uD6C4 \uC545\uBABD\uC774\uB098 \uC9C0\uC625\uC73C\uB85C \uB118\uC5B4\uAC08 \uB54C \uD654\uBA74\uC774 \uD55C \uD504\uB808\uC784 \uB04A\uAE30\uB294 \uC77C\uC774 \uB354 \uC774\uC0C1 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Patches of floor no longer turn black as you walk into a new area or act": "\uC0C8 \uC9C0\uC5ED\uC774\uB098 \uB9C9\uC73C\uB85C \uB4E4\uC5B4\uAC08 \uB54C \uBC14\uB2E5 \uC77C\uBD80\uAC00 \uAC80\uAC8C \uBCC0\uD558\uB294 \uC77C\uC774 \uB354 \uC774\uC0C1 \uC5C6\uC2B5\uB2C8\uB2E4",
      "CONTINUE on a run saved as an Act I began (a continued difficulty's, or one left through the cow portal) no longer fails to draw the screen while it loads": "1\uB9C9\uC774 \uC2DC\uC791\uB420 \uB54C \uC800\uC7A5\uB41C \uAC8C\uC784(\uC774\uC5B4\uC9C4 \uB09C\uC774\uB3C4\uC758 1\uB9C9, \uB610\uB294 \uC816\uC18C \uCC28\uC6D0\uBB38\uC73C\uB85C \uB5A0\uB09C \uAC8C\uC784)\uC744 \uACC4\uC18D\uD558\uBA74 \uBD88\uB7EC\uC624\uB294 \uB3D9\uC548 \uD654\uBA74\uC774 \uADF8\uB824\uC9C0\uC9C0 \uC54A\uB358 \uBB38\uC81C\uB97C \uACE0\uCCE4\uC2B5\uB2C8\uB2E4",
      "*: your level-* *": "{0}: \uB808\uBCA8 {1} {2}",
      "*: a new hero at level 1": "{0}: \uB808\uBCA8 1 \uC0C8 \uC601\uC6C5",
      "Your level-* * can now enter *.": "\uB808\uBCA8 {0} {1}: \uC774\uC81C {2}\uC5D0 \uB4E4\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "Your hero is saved": "\uC601\uC6C5\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      "From the campfire, * now starts as your level-* *.": "\uC774\uC81C \uBAA8\uB2E5\uBD88\uC5D0\uC11C {0}\uC744 \uC2DC\uC791\uD558\uBA74 \uB808\uBCA8 {1} {2}(\uC73C)\uB85C \uC2DC\uC791\uD569\uB2C8\uB2E4.",
      "Baal's screen and the campfire say when your hero carries on into Nightmare or Hell, and a fresh start there says why it's level 1": "\uC774\uC81C \uBC14\uC54C\uC758 \uD654\uBA74\uACFC \uBAA8\uB2E5\uBD88\uC5D0\uC11C \uC601\uC6C5\uC774 \uC545\uBABD\uC774\uB098 \uC9C0\uC625\uC73C\uB85C \uC774\uC5B4\uC9C0\uB294\uC9C0 \uC54C\uB824 \uC8FC\uBA70, \uADF8\uACF3\uC5D0\uC11C \uC0C8\uB85C \uC2DC\uC791\uD558\uBA74 \uC65C \uB808\uBCA8 1\uC778\uC9C0 \uC54C\uB824 \uC90D\uB2C8\uB2E4",
      "A new hero starts at level 1. Beat Baal on * to carry your hero into *.": "\uC0C8 \uC601\uC6C5\uC740 \uB808\uBCA8 1\uC5D0\uC11C \uC2DC\uC791\uD569\uB2C8\uB2E4. {0}\uC5D0\uC11C \uBC14\uC54C\uC744 \uCC98\uCE58\uD558\uBA74 \uADF8 \uC601\uC6C5\uC73C\uB85C {1}\uC5D0 \uB4E4\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      "Act bosses no longer speed up as Faster Run/Walk does: in view they keep their own pace, so a quick hero can outrun them": "\uC774\uC81C \uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uB2EC\uB9AC\uAE30/\uAC77\uAE30 \uC18D\uB3C4\uC5D0 \uB9DE\uCDB0 \uBE68\uB77C\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD654\uBA74 \uC548\uC5D0\uC11C\uB294 \uC790\uAE30 \uC18D\uB3C4\uB85C \uC6C0\uC9C1\uC774\uBBC0\uB85C \uBE60\uB978 \uC601\uC6C5\uC740 \uC6B0\uB450\uBA38\uB9AC\uB97C \uB530\uB3CC\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
      "A weapon's added fire, cold, lightning, magic and poison damage now hurts monsters immune to physical damage, as in Diablo II: Lightsabre's magic and lightning among them": "\uC774\uC81C \uBB34\uAE30\uC5D0 \uCD94\uAC00\uB41C \uD654\uC5FC, \uB0C9\uAE30, \uBC88\uAC1C, \uB9C8\uBC95, \uB3C5 \uD53C\uD574\uAC00 \uB514\uC544\uBE14\uB85C II\uCC98\uB7FC \uBB3C\uB9AC \uBA74\uC5ED \uAD34\uBB3C\uC5D0\uAC8C\uB3C4 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4. \uB77C\uC774\uD2B8\uC138\uC774\uBC84\uC758 \uB9C8\uBC95\uACFC \uBC88\uAC1C \uD53C\uD574\uB3C4 \uB9C8\uCC2C\uAC00\uC9C0\uC785\uB2C8\uB2E4",
      "A save code holding a rare Paladin shield now imports on another device, and the shield no longer drops out of the stash": "\uC774\uC81C \uD76C\uADC0 \uC131\uAE30\uC0AC \uBC29\uD328\uAC00 \uB4E0 \uC800\uC7A5 \uCF54\uB4DC\uB97C \uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C\uB3C4 \uAC00\uC838\uC62C \uC218 \uC788\uACE0, \uADF8 \uBC29\uD328\uAC00 \uBCF4\uAD00\uD568\uC5D0\uC11C \uC0AC\uB77C\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      Units: "\uC720\uB2DB",
      "Floor tiles": "\uBC14\uB2E5 \uD0C0\uC77C",
      Monsters: "\uAD34\uBB3C",
      Missiles: "\uD22C\uC0AC\uCCB4",
      "Sounds and music": "\uD6A8\uACFC\uC74C\uACFC \uC74C\uC545",
      Heroes: "\uC601\uC6C5",
      Gear: "\uC7A5\uBE44",
      Interface: "\uC778\uD130\uD398\uC774\uC2A4",
      Scenery: "\uBC30\uACBD",
      "Title and menus": "\uD0C0\uC774\uD2C0\uACFC \uBA54\uB274",
      "Pick the folder that holds Diablo II\u2019s .mpq files: *.": "\uB514\uC544\uBE14\uB85C II\uC758 .mpq \uD30C\uC77C\uC774 \uC788\uB294 \uD3F4\uB354\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624: {0}.",
      "Music and speech are optional: *.": "\uC74C\uC545\uACFC \uC74C\uC131\uC740 \uC120\uD0DD \uC0AC\uD56D\uC785\uB2C8\uB2E4: {0}.",
      "This browser has only * free for the site.": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uB294 \uC774 \uC0AC\uC774\uD2B8\uAC00 \uC4F8 \uC218 \uC788\uB294 \uACF5\uAC04\uC774 {0}\uBC16\uC5D0 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "Lord of Destruction isn\u2019t installed there (d2exp.mpq is missing). D2 Survivors needs Diablo II and its expansion.": "\uADF8\uACF3\uC5D0\uB294 \uD30C\uAD34\uC758 \uAD70\uC8FC\uAC00 \uC124\uCE58\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4(d2exp.mpq \uC5C6\uC74C). D2 Survivors\uC5D0\uB294 \uB514\uC544\uBE14\uB85C II\uC640 \uD655\uC7A5\uD329\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
      "patch_d2.mpq is missing: update Diablo II to patch 1.14 first.": "patch_d2.mpq\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4: \uBA3C\uC800 \uB514\uC544\uBE14\uB85C II\uB97C 1.14 \uD328\uCE58\uB85C \uC5C5\uB370\uC774\uD2B8\uD558\uC2ED\uC2DC\uC624.",
      "Play with your own Diablo II": "\uB0B4 \uB514\uC544\uBE14\uB85C II\uB85C \uD50C\uB808\uC774",
      "D2 Survivors reads the art and sound of your Diablo II and Lord of Destruction (1.14) once, in this browser, and keeps them here. Nothing is uploaded.": "D2 Survivors\uAC00 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uB514\uC544\uBE14\uB85C II\uC640 \uD30C\uAD34\uC758 \uAD70\uC8FC(1.14)\uC758 \uADF8\uB798\uD53D\uACFC \uC0AC\uC6B4\uB4DC\uB97C \uD55C \uBC88 \uC77D\uC5B4 \uC5EC\uAE30\uC5D0 \uBCF4\uAD00\uD569\uB2C8\uB2E4. \uC544\uBB34\uAC83\uB3C4 \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
      "Use my own files\u2026": "\uB0B4 \uD30C\uC77C \uC0AC\uC6A9\u2026",
      "That folder won\u2019t do": "\uADF8 \uD3F4\uB354\uB294 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
      "Choose another folder\u2026": "\uB2E4\uB978 \uD3F4\uB354 \uC120\uD0DD\u2026",
      "Reading Diablo II\u2026": "\uB514\uC544\uBE14\uB85C II\uB97C \uC77D\uB294 \uC911\u2026",
      "A few seconds": "\uBA87 \uCD08",
      "Diablo II found": "\uB514\uC544\uBE14\uB85C II\uB97C \uCC3E\uC558\uC2B5\uB2C8\uB2E4",
      Extract: "\uCD94\uCD9C",
      "Change folder": "\uD3F4\uB354 \uBCC0\uACBD",
      "Opening the archives": "\uC544\uCE74\uC774\uBE0C\uB97C \uC5EC\uB294 \uC911",
      Extracting: "\uCD94\uCD9C \uC911",
      "Copying your game files into this browser. This takes a few minutes, once.": "\uAC8C\uC784 \uD30C\uC77C\uC744 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uBCF5\uC0AC\uD558\uB294 \uC911\uC785\uB2C8\uB2E4. \uCC98\uC74C \uD55C \uBC88, \uBA87 \uBD84 \uAC78\uB9BD\uB2C8\uB2E4.",
      Ready: "\uC900\uBE44 \uC644\uB8CC",
      "Your game files are in this browser, and stay here.": "\uAC8C\uC784 \uD30C\uC77C\uC774 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC788\uC73C\uBA70, \uC5EC\uAE30\uC5D0 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4.",
      "Done in * \xB7 *": "{0} \uB9CC\uC5D0 \uC644\uB8CC \xB7 {1}",
      Play: "\uD50C\uB808\uC774",
      "The extraction stopped": "\uCD94\uCD9C\uC774 \uC911\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      "Try again": "\uB2E4\uC2DC \uC2DC\uB3C4",
      "Update your game files": "\uAC8C\uC784 \uD30C\uC77C \uC5C5\uB370\uC774\uD2B8",
      "This version of D2 Survivors reads some of your game files differently. Extract them again to play with them.": "\uC774 \uBC84\uC804\uC758 D2 Survivors\uB294 \uC77C\uBD80 \uAC8C\uC784 \uD30C\uC77C\uC744 \uB2E4\uB974\uAC8C \uC77D\uC2B5\uB2C8\uB2E4. \uADF8 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD558\uB824\uBA74 \uB2E4\uC2DC \uCD94\uCD9C\uD558\uC2ED\uC2DC\uC624.",
      "Only those are copied again, from your Diablo II folder.": "\uB514\uC544\uBE14\uB85C II \uD3F4\uB354\uC5D0\uC11C \uADF8 \uD30C\uC77C\uB9CC \uB2E4\uC2DC \uBCF5\uC0AC\uD569\uB2C8\uB2E4.",
      "Update game files": "\uAC8C\uC784 \uD30C\uC77C \uC5C5\uB370\uC774\uD2B8",
      "Your game files": "\uB0B4 \uAC8C\uC784 \uD30C\uC77C",
      "Extracted on * \xB7 *": "{0} \uCD94\uCD9C \xB7 {1}",
      "The game plays with them.": "\uAC8C\uC784\uC774 \uC774 \uD30C\uC77C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "Play with my files": "\uB0B4 \uD30C\uC77C\uB85C \uD50C\uB808\uC774",
      "Extract again\u2026": "\uB2E4\uC2DC \uCD94\uCD9C\u2026",
      "Remove from this browser": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC0AD\uC81C",
      "Play with your own Diablo II on the website: pick its folder once, and the game reads its art and sound from this browser, with nothing to download": "\uC6F9\uC0AC\uC774\uD2B8\uC5D0\uC11C \uB0B4 \uB514\uC544\uBE14\uB85C II\uB85C \uD50C\uB808\uC774: \uD3F4\uB354\uB97C \uD55C \uBC88 \uC120\uD0DD\uD558\uBA74 \uAC8C\uC784\uC774 \uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uADF8\uB798\uD53D\uACFC \uC0AC\uC6B4\uB4DC\uB97C \uC77D\uC73C\uBA70, \uB0B4\uB824\uBC1B\uC744 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
      "GAME FILES": "\uAC8C\uC784 \uD30C\uC77C",
      "Diablo II\u2019s * are missing from that folder.": "\uADF8 \uD3F4\uB354\uC5D0 \uB514\uC544\uBE14\uB85C II\uC758 {0} \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "Diablo II\u2019s * is missing from that folder.": "\uADF8 \uD3F4\uB354\uC5D0 \uB514\uC544\uBE14\uB85C II\uC758 {0} \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "* are missing: the game plays without that music or speech.": "{0} \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: \uADF8 \uC74C\uC545\uC774\uB098 \uC74C\uC131 \uC5C6\uC774 \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "* is missing: the game plays without that music or speech.": "{0} \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: \uADF8 \uC74C\uC545\uC774\uB098 \uC74C\uC131 \uC5C6\uC774 \uD50C\uB808\uC774\uD569\uB2C8\uB2E4.",
      "It keeps about * in this browser, and asks the browser to keep it for good.": "\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC57D {0}\uB97C \uBCF4\uAD00\uD558\uBA70, \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uACC4\uC18D \uBCF4\uAD00\uD574 \uB2EC\uB77C\uACE0 \uC694\uCCAD\uD569\uB2C8\uB2E4.",
      "How it works": "\uC791\uB3D9 \uBC29\uC2DD",
      "# of #": "{0}/{1}",
      "That folder isn\u2019t a Diablo II install: d2data.mpq isn\u2019t in it, nor D2R\u2019s .build.info. Pick the folder that holds Diablo II\u2019s .mpq files, or Diablo II: Resurrected\u2019s.": "\uADF8 \uD3F4\uB354\uB294 \uB514\uC544\uBE14\uB85C II \uC124\uCE58 \uD3F4\uB354\uAC00 \uC544\uB2D9\uB2C8\uB2E4: d2data.mpq\uB3C4, \uB808\uC800\uB809\uC158\uC758 .build.info\uB3C4 \uC5C6\uC2B5\uB2C8\uB2E4. \uB514\uC544\uBE14\uB85C II\uC758 .mpq \uD30C\uC77C\uC774 \uC788\uB294 \uD3F4\uB354\uB098 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uD3F4\uB354\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624.",
      "A Diablo II: Resurrected install works too: pick its folder, the one with .build.info. Its sounds and music are D2R\u2019s own.": "\uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158 \uC124\uCE58\uB3C4 \uB429\uB2C8\uB2E4: .build.info\uAC00 \uC788\uB294 \uD3F4\uB354\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624. \uD6A8\uACFC\uC74C\uACFC \uC74C\uC545\uC740 \uB808\uC800\uB809\uC158\uC758 \uAC83\uC785\uB2C8\uB2E4.",
      "Diablo II: Resurrected found": "\uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC744 \uCC3E\uC558\uC2B5\uB2C8\uB2E4",
      "Sounds and music from Diablo II: Resurrected.": "\uD6A8\uACFC\uC74C\uACFC \uC74C\uC545\uC740 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uAC83\uC785\uB2C8\uB2E4.",
      "D2 Survivors plays with the art and sound of your own Diablo II and Lord of Destruction, or Diablo II: Resurrected. It copies them once, into its own folder on this computer. Nothing is sent anywhere; it only asks d2survivors.lol for newer builds.": "D2 Survivors\uB294 \uB0B4 \uB514\uC544\uBE14\uB85C II\uC640 \uD30C\uAD34\uC758 \uAD70\uC8FC, \uB610\uB294 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uADF8\uB798\uD53D\uACFC \uC0AC\uC6B4\uB4DC\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4. \uC774 \uCEF4\uD4E8\uD130\uC758 \uC790\uCCB4 \uD3F4\uB354\uC5D0 \uD55C \uBC88 \uBCF5\uC0AC\uD558\uBA70, \uC544\uBB34\uAC83\uB3C4 \uBCF4\uB0B4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC0C8 \uBE4C\uB4DC\uAC00 \uC788\uB294\uC9C0\uB9CC d2survivors.lol\uC5D0 \uD655\uC778\uD569\uB2C8\uB2E4.",
      "Point D2 Survivors at the folder that holds Diablo II\u2019s .mpq files, or Diablo II: Resurrected\u2019s.": "\uB514\uC544\uBE14\uB85C II\uC758 .mpq \uD30C\uC77C\uC774 \uC788\uB294 \uD3F4\uB354\uB098 \uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uD3F4\uB354\uB97C D2 Survivors\uC5D0 \uC54C\uB824 \uC8FC\uC2ED\uC2DC\uC624.",
      "Sounds and music from Diablo II: Resurrected": "\uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uC758 \uD6A8\uACFC\uC74C\uACFC \uC74C\uC545",
      "Diablo II: Resurrected works too: the website and the desktop app take its folder, with its own sounds and music. The desktop app copies your game files once more after this update": "\uB514\uC544\uBE14\uB85C II: \uB808\uC800\uB809\uC158\uB3C4 \uB429\uB2C8\uB2E4: \uC6F9\uC0AC\uC774\uD2B8\uC640 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC774 \uB808\uC800\uB809\uC158 \uD3F4\uB354\uB97C \uBC1B\uC544 \uADF8 \uD6A8\uACFC\uC74C\uACFC \uC74C\uC545\uC73C\uB85C \uD50C\uB808\uC774\uD569\uB2C8\uB2E4. \uC774\uBC88 \uC5C5\uB370\uC774\uD2B8 \uB4A4 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC740 \uAC8C\uC784 \uD30C\uC77C\uC744 \uD55C \uBC88 \uB354 \uBCF5\uC0AC\uD569\uB2C8\uB2E4",
      "On a phone, switching to another app and back no longer leaves the screen black: the game is drawn again as you left it, paused until you tap RETURN TO GAME": "\uD734\uB300\uD3F0\uC5D0\uC11C \uB2E4\uB978 \uC571\uC73C\uB85C \uC804\uD658\uD588\uB2E4\uAC00 \uB3CC\uC544\uC640\uB3C4 \uB354 \uC774\uC0C1 \uD654\uBA74\uC774 \uAC80\uAC8C \uB0A8\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uAC8C\uC784\uC774 \uB5A0\uB0A0 \uB54C \uBAA8\uC2B5 \uADF8\uB300\uB85C \uB2E4\uC2DC \uADF8\uB824\uC9C0\uBA70, \uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30\uB97C \uB204\uB97C \uB54C\uAE4C\uC9C0 \uC77C\uC2DC \uC815\uC9C0\uB429\uB2C8\uB2E4",
      "Monsters that flee (Howl, Terror, Hit Causes Monster to Flee) come back, as in Diablo II, instead of vanishing for good with their experience and drops": "\uB3C4\uB9DD\uCE5C \uAD34\uBB3C(\uD3EC\uD6A8, \uACF5\uD3EC, \uC801\uC911 \uC2DC \uAD34\uBB3C \uB3C4\uC8FC)\uC774 \uACBD\uD5D8\uCE58\uC640 \uC804\uB9AC\uD488\uC9F8 \uC601\uC601 \uC0AC\uB77C\uC9C0\uC9C0 \uC54A\uACE0, \uB514\uC544\uBE14\uB85C II\uCC98\uB7FC \uB2E4\uC2DC \uB3CC\uC544\uC635\uB2C8\uB2E4",
      "Monsters out of sight as an act's boss falls leave their experience gems too": "\uB9C9 \uC6B0\uB450\uBA38\uB9AC\uAC00 \uC4F0\uB7EC\uC9C8 \uB54C \uD654\uBA74 \uBC16\uC5D0 \uC788\uB358 \uAD34\uBB3C\uB3C4 \uACBD\uD5D8\uCE58 \uBCF4\uC11D\uC744 \uB0A8\uAE41\uB2C8\uB2E4",
      "Portals, smiths and dropped loot no longer land inside a statue or a tree where you can't reach them": "\uC774\uC81C \uD3EC\uD138, \uB300\uC7A5\uC7A5\uC774, \uB5A8\uC5B4\uC9C4 \uC804\uB9AC\uD488\uC774 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uC11D\uC0C1\uC774\uB098 \uB098\uBB34 \uC548\uC5D0 \uB193\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
      "The website has a FAQ and its privacy and legal pages, in English and Korean, and Ko-fi tips that buy nothing in the game": "\uC6F9\uC0AC\uC774\uD2B8\uC5D0 \uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38\uACFC \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\xB7\uBC95\uC801 \uACE0\uC9C0 \uD398\uC774\uC9C0\uAC00 \uD55C\uAD6D\uC5B4\uC640 \uC601\uC5B4\uB85C \uC0DD\uACBC\uACE0, \uAC8C\uC784 \uC548\uC5D0\uC11C\uB294 \uC544\uBB34\uAC83\uB3C4 \uC0AC\uC9C0 \uC54A\uB294 \uCF54\uD30C\uC774 \uD6C4\uC6D0\uB3C4 \uC0DD\uACBC\uC2B5\uB2C8\uB2E4",
      "The Windows app no longer slows down over a long session: its graphics memory stays flat instead of growing until a restart": "\uC774\uC81C Windows \uC571\uC744 \uC624\uB798 \uD50C\uB808\uC774\uD574\uB3C4 \uB290\uB824\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uADF8\uB798\uD53D \uBA54\uBAA8\uB9AC\uAC00 \uC7AC\uC2DC\uC791\uD560 \uB54C\uAE4C\uC9C0 \uACC4\uC18D \uB298\uC5B4\uB098\uC9C0 \uC54A\uACE0 \uC77C\uC815\uD558\uAC8C \uC720\uC9C0\uB429\uB2C8\uB2E4",
      "Copy details": "\uC138\uBD80 \uC815\uBCF4 \uBCF5\uC0AC",
      "Back to game": "\uAC8C\uC784\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
      "Your computer couldn\u2019t read a game file.": "\uCEF4\uD4E8\uD130\uAC00 \uAC8C\uC784 \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      "On an external or network drive? Keep it connected.": "\uC678\uC7A5 \uB4DC\uB77C\uC774\uBE0C\uB098 \uB124\uD2B8\uC6CC\uD06C \uB4DC\uB77C\uC774\uBE0C\uC5D0 \uC788\uC2B5\uB2C8\uAE4C? \uC5F0\uACB0\uB41C \uC0C1\uD0DC\uB85C \uB450\uC2ED\uC2DC\uC624.",
      "In OneDrive, iCloud or Dropbox? Set it to always keep on this device.": "OneDrive, iCloud, Dropbox \uD3F4\uB354\uC5D0 \uC788\uC2B5\uB2C8\uAE4C? '\uD56D\uC0C1 \uC774 \uC7A5\uCE58\uC5D0 \uC720\uC9C0'\uB85C \uC124\uC815\uD558\uC2ED\uC2DC\uC624.",
      "Close Diablo II and let Battle.net finish updating, then try again.": "\uB514\uC544\uBE14\uB85C II\uB97C \uB2EB\uACE0 Battle.net\uC758 \uC5C5\uB370\uC774\uD2B8\uAC00 \uB05D\uB098\uBA74 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "D2 Survivors wasn\u2019t allowed to read a game file.": "D2 Survivors\uC5D0 \uAC8C\uC784 \uD30C\uC77C\uC744 \uC77D\uC744 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "An antivirus may be blocking it: allow D2 Survivors, or move the game to a normal folder, then try again.": "\uBC31\uC2E0 \uD504\uB85C\uADF8\uB7A8\uC774 \uB9C9\uACE0 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4: D2 Survivors\uB97C \uD5C8\uC6A9\uD558\uAC70\uB098 \uAC8C\uC784\uC744 \uC77C\uBC18 \uD3F4\uB354\uB85C \uC62E\uAE34 \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "A game file is missing.": "\uAC8C\uC784 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      "Repair the game in Battle.net (Options, then Scan and Repair), then try again.": "Battle.net\uC5D0\uC11C \uAC8C\uC784\uC744 \uBCF5\uAD6C\uD55C \uB4A4(\uC635\uC158, \uAC80\uC0AC \uBC0F \uBCF5\uAD6C) \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "This computer\u2019s disk is full.": "\uC774 \uCEF4\uD4E8\uD130\uC758 \uB514\uC2A4\uD06C\uAC00 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4.",
      "Free some space, then try again.": "\uACF5\uAC04\uC744 \uD655\uBCF4\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624.",
      "Something went wrong while copying the game files.": "\uAC8C\uC784 \uD30C\uC77C\uC744 \uBCF5\uC0AC\uD558\uB294 \uC911 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC2B5\uB2C8\uB2E4.",
      "Try again. If it stops again, copy the details for a report.": "\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2ED\uC2DC\uC624. \uB610 \uBA48\uCD94\uBA74 \uC138\uBD80 \uC815\uBCF4\uB97C \uBCF5\uC0AC\uD574 \uC2E0\uACE0\uD558\uC2ED\uC2DC\uC624.",
      "The desktop app tries again when the disk fails to read a game file for a moment, and one that keeps failing now says plainly what to try": "\uB370\uC2A4\uD06C\uD1B1 \uC571\uC774 \uB514\uC2A4\uD06C\uAC00 \uC7A0\uC2DC \uAC8C\uC784 \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD558\uBA74 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uBA70, \uACC4\uC18D \uC2E4\uD328\uD558\uBA74 \uBB34\uC5C7\uC744 \uD574 \uBCFC\uC9C0 \uC54C\uAE30 \uC27D\uAC8C \uC54C\uB824 \uC90D\uB2C8\uB2E4",
      "d2survivors.lol always opens on its own page now, returning players too: PLAY IN THE BROWSER takes you into the game": "\uC774\uC81C d2survivors.lol\uC740 \uB3CC\uC544\uC628 \uD50C\uB808\uC774\uC5B4\uC5D0\uAC8C\uB3C4 \uD56D\uC0C1 \uC18C\uAC1C \uD398\uC774\uC9C0\uBD80\uD130 \uBCF4\uC5EC \uC90D\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD50C\uB808\uC774\uB97C \uB204\uB974\uBA74 \uAC8C\uC784\uC73C\uB85C \uB4E4\uC5B4\uAC11\uB2C8\uB2E4"
    };
  }
});

// src/game/lang/dom.ts
var dom_exports = {};
__export(dom_exports, {
  translatePage: () => translatePage
});
function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    const text = node.nodeValue ?? "";
    if (given.get(node) === text) return;
    const translated = tr(text);
    given.set(node, translated);
    if (translated !== text) node.nodeValue = translated;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node;
  if (element.matches(SKIP)) return;
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute(name);
    if (!value) continue;
    const translated = tr(value);
    if (translated !== value) element.setAttribute(name, translated);
  }
  for (const child of element.childNodes) translateNode(child);
}
function translatePage() {
  const start2 = () => {
    translateNode(document.body);
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") record.addedNodes.forEach(translateNode);
        else translateNode(record.target);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  };
  if (document.body) start2();
  else document.addEventListener("DOMContentLoaded", start2, { once: true });
}
var SKIP, ATTRIBUTES, given;
var init_dom = __esm({
  "src/game/lang/dom.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_lang();
    SKIP = "script,style,textarea,input,code,pre,canvas,[data-no-translate]";
    ATTRIBUTES = ["title", "aria-label", "placeholder", "alt"];
    given = /* @__PURE__ */ new WeakMap();
  }
});

// src/game/lang/index.ts
function hasD2RFonts() {
  return d2rFonts;
}
function language() {
  if (chosen === null) {
    let kept = null;
    try {
      kept = localStorage.getItem(KEY2);
    } catch {
    }
    const browser = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language];
    chosen = kept === "en" || kept === "ko" ? kept : browser.some((l) => /^ko\b/i.test(l)) ? "ko" : "en";
  }
  return chosen;
}
function tr(text) {
  return translator ? translator.translate(text) : text;
}
function missingText() {
  return [...translator?.missing ?? []];
}
async function startLanguage() {
  if (language() !== "ko") return;
  document.documentElement.lang = "ko";
  const [ours] = await Promise.all([Promise.resolve().then(() => __toESM(require_ko(), 1)).then((m) => m.default), loadHangul()]);
  translator = new Translator([ours]);
  if (define_import_meta_env_default.DEV) Object.assign(window, { missingText });
  const { translatePage: translatePage2 } = await Promise.resolve().then(() => (init_dom(), dom_exports));
  translatePage2();
}
async function loadHangul() {
  if (typeof FontFace === "undefined") return;
  const unicodeRange = "U+1100-11FF, U+3130-318F, U+AC00-D7A3";
  const load = async (family2, url) => {
    try {
      document.fonts.add(await new FontFace(family2, `url(${url})`, { unicodeRange }).load());
      return true;
    } catch {
      return false;
    }
  };
  const d2r = await Promise.all(KOREAN_FONTS.map(([family2, file]) => load(family2, new URL(`../fonts-ko/${file}`, document.baseURI).href)));
  d2rFonts = d2r.every(Boolean);
  if (d2rFonts) return;
  console.warn("D2R's Korean fonts aren't here (tools/korean-fonts.ts): Hangul falls back to Galmuri");
  await Promise.all([load(HANGUL_FONT, Galmuri11_Bold_default), load(HANGUL_FONT_MIDDLE, Galmuri14_default)]);
}
var LANGUAGE_NAMES, LANGUAGES, HANGUL_FONT, HANGUL_FONT_MIDDLE, KOREAN_TITLE, KOREAN_TEXT, KOREAN_FONTS, d2rFonts, KEY2, chosen, translator;
var init_lang = __esm({
  "src/game/lang/index.ts"() {
    "use strict";
    init_define_import_meta_env();
    init_Galmuri11_Bold();
    init_Galmuri14();
    init_translate();
    LANGUAGE_NAMES = { en: "ENGLISH", ko: "\uD55C\uAD6D\uC5B4" };
    LANGUAGES = Object.keys(LANGUAGE_NAMES);
    HANGUL_FONT = "D2 Hangul";
    HANGUL_FONT_MIDDLE = "D2 Hangul 14";
    KOREAN_TITLE = "D2R Kodia";
    KOREAN_TEXT = "D2R Iris";
    KOREAN_FONTS = [
      [KOREAN_TITLE, "kodia.woff2"],
      [KOREAN_TEXT, "irisl.woff2"]
    ];
    d2rFonts = false;
    KEY2 = "d2s:lang";
    chosen = null;
    translator = null;
  }
});

// desktop/setup/setup.ts
init_define_import_meta_env();

// src/game/audio.ts
init_define_import_meta_env();

// src/game/areas.ts
init_define_import_meta_env();
function areaKey(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim().replace(/^the /, "");
}

// src/game/voice.ts
init_define_import_meta_env();
var VOICE_COOLDOWNS = {
  inventoryFull: 12,
  impossible: 4
};
var VOICE_GAP = 0.3;
var Voice = class {
  /** When the line speaking ends. */
  until = -Infinity;
  last = /* @__PURE__ */ new Map();
  /** Whether `moment`'s line may start at `now` (seconds, any clock that only goes forward). */
  free(moment, now) {
    const since = now - (this.last.get(moment) ?? -Infinity);
    return now >= this.until + VOICE_GAP && since >= (VOICE_COOLDOWNS[moment] ?? 0);
  }
  /** A line for `moment` started at `now` and lasts `length` seconds. */
  spoke(moment, now, length) {
    this.until = now + length;
    this.last.set(moment, now);
  }
};

// src/game/d2url.ts
init_define_import_meta_env();

// src/game/ownFiles/choice.ts
init_define_import_meta_env();
var KEY = "d2s:files";
function filesChoice() {
  try {
    const kept = localStorage.getItem(KEY);
    return kept === "own" || kept === "hosted" ? kept : null;
  } catch {
    return null;
  }
}
function onSetupPage() {
  return typeof location !== "undefined" && /\/setup\.html$/.test(location.pathname);
}
function ownFilesInUse() {
  if (typeof navigator === "undefined" || typeof location === "undefined") return false;
  if (onSetupPage()) return true;
  return filesChoice() === "own" && !!navigator.serviceWorker?.controller;
}

// src/game/d2url.ts
var files = (() => {
  if (ownFilesInUse()) return null;
  try {
    const text = document.getElementById("d2-files")?.textContent;
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
})();
var webpFolders = new Set(files?.webp);
var recoloredLooks = new Set(files?.recolors);
var D2_BASE = define_import_meta_env_default?.VITE_D2_BASE || "../d2/";
var webp = false;
function d2Url(file, tag = "", { png = false } = {}) {
  const slash = file.lastIndexOf("/");
  const folder = slash < 0 ? "" : file.slice(0, slash);
  const hash = files?.hashes[folder];
  if (!hash) return `${D2_BASE}${file}${tag}`;
  const name = webp && !png && webpFolders.has(folder) && file.endsWith(".png") ? `${file.slice(0, -4)}.webp` : file;
  return `${D2_BASE}${name}?h=${hash}`;
}

// src/game/cosmeticRandom.ts
init_define_import_meta_env();
var native = Math.random;
function cosmeticRandom() {
  return native();
}

// src/game/audio.ts
var DEFAULT_RULE = { max: 3, gap: 0.04, jitter: 0.04 };
var RULES = {
  "*.hit": { max: 2, gap: 0.08, jitter: 0.08 },
  "*.death": { max: 4, gap: 0.05, jitter: 0.08 },
  "*.cast": { max: 2, gap: 0.08 },
  "*.travel": { max: 3, gap: 0.08 },
  // Each class adds its skills' rules (ClassDef.soundRules) and its hero's hit and death (heroSoundRules) when picked.
  "taunt.*": { max: 1, jitter: 0 },
  "*.attack1": { max: 3, gap: 0.08, jitter: 0.08 },
  "*.attack2": { max: 3, gap: 0.08, jitter: 0.08 },
  "*.weapon1": { max: 3, gap: 0.06, jitter: 0.08 },
  "*.weapon2": { max: 3, gap: 0.06, jitter: 0.08 },
  "*.neutral": { max: 2, gap: 0.5, jitter: 0.06 },
  // The hero's own lines (speak), never pitched off its voice.
  "voice.*": { max: 1, gap: 0, jitter: 0 },
  "curse.amplify": { max: 1, gap: 0.5, jitter: 0 },
  "curse.decrepify": { max: 1, gap: 0.5, jitter: 0 },
  "diablo.yell": { max: 1, jitter: 0 },
  boss: { max: 1, jitter: 0 },
  levelUp: { max: 1, gap: 0.3, jitter: 0 },
  // Charsi speaks one line at a time, and so does each act's smith by its portal (HOR-489, smith.ts).
  "charsi.*": { max: 1, jitter: 0 },
  "fara.*": { max: 1, jitter: 0 },
  "hratli.*": { max: 1, jitter: 0 },
  "halbu.*": { max: 1, jitter: 0 },
  "larzuk.*": { max: 1, jitter: 0 },
  click: { max: 2, jitter: 0 },
  "pickup.*": { gap: 0.06 },
  "drop.*": { gap: 0.06 }
};
var MAX_VOICES = 48;
var FADE = 0.15;
var CROSSFADE = 2.5;
var EVENT_FARTHEST = 0.4;
var EVENT_PAN = 0.8;
var AMBIENCE_TICK = 200;
var SETTINGS_KEY = "d2-survivors/audio/v2";
var OLD_SETTINGS_KEY = "d2-survivors/audio/v1";
function sliderGain(position) {
  return level(position) ** 2;
}
var MASTER_LEVEL = 10 ** (-2 / 20);
var GLUE = { threshold: -12, knee: 6, ratio: 8, attack: 3e-3, release: 0.25 };
var GLUE_MAKEUP_DB = 5.11;
var LIMITER = { threshold: -3, knee: 0, ratio: 20, attack: 1e-3, release: 0.1 };
var LIMITER_MAKEUP_DB = 1.71;
var manifest = null;
var settings = loadSettings();
var ctx = null;
var master = null;
var sfxBus = null;
var sfxFader = null;
var musicBus = null;
var fetched = /* @__PURE__ */ new Map();
var UI_SOUNDS = ["click"];
var pinnedFiles = /* @__PURE__ */ new Set();
var buffers = /* @__PURE__ */ new Map();
var playing = /* @__PURE__ */ new Map();
var lastStart = /* @__PURE__ */ new WeakMap();
var voices = 0;
var wantedTrack = null;
var track = null;
var wantedAmbience = null;
var ambience = null;
var voice = new Voice();
function tap(event) {
  if (!define_import_meta_env_default.DEV) return;
  globalThis.__soundTap?.(event);
}
function tapVariant(key) {
  const def = manifest?.sounds[key];
  if (!def?.variants.length) return null;
  const variant = def.variants[Math.floor(cosmeticRandom() * def.variants.length)];
  return { def, variant, volume: variant.volume ?? def.volume };
}
function initAudio(loaded) {
  if (manifest || !loaded) return;
  manifest = loaded;
  loadSounds((key) => UI_SOUNDS.includes(key));
  addEventListener("keydown", unlock, true);
  addEventListener("pointerdown", unlock, true);
  addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("button")) play("click");
  });
}
function addAudio(extra) {
  if (!manifest) initAudio({ sounds: {}, music: {}, drops: {} });
  if (!manifest) return;
  Object.assign(manifest.sounds, extra.sounds);
  Object.assign(manifest.music, extra.music);
  if (ctx) switchTrack();
}
function unloadSounds(keys, keep) {
  for (const key of keys) {
    for (const { file } of manifest?.sounds[key]?.variants ?? []) {
      if (pinnedFiles.has(file) || keep?.has(file)) continue;
      fetched.delete(file);
      buffers.delete(file);
    }
  }
}
function loadSounds(wanted) {
  if (!manifest) return;
  const keys = Object.keys(manifest.sounds).filter(wanted);
  for (const key of keys) for (const { file } of manifest.sounds[key].variants) pinnedFiles.add(file);
  fetchSounds(keys);
}
function play(key, options = {}) {
  try {
    startSound(key, options);
  } catch (e) {
    console.warn(`Couldn't play ${key}`, e);
  }
}
function startSound(key, options) {
  const def = manifest?.sounds[key];
  if (define_import_meta_env_default.DEV) {
    const picked = tapVariant(key);
    if (picked) {
      const { variant: variant2, volume: volume2 } = picked;
      const rule2 = ruleFor(key);
      tap({ kind: "sound", key, file: variant2.file, volume: volume2 * (options.volume ?? 1), delay: options.delay ?? 0, duration: options.duration ?? rule2.duration, loop: variant2.loop, rule: rule2 });
    }
  }
  if (!ctx || !sfxBus || !def || settings.muted || voices >= MAX_VOICES) return null;
  const rule = ruleFor(key);
  const now = ctx.currentTime;
  const state2 = playing.get(key) ?? { count: 0, last: -Infinity };
  if (state2.count >= rule.max || now - state2.last < rule.gap) return null;
  const variant = def.variants[Math.floor(cosmeticRandom() * def.variants.length)];
  const buffer = buffers.get(variant.file);
  if (!buffer || now - (lastStart.get(buffer) ?? -Infinity) < 0.02) return null;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 1 + (cosmeticRandom() * 2 - 1) * rule.jitter;
  const gain = ctx.createGain();
  const volume = (variant.volume ?? def.volume) * (options.volume ?? 1);
  gain.gain.value = volume;
  source.connect(gain).connect(sfxBus);
  const start2 = now + (options.delay ?? 0);
  const duration = options.duration ?? rule.duration;
  if (duration !== void 0 && variant.loop && duration > buffer.duration) {
    source.loop = true;
    [source.loopStart, source.loopEnd] = variant.loop;
  }
  source.start(start2);
  if (duration !== void 0) {
    const end = start2 + duration;
    gain.gain.setValueAtTime(volume, Math.max(start2, end - FADE));
    gain.gain.linearRampToValueAtTime(0, end);
    source.stop(end);
  }
  state2.count++;
  state2.last = now;
  playing.set(key, state2);
  lastStart.set(buffer, now);
  voices++;
  source.onended = () => {
    state2.count--;
    voices--;
    gain.disconnect();
  };
  return (options.delay ?? 0) + (duration ?? buffer.duration / source.playbackRate.value);
}
function playMusic(name) {
  if (define_import_meta_env_default.DEV && name !== wantedTrack) {
    const def = name ? manifest?.music[name] : void 0;
    tap({ kind: "music", name, file: def?.file, volume: def?.volume });
  }
  wantedTrack = name;
  if (ctx) switchTrack();
  if (name === "town") playAmbience("Rogue Encampment", 0);
  else if (!name || name === "title") playAmbience(null);
}
function playAmbience(area, act = 0) {
  const sounds = manifest?.ambience;
  let id = null;
  if (area && sounds) {
    const key = areaKey(area);
    id = sounds.areas[act]?.[key] ?? sounds.areas.find((areas) => areas?.[key])?.[key] ?? sounds.acts[act] ?? null;
  }
  if (id === wantedAmbience) return;
  wantedAmbience = id;
  if (define_import_meta_env_default.DEV) {
    const env = id ? manifest?.ambience?.environs[id] : void 0;
    const loop = env?.loop ? manifest?.sounds[env.loop] : void 0;
    const events = env?.events ? manifest?.sounds[env.events] : void 0;
    tap({
      kind: "ambience",
      id,
      loop: loop?.variants[0] && { file: loop.variants[0].file, volume: loop.variants[0].volume ?? loop.volume, loop: loop.variants[0].loop },
      events: events?.variants.map((v) => ({ file: v.file, volume: v.volume ?? events.volume })),
      delay: env?.delay
    });
  }
  fetchSounds(ambienceKeys(id));
  if (ctx) switchAmbience();
}
function ruleFor(key) {
  const dot = key.indexOf(".");
  return {
    ...DEFAULT_RULE,
    ...dot > 0 ? RULES[`${key.slice(0, dot)}.*`] : void 0,
    ...dot > 0 ? RULES[`*${key.slice(dot)}`] : void 0,
    ...RULES[key]
  };
}
function unlock() {
  if (ctx || !manifest) return;
  removeEventListener("keydown", unlock, true);
  removeEventListener("pointerdown", unlock, true);
  try {
    ctx = new AudioContext();
  } catch {
    return;
  }
  void ctx.resume();
  const undo = (db) => new GainNode(ctx, { gain: 10 ** (-db / 20) });
  master = new GainNode(ctx);
  sfxBus = new GainNode(ctx);
  musicBus = new GainNode(ctx);
  sfxFader = new GainNode(ctx);
  sfxBus.connect(new DynamicsCompressorNode(ctx, GLUE)).connect(undo(GLUE_MAKEUP_DB)).connect(sfxFader).connect(master);
  musicBus.connect(master);
  master.connect(new DynamicsCompressorNode(ctx, LIMITER)).connect(undo(LIMITER_MAKEUP_DB)).connect(ctx.destination);
  applySettings();
  for (const [file, bytes] of fetched) void decode(ctx, file, bytes);
  switchTrack();
  switchAmbience();
  setInterval(tickAmbience, AMBIENCE_TICK);
}
function fetchSounds(keys) {
  for (const key of keys) {
    for (const { file } of manifest?.sounds[key]?.variants ?? []) {
      if (fetched.has(file)) continue;
      const bytes = fetch(d2Url(file)).then((response) => response.ok ? response.arrayBuffer() : null).catch(() => null);
      fetched.set(file, bytes);
      if (ctx) void decode(ctx, file, bytes);
    }
  }
}
async function decode(context, file, bytes) {
  const data = await bytes;
  if (!data) return;
  try {
    buffers.set(file, await context.decodeAudioData(data));
  } catch {
    console.warn(`Couldn't decode ${file}`);
  }
}
var musicHeard = () => !settings.muted && settings.music > 0;
function switchTrack() {
  const wanted = musicHeard() ? wantedTrack : null;
  if (!ctx || !musicBus || (track?.name ?? null) === wanted) return;
  if (track) fadeOut(track);
  track = null;
  const def = wanted ? manifest?.music[wanted] : void 0;
  if (!wanted || !def) return;
  const element = new Audio(d2Url(def.file));
  element.loop = true;
  const gain = new GainNode(ctx, { gain: 0 });
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(def.volume, ctx.currentTime + CROSSFADE);
  new MediaElementAudioSourceNode(ctx, { mediaElement: element }).connect(gain).connect(musicBus);
  element.play().catch(() => {
  });
  track = { name: wanted, element, gain };
}
function switchAmbience() {
  if (!ctx || !sfxBus || (ambience?.id ?? null) === wantedAmbience) return;
  if (ambience && wantedAmbience && loopFile(ambience.id) && loopFile(ambience.id) === loopFile(wantedAmbience)) {
    unloadSounds(ambienceKeys(ambience.id), ambienceFiles(wantedAmbience));
    ambience.id = wantedAmbience;
    return;
  }
  const old = ambience;
  ambience = null;
  if (old) {
    const now = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + CROSSFADE);
    old.loop?.stop(now + CROSSFADE);
    setTimeout(() => {
      old.gain.disconnect();
      if (wantedAmbience !== old.id) unloadSounds(ambienceKeys(old.id), ambienceFiles(wantedAmbience));
    }, CROSSFADE * 1e3 + 100);
  }
  if (!wantedAmbience) return;
  const gain = new GainNode(ctx, { gain: 0 });
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + CROSSFADE);
  gain.connect(sfxBus);
  const delay = manifest?.ambience?.environs[wantedAmbience]?.delay ?? 0;
  ambience = { id: wantedAmbience, gain, loop: null, nextEvent: ctx.currentTime + cosmeticRandom() * delay };
  tickAmbience();
}
function tickAmbience() {
  if (!ctx || !ambience || ctx.state !== "running") return;
  const env = manifest?.ambience?.environs[ambience.id];
  if (!env) return;
  const now = ctx.currentTime;
  const loop = env.loop ? manifest?.sounds[env.loop] : void 0;
  const loopBuffer = loop && buffers.get(loop.variants[0].file);
  if (loop && loopBuffer && !ambience.loop) {
    const variant2 = loop.variants[0];
    const source2 = new AudioBufferSourceNode(ctx, { buffer: loopBuffer, loop: true });
    if (variant2.loop && (variant2.loop[0] > 0 || variant2.loop[1] < loopBuffer.duration - 1e-3)) {
      [source2.loopStart, source2.loopEnd] = variant2.loop;
    }
    source2.connect(new GainNode(ctx, { gain: variant2.volume ?? loop.volume })).connect(ambience.gain);
    source2.start();
    ambience.loop = source2;
  }
  const events = env.events ? manifest?.sounds[env.events] : void 0;
  if (!events || now < ambience.nextEvent) return;
  ambience.nextEvent = now + Math.max(1, cosmeticRandom() * env.delay);
  const variant = events.variants[Math.floor(cosmeticRandom() * events.variants.length)];
  const buffer = buffers.get(variant.file);
  if (!buffer || settings.muted) return;
  const source = new AudioBufferSourceNode(ctx, { buffer });
  const distance = EVENT_FARTHEST + cosmeticRandom() * (1 - EVENT_FARTHEST);
  const gain = new GainNode(ctx, { gain: (variant.volume ?? events.volume) * distance });
  const pan = new StereoPannerNode(ctx, { pan: (cosmeticRandom() * 2 - 1) * EVENT_PAN });
  source.connect(gain).connect(pan).connect(ambience.gain);
  source.onended = () => pan.disconnect();
  source.start();
}
function ambienceKeys(id) {
  const env = id ? manifest?.ambience?.environs[id] : void 0;
  return env ? [env.loop, env.events].filter((key) => key !== void 0) : [];
}
function loopFile(id) {
  const loop = manifest?.ambience?.environs[id]?.loop;
  return loop && manifest?.sounds[loop]?.variants[0]?.file;
}
function ambienceFiles(id) {
  return new Set(ambienceKeys(id).flatMap((key) => manifest?.sounds[key]?.variants.map((v) => v.file) ?? []));
}
function fadeOut({ element, gain }) {
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + CROSSFADE);
  setTimeout(() => {
    element.pause();
    element.removeAttribute("src");
    element.load();
    gain.disconnect();
  }, CROSSFADE * 1e3 + 100);
}
function applySettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
  }
  if (!ctx || !master || !sfxFader || !musicBus) return;
  const now = ctx.currentTime;
  master.gain.setTargetAtTime(settings.muted ? 0 : MASTER_LEVEL, now, 0.02);
  sfxFader.gain.setTargetAtTime(sliderGain(settings.sfx), now, 0.02);
  musicBus.gain.setTargetAtTime(sliderGain(settings.music), now, 0.02);
  switchTrack();
}
function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved !== null) {
      const v2 = JSON.parse(saved);
      return { sfx: level(v2.sfx), music: level(v2.music), muted: v2.muted === true };
    }
    const v1 = JSON.parse(localStorage.getItem(OLD_SETTINGS_KEY) ?? "{}");
    return { sfx: Math.sqrt(level(v1.sfx)), music: Math.sqrt(level(v1.music)), muted: v1.muted === true };
  } catch {
    return { sfx: 1, music: 1, muted: false };
  }
}
function level(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}

// desktop/setup/setup.ts
init_lang();

// tools/schedule.ts
init_define_import_meta_env();
function progressFraction(steps, elapsed) {
  const total = steps.reduce((sum, step) => sum + step.weight, 0);
  if (!total) return 0;
  let done = 0;
  for (const step of steps) {
    if (step.state === "done") done += step.weight;
    else if (step.state === "running") done += Math.min(step.weight * 0.95, Math.max(0, elapsed(step.name)));
  }
  return Math.min(1, done / total);
}
function runningCaption(steps) {
  return steps.filter((step) => step.state === "running").map((step, i) => i ? step.name.toLowerCase() : step.name).join(", ");
}

// desktop/setup/d2look.ts
init_define_import_meta_env();

// src/game/frontend/subtitle.ts
init_define_import_meta_env();

// src/game/readback.ts
init_define_import_meta_env();
var PROBE = 8;
function probePattern(size = PROBE) {
  const data = new Uint8ClampedArray(new ArrayBuffer(size * size * 4));
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = i * 37 + 11 & 255;
    data[i * 4 + 1] = i * 91 + 53 & 255;
    data[i * 4 + 2] = i * 151 + 97 & 255;
    data[i * 4 + 3] = 255;
  }
  return data;
}
function samePixels(drawn, read) {
  if (!read || read.length !== drawn.length) return false;
  for (let i = 0; i < drawn.length; i++) if (drawn[i] !== read[i]) return false;
  return true;
}
function classifyReadback(drawn, read) {
  if (samePixels(drawn, read)) return "exact";
  if (!read || read.length !== drawn.length) return "garbled";
  for (let i = 0; i < drawn.length; i++) {
    const off = Math.abs(drawn[i] - read[i]);
    if ((i & 3) === 3 ? off !== 0 : off > 1) return "garbled";
  }
  return "farbled";
}
var found = null;
function canvasReadback() {
  if (found) return found;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = PROBE;
    const g = canvas.getContext("2d", { willReadFrequently: true });
    const pattern = probePattern();
    g.putImageData(new ImageData(pattern, PROBE, PROBE), 0, 0);
    found = classifyReadback(pattern, g.getImageData(0, 0, PROBE, PROBE).data);
  } catch {
    found = "garbled";
  }
  return found;
}

// src/game/frontend/subtitle.ts
var TEXT = "SURVIVORS";
var CENTER = { x: 400, y: 206 };
var WIDTH = 330;
var TRACKING = 0.2;
var PAD = 16;
var HEADROOM = 22;
var RISE = 20;
var FONT = (size) => `${size}px 'Palatino Linotype', Palatino, Georgia, serif`;
var FIRE_WINDOWS = [
  { x: 224, width: 62 },
  { x: 512, width: 64 }
];
var FIRE_BASE = 96;
var FIRE_SCALE = 0.6;
var FIRE_STAGGER = 0.37;
var lettering = null;
var loading = false;
function drawSubtitle(g, t, fire, font) {
  if (!lettering) {
    if (font) lettering = render(bitmapGlyphs(font));
    else if (!loading) {
      loading = true;
      void document.fonts.load(FONT(40), TEXT).catch(() => []).then(() => lettering = lettering ?? render(serifGlyphs()));
    }
    return;
  }
  const { halo, rim, letters } = lettering;
  const x = Math.round(CENTER.x - letters.width / 2);
  const y = Math.round(CENTER.y - letters.height / 2);
  g.drawImage(halo, x, y);
  const flicker = 0.5 + 0.3 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 7.3 + Math.sin(t * 2.9));
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.75 + 0.25 * flicker;
  g.drawImage(rim, x, y);
  if (fire) {
    g.globalAlpha = 1;
    g.drawImage(flames(lettering, t, fire), x, y);
  }
  g.restore();
  g.drawImage(letters, x, y);
}
function flames({ fire: canvas, mask, middle }, t, fire) {
  const f = canvas.getContext("2d");
  f.globalCompositeOperation = "source-over";
  f.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0, x = 0; x < canvas.width; i++) {
    const slot = FIRE_WINDOWS[i % FIRE_WINDOWS.length];
    const width = slot.width * FIRE_SCALE;
    f.save();
    f.beginPath();
    f.rect(x, 0, width, canvas.height);
    f.clip();
    f.setTransform(FIRE_SCALE, 0, 0, FIRE_SCALE, x - slot.x * FIRE_SCALE, middle - FIRE_BASE * FIRE_SCALE);
    fire(f, t + i * FIRE_STAGGER);
    f.restore();
    x += width;
  }
  f.globalCompositeOperation = "destination-in";
  f.drawImage(mask, 0, 0);
  return canvas;
}
function bitmapGlyphs(font) {
  const chars = [...TEXT];
  const shaded = chars.map((ch) => unshadow(font.canvas(ch)));
  const native2 = shaded.map(silhouette);
  const advance = chars.map((ch) => font.width(ch));
  const sum = advance.reduce((a, b) => a + b, 0);
  const scale = WIDTH / (sum * (1 + TRACKING * (chars.length - 1) / chars.length));
  const gap = TRACKING * sum * scale / chars.length;
  const at = [];
  let x = 0;
  chars.forEach((_, i) => {
    at.push(x);
    x += advance[i] * scale + (i < chars.length - 1 ? gap : 0);
  });
  const enlarge = (glyph) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(glyph.width * scale);
    canvas.height = Math.ceil(glyph.height * scale);
    const g = canvas.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.drawImage(glyph, 0, 0, canvas.width, canvas.height);
    return canvas;
  };
  const scaled = native2.map(enlarge);
  return { chars: scaled, faces: shaded.map(enlarge), at, width: x, size: Math.max(...scaled.map((c) => c.height)) };
}
function unshadow(glyph) {
  if (canvasReadback() === "garbled") return glyph;
  const g = glyph.getContext("2d");
  const image = g.getImageData(0, 0, glyph.width, glyph.height);
  const { data } = image;
  let peak = 1;
  for (let i = 0; i < data.length; i += 4) if (data[i + 3]) peak = Math.max(peak, data[i], data[i + 1], data[i + 2]);
  for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) < peak * 0.2) data[i + 3] = 0;
  g.putImageData(image, 0, 0);
  return glyph;
}
function silhouette(glyph) {
  const canvas = document.createElement("canvas");
  canvas.width = glyph.width;
  canvas.height = glyph.height;
  const g = canvas.getContext("2d");
  g.drawImage(glyph, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = "#fff";
  g.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}
function serifGlyphs() {
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = FONT(100);
  const chars = [...TEXT];
  const at100 = chars.map((ch) => probe.measureText(ch).width);
  const sum = at100.reduce((a, b) => a + b, 0);
  const size = Math.floor(100 * WIDTH / (sum * (1 + TRACKING * (chars.length - 1) / chars.length)));
  const advance = at100.map((w) => w * size / 100);
  const gap = TRACKING * advance.reduce((a, b) => a + b, 0) / chars.length;
  const at = [];
  let x = 0;
  const glyphs = chars.map((ch, i) => {
    at.push(x);
    x += advance[i] + (i < chars.length - 1 ? gap : 0);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(advance[i]) + 2;
    canvas.height = Math.ceil(size * 1.2);
    const g = canvas.getContext("2d");
    g.font = FONT(size);
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.fillText(ch, 0, canvas.height / 2);
    return canvas;
  });
  return { chars: glyphs, at, width: x, size: Math.ceil(size * 1.2) };
}
function render(glyphs) {
  const width = Math.ceil(glyphs.width + PAD * 2);
  const height = Math.ceil(glyphs.size + PAD * 2) + HEADROOM;
  const middle = height / 2 + HEADROOM / 2;
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return { canvas, g: canvas.getContext("2d") };
  };
  const scratch = make();
  const fill = (g, style, dx = 0, dy = 0) => {
    const s = scratch.g;
    s.globalCompositeOperation = "source-over";
    s.clearRect(0, 0, width, height);
    glyphs.chars.forEach((glyph, i) => s.drawImage(glyph, Math.round(PAD + glyphs.at[i] + dx), Math.round(middle - glyph.height / 2 + dy)));
    s.globalCompositeOperation = "source-in";
    s.fillStyle = style;
    s.fillRect(0, 0, width, height);
    g.drawImage(scratch.canvas, 0, 0);
  };
  const stroke2 = (g, style, thickness) => {
    const r2 = thickness / 2;
    for (let a = 0; a < 16; a++) fill(g, style, r2 * Math.cos(a * Math.PI / 8), r2 * Math.sin(a * Math.PI / 8));
  };
  const { canvas: halo, g: h } = make();
  h.shadowColor = "rgb(0 0 0 / 0.95)";
  h.shadowBlur = 8;
  fill(h, "#000");
  fill(h, "#000");
  const { canvas: rim, g: r } = make();
  const { canvas: letters, g: l } = make();
  if (glyphs.faces) {
    r.shadowColor = "#ff5a00";
    r.shadowBlur = 7;
    fill(r, "#b04008");
    stroke2(l, "#0a0604", 2.5);
    glyphs.faces.forEach((glyph, i) => l.drawImage(glyph, Math.round(PAD + glyphs.at[i]), Math.round(middle - glyph.height / 2)));
  } else {
    r.shadowColor = "#ff5a00";
    r.shadowBlur = 5;
    stroke2(r, "#d86818", 4);
    r.shadowBlur = 0;
    stroke2(r, "#ffc860", 2);
    fill(l, "#5a3a1c", -1, -1);
    fill(l, "#000", 1, 1);
    const { canvas: face, g: fc } = make();
    const iron = fc.createLinearGradient(0, middle - glyphs.size * 0.36, 0, middle + glyphs.size * 0.36);
    iron.addColorStop(0, "#1e1813");
    iron.addColorStop(0.5, "#0c0908");
    iron.addColorStop(1, "#030202");
    fill(fc, iron);
    soot(face);
    l.drawImage(face, 0, 0);
  }
  const { canvas: mask, g: m } = make();
  fill(m, "#fff");
  if (canvasReadback() === "garbled") {
    const fire2 = document.createElement("canvas");
    fire2.width = width;
    fire2.height = height;
    return { halo, rim, letters, mask, fire: fire2, middle };
  }
  const word = m.getImageData(0, 0, width, height).data;
  m.clearRect(0, 0, width, height);
  const { canvas: flameMask, g: fm } = make();
  for (let x = 0; x < width; x++) {
    let top = -1;
    for (let y = 0; y < height && top < 0; y++) if (word[(y * width + x) * 4 + 3] > 64) top = y;
    if (top < 0) continue;
    const rise = fm.createLinearGradient(0, top - RISE, 0, top + 4);
    rise.addColorStop(0, "rgb(255 255 255 / 0)");
    rise.addColorStop(0.35, "rgb(255 255 255 / 0.85)");
    rise.addColorStop(1, "#fff");
    fm.fillStyle = rise;
    fm.fillRect(x, top - RISE, 1, RISE + 4);
  }
  m.filter = "blur(2px)";
  m.drawImage(flameMask, 0, 0);
  m.filter = "none";
  const fire = document.createElement("canvas");
  fire.width = width;
  fire.height = height;
  return { halo, rim, letters, mask, fire, middle };
}
function soot(canvas) {
  if (canvasReadback() === "garbled") return;
  const g = canvas.getContext("2d");
  const image = g.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = image;
  let seed = 147;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const cell = 4;
  const columns = Math.ceil(width / cell) + 2;
  const coarse = Array.from({ length: columns * (Math.ceil(height / cell) + 2) }, random);
  const at = (column, row) => coarse[row * columns + column];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (!data[i + 3]) continue;
      const column = Math.floor(x / cell);
      const row = Math.floor(y / cell);
      const fx = x / cell - column;
      const fy = y / cell - row;
      const top = at(column, row) * (1 - fx) + at(column + 1, row) * fx;
      const bottom = at(column, row + 1) * (1 - fx) + at(column + 1, row + 1) * fx;
      const blotch = top * (1 - fy) + bottom * fy;
      const k = 1 - 0.4 * (0.65 * blotch + 0.35 * random());
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * k);
    }
  }
  g.putImageData(image, 0, 0);
}

// src/game/frontend/surface.ts
init_define_import_meta_env();

// src/game/padPrompts.ts
init_define_import_meta_env();

// src/game/gamepad.ts
init_define_import_meta_env();
var BUTTON = {
  /** The bottom face button: A on Xbox, Cross on PlayStation, B on Switch. */
  south: 0,
  east: 1,
  west: 2,
  north: 3,
  lb: 4,
  rb: 5,
  lt: 6,
  rt: 7,
  select: 8,
  start: 9,
  l3: 10,
  r3: 11,
  up: 12,
  down: 13,
  left: 14,
  right: 15
};
var NAMES = {
  xbox: ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu", "LS", "RS", "D-pad Up", "D-pad Down", "D-pad Left", "D-pad Right"],
  playstation: ["Cross", "Circle", "Square", "Triangle", "L1", "R1", "L2", "R2", "Create", "Options", "L3", "R3", "D-pad Up", "D-pad Down", "D-pad Left", "D-pad Right"],
  switch: ["B", "A", "Y", "X", "L", "R", "ZL", "ZR", "Minus", "Plus", "LS", "RS", "D-pad Up", "D-pad Down", "D-pad Left", "D-pad Right"]
};
function buttonName(button, family2) {
  return NAMES[family2][button] ?? `Button ${button}`;
}
var DEFAULT_BINDINGS = {
  potion1: BUTTON.left,
  potion2: BUTTON.up,
  potion3: BUTTON.right,
  potion4: BUTTON.down,
  interact: BUTTON.south,
  skills: BUTTON.east,
  rest: BUTTON.west,
  character: BUTTON.north,
  pickPrev: BUTTON.lb,
  pickNext: BUTTON.rb,
  automap: BUTTON.select,
  menu: BUTTON.start
};

// src/game/padPrompts.ts
init_lang();
var mode = "keys";
var family = "xbox";
function inputMode() {
  return mode;
}
function shownButton(button, f = family) {
  return tr(buttonName(button, f));
}
function padText(text, f = family, on) {
  let out = text;
  if (on !== void 0) out = out.replace(/\(([^()]{1,5})\)(?![^]*\([^()]{1,5}\))/, `(${shownButton(on, f)})`);
  return out.replace(/\(Esc\)/g, `(${shownButton(BUTTON.east, f)})`).replace(/\(Enter\)/g, `(${shownButton(BUTTON.south, f)})`).replace(/\bEsc(?=:| to )/g, shownButton(BUTTON.east, f)).replace(/\bEnter(?=:| to )/g, shownButton(BUTTON.south, f)).replace(/\bT(?=: (Charsi|찰시))/g, shownButton(BUTTON.west, f));
}
function promptText(text) {
  return mode === "pad" ? padText(text) : text;
}
function promptKey() {
  return mode === "pad" ? family : "";
}

// src/game/portrait.ts
init_define_import_meta_env();
var PORTRAIT_QUERY = "(orientation: portrait) and (pointer: coarse)";
var query = matchMedia(PORTRAIT_QUERY);
function isPortrait() {
  return query.matches;
}

// src/game/ui.ts
init_define_import_meta_env();

// src/game/webFont.ts
init_define_import_meta_env();
var EXOCET = "D2 Exocet";
var UNIT = 64;
var FACE = 0.2;
var CAP_HEIGHT = 0.7;
var BORROWED = { 8216: 39, 8217: 39, 8220: 34, 8221: 34, 8211: 45, 8212: 45 };
var MIDDLE_DOT = 183;
var worn = false;
function wearD2Exocet(fonts, otf = null) {
  if (worn || typeof FontFace === "undefined") return;
  if (otf) {
    worn = true;
    new FontFace(EXOCET, `url(${otf})`).load().then((face) => document.fonts.add(face)).catch((e) => {
      console.warn("D2R's Exocet didn't load", e);
      worn = false;
      wearD2Exocet(fonts);
    });
    return;
  }
  if (!fonts.font42) return;
  worn = true;
  registerWebFont(EXOCET, fonts.font42).catch((e) => console.warn("D2's Exocet didn't build", e));
}
async function registerWebFont(family2, font, floor = FACE) {
  const face = new FontFace(family2, buildTrueType(family2, font, floor));
  document.fonts.add(await face.load());
}
function buildTrueType(family2, font, face = FACE) {
  const { cellWidth, height, advance } = font.info;
  const blank = font.ink(0, face).join("");
  const capital = font.ink(72, face);
  const rows = inkedRows(capital, cellWidth, height);
  const baseline = rows.bottom + 1;
  const capPx = baseline - rows.top;
  const unitsPerEm = Math.round(capPx * UNIT / CAP_HEIGHT);
  const glyphs = /* @__PURE__ */ new Map();
  for (let code = 32; code < 256; code++) {
    if (code >= 127 && code < 160) continue;
    const ink = font.ink(code, face);
    if (!advance[code] || code !== 32 && ink.join("") === blank) continue;
    glyphs.set(code, { advance: advance[code] * UNIT, contours: code === 32 ? [] : trace(ink, cellWidth, height, baseline) });
  }
  const stem = stroke(capital, cellWidth, height);
  const dot = stem * UNIT;
  const middle = Math.round(capPx * UNIT / 2 - dot / 2);
  glyphs.set(MIDDLE_DOT, {
    advance: (stem * 3 + 2) * UNIT,
    contours: [
      [
        [stem * UNIT, middle],
        [stem * UNIT, middle + dot],
        [stem * 2 * UNIT, middle + dot],
        [stem * 2 * UNIT, middle]
      ]
    ]
  });
  for (const [code, from] of Object.entries(BORROWED)) {
    const glyph = glyphs.get(from);
    if (glyph) glyphs.set(Number(code), glyph);
  }
  return writeTrueType(family2, {
    unitsPerEm,
    ascender: baseline * UNIT,
    descender: -(height - baseline) * UNIT,
    capHeight: capPx * UNIT,
    xHeight: lowercaseHeight(font, face, cellWidth, height, baseline) * UNIT,
    glyphs
  });
}
function inkedRows(ink, width, height) {
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink[y * width + x]) continue;
      top = Math.min(top, y);
      bottom = y;
    }
  }
  return bottom < 0 ? { top: 0, bottom: height - 1 } : { top, bottom };
}
function lowercaseHeight(font, face, width, height, baseline) {
  return baseline - inkedRows(font.ink(120, face), width, height).top;
}
function stroke(capital, width, height) {
  const { top, bottom } = inkedRows(capital, width, height);
  const y = Math.round((top + bottom) / 2) - 2;
  let best = width;
  let run = 0;
  for (let x = 0; x <= width; x++) {
    if (x < width && capital[y * width + x]) run++;
    else if (run) {
      best = Math.min(best, run);
      run = 0;
    }
  }
  return Math.max(1, Math.min(best, 4));
}
function trace(ink, width, height, baseline) {
  const filled = (x, y) => x >= 0 && y >= 0 && x < width && y < height && ink[y * width + x] === 1;
  const stride = width + 1;
  const edges = [];
  const out = /* @__PURE__ */ new Map();
  const add = (x0, y0, x1, y1) => {
    const from = y0 * stride + x0;
    edges.push({ from, to: y1 * stride + x1, dx: x1 - x0, dy: y1 - y0, used: false });
    const list = out.get(from);
    if (list) list.push(edges.length - 1);
    else out.set(from, [edges.length - 1]);
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!filled(x, y)) continue;
      if (!filled(x, y - 1)) add(x + 1, y, x, y);
      if (!filled(x - 1, y)) add(x, y, x, y + 1);
      if (!filled(x, y + 1)) add(x, y + 1, x + 1, y + 1);
      if (!filled(x + 1, y)) add(x + 1, y + 1, x + 1, y);
    }
  }
  const contours = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].used) continue;
    const corners = [];
    let edge = edges[i];
    while (!edge.used) {
      edge.used = true;
      corners.push(edge.from);
      const next = (out.get(edge.to) ?? []).filter((j) => !edges[j].used);
      if (!next.length) break;
      const current = edge;
      const turn = (j) => current.dx * edges[j].dy - current.dy * edges[j].dx;
      edge = edges[next.length > 1 ? next.reduce((a, b) => turn(a) < turn(b) ? a : b) : next[0]];
    }
    const points = corners.map((c) => [c % stride * UNIT, (baseline - Math.floor(c / stride)) * UNIT]);
    contours.push(straighten(points));
  }
  return contours;
}
function straighten(points) {
  return points.filter((p, i) => {
    const a = points[(i + points.length - 1) % points.length];
    const b = points[(i + 1) % points.length];
    return !(a[0] === p[0] && p[0] === b[0] || a[1] === p[1] && p[1] === b[1]);
  });
}
function writeTrueType(family2, font) {
  const order = [{ advance: font.unitsPerEm / 2, contours: [] }];
  const ids = /* @__PURE__ */ new Map();
  const cmap = [];
  for (const code of [...font.glyphs.keys()].sort((a, b) => a - b)) {
    const glyph = font.glyphs.get(code);
    if (!ids.has(glyph)) {
      ids.set(glyph, order.length);
      order.push(glyph);
    }
    cmap.push([code, ids.get(glyph)]);
  }
  const glyf = new Writer();
  const loca = [];
  const box = { xMin: 32767, yMin: 32767, xMax: -32768, yMax: -32768 };
  const bounds = [];
  let maxPoints = 0;
  let maxContours = 0;
  for (const glyph of order) {
    loca.push(glyf.length);
    const points = glyph.contours.flat();
    if (!points.length) {
      bounds.push({ xMin: 0, xMax: 0 });
      continue;
    }
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const b = { xMin: Math.min(...xs), yMin: Math.min(...ys), xMax: Math.max(...xs), yMax: Math.max(...ys) };
    bounds.push(b);
    box.xMin = Math.min(box.xMin, b.xMin);
    box.yMin = Math.min(box.yMin, b.yMin);
    box.xMax = Math.max(box.xMax, b.xMax);
    box.yMax = Math.max(box.yMax, b.yMax);
    maxPoints = Math.max(maxPoints, points.length);
    maxContours = Math.max(maxContours, glyph.contours.length);
    glyf.i16(glyph.contours.length).i16(b.xMin).i16(b.yMin).i16(b.xMax).i16(b.yMax);
    let end = -1;
    for (const contour of glyph.contours) glyf.u16(end += contour.length);
    glyf.u16(0);
    for (let i = 0; i < points.length; i++) glyf.u8(1);
    let last = 0;
    for (const [x] of points) glyf.i16(x - last), last = x;
    last = 0;
    for (const [, y] of points) glyf.i16(y - last), last = y;
    glyf.align(4);
  }
  loca.push(glyf.length);
  if (box.xMin > box.xMax) Object.assign(box, { xMin: 0, yMin: 0, xMax: 0, yMax: 0 });
  const advanceMax = Math.max(...order.map((g) => g.advance));
  const head = new Writer().u32(65536).u32(65536).u32(0).u32(1594834165).u16(11).u16(font.unitsPerEm).u32(0).u32(0).u32(0).u32(0).i16(box.xMin).i16(box.yMin).i16(box.xMax).i16(box.yMax).u16(0).u16(8).i16(2).i16(1).i16(0);
  const hhea = new Writer().u32(65536).i16(font.ascender).i16(font.descender).i16(0).u16(advanceMax).i16(Math.min(0, ...bounds.map((b) => b.xMin))).i16(Math.min(...order.map((g, i) => g.advance - bounds[i].xMax))).i16(box.xMax).i16(1).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).u16(order.length);
  const maxp = new Writer().u32(65536).u16(order.length).u16(maxPoints).u16(maxContours).u16(0).u16(0).u16(2);
  for (let i = 0; i < 8; i++) maxp.u16(0);
  const codes = cmap.map(([c]) => c);
  const os2 = new Writer().u16(4).i16(Math.round(order.reduce((s, g) => s + g.advance, 0) / order.length)).u16(400).u16(5).u16(0).i16(font.unitsPerEm / 2).i16(font.unitsPerEm / 2).i16(0).i16(font.unitsPerEm / 8).i16(font.unitsPerEm / 2).i16(font.unitsPerEm / 2).i16(0).i16(font.unitsPerEm / 3).i16(UNIT).i16(Math.round(font.capHeight / 2)).i16(0);
  for (let i = 0; i < 10; i++) os2.u8(0);
  os2.u32(3).u32(0).u32(0).u32(0).tag("D2SV").u16(64 | 128).u16(Math.min(...codes)).u16(Math.min(65535, Math.max(...codes))).i16(font.ascender).i16(font.descender).i16(0).u16(font.ascender).u16(-font.descender).u32(1).u32(0).i16(font.xHeight).i16(font.capHeight).u16(0).u16(32).u16(0);
  const hmtx = new Writer();
  order.forEach((g, i) => hmtx.u16(g.advance).i16(bounds[i].xMin));
  const post = new Writer().u32(196608).u32(0).i16(-UNIT).i16(UNIT).u32(0).u32(0).u32(0).u32(0).u32(0);
  const tables = [
    ["OS/2", os2],
    ["cmap", cmapTable(cmap)],
    ["glyf", glyf],
    ["head", head],
    ["hhea", hhea],
    ["hmtx", hmtx],
    ["loca", loca.reduce((w, offset2) => w.u32(offset2), new Writer())],
    ["maxp", maxp],
    ["name", nameTable(family2)],
    ["post", post]
  ];
  const file = new Writer();
  const log2 = Math.floor(Math.log2(tables.length));
  file.u32(65536).u16(tables.length).u16(16 << log2).u16(log2).u16(tables.length * 16 - (16 << log2));
  let offset = 12 + tables.length * 16;
  for (const [tag, table] of tables) {
    table.align(4);
    file.tag(tag).u32(checksum(table.bytes())).u32(offset).u32(table.length);
    offset += table.length;
  }
  for (const [, table] of tables) file.append(table);
  const bytes = file.bytes();
  const headAt = 12 + tables.length * 16 + tables.slice(0, 3).reduce((s, [, t]) => s + t.length, 0);
  new DataView(bytes.buffer).setUint32(headAt + 8, 2981146554 - checksum(bytes) >>> 0);
  return bytes.buffer;
}
function cmapTable(map) {
  const segments = [];
  for (const [code, id] of map) {
    const last = segments.at(-1);
    if (last && code === last.end + 1 && id - code === last.delta) last.end = code;
    else segments.push({ start: code, end: code, delta: id - code });
  }
  segments.push({ start: 65535, end: 65535, delta: 1 });
  const n = segments.length;
  const log2 = Math.floor(Math.log2(n));
  const sub = new Writer().u16(4).u16(16 + n * 8).u16(0).u16(n * 2).u16(2 << log2).u16(log2).u16(n * 2 - (2 << log2));
  for (const s of segments) sub.u16(s.end);
  sub.u16(0);
  for (const s of segments) sub.u16(s.start);
  for (const s of segments) sub.u16(s.delta + 65536 & 65535);
  for (let i = 0; i < n; i++) sub.u16(0);
  return new Writer().u16(0).u16(1).u16(3).u16(1).u32(12).append(sub);
}
function nameTable(family2) {
  const names = [
    [1, family2],
    [2, "Regular"],
    [3, `${family2} Regular`],
    [4, family2],
    [6, family2.replace(/[^A-Za-z0-9]/g, "")]
  ];
  const table = new Writer().u16(0).u16(names.length).u16(6 + names.length * 12);
  const strings = new Writer();
  for (const [id, text] of names) {
    table.u16(3).u16(1).u16(1033).u16(id).u16(text.length * 2).u16(strings.length);
    for (const ch of text) strings.u16(ch.charCodeAt(0));
  }
  return table.append(strings);
}
function checksum(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let sum = 0;
  for (let i = 0; i + 4 <= bytes.length; i += 4) sum = sum + view.getUint32(i) >>> 0;
  return sum;
}
var Writer = class {
  buffer = new Uint8Array(256);
  view = new DataView(this.buffer.buffer);
  length = 0;
  room(n) {
    if (this.length + n <= this.buffer.length) return;
    const bigger = new Uint8Array(Math.max(this.buffer.length * 2, this.length + n));
    bigger.set(this.buffer);
    this.buffer = bigger;
    this.view = new DataView(bigger.buffer);
  }
  u8(v) {
    this.room(1);
    this.view.setUint8(this.length, v);
    this.length += 1;
    return this;
  }
  u16(v) {
    this.room(2);
    this.view.setUint16(this.length, v);
    this.length += 2;
    return this;
  }
  i16(v) {
    this.room(2);
    this.view.setInt16(this.length, v);
    this.length += 2;
    return this;
  }
  u32(v) {
    this.room(4);
    this.view.setUint32(this.length, v >>> 0);
    this.length += 4;
    return this;
  }
  tag(tag) {
    for (const ch of tag) this.u8(ch.charCodeAt(0));
    return this;
  }
  align(n) {
    while (this.length % n) this.u8(0);
    return this;
  }
  append(other) {
    const bytes = other.bytes();
    this.room(bytes.length);
    this.buffer.set(bytes, this.length);
    this.length += bytes.length;
    return this;
  }
  bytes() {
    return this.buffer.slice(0, this.length);
  }
};

// src/game/png.ts
init_define_import_meta_env();
async function inflate(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
var SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
var CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
async function decodePng(bytes, unzip = inflate) {
  if (SIGNATURE.some((b, i) => bytes[i] !== b)) throw new Error("not a PNG");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0;
  let height = 0;
  let depth = 0;
  let type = 0;
  let palette = null;
  let alpha = null;
  const idat = [];
  for (let p = 8; p + 8 <= bytes.length; ) {
    const length = view.getUint32(p);
    const kind = String.fromCharCode(...bytes.subarray(p + 4, p + 8));
    const body = bytes.subarray(p + 8, p + 8 + length);
    if (kind === "IHDR") {
      width = view.getUint32(p + 8);
      height = view.getUint32(p + 12);
      depth = body[8];
      type = body[9];
      if (body[12]) throw new Error("interlaced PNG");
    } else if (kind === "PLTE") palette = body;
    else if (kind === "tRNS") alpha = body;
    else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    p += 12 + length;
  }
  const channels = CHANNELS[type];
  if (!width || !height || !channels || type !== 3 && type !== 0 && depth !== 8 || depth > 8) throw new Error(`PNG type ${type} at ${depth} bits`);
  const joined = new Uint8Array(new ArrayBuffer(idat.reduce((n, c) => n + c.length, 0)));
  idat.reduce((at, chunk) => (joined.set(chunk, at), at + chunk.length), 0);
  const raw = await unzip(joined);
  const bits = channels * depth;
  const stride = Math.ceil(width * bits / 8);
  const bpp = Math.max(1, bits >> 3);
  if (raw.length < height * (stride + 1)) throw new Error("PNG data too short");
  const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  let prev = new Uint8Array(stride);
  let row = new Uint8Array(stride);
  const samples = alpha && (type === 0 || type === 2) ? new DataView(alpha.buffer, alpha.byteOffset, alpha.byteLength) : null;
  const key = samples ? Array.from({ length: type === 0 ? 1 : 3 }, (_, i) => samples.getUint16(i * 2)) : null;
  const scale = type === 0 ? 255 / ((1 << depth) - 1) : 1;
  for (let y = 0, q = 0; y < height; y++) {
    const filter = raw[q++];
    row.set(raw.subarray(q, q + stride));
    q += stride;
    unfilter(filter, row, prev, bpp);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (type === 3 || type === 0 && depth < 8) {
        const sample = row[x * depth >> 3] >> 8 - depth - (x * depth & 7) & (1 << depth) - 1;
        if (type === 3) {
          out[o] = palette?.[sample * 3] ?? 0;
          out[o + 1] = palette?.[sample * 3 + 1] ?? 0;
          out[o + 2] = palette?.[sample * 3 + 2] ?? 0;
          out[o + 3] = alpha && sample < alpha.length ? alpha[sample] : 255;
        } else {
          out[o] = out[o + 1] = out[o + 2] = Math.round(sample * scale);
          out[o + 3] = key && sample === key[0] ? 0 : 255;
        }
      } else if (type === 0) {
        out[o] = out[o + 1] = out[o + 2] = row[x];
        out[o + 3] = key && row[x] === key[0] ? 0 : 255;
      } else if (type === 2) {
        const [r, g, b] = [row[x * 3], row[x * 3 + 1], row[x * 3 + 2]];
        out.set([r, g, b, key && r === key[0] && g === key[1] && b === key[2] ? 0 : 255], o);
      } else if (type === 4) {
        out[o] = out[o + 1] = out[o + 2] = row[x * 2];
        out[o + 3] = row[x * 2 + 1];
      } else {
        out.set(row.subarray(x * 4, x * 4 + 4), o);
      }
    }
    [prev, row] = [row, prev];
  }
  return { width, height, data: out };
}
function unfilter(filter, row, prev, bpp) {
  for (let i = 0; i < row.length; i++) {
    const a = i >= bpp ? row[i - bpp] : 0;
    const b = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    if (filter === 1) row[i] += a;
    else if (filter === 2) row[i] += b;
    else if (filter === 3) row[i] += a + b >> 1;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      row[i] += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
  }
}

// src/game/ui.ts
init_lang();
var TEXT_COLORS = {
  white: [255, 255, 255],
  red: [255, 77, 77],
  green: [0, 255, 0],
  blue: [105, 105, 255],
  gold: [199, 179, 119],
  grey: [105, 105, 105],
  black: [0, 0, 0],
  tan: [208, 194, 125],
  orange: [255, 168, 0],
  yellow: [255, 255, 100],
  darkGreen: [0, 128, 0],
  purple: [174, 0, 255]
};
async function loadUi() {
  let manifest2;
  try {
    const response = await fetch(d2Url("ui.json"));
    manifest2 = await response.json();
  } catch {
    return null;
  }
  const fonts = {};
  await Promise.all(
    Object.entries(manifest2.fonts).map(async ([name, info]) => {
      const pixels = await loadPixels(info.file).catch(() => null);
      if (pixels) fonts[name] = new BitmapFont(info, pixels);
    })
  );
  wearD2Exocet(fonts, manifest2.exocet ? d2Url(manifest2.exocet) : null);
  return { manifest: manifest2, fonts, colors: manifest2.textColors ?? TEXT_COLORS };
}
var CACHE_TAG = "?v=2";
function asset(file) {
  return d2Url(file, CACHE_TAG);
}
async function loadPixels(file) {
  if (canvasReadback() !== "exact") {
    const response = await fetch(d2Url(file, CACHE_TAG, { png: true }));
    if (!response.ok) throw new Error(`Couldn't load ${file}`);
    const { data, width, height } = await decodePng(new Uint8Array(await response.arrayBuffer()));
    return new ImageData(data, width, height);
  }
  const url = asset(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx2 = canvas.getContext("2d", { willReadFrequently: true });
  ctx2.drawImage(image, 0, 0);
  return ctx2.getImageData(0, 0, image.width, image.height);
}
var SUBSTITUTES = { "\xB7": "-", "\u2013": "-", "\u2014": "-", "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2026": "." };
var BitmapFont = class {
  lineHeight;
  info;
  atlas;
  /** Glyphs worked out in each colour (glyph()). */
  glyphs = /* @__PURE__ */ new Map();
  /** The Hangul font's size for this font, the row its letters stand on, their widths, and the font's own colour. */
  foreignSize = 0;
  foreignFamily = HANGUL_FONT;
  foreignWeight = "";
  baseline = 0;
  foreignWidths = /* @__PURE__ */ new Map();
  faceLook = null;
  constructor(info, atlas) {
    this.info = info;
    this.atlas = atlas;
    this.lineHeight = info.height + Math.max(2, Math.round(info.height / 4));
  }
  /**
   * The width of `text` in the game's language (lang/index.ts), as canvas() draws it. Text is translated on its way in
   * here, in wrap(), balance() and canvas(), so callers keep writing English; its keys become the pad's buttons while
   * the pad is in use (padPrompts.ts).
   */
  width(text) {
    return this.measure(promptText(tr(text)));
  }
  wrap(text, maxWidth) {
    return this.wrapLines(promptText(tr(text)), maxWidth);
  }
  /**
   * Wraps each paragraph into as few lines as `wrap` does, but at the narrowest width that still takes, so its lines
   * come out about even: "One more level-up skip / per run, per rank" rather than a full line over an orphan "per rank".
   */
  balance(text, maxWidth) {
    return this.balanceLines(promptText(tr(text)), maxWidth);
  }
  /**
   * The text as a canvas at the font's own pixel size. A colour tints the grey fonts into one of D2's text colours;
   * without one, a font keeps its own (font24-42 are gold).
   */
  canvas(text, options = {}) {
    text = promptText(tr(text));
    const { color = null, align = "center", maxWidth, balance = false, shadow = false } = options;
    const lines = maxWidth ? balance ? this.balanceLines(text, maxWidth) : this.wrapLines(text, maxWidth) : text.split("\n");
    const widths = lines.map((line) => this.measure(line));
    const pad = shadow ? 1 : 0;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, ...widths) + pad;
    canvas.height = lines.length * this.lineHeight - (this.lineHeight - this.info.height) + pad;
    canvas.className = "d2-text";
    canvas.textContent = text;
    const ctx2 = canvas.getContext("2d");
    const image = ctx2.createImageData(canvas.width, canvas.height);
    const places = lines.map((line, i) => {
      const room = canvas.width - pad - widths[i];
      const x = align === "left" ? 0 : align === "right" ? room : Math.floor(room / 2);
      return { line, x, y: i * this.lineHeight };
    });
    for (const { line, x, y } of places) {
      if (shadow) this.draw(image, line, x + 1, y + 1, [0, 0, 0]);
      this.draw(image, line, x, y, color);
    }
    ctx2.putImageData(image, 0, 0);
    for (const { line, x, y } of places) {
      if (shadow) this.drawForeign(ctx2, line, x + 1, y + 1, [0, 0, 0]);
      this.drawForeign(ctx2, line, x, y, color);
    }
    return canvas;
  }
  measure(text) {
    let width = 0;
    for (const ch of text) width += this.advanceOf(ch);
    return width;
  }
  wrapLines(text, maxWidth) {
    const lines = [];
    for (const paragraph of text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (line && this.measure(next) > maxWidth) {
          lines.push(line.endsWith(" \xB7") ? line.slice(0, -2) : line);
          line = word === "\xB7" ? "" : word;
        } else {
          line = next;
        }
      }
      if (line || !paragraph) lines.push(line);
    }
    return lines;
  }
  balanceLines(text, maxWidth) {
    return text.split("\n").flatMap((paragraph) => {
      const lines = this.wrapLines(paragraph, maxWidth);
      const count = lines.length;
      if (count < 2) return lines;
      let low = 0;
      let high = maxWidth;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (this.wrapLines(paragraph, mid).length <= count) high = mid;
        else low = mid + 1;
      }
      return this.wrapLines(paragraph, low);
    });
  }
  /** How far `ch` moves the pen: its glyph's advance, or a Hangul letter's width in the Hangul font. */
  advanceOf(ch) {
    if (!isForeign(ch)) return this.info.advance[this.code(ch)];
    let width = this.foreignWidths.get(ch);
    if (width === void 0) {
      const g = measuring();
      g.font = this.foreignFont();
      width = Math.round(g.measureText(ch).width);
      this.foreignWidths.set(ch, width);
    }
    return width;
  }
  /**
   * Hangul as D2R draws it: in kodia, its Korean Exocet, beside D2's Exocet fonts (the buttons' and font24-42), and
   * in Iris L, bold, beside its text fonts; about the size of this font's capitals. Without D2R's fonts, in one of
   * Galmuri's pixel designs at its own size (or twice it).
   */
  foreignFont() {
    if (!this.foreignSize) {
      const ink = this.ink(72, 0.2);
      const { cellWidth, height } = this.info;
      let top = height;
      let bottom = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < cellWidth; x++) {
          if (!ink[y * cellWidth + x]) continue;
          top = Math.min(top, y);
          bottom = Math.max(bottom, y + 1);
        }
      }
      const cap = bottom > top ? bottom - top : height;
      const exocet = /font(exocet10|24|30|42)\b/.test(this.info.file);
      if (hasD2RFonts()) {
        const title = cap >= 20 ? 1.25 : 1.4;
        [this.foreignSize, this.foreignFamily] = exocet ? [Math.round(cap * title), KOREAN_TITLE] : [Math.max(12, Math.round(cap * 1.3)), KOREAN_TEXT];
        this.foreignWeight = exocet ? "" : "bold ";
      } else {
        [this.foreignSize, this.foreignFamily] = cap < 14 ? [12, HANGUL_FONT] : cap < 20 ? [15, HANGUL_FONT_MIDDLE] : [24, HANGUL_FONT];
      }
      this.baseline = bottom > top ? bottom : height;
    }
    return `${this.foreignWeight}${this.foreignSize}px "${this.foreignFamily}"`;
  }
  /**
   * The Hangul runs of `line`, drawn where the bitmap glyphs left room for them, looking as D2's letters do around
   * them: in their face's colour, and in an outline of their outline's colour for the fonts that have one (font24-42's
   * and the buttons' carved Exocet).
   */
  drawForeign(ctx2, line, x, y, color) {
    if (![...line].some(isForeign)) return;
    ctx2.font = this.foreignFont();
    ctx2.textBaseline = "alphabetic";
    const look2 = this.face();
    const tint = (level2, own) => (color ? color.map((c) => Math.round(c * level2)) : own).join(",");
    const step = this.foreignSize >= 28 ? 2 : 1;
    const passes = [];
    if (look2.outline) {
      const around = `rgb(${tint(look2.outline.level, look2.outline.own)})`;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) passes.push([around, dx * step, dy * step]);
    }
    passes.push([`rgb(${tint(look2.level, look2.own)})`, 0, 0]);
    for (const [fill, dx, dy] of passes) {
      ctx2.fillStyle = fill;
      let at = x;
      for (const ch of line) {
        if (isForeign(ch)) ctx2.fillText(ch, at + dx, y + this.baseline + dy);
        at += this.advanceOf(ch);
      }
    }
  }
  /**
   * How D2's letters look on average, for a flat letter beside them: their faces' light over the peak (what a tint
   * colour is scaled by) and own colour, and the same of their dark outline when about half their ink is one.
   */
  face() {
    if (!this.faceLook) {
      const { data } = this.atlas;
      const { peak } = this.info;
      const face = { count: 0, level: 0, sum: [0, 0, 0] };
      const dark = { count: 0, level: 0, sum: [0, 0, 0] };
      for (let i = 0; i < data.length; i += 4) {
        if (!data[i + 3]) continue;
        const light = Math.max(data[i], data[i + 1], data[i + 2]);
        const part = light >= peak * 0.2 ? face : dark;
        part.count++;
        part.level += Math.min(1, light / peak);
        for (let c = 0; c < 3; c++) part.sum[c] += data[i + c];
      }
      const look2 = (p) => ({ level: p.level / Math.max(1, p.count), own: p.sum.map((v) => Math.round(v / Math.max(1, p.count))) });
      this.faceLook = { ...look2(face), outline: dark.count > (face.count + dark.count) * 0.3 ? look2(dark) : null };
    }
    return this.faceLook;
  }
  /** Glyph `code`'s cell (cellWidth × height), 1 where its pixels are at least `floor` of the font's peak light. */
  ink(code, floor) {
    const { cellWidth, cellHeight, top, height, peak } = this.info;
    const { data, width } = this.atlas;
    const cx = code % 16 * cellWidth;
    const cy = Math.floor(code / 16) * cellHeight + top;
    const ink = new Uint8Array(cellWidth * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < cellWidth; x++) {
        const i = ((cy + y) * width + cx + x) * 4;
        if (data[i + 3] && Math.max(data[i], data[i + 1], data[i + 2]) >= peak * floor) ink[y * cellWidth + x] = 1;
      }
    }
    return ink;
  }
  /**
   * Glyph `code` in `color` (its own colours when null): its cell's pixels as RGBA words, 0 where it has no ink.
   * Worked out once a colour and kept: the HUD redraws its counters many times a second (HOR-350).
   */
  glyph(code, color) {
    const key = color ? `${color[0]},${color[1]},${color[2]}` : "own";
    let glyphs = this.glyphs.get(key);
    if (!glyphs) this.glyphs.set(key, glyphs = []);
    const kept = glyphs[code];
    if (kept) return kept;
    const { cellWidth, cellHeight, top, height, peak } = this.info;
    const atlas = this.atlas;
    const cx = code % 16 * cellWidth;
    const cy = Math.floor(code / 16) * cellHeight + top;
    const bytes = new Uint8ClampedArray(cellWidth * height * 4);
    for (let gy = 0; gy < height; gy++) {
      for (let gx = 0; gx < cellWidth; gx++) {
        const from = ((cy + gy) * atlas.width + cx + gx) * 4;
        if (atlas.data[from + 3] === 0) continue;
        const to = (gy * cellWidth + gx) * 4;
        if (color) {
          const k = Math.min(1, Math.max(atlas.data[from], atlas.data[from + 1], atlas.data[from + 2]) / peak);
          bytes[to] = color[0] * k;
          bytes[to + 1] = color[1] * k;
          bytes[to + 2] = color[2] * k;
        } else {
          bytes[to] = atlas.data[from];
          bytes[to + 1] = atlas.data[from + 1];
          bytes[to + 2] = atlas.data[from + 2];
        }
        bytes[to + 3] = 255;
      }
    }
    return glyphs[code] = new Uint32Array(bytes.buffer);
  }
  draw(out, line, x, y, color) {
    const { cellWidth, height, advance } = this.info;
    const words = new Uint32Array(out.data.buffer, out.data.byteOffset, out.width * out.height);
    for (const ch of line) {
      if (isForeign(ch)) {
        x += this.advanceOf(ch);
        continue;
      }
      const code = this.code(ch);
      const glyph = this.glyph(code, color);
      for (let gy = 0; gy < height; gy++) {
        const oy = y + gy;
        if (oy < 0 || oy >= out.height) continue;
        const row = oy * out.width;
        for (let gx = 0; gx < cellWidth; gx++) {
          const ox = x + gx;
          if (ox >= out.width) break;
          const word = glyph[gy * cellWidth + gx];
          if (word !== 0) words[row + ox] = word;
        }
      }
      x += advance[code];
    }
  }
  code(ch) {
    const code = (SUBSTITUTES[ch] ?? ch).charCodeAt(0);
    return code < 256 && this.info.advance[code] ? code : 63;
  }
};
function isForeign(ch) {
  const c = ch.charCodeAt(0);
  return c >= 44032 && c <= 55203 || c >= 12592 && c <= 12687 || c >= 4352 && c <= 4607;
}
var measurer = null;
function measuring() {
  return measurer ??= document.createElement("canvas").getContext("2d");
}

// src/game/frontend/surface.ts
var WIDTH2 = 800;
var HEIGHT = 600;
var MIN_SCALE = 44 / 35;
var CROP = 300;
var MIN_CROP = 280;
var LANDSCAPE = { portrait: false, x: 0, y: 0, width: WIDTH2, height: HEIGHT, scale: 1, top: 0, bottom: HEIGHT };
var Surface = class {
  ui;
  root = document.createElement("div");
  canvas = document.createElement("canvas");
  g;
  screen = null;
  overRun = false;
  opened = 0;
  frame = 0;
  images = /* @__PURE__ */ new Map();
  decoded = /* @__PURE__ */ new Map();
  texts = /* @__PURE__ */ new Map();
  /** What's showing of D2's frame; replaced whenever the screen's shape changes. */
  view = LANDSCAPE;
  /** The screen size `view` was laid out for ('' in landscape, which never touches the canvas). */
  sized = "";
  /** Portrait: the D2 x the crop centres on, where the screen pans it (the campfire follows the lit hero). */
  panX = WIDTH2 / 2;
  /** Reads the safe-area insets, which only CSS knows. */
  safe = document.createElement("div");
  /** When a finger last pressed the canvas, until the click that follows it. */
  tapped = null;
  /** Whether the press being handled is a finger's (or a pen's) rather than the mouse's. */
  finger = false;
  /** Dev builds: the tap targets drawn this frame, for tests (window.frontend). */
  targets = [];
  constructor(ui) {
    this.ui = ui;
    this.root.id = "frontend";
    this.root.className = "hidden";
    this.canvas.width = WIDTH2;
    this.canvas.height = HEIGHT;
    this.safe.className = "frontend-safe";
    this.root.append(this.canvas, this.safe);
    document.body.append(this.root);
    this.g = this.canvas.getContext("2d");
    this.g.imageSmoothingEnabled = false;
    this.canvas.addEventListener("pointermove", (e) => this.pointer(e, "pointerMove"));
    this.canvas.addEventListener("pointerdown", (e) => {
      this.finger = e.pointerType !== "mouse";
      if (this.finger) this.tapped = e.timeStamp;
      this.pointer(e, "pointerDown");
    });
    addEventListener(
      "click",
      (e) => {
        if (this.tapped !== null && e.target !== this.canvas && e.timeStamp - this.tapped < 1e3) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.tapped = null;
      },
      true
    );
    addEventListener("pointerdown", (e) => e.target !== this.canvas && (this.tapped = null), true);
    addEventListener("pointerup", (e) => this.pointer(e, "pointerUp"));
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        if (!this.screen?.wheel) return;
        e.preventDefault();
        this.screen.wheel(e.deltaY);
      },
      { passive: false }
    );
    addEventListener("keydown", (e) => {
      if (!this.screen || e.defaultPrevented || e.repeat || e.timeStamp < this.opened) return;
      if (this.screen.key?.(e, this.time())) e.preventDefault();
    });
    if (define_import_meta_env_default.DEV) {
      Object.assign(window, {
        frontend: {
          view: () => ({ ...this.view }),
          targets: () => this.targets.map((t) => ({ ...t, client: this.toClient(t.x, t.y, t.width, t.height) })),
          /** Where a point in D2's pixels shows on the page, for tests to tap what isn't a target (a hero at the fire). */
          client: (x, y) => this.toClient(x, y, 0, 0)
        }
      });
    }
  }
  get open() {
    return this.screen !== null;
  }
  /**
   * Puts a screen up (replacing the one showing) and keeps drawing it until hide(). `overRun` draws it over the paused
   * game, dimmed, as D2 draws its in-game menus, instead of on black.
   */
  show(screen, overRun = false) {
    this.screen = screen;
    this.overRun = overRun;
    this.opened = performance.now();
    this.panX = WIDTH2 / 2;
    this.root.classList.remove("hidden");
    this.root.classList.toggle("over-run", overRun);
    document.body.classList.add("frontend-open");
    document.body.classList.toggle("frontend-over-run", overRun);
    document.body.classList.toggle("frontend-backdrop", !!screen.backdrop);
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  }
  hide() {
    this.screen = null;
    this.root.classList.add("hidden");
    document.body.classList.remove("frontend-open", "frontend-over-run", "frontend-backdrop");
    cancelAnimationFrame(this.frame);
  }
  /** An image from public/d2, loading in the background; draw() skips it until it has arrived. */
  image(file) {
    let image = this.images.get(file);
    if (!image) {
      image = new Image();
      image.src = asset(file);
      this.images.set(file, image);
    }
    return image;
  }
  /** Resolves once these images are decoded (or failed: a missing image just doesn't draw). */
  ready(files2) {
    return Promise.all(
      files2.map((file) => {
        let done = this.decoded.get(file);
        if (!done) {
          done = this.image(file).decode().catch(() => {
          });
          this.decoded.set(file, done);
        }
        return done;
      })
    ).then(() => {
    });
  }
  /** Draws `frame` of an animation with its draw point at (x, y); additive layers add light like D2's. */
  anim(g, anim, frame, x, y, alpha = 1) {
    const image = this.image(anim.file);
    if (!image.complete || !image.naturalWidth || frame < 0 || frame >= anim.frames) return;
    const sx = frame % anim.columns * anim.width;
    const sy = Math.floor(frame / anim.columns) * anim.height;
    g.save();
    g.globalAlpha = alpha;
    if (anim.blend === "add") g.globalCompositeOperation = "lighter";
    g.drawImage(image, sx, sy, anim.width, anim.height, Math.round(x - anim.originX), Math.round(y - anim.originY), anim.width, anim.height);
    g.restore();
  }
  /** An image drawn at its own size with its top-left at (x, y). */
  picture(g, file, x = 0, y = 0) {
    const image = this.image(file);
    if (image.complete && image.naturalWidth) g.drawImage(image, Math.round(x), Math.round(y));
  }
  /** Text in one of D2's bitmap fonts, rendered once and cached. */
  text(text, style) {
    const { font, color = null, align = "center", maxWidth, balance = false, shadow = false } = style;
    const key = `${font}|${color?.join(",")}|${align}|${maxWidth}|${balance}|${shadow}|${promptKey()}|${text}`;
    let canvas = this.texts.get(key);
    if (!canvas) {
      const bitmap = this.ui.fonts[font];
      canvas = bitmap ? bitmap.canvas(text, { color, align, maxWidth, balance, shadow }) : document.createElement("canvas");
      this.texts.set(key, canvas);
    }
    return canvas;
  }
  /** Draws text with `x` at its left, centre or right edge per `align`, and `y` at its top. */
  print(g, text, x, y, style, alpha = 1) {
    const canvas = this.text(text, style);
    const align = style.align ?? "center";
    const left = align === "center" ? x - canvas.width / 2 : align === "right" ? x - canvas.width : x;
    g.save();
    g.globalAlpha = alpha;
    g.drawImage(canvas, Math.round(left), Math.round(y));
    g.restore();
  }
  /**
   * Text squeezed to fit `maxWidth` when it's wider (portrait's narrow crop), drawn like print(); returns its height
   * as drawn.
   */
  printFit(g, text, x, y, style, maxWidth, alpha = 1) {
    const canvas = this.text(text, style);
    const scale = Math.min(1, maxWidth / canvas.width);
    const width = canvas.width * scale;
    const align = style.align ?? "center";
    const left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
    g.save();
    g.globalAlpha = alpha;
    g.drawImage(canvas, left, y, width, canvas.height * scale);
    g.restore();
    return canvas.height * scale;
  }
  /** Portrait: centres the crop on D2's `x`, kept inside the frame. Nothing in landscape. */
  pan(x) {
    this.panX = x;
    if (!this.view.portrait) return;
    this.view.x = Math.min(WIDTH2 - this.view.width, Math.max(0, x - this.view.width / 2));
    this.transform();
  }
  /** Dev builds: notes a tap target drawn this frame, for tests to find and measure. */
  target(label, x, y, width, height, disabled = false) {
    if (define_import_meta_env_default.DEV) this.targets.push({ label, x, y, width, height, disabled });
  }
  /** One of D2's text colours (Pal.PL2). */
  color(name) {
    return this.ui.colors[name];
  }
  time() {
    return (performance.now() - this.opened) / 1e3;
  }
  /**
   * Fits the canvas to the screen's shape. Landscape leaves it alone: D2's 800×600, letterboxed by frontend.css.
   * Portrait sizes it to the screen in device pixels and lays out the crop.
   */
  layout() {
    const portrait = isPortrait();
    const width = this.root.clientWidth || innerWidth;
    const height = this.root.clientHeight || innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 3);
    const hud = portrait && this.overRun ? parseFloat(document.documentElement.style.getPropertyValue("--pt-ctrl-h")) || 0 : 0;
    const key = portrait ? `${width}x${height}@${ratio}/${hud}` : "";
    if (key === this.sized) return;
    this.sized = key;
    if (portrait) {
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      const scale = Math.min(width / MIN_CROP, Math.max(MIN_SCALE, Math.min(width / CROP, height / HEIGHT)));
      const safe = getComputedStyle(this.safe);
      const w = width / scale;
      const h = height / scale;
      const y = (HEIGHT - h) / 2;
      this.view = {
        portrait: true,
        x: (WIDTH2 - w) / 2,
        y,
        width: w,
        height: h,
        scale,
        top: y + (parseFloat(safe.paddingTop) || 0) / scale,
        bottom: y + h - ((parseFloat(safe.paddingBottom) || 0) + hud) / scale
      };
    } else {
      this.canvas.width = WIDTH2;
      this.canvas.height = HEIGHT;
      this.canvas.style.width = "";
      this.canvas.style.height = "";
      this.view = LANDSCAPE;
    }
    this.g.imageSmoothingEnabled = false;
  }
  /** Portrait: D2's pixels onto the canvas's device pixels, with the crop's top-left in the corner. */
  transform() {
    const v = this.view;
    const k = this.canvas.width / (this.canvas.clientWidth || this.canvas.width) * v.scale;
    this.g.setTransform(k, 0, 0, k, -v.x * k, -v.y * k);
  }
  draw() {
    if (!this.screen) return;
    this.layout();
    this.targets.length = 0;
    const g = this.g;
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
    if (this.view.portrait) g.setTransform(1, 0, 0, 1, 0, 0);
    if (this.overRun) g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    else {
      g.fillStyle = "#000";
      g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.pan(this.panX);
    this.screen.draw(g, this.time());
    this.frame = requestAnimationFrame(() => this.draw());
  }
  pointer(e, kind) {
    if (!this.screen || kind === "pointerDown" && e.button !== 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const v = this.view;
    const x = v.portrait ? v.x + (e.clientX - rect.left) / v.scale : (e.clientX - rect.left) * WIDTH2 / rect.width;
    const y = v.portrait ? v.y + (e.clientY - rect.top) / v.scale : (e.clientY - rect.top) * HEIGHT / rect.height;
    this.screen[kind]?.(x, y, this.time());
  }
  /** Where a rectangle in D2's pixels shows on the page, in CSS pixels (for tests). */
  toClient(x, y, width, height) {
    const rect = this.canvas.getBoundingClientRect();
    const v = this.view;
    const sx = v.portrait ? v.scale : rect.width / WIDTH2;
    const sy = v.portrait ? v.scale : rect.height / HEIGHT;
    return { x: rect.left + (x - v.x) * sx, y: rect.top + (y - v.y) * sy, width: width * sx, height: height * sy };
  }
};
var FACE_INSET = 17;
var Button = class {
  x;
  y;
  label;
  disabled = false;
  /** Picked with the keyboard: the label lights up, since D2's buttons have no hover state. */
  focused = false;
  /** Asking to be pressed (the menu's NEWS with something new): the stone's two blue gems glow gold, pulsing slowly. */
  lit = false;
  kind;
  files;
  action;
  held = false;
  over = false;
  constructor(kind, files2, x, y, label, action) {
    this.kind = kind;
    this.files = files2;
    this.x = x;
    this.y = y;
    this.label = label;
    this.action = action;
  }
  get width() {
    return this.kind === "wide" ? 272 : 128;
  }
  get height() {
    return 35;
  }
  contains(x, y) {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }
  /** Returns whether the press landed on the button. */
  down(x, y) {
    if (this.disabled || !this.contains(x, y)) return false;
    this.held = true;
    this.over = true;
    play("click");
    return true;
  }
  move(x, y) {
    this.over = this.contains(x, y);
  }
  up(x, y) {
    const clicked = this.held && this.contains(x, y);
    this.held = false;
    if (clicked) this.action();
    return clicked;
  }
  /** The keyboard's press: click sound, then the action. */
  press() {
    if (this.disabled) return;
    play("click");
    this.action();
  }
  /**
   * Lit: each of the stone's blue gems (a 5×5 jewel in its end, at 8.3 and 119.7 across a medium stone, 17.4 down,
   * measured from button-medium.png, the stone NEWS stands on) turns gold and gives off a soft light, feathered to
   * nothing, breathing every 2.4 s. The label stays as every other stone's.
   */
  glowGems(g) {
    const pulse = 0.5 - 0.5 * Math.cos(performance.now() / 1e3 * (2 * Math.PI / 2.4));
    const y = this.y + 17.4;
    for (const x of [this.x + 8.3, this.x + this.width - 8.3]) {
      const radius = 9 + 4 * pulse;
      const light = g.createRadialGradient(x, y, 0, x, y, radius);
      light.addColorStop(0, `rgb(255 190 80 / ${0.55 + 0.35 * pulse})`);
      light.addColorStop(0.4, `rgb(220 140 40 / ${0.25 + 0.2 * pulse})`);
      light.addColorStop(1, "rgb(200 120 30 / 0)");
      g.save();
      g.globalCompositeOperation = "lighter";
      g.fillStyle = light;
      g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      g.restore();
      const jewel = g.createRadialGradient(x, y, 0, x, y, 3.2);
      jewel.addColorStop(0, `rgb(255 235 160 / ${0.85 + 0.15 * pulse})`);
      jewel.addColorStop(0.6, `rgb(230 170 60 / ${0.8 + 0.2 * pulse})`);
      jewel.addColorStop(1, "rgb(180 110 30 / 0)");
      g.fillStyle = jewel;
      g.fillRect(x - 3.2, y - 3.2, 6.4, 6.4);
    }
  }
  draw(g, surface) {
    const pressed = this.held && this.over;
    surface.target(this.label, this.x, this.y, this.width, this.height, this.disabled);
    g.save();
    if (this.disabled) g.globalAlpha = 0.45;
    surface.picture(g, this.files[pressed ? 1 : 0], this.x, this.y);
    const color = this.focused ? [150, 120, 50] : [100, 100, 100];
    const label = surface.text(this.label, { font: "fontexocet10", color });
    const width = Math.min(label.width, this.width - 2 * FACE_INSET);
    const lx = this.x + Math.floor((this.width - width) / 2) - (pressed ? 2 : 0);
    const ly = this.y + Math.floor((this.height - label.height) / 2) + (pressed ? 2 : 0);
    g.drawImage(label, lx, ly, width, label.height);
    if ((this.lit || this.focused && inputMode() === "pad") && !pressed) this.glowGems(g);
    g.restore();
  }
};
function buttonKeys(e, buttons) {
  const live = buttons.filter((b) => !b.disabled);
  if (live.length === 0) return false;
  const at = live.findIndex((b) => b.focused);
  const step = e.code === "ArrowDown" || e.code === "KeyS" ? 1 : e.code === "ArrowUp" || e.code === "KeyW" ? -1 : 0;
  if (step) {
    for (const b of buttons) b.focused = false;
    live[at < 0 ? step > 0 ? 0 : live.length - 1 : (at + step + live.length) % live.length].focused = true;
    return true;
  }
  if ((e.code === "Enter" || e.code === "Space" || e.code === "NumpadEnter") && at >= 0) {
    live[at].press();
    return true;
  }
  return false;
}

// desktop/setup/d2look.ts
var MUSIC_LEVEL = 0.6;
var FADE_IN = 1;
var TONES = {
  plain: [216, 208, 192],
  dim: [150, 140, 120],
  path: [199, 179, 119],
  warning: [255, 168, 0],
  problem: [255, 77, 77]
};
var TEXT_WIDTH = 620;
var BUTTON_GAP = 7;
var BAR = { width: 290, height: 33, inset: 3 };
var NOTICE = "Unofficial fan project, not affiliated with Blizzard Entertainment. Diablo II\xAE is a trademark of Blizzard Entertainment, Inc.";
async function loadD2Look() {
  const ui = await loadUi();
  if (!ui || !ui.fonts.font16 || !ui.fonts.font30 || !ui.fonts.fontexocet10) return null;
  const manifest2 = await fetch("./d2/frontend.json").then((r) => r.json());
  const surface = new Surface(ui);
  await surface.ready([manifest2.title, ...manifest2.logo.layers.map((l) => l.file), ...manifest2.buttons.wide, manifest2.options.bar, manifest2.options.pentagram.file]);
  const music = manifest2.audio.music.title;
  if (music) {
    addAudio({ sounds: {}, music: { title: { ...music, volume: music.volume * MUSIC_LEVEL } } });
    playMusic("title");
  }
  return new D2Look(surface, manifest2);
}
var D2Look = class _D2Look {
  surface;
  manifest;
  page = null;
  buttons = [];
  /** The buttons' labels, to tell a new set from the same one again (the clock re-renders every second). */
  labels = "";
  /** Whose game it isn't, at the foot of the screen as on the title screen. */
  notice;
  constructor(surface, manifest2) {
    this.surface = surface;
    this.manifest = manifest2;
    this.notice = surface.text(NOTICE, { font: "font8", color: [120, 110, 95], maxWidth: WIDTH2 - 16 });
  }
  show(page2) {
    this.page = page2;
    const actions = _D2Look.actions(page2);
    const labels = actions.map((a) => a.label).join("/");
    if (labels !== this.labels) {
      this.labels = labels;
      const n = actions.length;
      const perRow = n > 2 ? 2 : 1;
      const rows = Math.ceil(n / perRow);
      const top = HEIGHT - this.notice.height - 18 - rows * 35 - (rows - 1) * BUTTON_GAP;
      const place = (i) => {
        const row = Math.floor(i / perRow);
        const inRow = Math.min(perRow, n - row * perRow);
        const left = (WIDTH2 - inRow * 272 - (inRow - 1) * 16) / 2;
        return { x: left + i % perRow * (272 + 16), y: top + row * (35 + BUTTON_GAP) };
      };
      this.buttons = actions.map((action, i) => {
        const { x, y } = place(i);
        return new Button("wide", this.manifest.buttons.wide, x, y, action.label.replace("\u2026", "").toUpperCase(), () => this.page ? _D2Look.actions(this.page)[i]?.run() : void 0);
      });
    }
    actions.forEach((action, i) => this.buttons[i].disabled = action.disabled ?? false);
    if (!this.surface.open) this.surface.show(this.screen());
  }
  static actions(page2) {
    return page2.link ? [...page2.actions, page2.link] : page2.actions;
  }
  screen() {
    const buttons = () => this.buttons;
    return {
      draw: (g, t) => this.draw(g, t),
      pointerMove: (x, y) => buttons().forEach((b) => b.move(x, y)),
      pointerDown: (x, y) => buttons().forEach((b) => {
        b.focused = false;
        b.down(x, y);
      }),
      pointerUp: (x, y) => buttons().forEach((b) => b.up(x, y)),
      // D2's buttons never light up on their own; with none picked by the arrows, Enter runs the first (the main action).
      key: (e) => {
        if (buttonKeys(e, buttons())) return true;
        const first = buttons().find((b) => !b.disabled);
        if (!first || e.code !== "Enter" && e.code !== "NumpadEnter") return false;
        first.press();
        return true;
      }
    };
  }
  draw(g, t) {
    const { surface, manifest: manifest2 } = this;
    const page2 = this.page;
    surface.picture(g, manifest2.title);
    const { logo } = manifest2;
    const frame = (layer, at) => Math.floor(at * layer.fps) % layer.frames;
    for (const layer of logo.layers) surface.anim(g, layer, frame(layer, t), logo.x, logo.y);
    drawSubtitle(g, t, (fire, at) => {
      for (const layer of logo.layers) if (layer.blend === "add") surface.anim(fire, layer, frame(layer, at), logo.x, logo.y);
    }, surface.ui.fonts.font42);
    const shade = g.createLinearGradient(0, 228, 0, 300);
    shade.addColorStop(0, "rgb(0 0 0 / 0)");
    shade.addColorStop(1, "rgb(0 0 0 / 0.72)");
    g.fillStyle = shade;
    g.fillRect(0, 228, WIDTH2, HEIGHT - 228);
    let y = 246;
    if (page2.heading) {
      surface.print(g, page2.heading, WIDTH2 / 2, y, { font: "font30" });
      y += 30 + 14;
    }
    const texts = page2.lines.filter((line) => line.text).map((line) => surface.text(line.tone === "path" ? this.fitPath(line.text) : line.text, { font: "font16", color: TONES[line.tone ?? "plain"], maxWidth: TEXT_WIDTH }));
    if (page2.panel && texts.length) {
      const height = texts.reduce((sum, text) => sum + text.height + 8, 0) + 16;
      const left = Math.round(WIDTH2 / 2 - TEXT_WIDTH / 2) - 16;
      g.fillStyle = "rgb(0 0 0 / 0.75)";
      g.fillRect(left, y - 12, TEXT_WIDTH + 32, height);
      g.strokeStyle = "rgb(160 132 72 / 0.8)";
      g.lineWidth = 1;
      g.strokeRect(left + 0.5, y - 11.5, TEXT_WIDTH + 31, height - 1);
    }
    for (const text of texts) {
      g.drawImage(text, Math.round(WIDTH2 / 2 - text.width / 2), y);
      y += text.height + 8;
    }
    if (page2.progress) this.bar(g, t, y + 6, page2.progress);
    for (const b of this.buttons) b.draw(g, surface);
    g.drawImage(this.notice, Math.round(WIDTH2 / 2 - this.notice.width / 2), HEIGHT - this.notice.height - 6);
    if (t < FADE_IN) {
      g.fillStyle = `rgb(0 0 0 / ${1 - t / FADE_IN})`;
      g.fillRect(0, 0, WIDTH2, HEIGHT);
    }
  }
  /** A folder too wide for a line (D2's fonts wrap only at spaces), with its leading folders cut to an ellipsis. */
  fitPath(path) {
    const font = this.surface.ui.fonts.font16;
    const sep = path.includes("\\") ? "\\" : "/";
    const parts = path.split(sep);
    let fitted = path;
    for (let cut = 1; font.width(fitted) > TEXT_WIDTH && cut < parts.length - 1; cut++) fitted = `...${sep}${parts.slice(cut + 1).join(sep)}`;
    return fitted;
  }
  /** The options slider's frame, filled with fire as far as the extraction has gone, a pentagram spinning each side. */
  bar(g, t, y, progress) {
    const { surface, manifest: manifest2 } = this;
    const x = Math.round((WIDTH2 - BAR.width) / 2);
    const inner = { x: x + BAR.inset, y: y + BAR.inset, width: BAR.width - 2 * BAR.inset, height: BAR.height - 2 * BAR.inset };
    g.fillStyle = "rgb(0 0 0 / 0.8)";
    g.fillRect(inner.x, inner.y, inner.width, inner.height);
    const busy = progress.fraction === "busy";
    const from = busy ? inner.x + inner.width * 0.75 * (1 + Math.sin(t * 2)) / 2 : inner.x;
    const width = busy ? inner.width * 0.25 : Math.round(inner.width * progress.fraction);
    if (width > 0) {
      const fire = g.createLinearGradient(0, inner.y, 0, inner.y + inner.height);
      fire.addColorStop(0, "#f6b04a");
      fire.addColorStop(0.35, "#c8461a");
      fire.addColorStop(1, "#4a0804");
      g.fillStyle = fire;
      g.fillRect(from, inner.y, width, inner.height);
      g.save();
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.25 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);
      g.fillStyle = "#ff7a20";
      g.fillRect(from + width - 4, inner.y, 4, inner.height);
      g.restore();
    }
    surface.picture(g, manifest2.options.bar, x, y);
    const pent = manifest2.options.pentagram;
    const frame = Math.floor(t * pent.fps) % pent.frames;
    const cy = y + BAR.height / 2 - pent.height / 2 + pent.originY;
    surface.anim(g, pent, frame, x - pent.width - 6 + pent.originX, cy);
    surface.anim(g, pent, frame, x + BAR.width + 6 + pent.originX, cy);
    surface.print(g, progress.caption, WIDTH2 / 2, y + BAR.height + 8, { font: "font16", color: TONES.dim });
  }
};

// desktop/setup/ember.ts
init_define_import_meta_env();
var $ = (id) => document.getElementById(id);
var EmberLook = class {
  fire = new Embers($("embers"));
  /** The page's buttons by label, kept between renders so focus survives the clock ticking. */
  shown = "";
  show(page2) {
    $("heading").textContent = page2.heading;
    $("heading").hidden = !page2.heading;
    document.querySelector(".page")?.classList.toggle("panel", !!page2.panel);
    $("lines").replaceChildren(
      ...page2.lines.map((line) => {
        const p = document.createElement("p");
        p.className = `line ${line.tone ?? "plain"}`;
        p.textContent = line.text;
        return p;
      })
    );
    const progress = $("progress");
    progress.hidden = !page2.progress;
    if (page2.progress) {
      const busy = page2.progress.fraction === "busy";
      progress.classList.toggle("busy", busy);
      $("fill").style.width = busy ? "" : `${100 * page2.progress.fraction}%`;
      $("caption").textContent = page2.progress.caption;
    }
    const actions = $("actions");
    const labels = page2.actions.map((a) => `${a.label}|${a.disabled ?? false}`).join("/");
    if (labels !== this.shown) {
      this.shown = labels;
      actions.replaceChildren(
        ...page2.actions.map((action, i) => {
          const button = document.createElement("button");
          button.className = i === 0 ? "stone primary" : "stone";
          button.textContent = action.label;
          button.disabled = action.disabled ?? false;
          return button;
        })
      );
      actions.firstElementChild?.focus({ preventScroll: true });
    }
    page2.actions.forEach((action, i) => actions.children[i].onclick = action.run);
    let link = document.getElementById("link");
    if (!link && page2.link) {
      link = document.createElement("button");
      link.id = "link";
      link.className = "link";
      actions.after(link);
    }
    if (link) {
      link.hidden = !page2.link;
      link.textContent = page2.link?.label ?? "";
      link.onclick = page2.link?.run ?? null;
    }
  }
  /** The D2 look has taken over: no more drawing behind it. */
  stop() {
    this.fire.stop();
  }
};
var Embers = class {
  canvas;
  g;
  sparks = [];
  frame = 0;
  last = 0;
  calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext("2d");
    this.frame = requestAnimationFrame((t) => this.draw(t));
  }
  stop() {
    cancelAnimationFrame(this.frame);
    this.canvas.hidden = true;
  }
  draw(now) {
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1e3 : 0);
    this.last = now;
    const t = now / 1e3;
    const { canvas, g } = this;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#050302";
    g.fillRect(0, 0, width, height);
    const breath = 0.75 + 0.15 * Math.sin(t * 0.9) + 0.1 * Math.sin(t * 5.3 + Math.sin(t * 1.7) * 2);
    const glow = g.createRadialGradient(width / 2, height * 1.08, 0, width / 2, height * 1.08, Math.max(width, height) * 0.75);
    glow.addColorStop(0, `rgb(255 110 30 / ${0.42 * breath})`);
    glow.addColorStop(0.35, `rgb(150 40 10 / ${0.22 * breath})`);
    glow.addColorStop(1, "rgb(0 0 0 / 0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, width, height);
    const wanted = this.calm ? 0 : Math.round(width * height / 9e3);
    while (this.sparks.length < wanted) this.sparks.push(this.spark(width, height, true));
    g.globalCompositeOperation = "lighter";
    this.sparks = this.sparks.filter((s) => {
      s.age += dt;
      s.x += (s.vx + Math.sin(t * 1.3 + s.wobble) * 14) * dt;
      s.y += s.vy * dt;
      if (s.age > s.life || s.y < -10) return false;
      const left = 1 - s.age / s.life;
      const flicker = 0.7 + 0.3 * Math.sin(t * 13 + s.wobble * 7);
      const alpha = Math.min(1, s.age * 3) * left * flicker;
      const r = s.size * (0.6 + 0.4 * left);
      const halo = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4);
      halo.addColorStop(0, `rgb(255 ${Math.round(150 + 80 * s.heat)} ${Math.round(60 * s.heat)} / ${alpha})`);
      halo.addColorStop(0.25, `rgb(255 ${Math.round(90 + 60 * s.heat)} 20 / ${alpha * 0.5})`);
      halo.addColorStop(1, "rgb(120 20 0 / 0)");
      g.fillStyle = halo;
      g.fillRect(s.x - r * 4, s.y - r * 4, r * 8, r * 8);
      return true;
    });
    while (this.sparks.length < wanted) this.sparks.push(this.spark(width, height, false));
    this.frame = requestAnimationFrame((next) => this.draw(next));
  }
  /** A new ember from the bottom edge, or anywhere on screen when filling it the first time. */
  spark(width, height, anywhere) {
    const life = 4 + Math.random() * 6;
    return {
      x: width * (0.1 + 0.8 * Math.random()),
      y: anywhere ? height * Math.random() : height + 8,
      vx: (Math.random() - 0.5) * 16,
      vy: -(18 + Math.random() * 42) * (height / 700),
      size: 0.8 + Math.random() * 1.8,
      heat: Math.random(),
      age: anywhere ? Math.random() * life * 0.6 : 0,
      life,
      wobble: Math.random() * 10
    };
  }
};

// desktop/setup/failure.ts
init_define_import_meta_env();
var UNREADABLE = {
  problem: "Your computer couldn\u2019t read a game file.",
  tips: [
    "On an external or network drive? Keep it connected.",
    "In OneDrive, iCloud or Dropbox? Set it to always keep on this device.",
    "Close Diablo II and let Battle.net finish updating, then try again."
  ]
};
var DENIED = {
  problem: "D2 Survivors wasn\u2019t allowed to read a game file.",
  tips: ["An antivirus may be blocking it: allow D2 Survivors, or move the game to a normal folder, then try again."]
};
var MISSING = {
  problem: "A game file is missing.",
  tips: ["Repair the game in Battle.net (Options, then Scan and Repair), then try again."]
};
var FULL = {
  problem: "This computer\u2019s disk is full.",
  tips: ["Free some space, then try again."]
};
var OTHER = {
  problem: "Something went wrong while copying the game files.",
  tips: ["Try again. If it stops again, copy the details for a report."]
};
var BY_CODE = {
  EIO: UNREADABLE,
  EBUSY: UNREADABLE,
  EAGAIN: UNREADABLE,
  EINTR: UNREADABLE,
  ETIMEDOUT: UNREADABLE,
  EACCES: DENIED,
  EPERM: DENIED,
  ENOENT: MISSING,
  ENOSPC: FULL
};
var FAILURE_TEXT = [...new Set([UNREADABLE, DENIED, MISSING, FULL, OTHER].flatMap((a) => [a.problem, ...a.tips]))];
function adviceFor(detail) {
  return detail.code && BY_CODE[detail.code] || OTHER;
}
function failureLines(detail) {
  const advice = adviceFor(detail);
  const lines = [{ text: advice.problem, tone: "problem" }];
  if (detail.path) lines.push({ text: detail.path, tone: "path" });
  for (const tip of advice.tips) lines.push({ text: tip, tone: "dim" });
  if (!detail.code) {
    const first = firstLine(detail.message);
    if (first) lines.push({ text: first, tone: "dim" });
  }
  return lines;
}
function firstLine(message) {
  return (message.trim().split("\n")[0] ?? "").replace(/^(Error: )?(Error invoking remote method '[^']+': )?(Error: )*/, "").trim();
}
function failureDetails(detail, context) {
  const rows = [
    `D2 Survivors ${context.version ?? ""} (${context.platform ?? "?"}): the extraction stopped`,
    detail.code ? `Code: ${detail.code}${detail.syscall ? ` (${detail.syscall})` : ""}` : null,
    detail.path ? `File: ${detail.path}` : null,
    context.install ? `Install: ${context.install}` : null,
    `Error: ${detail.message}`,
    detail.stack && detail.stack !== detail.message ? `
${detail.stack}` : null
  ];
  return rows.filter((row) => row !== null).join("\n");
}

// desktop/setup/setup.ts
var api = window.d2desktop;
var INTRO = "D2 Survivors plays with the art and sound of your own Diablo II and Lord of Destruction, or Diablo II: Resurrected. It copies them once, into its own folder on this computer. Nothing is sent anywhere; it only asks d2survivors.lol for newer builds.";
var RESURRECTED = "Sounds and music from Diablo II: Resurrected.";
var REASONS = {
  first: null,
  missing: { text: "Some of the game files are missing. Extract them again to play.", tone: "warning" },
  outdated: { text: "This version of D2 Survivors reads the game files differently. Extract them again to play.", tone: "warning" },
  reextract: { text: "The art and sound are copied again, from this install or another, over the ones the game has now." },
  update: { text: "This version of D2 Survivors reads some of the game files differently. Extract them again to play.", tone: "warning" }
};
var state;
var phase = { name: "locate" };
var install = null;
var ember = new EmberLook();
var look = ember;
async function start() {
  await startLanguage().catch((error) => console.warn("Korean didn\u2019t load", error));
  state = await api.state();
  install = state.install;
  addAudio({ sounds: {}, music: {} });
  if (state.reason === "update") {
    go({ name: "extracting", steps: [], started: Date.now(), since: /* @__PURE__ */ new Map(), update: true });
    if (state.art) await wearD2();
    render2();
    return;
  }
  if (state.art) await wearD2();
  if (install?.ok) await useInstall(install);
  else go({ name: "locate" });
}
async function wearD2() {
  const d2 = await loadD2Look().catch((error) => {
    console.warn("The D2 look didn\u2019t load", error);
    return null;
  });
  if (!d2) return;
  look = d2;
  ember.stop();
}
async function useInstall(check) {
  install = check;
  if (look === ember) {
    go({ name: "reading" });
    if (await api.prepare(check.dir)) await wearD2();
  }
  go({ name: "ready" });
}
async function pickFolder() {
  const check = await api.pickFolder();
  if (!check) return;
  if (check.ok) await useInstall(check);
  else {
    install = check;
    go({ name: "locate" });
  }
}
async function extract() {
  if (!install?.ok) return;
  go({ name: "extracting", steps: [], started: Date.now(), since: /* @__PURE__ */ new Map() });
  try {
    await api.extract(install.dir);
  } catch (error) {
    go({ name: "failed", error: { message: String(error) } });
  }
}
async function copyDetails(error) {
  const text = failureDetails(error, { version: state.version, platform: state.platform, install: install?.dir });
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  if (phase.name === "failed" && phase.error === error) go({ ...phase, copied: true });
}
api.onProgress((progress) => {
  if (progress.type === "progress" && phase.name === "extracting") {
    for (const step of progress.steps) if (step.state === "running" && !phase.since.has(step.name)) phase.since.set(step.name, Date.now());
    go({ ...phase, steps: progress.steps });
  } else if (progress.type === "done") go({ name: "done", seconds: progress.seconds });
  else if (progress.type === "cancelled") go({ name: "ready" });
  else if (progress.type === "error") {
    const { type: _, ...error } = progress;
    go({ name: "failed", error });
  }
});
setInterval(() => phase.name === "extracting" && render2(), 1e3);
function go(next) {
  phase = next;
  render2();
}
function render2() {
  look.show(page());
}
function page() {
  const back = state.canReturn ? [{ label: "Back to game", run: () => void api.play() }] : [];
  const reason = REASONS[state.reason] ? [REASONS[state.reason]] : [];
  switch (phase.name) {
    case "locate": {
      const wrong = install && !install.ok;
      return {
        heading: wrong ? "That folder won\u2019t do" : "Where is Diablo II?",
        lines: wrong ? [{ text: install.dir, tone: "path" }, { text: install.message ?? "It isn\u2019t a Diablo II install.", tone: "problem" }] : [{ text: INTRO }, ...reason, { text: "Point D2 Survivors at the folder that holds Diablo II\u2019s .mpq files, or Diablo II: Resurrected\u2019s.", tone: "dim" }],
        actions: [{ label: "Locate Diablo II\u2026", run: () => void pickFolder() }, ...back]
      };
    }
    case "reading":
      return {
        heading: "Reading Diablo II\u2026",
        lines: [{ text: install?.dir ?? "", tone: "path" }],
        progress: { fraction: "busy", caption: "A few seconds" },
        actions: []
      };
    case "ready": {
      const lines = [{ text: install?.dir ?? "", tone: "path" }, ...reason, ...state.reason === "first" ? [{ text: INTRO }] : []];
      if (install?.kind === "d2r") lines.push({ text: RESURRECTED, tone: "dim" });
      if (install?.warning) lines.push({ text: install.warning, tone: "warning" });
      return {
        heading: state.reason === "reextract" ? "Extract the game files again" : install?.kind === "d2r" ? "Diablo II: Resurrected found" : "Diablo II found",
        lines,
        actions: [
          { label: "Extract", run: () => void extract() },
          { label: "Change folder", run: () => void pickFolder() },
          ...back
        ]
      };
    }
    case "extracting": {
      const { steps, since } = phase;
      const now = Date.now();
      const fraction = progressFraction(steps, (name) => (now - (since.get(name) ?? now)) / 1e3);
      const running = runningCaption(steps) || "Opening the archives";
      const finished = steps.filter((step) => step.state === "done").length;
      const count = steps.length ? `  \xB7  ${finished} of ${steps.length}` : "";
      if (phase.update) {
        return {
          heading: "Updating game files\u2026",
          lines: [{ text: "This version reads some of your game files differently, so those are copied again. The game starts once they\u2019re in place.", tone: "dim" }],
          progress: { fraction, caption: `${steps.length ? running : "Getting ready"}${count}  \xB7  ${minutes((now - phase.started) / 1e3)}` },
          actions: []
        };
      }
      return {
        heading: "Extracting",
        lines: [{ text: "Copying your game files. This takes a minute or so, once.", tone: "dim" }],
        progress: { fraction, caption: `${running}${count}  \xB7  ${minutes((now - phase.started) / 1e3)}` },
        actions: [{ label: "Cancel", run: () => void api.cancel() }]
      };
    }
    case "done":
      return {
        heading: "Ready",
        lines: [{ text: "Your game files are in place, and stay on this computer.", tone: "dim" }],
        progress: { fraction: 1, caption: `Done in ${minutes(phase.seconds)}` },
        actions: [{ label: "Play", run: () => void api.play() }]
      };
    case "failed": {
      const { error, copied } = phase;
      return {
        heading: "The extraction stopped",
        lines: failureLines(error),
        actions: [
          { label: "Try again", run: () => void extract() },
          { label: "Change folder", run: () => void pickFolder() },
          { label: copied ? "Copied" : "Copy details", run: () => void copyDetails(error) },
          ...back
        ]
      };
    }
  }
}
function minutes(seconds) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
void start();
