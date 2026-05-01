import BecomeSellerForm from '@/components/auth/BecomeSellerForm';

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Become a Seller
          </h1>
          <p className="text-gray-600 mt-2">
            Register your company to start listing equipment and transport
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <BecomeSellerForm />
        </div>
      </div>
    </div>
  );
}