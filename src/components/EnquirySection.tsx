import { useState, FormEvent, ChangeEvent } from 'react';
import { Mail, MapPin, ArrowRight, CheckCircle, ExternalLink, Instagram } from 'lucide-react';
import { EnquiryForm } from '../types';

export default function EnquirySection() {
  const [formData, setFormData] = useState<EnquiryForm>({
    name: '',
    email: '',
    projectType: 'Brand Film',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Brand Film',
    'Photography Lookbook',
    'Both (Cinema + Still)',
    'Creative Campaign',
    'Editorial Art Short',
    'Other',
  ];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    
    try {
      // Hardcode your actual Web3Forms access key below (get it from web3forms.com by registering teamssp.productions@gmail.com)
      const accessKey = '790d9e6d-3f22-4e11-bacd-a0521bd1f4b0';

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          subject: `New Proposal from ${formData.name} - ${formData.projectType}`,
          project_type: formData.projectType,
          message: formData.message || 'No additional details provided.',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        console.error('Web3Forms submission failed:', result);
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      projectType: 'Brand Film',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <section
      id="enquiry"
      className="py-24 md:py-32 bg-[#FAF5EE] text-[#2C1A0E] relative overflow-hidden px-4 md:px-8"
    >
      {/* Background Graphic Accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-peach/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* Split Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          
          {/* Left Column: Coordinates & Studio Info - Styled inside a White Bento Block */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 border border-[#EBE3D3] flex flex-col justify-start gap-8 shadow-[0_4px_24px_rgba(44,26,14,0.01)]">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-[#2C1A0E]">
                Connect With Us
              </h2>
            </div>

            {/* Studio Info Blocks */}
            <div className="space-y-6 border-t border-[#F2E9D8] pt-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-sans tracking-widest uppercase font-semibold text-[#2C1A0E]/50 mb-1">
                    Locations
                  </h4>
                  <p className="font-serif text-base text-[#2C1A0E]">
                    Bengaluru, Karnataka
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-sans tracking-widest uppercase font-semibold text-[#2C1A0E]/50 mb-1">
                    Email
                  </h4>
                  <a
                    href="mailto:teamssp.productions@gmail.com"
                    className="font-serif text-base md:text-lg text-[#2C1A0E] hover:text-terracotta transition-colors decoration-dotted underline underline-offset-4 break-all"
                  >
                    teamssp.productions@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Instagram className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-sans tracking-widest uppercase font-semibold text-[#2C1A0E]/50 mb-1 uppercase">
                    social media
                  </h4>
                  <a
                    href="https://www.instagram.com/vai.visualss/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-base text-[#2C1A0E] hover:text-terracotta transition-colors decoration-dotted underline underline-offset-4"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Area - Styled in Terracotta Bento Block */}
          <div className="lg:col-span-3">
            <div className="bg-[#C1440E] text-[#FAF5EE] rounded-3xl p-8 md:p-12 shadow-[0_12px_44px_rgba(193,68,14,0.15)] border border-white/5 relative h-full flex flex-col justify-between">
              
              {!submitted ? (
                // Contact Form
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-serif italic text-[#FAF5EE] mb-1">Send Intent</h3>
                    <p className="text-[10px] uppercase tracking-widest text-[#FAF5EE]/80 mb-6">Let&apos;s map your details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#FAF5EE]/90">
                        Your Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Sterling Hayes"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-[#FAF5EE] placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#FAF5EE]/90">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. sterling@hayes.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-[#FAF5EE] placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Project Type Dropdown - Occupies entire width of row */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="projectType" className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#FAF5EE]/90">
                      Project Nature
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full bg-[#C1440E] border border-white/20 text-sm text-white/95 px-4 py-3 rounded-xl focus:outline-none focus:border-white cursor-pointer transition-all duration-300"
                    >
                      {projectTypes.map((type) => (
                        <option key={type} value={type} className="bg-charcoal text-cream">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#FAF5EE]/90">
                      Narrative Vision
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share a brief introduction to the story you intend to co-create..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-[#FAF5EE] placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FAF5EE] hover:bg-[#F2E9D8] select-none text-[#C1440E] py-4 uppercase font-sans text-[11px] tracking-[0.25em] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-500 hover:shadow-lg focus:outline-none disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-terracotta border-t-transparent animate-spin"></span>
                    ) : (
                      <>
                        <span>Send Proposal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Success State Letterhead inside bento block
                <div className="text-center py-6 space-y-6 animate-fadeIn flex flex-col justify-between h-full">
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-2">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif italic text-white text-3xl mb-3">
                        Proposal Received.
                      </h3>
                      <p className="text-white/85 font-sans text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                        Thank you, <span className="font-semibold">{formData.name}</span>. A master copy of your proposal has been logged in our queue.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 border border-dashed border-white/20 p-5 rounded-2xl max-w-sm mx-auto text-left font-mono text-[10px] text-white/80 space-y-2">
                      <div>CORRESPONDENCE_ID: VAI-{Math.floor(100000 + Math.random() * 900000)}</div>
                      <div>INTENT: {formData.projectType.toUpperCase()}</div>
                      <div>TIMESTAMP: {new Date().toISOString()}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-cream/70 font-serif italic text-xs max-w-xs mx-auto mb-6">
                      We will Reach out to you via email in less than 48 business hours. Thank You
                    </p>
                    <button
                      onClick={handleResetForm}
                      className="text-white hover:text-white/80 font-sans text-[10px] tracking-[0.2em] font-bold uppercase border-b border-white/30 hover:border-white pb-0.5 cursor-pointer focus:outline-none"
                    >
                      Send Another Commission
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
