'use client';
import { motion } from 'framer-motion';

export default function About() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: 'easeOut',
          },
        }),
      };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">     

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 py-12 text-white border-b-4 border-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About GrieveEase</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
            A Government of India initiative for efficient public grievance redressal
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-blue-700 hover:underline">Home</a> &gt;
            <span className="font-medium text-gray-800"> About Us</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 md:px-6 py-10 space-y-12">
        
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8"
>
<motion.div 
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }} className="bg-white p-6 rounded-lg border-l-4 border-blue-700 shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-700 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-800">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              <strong>GrieveEase</strong> aims to build a bridge between the government and citizens by offering
              a transparent, accessible, and accountable public grievance redressal system.
              Our platform leverages AI technologies and multilingual capabilities to ensure quick and effective resolution of grievances.
            </p>
          </motion.div>
          
          <motion.div
          initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg border-l-4 border-green-600 shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-700">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To create a citizen-first digital ecosystem where every voice is heard, every concern matters,
              and resolution is just a click away — making governance more inclusive, efficient, and accountable.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <div>
        <motion.div 
                initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0} className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800 inline-block border-b-2 border-yellow-500 pb-2">Core Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['Transparency', 'Every step in the grievance process is visible and verifiable to ensure accountability and build trust.', 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'],
              ['Accessibility', 'Designed to serve citizens across languages and digital literacy levels, ensuring no one is left behind.', 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'],
              ['Efficiency', 'AI-powered support ensures fast and intelligent handling of complaints for prompt resolution.', 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'],
            ].map(([title, desc, svg], index) => (
                <motion.div 
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={index + 1}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-6 transition hover:shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={svg} />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-blue-700 text-center mb-3">{title}</h3>
                <p className="text-gray-600 text-center">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-500 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-800">Portal Features</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'AI-enabled chatbot for fast grievance submission and assistance',
              'Real-time tracking of complaint status and resolution',
              'Support for multiple Indian languages',
              'Mobile-friendly and responsive interface',
              'Email and SMS notifications for key updates',
              'Government official dashboard for efficient redressal',
              'Secure authentication for citizen privacy',
              'Analytics and reports for governance improvement'
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="mt-1 mr-3 text-green-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
        <motion.div 
                initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800 inline-block border-b-2 border-yellow-500 pb-2">Our Team</h2>
            <p className="text-gray-600 mt-2">Meet the talented individuals behind GrieveEase</p>
          </motion.div>
          
          {/* Mentors */}
          <div className="mb-10" >
            <h3 className="text-xl font-semibold text-blue-700 mb-6 border-l-4 border-green-600 pl-3">Project Mentor</h3>
            <motion.div 
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 1 }} className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-md flex p-4 transition hover:shadow-lg">
                  <div className="mr-4 flex-shrink-0">
                    <img src="https://www.kiet.edu/uploads/faculty/549537836.jpg" alt="Mentor Image" className="w-20 h-20 rounded-full object-cover border-2 border-green-100" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Ms. Arti Sharma</h4>
                    <p className="text-green-600 text-sm font-medium">Project Guide</p>
                    <p className="text-gray-500 text-xs mt-1">Computer Science</p>
                  </div>
                </div>
            </motion.div>
          </div>

          {/* Team Members */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-blue-700 mb-6 border-l-4 border-blue-700 pl-3">Development Team</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {image:``, name: 'Adarsh Tiwari', role: 'Backend & ML Developer', dept: 'Computer Science', github: 'github-username-4', linkedin: 'linkedin-username-4'},
                {image:``, name: 'Aditi Gupta', role: 'ML Developer', dept: 'Computer Science', github: 'github-username-4', linkedin: 'linkedin-username-4'},
                {image:``, name: 'Anmol', role: 'Frontend Developer | UI/UX Designer', dept: 'Computer Science', github: 'github-username-4', linkedin: 'linkedin-username-4'},
                {image:`images/pratyush.jpg`, name: 'Pratyush Sharma', role: 'FullStack Developer', dept: 'Computer Science', github: 'pratyush2529', linkedin: 'pratyushsharma2529'}
              ].map((member, index) => (
                <motion.div 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={index + 1}
                className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden transition hover:shadow-lg">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full object-cover border-4 border-white" />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-lg font-bold text-blue-800">{member.name}</h4>
                    <p className="text-blue-600 text-sm font-medium">{member.role}</p>
                    <p className="text-gray-500 text-xs mt-1">{member.dept}</p>
                    <div className="mt-3 flex justify-center space-x-3">
                      <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                      <a href={`https://linkedin.com/in/${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
         
        </div>

        {/* Official Certification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-blue-100 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-800">Government Certified Initiative</h3>
            <p className="text-sm text-gray-600">
              This project is developed in collaboration with the Ministry of Electronics & Information Technology
              under the Digital India Programme.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}