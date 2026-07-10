const bcrypt = require('bcryptjs');
const hash = '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm';
const pwds = ['admin', 'admin123', 'Admin123!', 'password', '1019181716'];
pwds.forEach(p => console.log(p, bcrypt.compareSync(p, hash)));
