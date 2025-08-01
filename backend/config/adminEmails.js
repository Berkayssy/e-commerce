// Admin email listesi - bu email adresleri otomatik olarak admin olarak atanır
const adminEmails = [
    'admin@galeria.com',
    'berkay@galeria.com',
    'berkayaksu@gmail.com',
    'admin@gmail.com',
    'berkay@example.com', // Test için ek email
    'test@admin.com' // Test için ek email
];

// Email'in admin olup olmadığını kontrol eden fonksiyon
const isAdminEmail = (email) => {
    return adminEmails.includes(email.toLowerCase());
};

module.exports = {
    adminEmails,
    isAdminEmail
}; 