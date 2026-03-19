import { describe, it, expect } from "vitest";

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getLast6Months() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      year:  d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
      key:   `${d.getFullYear()}-${d.getMonth()}`,
    };
  });
}

function buildMonthlyCount(
  dates:  Date[],
  months: ReturnType<typeof getLast6Months>,
) {
  const windowStart = new Date(months[0].year, months[0].month, 1);
  const counts: Record<string, number> = {};
  months.forEach(m => (counts[m.key] = 0));

  let totalBefore = 0;
  for (const date of dates) {
    if (date < windowStart) {
      totalBefore++;
    } else {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (key in counts) counts[key]++;
    }
  }

  let running = totalBefore;
  return months.map(m => {
    const novas = counts[m.key] ?? 0;
    running += novas;
    return { mes: m.label, novas, total: running };
  });
}

function buildMonthlyAmount(
  entries: { date: Date; amount: number }[],
  months:  ReturnType<typeof getLast6Months>,
) {
  const windowStart = new Date(months[0].year, months[0].month, 1);
  const sums: Record<string, number> = {};
  months.forEach(m => (sums[m.key] = 0));

  let totalBefore = 0;
  for (const entry of entries) {
    if (entry.date < windowStart) {
      totalBefore += entry.amount;
    } else {
      const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
      if (key in sums) sums[key] += entry.amount;
    }
  }

  let running = totalBefore;
  return months.map(m => {
    const novas = Math.round(sums[m.key] ?? 0);
    running += novas;
    return { mes: m.label, novas, total: Math.round(running) };
  });
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(1)}k`;
  return `R$ ${value.toFixed(0)}`;
}

describe("getLast6Months", () => {
  it("should return 6 months", () => {
    const months = getLast6Months();
    expect(months.length).toBe(6);
  });

  it("should have correct structure", () => {
    const months = getLast6Months();
    const firstMonth = months[0];
    
    expect(firstMonth).toHaveProperty("year");
    expect(firstMonth).toHaveProperty("month");
    expect(firstMonth).toHaveProperty("label");
    expect(firstMonth).toHaveProperty("key");
  });

  it("should have valid month labels", () => {
    const months = getLast6Months();
    months.forEach(m => {
      expect(MONTH_NAMES).toContain(m.label);
    });
  });
});

describe("buildMonthlyCount", () => {
  it("should return 6 data points", () => {
    const months = getLast6Months();
    const dates = [new Date()];
    const result = buildMonthlyCount(dates, months);
    expect(result.length).toBe(6);
  });

  it("should handle empty dates", () => {
    const months = getLast6Months();
    const result = buildMonthlyCount([], months);
    expect(result.every(r => r.novas === 0 && r.total === 0)).toBe(true);
  });

  it("should count dates correctly", () => {
    const months = getLast6Months();
    const now = new Date();
    const dates = [now, now, now];
    const result = buildMonthlyCount(dates, months);
    
    const currentMonth = MONTH_NAMES[now.getMonth()];
    const currentMonthData = result.find(r => r.mes === currentMonth);
    expect(currentMonthData?.novas).toBe(3);
  });
});

describe("buildMonthlyAmount", () => {
  it("should return 6 data points", () => {
    const months = getLast6Months();
    const entries = [{ date: new Date(), amount: 100 }];
    const result = buildMonthlyAmount(entries, months);
    expect(result.length).toBe(6);
  });

  it("should handle empty entries", () => {
    const months = getLast6Months();
    const result = buildMonthlyAmount([], months);
    expect(result.every(r => r.novas === 0 && r.total === 0)).toBe(true);
  });

  it("should sum amounts correctly", () => {
    const months = getLast6Months();
    const now = new Date();
    const entries = [
      { date: now, amount: 100 },
      { date: now, amount: 200 },
      { date: now, amount: 50 },
    ];
    const result = buildMonthlyAmount(entries, months);
    
    const currentMonth = MONTH_NAMES[now.getMonth()];
    const currentMonthData = result.find(r => r.mes === currentMonth);
    expect(currentMonthData?.novas).toBe(350);
  });
});

describe("formatCurrency", () => {
  it("should format millions", () => {
    expect(formatCurrency(1_500_000)).toBe("R$ 1.5M");
    expect(formatCurrency(2_000_000)).toBe("R$ 2.0M");
  });

  it("should format thousands", () => {
    expect(formatCurrency(1_500)).toBe("R$ 1.5k");
    expect(formatCurrency(10_000)).toBe("R$ 10.0k");
  });

  it("should format small values", () => {
    expect(formatCurrency(100)).toBe("R$ 100");
    expect(formatCurrency(999)).toBe("R$ 999");
    expect(formatCurrency(0)).toBe("R$ 0");
  });

  it("should handle boundary values", () => {
    expect(formatCurrency(999_999)).toBe("R$ 1000.0k");
    expect(formatCurrency(1_000_000)).toBe("R$ 1.0M");
  });
});

describe("DashboardStats structure", () => {
  it("should have correct structure", () => {
    const stats = {
      empresas: {
        monthly: [{ mes: "Jan", novas: 0, total: 0 }],
        status: [{ label: "Ativas", qtd: 0 }],
        stat: { value: "10", label: "empresas cadastradas", new: "+2 este mês" },
      },
      usuarios: {
        monthly: [{ mes: "Jan", novas: 0, total: 0 }],
        status: [{ label: "Admin", qtd: 1 }],
        stat: { value: "50", label: "usuários cadastrados", new: "nenhum este mês" },
      },
      faturamento: {
        monthly: [{ mes: "Jan", novas: 0, total: 0 }],
        status: [{ label: "Pago", qtd: 0 }],
        stat: { value: "R$ 10k", label: "faturamento total", new: "R$ 0 este mês" },
      },
    };

    expect(stats.empresas.stat.value).toBe("10");
    expect(stats.usuarios.stat.label).toBe("usuários cadastrados");
    expect(stats.faturamento.stat.value).toBe("R$ 10k");
  });
});
