const mongoose = require('mongoose');
const cron = require('node-cron');
const Community = require('./models/Community');
const Subscription = require('./models/Subscription');
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
        // Süresi bitmiş aktif abonelikleri bul
        const expiredSubs = await Subscription.find({ endDate: { $lt: now }, isActive: true });
        for (const sub of expiredSubs) {
            // Mağazayı (Community) bul
            const store = await Community.findById(sub.store);
            if (store) {
                // Mağazayı görünmez yap
                store.visible = false;
                await store.save();
                // Aboneliği pasif yap
                sub.isActive = false;
                await sub.save();
                // Bildirim oluştur
                await Notification.create({
                    user: sub.user,
                    store: store._id,
                    type: 'plan',
                    message: 'Plan süreniz doldu. Mağazanız artık görünmez durumda.',
                    email: (await User.findById(sub.user)).email
                });
            }
        }
    } catch (err) {
        console.error('Cron: Hata:', err);
    }
}); 