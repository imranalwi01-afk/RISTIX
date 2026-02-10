import { expect, test, describe } from "bun:test";
import { ProductParamSchema, ProductModeSchema } from "../../routes/product-parameters.routes";

describe("Product Parameters Schemas", () => {
    test("ProductModeSchema accepts valid modes", () => {
        expect(ProductModeSchema.parse("conventional")).toBe("conventional");
        expect(ProductModeSchema.parse("sharia")).toBe("sharia");
    });

    test("ProductModeSchema rejects invalid modes", () => {
        expect(() => ProductModeSchema.parse("invalid")).toThrow();
    });

    test("ProductParamSchema accepts valid payload with mode", () => {
        const payload = {
            mode: "conventional",
            dataSource: "CORE",
            prdGroup: "LOAN",
            prdType: "CONSUMER",
            prdCode: "TEST001",
            prdDesc: "Test Product",
            currency: "IDR",
            activeFlag: true
        };
        const parsed = ProductParamSchema.parse(payload);
        expect(parsed.mode).toBe("conventional");
        expect(parsed.prdCode).toBe("TEST001");
    });

    test("ProductParamSchema can have optional properties", () => {
        const payload = {
            dataSource: "CORE",
            prdGroup: "LOAN",
            prdType: "CONSUMER",
            prdCode: "TEST001",
            prdDesc: "Test Product",
            currency: "IDR",
            amortizationType: "EIR",
            expectedLife: 120
        };
        const parsed = ProductParamSchema.parse(payload);
        expect(parsed.amortizationType).toBe("EIR");
        expect(parsed.expectedLife).toBe(120);
    });
});
