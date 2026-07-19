"use client";

import { useState } from "react";

const questions = [
  ["What is Casa Nirvana?", "Casa Nirvana is a connected community operations platform for residents, guards, facility managers, administrators and trusted service partners."],
  ["Can one platform support several communities?", "Yes. Global and scoped administrative roles are designed to support one community, an agency portfolio or a wider multi-community operation without exposing unrelated tenant data."],
  ["How do visitor passes work?", "Residents create secure passes with an entry code or QR payload. Guards verify the live record, record entry and exit, and preserve the operational history."],
  ["Does Casa Nirvana process payments securely?", "Hosted checkout keeps card data away from Casa Nirvana applications. Payment status is verified server-side before community or service records are marked complete."],
  ["Can we choose which modules residents and guards see?", "Yes. Community module settings control availability while the underlying authorization and tenant-scope rules continue to protect data."],
  ["How does onboarding work?", "Choose your management role, submit your organization and community details, and the Casa Nirvana team will review the request and coordinate rollout."],
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="pxl-accordion">
      {questions.map(([question, answer], index) => {
        const open = index === openIndex;
        return (
          <section className="pxl-accordion__item" key={question}>
            <h2>
              <button type="button" aria-expanded={open} onClick={() => setOpenIndex(open ? -1 : index)}>
                <span>{question}</span><span aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
            </h2>
            <div className="pxl-accordion__answer" hidden={!open}><p>{answer}</p></div>
          </section>
        );
      })}
    </div>
  );
}
