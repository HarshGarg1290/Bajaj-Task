import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  

  const [sortBy, setSortBy] = useState('price');
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  

  const [availableSpecialities, setAvailableSpecialities] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');

        if (!response.ok) {
          throw new Error(`Error fetching doctors: ${response.status}`);
        }

        const doctorData = await response.json();
        setDoctors(doctorData);

        const specialities = new Set();
        doctorData.forEach(doctor => {
          if (doctor.specialities && doctor.specialities.length > 0) {
            doctor.specialities.forEach(spec => {
              specialities.add(spec.name);
            });
          }
        });
        setAvailableSpecialities(Array.from(specialities));
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleSpecialityChange = (speciality) => {
    setSelectedSpecialities(prev => {
      if (prev.includes(speciality)) {
        return prev.filter(s => s !== speciality);
      } else {
        return [...prev, speciality];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedSpecialities([]);
    setSortBy('price');
    setSearchQuery('');
  };

  const parseExperienceYears = (experienceStr) => {
    if (!experienceStr) return 0;
    const match = experienceStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const parseFees = (feesStr) => {
    if (!feesStr) return 0;
    const match = feesStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(query) || 
        (doctor.specialities && doctor.specialities.some(s => s.name.toLowerCase().includes(query))) ||
        (doctor.clinic && doctor.clinic.name && doctor.clinic.name.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialities.length > 0) {
      result = result.filter(doctor => 
        doctor.specialities && 
        doctor.specialities.some(s => selectedSpecialities.includes(s.name))
      );
    }

    if (sortBy === 'price') {
      result.sort((a, b) => parseFees(a.fees) - parseFees(b.fees));
    } else if (sortBy === 'experience') {
      result.sort((a, b) => parseExperienceYears(b.experience) - parseExperienceYears(a.experience));
    }
    
    return result;
  }, [doctors, searchQuery, selectedSpecialities, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
   
      <div className="bg-blue-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search Symptoms, Doctors, Specialists, Clinics"
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 text-gray-950">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Sort by</h3>
              <RadioGroup 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="price" id="price" />
                  <label htmlFor="price">Price: Low-High</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="experience" id="experience" />
                  <label htmlFor="experience">Experience- <br></br> Most Experience first</label>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <button 
                  className="text-blue-600 text-sm"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              </div>

              <h4 className="font-medium mb-2">Specialities</h4>
              <div className="space-y-2">
                {availableSpecialities.length > 0 ? (
                  availableSpecialities.map(speciality => (
                    <div key={speciality} className="flex items-center space-x-2">
                      <Checkbox 
                        id={speciality.toLowerCase().replace(/\s+/g, '-')} 
                        checked={selectedSpecialities.includes(speciality)}
                        onCheckedChange={() => handleSpecialityChange(speciality)}
                      />
                      <label htmlFor={speciality.toLowerCase().replace(/\s+/g, '-')}>{speciality}</label>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dentist" />
                    <label htmlFor="dentist">Dentist</label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p>Loading doctors...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-500">
                <p>Error: {error}</p>
              </div>
            ) : filteredAndSortedDoctors.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p>No doctors match your search criteria</p>
              </div>
            ) : (
              filteredAndSortedDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        {doctor.photo ? (
                          <img
                            src={doctor.photo}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl">
                            {doctor.name_initials || doctor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">{doctor.name}</h2>
                        <p className="text-gray-600">
                          {doctor.specialities && doctor.specialities.length > 0
                            ? doctor.specialities[0].name
                            : "Specialist"}
                        </p>
                        <p className="text-gray-500 text-sm">{doctor.experience}</p>
                        <div className="mt-2">
                          <p className="text-gray-700">{doctor.clinic?.name || ''}</p>
                          <p className="text-gray-500">{doctor.clinic?.address?.locality || ''}, {doctor.clinic?.address?.city || ''}</p>
                        </div>
                        {doctor.languages && doctor.languages.length > 0 && (
                          <p className="text-gray-500 text-sm mt-1">
                            Speaks: {doctor.languages.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">{doctor.fees || 'Fee not available'}</p>
                      <div className="mt-2 flex flex-col gap-2">
                        <Button className="w-full">
                          Book Appointment
                        </Button>

                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorListing;