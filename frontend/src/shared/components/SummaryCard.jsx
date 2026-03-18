export default function SummaryCard({ title, value }) {
  return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      </div>
  );
}