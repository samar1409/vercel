// App.js - Enhanced with Vercel Features
import React, { useState, useEffect } from 'react';
import './App.css';

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    jobRoles: '',
    location: '',
    workTypes: [],
    salaryRange: '',
    resume: null
  });
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState(null);

  // Fetch deployment info from Vercel
  useEffect(() => {
    if (IS_PRODUCTION) {
      fetch('/.well-known/vercel/info')
        .then(res => res.json())
        .then(data => setDeploymentInfo(data))
        .catch(() => {});
    }
  }, []);

  // Track user progress with Vercel Analytics
  const trackEvent = (eventName, data = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Career Copilot',
        ...data
      });
    }
  };

  const salaryRanges = [
    "$60,000 - $80,000",
    "$80,000 - $100,000",
    "$100,000 - $130,000",
    "$130,000 - $160,000",
    "$160,000 - $200,000",
    "$200,000+"
  ];

  const workTypes = ["Remote", "Hybrid", "In-person"];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      trackEvent('step_completed', { step: currentStep });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWorkTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(type)
        ? prev.workTypes.filter(t => t !== type)
        : [...prev.workTypes, type]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
      trackEvent('resume_uploaded', { file_size: file.size });
    }
  };

  const analyzeResume = async () => {
    setIsAnalyzing(true);
    trackEvent('resume_analysis_started');
    
    try {
      // If using Vercel serverless functions
      const formDataToSend = new FormData();
      formDataToSend.append('resume', formData.resume);
      formDataToSend.append('jobRoles', formData.jobRoles);
      
      const response = await fetch(`${API_URL}/api/analyze-resume`, {
        method: 'POST',
        body: formDataToSend
      });
      
      const analysis = await response.json();
      setResumeAnalysis(analysis);
      trackEvent('resume_analysis_completed', { score: analysis.score });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      // Fallback to mock data
      const mockAnalysis = {
        score: Math.floor(Math.random() * 30) + 70,
        improvements: [
          "Add more quantifiable achievements",
          "Include relevant keywords from job descriptions",
          "Highlight leadership experience",
          "Add technical skills section"
        ],
        strengths: [
          "Strong educational background",
          "Relevant work experience",
          "Clear formatting"
        ]
      };
      setResumeAnalysis(mockAnalysis);
    }
    
    setIsAnalyzing(false);
    handleNext();
  };

  const startJobSearch = async () => {
    setIsSearching(true);
    trackEvent('job_search_started', { 
      roles: formData.jobRoles,
      location: formData.location,
      salary: formData.salaryRange
    });
    
    try {
      const response = await fetch(`${API_URL}/api/search-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setJobs(data.jobs || []);
      trackEvent('job_search_completed', { jobs_found: data.jobs?.length || 0 });
    } catch (error) {
      console.error('Error searching jobs:', error);
      // Fallback to mock data
      const mockJobs = [
        { id: 1, title: "Senior Software Engineer", company: "TechCorp", location: "San Francisco, CA", salary: "$150,000 - $200,000", type: "Hybrid" },
        { id: 2, title: "Full Stack Developer", company: "StartupXYZ", location: "Remote", salary: "$120,000 - $160,000", type: "Remote" },
        { id: 3, title: "Backend Engineer", company: "BigTech Inc", location: "Seattle, WA", salary: "$140,000 - $180,000", type: "In-person" },
      ];
      setJobs(mockJobs);
    }
    
    setIsSearching(false);
    
    // Start applying to jobs automatically
    jobs.forEach((job, index) => {
      setTimeout(async () => {
        setApplicationStatus(prev => ({ ...prev, [job.id]: 'applying' }));
        
        // Track each application
        trackEvent('job_application_started', { 
          job_title: job.title,
          company: job.company 
        });
        
        // Simulate application (replace with real API call)
        const result = { success: Math.random() > 0.2 };
        
        setApplicationStatus(prev => ({ 
          ...prev, 
          [job.id]: result.success ? 'success' : 'failed' 
        }));
        
        trackEvent('job_application_completed', { 
          job_title: job.title,
          success: result.success 
        });
      }, index * 2000);
    });
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content glitch-container">
            <h2 className="cyber-text">TARGET ROLES</h2>
            <div className="cyber-line"></div>
            <p className="step-description">Define your career objectives. Enter target positions.</p>
            <div className="input-wrapper">
              <textarea
                className="cyber-input"
                placeholder="Software Engineer, Full Stack Developer, Backend Engineer..."
                value={formData.jobRoles}
                onChange={(e) => setFormData({ ...formData, jobRoles: e.target.value })}
                rows={4}
              />
              <div className="input-glow"></div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <h2 className="cyber-text">LOCATION PARAMETERS</h2>
            <div className="cyber-line"></div>
            <p className="step-description">Set geographical preferences and work environment.</p>
            
            <div className="input-wrapper">
              <input
                type="text"
                className="cyber-input"
                placeholder="San Francisco, New York, Remote..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <div className="input-glow"></div>
            </div>
            
            <h3 className="section-title">WORK MODE</h3>
            <div className="work-type-grid">
              {workTypes.map(type => (
                <div
                  key={type}
                  className={`cyber-card ${formData.workTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => handleWorkTypeToggle(type)}
                >
                  <div className="card-content">
                    <div className="card-icon">
                      {type === 'Remote' ? '⚡' : type === 'Hybrid' ? '◈' : '▣'}
                    </div>
                    <span>{type.toUpperCase()}</span>
                  </div>
                  <div className="card-border"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <h2 className="cyber-text">COMPENSATION RANGE</h2>
            <div className="cyber-line"></div>
            <p className="step-description">Select your target salary bracket.</p>
            <div className="salary-grid">
              {salaryRanges.map((range, index) => (
                <div
                  key={range}
                  className={`salary-card ${formData.salaryRange === range ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, salaryRange: range })}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="salary-content">
                    <span className="salary-text">{range}</span>
                    <div className="salary-bar">
                      <div className="salary-fill" style={{ width: `${(index + 1) * 16}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="step-content">
            <h2 className="cyber-text">RESUME UPLOAD</h2>
            <div className="cyber-line"></div>
            <p className="step-description">Upload your resume for AI-powered optimization.</p>
            
            <div className="upload-container">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="resume-upload" className={`upload-zone ${formData.resume ? 'has-file' : ''}`}>
                <div className="upload-content">
                  {formData.resume ? (
                    <>
                      <div className="file-icon">◉</div>
                      <div className="file-name">{formData.resume.name}</div>
                      <div className="file-size">READY FOR ANALYSIS</div>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">⬆</div>
                      <div className="upload-text">DROP FILE OR CLICK TO BROWSE</div>
                      <div className="upload-hint">PDF, DOC, DOCX</div>
                    </>
                  )}
                </div>
                <div className="upload-border"></div>
              </label>
            </div>
            
            {isAnalyzing && (
              <div className="analyzing-state">
                <div className="scanner"></div>
                <p>ANALYZING DOCUMENT...</p>
              </div>
            )}
          </div>
        );
      
      case 5:
        return (
          <div className="step-content analysis-view">
            <h2 className="cyber-text">ANALYSIS COMPLETE</h2>
            <div className="cyber-line"></div>
            
            {resumeAnalysis && (
              <div className="analysis-container">
                <div className="score-section">
                  <div className="score-display">
                    <svg className="score-svg" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00ff88" />
                          <stop offset="100%" stopColor="#00cc66" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth="10"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="10"
                        strokeDasharray={`${resumeAnalysis.score * 5.65} 565`}
                        transform="rotate(-90 100 100)"
                        className="score-circle"
                      />
                    </svg>
                    <div className="score-value">
                      <span className="score-number">{resumeAnalysis.score}</span>
                      <span className="score-percent">%</span>
                    </div>
                  </div>
                  <div className="score-label">MATCH SCORE</div>
                </div>
                
                <div className="analysis-grid">
                  <div className="analysis-panel strengths">
                    <h3>
                      <span className="panel-icon">◆</span>
                      STRENGTHS DETECTED
                    </h3>
                    <ul>
                      {resumeAnalysis.strengths.map((strength, i) => (
                        <li key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                          <span className="bullet">▸</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="analysis-panel improvements">
                    <h3>
                      <span className="panel-icon">◇</span>
                      OPTIMIZATION REQUIRED
                    </h3>
                    <ul>
                      {resumeAnalysis.improvements.map((improvement, i) => (
                        <li key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                          <span className="bullet">▸</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button className="launch-button" onClick={startJobSearch}>
                  <span className="button-text">INITIATE JOB SEARCH</span>
                  <div className="button-glow"></div>
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="cyber-bg">
        <div className="grid-overlay"></div>
        <div className="scan-line"></div>
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-text">CAREER</span>
            <span className="logo-accent">COPILOT</span>
          </h1>
          <p className="tagline">AUTONOMOUS JOB ACQUISITION SYSTEM</p>
          {deploymentInfo && IS_PRODUCTION && (
            <div className="deployment-badge">
              <span>DEPLOYED ON VERCEL</span>
              <span className="deployment-region">{deploymentInfo.region}</span>
            </div>
          )}
        </div>
      </header>

      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
          <div className="progress-glow"></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step} 
              className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-container">
        {currentStep <= 5 ? (
          <>
            {getStepContent()}
            
            <div className="nav-controls">
              {currentStep > 1 && (
                <button onClick={handleBack} className="nav-button back">
                  <span>◀</span>
                  <span>BACK</span>
                </button>
              )}
              {currentStep < 4 && (
                <button 
                  onClick={handleNext} 
                  className="nav-button next"
                  disabled={
                    (currentStep === 1 && !formData.jobRoles) ||
                    (currentStep === 2 && (!formData.location || formData.workTypes.length === 0)) ||
                    (currentStep === 3 && !formData.salaryRange)
                  }
                >
                  <span>NEXT</span>
                  <span>▶</span>
                </button>
              )}
              {currentStep === 4 && formData.resume && (
                <button onClick={analyzeResume} className="nav-button next">
                  <span>ANALYZE</span>
                  <span>▶</span>
                </button>
              )}
            </div>
          </>
        ) : null}

        {isSearching && (
          <div className="search-overlay">
            <div className="search-animation">
              <div className="radar">
                <div className="radar-sweep"></div>
                <div className="radar-dot dot-1"></div>
                <div className="radar-dot dot-2"></div>
                <div className="radar-dot dot-3"></div>
              </div>
              <p className="search-text">SCANNING JOB DATABASES...</p>
            </div>
          </div>
        )}

        {jobs.length > 0 && !isSearching && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="cyber-text">{jobs.length} TARGETS ACQUIRED</h2>
              <p className="auto-apply-status">AUTONOMOUS APPLICATION PROTOCOL ACTIVE</p>
            </div>
            
            <div className="jobs-grid">
              {jobs.map((job, index) => (
                <div 
                  key={job.id} 
                  className="job-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <div className="company-name">{job.company}</div>
                  </div>
                  
                  <div className="job-meta">
                    <div className="meta-item">
                      <span className="meta-icon">◉</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">◈</span>
                      <span>{job.salary}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">◊</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="status-bar">
                    {!applicationStatus[job.id] && (
                      <div className="status pending">
                        <span className="status-dot"></span>
                        <span>QUEUED</span>
                      </div>
                    )}
                    {applicationStatus[job.id] === 'applying' && (
                      <div className="status applying">
                        <div className="status-spinner"></div>
                        <span>PROCESSING</span>
                      </div>
                    )}
                    {applicationStatus[job.id] === 'success' && (
                      <div className="status success">
                        <span className="status-icon">✓</span>
                        <span>DEPLOYED</span>
                      </div>
                    )}
                    {applicationStatus[job.id] === 'failed' && (
                      <div className="status failed">
                        <span className="status-icon">✗</span>
                        <span>REJECTED</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mission-stats">
              <h3>MISSION STATUS</h3>
              <div className="stats-grid">
                <div className="stat-card success-stat">
                  <div className="stat-value">
                    {Object.values(applicationStatus).filter(s => s === 'success').length}
                  </div>
                  <div className="stat-label">SUCCESSFUL</div>
                </div>
                <div className="stat-card failed-stat">
                  <div className="stat-value">
                    {Object.values(applicationStatus).filter(s => s === 'failed').length}
                  </div>
                  <div className="stat-label">FAILED</div>
                </div>
                <div className="stat-card pending-stat">
                  <div className="stat-value">
                    {jobs.length - Object.keys(applicationStatus).length}
                  </div>
                  <div className="stat-label">PENDING</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Vercel Analytics and Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;