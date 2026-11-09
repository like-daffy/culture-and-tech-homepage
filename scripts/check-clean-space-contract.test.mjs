// The pinned contract copy's check (scripts/check-clean-space-contract.mjs): the committed copy passes, and any edit of
// its body, header or version is caught.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkContractCopy, CONTRACT_COPY } from "./check-clean-space-contract.mjs";

const copy = readFileSync(CONTRACT_COPY, "utf8");

describe("the pinned contract copy", () => {
  it("is an unedited export", () => {
    expect(checkContractCopy(copy)).toMatchObject({ ok: true, version: 1 });
  });

  it("catches an edited price", () => {
    const edited = copy.replace("amountMinor: 3300", "amountMinor: 3000");
    expect(edited).not.toBe(copy);
    expect(checkContractCopy(edited)).toMatchObject({ ok: false });
  });

  it("catches an edited header and a version that isn't the body's", () => {
    expect(checkContractCopy(copy.replace("// GENERATED FILE", "// generated file"))).toMatchObject({ ok: false });
    const lines = copy.split("\n");
    lines[2] = "// contract-version: 2";
    expect(checkContractCopy(lines.join("\n"))).toMatchObject({ ok: false });
    expect(checkContractCopy("")).toMatchObject({ ok: false });
  });
});
