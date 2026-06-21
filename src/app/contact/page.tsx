"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@learnwise.com",
    subtitle: "We typically respond within 24 hours.",
    gradient: "from-indigo-500 to-violet-500",
    bgGradient: "from-indigo-50 to-violet-55 dark:from-indigo-950/30 dark:to-violet-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+1 (555) 010-2026",
    subtitle: "Mon - Fri, 9am to 6pm EST",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50 to-cyan-55 dark:from-teal-950/30 dark:to-cyan-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
  },
  {
    icon: MapPin,
    title: "Location",
    detail: "Remote-first learning platform",
    subtitle: "Available worldwide, 24/7",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-55 dark:from-violet-950/30 dark:to-purple-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
];

const faqItems = [
  {
    question: "How do I access my active learning paths?",
    answer: "You can access all your enrolled courses by navigating to your Profile page or by visiting the 'My Learning' tab in the navigation menu."
  },
  {
    question: "How much does it cost to use the platform?",
    answer: "The platform is completely free to use! You can add any courses to your active learning path and track your progress without any fees."
  },
  {
    question: "How do the course recommendations work?",
    answer: "Our recommendation engine analyzes your career goals, skill levels, and domains of interest configured in your Profile page to suggest matches dynamically using advanced personalized alignment."
  },
  {
    question: "Can I change my learning preferences after registration?",
    answer: "Yes, you can update your career goals, skill level, and interests anytime on your Profile page under the Learning Preferences tab."
  },
  {
    question: "Are certificates of completion provided?",
    answer: "Yes, once you finish all lessons and complete the final assessment of a course, a verified Certificate of Completion will be generated."
  }
];

export default function ContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Banner */}
      <section className="gradient-hero text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-10 left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-5 right-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">Get in Touch</h1>
          <p className="text-lg text-indigo-200 animate-fade-in-up-delay-1 font-light">Have a question or feedback? We&apos;d love to hear from you.</p>
        </div>
      </section>

      {/* Contact Info (Left) + Form (Right) */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Contact Info Cards (Left side) */}
            <div className="w-full lg:w-96 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Information</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Reach out to us via any of these channels. Our team is ready to assist you.</p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div 
                      key={info.title} 
                      className={cn(
                        "bg-gradient-to-br border rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group", 
                        info.bgGradient, 
                        info.borderColor
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform", info.gradient)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{info.title}</h3>
                          <p className="text-slate-800 dark:text-slate-200 font-bold mt-1 text-sm">{info.detail}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{info.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Form (Right side) */}
            <div className="flex-1 w-full">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-indigo-500/2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a message</h2>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-400 mb-2">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-550 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-555 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-400 mb-2">Message Subject</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-555 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="General Inquiry"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-400 mb-2">Message</label>
                    <textarea
                      rows={5}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-555 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 shadow-lg shadow-indigo-500/15 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer">
                    Submit Message
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section (5 Collapsible Cards, Same Font Size) */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={faq.question} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-450">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-850">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MMU Melaka Map Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950 border-t border-slate-250/20 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">Our Location</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
            Multimedia University (MMU) Melaka Campus, Jalan Ayer Keroh Lama, 75450 Bukit Beruang, Melaka, Malaysia.
          </p>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 h-96 w-full animate-fade-in-up">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.7214594689626!2d102.27395567586616!3d2.2497672977303036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1f057864f1d43%3A0xe2da205bcfdf2d2b!2sMultimedia%20University%20(Melaka%20Campus)!5e0!3m2!1sen!2smy!4v1718616313000!5m2!1sen!2smy"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}