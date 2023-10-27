const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
        await prisma.$connect();

        let { email, password, password_confirmation, profile } = req.body;

        if (password != password_confirmation) {
            return res.status(400).json({
                status: false,
                message: 'Bad Request',
                err: 'please ensure that the password and password confirmation match!',
                data: null,
            });
        }

        let userExist = await prisma.user.findUnique({ where: { email: req.body.email } });

        if (userExist) {
            return res.status(400).json({
                status: false,
                message: 'Bad Request',
                err: 'user has already been used!',
                data: null,
            });
        }

        let encryptedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let userProfile = await prisma.user.create({
          data: {
            email,
            password: encryptedPassword,
            profile: {
              create: profile,
            },
          }
        });

        return res.status(201).json({
            status: true,
            message: 'User and profile created successfully',
            err: null,
            data: { profile: userProfile },
        });
    } catch (err) {
        next(err);
    } finally {
        await prisma.$disconnect();
    }
},      

  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'invalid email or password!',
          data: null,
        });
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'invalid email or password!',
          data: null,
        });
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

      return res.status(200).json({
        status: true,
        message: 'OK',
        err: null,
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  },

  whoami: (req, res, next) => {
    return res.status(200).json({
      status: true,
      message: 'OK',
      err: null,
      data: { user: req.user },
    });
  },

  authenticateUser: async (req, res, next) => {
    try {
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({
          status: false,
          message: 'Autentikasi gagal',
          data: null,
        });
      }
  
      // Verifikasi token JWT
      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: false,
            message: 'Autentikasi gagal',
            data: null,
          });
        }
  
        try {
          // Di sini, Anda ingin menggunakan Prisma atau alat lain untuk
          // mengambil data lengkap pengguna dari database berdasarkan ID pengguna
          // yang ada di dalam token JWT. Misalnya, dengan menggunakan Prisma:
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { profile: true }, // Memastikan untuk menyertakan profil pengguna
          });
  
          if (user) {
            return res.status(200).json({
              first_name: user.profile.first_name || '',
              last_name: user.profile.last_name || '',
              email: user.email || '',
              birth_date: user.profile.birth_date || '',
              profile_picture: user.profile.profile_picture || '',
            });
          } else {
            return res.status(401).json({
              status: false,
              message: 'Autentikasi gagal',
              data: null,
            });
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      next(err);
    }
  }  
};
