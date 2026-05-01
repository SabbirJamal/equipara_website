import ListingsGrid from '@/components/listings/ListingsGrid';

export default function BuyerDashboard() {
  return (
    <main>
      <div className="max-w-7xl mx-auto pt-6 pb-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Browse Equipment & Transport</h2>
        <p className="text-gray-600 mt-2">Find the right equipment for your project</p>
      </div>
      <ListingsGrid />
    </main>
  );
}