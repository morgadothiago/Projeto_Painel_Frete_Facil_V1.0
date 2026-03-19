import { describe, it, expect } from "vitest";
import { tenantConfig, TenantConfig } from "@/config/tenant";

describe("tenantConfig", () => {
  it("should have required properties", () => {
    expect(tenantConfig.name).toBeDefined();
    expect(tenantConfig.shortName).toBeDefined();
    expect(tenantConfig.logoUrl).toBeDefined();
    expect(tenantConfig.faviconUrl).toBeDefined();
    expect(tenantConfig.supportEmail).toBeDefined();
    expect(tenantConfig.theme).toBeDefined();
  });

  it("should have theme with required color properties", () => {
    const { theme } = tenantConfig;
    
    expect(theme.primary).toBeDefined();
    expect(theme.primaryDark).toBeDefined();
    expect(theme.primaryLight).toBeDefined();
    expect(theme.secondary).toBeDefined();
    expect(theme.background).toBeDefined();
    expect(theme.surface).toBeDefined();
    expect(theme.textPrimary).toBeDefined();
    expect(theme.textSecondary).toBeDefined();
    expect(theme.textInverse).toBeDefined();
    expect(theme.success).toBeDefined();
    expect(theme.error).toBeDefined();
    expect(theme.warning).toBeDefined();
    expect(theme.border).toBeDefined();
  });

  it("should have theme with radius properties", () => {
    const { theme } = tenantConfig;
    
    expect(theme.radiusSm).toBeDefined();
    expect(theme.radiusMd).toBeDefined();
    expect(theme.radiusLg).toBeDefined();
    expect(theme.radiusXl).toBeDefined();
  });

  it("should have theme with shadow properties", () => {
    const { theme } = tenantConfig;
    
    expect(theme.shadowSm).toBeDefined();
    expect(theme.shadowMd).toBeDefined();
    expect(theme.shadowLg).toBeDefined();
  });

  it("should have theme with gradient properties", () => {
    const { theme } = tenantConfig;
    
    expect(theme.gradientPrimary).toBeDefined();
    expect(theme.gradientBackground).toBeDefined();
  });

  it("should have valid color hex format for primary colors", () => {
    const { theme } = tenantConfig;
    
    expect(theme.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.primaryDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.primaryLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("should use default brand name when env not set", () => {
    expect(tenantConfig.name).toBe("FreteFácil");
    expect(tenantConfig.shortName).toBe("FF");
  });

  it("should have default support email", () => {
    expect(tenantConfig.supportEmail).toBe("suporte@fretefacil.com");
  });
});
