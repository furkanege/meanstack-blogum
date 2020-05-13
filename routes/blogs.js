const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {


  router.post('/newBlog', (req, res) => {
    if (!req.body.title) {
      res.json({ success: false, message: 'Blog başlığı gerekli.' });
    } else {
      if (!req.body.body) {
        res.json({ success: false, message: 'Blog içeriği gerekli' });
      } else {
        if (!req.body.createdBy) {
          res.json({ success: false, message: 'Blog sahibi gerekli.' });
        } else {
          const blog = new Blog({
            title: req.body.title,
            body: req.body.body,
            createdBy: req.body.createdBy
          });
          blog.save((err) => {
            if (err) {
              if (err.errors) {
                if (err.errors.title) {
                  res.json({ success: false, message: err.errors.title.message });
                } else {
                  if (err.errors.body) {
                    res.json({ success: false, message: err.errors.body.message });
                  } else {
                    res.json({ success: false, message: err });
                  }
                }
              } else {
                res.json({ success: false, message: err });
              }
            } else {
              res.json({ success: true, message: 'Blog kaydedildi' });
            }
          });
        }
      }
    }
  });

  router.get('/allBlogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!blogs) {
          res.json({ success: false, message: 'Blog bulunamadı' });
        } else {
          res.json({ success: true, blogs: blogs });
        }
      }
    }).sort({ '_id': -1 });
  });


  router.get('/singleBlog/:id', (req, res) => {
    if (!req.params.id) {
      res.json({ success: false, message: 'Hiçbir blog IDsi belirtilmedi.' });
    } else {
      Blog.findOne({ _id: req.params.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Blog idsi belirtilmedi' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'Blog bulunamadı' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: err });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Kullanıcının kimliği doğrulanamıyor' });
                } else {
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'Bu blogu düzenleme yetkiniz yok.' });
                  } else {
                    res.json({ success: true, blog: blog });
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/updateBlog', (req, res) => {
    if (!req.body._id) {
      res.json({ success: false, message: 'Blog idsi sağlanamadı' });
    } else {
      Blog.findOne({ _id: req.body._id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Geçersiz bir blog idsi' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'Blog idsi bulunamadı' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: err });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Kullanıcının kimliği doğrulanamıyor.' });
                } else {
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'Bu blog gönderisini düzenleme yetkiniz yok.' });
                  } else {
                    blog.title = req.body.title;
                    blog.body = req.body.body;
                    blog.save((err) => {
                      if (err) {
                        if (err.errors) {
                          res.json({ success: false, message: 'Lütfen formun doğru şekilde doldurulduğundan emin olun' });
                        } else {
                          res.json({ success: false, message: err });
                        }
                      } else {
                        res.json({ success: true, message: 'Blog Güncellendi!' });
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
      res.json({ success: false, message: 'ID sağlanmadı' });
    } else {
      Blog.findOne({ _id: req.params.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Geçersiz ID' });
        } else {
          if (!blog) {
            res.json({ success: false, messasge: 'Blog bulunamadı' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: err });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Kullanıcının kimliği doğrulanamıyor. ' });
                } else {
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'Bu blog gönderisini silme yetkiniz yok' });
                  } else {
                    blog.remove((err) => {
                      if (err) {
                        res.json({ success: false, message: err });
                      } else {
                        res.json({ success: true, message: 'Blog silindi!' });
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/likeBlog', (req, res) => {
    if (!req.body.id) {
      res.json({ success: false, message: 'id sağlanamadı' });
    } else {
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Geçersiz blog idsi' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'Bu blog bulunamadı.' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Kullanıcının kimliği doğrulanamadı.' });
                } else {
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, messagse: 'Kendi yazınızı beğenemezsiniz.' });
                  } else {
                    if (blog.likedBy.includes(user.username)) {
                      res.json({ success: false, message: 'Bu gönderiyi zaten beğendin.' });
                    } else {
                      if (blog.dislikedBy.includes(user.username)) {
                        blog.dislikes--;
                        const arrayIndex = blog.dislikedBy.indexOf(user.username);
                        blog.dislikedBy.splice(arrayIndex, 1);
                        blog.likes++;
                        blog.likedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
                          } else {
                            res.json({ success: true, message: 'Blog beğendi!' });
                          }
                        });
                      } else {
                        blog.likes++;
                        blog.likedBy.push(user.username);
                        // Save blog post
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
                          } else {
                            res.json({ success: true, message: 'Blog beğendi!' });
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/dislikeBlog', (req, res) => {
    if (!req.body.id) {
      res.json({ success: false, message: 'id sağlanmadı.' });
    } else {
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Geçersiz blog idsi' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'Bu blog bulunamadı.' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: 'Bir şeyler yanlış gitti' }); 
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Kullanıcının kimliği doğrulanamadı.' }); 
                } else {
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, messagse: 'Kendi yayınınızı beğenemezsiniz.' });
                  } else {
                    if (blog.dislikedBy.includes(user.username)) {
                      res.json({ success: false, message: 'Bu gönderiyi zaten beğenmediniz.' });
                    } else {
                      if (blog.likedBy.includes(user.username)) {
                        blog.likes--;
                        const arrayIndex = blog.likedBy.indexOf(user.username);
                        blog.likedBy.splice(arrayIndex, 1);
                        blog.dislikes++;
                        blog.dislikedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Bir şeyler yanlış gitti' }); 
                          } else {
                            res.json({ success: true, message: 'Blog dislikelandı' });
                          }
                        });
                      } else {
                        blog.dislikes++;
                        blog.dislikedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Bir şeyler yanlış gitti.' }); 
                          } else {
                            res.json({ success: true, message: 'Blog dislikelandı' });
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.post('/comment', (req, res) => {
    if (!req.body.comment) {
      res.json({ success: false, message: 'Yorum yok' });
    } else {
      if (!req.body.id) {
        res.json({ success: false, message: 'id sağlanamadı' });
      } else {
        Blog.findOne({ _id: req.body.id }, (err, blog) => {
          if (err) {
            res.json({ success: false, message: 'Geçersiz blog idsi' });
          } else {
            if (!blog) {
              res.json({ success: false, message: 'Blog bulunamadı.' });
            } else {
              User.findOne({ _id: req.decoded.userId }, (err, user) => {
                if (err) {
                  res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
                } else {
                  if (!user) {
                    res.json({ success: false, message: 'Kullanıcı bulunamadı' });
                  } else {
                    blog.comments.push({
                      comment: req.body.comment,
                      commentator: user.username
                    });
                    blog.save((err) => {
                      if (err) {
                        res.json({ success: false, message: 'Bir şeyler yanlış gitti.' });
                      } else {
                        res.json({ success: true, message: 'Yorum kaydedildi' });
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });

  return router;
};