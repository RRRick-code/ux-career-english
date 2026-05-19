import assert from "node:assert/strict";
import test from "node:test";
import { countStarred } from "../src/lib/learning.ts";
import {
  applyFeedback,
  buildLearningRecordsExport,
  isMeaningfulLearningRecord,
  parseLearningRecordsImport,
  removeLearningRecords,
} from "../src/lib/storage.ts";
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

test("learning: countStarred counts starred items in the given item set", () => {
  const items = [
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
    "term.002": { progress: 50, status: "in_progress" },
    "term.999": { progress: 0, status: "not_started", starred: true },
  };

  assert.equal(countStarred(items, records), 1);
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

test("study: buildStudyRound with starred random includes all starred items", () => {
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

  const round = buildStudyRound(
    allItems,
    records,
    "term_phrase",
    "starred",
    "random",
  );

  assert.equal(round.candidates.length, 2);
  const ids = round.candidates.map((i) => i.id);
  assert.ok(ids.includes("term.001"));
  assert.ok(!ids.includes("term.002"));
  assert.ok(ids.includes("term.003"));
});

test("study: buildStudyRound with starred reinforcement excludes mastered items", () => {
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
    "term.002": {
      progress: 50,
      status: "in_progress",
      starred: true,
    },
    "term.003": { progress: 100, status: "mastered", starred: true },
  };

  const round = buildStudyRound(
    allItems,
    records,
    "term_phrase",
    "starred",
    "reinforcement",
  );

  assert.equal(round.candidates.length, 2);
  const ids = round.candidates.map((i) => i.id);
  assert.ok(ids.includes("term.001"));
  assert.ok(ids.includes("term.002"));
  assert.ok(!ids.includes("term.003"));
});

test("storage: buildLearningRecordsExport creates the formal backup format", () => {
  const exported = buildLearningRecordsExport(
    {
      "term.001": { progress: 60, status: "in_progress", starred: true },
    },
    new Date("2026-05-19T18:30:00.000Z"),
  );

  assert.equal(exported.app, "ux-english2");
  assert.equal(exported.type, "learning-records");
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.exportedAt, "2026-05-19T18:30:00.000Z");
  assert.deepEqual(exported.records, {
    "term.001": { progress: 60, status: "in_progress", starred: true },
  });
});

test("storage: buildLearningRecordsExport omits empty default records", () => {
  const exported = buildLearningRecordsExport(
    {
      "term.001": { progress: 0, status: "not_started" },
      "term.002": { progress: 0, status: "not_started", starred: false },
      "term.003": { progress: 0, status: "not_started", starred: true },
      "term.004": { progress: 20, status: "in_progress" },
    },
    new Date("2026-05-19T18:30:00.000Z"),
  );

  assert.deepEqual(exported.records, {
    "term.003": { progress: 0, status: "not_started", starred: true },
    "term.004": { progress: 20, status: "in_progress" },
  });
});

test("storage: isMeaningfulLearningRecord matches exportable learning records", () => {
  assert.equal(
    isMeaningfulLearningRecord({ progress: 0, status: "not_started" }),
    false,
  );
  assert.equal(
    isMeaningfulLearningRecord({
      progress: 0,
      status: "not_started",
      starred: false,
    }),
    false,
  );
  assert.equal(
    isMeaningfulLearningRecord({
      progress: 0,
      status: "not_started",
      starred: true,
    }),
    true,
  );
  assert.equal(
    isMeaningfulLearningRecord({ progress: 20, status: "in_progress" }),
    true,
  );
});

test("storage: parseLearningRecordsImport imports only formal backup files", () => {
  const raw = JSON.stringify({
    app: "ux-english2",
    type: "learning-records",
    schemaVersion: 1,
    exportedAt: "2026-05-19T18:30:00.000Z",
    records: {
      "term.001": { progress: 40, status: "in_progress" },
    },
  });

  const result = parseLearningRecordsImport(raw, ["term.001"]);

  assert.equal(result.importedCount, 1);
  assert.equal(result.ignoredCount, 0);
  assert.equal(result.totalCount, 1);
  assert.deepEqual(result.records, {
    "term.001": { progress: 40, status: "in_progress" },
  });

  assert.throws(
    () => parseLearningRecordsImport(JSON.stringify(result.records), [
      "term.001",
    ]),
    /Invalid learning records backup file/,
  );
});

test("storage: parseLearningRecordsImport rejects wrong type and schema", () => {
  const base = {
    app: "ux-english2",
    type: "learning-records",
    schemaVersion: 1,
    exportedAt: "2026-05-19T18:30:00.000Z",
    records: {},
  };

  assert.throws(
    () =>
      parseLearningRecordsImport(
        JSON.stringify({ ...base, type: "content-data" }),
        [],
      ),
    /Invalid learning records backup file/,
  );
  assert.throws(
    () =>
      parseLearningRecordsImport(
        JSON.stringify({ ...base, schemaVersion: 2 }),
        [],
      ),
    /Invalid learning records backup file/,
  );
});

test("storage: parseLearningRecordsImport filters invalid ids and normalizes records", () => {
  const raw = JSON.stringify({
    app: "ux-english2",
    type: "learning-records",
    schemaVersion: 1,
    exportedAt: "2026-05-19T18:30:00.000Z",
    records: {
      "term.001": { progress: 120, status: "mastered", starred: true },
      "term.002": { progress: -10, status: "unknown", starred: false },
      "term.999": { progress: 80, status: "in_progress" },
    },
  });

  const result = parseLearningRecordsImport(raw, ["term.001", "term.002"]);

  assert.equal(result.importedCount, 2);
  assert.equal(result.ignoredCount, 1);
  assert.deepEqual(result.records, {
    "term.001": { progress: 100, status: "mastered", starred: true },
    "term.002": { progress: 0, status: "not_started" },
  });
});

test("storage: parseLearningRecordsImport rejects invalid JSON", () => {
  assert.throws(
    () => parseLearningRecordsImport("{", []),
    /Invalid JSON file/,
  );
});
