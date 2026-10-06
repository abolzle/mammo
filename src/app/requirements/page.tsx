"use client";

export default function RequirementsPage() {
  return (
    <article className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">Requirements</h1>
      <p>
        Studying here does not award approved continuing education, complete structured education, document clinical experience, or establish ARRT eligibility. Those are separate processes defined by ARRT and by your employers and states.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Study progress in this app is local practice history.</li>
        <li>Formal education (didactic hours) is documented by an educational program.</li>
        <li>Clinical experience is documented in the clinical setting under qualified supervision.</li>
        <li>Official eligibility is determined by ARRT using its current handbooks.</li>
      </ul>
      <p>
        Open ARRT&apos;s Mammography credential page and current handbooks for the rules that apply to you. This app summarizes that distinction so you can start studying without confusing a lesson completion with a qualification.
      </p>
    </article>
  );
}
