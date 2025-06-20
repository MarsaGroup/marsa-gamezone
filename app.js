// React और ReactDOM अब index.html में <script> टैग्स के माध्यम से विश्वव्यापी रूप से लोड होते हैं।
// हम उनके विधियों को सीधे विश्वव्यापी 'React' और 'ReactDOM' वस्तुओं से एक्सेस कर सकते हैं।
const { useState, useEffect, createContext, useContext } = React;

// महत्वपूर्ण: आपको इन प्लेसहोल्डर मानों को अपने वास्तविक Firebase प्रोजेक्ट कॉन्फ़िगरेशन से बदलना होगा।
// यह सुनिश्चित करें कि आप < और > सहित प्लेसहोल्डर को कॉपी न करें, बल्कि केवल डबल कोट्स के अंदर वास्तविक स्ट्रिंग मान पेस्ट करें।
// उदाहरण: "AIzaSyC..." को कॉपी करें, न कि "<AIzaSyC...>"
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY", // उदाहरण: "AIzaSyCaiF3c6Jt4xN5yZ6w7V8U9a0b1c2d3e4f5"
    authDomain: "YOUR_AUTH_DOMAIN", // उदाहरण: "your-project-id.firebaseapp.com"
    projectId: "YOUR_PROJECT_ID",   // उदाहरण: "your-project-id"
    storageBucket: "YOUR_STORAGE_BUCKET", // उदाहरण: "your-project-id.appspot.com"
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // उदाहरण: "123456789012"
    appId: "YOUR_FIREBASE_APP_ID" // उदाहरण: "1:123456789012:web:abcdef1234567890abcdef"
};

// यह 'appId' आपके Firestore पथों को संरचित करने के लिए उपयोग किया जाता है (उदाहरण: 'artifacts/your-app-id')।
// एक अद्वितीय, सरल स्ट्रिंग चुनें जो आपके एप्लिकेशन के डेटा की पहचान करता है।
const appId = 'export-import-system-v1'; // अनुशंसितम्: एतत् स्वकीयस्य ऐपस्य डेटा-कृते अद्वितीय-परिचायकत्वेन स्थाप्यताम्।

// GitHub Pages अथवा सामान्य-परियोजना-प्रयोगेषु initialAuthToken सामान्यतः null भवेत्।
// अस्य मुख्यतया Canvas इव विशिष्टेषु परिवेशेषु प्रारम्भिक-प्रमाणीकरणाय उपयोगः क्रियते।
const initialAuthToken = null;

// Firebase पुस्तकालयः अपि वैश्विकरूपेण स्व-compat संस्करणेषु लोड भवन्ति।
// वयं तेषां कार्याणि साक्षात् वैश्विक 'firebase' वस्तुतः एक्सेस कर्तुं शक्नुमः।
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebaseApp.auth();
const db = firebaseApp.firestore();

// उपयोगकर्ता-प्रमाणीकरणाय Firestore-सेवाभ्यः च एकं सन्दर्भं सृज्यताम्।
// यदि सन्दर्भः आदितः शून्यः स्यात् तर्हि विनष्टीकरण-दोषान् निवारयितुं एकं प्रारम्भिकं डिफ़ॉल्ट-वस्तु-मानं प्रदीयताम्।
const AuthContext = createContext({ user: null, auth: null, db: null, loading: true, isAuthReady: false });

