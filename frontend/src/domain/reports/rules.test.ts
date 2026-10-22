import { describe, expect, it } from "vite-plus/test";
import {
    isWithinLodz,
    nearbyReports,
    primaryReport,
    reportSupport,
    requiresUpdateComment,
    validateUpdate,
} from "./rules";
import { reportCommentLimits, statuses, type ReportUpdate } from "./model";
import { createSeed } from "@/infrastructure/mock/seed";

describe("Łódź reporting rules", () => {
    it("applies the same comment requirement and limits to every report update", () => {
        const report = createSeed().reports[0]!;
        for (const status of Object.keys(statuses) as (keyof typeof statuses)[]) {
            expect(requiresUpdateComment(status)).toBe(
                status === "rejected" || status === "duplicate",
            );
        }
        const update: ReportUpdate = {
            status: "rejected",
            priority: "normal",
            comment: "a".repeat(reportCommentLimits.min),
            duplicateOf: null,
        };
        expect(() => validateUpdate(report, update, [report])).not.toThrow();
        expect(() => validateUpdate(report, { ...update, comment: "    a    " }, [report])).toThrow(
            /uzasadnienie/,
        );
        expect(() =>
            validateUpdate(report, { ...update, comment: "a".repeat(reportCommentLimits.max) }, [
                report,
            ]),
        ).not.toThrow();
        expect(() =>
            validateUpdate(
                report,
                { ...update, comment: "a".repeat(reportCommentLimits.max + 1) },
                [report],
            ),
        ).toThrow(/maksymalnie/);
        expect(() =>
            validateUpdate(report, { ...update, status: "progress", comment: "" }, [report]),
        ).not.toThrow();
    });
    it("accepts the city center and boundary, rejects other cities and invalid coordinates", () => {
        expect(isWithinLodz({ longitude: 19.457, latitude: 51.759 })).toBe(true);
        expect(isWithinLodz({ longitude: 19.3373, latitude: 51.7841 })).toBe(true);
        expect(isWithinLodz({ longitude: 21.012, latitude: 52.23 })).toBe(false);
        expect(isWithinLodz({ longitude: NaN, latitude: 51.7 })).toBe(false);
    });
    it("suggests only active reports of the same category within 100m", () => {
        const reports = createSeed().reports;
        const report = reports[0]!;
        expect(nearbyReports(reports, report.category, report.location)[0]?.report.id).toBe(
            report.id,
        );
        expect(nearbyReports(reports, "lighting", report.location)).toHaveLength(0);
        expect(
            nearbyReports([{ ...report, status: "resolved" }], report.category, report.location),
        ).toHaveLength(0);
        expect(
            nearbyReports([report], report.category, {
                ...report.location,
                latitude: report.location.latitude + 0.0008,
            }),
        ).toHaveLength(1);
        expect(
            nearbyReports([report], report.category, {
                ...report.location,
                latitude: report.location.latitude + 0.001,
            }),
        ).toHaveLength(0);
    });
    it("rejects duplicate cycles and missing rejection reasons", () => {
        const [first, second] = createSeed().reports;
        if (!first || !second) throw new Error("Missing fixtures");
        const update = {
            status: "duplicate" as const,
            priority: "normal" as const,
            comment: "Ten sam problem",
            duplicateOf: first.id,
        };
        expect(() => validateUpdate(first, update, [first, second])).toThrow();
        expect(() =>
            validateUpdate(first, { ...update, duplicateOf: second.id }, [
                first,
                { ...second, duplicateOf: first.id },
            ]),
        ).toThrow(/cykl/);
        expect(() =>
            validateUpdate(first, { ...update, status: "rejected", comment: "" }, [first]),
        ).toThrow(/uzasadnienie/);
    });

    it("counts unique people across linked chains and retains original contributions when unlinked", () => {
        const fixture = createSeed().reports[1]!;
        const first = { ...fixture, id: "FIRST", authorId: "alice", confirmations: ["bob"] };
        const second = {
            ...fixture,
            id: "SECOND",
            authorId: "bob",
            confirmations: ["carol"],
            status: "duplicate" as const,
            duplicateOf: first.id,
        };
        const third = { ...second, id: "THIRD", authorId: "alice", duplicateOf: second.id };
        const reports = [first, second, third];
        expect(primaryReport(third, reports).id).toBe(first.id);
        expect(reportSupport(first, reports).count).toBe(3);
        expect(reportSupport(third, reports).count).toBe(3);
        const unlinked = reports.map((report) =>
            report.id === second.id
                ? { ...report, status: "new" as const, duplicateOf: null }
                : report,
        );
        expect(reportSupport(first, unlinked).count).toBe(2);
        expect(reportSupport(third, unlinked).count).toBe(3);
        expect(() =>
            validateUpdate(
                first,
                {
                    status: "duplicate",
                    priority: "normal",
                    comment: "Ten sam problem",
                    duplicateOf: "CLOSED",
                },
                [first, { ...fixture, id: "CLOSED", status: "resolved" }],
            ),
        ).toThrow(/aktywną/);
    });
});
