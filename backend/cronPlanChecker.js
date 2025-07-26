const mongoose = require('mongoose');
const cron = require('node-cron');
const Seller = require('./models/Seller');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

// DB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { })
    .catch(err => { console.error('Cron: MongoDB connection error', err); process.exit(1); });

// Her gün 00:00'da çalışacak cron job
cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    try {
        // Süresi bitmiş aktif seller'ları bul
        const expiredSellers = await Seller.find({ 
            planEndDate: { $lt: now }, 
            isActive: true,
            status: { $in: ['active', 'pending'] }
        });

        for (const seller of expiredSellers) {
            // Seller'ı pasif yap
            seller.isActive = false;
            seller.status = 'expired';
            await seller.save();

            // Mağazayı (Community) bul ve görünmez yap
            if (seller.storeId) {
                const store = await mongoose.model('Community').findById(seller.storeId);
                if (store) {
                    store.visible = false;
                    await store.save();
                }
            }

            // Bildirim oluştur
            const user = await User.findById(seller.userId);
            if (user && seller.emailNotifications) {
                await Notification.create({
                    user: seller.userId,
                    store: seller.storeId,
                    type: 'plan_expired',
                    message: `Dear ${seller.name}, your plan has expired. Your store is now hidden. Please renew your plan to continue selling.`,
                    email: user.email
                });
            }
        }

        // Plan bitişine 7 gün kala uyarı gönder
        const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        const sellersExpiringSoon = await Seller.find({
            planEndDate: { 
                $gte: now, 
                $lte: sevenDaysFromNow 
            },
            isActive: true,
            status: 'active',
            planReminders: true
        });

        for (const seller of sellersExpiringSoon) {
            const user = await User.findById(seller.userId);
            if (user && seller.emailNotifications) {
                const daysLeft = Math.ceil((seller.planEndDate - now) / (1000 * 60 * 60 * 24));
                
                await Notification.create({
                    user: seller.userId,
                    store: seller.storeId,
                    type: 'plan_reminder',
                    message: `Dear ${seller.name}, your plan expires in ${daysLeft} days. Please renew to avoid service interruption.`,
                    email: user.email
                });
            }
        }

    } catch (err) {
        console.error('Cron: Hata:', err);
    }
}); 