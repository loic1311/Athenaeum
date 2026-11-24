export function studyReadings(records) {
  const readings = [];
  for (const row of records) {
    const data = row.data;
    if (row.kind === 'prefs' && data?.name === 'history-read' && data.value === true) {
      readings.push({ lesson: data.lesson, at: row.at });
    }
    const plan = row.kind === 'draft' && data?.daily;
    if (!plan) continue;
    const step = plan.stages?.findIndex(stage => stage.id === 'read');
    if (!(step >= 0 && plan.cursor > step)) continue;
    const date = plan.readDay ?? plan.studyDay ?? plan.date;
    const at = plan.readAt ?? +new Date(date + 'T00:00:00');
    for (const unit of plan.readUnits ?? plan.units ?? []) readings.push({ lesson: unit.id ?? unit, at });
  }
  return readings;
}
