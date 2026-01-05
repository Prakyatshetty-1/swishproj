import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ChevronLeft, Check } from 'lucide-react';
import Logo from '../components/ui/Logo';
import '../styles/Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
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
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final Step: Submit Data
      console.log("✅ Onboarding Complete:", data);
      
      // Save onboarding data to localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        role: data.role,
        department: data.department,
        ...(data.role === 'student' && {
          year: data.year,
          division: data.division
        })
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('onboardingComplete', 'true');
      
      console.log("✅ Onboarding data saved to localStorage");
      
      // Dispatch event to update auth state
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to home
      navigate('/home', { replace: true });
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
        {['Information Tech', 'Computer Science', 'AI & DS', 'AI & ML','Mechanical', 'Civil'].map((dept) => (
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
          >
            <ChevronLeft size={20} style={{ display: 'inline', verticalAlign: 'middle' }}/> Back
          </button>

          <button 
            className="next-btn" 
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {step === totalSteps ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}