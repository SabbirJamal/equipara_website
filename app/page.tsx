'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartHeader from '@/components/layout/SmartHeader';
import { equipmentTypes, specOptions, SpecOption } from '@/lib/equipment-types';

export default function HomePage() {
  const router = useRouter();
  
  // step state
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'equipment' | 'transport'>('transport');
  const [selectedType, setSelectedType] = useState('');
  
  // step 2: spec values
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  
  // step 3: details
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');

  const equipmentList = equipmentTypes.filter(t => t.category === 'equipment');
  const transportList = equipmentTypes.filter(t => t.category === 'transport');
  
  const currentTypeList = activeTab === 'transport' ? transportList : equipmentList;
  const currentSpecs = specOptions[selectedType] || [];
  
  const omanCities = ['Muscat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Buraimi', 'Ibri', 'Rustaq', 'Barka', 'Khasab'];
  const years = Array.from({ length: 30 }, (_, i) => (2026 - i).toString());

  const handleTypeSelect = (typeValue: string) => {
    setSelectedType(typeValue);
  };

  const handleContinue = () => {
    if (step === 1 && selectedType) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSearch = () => {
    // build search params
    const params = new URLSearchParams();
    params.set('type', selectedType);
    
    // add specs
    Object.entries(specValues).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // add details
    if (location) params.set('location', location);
    if (year) params.set('year', year);
    if (brand) params.set('brand', brand);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSpecChange = (key: string, value: string) => {
    setSpecValues(prev => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (tab: 'equipment' | 'transport') => {
    setActiveTab(tab);
    setSelectedType('');
    setStep(1);
  };

  // get the label for selected type
  const selectedTypeLabel = equipmentTypes.find(t => t.value === selectedType)?.label || selectedType;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SmartHeader />

      {/* hero / video section */}
      <section className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[600px]">
        {/* background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/home_background.mp4" type="video/mp4" />
        </video>

        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* centered content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* step 1: choose type */}
          {step === 1 && (
            <div className="text-center">
              {/* tabs */}
              <div className="flex justify-center gap-0 mb-8">
                <button
                  onClick={() => handleTabChange('transport')}
                  className={`px-8 py-3 text-lg font-bold rounded-t-lg transition-all ${
                    activeTab === 'transport'
                      ? 'bg-white text-gray-900'
                      : 'bg-transparent text-white hover:bg-white/10'
                  }`}
                >
                  TRANSPORT
                </button>
                <button
                  onClick={() => handleTabChange('equipment')}
                  className={`px-8 py-3 text-lg font-bold rounded-t-lg transition-all ${
                    activeTab === 'equipment'
                      ? 'bg-white text-gray-900'
                      : 'bg-transparent text-white hover:bg-white/10'
                  }`}
                >
                  EQUIPMENT
                </button>
              </div>

              {/* type cards */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {currentTypeList.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`px-5 py-3 rounded-lg font-medium transition-all text-sm ${
                      selectedType === type.value
                        ? 'bg-amber-500 text-gray-900 shadow-lg scale-105'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* continue button */}
              {selectedType && (
                <button
                  onClick={handleContinue}
                  className="bg-amber-500 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-400 transition"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* step 2: specifications */}
          {step === 2 && (
            <div>
              <h3 className="text-white text-center text-xl font-bold mb-6">
                Specifications - {selectedTypeLabel}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentSpecs.map((spec: SpecOption) => (
                  <div key={spec.key}>
                    <label className="text-white text-sm block mb-1">
                      {spec.label} {spec.unit && `(${spec.unit})`}
                    </label>
                    <input
                      type={spec.type === 'number' ? 'number' : 'text'}
                      placeholder={`Enter ${spec.label.toLowerCase()}`}
                      value={specValues[spec.key] || ''}
                      onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>

              {/* buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-amber-500 text-gray-900 px-8 py-2 rounded-lg font-bold hover:bg-amber-400 transition"
                >
                  Continue
                </button>
              </div>
              <p className="text-gray-400 text-center text-sm mt-3">All fields optional - you can skip this step</p>
            </div>
          )}

          {/* step 3: listing details */}
          {step === 3 && (
            <div>
              <h3 className="text-white text-center text-xl font-bold mb-6">
                Listing Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* brand */}
                <div>
                  <label className="text-white text-sm block mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="" className="text-gray-900">Any Brand</option>
                    <option value="Caterpillar" className="text-gray-900">Caterpillar</option>
                    <option value="Liebherr" className="text-gray-900">Liebherr</option>
                    <option value="Komatsu" className="text-gray-900">Komatsu</option>
                    <option value="Volvo" className="text-gray-900">Volvo</option>
                    <option value="Hitachi" className="text-gray-900">Hitachi</option>
                    <option value="JCB" className="text-gray-900">JCB</option>
                    <option value="Mercedes" className="text-gray-900">Mercedes</option>
                    <option value="MAN" className="text-gray-900">MAN</option>
                    <option value="Scania" className="text-gray-900">Scania</option>
                  </select>
                </div>

                {/* year */}
                <div>
                  <label className="text-white text-sm block mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="" className="text-gray-900">Any Year</option>
                    {years.map(y => (
                      <option key={y} value={y} className="text-gray-900">{y}</option>
                    ))}
                  </select>
                </div>

                {/* location */}
                <div className="col-span-2">
                  <label className="text-white text-sm block mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="" className="text-gray-900">Any Location</option>
                    {omanCities.map(city => (
                      <option key={city} value={city} className="text-gray-900">{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSearch}
                  className="bg-amber-500 text-gray-900 px-8 py-2 rounded-lg font-bold hover:bg-amber-400 transition"
                >
                  Search
                </button>
              </div>
              <p className="text-gray-400 text-center text-sm mt-3">All fields optional</p>
            </div>
          )}

          {/* step indicators */}
          <div className="flex justify-center gap-2 mt-8">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-amber-500' : 'bg-white/30'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-amber-500' : 'bg-white/30'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-amber-500' : 'bg-white/30'}`}></div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-2">
            <span className="text-gray-300">Equi</span>
            <span className="text-amber-500">para</span>
          </div>
          <p className="text-sm">© 2026 Equipara. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}