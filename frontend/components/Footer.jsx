const Footer = () => {
    return (
      <footer className="bg-blue-900 text-white py-8 border-t-4 border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-300">GrieveEase</h3>
              <p className="text-sm text-blue-200">
                A Government of India initiative for public grievance redressal
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-300">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-blue-200 hover:text-white">Home</a></li>
                <li><a href="/profile" className="text-blue-200 hover:text-white">Profile</a></li>
                <li><a href="/complaint/register" className="text-blue-200 hover:text-white">File a Grievance</a></li>
                <li><a href="/" className="text-blue-200 hover:text-white">Track Complaint</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-300">Contact</h3>
              <p className="text-sm text-blue-200">
                Ministry of Electronics & IT<br />
                Electronics Niketan, 6, CGO Complex<br />
                Lodhi Road, New Delhi - 110003<br />
                <span className="block mt-2">helpdesk@grievease.gov.in</span>
              </p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-6 pt-6 text-center text-xs text-blue-300">
            © 2025 Government of India | GrieveEase Public Grievance Portal | Last Updated: April 2025
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  