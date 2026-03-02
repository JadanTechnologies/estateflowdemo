// Bilingual Translation System - English and Hausa

export type Language = 'en' | 'ha';

export const translations = {
    en: {
        // General
        companyName: 'Company Name',
        address: 'Address',
        phone: 'Phone',
        date: 'Date',
        
        // Tenancy Agreement
        tenancyAgreement: 'Tenancy Agreement',
        thisAgreement: 'This agreement is made on',
        between: 'between',
        landlord: 'Landlord',
        tenant: 'Tenant',
        property: 'Property',
        rentAmount: 'Rent Amount',
        perAnnum: 'per annum',
        leaseTerm: 'Lease Term',
        from: 'From',
        to: 'To',
        
        // Terms
        termsAndConditions: 'Terms and Conditions',
        tenantObligations: 'Tenant Obligations',
        landlordObligations: 'Landlord Obligations',
        termination: 'Termination',
        disputes: 'Dispute Resolution',
        
        // Specific clauses
        clause1: 'The Tenant agrees to pay rent on or before the due date specified in this agreement.',
        clause2: 'The Tenant shall keep the property in good condition and report any damages immediately.',
        clause3: 'The Landlord reserves the right to inspect the property with at least 24 hours prior notice.',
        clause4: 'Subletting is not permitted without written consent from the Landlord.',
        clause5: 'Use of the property for illegal activities is strictly prohibited and grounds for immediate eviction.',
        clause6: 'The Tenant shall be responsible for payment of all utility bills including electricity, water, and waste disposal.',
        clause7: 'A security deposit is required and will be refunded at the end of the tenancy period, less any deductions for damages.',
        clause8: 'The Tenant agrees to comply with all rules and regulations of the estate or building where the property is located.',
        clause9: 'Either party may terminate this agreement with written notice of not less than one (1) month before the expiry of the lease term.',
        clause10: 'The Landlord shall maintain the structural integrity of the property and ensure all fixtures are in working condition.',
        clause11: 'Any dispute arising from this agreement shall be resolved through arbitration in accordance with the laws of Nigeria.',
        clause12: 'This agreement constitutes the entire understanding between the parties and supersedes all prior negotiations.',
        
        // Signatures
        tenantSignature: 'Tenant Signature',
        landlordSignature: 'Landlord/Management Signature',
        signedBy: 'Signed by',
        awaitingSignature: 'Awaiting Signature',
        
        // Receipt
        paymentReceipt: 'Payment Receipt',
        receiptNo: 'Receipt No',
        tenantName: 'Tenant',
        agent: 'Agent',
        description: 'Description',
        amount: 'Amount',
        total: 'TOTAL',
        thankYou: 'Thank you for your payment!',
        
        // Notifications
        rentReminder: 'Rent Reminder',
        rentDueIn: 'Rent is due in',
        days: 'days',
        overdue: 'Overdue',
        leaseExpiry: 'Lease Expiry',
        expiresIn: 'expires in',
    },
    ha: {
        // General
        companyName: 'Sunan Kamfani',
        address: 'Adireshi',
        phone: 'Lambar',
        date: 'Kwanar ranar',
        
        // Tenancy Agreement
        tenancyAgreement: 'Yarjejeniyar Giyarwa',
        thisAgreement: 'An aiwatar da wannan yarjejeniya a',
        between: 'tsakanin',
        landlord: 'Mai gida',
        tenant: 'Mawallafi',
        property: 'Gida',
        rentAmount: 'Kudin Giyarwa',
        perAnnum: 'kowace shekara',
        leaseTerm: 'Locacin Giyarwa',
        from: 'Daga',
        to: 'Zuwa',
        
        // Terms
        termsAndConditions: 'Sharudda da Yanayin',
        tenantObligations: 'Ayyukan Mawallafi',
        landlordObligations: 'Ayyukan Mai Gida',
        termination: 'Karewa',
        disputes: 'Magance Rikici',
        
        // Specific clauses
        clause1: 'Mawallafi ya yarda ya biya kudin giyarwa a kwanar da aka saita a wannan yarjejeniya.',
        clause2: 'Mawallafi zai kula da gidanshi da kyau kuma ya ba da rahoton duk wani lalata nan da nan.',
        clause3: 'Mai gida ya reserved hakkin bincika gidanshi bayan an ba da sanarwar awa 24 kafin haka.',
        clause4: 'Ba a yarda a ba da kwangilan giyarwa ba tare da rubuta izini daga Mai gida ba.',
        clause5: 'Amfani da gidan don ayyukan illegal an himmatu hana kuma zai zame dalilin ficewa nan take.',
        clause6: 'Mawallafi zai dauki alhakin biyan duk kudin ayyukan gida da ruwan sha da fagen shara.',
        clause7: 'Ajiye na tsaro ake bukata kuma za a mayar da shi a ƙarshen lokacin giyarwa, ban da ragowar don lalata.',
        clause8: 'Mawallafi ya yarda ya biyo duk ƙa\'idodin gida ko ginin inda gidan yake.',
        clause9: 'Ko wanne bangare na iya ƙare wannan yarjejeniya da rubutaccen sanarwa ba ƙasa da wata (1) kafin ƙarewar lokacin gyara.',
        clause10: 'Mai gida zai kula da tsarin ginin gida da tabbatar da duk ayyukan aiki.',
        clause11: 'Duk wani rikici da ya taso daga wannan yarjejeniya za a warware ta ta arbitration bisa ga dokar Najeriya.',
        clause12: 'Wannan yarjejeniya ta kunsa duk fahimtar tsakanin bangarorin kuma ta maye gurbin duk tattaunawar da ta gabata.',
        
        // Signatures
        tenantSignature: 'Alamar Mawallafi',
        landlordSignature: 'Alamar Mai Gida',
        signedBy: 'An sanya wa hannu',
        awaitingSignature: 'Ana jiran sanya hannu',
        
        // Receipt
        paymentReceipt: 'Takardar Biyan Kudi',
        receiptNo: 'Lambobin Takardar',
        tenantName: 'Mawallafi',
        agent: 'Agent',
        description: 'Bayani',
        amount: 'Adadi',
        total: 'JIMLAR',
        thankYou: 'Muna godiya da biyan kudin ku!',
        
        // Notifications
        rentReminder: 'Tambayar Kudin Giyarwa',
        rentDueIn: 'Kudin giyarwa ya kai',
        days: 'kwanaki',
        overdue: 'Ma\'aikaci',
        leaseExpiry: 'Ƙarewar Locacin Giyarwa',
        expiresIn: 'zai ƙare a',
    }
};

export const t = (key: string, lang: Language): string => {
    const langData = translations[lang] as Record<string, string>;
    return langData[key] || translations.en[key] || key;
};
