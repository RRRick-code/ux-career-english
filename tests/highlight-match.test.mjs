import assert from "node:assert/strict";
import test from "node:test";

import {
  buildHighlightCandidates,
  findHighlightMatch,
  hasHighlightMatch,
} from "../shared/highlight-match.js";

function getMatchedText(text, primary, overrides = []) {
  const match = findHighlightMatch(
    text,
    buildHighlightCandidates(primary, overrides),
  );

  if (!match) {
    return null;
  }

  return text.slice(match.index, match.index + match.length);
}

test("matches exact text", () => {
  const text =
    "In cross-functional teams, I often lead through influence rather than formal authority.";

  assert.equal(
    getMatchedText(text, "lead through influence"),
    "lead through influence",
  );
});

test("matches across punctuation and hyphen normalization", () => {
  const text =
    "Over time, working at platform-scale taught me to think in systems instead of single screens.";

  assert.equal(getMatchedText(text, "platform scale"), "platform-scale");
});

test("matches regular and irregular inflected forms", async (t) => {
  await t.test("regular inflection", () => {
    const text =
      "A strong interaction should make the next step obvious before the user has to stop and think.";

    assert.equal(
      getMatchedText(text, "make the next step obvious"),
      "make the next step obvious",
    );
  });

  await t.test("regular stem change with -ed", () => {
    const text =
      "We designed for edge cases because failure paths mattered just as much as the happy path.";

    assert.equal(
      getMatchedText(text, "design for edge cases"),
      "designed for edge cases",
    );
  });

  await t.test("irregular inflection", () => {
    const text =
      "The interaction felt safer once we made feedback timely and clear at every important step.";

    assert.equal(
      getMatchedText(text, "make feedback timely and clear"),
      "made feedback timely and clear",
    );
  });
});

test("preserves phrase token order", () => {
  const text =
    "A strong interaction should make the obvious next step feel easy before the user pauses.";

  assert.equal(getMatchedText(text, "make the next step obvious"), null);
});

test("supports manual override candidates", () => {
  const text =
    "A big part of senior leadership is coaching a designer through ambiguity instead of solving everything for them.";

  assert.equal(
    getMatchedText(text, "coach designers through ambiguity", [
      "coaching a designer through ambiguity",
    ]),
    "coaching a designer through ambiguity",
  );
});

test("rejects negative cases that only share partial meaning", () => {
  const text =
    "A strong interaction should clarify the next move before the user has to stop and think.";

  assert.equal(
    hasHighlightMatch(text, buildHighlightCandidates("make the next step obvious")),
    false,
  );
});
