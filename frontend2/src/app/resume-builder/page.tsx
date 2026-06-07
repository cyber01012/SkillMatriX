
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import StepDetails from '@/features/resume-builder/components/steps/StepDetails';
import PersonalForm, { type PersonalFormHandle } from '@/features/resume-builder/components/forms/PersonalForm';
import SkillsForm from '@/features/resume-builder/components/forms/SkillsForm';
import EducationForm, { type EducationFormHandle } from '@/features/resume-builder/components/forms/EducationForm';
import ExperienceForm from '@/features/resume-builder/components/forms/ExperienceForm';
import ResumePreview from '@/features/resume-builder/components/preview/ResumePreview';
import TemplatePicker from '@/features/resume-builder/components/TemplatePicker';
import StyleControls from '@/features/resume-builder/components/StyleControls';
import ExportPanel from '@/features/resume-builder/components/ExportPanel';
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Resume, emptyResume } from '@/features/resume-builder/types/resume';
import { GlassProfileBadgeAuto, UnderHeaderGlassStripAuto  } from "@/features/ProfileBadge";

import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_STYLES,
  type TemplateId,
} from '@/features/resume-builder/constants/resume.constants';

/* Theme tokens */
const ACCENT_MINT = '#2ED3A6';
const ACCENT_PURPLE = '#C86AD9';
const TEXT_DEEP = '#3D418A';

/* Tabs */
const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'formats', label: 'Formats & Templates' },
  { id: 'design', label: 'Color & Design' },
  { id: 'export', label: 'Save & Export' },
] as const;

/* Steps under Details */
const detailSteps = ['Personal', 'Skills', 'Education', 'Experience'] as const;