// उपयोगकर्ता-स्थितिं Firebase-आरम्भं च प्रबन्धयितुं प्रमाणीकरण-प्रदायक-घटकः।
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false); // प्रमाणीकरण-सिद्धतां ज्ञातुं नवीना स्थितिः

    useEffect(() => {
        // Firebase प्रमाणीकरण-स्थिति-परिवर्तनस्य सदस्यतां गृह्यताम्।
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => { // 'auth.onAuthStateChanged' इति compat SDK तः उपयुज्यताम्।
            if (currentUser) {
                // यदि उपयोगकर्ता प्रमाणीकृतः अस्ति, तर्हि उपयोगकर्तां सेट करो।
                setUser(currentUser);
            } else {
                // यदि कोऽपि उपयोगकर्ताः नास्ति, तर्हि अनामिकरूपेण वा उपलब्धे सति कस्टम-टोकन-माध्यमेन वा साइन इन करो।
                try {
                    if (initialAuthToken) {
                        await auth.signInWithCustomToken(initialAuthToken); // 'auth.signInWithCustomToken' उपयुज्यताम्।
                    } else {
                        await auth.signInAnonymously(); // 'auth.signInAnonymously' उपयुज्यताम्।
                    }
                } catch (error) {
                    console.error("Firebase प्रमाणीकरणे त्रुटिः:", error);
                }
            }
            setIsAuthReady(true); // प्रमाणीकरण-स्थितिः अधुना प्रारम्भिक-परीक्षणानन्तरं सिद्धा अस्ति।
            setLoading(false); // प्रारम्भिक-प्रमाणीकरण-परीक्षणानन्तरं लोडिंग स्थगयतु।
        });

        // घटकस्य अनमाउन्ट-समये सदस्यतां निष्कासयतु।
        return () => unsubscribe();
    }, []); // श्रोतारम्भार्थं घटकस्य आरोहणे एकवारं केवलं प्रचालयतु।

    // उपयोगकर्तां, प्रमाणीकरण-अवस्थां, डेटाबेस-अवस्थां, भारण-स्थितिं, प्रमाणीकरण-सिद्धतां च बालेभ्यः प्रदीयताम्।
    return (
        <AuthContext.Provider value={{ user, auth, db, loading, isAuthReady }}>
            {children}
        </AuthContext.Provider>
    );
}

// AuthContext-मूल्यानि सुलभतया प्राप्तुं कस्टम-हुकः।
function useAuth() {
    return useContext(AuthContext);
}

