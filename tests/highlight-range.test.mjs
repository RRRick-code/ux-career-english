import assert from "node:assert/strict";
import test from "node:test";
import {
  addHighlightRange,
  isMeaningfulLearningRecord,
  isRangeHighlighted,
  normalizeHighlightRanges,
  normalizeLearningRecord,
  removeHighlightRange,
} from "../src/lib/storage.ts";

test("normalizeHighlightRanges drops invalid entries", () => {
  const result = normalizeHighlightRanges([
    { start: 0, end: 4 },
    { start: 5, end: 5 }, // zero-length
    { start: -1, end: 3 }, // negative
    { start: 2, end: 1 }, // inverted
    { start: 1.5, end: 4 }, // non-integer
    "nope",
    null,
  ]);

  assert.deepEqual(result, [{ start: 0, end: 4 }]);
});

test("normalizeHighlightRanges sorts and merges overlapping/touching ranges", () => {
  const result = normalizeHighlightRanges([
    { start: 10, end: 14 },
    { start: 0, end: 4 },
    { start: 4, end: 6 }, // touches previous -> merge into 0..6
    { start: 5, end: 8 }, // overlaps -> 0..8
  ]);

  assert.deepEqual(result, [
    { start: 0, end: 8 },
    { start: 10, end: 14 },
  ]);
});

test("addHighlightRange merges with existing ranges", () => {
  const ranges = [{ start: 0, end: 4 }];
  assert.deepEqual(addHighlightRange(ranges, { start: 6, end: 9 }), [
    { start: 0, end: 4 },
    { start: 6, end: 9 },
  ]);
  assert.deepEqual(addHighlightRange(ranges, { start: 3, end: 7 }), [
    { start: 0, end: 7 },
  ]);
});

test("removeHighlightRange splits a containing range", () => {
  const ranges = [{ start: 0, end: 10 }];
  assert.deepEqual(removeHighlightRange(ranges, { start: 3, end: 6 }), [
    { start: 0, end: 3 },
    { start: 6, end: 10 },
  ]);
});

test("removeHighlightRange trims edges and drops fully covered ranges", () => {
  const ranges = [
    { start: 0, end: 5 },
    { start: 8, end: 12 },
  ];
  // Remove 3..10 -> leaves 0..3 and 10..12
  assert.deepEqual(removeHighlightRange(ranges, { start: 3, end: 10 }), [
    { start: 0, end: 3 },
    { start: 10, end: 12 },
  ]);
  // Fully cover both -> empty
  assert.deepEqual(removeHighlightRange(ranges, { start: 0, end: 12 }), []);
});

test("removeHighlightRange leaves non-overlapping ranges untouched", () => {
  const ranges = [{ start: 0, end: 4 }];
  assert.deepEqual(removeHighlightRange(ranges, { start: 5, end: 9 }), [
    { start: 0, end: 4 },
  ]);
});

test("isRangeHighlighted detects full coverage only", () => {
  const ranges = [{ start: 0, end: 10 }];
  assert.equal(isRangeHighlighted(ranges, { start: 2, end: 6 }), true);
  assert.equal(isRangeHighlighted(ranges, { start: 0, end: 10 }), true);
  assert.equal(isRangeHighlighted(ranges, { start: 8, end: 12 }), false);
  assert.equal(isRangeHighlighted([], { start: 0, end: 1 }), false);
});

test("normalizeLearningRecord cleans and attaches manualHighlights", () => {
  const record = normalizeLearningRecord({
    progress: 40,
    status: "in_progress",
    manualHighlights: [
      { start: 4, end: 6 },
      { start: 0, end: 4 },
      { start: 9, end: 9 }, // invalid, dropped
    ],
  });

  assert.deepEqual(record, {
    progress: 40,
    status: "in_progress",
    manualHighlights: [{ start: 0, end: 6 }],
  });
});

test("normalizeLearningRecord omits manualHighlights when none are valid", () => {
  const record = normalizeLearningRecord({
    progress: 0,
    status: "not_started",
    manualHighlights: [],
  });

  assert.deepEqual(record, { progress: 0, status: "not_started" });
  assert.equal("manualHighlights" in record, false);
});

test("isMeaningfulLearningRecord treats manual highlights as meaningful", () => {
  assert.equal(
    isMeaningfulLearningRecord({
      progress: 0,
      status: "not_started",
      manualHighlights: [{ start: 0, end: 4 }],
    }),
    true,
  );
  assert.equal(
    isMeaningfulLearningRecord({
      progress: 0,
      status: "not_started",
      manualHighlights: [],
    }),
    false,
  );
});
