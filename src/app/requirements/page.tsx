"use client";

export default function RequirementsPage() {
  return (
    <article className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">Credential requirements</h1>
      <p>
        Mammo can help you study, but it cannot complete or document the formal steps required for a mammography credential. Keep using the records and processes required
        by your education program, employer, state, and ARRT.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Work completed in Mammo is personal study history, not approved continuing education.</li>
        <li>Structured education and didactic hours must be documented by an appropriate educational program.</li>
        <li>Clinical procedures and experience must be completed and documented in the clinical setting under qualified supervision.</li>
        <li>ARRT determines exam eligibility under its current requirements and handbooks.</li>
      </ul>
      <p>
        Check ARRT&apos;s current Mammography credential page and handbooks for the requirements that apply to you. A completed Mammo lesson means you finished a study
        activity; it does not verify competency, award CE, or establish eligibility.
      </p>
    </article>
  );
}