// Firestore-सेवा-कार्याणि - केन्द्रीकृत-दत्तांश-संचालनानि।
const FirestoreService = {
    // स्वकीय-निजी-प्रोफाइल-संग्रहात् एकैकं उपयोगकर्ता-दस्तावेज़ं प्राप्नोति।
    getUser: async (userId) => {
        try {
            const userDocRef = db.collection(`artifacts/${appId}/users/${userId}/profile`).doc(userId); // compat सिंटैक्स उपयुज्यताम्।
            const userDocSnap = await userDocRef.get(); // compat सिंटैक्स उपयुज्यताम्।
            if (userDocSnap.exists) {
                return userDocSnap.data();
            } else {
                console.log("एतादृशं उपयोगकर्ता-दस्तावेज़ं नास्ति!");
                return null;
            }
        } catch (e) {
            console.error("उपयोगकर्ता-दस्तावेज़ं प्राप्तुं त्रुटिः:", e);
            return null;
        }
    },

    // नवीनं उपयोगकर्तां पञ्जीकरोति वा विद्यमानं अद्यतनीकरोति वा।
    // सार्वजनिक-दत्तांशेषु अद्वितीय-योग्यता/लाइसेंस-परिचय-परीक्षणमपि अन्तर्भवति।
    registerUser: async (userId, userData) => {
        try {
            // यदि योग्यता/लाइसेंस-परिचयः प्रदत्तः अस्ति, तर्हि वैश्विकरूपेण सः पूर्वमेव विद्यते वा न वा इति परीक्ष्यताम्।
            if (userData.qualificationLicenseId) {
                const licenseQuery = db.collection(`artifacts/${appId}/public/data/users`).where("qualificationLicenseId", "==", userData.qualificationLicenseId); // compat सिंटैक्स उपयुज्यताम्।
                const querySnapshot = await licenseQuery.get(); // compat सिंटैक्स उपयुज्यताम्।
                if (!querySnapshot.empty) {
                    // यदि अस्याः लाइसेंस-परिचयस्य एकं दस्तावेज़ं पूर्वमेव विद्यते चेत्, सः च वर्तमान-उपयोगकर्ता-दस्तावेज़ं न स्यात्।
                    for (const doc of querySnapshot.docs) {
                        if (doc.id !== userId) {
                            console.error("लाइसेंस/योग्यता-परिचयः पूर्वमेव पञ्जीकृतः अस्ति।");
                            return { success: false, message: "लाइसेंस/योग्यता-परिचयः पूर्वमेव पञ्जीकृतः अस्ति।" };
                        }
                    }
                }
            }

            // निजी-उपयोगकर्ता-प्रोफाइल-दत्तांशाय पथः (केवल विशिष्ट-उपयोगकर्त्रा पठनीयः/लेखनीयः)।
            const privateUserDocRef = db.collection(`artifacts/${appId}/users/${userId}/profile`).doc(userId); // compat सिंटैक्स उपयुज्यताम्।
            await privateUserDocRef.set(userData, { merge: true }); // compat सिंटैक्स उपयुज्यताम्।

            // सार्वजनिक-उपयोगकर्ता-दत्तांशाय पथः (सर्वेभ्यः प्रमाणीकृतेभ्यः उपयोक्तृभ्यः सुलभः, अद्वितीय-परीक्षणाय/अन्वेषणाय)।
            const publicUserDocRef = db.collection(`artifacts/${appId}/public/data/users`).doc(userId); // compat सिंटैक्स उपयुज्यताम्।
            await publicUserDocRef.set({ ...userData, userId: userId }, { merge: true }); // compat सिंटैक्स उपयुज्यताम्।

            return { success: true, message: "उपयोगकर्ताः सफलतापूर्वकं पञ्जीकृतः!" };
        } catch (e) {
            console.error("उपयोगकर्तां पञ्जीकरोतुं त्रुटिः:", e);
            return { success: false, message: e.message || "उपयोगकर्तां पञ्जीकरोतुं विफलः।" };
        }
    },

    // सार्वजनिक-दत्तांश-संग्रहात् सर्वान् उपयोगकर्तान् प्राप्नोति (प्रशासक/दल-अवलोकनार्थम्)।
    getAllUsers: async () => {
        try {
            const usersColRef = db.collection(`artifacts/${appId}/public/data/users`); // compat सिंटैक्स उपयुज्यताम्।
            const querySnapshot = await usersColRef.get(); // compat सिंटैक्स उपयुज्यताम्।
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data());
            });
            return users;
        } catch (e) {
            console.error("सर्वान् उपयोगकर्तान् प्राप्तुं त्रुटिः:", e);
            return [];
        }
    }
};

// --- UI-कृते React-घटकाः ---

// मूल-संदेश-मोडल-घटकः।
function MessageModal({ message, onClose }) {
    if (!message) return null; // यदि कोऽपि संदेशः नास्ति तर्हि रेंडर मा कुरु।
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
                <p className="text-gray-800 text-lg mb-4 text-center">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    पिधत्तु
                </button>
            </div>
        </div>
    );
}

