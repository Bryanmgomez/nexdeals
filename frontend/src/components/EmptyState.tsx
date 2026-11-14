export default function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-lg font-semibold">{title}</p>
      {desc && <p className="text-sm mt-1">{desc}</p>}
    </div>
  );
}