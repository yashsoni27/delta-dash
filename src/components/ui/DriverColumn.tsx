export const driverColumns = [
  { key: "pos", label: "Pos", width: "3rem", visible: true },
  { key: "driver", label: "Driver", width: "7rem", visible: true },
  { key: "drs", label: "DRS", width: "3.5rem", visible: true },
  { key: "tyre", label: "Tyre", width: "5rem", visible: true },
  { key: "info", label: "Info", width: "4.5rem", visible: true },
  { key: "gap", label: "Gap", width: "5rem", visible: true },
  { key: "lapTime", label: "LapTime", width: "7rem", visible: true },
  { key: "sectors", label: "Sectors", width: "minmax(25rem,5fr)", visible: true },
  { key: "gear", label: "Gear/RPM", width: "6rem", visible: false },
  { key: "speed", label: "Speed", width: "6rem", visible: false },
];

export const visibleDriverColumns = driverColumns.filter((c) => c.visible);

export const driverGridTemplate = visibleDriverColumns
  .map((c) => c.width)
  .join(" ");