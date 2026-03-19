import { Check } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

export type StepperStep = {
  label: string;
  icon?:  React.ReactNode;
};

export function Stepper({
  steps,
  current,
  activeColor   = t.primary,
  completeColor = t.primary,
}: {
  steps:          StepperStep[];
  current:        number; // 0-indexed
  activeColor?:   string;
  completeColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div
            key={step.label}
            style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13,
                background: done ? completeColor : active ? "#fff" : "#F0F3F8",
                border: active
                  ? `2px solid ${activeColor}`
                  : done
                  ? `2px solid ${completeColor}`
                  : "2px solid #DDE3EC",
                color: done ? "#fff" : active ? activeColor : "#9CA8B8",
                transition: "all 0.25s",
                boxShadow: active ? `0 0 0 4px ${activeColor}18` : "none",
              }}>
                {done
                  ? <Check style={{ width: 15, height: 15 }} />
                  : step.icon ?? <span>{i + 1}</span>
                }
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 500,
                color: active ? activeColor : done ? t.textPrimary : "#9CA8B8",
                whiteSpace: "nowrap", transition: "color 0.2s",
              }}>
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 20, marginLeft: 8, marginRight: 8,
                background: done ? completeColor : "#E8EDF2",
                borderRadius: 2, transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
