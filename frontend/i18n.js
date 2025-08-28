import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        login: "Login",
        signup: "Sign Up",
        profile: "Profile",
        dashboard: "Dashboard",
        logout: "Logout",
        complaints: "Complaints",
        track: "Track",
        language: "Language"
      },
      // Home page
      home: {
        title: "Public Grievance Management System",
        subtitle: "Your Voice Matters - Report, Track, and Resolve Community Issues",
        description: "A digital platform to register complaints, track progress, and ensure transparent resolution of public grievances.",
        registerComplaint: "Register Complaint",
        trackComplaint: "Track Complaint",
        features: {
          title: "Key Features",
          easy: {
            title: "Easy Registration",
            description: "Simple and user-friendly complaint registration process"
          },
          realtime: {
            title: "Real-time Tracking",
            description: "Track your complaint status and updates in real-time"
          },
          transparent: {
            title: "Transparent Process",
            description: "Complete transparency in complaint handling and resolution"
          },
          multilingual: {
            title: "Multilingual Support",
            description: "Available in multiple local languages for better accessibility"
          }
        }
      },
      // Complaint forms
      complaint: {
        register: "Register Complaint",
        title: "Complaint Title",
        titlePlaceholder: "Brief title of your complaint",
        department: "Select Department",
        selectDepartment: "Choose relevant department",
        description: "Description",
        descriptionPlaceholder: "Describe your complaint in detail. You can type or click the microphone icon to speak.",
        priority: "Priority Level",
        location: "Location",
        locationPlaceholder: "Enter complaint location",
        submit: "Submit Complaint",
        submitting: "Submitting...",
        success: "Complaint registered successfully!",
        error: "Failed to register complaint. Please try again.",
        track: "Track Complaint",
        complaintNumber: "Complaint Number",
        trackPlaceholder: "Enter your complaint number",
        trackButton: "Track Status",
        area: "Area/Locality",
        areaPlaceholder: "Enter your area or locality",
        landmark: "Landmark",
        landmarkPlaceholder: "Enter nearby landmark",
        severity: "Severity",
        additionalInfo: "Additional Information",
        additionalInfoPlaceholder: "Any additional details...",
        timing: "Timing of Issue",
        timingPlaceholder: "When does this issue occur?",
        frequentIssue: "Is this a frequent issue?",
        wastageObserved: "Water wastage observed?",
        electricityIssue: "Electricity Issue Details",
        waterIssue: "Water Supply Issue Details",
        roadIssue: "Road/Infrastructure Issue Details",
        sanitationIssue: "Sanitation Issue Details",
        otherIssue: "Other Issue Details",
        yes: "Yes",
        no: "No",
        selectOption: "Select an option",
        formFill: "Form Fill",
        chatAssistant: "Chat Assistant",
        useVoice: "Use Voice Input",
        required: "This field is required"
      },
      // Auth pages
      auth: {
        login: "Login",
        signup: "Sign Up", 
        citizenLogin: "Citizen Login",
        departmentLogin: "Department Login",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        name: "Full Name",
        phone: "Phone Number",
        address: "Address",
        enterCredentials: "Enter your credentials to access your account",
        createAccount: "Create your citizen account",
        loginButton: "Login",
        signupButton: "Sign Up",
        signingIn: "Signing in...",
        signingUp: "Creating account...",
        forgotPassword: "Forgot Password?",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        signupHere: "Sign up here",
        loginHere: "Login here",
        emailRequired: "Email is required",
        passwordRequired: "Password is required",
        nameRequired: "Name is required",
        phoneRequired: "Phone number is required",
        validEmail: "Please enter a valid email",
        passwordMin: "Password must be at least 6 characters"
      },
      // Departments
      departments: {
        Electricity: "Electricity",
        Water: "Water Supply",
        Roads: "Roads & Infrastructure",
        Sanitation: "Sanitation",
        Parks: "Parks & Recreation",
        Health: "Health Services",
        Education: "Education",
        Transportation: "Transportation",
        Building: "Building & Construction",
        Environment: "Environment",
        Other: "Other"
      },
      // Status
      status: {
        open: "Open",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed",
        rejected: "Rejected"
      },
      // Priority
      priority: {
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical"
      },
      // Common
      common: {
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        date: "Date",
        time: "Time",
        status: "Status",
        action: "Action",
        details: "Details",
        update: "Update",
        send: "Send",
        reply: "Reply",
        chat: "Chat",
        message: "Message",
        typing: "Typing..."
      },
      // Chat
      chat: {
        title: "Chat Support",
        placeholder: "Type your message...",
        send: "Send Message",
        online: "Online",
        offline: "Offline",
        connected: "Connected",
        disconnected: "Disconnected",
        userJoined: "User joined the chat",
        userLeft: "User left the chat",
        closeRequest: "Close Request",
        closeComplaint: "Close Complaint",
        requestClose: "Request Close",
        acceptClose: "Accept & Close",
        rejectClose: "Reject Close",
        closeReason: "Reason for closure",
        closeResponse: "Your response",
        welcomeMessage: "Welcome to the Grievance Portal! Please describe your issue."
      },
      // Tracking
      tracking: {
        title: "Track Complaint",
        complaintDetails: "Complaint Details",
        status: "Status",
        submittedOn: "Submitted On",
        lastUpdated: "Last Updated",
        noComplaints: "No complaint found",
        fetchError: "Failed to fetch complaint details",
        backToHome: "Back to Home",
        chatWithDept: "Chat with Department",
        priority: "Priority",
        department: "Department",
        description: "Description",
        location: "Location",
        complaintId: "Complaint ID",
        timeline: "Timeline",
        responseFromDept: "Response from Department"
      }
    }
  },
  hi: {
    translation: {
      // Navigation - Hindi
      nav: {
        home: "मुख्य पृष्ठ",
        login: "लॉग इन",
        signup: "साइन अप",
        profile: "प्रोफाइल",
        dashboard: "डैशबोर्ड",
        logout: "लॉग आउट",
        complaints: "शिकायतें",
        track: "ट्रैक करें",
        language: "भाषा"
      },
      // Home page - Hindi
      home: {
        title: "जन शिकायत प्रबंधन प्रणाली",
        subtitle: "आपकी आवाज़ मायने रखती है - रिपोर्ट करें, ट्रैक करें और सामुदायिक समस्याओं का समाधान करें",
        description: "शिकायत दर्ज करने, प्रगति ट्रैक करने और जन शिकायतों के पारदर्शी समाधान को सुनिश्चित करने के लिए एक डिजिटल प्लेटफॉर्म।",
        registerComplaint: "शिकायत दर्ज करें",
        trackComplaint: "शिकायत ट्रैक करें",
        features: {
          title: "मुख्य विशेषताएं",
          easy: {
            title: "आसान पंजीकरण",
            description: "सरल और उपयोगकर्ता-अनुकूल शिकायत पंजीकरण प्रक्रिया"
          },
          realtime: {
            title: "रीयल-टाइम ट्रैकिंग",
            description: "अपनी शिकायत की स्थिति और अपडेट को रीयल-टाइम में ट्रैक करें"
          },
          transparent: {
            title: "पारदर्शी प्रक्रिया",
            description: "शिकायत निपटान और समाधान में पूर्ण पारदर्शिता"
          },
          multilingual: {
            title: "बहुभाषी समर्थन",
            description: "बेहतर पहुंच के लिए कई स्थानीय भाषाओं में उपलब्ध"
          }
        }
      },
      // Complaint forms - Hindi
      complaint: {
        register: "शिकायत दर्ज करें",
        title: "शिकायत का शीर्षक",
        titlePlaceholder: "अपनी शिकायत का संक्षिप्त शीर्षक",
        department: "विभाग चुनें",
        selectDepartment: "संबंधित विभाग चुनें",
        description: "विवरण",
        descriptionPlaceholder: "अपनी शिकायत का विस्तार से वर्णन करें। आप टाइप कर सकते हैं या बोलने के लिए माइक्रोफोन आइकन पर क्लिक कर सकते हैं।",
        priority: "प्राथमिकता स्तर",
        location: "स्थान",
        locationPlaceholder: "शिकायत का स्थान दर्ज करें",
        submit: "शिकायत जमा करें",
        submitting: "जमा हो रहा है...",
        success: "शिकायत सफलतापूर्वक दर्ज हो गई!",
        error: "शिकायत दर्ज करने में विफल। कृपया पुनः प्रयास करें।",
        track: "शिकायत ट्रैक करें",
        complaintNumber: "शिकायत संख्या",
        trackPlaceholder: "अपनी शिकायत संख्या दर्ज करें",
        trackButton: "स्थिति ट्रैक करें",
        area: "क्षेत्र/इलाका",
        areaPlaceholder: "अपना क्षेत्र या इलाका दर्ज करें",
        landmark: "मील का पत्थर",
        landmarkPlaceholder: "नजदीकी मील का पत्थर दर्ज करें",
        severity: "गंभीरता",
        additionalInfo: "अतिरिक्त जानकारी",
        additionalInfoPlaceholder: "कोई अतिरिक्त विवरण...",
        timing: "समस्या का समय",
        timingPlaceholder: "यह समस्या कब होती है?",
        frequentIssue: "क्या यह एक बार-बार होने वाली समस्या है?",
        wastageObserved: "पानी की बर्बादी देखी गई?",
        electricityIssue: "बिजली की समस्या का विवरण",
        waterIssue: "पानी की आपूर्ति की समस्या का विवरण",
        roadIssue: "सड़क/बुनियादी ढांचे की समस्या का विवरण",
        sanitationIssue: "स्वच्छता की समस्या का विवरण",
        otherIssue: "अन्य समस्या का विवरण",
        yes: "हाँ",
        no: "नहीं",
        selectOption: "एक विकल्प चुनें",
        formFill: "फॉर्म भरें",
        chatAssistant: "चैट सहायक",
        useVoice: "वॉइस इनपुट का उपयोग करें",
        required: "यह फील्ड आवश्यक है"
      },
      // Auth pages - Hindi
      auth: {
        login: "लॉग इन",
        signup: "साइन अप",
        citizenLogin: "नागरिक लॉगिन",
        departmentLogin: "विभाग लॉगिन",
        email: "ईमेल",
        password: "पासवर्ड",
        confirmPassword: "पासवर्ड की पुष्टि करें",
        name: "पूरा नाम",
        phone: "फोन नंबर",
        address: "पता",
        enterCredentials: "अपने खाते तक पहुंचने के लिए अपनी जानकारी दर्ज करें",
        createAccount: "अपना नागरिक खाता बनाएं",
        loginButton: "लॉग इन करें",
        signupButton: "साइन अप करें",
        signingIn: "साइन इन हो रहा है...",
        signingUp: "खाता बनाया जा रहा है...",
        forgotPassword: "पासवर्ड भूल गए?",
        noAccount: "कोई खाता नहीं है?",
        haveAccount: "पहले से खाता है?",
        signupHere: "यहां साइन अप करें",
        loginHere: "यहां लॉगिन करें",
        emailRequired: "ईमेल आवश्यक है",
        passwordRequired: "पासवर्ड आवश्यक है",
        nameRequired: "नाम आवश्यक है",
        phoneRequired: "फोन नंबर आवश्यक है",
        validEmail: "कृपया एक वैध ईमेल दर्ज करें",
        passwordMin: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए"
      },
      // Departments - Hindi
      departments: {
        Electricity: "बिजली",
        Water: "जल आपूर्ति",
        Roads: "सड़क और बुनियादी ढांचा",
        Sanitation: "स्वच्छता",
        Parks: "पार्क और मनोरंजन",
        Health: "स्वास्थ्य सेवाएं",
        Education: "शिक्षा",
        Transportation: "परिवहन",
        Building: "भवन और निर्माण",
        Environment: "पर्यावरण",
        Other: "अन्य"
      },
      // Status - Hindi
      status: {
        open: "खुला",
        in_progress: "प्रगति में",
        resolved: "हल हो गया",
        closed: "बंद",
        rejected: "अस्वीकृत"
      },
      // Priority - Hindi
      priority: {
        low: "कम",
        medium: "मध्यम",
        high: "उच्च",
        critical: "गंभीर"
      },
      // Common - Hindi
      common: {
        loading: "लोड हो रहा है...",
        error: "एक त्रुटि हुई",
        success: "सफलता",
        cancel: "रद्द करें",
        confirm: "पुष्टि करें",
        save: "सहेजें",
        edit: "संपादित करें",
        delete: "हटाएं",
        close: "बंद करें",
        back: "वापस",
        next: "अगला",
        previous: "पिछला",
        search: "खोजें",
        filter: "फिल्टर",
        sort: "क्रमबद्ध करें",
        date: "तारीख",
        time: "समय",
        status: "स्थिति",
        action: "कार्रवाई",
        details: "विवरण",
        update: "अपडेट",
        send: "भेजें",
        reply: "जवाब दें",
        chat: "चैट",
        message: "संदेश",
        typing: "टाइप कर रहे हैं..."
      },
      // Chat - Hindi
      chat: {
        title: "चैट सहायता",
        placeholder: "अपना संदेश टाइप करें...",
        send: "संदेश भेजें",
        online: "ऑनलाइन",
        offline: "ऑफलाइन",
        connected: "जुड़ा हुआ",
        disconnected: "डिस्कनेक्ट हो गया",
        userJoined: "उपयोगकर्ता चैट में शामिल हुआ",
        userLeft: "उपयोगकर्ता ने चैट छोड़ा",
        closeRequest: "बंद करने का अनुरोध",
        closeComplaint: "शिकायत बंद करें",
        requestClose: "बंद करने का अनुरोध",
        acceptClose: "स्वीकार करें और बंद करें",
        rejectClose: "अस्वीकार करें",
        closeReason: "बंद करने का कारण",
        closeResponse: "आपका जवाब",
        welcomeMessage: "शिकायत पोर्टल में आपका स्वागत है! कृपया अपनी समस्या का वर्णन करें।"
      },
      // Tracking - Hindi
      tracking: {
        title: "शिकायत ट्रैक करें",
        complaintDetails: "शिकायत का विवरण",
        status: "स्थिति",
        submittedOn: "जमा किया गया",
        lastUpdated: "अंतिम अपडेट",
        noComplaints: "कोई शिकायत नहीं मिली",
        fetchError: "शिकायत का विवरण लाने में विफल",
        backToHome: "मुख्य पृष्ठ पर वापस जाएं",
        chatWithDept: "विभाग के साथ चैट करें",
        priority: "प्राथमिकता",
        department: "विभाग",
        description: "विवरण",
        location: "स्थान",
        complaintId: "शिकायत आईडी",
        timeline: "समयरेखा",
        responseFromDept: "विभाग से जवाब"
      }
    }
  },
  gu: {
    translation: {
      // Navigation - Gujarati
      nav: {
        home: "મુખ્ય પૃષ્ઠ",
        login: "લૉગ ઇન",
        signup: "સાઇન અપ",
        profile: "પ્રોફાઇલ",
        dashboard: "ડેશબોર્ડ",
        logout: "લૉગ આઉટ",
        complaints: "ફરિયાદો",
        track: "ટ્રેક કરો",
        language: "ભાષા"
      },
      // Home page - Gujarati
      home: {
        title: "જાહેર ફરિયાદ વ્યવસ્થાપન સિસ્ટમ",
        subtitle: "તમારી અવાજ મહત્વની છે - રિપોર્ટ કરો, ટ્રેક કરો અને કોમ્યુનિટી સમસ્યાઓનો ઉકેલ લાવો",
        description: "ફરિયાદ નોંધાવવા, પ્રગતિ ટ્રેક કરવા અને જાહેર ફરિયાદોના પારદર્શી નિરાકરણ માટેનું ડિજિટલ પ્લેટફોર્મ.",
        registerComplaint: "ફરિયાદ નોંધાવો",
        trackComplaint: "ફરિયાદ ટ્રેક કરો",
        features: {
          title: "મુખ્ય વિશેષતાઓ",
          easy: {
            title: "સરળ નોંધણી",
            description: "સરળ અને વપરાશકર્તા-મૈત્રીપૂર્ણ ફરિયાદ નોંધણી પ્રક્રિયા"
          },
          realtime: {
            title: "રીઅલ-ટાઇમ ટ્રેકિંગ",
            description: "તમારી ફરિયાદની સ્થિતિ અને અપડેટ્સને રીઅલ-ટાઇમમાં ટ્રેક કરો"
          },
          transparent: {
            title: "પારદર્શી પ્રક્રિયા",
            description: "ફરિયાદ નિવારણ અને સમાધાનમાં સંપૂર્ણ પારદર્શિતા"
          },
          multilingual: {
            title: "બહુભાષી સપોર્ટ",
            description: "વધુ સારી પહોંચ માટે બહુવિધ સ્થાનિક ભાષાઓમાં ઉપલબ્ધ"
          }
        }
      },
      // Add more translations...
      complaint: {
        register: "ફરિયાદ નોંધાવો",
        title: "ફરિયાદનું શીર્ષક",
        titlePlaceholder: "તમારી ફરિયાદ માટે ટૂંકું શીર્ષક",
        department: "વિભાગ પસંદ કરો",
        selectDepartment: "સંબંધિત વિભાગ પસંદ કરો",
        description: "વર્ણન",
        descriptionPlaceholder: "તમારી ફરિયાદનું વિગતવાર વર્ણન કરો...",
        priority: "પ્રાથમિકતા સ્તર",
        location: "સ્થાન",
        locationPlaceholder: "ફરિયાદનું સ્થાન દાખલ કરો",
        submit: "ફરિયાદ સબમિટ કરો",
        submitting: "સબમિટ થઈ રહ્યું છે...",
        success: "ફરિયાદ સફળતાપૂર્વક નોંધાઈ!",
        error: "ફરિયાદ નોંધાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.",
        track: "ફરિયાદ ટ્રેક કરો",
        complaintNumber: "ફરિયાદ નંબર",
        trackPlaceholder: "તમારો ફરિયાદ નંબર દાખલ કરો",
        trackButton: "સ્થિતિ ટ્રેક કરો"
      },
      // Add common, status, priority, departments, chat translations...
      common: {
        loading: "લોડ થઈ રહ્યું છે...",
        error: "એરર આવ્યો છે",
        success: "સફળતા",
        cancel: "રદ કરો",
        confirm: "પુષ્ટિ કરો",
        save: "સેવ કરો",
        edit: "એડિટ કરો",
        delete: "ડિલીટ કરો",
        close: "બંધ કરો",
        back: "પાછળ",
        next: "આગળ",
        previous: "પહેલાનું",
        search: "શોધો",
        filter: "ફિલ્ટર",
        sort: "સોર્ટ કરો",
        date: "તારીખ",
        time: "સમય",
        status: "સ્થિતિ",
        action: "ક્રિયા",
        details: "વિગતો",
        update: "અપડેટ",
        send: "મોકલો",
        reply: "જવાબ આપો",
        chat: "ચેટ",
        message: "સંદેશ",
        typing: "ટાઈપ કરી રહ્યા છે..."
      }
    }
  },
  mr: {
    translation: {
      // Navigation - Marathi
      nav: {
        home: "मुख्य पृष्ठ",
        login: "लॉग इन",
        signup: "साइन अप",
        profile: "प्रोफाइल",
        dashboard: "डॅशबोर्ड",
        logout: "लॉग आउट",
        complaints: "तक्रारी",
        track: "ट्रॅक करा",
        language: "भाषा"
      },
      // Home page - Marathi
      home: {
        title: "सार्वजनिक तक्रार व्यवस्थापन प्रणाली",
        subtitle: "तुमचा आवाज महत्त्वाचा आहे - तक्रार नोंदवा, ट्रॅक करा आणि सामुदायिक समस्यांचे निराकरण करा",
        description: "तक्रार नोंदवण्यासाठी, प्रगती ट्रॅक करण्यासाठी आणि सार्वजनिक तक्रारींचे पारदर्शी निराकरण सुनिश्चित करण्यासाठी एक डिजिटल प्लॅटफॉर्म.",
        registerComplaint: "तक्रार नोंदवा",
        trackComplaint: "तक्रार ट्रॅक करा",
        features: {
          title: "मुख्य वैशिष्ट्ये",
          easy: {
            title: "सोपी नोंदणी",
            description: "सोपी आणि वापरकर्ता-अनुकूल तक्रार नोंदणी प्रक्रिया"
          },
          realtime: {
            title: "रिअल-टाइम ट्रॅकिंग",
            description: "तुमच्या तक्रारीची स्थिती आणि अपडेट्स रिअल-टाइममध्ये ट्रॅक करा"
          },
          transparent: {
            title: "पारदर्शक प्रक्रिया",
            description: "तक्रार निवारण आणि निराकरणामध्ये संपूर्ण पारदर्शकता"
          },
          multilingual: {
            title: "बहुभाषिक समर्थन",
            description: "चांगल्या पोहोचासाठी अनेक स्थानिक भाषांमध्ये उपलब्ध"
          }
        }
      },
      // Add more translations...
      complaint: {
        register: "तक्रार नोंदवा",
        title: "तक्रारीचे शीर्षक",
        titlePlaceholder: "तुमच्या तक्रारीसाठी थोडक्यात शीर्षक",
        department: "विभाग निवडा",
        selectDepartment: "संबंधित विभाग निवडा",
        description: "वर्णन",
        descriptionPlaceholder: "तुमच्या तक्रारीचे तपशीलवार वर्णन करा...",
        priority: "प्राधान्य स्तर",
        location: "स्थान",
        locationPlaceholder: "तक्रारीचे स्थान प्रविष्ट करा",
        submit: "तक्रार सबमिट करा",
        submitting: "सबमिट होत आहे...",
        success: "तक्रार यशस्वीरित्या नोंदली!",
        error: "तक्रार नोंदवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
        track: "तक्रार ट्रॅक करा",
        complaintNumber: "तक्रार क्रमांक",
        trackPlaceholder: "तुमचा तक्रार क्रमांक प्रविष्ट करा",
        trackButton: "स्थिती ट्रॅक करा"
      },
      common: {
        loading: "लोड होत आहे...",
        error: "एक त्रुटी आली",
        success: "यश",
        cancel: "रद्द करा",
        confirm: "पुष्टी करा",
        save: "जतन करा",
        edit: "संपादित करा",
        delete: "हटवा",
        close: "बंद करा",
        back: "मागे",
        next: "पुढे",
        previous: "मागील",
        search: "शोधा",
        filter: "फिल्टर",
        sort: "क्रमवारी लावा",
        date: "तारीख",
        time: "वेळ",
        status: "स्थिती",
        action: "कृती",
        details: "तपशील",
        update: "अपडेट",
        send: "पाठवा",
        reply: "उत्तर द्या",
        chat: "चॅट",
        message: "संदेश",
        typing: "टाइप करत आहे..."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