// ---- Local-only GradientText (no external import) ----
function GradientText({
  children,
  colors = ["#4144A3", "#933393", "#26B291", "#4144A3"],
  animationSpeed = 3,
  className = "",
}: {
  children: React.ReactNode;
  colors?: string[];
  animationSpeed?: number; // seconds per loop
  className?: string;
}) {
  const style: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: `gt-shift ${animationSpeed}s linear infinite`,
    display: "inline-block",
  };
  return (
    <>
      <span className={className} style={style}>{children}</span>
      <style jsx global>{`
        @keyframes gt-shift {
          0% { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </>
  );
}

export default function ResumeBuilderPage() {
  /* State */
  const [resume, setResume] = useState<Resume>(emptyResume);
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['id']>('details');
  const [step, setStep] = useState(0);

  const [templateId, setTemplateId] =
    useState<TemplateId>(DEFAULT_TEMPLATE_ID);
  const [accentColor, setAccentColor] =
    useState<string>(DEFAULT_STYLES.accentColor);
  const [fontFamily, setFontFamily] =
    useState<string>(DEFAULT_STYLES.fontFamily);

  const [submitAttempt, setSubmitAttempt] = React.useState(false);

  /* Export (Puppeteer) state */
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  /* Child refs (to focus first error programmatically) */
  const personalRef = useRef<PersonalFormHandle>(null);
  const educationRef = useRef<EducationFormHandle>(null);

  /* For subtle shake animation when blocking navigation */
  const [shakeKey, setShakeKey] = useState(0);

  const tabOrder = tabs.map(t => t.id);
  // router
  const router = useRouter();

  /* Validators */
  const isValidEmail = (s?: string) =>
    !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const isPersonalValid = () => {
    const fn = resume.personal?.fullName?.trim();
    const em = resume.personal?.email?.trim();
    return !!fn && !!em && isValidEmail(em);
  };

  const hasEducation = () => {
    const list = Array.isArray(resume.education) ? resume.education : [];
    return list.some(ed => !!ed?.institution?.trim());
  };

  /* Focus helpers */
  const focusPersonalError = () => {
    setActiveTab('details');
    setStep(0);
    setSubmitAttempt(true);
    requestAnimationFrame(() => personalRef.current?.focusFirstError?.());
    setShakeKey(k => k + 1);
  };

  const focusEducationError = () => {
    setActiveTab('details');
    setStep(2);
    setSubmitAttempt(true);
    requestAnimationFrame(() => educationRef.current?.focusFirstError?.());
    setShakeKey(k => k + 1);
  };

  /* Details → Next */
  const handleNextInsideDetails = () => {
    if (step === 0) {
      const pValid = personalRef.current?.validate()?.valid ?? isPersonalValid();
      if (!pValid) return focusPersonalError();
    }
    if (step === 2) {
      const eValid = educationRef.current?.validate()?.valid ?? hasEducation();
      if (!eValid) return focusEducationError();
    }
    setSubmitAttempt(false);

    if (step === detailSteps.length - 1) setActiveTab('formats');
    else setStep(s => s + 1);
  };

  /* Global Back/Next (every tab) */
  const handlePrevGlobal = () => {
    const idx = tabOrder.indexOf(activeTab);
    if (activeTab === 'details') {
      if (step > 0) setStep(s => s - 1);
    } else if (idx > 0) {
      setActiveTab(tabOrder[idx - 1] as typeof tabs[number]['id']);
    }
  };

  const handleNextGlobal = () => {
    const idx = tabOrder.indexOf(activeTab);
    if (activeTab === 'details') {
      handleNextInsideDetails();
      return;
    }
    if (activeTab === 'export') {
      void handleExportPDF();
      return;
    }
    if (idx < tabOrder.length - 1) {
      setActiveTab(tabOrder[idx + 1] as typeof tabs[number]['id']);
    }
  };

  /* Guard clicking on tabs (forward navigation requires Details valid) */
  const trySetActiveTab = (nextTabId: (typeof tabs)[number]['id']) => {
    if (activeTab === nextTabId) return;

    const curIndex = tabOrder.indexOf(activeTab);
    const nextIndex = tabOrder.indexOf(nextTabId);
    const goingForwardFromDetails =
      activeTab === 'details' && nextIndex > curIndex;

    if (goingForwardFromDetails) {
      const pValid = personalRef.current?.validate()?.valid ?? isPersonalValid();
      if (!pValid) return focusPersonalError();

      const eValid = educationRef.current?.validate()?.valid ?? hasEducation();
      if (!eValid) return focusEducationError();
    }

    setSubmitAttempt(false);
    setActiveTab(nextTabId);
  };

  /* Clickable sub-steps with prerequisite gating */
  const handleSelectDetailStep = (targetStep: number) => {
    const pValid = personalRef.current?.validate()?.valid ?? isPersonalValid();
    if (targetStep > 0 && !pValid) return focusPersonalError();

    const eValid = educationRef.current?.validate()?.valid ?? hasEducation();
    if (targetStep > 2 && !eValid) return focusEducationError();

    setSubmitAttempt(false);
    setStep(targetStep);
  };

  /* Reset submitAttempt when user changes tab/step */
  useEffect(() => {
    setSubmitAttempt(false);
  }, [activeTab, step]);

  const currentTabLabel = useMemo(
    () => tabs.find(t => t.id === activeTab)?.label,
    [activeTab]
  );

  /* Puppeteer export */
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setExportStatus('Preparing your PDF...');
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, templateId, accentColor, fontFamily }),
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);

      setExportStatus('Generating file...');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const fileName =
        (resume.personal?.fullName?.trim() || 'resume').replace(/\s+/g, '-').toLowerCase() + '.pdf';

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExportStatus('✅ Download started!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setExportStatus('❌ Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  
    const handleViewSkillGap = () => {
      router.push("/skill-gap");
    };

  /* Small shake animation variants */
  const shakeVariants = {
    initial: { x: 0 },
    animate: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.45 },
    },
  };

  return (
    <main className="min-h-screen px-6 py-6 overflow-x-hidden "
    style={{ backgroundColor: '#a8e6cf' }}>
      {/* Back to Dashboard */}
      <div className="mb-12 flex items-center justify-between">
      
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 text-[#3D418A]/60 hover:text-[#3D418A] transition-colors font-black text-xs tracking-widest uppercase group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </button>
                <GlassProfileBadgeAuto
                    align="right"
                    showName={true}     // sirf photo chahiye to false
                    tooltip="Signed in"
                  />
                </div>
                <h1 className="mt-5 mb-2 font-black tracking-tighter leading-[0.9] text-7xl md:text-8xl">
                  <GradientText animationSpeed={4}>
                    RESUME BUILDER
                  </GradientText>
                </h1>
        
    <p
      className="text-[22px] sm:text-[23px] mb-10"
      style={{ color: TEXT_DEEP }}
    >
      Your smart resume creation workspace.
    </p>

      {/* Tabs */}
      <div className="mt-6 flex justify-center gap-3 border-b pb-2">
        {tabs.map((tab, i) => {
          const selected = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                scale: selected ? 1.25 : 0.95,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: i * 0.12,
              }}
              onClick={() => trySetActiveTab(tab.id)}
              className="relative px-4 py-2 text-sm font-medium"
              style={{
                color: selected ? TEXT_DEEP : '#64748b',
              }}
            >
              {tab.label}

              {selected && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-[2px] left-0 right-0 h-[3px] rounded"
                  style={{ backgroundColor: ACCENT_MINT }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Subheading */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={activeTab}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center text-sm font-semibold mt-4"
          style={{ color: TEXT_DEEP }}
        >
          {currentTabLabel}
        </motion.h2>
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* LEFT */}
        <section className="col-span-12 sm:col-span-5">
          <div
            className="rounded-xl border bg-white shadow-sm p-4 overflow-y-auto"
            style={{ maxHeight: 'calc(150vh - 10px)' }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div
                  key={`details-${shakeKey}`}
                  variants={shakeVariants}
                  initial="initial"
                  animate="animate"
                >
                  {/* Clickable, animated sub-steps */}
                  <StepDetails
                    currentStep={step}
                    steps={Array.from(detailSteps)}
                    onSelectStep={handleSelectDetailStep}
                    accentColor={ACCENT_MINT}
                    textColor={TEXT_DEEP}
                  />

                  {/* Forms */}
                  {step === 0 && (
                    <PersonalForm
                      ref={personalRef}
                      value={resume.personal}
                      onChange={(v) => setResume({ ...resume, personal: v })}
                      submitAttempt={submitAttempt}
                    />
                  )}

                  {step === 1 && (
                    <SkillsForm
                      value={resume.skills}
                      onChange={(v) => setResume({ ...resume, skills: v })}
                    />
                  )}

                  {step === 2 && (
                    <EducationForm
                      ref={educationRef}
                      value={resume.education}
                      onChange={(v) => setResume({ ...resume, education: v })}
                      submitAttempt={submitAttempt}
                    />
                  )}

                  {step === 3 && (
                    <ExperienceForm
                      value={resume.experience}
                      onChange={(v) => setResume({ ...resume, experience: v })}
                    />
                  )}

                  {/* Extra nudge for Education requirement */}
                  {submitAttempt && step === 2 && !hasEducation() && (
                    <p className="mt-2 text-sm text-red-600" aria-live="polite">
                      {/* Education is required — add at least one entry (e.g., Matric / O-Levels / Intermediate / Bachelor). */}
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'formats' && (
                <motion.div
                  key="formats"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                    <TemplatePicker
                      value={templateId}
                      onChange={setTemplateId}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                >
                  <StyleControls              
                    accentColor={accentColor}
                    onAccentColor={setAccentColor}                    
                    fontFamily={fontFamily}
                    onFontFamily={setFontFamily}
                    templateId={templateId}
                  />
                  
                </motion.div>
                
              )}
              

              {activeTab === 'export' && (
                <motion.div
                  key="export"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="space-y-3"
                >

                  <ExportPanel
                    resume={resume}
                    templateId={templateId}
                    accentColor={accentColor}
                    fontFamily={fontFamily}
                    onExport={handleExportPDF}
                       exporting={exporting}
                       status={exportStatus}
                    /* If ExportPanel exposes onExport/exporting/status props, wire them:
                       onExport={handleExportPDF}
                       exporting={exporting}
                       status={exportStatus}
                     */
                  />

                  {/* Status */}
                  {exportStatus && (
                    <p
                      className="text-xs"
                      style={{ color: exporting ? ACCENT_MINT : TEXT_DEEP }}
                      aria-live="polite"
                    >
                      {exportStatus}
                    </p>
                  )}

                  {/* Skill Gap CTA moved here */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span style={{ color: TEXT_DEEP }}>
                      CV Done? <br />
                      Want Skill Gap Report ?
                    </span>
                    <button
                      className="px-4 py-2 rounded text-white"
                      style={{ backgroundColor: ACCENT_PURPLE }}
                      onClick={handleViewSkillGap}
                    >
                      Generate Skill Gap
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unified navigation shown for every tab */}
            <div className="flex justify-between mt-4">
              <button
                className="cursor-pointer disabled:opacity-50"
                onClick={handlePrevGlobal}
                disabled={activeTab === 'details' && step === 0}
              >
                ← Back
              </button>

              
              {/* Next: show on details/formats/design; hide/empty on export */}
                {activeTab !== 'export' ? (
                  <button
                    onClick={handleNextGlobal}
                    className="cursor-pointer disabled:opacity-50"
                    // (We only disable during export if we were to allow Next on export; here it's hidden)
                  >
                    Next →
                  </button>
                ) : (
                  // Keep layout from jumping on Export tab by rendering an empty spacer
                  <span aria-hidden="true">&nbsp;</span>
                )}

            </div>
          </div>
        </section>

        {/* RIGHT (Preview) */}
        <section className="col-span-12 sm:col-span-7 no-print">
          <div
            id="resume-builder-root"
            className="no-print border rounded-xl p-3 h-[120vh] overflow-y-auto"
          >
            <ResumePreview
              resume={resume}
              templateId={templateId}
              accentColor={accentColor}
              fontFamily={fontFamily}
            />
            {/* If your preview renders multiple pages, ensure each page element has className="page" */}
          </div>

          {/* Footer CTA removed (moved to Export tab) */}
        </section>
      </div>
    </main>
  );
}
