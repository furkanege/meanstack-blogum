const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => { 
  router.post('/register', (req, res) => {
    if (!req.body.email) {
      res.json({ success: false, message: 'Bir e-posta girmelisiniz' });
    } else {
      if (!req.body.username) {
        res.json({ success: false, message: 'Bir kullanıcı adı girmelisiniz' });
      } else {
        if (!req.body.password) {
          res.json({ success: false, message: 'Bir şifre girmelisiniz' }); 
        } else {
          let user = new User({
            email: req.body.email.toLowerCase(),
            username: req.body.username.toLowerCase(),
            password: req.body.password
          });
          user.save((err) => {
            if (err) {
              if (err.code === 11000) {
                res.json({ success: false, message: 'Kullanıcı adı veya e-posta zaten var' });
              } else {
                if (err.errors) {
                  if (err.errors.email) {
                    res.json({ success: false, message: err.errors.email.message });
                  } else {
                    if (err.errors.username) {
                      res.json({ success: false, message: err.errors.username.message });
                    } else {
                      if (err.errors.password) {
                        res.json({ success: false, message: err.errors.password.message });
                      } else {
                        res.json({ success: false, message: err });
                      }
                    }
                  }
                } else {
                  res.json({ success: false, message: 'Kullanıcı kaydedilemedi. Hata:', err });
                }
              }
            } else {
              res.json({ success: true, message: 'Kayıt kaydedildi!' });
            }
          });
        }
      }
    }
  });

  router.get('/checkEmail/:email', (req, res) => {
    if (!req.params.email) {
      res.json({ success: false, message: 'E-posta verilmedi' });
    } else {
      User.findOne({ email: req.params.email }, (err, user) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (user) {
            res.json({ success: false, message: 'E-posta zaten alınmış' });
          } else {
            res.json({ success: true, message: 'E-posta kullanılabilir.' });
          }
        }
      });
    }
  });

  router.get('/checkUsername/:username', (req, res) => {
    if (!req.params.username) {
      res.json({ success: false, message: 'Kullanıcı adı girilmedi' });
    } else {
      User.findOne({ username: req.params.username }, (err, user) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (user) {
            res.json({ success: false, message: 'Kullanıcı adı zaten alınmış' });
          } else {
            res.json({ success: true, message: 'Kullanıcı adı kullanılabilir' });
          }
        }
      });
    }
  });

  router.post('/login', (req, res) => {
    if (!req.body.username) {
      res.json({ success: false, message: 'Kullanıcı adı girilmedi' });
    } else {
      if (!req.body.password) {
        res.json({ success: false, message: 'Şifre verilmedi.' });
      } else {
        User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            if (!user) {
              res.json({ success: false, message: 'Kullanıcı adı bulunamadı.' });
            } else {
              const validPassword = user.comparePassword(req.body.password);
              if (!validPassword) {
                res.json({ success: false, message: 'Şifre geçersiz' });
              } else {
                const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' });
                res.json({
                  success: true,
                  message: 'Başarılı!',
                  token: token,
                  user: {
                    username: user.username
                  }
                });
              }
            }
          }
        });
      }
    }
  });


  router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      res.json({ success: false, message: 'Mail sağlanmadı' }); 
    } else {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          res.json({ success: false, message: 'Mail geçersiz: ' + err });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    }
  });

  router.get('/profile', (req, res) => {
    User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!user) {
          res.json({ success: false, message: 'Kullanıcı bulunamadı' });
        } else {
          res.json({ success: true, user: user });
        }
      }
    });
  });

  router.get('/publicProfile/:username', (req, res) => {
    if (!req.params.username) {
      res.json({ success: false, message: 'Kullanıcı adı girilmedi' });
    } else {
      User.findOne({ username: req.params.username }).select('username email').exec((err, user) => {
        if (err) {
          res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
        } else {
          if (!user) {
            res.json({ success: false, message: 'Kullanıcı adı bulunamadı.' });
          } else {
            res.json({ success: true, user: user });
          }
        }
      });
    }
  });

  return router;
}