const imagekit = require('../libs/imagekit');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = {
    singleUpload: (req, res) => {
        let folder = req.file.destination.split('public/')[1];
        const fileUrl = `${req.protocol}://${req.get('host')}/${folder}/${req.file.filename}`;

        return res.json({
            status: true,
            message: 'OK',
            error: null,
            data: { file_url: fileUrl }
        });
    },

    multiUpload: (req, res) => {
        let fileUrls = [];
        req.files.forEach(file => {
            let folder = file.destination.split('public/')[1];
            const fileUrl = `${req.protocol}://${req.get('host')}/${folder}/${file.filename}`;
            fileUrls.push(fileUrl);
        });

        return res.json({
            status: true,
            message: 'OK',
            error: null,
            data: { file_urls: fileUrls }
        });
    },

    imagekit: async (req, res, next) => {
      try {
          // Pastikan req.file telah didefinisikan dan merupakan berkas yang benar
          if (!req.file || !req.file.buffer || !req.file.originalname) {
              return res.status(400).json({
                  status: false,
                  message: 'Bad Request',
                  error: 'Invalid file upload',
                  data: null,
              });
          }
  
          // Ambil nama berkas dan konversi data berkas menjadi base64
          const fileName = req.file.originalname;
          const fileData = req.file.buffer.toString('base64');
  
          // Upload berkas ke ImageKit
          const { url } = await imagekit.upload({
              fileName,
              file: Buffer.from(fileData, 'base64'),
          });
  
          // Dapatkan first_name dan last_name dari permintaan jika diperlukan
          const { first_name, last_name } = req.body;
  
          return res.json({
              status: true,
              message: 'OK',
              error: null,
              data: { file_url: url, first_name, last_name },
          });
      } catch (err) {
          next(err);
      }
  },
    
  updateProfile: imageStorage.single('profile_picture'), // Gunakan imageStorage dari multer
  async handleUpdateProfile(req, res, next) {
    try {
      // Dapatkan data dari request
      const { first_name, last_name, birth_date } = req.body;
      const profile_picture = req.file.buffer.toString('base64'); // Ambil file gambar yang diunggah dan ubah ke base64

      // Lakukan pembaruan profil pengguna di tabel UserProfile
      const updatedUserProfile = await prisma.userProfile.update({
        where: { userId: req.user.id }, // Menentukan profil yang sesuai dengan userId
        data: { first_name, last_name, birth_date, profile_picture },
      });

      // Respon dengan hasil pembaruan profil
      res.status(200).json({
        status: true,
        message: 'Profile updated successfully',
        error: null,
        data: updatedUserProfile,
      });
    } catch (err) {
      next(err);
    }
  }
};