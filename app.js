function App() {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    category: '',
    comments: ''
  });
  const [sponsorData, setSponsorData] = React.useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipLevel: '',
    message: ''
  });
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSponsorSubmitted, setIsSponsorSubmitted] = React.useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSponsorInputChange = (e) => {
    const { name, value } = e.target;
    setSponsorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vehicleYear: '',
        vehicleMake: '',
        vehicleModel: '',
        category: '',
        comments: ''
      });
    }, 3000);
  };

  const handleSponsorSubmit = (e) => {
    e.preventDefault();
    setIsSponsorSubmitted(true);
    setTimeout(() => {
      setIsSponsorSubmitted(false);
      setSponsorData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        sponsorshipLevel: '',
        message: ''
      });
    }, 3000);
  };

  const schedule = [
    { time: '9:00 AM', event: 'Registration Opens', detail: 'Check-in for registered participants' },
    { time: '10:00 AM', event: 'Gates Open to Public', detail: 'General admission begins' },
    { time: '12:30 PM', event: 'Food & Refreshments', detail: 'Lunch available from local vendors' },
    { time: '3:30 PM', event: 'Event Concludes', detail: 'Thank you for attending' }
  ];

  const categories = [
    { name: 'Classic Cars', description: 'Vehicles manufactured 1900-1979', icon: 'fa-car-side' },
    { name: 'Muscle Cars', description: 'High-performance American V8 vehicles', icon: 'fa-gauge-high' },
    { name: 'Exotic & Luxury', description: 'Premium and rare automobiles', icon: 'fa-gem' },
    { name: 'Modern Performance', description: 'Contemporary sports and performance cars', icon: 'fa-bolt' },
    { name: 'Motorcycles', description: 'Sport bikes, cruisers, and custom motorcycles', icon: 'fa-motorcycle' },
    { name: 'Custom & Modified', description: 'Customized and modified vehicles', icon: 'fa-wrench' },
    { name: 'Electric & Alternative', description: 'Electric and alternative fuel vehicles', icon: 'fa-leaf' }
  ];

  const stats = [
    { number: '150+', label: 'Vehicles Expected' },
    { number: '500+', label: 'Attendees' },
    { number: '7', label: 'Vehicle Categories' },
    { number: 'Free', label: 'For Bryant Students' }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 border-b border-neutral-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="images/logo.png"
                  alt="Bryant Car Club Logo"
                  className="h-12 w-12"
                />
                <div>
                  <div className="text-xl font-bold tracking-tight">Bryant University</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: '#826E38' }}>Car Show 2027</div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm hover:text-neutral-300 transition-colors">About</a>
              <a href="#rules" className="text-sm hover:text-neutral-300 transition-colors">Rules</a>
              <a href="#schedule" className="text-sm hover:text-neutral-300 transition-colors">Schedule</a>
              <a href="#categories" className="text-sm hover:text-neutral-300 transition-colors">Categories</a>
              <a href="#sponsors" className="text-sm hover:text-neutral-300 transition-colors">Sponsors</a>
              <a href="#register" className="text-sm font-semibold px-4 py-2 transition-colors" style={{ backgroundColor: '#826E38', color: 'white' }}>Register</a>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden border-t border-neutral-800 py-4">
              <div className="flex flex-col gap-4">
                <a href="#about" className="text-sm hover:text-neutral-300 transition-colors">About</a>
                <a href="#rules" className="text-sm hover:text-neutral-300 transition-colors">Rules</a>
                <a href="#schedule" className="text-sm hover:text-neutral-300 transition-colors">Schedule</a>
                <a href="#categories" className="text-sm hover:text-neutral-300 transition-colors">Categories</a>
                <a href="#sponsors" className="text-sm hover:text-neutral-300 transition-colors">Sponsors</a>
                <a href="#register" className="text-sm hover:text-neutral-300 transition-colors">Register</a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://hips.hearstapps.com/autoweek/assets/s3fs-public/car-show11-min.jpg"
            alt="Classic cars displayed on university campus lawn"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 mb-6 border" style={{ borderColor: '#826E38', color: '#826E38' }}>
              <span className="text-xs font-semibold tracking-widest uppercase">Annual Event</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-balance mb-6">Bryant University Car Show</h1>
            <p className="text-xl sm:text-2xl text-neutral-300 text-pretty mb-8 leading-relaxed max-w-3xl">Join the Bryant community for our premier automotive showcase. Celebrating automotive excellence, innovation, and the passion that drives us forward.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#register" className="inline-block px-8 py-4 font-semibold text-center transition-colors text-white" style={{ backgroundColor: '#826E38' }}>Register Your Vehicle</a>
              <a href="#schedule" className="inline-block px-8 py-4 border-2 border-white hover:bg-white hover:text-black font-semibold text-center transition-colors">View Event Details</a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-neutral-200" style={{ backgroundColor: '#826E38' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white tabular-nums mb-2">{stat.number}</div>
                <div className="text-sm text-neutral-100 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#826E38' }}>About the Event</div>
              <h2 className="text-4xl font-bold text-black mb-6 text-balance">A Celebration of Automotive Innovation</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>The Bryant University Car Show brings together automotive enthusiasts, students, alumni, and the local community for a day of celebration and appreciation of automotive design, engineering, and culture.</p>
                <p>This event reflects Bryant's commitment to innovation, excellence, and community engagement. Whether you're a collector, restorer, student, or simply appreciate fine automobiles, this showcase offers something for everyone.</p>
                <p>
                  <strong>Date:</strong> Coming Soon - April 2027<br />
                  <strong>Location:</strong> Bryant University Campus, Smithfield, RI<br />
                  <strong>Admission:</strong> Free for Bryant students and staff, $5 general admission
                </p>
              </div>
            </div>
            <div>
              <img
                src="images/banner.png"
                alt="Bryant University Car Club banner featuring classic muscle car, exotic supercar, and modern sports car"
                className="w-full h-auto border border-neutral-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event Rules Section */}
      <section id="rules" className="bg-neutral-900 text-white py-20 border-y border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <i className="fa-solid fa-triangle-exclamation text-5xl mb-6" style={{ color: '#826E38' }}></i>
            <h2 className="text-4xl font-bold mb-4">Event Ground Rules</h2>
            <p className="text-xl text-neutral-300 text-pretty leading-relaxed">We are expecting hundreds of people to attend the show, so it is crucial to drive slow and be aware of your surroundings.</p>
          </div>
          <div className="bg-black border-2 p-8 mb-8" style={{ borderColor: '#826E38' }}>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#826E38' }}>WE WILL NOT TOLERATE RECKLESS OR OBNOXIOUS BEHAVIOR</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg">Donuts</span>
              </div>
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg">Burnouts</span>
              </div>
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg">Drag Racing</span>
              </div>
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg">Excessive Revving</span>
              </div>
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg">Loud Music</span>
              </div>
              <div className="flex gap-3 items-start">
                <i className="fa-solid fa-ban text-xl flex-shrink-0 mt-1" style={{ color: '#826E38' }}></i>
                <span className="text-lg font-bold">Drugs and Alcohol</span>
              </div>
            </div>
            <div className="text-center p-6 border-2 border-red-600 bg-red-950">
              <p className="text-xl font-bold text-red-200">If you are seen conducting any of this behavior, you will be asked to leave IMMEDIATELY!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="bg-neutral-50 py-20 border-y border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#826E38' }}>Event Timeline</div>
            <h2 className="text-4xl font-bold text-black mb-4">Schedule of Events</h2>
            <p className="text-neutral-600 text-lg">Coming Soon - April 2027</p>
          </div>
          <div className="bg-white border border-neutral-200">
            {schedule.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row gap-4 sm:gap-8 p-6 ${index !== schedule.length - 1 ? 'border-b border-neutral-200' : ''}`}
              >
                <div className="sm:w-32 flex-shrink-0">
                  <div className="text-lg font-bold tabular-nums" style={{ color: '#826E38' }}>{item.time}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black mb-1">{item.event}</div>
                  <div className="text-sm text-neutral-600">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#826E38' }}>Vehicle Showcase</div>
            <h2 className="text-4xl font-bold text-black mb-4">Vehicle Categories</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">Vehicles will be displayed across seven distinct categories, celebrating diversity in automotive excellence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="border border-neutral-200 p-8 hover:border-black transition-colors"
              >
                <i className={`fa-solid ${category.icon} text-4xl mb-4`} style={{ color: '#826E38' }}></i>
                <h3 className="text-xl font-bold text-black mb-2">{category.name}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="bg-neutral-50 py-20 border-y border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#826E38' }}>Join the Show</div>
            <h2 className="text-4xl font-bold text-black mb-4">Vehicle Registration</h2>
            <p className="text-neutral-600 text-lg">Register your vehicle to be part of this premier automotive showcase.</p>
          </div>
          <div className="bg-white border border-neutral-200 p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-circle-check text-6xl mb-6" style={{ color: '#826E38' }}></i>
                <h3 className="text-2xl font-bold text-black mb-2">Registration Submitted!</h3>
                <p className="text-neutral-600">Thank you for registering. We'll be in touch soon with more details.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Year *</label>
                    <input
                      type="text"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Make *</label>
                    <input
                      type="text"
                      name="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Model *</label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  >
                    <option value="">Select a category</option>
                    <option value="classic">Classic Cars</option>
                    <option value="muscle">Muscle Cars</option>
                    <option value="exotic">Exotic & Luxury</option>
                    <option value="modern">Modern Performance</option>
                    <option value="motorcycles">Motorcycles</option>
                    <option value="custom">Custom & Modified</option>
                    <option value="electric">Electric & Alternative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Additional Comments</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#826E38' }}
                >
                  Submit Registration
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section id="sponsors" className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#826E38' }}>Partnership Opportunities</div>
            <h2 className="text-4xl font-bold text-black mb-4">Sponsorship Inquiries</h2>
            <p className="text-neutral-600 text-lg">Support the Bryant University Car Show and connect with our community.</p>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-8">
            {isSponsorSubmitted ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-circle-check text-6xl mb-6" style={{ color: '#826E38' }}></i>
                <h3 className="text-2xl font-bold text-black mb-2">Inquiry Submitted!</h3>
                <p className="text-neutral-600">Thank you for your interest. We'll contact you soon to discuss partnership opportunities.</p>
              </div>
            ) : (
              <form onSubmit={handleSponsorSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={sponsorData.companyName}
                    onChange={handleSponsorInputChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={sponsorData.contactName}
                      onChange={handleSponsorInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={sponsorData.email}
                      onChange={handleSponsorInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={sponsorData.phone}
                    onChange={handleSponsorInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Sponsorship Level of Interest</label>
                  <select
                    name="sponsorshipLevel"
                    value={sponsorData.sponsorshipLevel}
                    onChange={handleSponsorInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  >
                    <option value="">Select a level</option>
                    <option value="platinum">Platinum Sponsor</option>
                    <option value="gold">Gold Sponsor</option>
                    <option value="silver">Silver Sponsor</option>
                    <option value="bronze">Bronze Sponsor</option>
                    <option value="inkind">In-Kind Donation</option>
                    <option value="other">Other/Discuss</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Message</label>
                  <textarea
                    name="message"
                    value={sponsorData.message}
                    onChange={handleSponsorInputChange}
                    rows="4"
                    placeholder="Tell us about your company and sponsorship interests..."
                    className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-black"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#826E38' }}
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="images/logo.png"
                  alt="Bryant Car Club Logo"
                  className="h-12 w-12"
                />
                <div>
                  <div className="font-bold">Bryant University</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: '#826E38' }}>Car Club</div>
                </div>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">Celebrating automotive excellence and bringing together the Bryant community through our shared passion for cars.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#826E38' }}>Contact</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p>Bryant University</p>
                <p>1150 Douglas Pike</p>
                <p>Smithfield, RI 02917</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#826E38' }}>Connect</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p>Email: carshow@bryant.edu</p>
                <p>Instagram: <a href="https://instagram.com/bryantcarclub2026" target="_blank" rel="noopener noreferrer" className="hover:text-white">@bryantcarclub2026</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
            <p>&copy; 2027 Bryant University Car Club. Est. 2026. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
