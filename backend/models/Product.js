const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        default: "Generic"
    },
    images: [String],
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: false // backward compatible
    }
},{timestamps: true});

module.exports = mongoose.model("Product", productSchema);

// NOT: Aşağıdaki script sadece örnek amaçlıdır, gerçek migration için ayrı bir dosyada çalıştırılmalıdır.
// const mongoose = require('mongoose');
// const Product = require('./Product');
// const Community = require('./Community');
// (async () => {
//   await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME');
//   const berkayCommunity = await Community.findOne({ name: 'berkay comunıty' });
//   if (berkayCommunity) {
//     await Product.updateMany({}, { communityId: berkayCommunity._id });
//     console.log('Tüm ürünler berkay comunıty topluluğuna atandı.');
//   } else {
//     console.log('berkay comunıty bulunamadı.');
//   }
//   mongoose.disconnect();
// })();