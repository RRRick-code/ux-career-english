const WORD_RE = /[A-Za-z0-9]+/g;
const WHITESPACE_RE = /\s+/g;

const IRREGULAR_FORMS = {
  be: ["am", "are", "is", "was", "were", "been", "being"],
  bring: ["brings", "brought", "bringing"],
  build: ["builds", "built", "building"],
  choose: ["chooses", "chose", "chosen", "choosing"],
  come: ["comes", "came", "coming"],
  do: ["does", "did", "done", "doing"],
  feel: ["feels", "felt", "feeling"],
  find: ["finds", "found", "finding"],
  get: ["gets", "got", "gotten", "getting"],
  give: ["gives", "gave", "given", "giving"],
  go: ["goes", "went", "gone", "going"],
  have: ["has", "had", "having"],
  hold: ["holds", "held", "holding"],
  know: ["knows", "knew", "known", "knowing"],
  lead: ["leads", "led", "leading"],
  make: ["makes", "made", "making"],
  mean: ["means", "meant", "meaning"],
  read: ["reads", "reading"],
  run: ["runs", "ran", "running"],
  say: ["says", "said", "saying"],
  see: ["sees", "saw", "seen", "seeing"],
  set: ["sets", "setting"],
  take: ["takes", "took", "taken", "taking"],
  tell: ["tells", "told", "telling"],
  think: ["thinks", "thought", "thinking"],
  write: ["writes", "wrote", "written", "writing"],
};

export function buildHighlightCandidates(primary, overrides = []) {
  const candidates = [];

  appendCandidate(candidates, primary);

  if (Array.isArray(overrides)) {
    for (const override of overrides) {
      appendCandidate(candidates, override);
    }
  }

  return candidates;
}

export function findHighlightMatch(text, candidates) {
  const textTokens = tokenize(text);
  if (textTokens.length === 0) {
    return null;
  }

  for (const candidate of candidates) {
    const needleTokens = tokenize(candidate);
    if (needleTokens.length === 0) {
      continue;
    }

    const match = findTokenSequenceMatch(textTokens, needleTokens);
    if (match) {
      return match;
    }
  }

  return null;
}

export function hasHighlightMatch(text, candidates) {
  return findHighlightMatch(text, candidates) !== null;
}

function appendCandidate(candidates, value) {
  if (typeof value !== "string") {
    return;
  }

  const normalized = value.trim();
  if (!normalized) {
    return;
  }

  if (!candidates.includes(normalized)) {
    candidates.push(normalized);
  }
}

function tokenize(value) {
  if (typeof value !== "string" || value.length === 0) {
    return [];
  }

  const tokens = [];
  for (const match of value.matchAll(WORD_RE)) {
    if (match.index == null) {
      continue;
    }

    tokens.push({
      value: match[0].toLowerCase(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}

function findTokenSequenceMatch(textTokens, needleTokens) {
  const candidateForms = needleTokens.map((token) => createTokenForms(token.value));
  const limit = textTokens.length - needleTokens.length;

  for (let start = 0; start <= limit; start += 1) {
    let matched = true;

    for (let offset = 0; offset < needleTokens.length; offset += 1) {
      const hayToken = textTokens[start + offset].value;
      if (!candidateForms[offset].has(hayToken)) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return {
        index: textTokens[start].start,
        length:
          textTokens[start + needleTokens.length - 1].end - textTokens[start].start,
      };
    }
  }

  return null;
}

function createTokenForms(token) {
  const forms = new Set([token]);

  if (!/[a-z]/.test(token) || token.length <= 1) {
    return forms;
  }

  const irregular = IRREGULAR_FORMS[token];
  if (irregular) {
    for (const form of irregular) {
      forms.add(form);
    }
    return forms;
  }

  if (isConsonantY(token)) {
    const stem = token.slice(0, -1);
    forms.add(`${stem}ies`);
    forms.add(`${stem}ied`);
    forms.add(`${token}ing`);
    return forms;
  }

  if (token.endsWith("e")) {
    const stem = token.slice(0, -1);
    forms.add(`${token}s`);
    forms.add(`${token}d`);
    forms.add(`${stem}ing`);
    return forms;
  }

  if (isCvcToken(token)) {
    const doubled = `${token}${token.at(-1)}`;
    forms.add(`${token}s`);
    forms.add(`${doubled}ed`);
    forms.add(`${doubled}ing`);
    return forms;
  }

  forms.add(`${token}s`);
  forms.add(`${token}es`);
  forms.add(`${token}ed`);
  forms.add(`${token}ing`);

  return forms;
}

function isConsonantY(token) {
  if (!token.endsWith("y") || token.length < 2) {
    return false;
  }

  const beforeY = token.at(-2);
  return Boolean(beforeY) && isConsonant(beforeY);
}

function isCvcToken(token) {
  if (token.length < 3) {
    return false;
  }

  const last = token.at(-1);
  const middle = token.at(-2);
  const first = token.at(-3);

  if (!last || !middle || !first) {
    return false;
  }

  return (
    isConsonant(first) &&
    isVowel(middle) &&
    isConsonant(last) &&
    !["w", "x", "y"].includes(last)
  );
}

function isConsonant(char) {
  return /[bcdfghjklmnpqrstvwxyz]/.test(char);
}

function isVowel(char) {
  return /[aeiou]/.test(char);
}