// उपयोगकर्ता-पञ्जीकरण-पत्रक-घटकः।
function RegistrationForm({ onRegisterSuccess }) {
    const { user, isAuthReady } = useAuth(); // सन्दर्भात् उपयोगकर्तां प्रमाणीकरण-सिद्धतां च प्राप्नुहि।
    const [formData, setFormData] = useState({
        email: '',
        whatsapp: '',
        registrationNo: '',
        role: 'user', // नूतन-पञ्जीकरणार्थं मूलभूत-भूमिका।
        qualificationLicenseId: '' // विशिष्ट-भूमिकाभ्यः क्षेत्रम्।
    });
    const [formMessage, setFormMessage] = useState(''); // मोडाले प्रदर्शयितुं संदेशः।
    const [isSubmitting, setIsSubmitting] = useState(false); // पत्रक-प्रस्तुति-भारणार्थं स्थितिः।

    // ड्रॉपडाउन-कृते पूर्वनिर्धारिताः भूमिकाः।
    const roles = [
        { value: 'user', label: 'उपयोगकर्ता (क्रेता/विक्रेता)' },
        { value: 'accountant', label: 'लेखाकारः' },
        { value: 'arbitrator', label: 'मध्यस्थः' },
        { value: 'surveyor', label: 'सर्वेक्षकः' },
        { value: 'transporter', label: 'वाहकः' },
        { value: 'logistics', label: 'रसदः' },
        { value: 'customHandlingAgent', label: 'शुल्क-हस्तगत-अभिकर्ता' },
        { value: 'insuranceAgent', label: 'बीमा-अभिकर्ता' },
    ];

    // प्रमाणीकरण-सिद्धे उपयोगकर्ता-उपलब्धे च सति विद्यमान-उपयोगकर्ता-दत्तांशं लोड कर्तुं प्रभावः।
    useEffect(() => {
        if (isAuthReady && user) {
            FirestoreService.getUser(user.uid).then(existingData => {
                if (existingData) {
                    setFormData(existingData);
                    setFormMessage('स्वागतम्! भवतः प्रोफाइलः लोड कृतः अस्ति।');
                }
            });
        }
    }, [user, isAuthReady]); // निर्भरताः: यदि उपयोगकर्ता वा प्रमाणीकरण-सिद्धता परिवर्तते तर्हि पुनः प्रचालयतु।

    // पत्रक-निवेश-क्षेत्रेषु परिवर्तनानि प्रबन्धयति।
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // पत्रक-प्रस्तुतिं प्रबन्धयति।
    const handleSubmit = async (e) => {
        e.preventDefault(); // मूलभूत-पत्रक-प्रस्तुति-व्यवहारं निवारयतु।
        setFormMessage(''); // पूर्व-संदेशान् शुद्धयतु।
        setIsSubmitting(true); // प्रस्तुति-स्थितिं सेट करो।

        if (!user) {
            setFormMessage('प्रमाणीकरणं सिद्धं नास्ति। कृपया पुनः प्रयास करो।');
            setIsSubmitting(false);
            return;
        }

        // उपयोगकर्तां पञ्जीकर्तुं/अद्यतनीकर्तुं Firestore-सेवां आह्वयतु।
        const result = await FirestoreService.registerUser(user.uid, formData);
        if (result.success) {
            setFormMessage(result.message);
            if (onRegisterSuccess) {
                onRegisterSuccess(formData); // सफले सति मूलस्य कॉलबैक करो।
            }
        } else {
            setFormMessage(result.message);
        }
        setIsSubmitting(false); // प्रस्तुति-स्थितिं पुनः सेट करो।
    };

    // चयनित-भूमिकायाः आधारेण योग्यता/लाइसेंस-परिचय-क्षेत्रस्य आवश्यकता अस्ति वा न वा इति निर्धारयतु।
    const needsQualification = ['surveyor', 'transporter', 'logistics', 'customHandlingAgent', 'insuranceAgent'].includes(formData.role);

    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">उपयोगकर्ता-पञ्जीकरणम्</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">ईमेल</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">व्हाट्सएप संख्या</label>
                    <input
                        type="text"
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700">विक्रय-कर / वैट / जीएसटी संख्या</label>
                    <input
                        type="text"
                        id="registrationNo"
                        name="registrationNo"
                        value={formData.registrationNo}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">भवतः भूमिका</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {roles.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>

                {needsQualification && (
                    <div>
                        <label htmlFor="qualificationLicenseId" className="block text-sm font-medium text-gray-700">
                            योग्यता / लाइसेंस परिचय (उदा: सर्वेक्षक लाइसेंस संख्या)
                        </label>
                        <input
                            type="text"
                            id="qualificationLicenseId"
                            name="qualificationLicenseId"
                            value={formData.qualificationLicenseId}
                            onChange={handleChange}
                            required={needsQualification}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="एकम् अद्वितीयम् परिचयम् प्रविष्टं कुरु।"
                        />
                         <p className="mt-1 text-sm text-gray-500">इदं परिचयम् एकवारं प्रयुक्तं भविष्यति न च पुनः पञ्जीकृतं कर्तुं शक्यते।</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !isAuthReady}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isSubmitting || !isAuthReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                    {isSubmitting ? 'पञ्जीकरणं प्रचलति...' : 'पञ्जीकरणं / प्रोफाइलम् अद्यतनीकरोतु'}
                </button>
            </form>
            <MessageModal message={formMessage} onClose={() => setFormMessage('')} />
        </div>
    );
}

