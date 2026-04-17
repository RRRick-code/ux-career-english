import assert from "node:assert/strict";
import test from "node:test";
import { applyFeedback, removeLearningRecords } from "../src/lib/storage.ts";
import { buildStudyRound } from "../src/lib/study.ts";

test("storage: applyFeedback propagates starred status", () => {
  const record = { progress: 0, status: "not_started", starred: true };
  const next = applyFeedback(record, "easy");
  assert.equal(next.progress, 20);
  assert.equal(next.status, "in_progress");
  assert.equal(next.starred, true);

  const nextWithoutStar = applyFeedback(
    { progress: 80, status: "in_progress" },
    "easy",
  );
  assert.equal(nextWithoutStar.progress, 100);
  assert.equal(nextWithoutStar.status, "mastered");
  assert.equal(nextWithoutStar.starred, undefined);
});

test("storage: removeLearningRecords preserves starred items but resets progress", () => {
  const records = {
    "module.001": { progress: 100, status: "mastered" },
    "module.002": {
      progress: 50,
      status: "in_progress",
      starred: true,
    },
    "module.003": {
      progress: 0,
      status: "not_started",
      starred: true,
    },
  };

  const { records: nextRecords, removed } = removeLearningRecords(records, [
    "module.001",
    "module.002",
    "module.003",
  ]);

  assert.equal(removed, true);
  assert.equal(nextRecords["module.001"], undefined);

  // module.002 was starred, so it should be preserved but reset
  assert.equal(nextRecords["module.002"]?.progress, 0);
  assert.equal(nextRecords["module.002"]?.status, "not_started");
  assert.equal(nextRecords["module.002"]?.starred, true);

  // module.003 was starred, it resets (even if already 0)
  assert.equal(nextRecords["module.003"]?.progress, 0);
  assert.equal(nextRecords["module.003"]?.status, "not_started");
  assert.equal(nextRecords["module.003"]?.starred, true);
});

test("study: buildStudyRound with 'starred' mode only includes starred items", () => {
  const allItems = [
    {
      id: "term.001",
      kind: "term",
      english: "Test 1",
      chinese: "测试 1",
      scene: "general",
      module: "test",
      intent: "test",
    },
    {
      id: "term.002",
      kind: "term",
      english: "Test 2",
      chinese: "测试 2",
      scene: "general",
      module: "test",
      intent: "test",
    },
    {
      id: "term.003",
      kind: "term",
      english: "Test 3",
      chinese: "测试 3",
      scene: "general",
      module: "test",
      intent: "test",
    },
  ];

  const records = {
    "term.001": { progress: 0, status: "not_started", starred: true },
    "term.002": { progress: 50, status: "in_progress" }, // Not starred
    "term.003": { progress: 100, status: "mastered", starred: true },
  };

  const round = buildStudyRound(allItems, records, "starred", "term_phrase");

  assert.equal(round.candidates.length, 2);
  const ids = round.candidates.map((i) => i.id);
  assert.ok(ids.includes("term.001"));
  assert.ok(!ids.includes("term.002"));
  assert.ok(ids.includes("term.003"));
});
