import { ArrowUpRight, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'info@smartnetsa.co.za';

const enquiries = [
  {
    number: '01',
    title: 'Technology & Engineering',
    description: 'Software, cloud, AI and infrastructure',
    subject: 'SmartNet - Technology Project Enquiry',
  },
  {
    number: '02',
    title: 'Education & Solutions',
    description: 'Learning platforms and digital systems',
    subject: 'SmartNet - Education Solutions Enquiry',
  },
  {
    number: '03',
    title: 'Procurement & Supply',
    description: 'Equipment, technology and business sourcing',
    subject: 'SmartNet - Procurement Enquiry',
  },
  {
    number: '04',
    title: 'Partnerships & Tenders',
    description: 'Collaboration and procurement invitations',
    subject: 'SmartNet - Partnership or Tender Enquiry',
  },
] as const;

const emailLink = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function ContactSection() {
  return (
    <section
      className="snx-contact"
      id="snx-contact"
      aria-labelledby="snx-contact-title"
    >
      <div className="snx-contact-orbit" aria-hidden="true">
        <span className="snx-contact-ring snx-contact-ring-one" />
        <span className="snx-contact-ring snx-contact-ring-two" />
        <span className="snx-contact-orb" />
      </div>

      <div className="snx-contact-top">
        <span>06 / START A CONVERSATION</span>
        <span>SOUTH AFRICA / GLOBAL DELIVERY</span>
      </div>

      <div className="snx-contact-layout">
        <div className="snx-contact-intro">
          <span className="snx-contact-eyebrow">
            YOUR NEXT MOVE STARTS HERE
          </span>

          <h2 id="snx-contact-title">
            Let&apos;s build
            <br />
            <em>what&apos;s next.</em>
          </h2>

          <p>
            Big ideas need more than technology.
            They need people who understand the challenge,
            engineer the solution and stand behind the result.
          </p>

          <a
            className="snx-contact-primary"
            href={emailLink('Start a conversation with SmartNet')}
          >
            <Mail size={19} />
            Start a conversation
            <ArrowUpRight size={20} />
          </a>

          <div className="snx-contact-note">
            HUMAN EXPERTISE.
            <br />
            INTELLIGENT EXECUTION.
          </div>
        </div>

        <div className="snx-contact-panel">
          <div className="snx-contact-panel-head">
            <span>WHAT CAN WE HELP YOU WITH?</span>
            <span>SELECT A PATH ↗</span>
          </div>

          {enquiries.map((item) => (
            <a
              key={item.number}
              className="snx-contact-option"
              href={emailLink(item.subject)}
            >
              <span className="snx-contact-option-number">
                {item.number}
              </span>

              <span className="snx-contact-option-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>

              <ArrowUpRight
                className="snx-contact-option-arrow"
                size={19}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="snx-contact-bottom">
        <a href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>

        <span>ENGINEERING TECHNOLOGY SINCE 2016</span>

        <a href="#snx-stage-01">
          BACK TO TOP ↑
        </a>
      </div>
    </section>
  );
}
