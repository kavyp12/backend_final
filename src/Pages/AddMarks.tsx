import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';

interface Subject {
  subjectName: string;
  marks: string;
  totalMarks: string;
}

const MarksEntry = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([
    { subjectName: '', marks: '', totalMarks: '100' }
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (index: number, field: keyof Subject, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    
    if (field === 'subjectName' && value && !newSubjects[index].totalMarks) {
      newSubjects[index].totalMarks = '100';
    }
    
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', marks: '', totalMarks: '100' }]);
    setSuccess('Subject added successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const removeSubject = (index: number) => {
    if (subjects.length === 1) return;
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const validateForm = () => {
    for (const subject of subjects) {
      if (!subject.subjectName.trim()) return 'All subjects must have a name';
      if (!subject.marks || isNaN(Number(subject.marks))) return 'Invalid marks entered';
      if (Number(subject.marks) > Number(subject.totalMarks)) return 'Marks cannot exceed total marks';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('https://api.enhc.tech/api/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjects: subjects.map(subject => ({
            subjectName: subject.subjectName.trim(),
            marks: parseInt(subject.marks),
            totalMarks: parseInt(subject.totalMarks)
          }))
        }),
      });

      if (response.ok) {
        navigate('/questionnaire');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit marks');
      }
    } catch (error) {
      console.error('Error submitting marks:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="bg-white" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div className="flex flex-col h-full">
        {/* Fixed header section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl rounded-b-2xl overflow-hidden p-8 sm:p-10">
          <div className="relative">
            <div className="absolute inset-0 bg-pattern opacity-10" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Academic Records</h2>
                <p className="text-indigo-100">Track your academic performance</p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-indigo-100" />
                <span className="text-indigo-50 font-medium">
                  {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'} Added
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-16 bg-indigo-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Subject #{index + 1}</h3>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                    <input
                      type="text"
                      value={subject.subjectName}
                      onChange={(e) => handleInputChange(index, 'subjectName', e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter subject name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      value={subject.marks}
                      onChange={(e) => handleInputChange(index, 'marks', e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                      min="0"
                      max={subject.totalMarks || 100}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                    <input
                      type="number"
                      value={subject.totalMarks}
                      onChange={(e) => handleInputChange(index, 'totalMarks', e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="100"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-700">Progress</span>
                    <span className="text-sm font-medium text-indigo-700">
                      {subject.totalMarks && subject.marks 
                        ? `${Math.round((Number(subject.marks) / Number(subject.totalMarks)) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="mt-2 h-3 bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${(Number(subject.marks) / Number(subject.totalMarks)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-300 transition-colors duration-300 shadow-sm hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Subject</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center bg-red-50 p-3 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 flex items-center bg-green-50 p-3 rounded-lg text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {success}
                </div>
              )}
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full mb-6 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Save All Marks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;