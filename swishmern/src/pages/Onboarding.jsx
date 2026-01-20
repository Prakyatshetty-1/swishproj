import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, Briefcase, ChevronLeft, Check } from 'lucide-react';
import Logo from '../components/ui/Logo';
import '../styles/Onboarding.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";
const DEPARTMENTS = ['Information Tech', 'Computer Science', 'AI & DS', 'AI & ML','Mechanical', 'Civil'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State to hold all answers
  const [data, setData] = useState({
    role: '',       // 'student' or 'faculty'
    department: '', // e.g., 'IT', 'CS'
    year: '',       // e.g., '3rd Year' (Student only)
    division: ''    // e.g., 'A' (Student only)
  });

  // Total steps depends on role (Student = 4 steps, Faculty = 2 steps)
  const totalSteps = data.role === 'faculty' ? 2 : 4;
  
  // Calculate progress bar width
  const progress = (step / totalSteps) * 100;

  // --- Handlers ---
  const handleSelect = (field, value) => {
    setData({ ...data, [field]: value });
    setError("");
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final Step: Submit Data to Backend
      await submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        throw new Error('User ID not found. Please log in again.');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/save-onboarding`, {
        userId: user.id,
        role: data.role,
        department: data.department,
        year: data.role === 'student' ? data.year : null,
        division: data.role === 'student' ? data.division : null,
      });

      if (response.data && response.data.user) {
        // Update localStorage with updated user data
        const updatedUser = {
          ...user,
          ...response.data.user,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('onboardingComplete', 'true');

        console.log("✅ Onboarding data saved to database");
        
        // Dispatch event to update auth state
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Navigate to home
        setIsLoading(false);
        navigate('/home', { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || err.message || "Failed to save onboarding data");
      console.error("Onboarding error:", err);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- Step Content Renderers ---

  // STEP 1: Role Selection
  const renderRoleStep = () => (
    <>
      <h2 className="onboarding-title">Tell us about yourself</h2>
      <p className="onboarding-subtitle">Choose your role to get started</p>
      
      <div className="selection-grid">
        <div 
          className={`option-card ${data.role === 'student' ? 'selected' : ''}`}
          onClick={() => handleSelect('role', 'student')}
        >
          <GraduationCap size={32} className="option-icon" />
          <span className="option-label">Student</span>
        </div>

        <div 
          className={`option-card ${data.role === 'faculty' ? 'selected' : ''}`}
          onClick={() => handleSelect('role', 'faculty')}
        >
          <Briefcase size={32} className="option-icon" />
          <span className="option-label">Faculty</span>
        </div>
      </div>
    </>
  );

  // STEP 2: Department Selection
  const renderDepartmentStep = () => (
    <>
      <h2 className="onboarding-title">Which department?</h2>
      <p className="onboarding-subtitle">Select your engineering branch</p>

      <div className="list-grid">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            className={`list-btn ${data.department === dept ? 'selected' : ''}`}
            onClick={() => handleSelect('department', dept)}
          >
            {dept}
          </button>
        ))}
      </div>
    </>
  );

  // STEP 3: Year Selection (Student Only)
  const renderYearStep = () => (
    <>
      <h2 className="onboarding-title">Which year are you in?</h2>
      <p className="onboarding-subtitle">Select your current academic year</p>

      <div className="list-grid">
        {['1st Year (FE)', '2nd Year (SE)', '3rd Year (TE)', 'Final Year (BE)'].map((year) => (
          <button
            key={year}
            className={`list-btn ${data.year === year ? 'selected' : ''}`}
            onClick={() => handleSelect('year', year)}
          >
            {year}
          </button>
        ))}
      </div>
    </>
  );

  // STEP 4: Division Selection (Student Only)
  const renderDivisionStep = () => (
    <>
      <h2 className="onboarding-title">Select your Division</h2>
      <p className="onboarding-subtitle">Which class division are you in?</p>

      <div className="list-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {['A', 'B', 'C'].map((div) => (
          <button
            key={div}
            className={`list-btn ${data.division === div ? 'selected' : ''}`}
            onClick={() => handleSelect('division', div)}
          >
            {div}
          </button>
        ))}
      </div>
    </>
  );

  // Helper to determine what to verify before enabling "Next"
  const isStepValid = () => {
    if (step === 1) return data.role;
    if (step === 2) return data.department;
    if (step === 3) return data.year;
    if (step === 4) return data.division;
    return false;
  };

  return (
    <div className="onboarding-page">
      {/* Logo at top left */}
      <div className="auth-logo-container">
        <Logo />
      </div>

      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}

        {/* Dynamic Content */}
        <div className="step-content">
          {step === 1 && renderRoleStep()}
          {step === 2 && renderDepartmentStep()}
          {step === 3 && data.role === 'student' && renderYearStep()}
          {step === 4 && data.role === 'student' && renderDivisionStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button 
            className="back-btn" 
            onClick={handleBack}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            disabled={isLoading}
          >
            <ChevronLeft size={20} style={{ display: 'inline', verticalAlign: 'middle' }}/> Back
          </button>

          <button 
            className="next-btn" 
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
            ) : (
              step === totalSteps ? 'Finish' : 'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}