const { prisma } = require('../config/db');

exports.findUserById = async (id, select = null) => {
  return await prisma.user.findUnique({
    where: { id },
    ...(select ? { select } : {})
  });
};

exports.findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};