// उपयोगकर्ता-डैशबोर्ड-घटकः (भूमिकायाः आधारेण सरलीकृत-दृश्यम्)।
function UserDashboard({ userData, onLogout }) {
    const { auth } = useAuth(); // निर्गमनाय प्रमाणीकरण-अवस्थां प्राप्नुहि।
    const [usersList, setUsersList] = useState([]); // प्रशासक/दल-कृते सर्वेषां उपयोक्तृणां सूचीं धारयितुं स्थितिः।

    // यदि वर्तमान-उपयोक्तुः "प्रशासक-तुल्या" भूमिका अस्ति तर्हि सर्वान् उपयोगकर्तान् प्राप्तुं प्रभावः।
    useEffect(() => {
        if (userData && (userData.role === 'owner' || userData.role === 'accountant' || userData.role === 'arbitrator')) {
            FirestoreService.getAllUsers().then(setUsersList);
        }
    }, [userData]); // यदि userData परिवर्तते तर्हि पुनः प्रचालयतु।

    // उपयोगकर्ता-निर्गमनं प्रबन्धयति।
    const handleLogout = async () => {
        try {
            await auth.signOut(); // 'auth.signOut' इति compat SDK तः उपयुज्यताम्।
            if (onLogout) onLogout(); // दृश्यं पुनः सेट कर्तुं मूलस्य कॉलबैक करो।
        } catch (error) {
            console.error("निर्गमने त्रुटिः:", error);
        }
    };

    // यदि उपयोगकर्ता-दत्तांशं अधुना उपलब्धं नास्ति तर्हि भारण-स्थितिं दर्शयतु।
    if (!userData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl text-gray-600">उपयोगकर्ता-दत्तांशं भारयति वा पञ्जीकृतं नास्ति...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">स्वागतम्, {userData.email}!</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    >
                        निर्गच्छतु
                    </button>
                </div>
                <p className="text-lg text-gray-700 mb-2">भवतः भूमिका: <span className="font-semibold text-blue-700">{userData.role}</span></p>
                <p className="text-lg text-gray-700 mb-2">भवतः उपयोगकर्ता परिचय: <span className="font-mono text-sm break-all bg-gray-100 p-1 rounded-md">{userData.userId}</span></p>
                <p className="text-lg text-gray-700 mb-2">व्हाट्सएप: {userData.whatsapp}</p>
                <p className="text-lg text-gray-700 mb-4">पञ्जीकरण-संख्या (जीएसटी/वैट/विक्रय-कर): {userData.registrationNo}</p>

                {userData.qualificationLicenseId && (
                    <p className="text-lg text-gray-700 mb-4">योग्यता/लाइसेंस परिचय: <span className="font-semibold text-green-700">{userData.qualificationLicenseId}</span></p>
                )}

                <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">भवतः नियन्त्रण-पटलम् (मूलभूतम्)</h3>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    {/* भूमिका-विशिष्ट-सामग्री-कृते प्लेसहोल्डर */}
                    {userData.role === 'owner' && (
                        <div>
                            <p className="text-blue-800 font-medium text-lg">स्वामी-रूपेण, भवता सिस्टमस्य पूर्णं नियन्त्रणं वर्तते।</p>
                            <p className="text-gray-600 mt-2">
                                भविष्यस्य वैशिष्ट्यानि अत्र: दलस्य सदस्यनियुक्तिः, समग्र-प्रणाली-सेटिंग्स-प्रबन्धनम्, सर्वेषां व्यवहारान् समस्यां च पश्यतु।
                            </p>
                        </div>
                    )}
                    {userData.role === 'accountant' && (
                        <div>
                            <p className="text-green-800 font-medium text-lg">लेखाकारस्य दृश्यम्: वित्तीय-व्यवहारान् प्रबन्धयतु।</p>
                            <p className="text-gray-600 mt-2">
                                भविष्यस्य वैशिष्ट्यानि अत्र: बिलान् पश्यतु अनुमन्यतां च, भुगतानं प्रबन्धयतु, वित्तीय-अहवालान् जनयतु।
                            </p>
                        </div>
                    )}
                    {userData.role === 'arbitrator' && (
                        <div>
                            <p className="text-purple-800 font-medium text-lg">मध्यस्थस्य दृश्यम्: विवादान् निवारयतु।</p>
                            <p className="text-gray-600 mt-2">
                                भविष्यस्य वैशिष्ट्यानि अत्र: प्रस्तुतान् समस्यान् समीक्षयतु, पक्षयोः मध्ये मध्यस्थतां कुरु, समाधानं निर्गच्छतु।
                            </p>
                        </div>
                    )}
                    {['surveyor', 'transporter', 'logistics', 'customHandlingAgent', 'insuranceAgent'].includes(userData.role) && (
                        <div>
                            <p className="text-orange-800 font-medium text-lg">सेवा-प्रदायक-दृश्यम्: भवतः सेवाः निर्यात/आयात-संचालनार्थं महत्त्वपूर्णाः सन्ति।</p>
                            <p className="text-gray-600 mt-2">
                                भविष्यस्य वैशिष्ट्यानि अत्र: सेवा-अनुरोधान् स्वीकृतं/अस्वीकृतं कुरु, सेवा-स्थितिम् अद्यतनीकरोतु, अहवालान् प्रस्तुतं कुरु।
                            </p>
                        </div>
                    )}
                    {userData.role === 'user' && (
                        <div>
                            <p className="text-gray-800 font-medium text-lg">उपयोगकर्ता (क्रेता/विक्रेता) दृश्यम्: व्यवहारान् आरभ्यतां निरीक्ष्यतां च।</p>
                            <p className="text-gray-600 mt-2">
                                भविष्यस्य वैशिष्ट्यानि अत्र: नूतन-विक्रय/क्रय-अनुरोधान् जनयतु, प्रेषण-स्थितिं निरीक्ष्यताम्, समस्यान् उद्भावयतु।
                            </p>
                        </div>
                    )}
                </div>

                {/* विशिष्ट-भूमिकाभ्यः (स्वामी, लेखाकारः, मध्यस्थः) सर्वेषां पञ्जीकृतानां उपयोक्तृणां प्रदर्शनम्। */}
                {(userData.role === 'owner' || userData.role === 'accountant' || userData.role === 'arbitrator') && usersList.length > 0 && (
                    <div className="mt-8">
                        <h4 className="text-xl font-semibold text-gray-800 mb-3">पञ्जीकृतानां उपयोक्तृणां अवलोकनम् (प्रशासक/दल-कृते)</h4>
                        <div className="overflow-x-auto rounded-md border border-gray-300">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ईमेल</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भूमिका</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">व्हाट्सएप</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">लाइसेंस परिचय</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">उपयोगकर्ता परिचय</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {usersList.map((u) => (
                                        <tr key={u.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{u.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.whatsapp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.qualificationLicenseId || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs break-all">{u.userId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// MainContent घटकः: सक्रियं दृश्यं (पञ्जीकरणं वा डैशबोर्डं वा) प्रबन्धयति।
function MainContent() {
    const { user, loading, isAuthReady } = useAuth(); // सन्दर्भात् प्रमाणीकरण-स्थितिम् एक्सेस करो।
    const [userData, setUserData] = useState(null); // वर्तमान-उपयोक्तुः प्रोफाइल-दत्तांशं धारयितुं स्थितिः।
    const [activeView, setActiveView] = useState('registration'); // कः घटकः रेंडर कृतः इति नियन्त्रयति।

    // प्रमाणीकरणं उपयोगकर्ता-दत्तांशं च आधृत्य कं दृश्यं दर्शयितव्यम् इति निर्धारयितुं प्रभावः।
    useEffect(() => {
        // प्रमाणीकरण-स्थितिः पूर्णतया सिद्धा सति एव अग्रे गच्छतु।
        if (isAuthReady) {
            if (user) {
                // यदि उपयोगकर्ताः प्रमाणीकृतः अस्ति, तर्हि तस्य प्रोफाइल-दत्तांशं प्राप्तुं प्रयास करो।
                FirestoreService.getUser(user.uid).then(data => {
                    if (data) {
                        setUserData({ ...data, userId: user.uid }); // उपयोगकर्ता-दत्तांशं सेट करो, userId च उपलब्धम् अस्ति इति सुनिश्चितं करो।
                        setActiveView('dashboard'); // यदि प्रोफाइलः विद्यते तर्हि डैशबोर्डं दर्शयतु।
                    } else {
                        setActiveView('registration'); // अन्यथा, उपयोगकर्तां पञ्जीकरणाय प्रेरितं करो।
                    }
                });
            } else {
                // यदि कोऽपि उपयोगकर्ताः प्रमाणीकृतः नास्ति (उदा: अनामिक-साइन-इन विफलः वा निर्गतः वा), तर्हि पञ्जीकरणं दर्शयतु।
                setActiveView('registration');
                setUserData(null); // यदि कोऽपि उपयोगकर्ताः प्रमाणीकृतः नास्ति तर्हि उपयोगकर्ता-दत्तांशं शुद्धयतु।
            }
        }
    }, [user, isAuthReady]); // यदि 'user' वा 'isAuthReady' परिवर्तते तर्हि एषः प्रभावः पुनः प्रचालयतु।

    // सफल-उपयोगकर्ता-पञ्जीकरणानन्तरं कॉलबैक-कार्यम्।
    const handleRegistrationSuccess = (registeredData) => {
        setUserData({ ...registeredData, userId: user.uid }); // नूतन-पञ्जीकृत-सूचनाभिः उपयोगकर्ता-दत्तांशम् अद्यतनीकरोतु।
        setActiveView('dashboard'); // डैशबोर्ड-दृश्ये परिवर्तयतु।
    };

    // उपयोगकर्ता-निर्गमनस्य अनन्तरं कॉलबैक-कार्यम्।
    const handleLogout = () => {
        setUserData(null); // उपयोगकर्ता-दत्तांशं शुद्धयतु।
        setActiveView('registration'); // पञ्जीकरण-दृश्ये पुनः परिवर्तयतु।
    };

    // Firebase-प्रमाणीकरणं सिद्धं यावत् भारण-स्पिनरं दर्शयतु।
    if (loading || !isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl text-gray-600">एप्लिकेशनं भारयति...</p>
                </div>
            </div>
        );
    }

    // सक्रिय-दृश्य-स्थितेः आधारेण पञ्जीकरण-पत्रकं वा उपयोगकर्ता-डैशबोर्डं वा रेंडर करो।
    return (
        <div className="flex-grow">
            {activeView === 'registration' && <RegistrationForm onRegisterSuccess={handleRegistrationSuccess} />}
            {activeView === 'dashboard' && userData && <UserDashboard userData={userData} onLogout={handleLogout} />}
        </div>
    );
}

// App घटकः: मूल-घटकः यः AuthProvider-ं सेट करोति MainContent-ं च रेंडर करोति।
function App() {
    return (
        <AuthProvider> {/* AuthProvider स्वस्य सर्वेभ्यः बालेभ्यः प्रमाणीकरण-सन्दर्भं उपलब्धं करोति। */}
            <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen flex flex-col">
                {/* अत्र साक्षात् <style> टैगः नास्ति, यतः सः index.html वा बाह्य-CSS मध्ये नियंत्रितः अस्ति। */}
                <MainContent /> {/* MainContent दृश्यान् प्रबन्धयति प्रमाणीकरण-सन्दर्भं च उपयुज्यताम्। */}
            </div>
        </AuthProvider>
    );
}

// संपूर्णं React एप्लिकेशनं index.html मध्ये 'root' div मध्ये रेंडर करो।
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App)); // Babel-ं विना JSX-सिंटैक्स-समस्याभ्यः रक्षितुं React.createElement-म् उपयुज्यताम्।
