import React from 'react';
import { Activity, Printer, ChevronLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ReportPage = () => {
  const { user, scanResults } = useUser();

  const handlePrint = () => {
    window.print();
  };

  if (!scanResults) {
    return <Navigate to="/deep-scan" />;
  }

  // Calculate BMI dynamically with strict fallbacks to prevent NaN crashes
  const rawHeight = parseFloat(user?.height);
  const rawWeight = parseFloat(user?.weight);
  
  const height = (!isNaN(rawHeight) && rawHeight > 0) ? rawHeight : 180; // Default 180cm
  const weight = (!isNaN(rawWeight) && rawWeight > 0) ? rawWeight : 85;  // Default 85kg
  
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  let bmiLabel = "Normal";
  if (bmi > 25) bmiLabel = "Overweight";
  if (bmi > 30) bmiLabel = "Obese";

  // Parse Results correctly from nested Backend JSON structure
  const heartRiskLevel = scanResults.heart?.risk_level || 'Low';
  const heartRiskProb = scanResults.heart ? Math.round(scanResults.heart.probability * 100) : 0;

  const diabetesRiskLevel = scanResults.diabetes?.risk_level || 'Low';
  const diabetesRiskProb = scanResults.diabetes ? Math.round(scanResults.diabetes.probability * 100) : 0;

  const strokeRiskLevel = scanResults.stroke?.risk_level || 'Low';
  const strokeRiskProb = scanResults.stroke ? Math.round(scanResults.stroke.probability * 100) : 0;

  const hyperRiskLevel = scanResults.hypertension?.risk_level || 'Low';
  const hyperRiskProb = scanResults.hypertension ? Math.round(scanResults.hypertension.probability * 100) : 0;

  const swasthScore = Math.round(scanResults.overall_swasth_score || 0);

  // Generate Dynamic Recommendations based on actual ML risks
  const generateRecommendations = () => {
    const recs = [];
    
    if (hyperRiskLevel === 'High' || hyperRiskLevel === 'Moderate') {
      recs.push({
        title: "Blood Pressure Management",
        desc: "Your predicted hypertension risk is elevated. Consider reducing sodium intake and engaging in 30 minutes of moderate aerobic exercise 5 days a week."
      });
    }
    
    if (strokeRiskLevel === 'High') {
      recs.push({
         title: "Cardiovascular Screening",
         desc: "Due to the high predicted stroke risk based on combined metrics, an immediate consultation with a cardiologist is highly advised."
      });
    }

    if (diabetesRiskLevel === 'High' || diabetesRiskLevel === 'Moderate') {
      recs.push({
         title: "Blood Sugar Monitoring",
         desc: "Your diabetes risk profile indicates a need for caution. We recommend a fasting blood glucose test and maintaining a low-glycemic diet."
      });
    }

    if (bmi > 25) {
      recs.push({
         title: "Weight Optimization",
         desc: `A modest weight reduction can significantly improve insulin sensitivity and lower systemic blood pressure. Target BMI is 18.5 - 24.9.`
      });
    }

    // Default if entirely healthy
    if (recs.length === 0) {
      recs.push({
         title: "Maintain Healthy Lifestyle",
         desc: "Your health metrics correlate highly with optimal functioning. Continue your current routine of balanced nutrition, adequate hydration, and regular physical activity."
      });
    }

    return recs.slice(0, 3); // Max 3 recommendations for layout
  };

  const recommendations = generateRecommendations();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4">
        {/* Non-printable actions */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link to="/results" className="flex items-center gap-2 text-slate-600 hover:text-healthcare-blue transition-colors">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 py-2.5">
            <Printer size={18} /> Print Report
          </button>
        </div>

        {/* Printable Report Outline */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Swasth AI Logo" 
                  className="h-10 md:h-12 w-auto object-contain print:h-10"
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.parentNode.innerHTML = '<div class="bg-healthcare-blue text-white p-2 rounded-lg print:border print:border-slate-300 print:text-black print:bg-white"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Swasth AI</h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Comprehensive Health Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Report ID: #SW-{Math.floor(Math.random() * 100000)}</p>
              <p className="text-sm text-slate-500">Date: {currentDate}</p>
            </div>
          </div>

          {/* Patient Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 bg-slate-50 p-6 rounded-xl print:bg-transparent print:border print:border-slate-200">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Patient</p>
              <p className="font-medium text-slate-900">{user?.name || "Anonymous Patient"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Age / Sex</p>
              <p className="font-medium text-slate-900">{user?.age || "N/A"} / {user?.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Height / Weight</p>
              <p className="font-medium text-slate-900">{user?.height || "N/A"} cm / {user?.weight || "N/A"} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">BMI</p>
              <p className="font-medium text-slate-900">{bmi} ({bmiLabel})</p>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldAlert className="text-healthcare-blue" />
                Risk Assessment
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-700">Heart Risk</span>
                  <span className={`font-bold ${heartRiskLevel === 'High' ? 'text-red-600' : (heartRiskLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600')} `}>{heartRiskLevel} ({heartRiskProb}%)</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-700">Diabetes Risk</span>
                  <span className={`font-bold ${diabetesRiskLevel === 'High' ? 'text-red-600' : (diabetesRiskLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600')} `}>{diabetesRiskLevel} ({diabetesRiskProb}%)</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-700">Stroke Risk</span>
                  <span className={`font-bold ${strokeRiskLevel === 'High' ? 'text-red-600' : (strokeRiskLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600')} `}>{strokeRiskLevel} ({strokeRiskProb}%)</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-700">Hypertension</span>
                  <span className={`font-bold ${hyperRiskLevel === 'High' ? 'text-red-600' : (hyperRiskLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600')} `}>{hyperRiskLevel} ({hyperRiskProb}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-healthcare-blue/5 border border-healthcare-blue/10 rounded-xl p-8 flex flex-col items-center justify-center text-center print:border-slate-200 print:bg-transparent">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Swasth Score</p>
              <div className={`text-7xl font-bold mb-2 ${swasthScore > 80 ? 'text-healthcare-safe' : (swasthScore > 50 ? 'text-healthcare-blue' : 'text-healthcare-danger')}`}>
                 {swasthScore}
              </div>
              <p className="text-sm text-slate-600 font-medium">Out of 100 (Optimal)</p>
              <p className="mt-4 text-xs text-slate-500">
                {swasthScore > 80 ? "Your health metrics are excellent. Keep up the good work!" : "Your score indicates room for improvement, particularly regarding cardiovascular health."}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-healthcare-safe" />
              AI Recommendations
            </h2>
            <div className="space-y-4 text-slate-700">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg print:border print:border-slate-100 print:bg-transparent">
                  <h4 className="font-semibold text-slate-900 mb-1">{index + 1}. {rec.title}</h4>
                  <p className="text-sm">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-slate-200 pt-8 mt-12 text-xs text-slate-500 leading-relaxed text-justify">
            <strong className="block mb-2 text-slate-700">Important Medical Disclaimer:</strong>
            Swasth AI is a preventative health risk assessment tool powered by artificial intelligence and machine learning models. The insights, scores, and recommendations provided in this report are for informational and educational purposes only and do NOT constitute professional medical advice, diagnosis, or treatment. You should always seek the advice of your physician or other qualified health providers with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this report. If you think you may have a medical emergency, call your doctor, go to the emergency department, or call emergency services immediately.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

