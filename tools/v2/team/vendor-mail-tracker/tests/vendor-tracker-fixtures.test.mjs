/**
 * vendor-tracker-fixtures.test.mjs
 *
 * Validates the sample-vendor-threads.json fixture against the
 * Vendor Mail Tracker data contract defined in specs.md.
 *
 * Run from the repository root:
 *   node --test tools/v2/team/vendor-mail-tracker/tests/vendor-tracker-fixtures.test.mjs
 *
 * Uses Node's built-in test runner — no additional dependencies required.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  currentDir,
  "..",
  "fixtures",
  "sample-vendor-threads.json",
);

const ALLOWED_STATUSES = new Set(["new", "active", "awaiting-reply", "resolved", "archived"]);
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const REQUIRED_STATUSES = ["new", "active", "awaiting-reply", "resolved", "archived"];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

async function loadFixture() {
  const raw = await readFile(fixturePath, "utf8");
  return JSON.parse(raw);
}

// ── Fixture contract ──────────────────────────────────────────────────────────

test("fixture has the correct tool identifier and version", async () => {
  const fixture = await loadFixture();
  assert.equal(fixture.tool, "vendor-mail-tracker");
  assert.equal(fixture.version, 1);
});

test("fixture contains parallel threads and expectedCards arrays", async () => {
  const fixture = await loadFixture();
  assert.ok(Array.isArray(fixture.threads), "threads must be an array");
  assert.ok(Array.isArray(fixture.expectedCards), "expectedCards must be an array");
  assert.equal(
    fixture.threads.length,
    fixture.expectedCards.length,
    "threads and expectedCards must have the same length",
  );
});

// ── Thread contract ───────────────────────────────────────────────────────────

test("every thread satisfies the VendorThread contract", async () => {
  const fixture = await loadFixture();
  const seenStatuses = new Set();

  for (const thread of fixture.threads) {
    // Required string fields
    assert.ok(thread.id, `thread ${thread.id} needs a stable id`);
    assert.ok(thread.vendor?.length > 0, `${thread.id} needs a vendor name`);
    assert.ok(
      thread.vendorAddress?.includes("@"),
      `${thread.id} needs a valid vendorAddress`,
    );
    assert.ok(thread.subject?.length > 0, `${thread.id} needs a subject`);

    // Datetime fields
    assert.match(
      thread.lastMessageAt,
      ISO_DATE_RE,
      `${thread.id} lastMessageAt must be ISO 8601 UTC`,
    );

    // Enums
    assert.ok(
      ALLOWED_STATUSES.has(thread.status),
      `${thread.id} has invalid status: "${thread.status}"`,
    );
    assert.ok(
      ALLOWED_PRIORITIES.has(thread.priority),
      `${thread.id} has invalid priority: "${thread.priority}"`,
    );

    // Owner — non-empty string
    assert.ok(thread.owner?.length > 0, `${thread.id} needs an owner or "unassigned"`);

    // Booleans
    assert.equal(typeof thread.flagged, "boolean", `${thread.id} flagged must be boolean`);
    assert.equal(
      typeof thread.reviewRequired,
      "boolean",
      `${thread.id} reviewRequired must be boolean`,
    );

    // replyDueAt — null or ISO date string
    if (thread.replyDueAt !== null) {
      assert.ok(
        typeof thread.replyDueAt === "string",
        `${thread.id} replyDueAt must be null or a string`,
      );
    }

    // Notes array
    assert.ok(Array.isArray(thread.notes), `${thread.id} notes must be an array`);
    for (const note of thread.notes) {
      assert.ok(note.id, `note in ${thread.id} needs an id`);
      assert.ok(note.author?.length > 0, `note in ${thread.id} needs an author`);
      assert.ok(note.body?.length > 0, `note in ${thread.id} needs a body`);
      assert.match(
        note.createdAt,
        ISO_DATE_RE,
        `note in ${thread.id} createdAt must be ISO 8601 UTC`,
      );
    }

    seenStatuses.add(thread.status);
  }

  // All 5 statuses must be represented
  for (const status of REQUIRED_STATUSES) {
    assert.ok(
      seenStatuses.has(status),
      `fixture must include at least one thread with status "${status}"`,
    );
  }
});

// ── Business rules ────────────────────────────────────────────────────────────

test("flagged threads must have reviewRequired: true", async () => {
  const fixture = await loadFixture();
  for (const thread of fixture.threads) {
    if (thread.flagged) {
      assert.equal(
        thread.reviewRequired,
        true,
        `flagged thread ${thread.id} must have reviewRequired: true`,
      );
    }
  }
});

test("unassigned threads must have reviewRequired: true", async () => {
  const fixture = await loadFixture();
  for (const thread of fixture.threads) {
    if (thread.owner === "unassigned") {
      assert.equal(
        thread.reviewRequired,
        true,
        `unassigned thread ${thread.id} must have reviewRequired: true`,
      );
    }
  }
});

// ── Expected cards contract ───────────────────────────────────────────────────

test("expectedCards match their source threads", async () => {
  const fixture = await loadFixture();
  const threadMap = new Map(fixture.threads.map((t) => [t.id, t]));

  for (const card of fixture.expectedCards) {
    assert.ok(card.id, "expectedCard needs an id");
    const source = threadMap.get(card.id);
    assert.ok(source, `expectedCard ${card.id} must correspond to a thread`);

    assert.equal(
      card.status,
      source.status,
      `expectedCard ${card.id} status must match thread`,
    );
    assert.equal(
      card.priority,
      source.priority,
      `expectedCard ${card.id} priority must match thread`,
    );
    assert.equal(
      card.owner,
      source.owner,
      `expectedCard ${card.id} owner must match thread`,
    );
    assert.equal(
      card.flagged,
      source.flagged,
      `expectedCard ${card.id} flagged must match thread`,
    );
    assert.equal(
      card.reviewRequired,
      source.reviewRequired,
      `expectedCard ${card.id} reviewRequired must match thread`,
    );
  }
});

// ── Review notes ──────────────────────────────────────────────────────────────

test("fixture includes reviewNotes", async () => {
  const fixture = await loadFixture();
  assert.ok(Array.isArray(fixture.reviewNotes), "reviewNotes must be an array");
  assert.ok(fixture.reviewNotes.length > 0, "reviewNotes must not be empty");
  for (const note of fixture.reviewNotes) {
    assert.ok(typeof note === "string" && note.length > 0, "each reviewNote must be a non-empty string");
  }
});
