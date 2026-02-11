export default function Tasks() {
  const tasks = [
    { id: 1, name: "AI News", schedule: "Weekdays at 11AM" },
    { id: 2, name: "News Run", schedule: "Daily at 6:22PM" },
  ];

  const examples = [
    { id: 1, name: "Daily Brief: Top AI Industry Headlines", schedule: "Weekdays at 5PM" },
    { id: 2, name: "Deal of the Week: Market-Moving Transactions", schedule: "Weekly on Fri at 9AM" },
    { id: 3, name: "Monthly Pulse: CEO Insights on AI Adoption", schedule: "Monthly on the 3rd Wed at 9AM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Scheduled Tasks</h1>
        <p className="text-sm text-gray-500">
          Automate recurring tasks and research
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Active
        </div>
        <div className="mt-3 divide-y divide-gray-100">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-3">
              <div className="text-sm font-medium text-gray-900">{task.name}</div>
              <div className="text-xs text-gray-500">{task.schedule}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Try these examples...
        </div>
        <div className="mt-3 divide-y divide-gray-100">
          {examples.map((example) => (
            <div key={example.id} className="flex items-center justify-between py-3">
              <div className="text-sm text-gray-700">{example.name}</div>
              <div className="text-xs text-gray-500">{example.schedule}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
